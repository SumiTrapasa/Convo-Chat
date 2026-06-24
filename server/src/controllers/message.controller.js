import { CALL_SOCKET_EVENTS } from "../const/call.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .lean();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: partnerId,
        },
        {
          senderId: partnerId,
          receiverId: myId,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessagesByUserId:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    const { text, image } = req.body;

    if (!text?.trim() && !image) {
      return res.status(400).json({
        message: "Text or image is required.",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: "Cannot send messages to yourself.",
      });
    }

    const receiverExists = await User.exists({
      _id: receiverId,
    });

    if (!receiverExists) {
      return res.status(404).json({
        message: "Receiver not found.",
      });
    }

    let imageUrl;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "chat-app",
      });

      imageUrl = uploadResult.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text?.trim(),
      image: imageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(CALL_SOCKET_EVENTS.NEW_MESSAGE, newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const myId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: myId }, { receiverId: myId }],
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", myId] }, "$receiverId", "$senderId"],
          },

          lastMessage: {
            $first: "$$ROOT",
          },

          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", myId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          "lastMessage.createdAt": -1,
        },
      },
    ]);

    const partnerIds = conversations.map((conversation) => conversation._id);

    const users = await User.find({
      _id: {
        $in: partnerIds,
      },
    })
      .select("-password")
      .lean();

    const usersById = Object.fromEntries(
      users.map((user) => [user._id.toString(), user]),
    );

    const chatPartners = conversations
      .map((conversation) => {
        const user = usersById[conversation._id.toString()];

        if (!user) return null;

        return {
          _id: user._id.toString(),
          fullName: user.fullName,
          profilePic: user.profilePic,

          unreadCount: conversation.unreadCount,

          lastMessage: conversation.lastMessage
            ? {
                text: conversation.lastMessage.text,
                image: conversation.lastMessage.image,
                messageType: conversation.lastMessage.messageType,
                senderId: conversation.lastMessage.senderId.toString(),
                read: conversation.lastMessage.read,
                createdAt: conversation.lastMessage.createdAt,
              }
            : undefined,
        };
      })
      .filter(Boolean);

    return res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
