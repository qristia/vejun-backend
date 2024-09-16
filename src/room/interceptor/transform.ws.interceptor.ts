import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
// import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { GetUserDto } from 'src/users/dto/user.dto';

export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const user: GetUserDto = client.data.user;

    Object.assign(data, {
      type: 'user',
      senderName: user.name,
      senderId: user.id,
    });

    return next.handle();
  }
}
