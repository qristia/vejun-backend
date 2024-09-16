import { BaseRoomEvent } from './base.event';

export type VideoEvent = BaseRoomEvent;

export interface VideoUpdateEvent extends BaseRoomEvent {
  time: number;
  isPlaying: boolean;
}

export interface VideoUrlChangeEvent extends BaseRoomEvent {
  newUrl: string;
}
