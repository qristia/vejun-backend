import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { generate } from 'shortid';

@Schema({
  collection: 'rooms',
})
export class RoomModel {
  @Prop({
    default: generate,
  })
  _id: string;

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
