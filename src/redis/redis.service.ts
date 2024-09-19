import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private _logger = new Logger();

  constructor(private readonly configService: ConfigService) {}

  async init(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_HOST');
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      this._logger.error('Redis Client Error:', err);
    });

    await this.client.connect();
    this._logger.debug("Redis connected", "RedisService")
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
