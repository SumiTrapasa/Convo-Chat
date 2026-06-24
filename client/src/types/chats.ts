import type { CallMessageStatus, CallType, MessageType } from "./call";

export interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
}

export interface Contact extends User {
  isOnline?: boolean;
}

export interface ChatPartner extends User {
  lastMessage?: {
    text?: string;
    image?: string;
    createdAt?: string;
    messageType?: MessageType;
    read?: boolean;
    senderId?: string;
  };
  unreadCount?: number;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  read?: boolean;

  text?: string;
  image?: string;
  messageType?: MessageType;
  call?: {
    callType: CallType;
    status: CallMessageStatus;
    startedAt?: string;
    endedAt?: string;
    durationSeconds?: number;
  };
  createdAt: string;
  isOptimistic?: boolean;
}

export interface MessageData {
  text?: string;
  image?: string;
}
