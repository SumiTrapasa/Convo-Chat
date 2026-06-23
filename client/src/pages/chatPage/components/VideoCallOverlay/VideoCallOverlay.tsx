import { Button, Flex, Typography } from "antd";
import {
  AudioOutlined,
  CloseOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useEffect, useRef } from "react";
import ProfilePicture from "@/components/ProfilePicture/ProfilePicture";
import { useCallStore } from "@/store/useCallStore";
import { CALL_STATUS } from "@/const/call";
import styles from "./VideoCallOverlay.module.scss";

const VideoCallOverlay = () => {
  const {
    status,
    incomingCall,
    remoteUser,
    localStream,
    remoteStream,
    isMicMuted,
    isCameraOff,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCallStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (status === CALL_STATUS.IDLE) return null;

  const displayUser = incomingCall?.caller || remoteUser;
  const isWaiting = status === CALL_STATUS.CALLING;
  const isRinging = status === CALL_STATUS.RINGING;

  return (
    <div className={styles.overlay}>
      <Flex vertical className={styles.callSurface}>
        <Flex align="center" justify="space-between" className={styles.header}>
          <Flex align="center" gap={12}>
            <ProfilePicture
              size={48}
              offset={[-10, 8]}
              profilePic={displayUser?.profilePic}
              isOnline
            />
            <Flex vertical>
              <Typography.Text strong className={styles.name}>
                {displayUser?.fullName || "Video call"}
              </Typography.Text>
              <Typography.Text className={styles.status}>
                {isRinging
                  ? "Incoming video call"
                  : isWaiting
                    ? "Calling..."
                    : "Connected"}
              </Typography.Text>
            </Flex>
          </Flex>
        </Flex>

        {isRinging ? (
          <Flex
            vertical
            align="center"
            justify="center"
            className={styles.prompt}
          >
            <ProfilePicture
              size={96}
              offset={[-16, 12]}
              profilePic={displayUser?.profilePic}
              isOnline
            />
            <Typography.Title level={4} className={styles.promptTitle}>
              {displayUser?.fullName}
            </Typography.Title>
            <Flex gap={16}>
              <Button
                danger
                type="primary"
                shape="circle"
                size="large"
                onClick={rejectCall}
              >
                <CloseOutlined />
              </Button>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<PhoneOutlined />}
                onClick={acceptCall}
              />
            </Flex>
          </Flex>
        ) : (
          <div className={styles.videoGrid}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={styles.remoteVideo}
            />
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={styles.localVideo}
            />
            {isWaiting ? (
              <Flex align="center" justify="center" className={styles.waiting}>
                <Typography.Text className={styles.status}>
                  Waiting for answer...
                </Typography.Text>
              </Flex>
            ) : null}
          </div>
        )}

        {!isRinging ? (
          <Flex
            align="center"
            justify="center"
            gap={12}
            className={styles.controls}
          >
            <Button
              shape="circle"
              type="primary"
              size="large"
              className={isMicMuted ? styles.disabledControl : undefined}
              icon={<AudioOutlined />}
              onClick={toggleMic}
            />
            <Button
              shape="circle"
              type="primary"
              size="large"
              icon={<VideoCameraOutlined />}
              className={isCameraOff ? styles.disabledControl : undefined}
              onClick={toggleCamera}
            />
            <Button
              danger
              type="primary"
              size="large"
              shape="circle"
              icon={<PhoneOutlined />}
              onClick={isWaiting ? cancelCall : endCall}
            />
          </Flex>
        ) : null}
      </Flex>
    </div>
  );
};

export default VideoCallOverlay;
