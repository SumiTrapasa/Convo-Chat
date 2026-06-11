import { Avatar, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";

const ProfilePicture = ({
  profilePic,
  size,
  offset,
  isOnline,
  className,
}: {
  profilePic?: string;
  size: number;
  offset?: [number, number];
  isOnline?: boolean;
  className?: string;
}) => {
  return (
    <Badge dot count={isOnline ? 1 : 0} color="green" offset={offset}>
      <Avatar size={size} src={profilePic || undefined} className={className}>
        <UserOutlined />
      </Avatar>
    </Badge>
  );
};

export default ProfilePicture;
