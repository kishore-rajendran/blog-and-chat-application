var mongoose = require('mongoose');

var childSchema = mongoose.Schema({
  name :{
    type:String
  },
  message :{
    type:String
  },
  date:{
    type:Date,
    default:Date.now
  }
});

var schema=mongoose.Schema({
id1:{
  type:String,
  required:true
},
id2:{
  type:String,
  required:true
},
msg:[childSchema]
});

var Chat = module.exports = mongoose.model('Chat',schema);
