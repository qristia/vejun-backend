import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './schema/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { GetUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserModel>,
  ) {}

  async getCurrent(req: Request): Promise<GetUserDto> {
    const token = req['user'];
    if (!token) {
      throw new NotFoundException('User not found');
    }

    const user = await this.findById(token.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new GetUserDto(user);
  }

  async findAll(): Promise<UserModel[]> {
    try {
      return await this.userModel.find().lean();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getUsers(): Promise<GetUserDto[]> {
    const users = await this.findAll();
    return users.map((user) => new GetUserDto(user));
  }

  async createUser(email: string, pass: string): Promise<UserModel> {
    return (await new this.userModel({ email, pass }).save()).toObject();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return await this.userModel.findById(id).lean();
  }
}
