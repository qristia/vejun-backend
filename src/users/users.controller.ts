import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUserDto } from './dto/user.dto';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('current')
  async getCurrentUser(@Req() req: Request): Promise<GetUserDto> {
    return await this.usersService.getCurrent(req);
  }

  @Get()
  async getUsers(): Promise<GetUserDto[]> {
    return await this.usersService.getUsers();
  }
}
