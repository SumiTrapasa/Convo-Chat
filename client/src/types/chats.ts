export interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
}

export interface Contact extends User {
  isOnline?: boolean;
}

export interface ChatPartner extends User {
  lastMessage?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  isOptimistic?: boolean;
}

export interface MessageData {
  text?: string;
  image?: string;
}
