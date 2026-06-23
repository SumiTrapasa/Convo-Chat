import mongoose from "mongoose";
import { CALL_MESSAGE_STATUS, CALL_TYPE, MESSAGE_TYPE } from "../const/call.js";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    messageType: {
      type: String,
      enum: Object.values(MESSAGE_TYPE),
      default: MESSAGE_TYPE.TEXT,
    },
    call: {
      callType: {
        type: String,
        enum: Object.values(CALL_TYPE),
      },
      status: {
        type: String,
        enum: Object.values(CALL_MESSAGE_STATUS),
      },
      startedAt: {
        type: Date,
      },
      endedAt: {
        type: Date,
      },
      durationSeconds: {
        type: Number,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
