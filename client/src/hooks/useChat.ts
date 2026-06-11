import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import api from "../api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { API_ENDPOINTS } from "@/const/api";
import type { Message, MessageData, Contact, ChatPartner } from "@/types/chats";

export const useMessages = (userId?: string) => {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      const { data } = await api.get<Message[]>(
        API_ENDPOINTS.MESSAGES.GET_MESSAGES(userId!),
      );
      return data;
    },
    enabled: !!userId,
  });
};

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data } = await api.get<Contact[]>(
        API_ENDPOINTS.MESSAGES.CONTACTS,
      );
      return data;
    },
  });
};

export const useChatPartners = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await api.get<ChatPartner[]>(
        API_ENDPOINTS.MESSAGES.CHATS,
      );
      return data;
    },
  });
};

export const useSendMessage = (receiverId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: MessageData) => {
      const { data } = await api.post<Message>(
        API_ENDPOINTS.MESSAGES.SEND_MESSAGE(receiverId),
        messageData,
      );
      return data;
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["messages", receiverId] });

      const previousMessages = queryClient.getQueryData<Message[]>([
        "messages",
        receiverId,
      ]);

      // Optimistically update to the new value
      const authUser = useAuthStore.getState().authUser;
      const optimisticMessage: Message = {
        _id: Date.now().toString(), // temporary id
        senderId: authUser?._id || "",
        receiverId,
        text: newMessage.text,
        image: newMessage.image,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData<Message[]>(
        ["messages", receiverId],
        (old = []) => [...old, optimisticMessage],
      );

      return { previousMessages };
    },
    onError: (_err, _newMessage, context) => {
      queryClient.setQueryData(
        ["messages", receiverId],
        context?.previousMessages,
      );
      message.error("Failed to send message");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", receiverId] });
    },
  });
};
