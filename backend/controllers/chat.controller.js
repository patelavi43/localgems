const Conversation = require('../models/Conversation.model');
const TalentProfile = require('../models/TalentProfile.model');

// GET /api/chat/conversations
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name profile_pic role')
      .select('-messages')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/:conversationId
exports.getMessages = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    }).populate('participants', 'name profile_pic role');

    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Mark messages as read
    convo.messages.forEach((m) => {
      if (m.senderId.toString() !== req.user._id.toString() && !m.readAt) {
        m.readAt = new Date();
      }
    });
    await convo.save();

    res.json({ success: true, data: convo });
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/start  – start or get existing conversation with a talent
exports.startConversation = async (req, res, next) => {
  try {
    const { talentUserId } = req.body;
    if (talentUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    const talentProfile = await TalentProfile.findOne({ user_id: talentUserId });

    // Find existing conversation between these two users
    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, talentUserId] },
    }).populate('participants', 'name profile_pic role');

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, talentUserId],
        talentId: talentProfile?._id,
        messages: [],
      });
      await convo.populate('participants', 'name profile_pic role');
    }

    res.json({ success: true, data: convo });
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/:conversationId/message
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const convo = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const message = { senderId: req.user._id, content };
    convo.messages.push(message);
    convo.lastMessage = content.substring(0, 100);
    convo.lastMessageAt = new Date();
    await convo.save();

    const newMsg = convo.messages[convo.messages.length - 1];
    res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    next(error);
  }
};
