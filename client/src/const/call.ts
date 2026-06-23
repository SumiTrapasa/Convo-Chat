export const CALL_STATUS = {
  IDLE: "idle",
  CALLING: "calling",
  RINGING: "ringing",
  IN_CALL: "in-call",
} as const;

export const WEBRTC_SIGNAL_TYPE = {
  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice-candidate",
} as const;

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
} as const;

export const CALL_MESSAGE_STATUS = {
  MISSED: "missed",
  DECLINED: "declined",
  COMPLETED: "completed",
} as const;

export const CALL_TYPE = {
  VIDEO: "video",
} as const;

export const MESSAGE_TYPE = {
  TEXT: "text",
  CALL: "call",
} as const;
