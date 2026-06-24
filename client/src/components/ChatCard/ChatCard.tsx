import { Badge, Card, Flex, Typography } from "antd";

import styles from "./ChatCard.module.scss";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import type { ChatPartner } from "@/types/chats";
import { useAuthStore } from "@/store/useAuthStore";

const ChatCard = ({
  profilePic,
  name,
  isOnline = false,
  unreadCount = 0,
  lastMessage,
  onClick,
}: {
  profilePic?: string;
  name: string;
  isOnline: boolean;
  unreadCount?: number;
  lastMessage?: ChatPartner["lastMessage"];
  onClick?: () => void;
}) => {
  const { authUser } = useAuthStore();

  const previewText = lastMessage
    ? lastMessage?.image
      ? "📷 Photo"
      : lastMessage?.text || "📹 Video Call"
    : "";

  const isMine = lastMessage?.senderId === authUser?._id;

  return (
    <Card className={styles.chatCard} hoverable onClick={onClick}>
      <Flex align="center">
        <ProfilePicture
          isOnline={isOnline}
          profilePic={profilePic}
          size={42}
          offset={[-16, 8]}
          className={styles.avatar}
        />
        <Flex vertical className={styles.container}>
          <Flex
            align="baseline"
            justify="space-between"
            className={styles.container}
          >
            <Typography.Text strong>{name}</Typography.Text>
            <Badge color={"green"} count={unreadCount ? unreadCount : 0} />
          </Flex>
          {previewText && (
            <Flex align="center" gap={8}>
              {isMine && (
                <Typography.Text
                  className={
                    lastMessage?.read ? styles.readStatus : styles.unreadStatus
                  }
                >
                  ✓✓
                </Typography.Text>
              )}
              <Typography.Text
                ellipsis
                type={unreadCount && unreadCount > 0 ? undefined : "secondary"}
              >
                {previewText}
              </Typography.Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default ChatCard;
