import { CALL_MESSAGE_STATUS } from "@/const/call";
import type { Message } from "@/types/chats";

export const formatCallDuration = (seconds = 0) => {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getCallLabel = (msg: Message, isMine: boolean) => {
  if (msg.call?.status === CALL_MESSAGE_STATUS.COMPLETED) {
    return `Video call - ${formatCallDuration(msg.call.durationSeconds)}`;
  }

  if (msg.call?.status === CALL_MESSAGE_STATUS.DECLINED) {
    return isMine ? "Video call declined" : "You declined this video call";
  }

  return isMine ? "No answer" : "Missed video call";
};
