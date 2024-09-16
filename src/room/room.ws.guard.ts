import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class IsHostGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const isHost: boolean = client.data.isHost;

    if (!isHost) {
      throw new WsException('You are not the host.');
    }

    return true;
  }
}
