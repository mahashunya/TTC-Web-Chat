var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name:{ type: String,},
  email:{type: String},
  Task: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    enum: ["Ongoing", "Completed", "Not yet started"],
    required: true,
  },
});

module.exports = User = mongoose.model("tasks", UserSchema);