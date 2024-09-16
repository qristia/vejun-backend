import * as cookie from 'cookie';
import * as cookieParser from 'cookie-parser';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export function cookieParserMiddleware(secret: string) {
  return function (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    next: (err?: ExtendedError) => void,
  ) {
    const cookies: string = socket.handshake.headers.cookie;
    if (cookies) {
      const signedCookies = cookieParser.signedCookies(
        cookie.parse(cookies),
        secret,
      );
      socket.data.signedCookies = signedCookies;
    }
    next();
  };
}
