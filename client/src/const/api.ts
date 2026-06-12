export const API_ENDPOINTS = {
  AUTH: {
    CHECK: "/auth/check",
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    UPDATE_PROFILE: "/auth/update-profile",
  },
  MESSAGES: {
    GET_MESSAGES: (userId: string) => `/messages/${userId}`,
    SEND_MESSAGE: (receiverId: string) => `/messages/send/${receiverId}`,
    CONTACTS: "/messages/contacts",
    CHATS: "/messages/chats",
  },
  AI: {
    GET_MESSAGES: "/ai/messages",
    SEND_MESSAGE: "/ai/chat",
    CLEAR_MESSAGES: "/ai/messages",
  },
};
