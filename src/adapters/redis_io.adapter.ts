import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(redisClient: RedisClientType): Promise<void> {
    const pubClient = redisClient.duplicate()
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(): any {
    const configService = this.app.get(ConfigService);
    const options = {
      cors: {
        origin: configService.get<string>("ORIGIN"),
        credentials: true,
      },
    };
    const server = super.createIOServer(0, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
