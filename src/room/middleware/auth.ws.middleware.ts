import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { RoomService } from '../room.service';
import { RedisClientType } from 'redis';

export function authMiddleware(
  authService: AuthService,
  userService: UsersService,
  roomService: RoomService,
  redisClient: RedisClientType<any, any, any>,
) {
  return async function (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    next: (err?: ExtendedError) => void,
  ) {
    const authToken = socket.data.signedCookies.accessToken as string;
    const roomId = socket.handshake.query.roomId as string;
    try {
      const payload = await authService.verifyToken(authToken);
      const user = await userService.findById(payload.sub);
      const room = await roomService.findById(roomId);
      const id = user._id.toString();

      const kicked = await redisClient.get(`room:kick:${id}`);
      if (kicked) {
        return next(new Error(`Client ${socket.data.user.id} is kicked`));
      }

      socket.data.user = {
        id,
        email: user.email,
        name: user.name,
      };
      socket.data.isHost = room.owner === id;
    } catch (err) {
      return next(new Error('User or room not found'));
    }
    next();
  };
}
