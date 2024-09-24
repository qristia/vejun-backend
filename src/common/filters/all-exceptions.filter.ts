import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    const exResponse = isHttpException ? exception.getResponse() : undefined;
    const res = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof exResponse === 'object' ? exResponse : { message }),
    };
    this.logger.log(res);
    response.status(status).json(res);
  }
}
