// import TokenModel from "../models/users/token.js"
// import ParticipantsModel from "../models/messenger/participants.js";
import Token from "../models/user/Token.js";
import Conversation from "../models/chat/conversation.js";

export default async function(req, res, next) {
    const urlConversation = req.url.split('/')[1];
    console.log(urlConversation)
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken)

    if (refreshToken) {
        const userData = await Token.findOne({ refreshToken: refreshToken });
        const conversationsList = await Conversation.find({
            participants: userData.user.toString()
        });
        const conversationsArray = []
        conversationsList.map((item) => {
            conversationsArray.push(item.conversationId)
        });

        if (conversationsArray.includes(urlConversation)) {
            next()
        } else {
            res.redirect(`${process.env.CLIENT_URL}`);
        }
    } else {
        res.redirect(`${process.env.CLIENT_URL}`);
    }
};