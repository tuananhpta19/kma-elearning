const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let NotificaionSchema = new Schema({
  sender:{
    id:String,
    username:String,
    avatar:String
  },
  receiver:{
    id:String,
    username:String,
    avatar:String
  },
  type: String,
  content: String,
  isRead:{type:Boolean, default:false},
  createdAt: {type: Number, default:Date.now},
})
module.exports = mongoose.model("notification",NotificaionSchema)