const { convSeenByUser } = require('../db/conversationService.js');

module.exports = async (userId, conversationId) => {
  await convSeenByUser(userId, conversationId);
  // todo: broadcast to the users of a conversation that it's seen by this user.
};