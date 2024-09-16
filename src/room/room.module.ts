import { Module } from '@nestjs/common';
import { RoomGateway } from './room.ws.gateway';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModel, RoomSchema } from './schema/room.schema';
import { UsersModule } from 'src/users/users.module';
import { YoutubeModule } from 'src/youtube/youtube.module';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomModel.name, schema: RoomSchema }]),
    UsersModule,
    YoutubeModule,
    ConfigModule,
  ],
  providers: [RoomService, AuthService, RoomGateway],
  exports: [RoomService],
  controllers: [RoomController],
})
export class RoomModule {}
