const express = require('express');
const router = express.Router();
const { getConversations, getMessages, startConversation, sendMessage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/conversations', getConversations);
router.post('/start', startConversation);
router.get('/:conversationId', getMessages);
router.post('/:conversationId/message', sendMessage);

module.exports = router;
