import type { User } from "./chats";
import {
  CALL_MESSAGE_STATUS,
  CALL_STATUS,
  CALL_TYPE,
  MESSAGE_TYPE,
  WEBRTC_SIGNAL_TYPE,
} from "@/const/call";

type ValueOf<T> = T[keyof T];

export interface IncomingCall {
  callId: string;
  caller: User;
}

export type RemoteCallUser = User;

export interface SocketAck {
  ok: boolean;
  callId?: string;
  message?: string;
}

export type WebRTCSignal =
  | {
      type: typeof WEBRTC_SIGNAL_TYPE.OFFER;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: typeof WEBRTC_SIGNAL_TYPE.ANSWER;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: typeof WEBRTC_SIGNAL_TYPE.ICE_CANDIDATE;
      candidate: RTCIceCandidateInit;
    };

export type MessageType = ValueOf<typeof MESSAGE_TYPE>;
export type CallType = ValueOf<typeof CALL_TYPE>;
export type CallMessageStatus = ValueOf<typeof CALL_MESSAGE_STATUS>;
export type CallStatus = ValueOf<typeof CALL_STATUS>;
