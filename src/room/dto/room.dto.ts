import { Optional } from '@nestjs/common';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { BaseDto } from 'src/util/base_dto';

export class CreateRoomDto {
  constructor(partial: Partial<CreateRoomDto>) {
    Object.assign(this, partial);
  }

  @IsString()
  name: string;

  @Optional()
  owner: string;

  @IsBoolean()
  isPrivate: boolean;
}

export class GetRoomDto {
  constructor(partial: Partial<CreateRoomDto>) {
    Object.assign(this, partial);
  }
  _id: mongoose.Schema.Types.ObjectId;

  @Expose()
  get id(): string {
    return this._id.toString();
  }

  @Expose()
  name: string;
  @Expose()
  owner: string;
  @Expose()
  isPrivate: boolean;
  @Expose()
  users: BaseDto[];
  @Expose()
  queue: string[];
}
