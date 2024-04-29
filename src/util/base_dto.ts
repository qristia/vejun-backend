import { Expose } from 'class-transformer';
import mongoose from 'mongoose';

export class BaseDto {
  constructor(partial: Partial<BaseDto>) {
    Object.assign(this, partial);
  }
  _id: mongoose.Schema.Types.ObjectId;

  @Expose()
  get id(): string {
    return this._id.toString();
  }
}
