export interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;

  text?: string;
  image?: string;

  createdAt: string;
}

export interface SendMessagePayload {
  text?: string;
  image?: string;
}
