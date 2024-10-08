import {
  Logger,
  OnModuleInit,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  VideoPlayingChangeEvent,
  VideoUpdateEvent,
  VideoUrlChangeEvent,
} from './events/video.event';

import { Server, Socket } from 'socket.io';
import { ChatMessageEvent } from './events/chat-message.event';

import { ConfigService } from '@nestjs/config';
import { RoomService } from './room.service';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { authMiddleware } from './middleware/auth.ws.middleware';
import { v4 } from 'uuid';
import { TransformInterceptor } from './interceptor/transform.ws.interceptor';
import { IsHostGuard } from './room.ws.guard';
import { cookieParserMiddleware } from './middleware/cookie-parser.ws.middleware';
import { RoomHostTargetsEvent } from './events/host-change';
import { YoutubeService } from 'src/youtube/youtube.service';
import { RedisService } from 'src/redis/redis.service';

@WebSocketGateway()
export class RoomGateway implements OnModuleInit {
  @WebSocketServer()
  private server: Server;
  private _logger = new Logger();

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly roomService: RoomService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly youtubeService: YoutubeService,
  ) {}

  async onModuleInit() {
    const redis = this.redisService.getClient();

    this.server.use(
      cookieParserMiddleware(this.configService.get<string>('COOKIES_SECRET')),
    );
    this.server.use(
      authMiddleware(
        this.authService,
        this.userService,
        this.roomService,
        this.redisService.getClient(),
      ),
    );

    this.server.on('connection', async (socket: Socket) => {
      const querySessionId = socket.handshake.query?.sessionId as string;
      const roomId = socket.handshake.query.roomId as string;

      const user = {
        id: socket.data.user.id,
        name: socket.data.user.name,
      };

      const sessionId = querySessionId || v4();
      const existingSocketId = await redis.get(user.id);

      this._logger.debug(
        `client: ${user.name} connected with sessionId: ${sessionId}`,
        `at: ${new Date()}`,
        'onSocketConnection',
      );
      if (existingSocketId) {
        this._logger.debug(
          `Client was previously connected with socketId: ${existingSocketId}`,
          'onSocketConnection',
        );
        const oldSocket = this.server.sockets.sockets.get(existingSocketId);
        if (oldSocket) {
          this._logger.debug(
            `Disconnecting previous client: ${existingSocketId}`,
            'onSocketConnection',
          );
          oldSocket.disconnect();
        }
      }
      await redis.set(user.id, socket.id);

      socket.data.roomAt = roomId;
      socket.data.sessionId = sessionId;

      socket.join(roomId);
      socket.emit('session', { sessionId });

      const connectedUsers = (await this.server.in(roomId).fetchSockets()).map(
        ({ data }) => ({ id: data.user.id, name: data.user.name }),
      );
      socket.emit('room:users', connectedUsers);
      socket.broadcast.to(roomId).emit('room:user-joined', user);

      socket.on('disconnect', async (reason: string) => {
        socket.broadcast.to(roomId).emit('room:user-left', user);
        await redis.del(sessionId);
        this.roomService.leaveRoom(roomId, user.id).catch(() => {});
        if (!existingSocketId)
          this._logger.debug(
            `Client disconnected with sessionId: ${sessionId}`,
            'onSocketConnection',
          );
      });

    });
  }

  @UseInterceptors(TransformInterceptor)
  @UseGuards(IsHostGuard)
  @SubscribeMessage('room:video-update')
  handleRoomVideoUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: VideoUpdateEvent,
  ): void {
    this.broadcastToRoom('room:video-updated', event, client);
  }

  @UseInterceptors(TransformInterceptor)
  @UseGuards(IsHostGuard)
  @SubscribeMessage('room:video-playing-change')
  handleRoomVideoPlay(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: VideoPlayingChangeEvent,
  ): void {
    this.broadcastToRoom('room:video-playing-state', event, client);
  }

  @UseInterceptors(TransformInterceptor)
  @UseGuards(IsHostGuard)
  @SubscribeMessage('room:host-change')
  async handleRoomHostChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: RoomHostTargetsEvent,
  ) {
    const sockets = await this.server.in(client.data.roomAt).fetchSockets();
    const target = sockets.find(({ data }) => data.user.id === event.target);

    // give host to target user
    target.data.isHost = true;
    await this.roomService.changeRoomOwner(
      { owner: event.target },
      client.data.roomAt,
      client.data.user.id,
    );

    // remove host from self
    client.data.isHost = false;

    const { id, name } = target.data.user;
    this.emitToRoom(
      'room:host-changed',
      {
        id,
        name,
      },
      client,
    );
  }

  @UseInterceptors(TransformInterceptor)
  @UseGuards(IsHostGuard)
  @SubscribeMessage('room:host-kick')
  async handleRoomHostKick(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: RoomHostTargetsEvent,
  ) {
    const sockets = await this.server.in(client.data.roomAt).fetchSockets();
    const target = sockets.find(({ data }) => data.user.id === event.target);

    if (!target) return;
    const { id, name } = target.data.user;

    await this.redisService.getClient().setEx(`room:kick:${target.data.roomAt}:${id}`, 30, id);
    target.disconnect(true);

    this.emitToRoom(
      'room:user-kicked',
      {
        id,
        name,
      },
      client,
    );
  }

  @UseInterceptors(TransformInterceptor)
  @UseGuards(IsHostGuard)
  @SubscribeMessage('room:video-url-change')
  async handleRoomVideoUrlChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: VideoUrlChangeEvent,
  ) {
    const { newUrl } = event;
    const vid = await this.youtubeService.getVid(newUrl);
    const thumbnailUrl = vid.thumbnails[vid.thumbnails.length - 1]?.url || '';
    await this.roomService.editRoom(
      {
        currentVideoUrl: newUrl,
        thumbnailUrl: thumbnailUrl,
      },
      client.data.roomAt,
      client.data.user.id,
    );

    this.emitToRoom(
      'room:video-url-changed',
      {
        newUrl,
      },
      client,
    );
  }

  @UseInterceptors(TransformInterceptor)
  @SubscribeMessage('room:message')
  handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: ChatMessageEvent,
  ): void {
    this.emitToRoom(
      'room:messaged',
      {
        uniqueId: v4(),
        sentAt: new Date(),
        ...event,
      },
      client,
    );
  }

  emitToRoom(event: string, message: any, client: Socket) {
    this.server.to(client.data.roomAt).emit(event, message);
  }

  broadcastToRoom(event: string, message: any, client: Socket) {
    client.broadcast.to(client.data.roomAt).emit(event, message);
  }
}
