import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import api from "../api/axios";

const notificationSound = new Audio("/sounds/notification.mp3");

export interface Contact {
  _id: string;
  fullName: string;
  profilePic?: string;
  isOnline?: boolean;
}

export interface ChatPartner {
  _id: string;
  fullName: string;
  profilePic?: string;
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

interface ChatState {
  allContacts: Contact[];
  chats: ChatPartner[];
  messages: Message[];
  activeTab: string;
  selectedUser: Contact | ChatPartner | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
}

interface ChatActions {
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (selectedUser: Contact | ChatPartner | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: MessageData) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("isSoundEnabled") || "false") === true
      : false,

  toggleSound: () => {
    const nextSoundState = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(nextSoundState));
    set({ isSoundEnabled: nextSoundState });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await api.get<Contact[]>("/messages/contacts");
      set({ allContacts: res.data });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await api.get<ChatPartner[]>("/messages/chats");
      set({ chats: res.data });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await api.get<Message[]>(`/messages/${userId}`);
      set({ messages: res.data });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser?._id || "",
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Immediately update UI
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await api.post<Message>(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      set((state) => ({
        messages: state.messages.map((m) => (m._id === tempId ? res.data : m)),
      }));
    } catch {
      // Revert if API fails
      set({ messages: messages });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage: Message) => {
      const { selectedUser, isSoundEnabled } = get();
      if (!selectedUser) return;

      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });
      if (isSoundEnabled) {
        notificationSound.currentTime = 0;
        notificationSound
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
}));
