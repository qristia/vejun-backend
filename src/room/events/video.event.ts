import { BaseRoomEvent } from './base.event';

export type VideoEvent = BaseRoomEvent;

export interface VideoPlayingChangeEvent extends BaseRoomEvent {
  time: number;
  state: boolean;
}

export interface VideoUpdateEvent extends BaseRoomEvent {
  time: number;
  isPlaying: boolean;
}

export interface VideoUrlChangeEvent extends BaseRoomEvent {
  newUrl: string;
}
