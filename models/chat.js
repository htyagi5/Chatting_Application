const mongoose=require('mongoose');


//Schema
const messageSchema=new mongoose.Schema({
text:String,
senderId:String,
name:String,
  type: { type: String, enum: ['text', 'file'], required: true },
  status: { type: String, enum: ['sent', 'received', 'read'], default: 'sent' },
},{timestamps:true}
)
const Chat=mongoose.model('message',messageSchema)

module.exports=Chat;