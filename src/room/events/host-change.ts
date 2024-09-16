import { BaseRoomEvent } from './base.event';

export interface RoomHostTargetsEvent extends BaseRoomEvent {
  target: string;
}
