import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from './dto/message.dto';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3001', credentials: true },
})
export class RoomGateway implements OnModuleInit {
  @WebSocketServer()
  private readonly server: Server;

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log(socket.id);
      // this.server.emit('room:joined', { userId: socket.id });
    });
  }

  @SubscribeMessage('room:video-update')
  handleRoomVideoUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: { time: string; isPlaying: boolean },
  ): void {
    this.server.emit('room:video-updated', {
      id: client.id,
      ...event,
    });
  }

  @SubscribeMessage('room:video-play')
  handleRoomVideoPlay(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: { id: string },
  ): void {
    this.server.emit('room:video-played', event);
  }

  @SubscribeMessage('room:video-pause')
  handleRoomVideoPaused(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: { id: string },
  ): void {
    this.server.emit('room:video-paused', event);
  }

  @SubscribeMessage('room:message')
  handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: ChatMessage,
  ): void {
    this.server.emit('room:messaged', event);
  }
}
