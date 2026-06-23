import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { Contact, ChatPartner, Message } from "@/types/chats";
import { NOTIFICATION_SOUND } from "@/const/audio";
import { CALL_SOCKET_EVENTS } from "@/const/call";

interface ChatState {
  activeTab: string;
  selectedUser: Contact | ChatPartner | null;
  isSoundEnabled: boolean;
}

interface ChatActions {
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (selectedUser: Contact | ChatPartner | null) => void;
  subscribeToMessages: (onMessage: (msg: Message) => void) => void;
  unsubscribeFromMessages: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  activeTab: "chats",
  selectedUser: null,
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

  subscribeToMessages: (onMessage) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on(CALL_SOCKET_EVENTS.NEW_MESSAGE, (newMessage: Message) => {
      const { selectedUser, isSoundEnabled } = get();
      if (!selectedUser) return;

      const authUser = useAuthStore.getState().authUser;
      const senderId = newMessage.senderId;
      const receiverId = newMessage.receiverId;
      const selectedUserId = selectedUser._id;
      const authUserId = authUser?._id;

      if (isSoundEnabled && receiverId === authUserId) {
        NOTIFICATION_SOUND.currentTime = 0;
        NOTIFICATION_SOUND.play().catch((e) =>
          console.log("Audio play failed:", e),
        );
      }

      const isCurrentConversation =
        (senderId === selectedUserId && receiverId === authUserId) ||
        (senderId === authUserId && receiverId === selectedUserId);

      if (!isCurrentConversation) return;

      onMessage(newMessage);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off(CALL_SOCKET_EVENTS.NEW_MESSAGE);
  },
}));
