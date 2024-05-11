import express from "express";
import UserModel from "../models/user/User.js";
import ConversationModel from "../models/chat/conversation.js";
import ConversationMediaModel from "../models/chat/converstation-media.js";
import MessagesModel from "../models/chat/messages.js";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

const conversationMedia = multer.diskStorage({
    destination: function(req, file, cb) {
        const { conversationId } = req.body;
        cb(null, `./uploads/conversations/${conversationId}`);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

router.post("/open-conversation", async(req, res) => {
    try {
        const { id } = req.body;
        const userData = await UserModel.findOne({ _id: id });
        const supportData = await UserModel.findOne({
            roles: { $all: "SUPPORT" },
        });
        if (userData) {
            const existConversation = await ConversationModel.findOne({
                creatorId: userData._id.toString(),
            });
            if (existConversation) {
                return res.json(existConversation);
            } else {
                const newConversation = new ConversationModel({
                    creatorId: userData._id.toString(),
                    participants: [userData._id.toString(), supportData._id.toString()],
                    ticketNumber: Math.floor(100000000 + Math.random() * 900000),
                });
                await newConversation.save();
                const folderName = `./uploads/conversations/${newConversation._id}`;

                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName);
                }
                return res.json(newConversation);
            }
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
    }
});
router.get("/delete-conversation", async(req, res) => {
    try {} catch (error) {
        console.log(error);
    }
});

router.post("/create-message", multer({ storage: conversationMedia }).single("file"),
    async(req, res) => {
        try {
            const { senderId, recipientId, conversationId, message, replyTo } = req.body;
            const media = req.file;
            let newMessage;

            if (media) {
                const mediaInfo = new ConversationMediaModel({
                    userId: senderId,
                    conversationId: conversationId,
                    file: media.originalname,
                });
                await mediaInfo.save();

                if (mediaInfo) {
                    newMessage = new MessagesModel({
                        conversationId: conversationId,
                        senderId: senderId,
                        recipientId: recipientId,
                        content: message || "",
                        mediaId: mediaInfo._id || "",
                        replyTo: replyTo || "",
                    });
                    await newMessage.save();
                }
            } else {
                newMessage = new MessagesModel({
                    conversationId: conversationId,
                    senderId: senderId,
                    recipientId: recipientId,
                    content: message || "",
                    replyTo: replyTo || "",
                });
                await newMessage.save();
            }
            return res.json(newMessage);
        } catch (error) {}
    }
);

router.get("/messages/:id", async(req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            const messages = await MessagesModel.find({ conversationId: id });
            return res.json(messages);
        }
    } catch (error) {}
});

router.post("/active-conversation", async(req, res) => {
    try {
        const { id } = req.body;
        if (id) {
            const activeConversation = await MessagesModel.findOne({}).sort({ updatedAt: -1 })

            if (activeConversation) {
                return res.json(activeConversation.conversationId)
            }
        }
    } catch (error) {}
});
router.post("/active-messages", async(req, res) => {
    try {
        const { id } = req.body;
        if (id) {
            const messages = await MessagesModel.find({
                conversationId: id
            });
            if (messages) {
                return res.json(messages)
            }
        }
    } catch (error) {}
});

router.post("/recipient-messages", async(req, res) => {
    try {
        const { id } = req.body;

        if (id) {
            const conversation = await ConversationModel.findOne({
                participants: { $all: id },
            });
            if (conversation) {
                const messages = await MessagesModel.find({
                    conversationId: conversation._id.toString(),
                });
                return res.json(messages);
            }
        }
    } catch (error) {}
});
router.post("/get-conversation", async(req, res) => {
    try {
        const { id } = req.body;

        if (id) {
            const conversation = await ConversationModel.findOne({
                participants: { $all: id },
            });
            if (conversation) {
                return res.json(conversation._id);
            }
        }
    } catch (error) {}
});

router.get("/get-conversations/:id", async(req, res) => {
    try {
        const { id } = req.params;
        let groupedUserInfo = []

        if (id) {
            const conversations = await ConversationModel.find({
                participants: { $all: id },
            });

            if (conversations) {
                const filteredUsersId = conversations.flatMap((item) =>
                    item.participants.filter((user) => user != id)
                );

                let usersInfo = await UserModel.find({
                    _id: { $in: filteredUsersId },
                }).lean()


                groupedUserInfo = conversations.map((conv) => {
                    if (conv.participants.includes(id.toString())) {
                        for (let x = 0; x < usersInfo.length; x++) {
                            return {...usersInfo[x], keys: conv._id.toString() }
                        }
                    }
                })

                // Get last mesaages of each conversations
                const conversationsId = conversations.flatMap((item) =>
                    item._id.toString()
                );
                const lastMessages = await MessagesModel.aggregate([{
                        $match: { conversationId: { $in: conversationsId } },
                    },
                    {
                        $project: {
                            conversationId: 1,
                            content: { $substr: ["$content", 0, 47] },
                            createdAt: 1,
                            updatedAt: 1,
                            senderId: 1,
                            recipientId: 1,
                            read: 1,
                        },
                    },
                    {
                        $sort: {
                            conversationId: 1,
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            conversationId: { $push: "$conversationId" },
                            content: {
                                $first: "$content",
                            },
                            createdAt: {
                                $first: "$createdAt",
                            },
                            updatedAt: {
                                $first: "$createdAt",
                            },
                            senderId: {
                                $first: "$senderId",
                            },
                            recipientId: {
                                $first: "$recipientId",
                            },
                            read: {
                                $first: "$read",
                            },
                        },
                    },
                    {
                        $sort: {
                            updatedAt: -1,
                        },
                    },
                    {
                        $group: {
                            _id: "$conversationId",
                            content: {
                                $first: "$content",
                            },
                            createdAt: {
                                $first: "$createdAt",
                            },
                            updatedAt: {
                                $first: "$createdAt",
                            },
                            senderId: {
                                $first: "$senderId",
                            },
                            recipientId: {
                                $first: "$recipientId",
                            },
                            read: {
                                $first: "$read",
                            },
                        },
                    },
                ]);

                console.log(groupedUserInfo)


                if (groupedUserInfo && lastMessages) {
                    return res.json({ usersInfo: groupedUserInfo, lastMessages: lastMessages });
                }
            } else {}
        }
    } catch (error) {}
});

export default router;