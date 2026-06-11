import { Avatar, Flex, Typography } from "antd";
import { CommentOutlined } from "@ant-design/icons";
import styles from "./NoChatsFound.module.scss";

const NoChatsFound = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Flex vertical align="center" justify="center">
      <Avatar size={64} icon={<CommentOutlined />} />
      <Typography.Text strong>{title}</Typography.Text>
      <Typography.Text type="secondary" className={styles.subtitle}>
        {description}
      </Typography.Text>
    </Flex>
  );
};

export default NoChatsFound;
