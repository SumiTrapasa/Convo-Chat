import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { Contact, ChatPartner, Message } from "@/types/chats";
import { NOTIFICATION_SOUND } from "@/const/audio";
import { CALL_SOCKET_EVENTS } from "@/const/call";
import type { QueryClient } from "@tanstack/react-query";

interface ChatState {
  activeTab: string;
  selectedUser: Contact | ChatPartner | null;
  isSoundEnabled: boolean;
}

interface ChatActions {
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (selectedUser: Contact | ChatPartner | null) => void;
  subscribeToMessages: (queryClient?: QueryClient) => void;
  unsubscribeFromMessages: () => void;
  markMessagesAsRead: (partnerId: string, queryClient?: QueryClient) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  activeTab: "chats",
  selectedUser: null,

  isSoundEnabled:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("isSoundEnabled") || "false")
      : false,

  toggleSound: () => {
    const next = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(next));
    set({ isSoundEnabled: next });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  subscribeToMessages: (queryClient) => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off(CALL_SOCKET_EVENTS.NEW_MESSAGE);
    socket.off(CALL_SOCKET_EVENTS.MESSAGE_READ);

    socket.on(CALL_SOCKET_EVENTS.NEW_MESSAGE, (newMessage: Message) => {
      const authUserId = useAuthStore.getState().authUser?._id;
      const { selectedUser, isSoundEnabled } = get();

      if (!authUserId) return;

      const isReceiver = newMessage.receiverId === authUserId;

      const chatPartnerId =
        newMessage.senderId === authUserId
          ? newMessage.receiverId
          : newMessage.senderId;

      // ================= CHAT LIST UPDATE =================
      queryClient?.setQueryData(["chats"], (old: ChatPartner[] = []) => {
        return old
          .map((chat) => {
            if (chat._id !== chatPartnerId) return chat;

            const isOpenChat = selectedUser?._id === chatPartnerId;

            const unreadCount = isReceiver
              ? isOpenChat
                ? 0
                : (chat.unreadCount || 0) + 1
              : chat.unreadCount || 0;

            return {
              ...chat,
              lastMessage: {
                text: newMessage.text,
                image: newMessage.image,
                createdAt: newMessage.createdAt,
                senderId: newMessage.senderId,
                read: false,
              },
              unreadCount,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.lastMessage?.createdAt || 0).getTime() -
              new Date(a.lastMessage?.createdAt || 0).getTime(),
          );
      });

      // ================= SOUND =================
      if (isReceiver && isSoundEnabled) {
        NOTIFICATION_SOUND.currentTime = 0;
        NOTIFICATION_SOUND.play().catch(() => {});
      }

      // ================= OPEN CHAT UPDATE =================
      const isCurrentConversation =
        selectedUser && chatPartnerId === selectedUser._id;

      if (isCurrentConversation) {
        queryClient?.setQueryData(
          ["messages", chatPartnerId],
          (old: Message[] = []) => {
            const exists = old.some((m) => m._id === newMessage._id);
            if (exists) return old;

            return [
              ...old,
              {
                ...newMessage,
                read: false, // FIX
              },
            ];
          },
        );

        if (isReceiver) {
          get().markMessagesAsRead(selectedUser._id, queryClient);
        }
      }
    });

    // ================= MESSAGE READ =================
    socket.on(
      CALL_SOCKET_EVENTS.MESSAGE_READ,
      ({
        partnerId,
        messageIds,
      }: {
        partnerId: string;
        messageIds: string[];
      }) => {
        const readSet = new Set(messageIds);

        // messages update
        queryClient?.setQueryData(
          ["messages", partnerId],
          (old: Message[] = []) =>
            old.map((msg) => ({
              ...msg,
              read: readSet.has(msg._id) || msg.read, // FIX
            })),
        );

        // chats update
        queryClient?.setQueryData(["chats"], (old: ChatPartner[] = []) =>
          old.map((chat) =>
            chat._id === partnerId
              ? {
                  ...chat,
                  unreadCount: 0,
                  lastMessage: chat.lastMessage
                    ? {
                        ...chat.lastMessage,
                        read: true,
                      }
                    : undefined,
                }
              : chat,
          ),
        );
      },
    );
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off(CALL_SOCKET_EVENTS.NEW_MESSAGE);
    socket.off(CALL_SOCKET_EVENTS.MESSAGE_READ);
  },

  markMessagesAsRead: (partnerId, queryClient) => {
    const socket = useAuthStore.getState().socket;
    const authUserId = useAuthStore.getState().authUser?._id;

    if (!socket || !authUserId) return;

    // optimistic chat update
    queryClient?.setQueryData(["chats"], (old: ChatPartner[] = []) =>
      old.map((chat) =>
        chat._id === partnerId
          ? {
              ...chat,
              unreadCount: 0,
              lastMessage: chat.lastMessage
                ? {
                    ...chat.lastMessage,
                    read: true,
                  }
                : undefined,
            }
          : chat,
      ),
    );

    // optimistic message update
    queryClient?.setQueryData(["messages", partnerId], (old: Message[] = []) =>
      old.map((msg) =>
        msg.senderId === partnerId && msg.receiverId === authUserId
          ? {
              ...msg,
              read: true,
            }
          : msg,
      ),
    );

    socket.emit(CALL_SOCKET_EVENTS.MARK_MESSAGES_READ, {
      senderId: partnerId,
      receiverId: authUserId,
    });
  },
}));
