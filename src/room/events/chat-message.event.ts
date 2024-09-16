import { BaseRoomEvent } from './base.event';

export interface ChatMessageEvent extends BaseRoomEvent {
  senderName: string;
  content: string;
}
