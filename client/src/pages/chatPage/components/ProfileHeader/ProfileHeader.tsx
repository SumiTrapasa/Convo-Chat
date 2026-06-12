import {
  Button,
  Dropdown,
  Flex,
  Tooltip,
  Typography,
  type MenuProps,
} from "antd";
import {
  EditOutlined,
  LogoutOutlined,
  MenuOutlined,
  MutedOutlined,
  SoundOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styles from "./ProfileHeader.module.scss";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useRef, useState } from "react";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import { useChatStore } from "@/store/useChatStore";
import { fileToBase64 } from "@/utils/file";
import { useLogout, useUpdateProfile } from "@/hooks/useAuth";
import { useClearAIMessages } from "@/hooks/useChat";
import { MOUSE_CLICK_SOUND } from "@/const/audio";

const ProfileHeader = () => {
  const { authUser } = useAuthStore();
  const { mutate: logout } = useLogout();
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: clearMessages } = useClearAIMessages();

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const { isSoundEnabled, toggleSound } = useChatStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Image = await fileToBase64(file);
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button
          type="link"
          className={styles.linkButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Change Picture
        </Button>
      ),
      icon: <EditOutlined />,
    },
    {
      key: "2",
      label: (
        <Tooltip
          placement="right"
          title={"Play sounds for incoming and outgoing messages"}
        >
          <Button
            type="link"
            className={styles.linkButton}
            onClick={() => {
              // play click sound before toggling
              MOUSE_CLICK_SOUND.currentTime = 0; // reset to start
              MOUSE_CLICK_SOUND.play().catch((error) =>
                console.log("Audio play failed:", error),
              );
              toggleSound();
            }}
          >
            Conversation tones
          </Button>
        </Tooltip>
      ),
      icon: isSoundEnabled ? <SoundOutlined /> : <MutedOutlined />,
    },
    {
      key: "ai-clear",
      label: (
        <Button
          type="link"
          className={styles.linkButton}
          onClick={() => clearMessages()}
        >
          Clear AI History
        </Button>
      ),
      icon: <DeleteOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <Button
          type="link"
          className={styles.linkButton}
          onClick={() => logout()}
        >
          Logout
        </Button>
      ),
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Flex justify="space-between" align="center">
      <Flex align="center" gap={8}>
        <ProfilePicture
          size={48}
          offset={[-10, 8]}
          profilePic={selectedImg || authUser?.profilePic}
          isOnline={true}
        />
        <Flex vertical>
          <Typography.Text strong className={styles.username}>
            {authUser?.fullName}
          </Typography.Text>
          <Typography.Text type="secondary">Online</Typography.Text>
        </Flex>
      </Flex>

      <Dropdown menu={{ items }}>
        <Button type="text">
          <MenuOutlined className={styles.logoutIcon} />
        </Button>
      </Dropdown>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className={styles.fileInput}
      />
    </Flex>
  );
};

export default ProfileHeader;
