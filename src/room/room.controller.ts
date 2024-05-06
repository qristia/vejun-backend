import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { RoomService } from './room.service';
import { CreateRoomDto, GetRoomDto, UpdateRoomDto } from './dto/room.dto';

import { getUserIdFromReq } from 'src/util/get_user_from_req';
import { Public } from 'src/util/public_metadata';
import { YoutubeService } from 'src/youtube/youtube.service';

@Controller('room')
export class RoomController {
  constructor(
    private roomService: RoomService,
    private youtubeService: YoutubeService,
  ) {}

  @Get()
  @Public()
  async getRooms(): Promise<GetRoomDto[]> {
    const rooms = await this.roomService.getRooms();
    return rooms.map((room) => new GetRoomDto(room));
  }

  @Get(':id')
  async getRoom(@Param('id') roomId: string): Promise<GetRoomDto> {
    try {
      const room = await this.roomService.findById(roomId);
      return new GetRoomDto(room);
    } catch (e) {
      throw e;
    }
  }

  @Post()
  async createRoom(
    @Req() req: Request,
    @Body() body: CreateRoomDto,
  ): Promise<GetRoomDto> {
    const userId = getUserIdFromReq(req);

    try {
      const createdRoom = await this.roomService.createRoom(body, userId);
      const room = new GetRoomDto(createdRoom);

      if (body.currentVideoUrl) {
        this.addThumbnailToRoom(body.currentVideoUrl, room.id, userId);
      }
      return room;
    } catch (e) {
      throw e;
    }
  }

  @Patch(':id')
  async editRoom(
    @Req() req: Request,
    @Body() body: UpdateRoomDto,
    @Param('id') roomId: string,
  ) {
    const userId = getUserIdFromReq(req);
    await this.roomService.editRoom(body, roomId, userId);
  }

  @Post('join/:id')
  async joinRoom(
    @Req() req: Request,
    @Param('id') roomId: string,
  ): Promise<GetRoomDto> {
    const userId = getUserIdFromReq(req);
    try {
      const room = await this.roomService.joinRoom(roomId, userId);
      return new GetRoomDto(room);
    } catch (e) {
      throw e;
    }
  }

  @Delete('leave/:id')
  async leaveRoom(
    @Req() req: Request,
    @Param('id') roomId: string,
  ): Promise<void> {
    const userId = getUserIdFromReq(req);
    await this.roomService.leaveRoom(roomId, userId);
  }

  private async addThumbnailToRoom(
    vidUrl: string,
    roomId: string,
    userId: string,
  ) {
    try {
      const result = await this.youtubeService.getVid(vidUrl);
      const thumbnailUrl =
        result.thumbnails[result.thumbnails.length - 1]?.url || '';

      await this.roomService.editRoom(
        {
          thumbnailUrl,
        },
        roomId,
        userId,
      );
    } catch {}
  }
}
