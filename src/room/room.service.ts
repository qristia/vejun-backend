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

@Injectable()
export class RoomService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(RoomModel.name) private roomModel: Model<RoomModel>,
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

      // throw new ConflictException('User has already joined the room');

      if (!room.users.includes(userId)) {
        await room.updateOne({
          $addToSet: { users: userId },
        });
      }

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

      // if (!room.users.includes(userId)) {
      //   throw new ConflictException('User is not in the room');
      // }

      await room.updateOne({
        $pull: { users: userId },
      });
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }
}
