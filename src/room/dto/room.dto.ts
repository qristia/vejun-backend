import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';
import { BaseDto } from 'src/util/base_dto';

export class CreateRoomDto {
  constructor(partial: Partial<CreateRoomDto>) {
    Object.assign(this, partial);
  }

  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  currentVideoUrl?: string;

  @IsBoolean()
  isPrivate: boolean;
}

export class UpdateRoomDto {
  constructor(partial: Partial<UpdateRoomDto>) {
    Object.assign(this, partial);
  }

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsString()
  @IsOptional()
  currentVideoUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

export class ChangeRoomOwnerDto {
  @IsString()
  owner: string;
}

export class GetRoomDto {
  constructor(partial: Partial<GetRoomDto>) {
    Object.assign(this, partial);
  }
  _id: string;

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
  users: string[];
  @Expose()
  queue: string[];
  @Expose()
  currentVideoUrl: string;
  @Expose()
  thumbnailUrl: string;
}
