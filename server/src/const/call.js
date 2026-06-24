export const CALL_SOCKET_EVENTS = {
  CALL_USER: "video:call-user",
  INCOMING_CALL: "video:incoming-call",
  ACCEPT_CALL: "video:accept-call",
  CALL_ACCEPTED: "video:call-accepted",
  REJECT_CALL: "video:reject-call",
  CALL_REJECTED: "video:call-rejected",
  CANCEL_CALL: "video:cancel-call",
  CALL_CANCELLED: "video:call-cancelled",
  END_CALL: "video:end-call",
  CALL_ENDED: "video:call-ended",
  CALL_TIMEOUT: "video:call-timeout",
  WEBRTC_SIGNAL: "video:webrtc-signal",
  NEW_MESSAGE: "newMessage",
  MESSAGE_READ: "messages_read",
  MARK_MESSAGES_READ: "mark_messages_read",
};

export const CALL_MESSAGE_STATUS = {
  MISSED: "missed",
  DECLINED: "declined",
  COMPLETED: "completed",
};

export const CALL_TYPE = {
  VIDEO: "video",
};

export const MESSAGE_TYPE = {
  TEXT: "text",
  CALL: "call",
};

export const CALL_RING_TIMEOUT_MS = 45000;
