const mongoose = require('mongoose');
var Schema = mongoose.Schema
var groupMessage = new Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'usersses'},
    body: {type: String},
    name: {type: String},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('GroupMessage', groupMessage);