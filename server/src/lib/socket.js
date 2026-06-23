import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";
import {
  CALL_MESSAGE_STATUS,
  CALL_RING_TIMEOUT_MS,
  CALL_SOCKET_EVENTS,
  CALL_TYPE,
  MESSAGE_TYPE,
} from "../const/call.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}
const activeCalls = new Map(); // {callId: {callerId, receiverId, startedAt, acceptedAt, timeoutId}}

const getUserPublicProfile = (user) => ({
  _id: user._id.toString(),
  fullName: user.fullName,
  profilePic: user.profilePic,
});

const getCallByUserId = (userId) => {
  for (const [callId, call] of activeCalls.entries()) {
    if (call.callerId === userId || call.receiverId === userId) {
      return { callId, call };
    }
  }

  return null;
};

const emitCallEndedToPeer = (userId, callId, endedBy) => {
  const peerSocketId = getReceiverSocketId(userId);
  if (peerSocketId) {
    io.to(peerSocketId).emit(CALL_SOCKET_EVENTS.CALL_ENDED, { callId, endedBy });
  }
};

const emitMessageToConversation = (message) => {
  const senderSocketId = getReceiverSocketId(message.senderId.toString());
  const receiverSocketId = getReceiverSocketId(message.receiverId.toString());

  if (senderSocketId) {
    io.to(senderSocketId).emit(CALL_SOCKET_EVENTS.NEW_MESSAGE, message);
  }

  if (receiverSocketId && receiverSocketId !== senderSocketId) {
    io.to(receiverSocketId).emit(CALL_SOCKET_EVENTS.NEW_MESSAGE, message);
  }
};

const saveCallMessage = async (call, status) => {
  try {
    const endedAt = new Date();
    const durationSeconds = call.acceptedAt
      ? Math.max(0, Math.round((endedAt.getTime() - call.acceptedAt.getTime()) / 1000))
      : 0;

    const callMessage = await Message.create({
      senderId: call.callerId,
      receiverId: call.receiverId,
      messageType: MESSAGE_TYPE.CALL,
      call: {
        callType: CALL_TYPE.VIDEO,
        status,
        startedAt: call.startedAt,
        endedAt,
        durationSeconds,
      },
    });

    emitMessageToConversation(callMessage);
  } catch (error) {
    console.log("Error saving call message:", error.message);
  }
};

const clearCallTimeout = (call) => {
  if (call?.timeoutId) {
    clearTimeout(call.timeoutId);
  }
};

const finalizeCall = (callId, status) => {
  const call = activeCalls.get(callId);
  if (!call) return null;

  clearCallTimeout(call);
  activeCalls.delete(callId);
  saveCallMessage(call, status);

  return call;
};

const emitToCallParticipants = (call, eventName, payload) => {
  const callerSocketId = getReceiverSocketId(call.callerId);
  const receiverSocketId = getReceiverSocketId(call.receiverId);

  if (callerSocketId) {
    io.to(callerSocketId).emit(eventName, payload);
  }

  if (receiverSocketId && receiverSocketId !== callerSocketId) {
    io.to(receiverSocketId).emit(eventName, payload);
  }
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // with socket.on we listen for events from clients
  socket.on(CALL_SOCKET_EVENTS.CALL_USER, ({ receiverId } = {}, callback) => {
    if (!receiverId || receiverId === userId) {
      callback?.({ ok: false, message: "Invalid receiver" });
      return;
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (!receiverSocketId) {
      callback?.({ ok: false, message: "User is offline" });
      return;
    }

    if (getCallByUserId(userId) || getCallByUserId(receiverId)) {
      callback?.({ ok: false, message: "User is already in a call" });
      return;
    }

    const callId = `${userId}-${receiverId}-${Date.now()}`;
    const call = { callerId: userId, receiverId, startedAt: new Date() };
    call.timeoutId = setTimeout(() => {
      const timedOutCall = finalizeCall(callId, CALL_MESSAGE_STATUS.MISSED);
      if (!timedOutCall) return;

      emitToCallParticipants(timedOutCall, CALL_SOCKET_EVENTS.CALL_TIMEOUT, {
        callId,
      });
    }, CALL_RING_TIMEOUT_MS);

    activeCalls.set(callId, call);

    io.to(receiverSocketId).emit(CALL_SOCKET_EVENTS.INCOMING_CALL, {
      callId,
      caller: getUserPublicProfile(socket.user),
    });

    callback?.({ ok: true, callId });
  });

  socket.on(CALL_SOCKET_EVENTS.ACCEPT_CALL, ({ callId } = {}, callback) => {
    const call = activeCalls.get(callId);
    if (!call || call.receiverId !== userId) {
      callback?.({ ok: false, message: "Call not found" });
      return;
    }

    const callerSocketId = getReceiverSocketId(call.callerId);
    if (!callerSocketId) {
      finalizeCall(callId, CALL_MESSAGE_STATUS.MISSED);
      callback?.({ ok: false, message: "Caller is offline" });
      return;
    }

    clearCallTimeout(call);
    call.acceptedAt = new Date();
    call.timeoutId = null;
    activeCalls.set(callId, call);

    io.to(callerSocketId).emit(CALL_SOCKET_EVENTS.CALL_ACCEPTED, {
      callId,
      receiver: getUserPublicProfile(socket.user),
    });

    callback?.({ ok: true });
  });

  socket.on(CALL_SOCKET_EVENTS.REJECT_CALL, ({ callId } = {}, callback) => {
    const call = activeCalls.get(callId);
    if (!call || call.receiverId !== userId) {
      callback?.({ ok: false, message: "Call not found" });
      return;
    }

    finalizeCall(callId, CALL_MESSAGE_STATUS.DECLINED);

    const callerSocketId = getReceiverSocketId(call.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit(CALL_SOCKET_EVENTS.CALL_REJECTED, {
        callId,
        rejectedBy: userId,
      });
    }

    callback?.({ ok: true });
  });

  socket.on(CALL_SOCKET_EVENTS.CANCEL_CALL, ({ callId } = {}, callback) => {
    const call = activeCalls.get(callId);
    if (!call || call.callerId !== userId) {
      callback?.({ ok: false, message: "Call not found" });
      return;
    }

    finalizeCall(callId, CALL_MESSAGE_STATUS.MISSED);

    const receiverSocketId = getReceiverSocketId(call.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(CALL_SOCKET_EVENTS.CALL_CANCELLED, {
        callId,
        cancelledBy: userId,
      });
    }

    callback?.({ ok: true });
  });

  socket.on(CALL_SOCKET_EVENTS.END_CALL, ({ callId } = {}, callback) => {
    const call = activeCalls.get(callId);
    if (!call || (call.callerId !== userId && call.receiverId !== userId)) {
      callback?.({ ok: false, message: "Call not found" });
      return;
    }

    finalizeCall(
      callId,
      call.acceptedAt ? CALL_MESSAGE_STATUS.COMPLETED : CALL_MESSAGE_STATUS.MISSED,
    );

    const peerId = call.callerId === userId ? call.receiverId : call.callerId;
    emitCallEndedToPeer(peerId, callId, userId);

    callback?.({ ok: true });
  });

  socket.on(CALL_SOCKET_EVENTS.WEBRTC_SIGNAL, ({ callId, signal } = {}) => {
    const call = activeCalls.get(callId);
    if (!call || (call.callerId !== userId && call.receiverId !== userId)) {
      return;
    }

    const peerId = call.callerId === userId ? call.receiverId : call.callerId;
    const peerSocketId = getReceiverSocketId(peerId);
    if (!peerSocketId) return;

    io.to(peerSocketId).emit(CALL_SOCKET_EVENTS.WEBRTC_SIGNAL, {
      callId,
      signal,
      from: userId,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    const userCall = getCallByUserId(userId);
    if (userCall) {
      const { callId, call } = userCall;
      const peerId = call.callerId === userId ? call.receiverId : call.callerId;
      finalizeCall(
        callId,
        call.acceptedAt ? CALL_MESSAGE_STATUS.COMPLETED : CALL_MESSAGE_STATUS.MISSED,
      );
      emitCallEndedToPeer(peerId, callId, userId);
    }

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
