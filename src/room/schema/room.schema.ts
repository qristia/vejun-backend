import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  collection: 'rooms',
})
export class RoomModel {
  @Prop({
    auto: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  isPrivate: boolean;

  @Prop()
  pass: string;

  @Prop()
  users: string[];

  @Prop()
  queue: string[];

  @Prop()
  currentVideoUrl: string;

  @Prop()
  thumbnailUrl: string;
}

export const RoomSchema = SchemaFactory.createForClass(RoomModel);
