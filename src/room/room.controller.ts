import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, GetRoomDto } from './dto/room.dto';
import { Request } from 'express';
import { getUserIdFromReq } from 'src/util/get_user_from_req';

@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  async getRooms(): Promise<GetRoomDto[]> {
    const rooms = await this.roomService.getRooms();
    return rooms.map((room) => new GetRoomDto(room));
  }

  @Get(':id')
  async getRoom(@Param('id') roomId: string): Promise<GetRoomDto> {
    const room = await this.roomService.findById(roomId);
    return new GetRoomDto(room);
  }

  @Post()
  async createRoom(
    @Req() req: Request,
    @Body() body: CreateRoomDto,
  ): Promise<GetRoomDto> {
    const userId = getUserIdFromReq(req);
    return new GetRoomDto(
      await this.roomService.createRoom({ ...body, owner: userId }),
    );
  }

  @Post('join/:id')
  async joinRoom(@Req() req: Request, @Param('id') roomId: string) {
    const userId = getUserIdFromReq(req);
    await this.roomService.joinRoom(roomId, userId);
  }
}
