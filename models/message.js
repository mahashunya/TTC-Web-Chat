const mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  message: {
    type: String
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usersses'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usersses'
  },
  senderName: {
    type: String
  },
  receiverName: {
    type: String
  },
  userImage: {
    type: String,
    default: 'defaultPic.png'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);