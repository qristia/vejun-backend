import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRoomDto, GetRoomDto } from './dto/room.dto';
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

  async createRoom({
    name,
    owner,
    isPrivate,
  }: CreateRoomDto): Promise<RoomModel> {
    try {
      const room = new this.roomModel({ name, owner, isPrivate });
      return (await room.save()).toObject();
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  async joinRoom(roomId: string, userId: string) {
    try {
      const room = await this.roomModel.findById(roomId);
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      await room.updateOne({
        $addToSet: { users: userId },
      });
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }
}
