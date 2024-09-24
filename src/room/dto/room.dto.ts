import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  queue?: string[];
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
