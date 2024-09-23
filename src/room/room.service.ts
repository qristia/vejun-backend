import {
  // ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangeRoomOwnerDto,
  CreateRoomDto,
  UpdateRoomDto,
} from './dto/room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RoomModel } from './schema/room.schema';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { RoomQueue } from './queue/consumer/room.consumer';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RoomService {
  private readonly logger = new Logger();
  constructor(
    @InjectModel(RoomModel.name) private readonly roomModel: Model<RoomModel>,
    @InjectQueue('room') private readonly roomQueue: RoomQueue,
    private readonly redisService: RedisService,
  ) {}

  async getRooms(): Promise<RoomModel[]> {
    return await this.roomModel.find().lean();
  }

  async findById(roomId: string): Promise<RoomModel> {
    const room = await this.roomModel.findById(roomId).lean();
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async createRoom(
    { name, currentVideoUrl, isPrivate }: CreateRoomDto,
    owner: string,
  ): Promise<RoomModel> {
    try {
      const room = new this.roomModel({
        name,
        owner,
        isPrivate,
        currentVideoUrl,
      });
      return (await room.save()).toObject();
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  async editRoom(update: UpdateRoomDto, roomId: string, userId: string) {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (userId !== room.owner) {
      throw new ForbiddenException('Not the owner of the room');
    }

    await room.updateOne(update);
  }

  async changeRoomOwner(
    update: ChangeRoomOwnerDto,
    roomId: string,
    userId: string,
  ) {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (userId !== room.owner) {
      throw new ForbiddenException('Not the owner of the room');
    }

    await room.updateOne(update);
  }

  async joinRoom(roomId: string, userId: string): Promise<RoomModel> {
    try {
      const room = await this.roomModel.findById(roomId);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.users.includes(userId)) return room.toObject();

      const jobId = await this.redisService.getClient().get(`room:${roomId}:deletionJob`)
      if (jobId) {
        this.logger.debug(
          `found deletion job: ${jobId} in room: ${room.id}`,
          'roomService',
        );
        const job = await this.roomQueue.getJob(jobId);
        await this.redisService.getClient().del(`room:${roomId}:deletionJob`);
        await job?.remove();
      }

      await room.updateOne({
        $addToSet: { users: userId },
      });
      room.users.push(userId);
      return room.toObject();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const room = await this.roomModel.findById(roomId);
      if (!room) {
        throw new NotFoundException('Room not found');
      }
      if (!room.users.includes(userId)) return;

      if (room.users.length === 1) {
        const job = await this.roomQueue.add(
          "room.deletion",
          {
            roomId: room.id,
          },
          { delay: 600_000 },
        );
        this.logger.debug(
          `added deletion job: ${job.id} of room: ${room.id}`,
          'roomService',
        );
        await this.redisService.getClient().set(`room:${room.id}:deletionJob`, job.id);
      }

      await room.updateOne({
        $pull: { users: userId },
      });
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  async deleteRoom(roomId: string) {
    try {
      const room = await this.roomModel.findById(roomId);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      await room.deleteOne();

      return room.id;
    } catch (e) {
      this.logger.error(e.message)
      throw e;
    }
  }
}
