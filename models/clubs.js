const mongoose = require('mongoose');

const groupNames = mongoose.Schema({
    groupname: {type: String, default: ''},
    groupType: {type: String, default: ''},
    image: {type: String, default: 'default.png'},
    groupMembers: [{
        name: {type: String, default: ''},
        email: {type: String, default: ''}
    }]
});

module.exports= Team= mongoose.model('Team', groupNames);