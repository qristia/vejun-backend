import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomModule } from './room/room.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { YoutubeModule } from './youtube/youtube.module';
import { RedisModule } from './redis/redis.module';

const envFile = process.env.NODE_ENV ? '.env.dev' : '.env'
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: envFile, isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        const user = configService.get<string>('MONGO_USER');
        const pass = configService.get<string>('MONGO_PASSWORD');
        return { uri, user, pass };
      },
    }),
    RedisModule,
    RoomModule,
    UsersModule,
    AuthModule,
    YoutubeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
