import { useRef, useState } from "react";
import useKeyboardSound from "@/hooks/useKeyboardSound";
import { Button, Flex, Image, Input, Popover } from "antd";
import styles from "./ChatInput.module.scss";
import { CloseOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";
import { useChatStore } from "@/store/useChatStore";
import { message } from "antd";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useSendMessage } from "@/hooks/useChat";
import { fileToBase64 } from "@/utils/file";

const ChatInput = () => {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedUser, isSoundEnabled } = useChatStore();
  const { mutate: sendMessage, isPending } = useSendMessage(
    selectedUser?._id || "",
  );

  const handleSendMessage = () => {
    if (!text.trim() && !imageFile) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imageFile || undefined,
    });

    setText("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      message.error("Please select an image file");
      return;
    }

    try {
      const base64Image = await fileToBase64(file);
      setImageFile(base64Image);
    } catch (error) {
      console.error("Image processing failed:", error);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  return (
    <Flex vertical gap={16} className={styles.chatInput}>
      {imageFile && (
        <div className={styles.imagePreview}>
          <Image
            src={imageFile}
            width={100}
            height={100}
            className={styles.image}
          />
          <Button
            type="text"
            size="small"
            onClick={removeImage}
            className={styles.closeIcon}
          >
            <CloseOutlined />
          </Button>
        </div>
      )}
      <Flex align="center" gap={8} className={styles.chatFlexInput}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className={styles.fileInput}
        />
        <Button
          icon={<UploadOutlined />}
          className={styles.emojiButton}
          onClick={() => fileInputRef.current?.click()}
        />

        <Popover
          content={
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              autoFocusSearch={false}
              theme={undefined}
            />
          }
          trigger="click"
          placement="topLeft"
        >
          <Button className={styles.emojiButton}>😊</Button>
        </Popover>

        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (isSoundEnabled) {
              playRandomKeyStrokeSound();
            }
          }}
          placeholder={
            isPending ? "Convo AI is thinking..." : "Type a message..."
          }
          disabled={isPending}
          onPressEnter={handleSendMessage}
          className={styles.inputField}
          size="large"
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!text && !imageFile}
        />
      </Flex>
    </Flex>
  );
};
export default ChatInput;
