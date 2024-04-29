import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(3001, { namespace: 'room' })
export class RoomGateway {
  @WebSocketServer() private readonly server: Server;

  @SubscribeMessage('room:join')
  handleRoomUserJoin(@MessageBody() event: { userId: string }): void {
    this.server.emit('room:joined', event);
  }
}
