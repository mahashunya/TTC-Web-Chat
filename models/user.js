const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
var passportLocalMongoose = require("passport-local-mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({


  name: {
    type: String,
    

  },

  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
userImage:{ type: String, default:'default.png' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  sentRequest: [{
    name: {
      type: String,
      default: ''
    }
  }],
  request: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usersses'
    },
    name: {
      type: String,
      default: ''
    }
  }],
  friendsList: [{
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'usersses'
    },
    friendName: {
      type: String,
      default: ''
    }
  }],
  totalRequest: {
    type: Number,
    default: 0
  },
  
}, )
userSchema.plugin(passportLocalMongoose);
userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}
userSchema.methods.validUserPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports= User= mongoose.model('usersses', userSchema);
//module.exports =User= mongoose.model('usersses', userSchema);