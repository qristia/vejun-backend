export interface ChatMessage {
  uniqueId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: Date;
}
