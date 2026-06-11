import { Card, Typography } from "antd";

import styles from "./ChatCard.module.scss";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";

const ChatCard = ({
  profilePic,
  name,
  isOnline = false,
  onClick,
}: {
  profilePic?: string;
  name: string;
  isOnline: boolean;
  onClick?: () => void;
}) => {
  return (
    <Card className={styles.chatCard} hoverable onClick={onClick}>
      <ProfilePicture
        isOnline={isOnline}
        profilePic={profilePic}
        size={42}
        offset={[-16, 8]}
        className={styles.avatar}
      />
      <Typography.Text strong>{name}</Typography.Text>
    </Card>
  );
};

export default ChatCard;
