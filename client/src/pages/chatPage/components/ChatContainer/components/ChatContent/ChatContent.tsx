import { BorderBeam, Button, Flex, Image, Typography, Spin } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import { Fragment, useEffect, useRef } from "react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import ChatLoadingSkeleton from "../ChatSkeletonLoading/ChatSkeletonLoading";
import styles from "./ChatContent.module.scss";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import NoChatsFound from "@/components/NoChatsFound/NoChatsFound";
import {
  formatDateLabel,
  formatTime,
  isJumboEmoji,
  isAIMessage as checkAI,
} from "@/utils/chat";
import { useMessages, useSendMessage } from "@/hooks/useChat"; // Corrected import
import {
  COLORS,
  QUICK_MESSAGES,
  AI_USER_ID,
  AI_USER_FULL_NAME,
  AI_USER_PROFILE_PIC,
} from "@/const/chat";
import { MESSAGE_TYPE } from "@/const/call";
import type { Message } from "@/types/chats";
import { getCallLabel } from "@/utils/video";

const ChatContent = () => {
  const queryClient = useQueryClient();
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();

  const { data: messages = [], isLoading: isMessagesLoading } = useMessages(
    selectedUser?._id,
  );
  const { mutate: sendMessage } = useSendMessage(selectedUser?._id || "");

  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { Text } = Typography;

  // Check if any message is currently being sent to the AI
  const isThinking =
    useIsMutating({
      mutationKey: ["sendMessage", AI_USER_ID],
    }) > 0;

  useEffect(() => {
    subscribeToMessages((newMessage) => {
      queryClient.setQueryData<Message[]>(
        ["messages", selectedUser?._id],
        (old = []) => [...old, newMessage],
      );
    });

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages, queryClient]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) return <ChatLoadingSkeleton />;

  return (
    <Flex vertical gap={8} className={styles.chatContent}>
      {messages.length === 0 && (
        <Flex
          vertical
          className={styles.noContent}
          align="center"
          justify="center"
          gap={24}
        >
          <NoChatsFound
            title={
              selectedUser?._id === AI_USER_ID
                ? `Chat with ${AI_USER_FULL_NAME}`
                : `Start your conversation with ${selectedUser?.fullName}`
            }
            description="This is the beginning of your conversation. Send a message to start chatting!"
          />
          <Flex
            align="center"
            justify="center"
            gap={16}
            className={styles.buttons}
          >
            {QUICK_MESSAGES.map((msg, index) => (
              <BorderBeam key={index} color={COLORS}>
                <Button onClick={() => sendMessage({ text: msg.text })}>
                  {msg.label}
                </Button>
              </BorderBeam>
            ))}
          </Flex>
        </Flex>
      )}
      {messages.map((msg, index) => {
        const isMine = msg.senderId === authUser?._id;
        const msgDate = new Date(msg.createdAt).toDateString();
        const isAIMessage = checkAI(msg.senderId);
        const prevMsgDate =
          index > 0
            ? new Date(messages[index - 1].createdAt).toDateString()
            : null;
        const isNewDay = msgDate !== prevMsgDate;

        return (
          <Fragment key={msg._id}>
            {isNewDay && (
              <Flex justify="center" className={styles.dateSeparator}>
                <Text className={styles.dateLabel}>
                  {formatDateLabel(msg.createdAt)}
                </Text>
              </Flex>
            )}

            {msg.messageType === MESSAGE_TYPE.CALL ? (
              <Flex justify="center">
                <Flex align="center" gap={8} className={styles.callEvent}>
                  <VideoCameraOutlined />
                  <Text className={styles.callEventText}>
                    {getCallLabel(msg, isMine)}
                  </Text>
                  <Text className={styles.callEventTime}>
                    {formatTime(msg.createdAt)}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <Flex justify={isMine ? "flex-end" : "flex-start"}>
                <Flex align="end" gap={8} className={styles.messageContainer}>
                  {!isMine && (
                    <ProfilePicture
                      size={30}
                      profilePic={
                        isAIMessage
                          ? AI_USER_PROFILE_PIC
                          : selectedUser?.profilePic
                      }
                    />
                  )}

                  <Flex
                    vertical
                    className={!isMine ? styles.message : styles.mine}
                  >
                    {msg.image && (
                      <Image src={msg.image} preview className={styles.image} />
                    )}

                    {msg.text && (
                      <Text
                        className={`${styles.text} ${isJumboEmoji(msg.text) ? styles.jumboEmoji : ""}`}
                      >
                        {msg.text}
                      </Text>
                    )}

                    <Text className={styles.time}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </Flex>

                  {isMine && (
                    <ProfilePicture
                      size={30}
                      profilePic={authUser?.profilePic}
                    />
                  )}
                </Flex>
              </Flex>
            )}
          </Fragment>
        );
      })}

      {selectedUser?._id === AI_USER_ID && isThinking && (
        <Flex align="end" gap={8} className={styles.messageContainer}>
          <ProfilePicture size={30} profilePic={AI_USER_PROFILE_PIC} />
          <Flex align="center" gap={8} className={styles.message}>
            <Spin size="small" className={styles.pendingMsg} />
            <Text italic className={styles.pendingMsg}>
              AI is thinking...
            </Text>
          </Flex>
        </Flex>
      )}

      <div ref={messageEndRef} className={styles.messageEnd} />
    </Flex>
  );
};

export default ChatContent;
