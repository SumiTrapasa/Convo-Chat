import { create } from "zustand";
import { message } from "antd";
import { useAuthStore } from "./useAuthStore";
import type {
  CallStatus,
  IncomingCall,
  RemoteCallUser,
  SocketAck,
  WebRTCSignal,
} from "@/types/call";
import {
  CALL_SOCKET_EVENTS,
  CALL_STATUS,
  WEBRTC_SIGNAL_TYPE,
} from "@/const/call";
import { VIDEO_CALL_RINGTONE } from "@/const/audio";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface CallState {
  callId: string | null;
  status: CallStatus;
  incomingCall: IncomingCall | null;
  remoteUser: RemoteCallUser | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMicMuted: boolean;
  isCameraOff: boolean;
  error: string | null;
}

interface CallActions {
  initializeSocketListeners: () => void;
  cleanupSocketListeners: () => void;
  startCall: (receiver: RemoteCallUser) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  cancelCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
}

type CallStore = CallState & CallActions;

let peerConnection: RTCPeerConnection | null = null;
let listenersSocketId: string | null = null;
let queuedIceCandidates: RTCIceCandidateInit[] = [];
let ringtoneAudio: HTMLAudioElement | null = null;

const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const initialCallState: CallState = {
  callId: null,
  status: CALL_STATUS.IDLE,
  incomingCall: null,
  remoteUser: null,
  localStream: null,
  remoteStream: null,
  isMicMuted: false,
  isCameraOff: false,
  error: null,
};

const getSocket = () => useAuthStore.getState().socket;

const getRingtoneAudio = () => {
  if (!ringtoneAudio) {
    ringtoneAudio = VIDEO_CALL_RINGTONE;
    ringtoneAudio.loop = true;
    ringtoneAudio.preload = "auto";
  }

  return ringtoneAudio;
};

export const startRingtone = async () => {
  try {
    const audio = getRingtoneAudio();

    if (!audio.paused) return;

    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    console.error("Failed to play ringtone:", error);
  }
};

export const stopRingtone = () => {
  const audio = getRingtoneAudio();

  audio.pause();
  audio.currentTime = 0;
};
const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const resetPeerConnection = () => {
  peerConnection?.close();
  peerConnection = null;
  queuedIceCandidates = [];
};

const emitSignal = (callId: string, signal: WebRTCSignal) => {
  getSocket()?.emit(CALL_SOCKET_EVENTS.WEBRTC_SIGNAL, { callId, signal });
};

const createPeerConnection = (callId: string, localStream: MediaStream) => {
  resetPeerConnection();

  const connection = new RTCPeerConnection(rtcConfiguration);
  const remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    connection.addTrack(track, localStream);
  });

  connection.ontrack = (event) => {
    event.streams[0]?.getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
    useCallStore.setState({ remoteStream });
  };

  connection.onicecandidate = (event) => {
    if (!event.candidate) return;
    emitSignal(callId, {
      type: WEBRTC_SIGNAL_TYPE.ICE_CANDIDATE,
      candidate: event.candidate.toJSON(),
    });
  };

  connection.onconnectionstatechange = () => {
    if (
      ["failed", "closed", "disconnected"].includes(connection.connectionState)
    ) {
      const { status } = useCallStore.getState();
      if (status === CALL_STATUS.IN_CALL) {
        useCallStore.getState().endCall();
      }
    }
  };

  peerConnection = connection;
  useCallStore.setState({ remoteStream });

  return connection;
};

const getLocalMedia = async () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
};

const flushQueuedIceCandidates = async () => {
  if (!peerConnection?.remoteDescription) return;

  const candidates = [...queuedIceCandidates];
  queuedIceCandidates = [];

  for (const candidate of candidates) {
    await peerConnection.addIceCandidate(candidate);
  }
};

const handleSignal = async (payload: {
  callId: string;
  signal: WebRTCSignal;
}) => {
  const { callId, signal } = payload;
  const { localStream } = useCallStore.getState();
  if (!localStream) return;

  const connection =
    peerConnection ?? createPeerConnection(callId, localStream);

  if (signal.type === WEBRTC_SIGNAL_TYPE.OFFER) {
    await connection.setRemoteDescription(signal.sdp);
    await flushQueuedIceCandidates();
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    emitSignal(callId, { type: WEBRTC_SIGNAL_TYPE.ANSWER, sdp: answer });
    stopRingtone();
    useCallStore.setState({ status: CALL_STATUS.IN_CALL });
    return;
  }

  if (signal.type === WEBRTC_SIGNAL_TYPE.ANSWER) {
    await connection.setRemoteDescription(signal.sdp);
    await flushQueuedIceCandidates();
    stopRingtone();
    useCallStore.setState({ status: CALL_STATUS.IN_CALL });
    return;
  }

  if (!connection.remoteDescription) {
    queuedIceCandidates.push(signal.candidate);
    return;
  }

  await connection.addIceCandidate(signal.candidate);
};

const resetCallState = () => {
  const { localStream, remoteStream } = useCallStore.getState();
  stopStream(localStream);
  stopStream(remoteStream);
  resetPeerConnection();
  stopRingtone();
  useCallStore.setState(initialCallState);
};

export const useCallStore = create<CallStore>((set, get) => ({
  ...initialCallState,

  initializeSocketListeners: () => {
    const socket = getSocket();
    if (!socket || listenersSocketId === socket.id) return;

    get().cleanupSocketListeners();
    listenersSocketId = socket.id ?? null;

    socket.on(
      CALL_SOCKET_EVENTS.INCOMING_CALL,
      (incomingCall: IncomingCall) => {
        const { status } = get();
        if (status !== CALL_STATUS.IDLE) {
          socket.emit(CALL_SOCKET_EVENTS.REJECT_CALL, {
            callId: incomingCall.callId,
          });
          return;
        }

        startRingtone();
        set({
          callId: incomingCall.callId,
          status: CALL_STATUS.RINGING,
          incomingCall,
          remoteUser: incomingCall.caller,
          error: null,
        });
      },
    );

    socket.on(
      CALL_SOCKET_EVENTS.CALL_ACCEPTED,
      async ({ callId }: { callId: string }) => {
        const { localStream } = get();
        if (!localStream) return;

        stopRingtone();
        const connection = createPeerConnection(callId, localStream);
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        emitSignal(callId, { type: WEBRTC_SIGNAL_TYPE.OFFER, sdp: offer });
        set({ status: CALL_STATUS.IN_CALL });
      },
    );

    socket.on(CALL_SOCKET_EVENTS.CALL_REJECTED, () => {
      message.info("Call declined");
      resetCallState();
    });

    socket.on(CALL_SOCKET_EVENTS.CALL_CANCELLED, () => {
      message.info("Call cancelled");
      resetCallState();
    });

    socket.on(CALL_SOCKET_EVENTS.CALL_ENDED, () => {
      message.info("Call ended");
      resetCallState();
    });

    socket.on(CALL_SOCKET_EVENTS.CALL_TIMEOUT, () => {
      message.info("No answer");
      resetCallState();
    });

    socket.on(
      CALL_SOCKET_EVENTS.WEBRTC_SIGNAL,
      (payload: { callId: string; signal: WebRTCSignal }) => {
        handleSignal(payload).catch((error: unknown) => {
          const description =
            error instanceof Error ? error.message : "Call connection failed";
          set({ error: description });
          message.error(description);
          resetCallState();
        });
      },
    );
  },

  cleanupSocketListeners: () => {
    const socket = getSocket();
    if (!socket) {
      listenersSocketId = null;
      return;
    }

    socket.off(CALL_SOCKET_EVENTS.INCOMING_CALL);
    socket.off(CALL_SOCKET_EVENTS.CALL_ACCEPTED);
    socket.off(CALL_SOCKET_EVENTS.CALL_REJECTED);
    socket.off(CALL_SOCKET_EVENTS.CALL_CANCELLED);
    socket.off(CALL_SOCKET_EVENTS.CALL_ENDED);
    socket.off(CALL_SOCKET_EVENTS.CALL_TIMEOUT);
    socket.off(CALL_SOCKET_EVENTS.WEBRTC_SIGNAL);
    listenersSocketId = null;
  },

  startCall: async (receiver) => {
    const socket = getSocket();
    if (!socket || get().status !== CALL_STATUS.IDLE) return;

    try {
      const localStream = await getLocalMedia();
      startRingtone();
      console.log("play");
      set({
        status: CALL_STATUS.CALLING,
        localStream,
        remoteUser: receiver,
        isMicMuted: false,
        isCameraOff: false,
        error: null,
      });

      socket.emit(
        CALL_SOCKET_EVENTS.CALL_USER,
        { receiverId: receiver._id },
        (response: SocketAck) => {
          if (!response.ok || !response.callId) {
            message.error(response.message || "Unable to start call");
            resetCallState();
            return;
          }

          set({ callId: response.callId });
        },
      );
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Camera or microphone access failed";
      set({ error: description });
      message.error(description);
      resetCallState();
    }
  },

  acceptCall: async () => {
    const socket = getSocket();
    const { incomingCall } = get();
    if (!socket || !incomingCall) return;

    try {
      const localStream = await getLocalMedia();
      stopRingtone();
      set({
        localStream,
        incomingCall: null,
        status: CALL_STATUS.IN_CALL,
        isMicMuted: false,
        isCameraOff: false,
        error: null,
      });

      createPeerConnection(incomingCall.callId, localStream);
      socket.emit(CALL_SOCKET_EVENTS.ACCEPT_CALL, {
        callId: incomingCall.callId,
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Camera or microphone access failed";
      set({ error: description });
      message.error(description);
      socket.emit(CALL_SOCKET_EVENTS.REJECT_CALL, {
        callId: incomingCall.callId,
      });
      resetCallState();
    }
  },

  rejectCall: () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    getSocket()?.emit(CALL_SOCKET_EVENTS.REJECT_CALL, {
      callId: incomingCall.callId,
    });
    resetCallState();
  },

  cancelCall: () => {
    const { callId } = get();
    if (callId) {
      getSocket()?.emit(CALL_SOCKET_EVENTS.CANCEL_CALL, { callId });
    }

    resetCallState();
  },

  endCall: () => {
    const { callId } = get();
    if (callId) {
      getSocket()?.emit(CALL_SOCKET_EVENTS.END_CALL, { callId });
    }

    resetCallState();
  },

  toggleMic: () => {
    const { localStream, isMicMuted } = get();
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = isMicMuted;
    });
    set({ isMicMuted: !isMicMuted });
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    set({ isCameraOff: !isCameraOff });
  },
}));
