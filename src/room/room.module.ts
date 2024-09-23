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
import { BullModule } from '@nestjs/bullmq';
import { RoomConsumer } from './queue/consumer/room.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomModel.name, schema: RoomSchema }]),
    BullModule.registerQueue({ name: 'room' }),
    UsersModule,
    YoutubeModule,
    ConfigModule,
  ],
  providers: [RoomService, AuthService, RoomGateway, RoomConsumer],
  exports: [RoomService],
  controllers: [RoomController],
})
export class RoomModule {}
