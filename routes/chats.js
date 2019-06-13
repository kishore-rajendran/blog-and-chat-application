 var express=require('express');
var router=express.Router();
var client=require('socket.io').listen(4000).sockets;
var Chat=require('../models/chat');
var User=require('../models/user');
var user={};
var errors={};
router.get('/',ensureAuthenticated,function(req,res){
  //using chat constructor which is connected to db we are finding the values
  Chat.find({},function(err,chat){
    if(err){
      console.log(err);
    }
    else{
    res.render('chat',{
      errors:errors,
      chat:chat,
      uname:req.user.username
    });
  }
  });
});
router.get('/:id',ensureAuthenticated,function(req,res){
    //conection with db
    var query={_id:req.params.id};
      Chat.findById(req.params.id,function(err,chat){
      //  console.log(chat.msg);
          if(err){
            throw err;
          }
        //  console.log(chat.msg);
          res.render('pchat',{
            chat:chat,
            chats:chat.msg,
            user:req.user,
            errors:errors
          });
});
});
//use chat id in onload to distiguish chat
client.on('connection',function(socket){
//emitting the message
//socket.emit('output',chat.msg);
socket.on('new user',function(data,callback){
  var name=data.user;
  if(data.user in user){
  }
  else{//////mkmjjghgghknjjj
    socket.name=data.user;
    socket.chatid=data.chatid;
    user[socket.name]=socket;
    //console.log(user);
    Chat.find({"_id" : data.chatid},{_id:0,id1:0,id2:0,__v:0,msg:{$slice:-10}},function(err,chat){
      var chatty=chat[0].msg;
      chatty=chatty.reverse();
      socket.emit('output',{
        chat:chatty,
        flag:0
      });
      Chat.find({"_id" : data.chatid},function(err,size){
        var len = size[0].msg.length;
        user[socket.name].msglen=len;
      });
  });
    /*Chat.findById(data.chatid,function(err,chat){
      socket.emit('output',chat.msg);
  });*/
}
});
socket.on('load message',function(chat){
  var use=chat.user;
  if(-(chat.ml)<=user[use].msglen){
  Chat.find({"_id" : chat.chatid},{_id:0,id1:0,id2:0,__v:0,msg:{$slice:[chat.ml,10]}},function(err,chat){
    var chatty=chat[0].msg;
    chatty=chatty.reverse();
    user[use].emit('output',{
      chat:chatty,
      flag:0
    });
});
}
else if(user[use].msglen+(chat.ml+10)>0){
  Chat.find({"_id" : chat.chatid},{_id:0,id1:0,id2:0,__v:0,msg:{$slice:[-(user[use].msglen),user[use].msglen+(chat.ml+10)]}},function(err,chat){
    var chatty=chat[0].msg;
    chatty=chatty.reverse();
    user[use].emit('output',{
      chat:chatty,
      flag:0
    });
});
}
});

socket.on('input',function(chat){
  var query={_id:chat.chatid};
//  console.log(chat.receiver);
//  console.log(user);
  var receive=chat.receiver;
  var use=chat.user;
/*  if(user[socket.receive]==undefined){
    console.log("received");
  socket.receive=chat.receiver;
  user[socket.receive]=socket;
}
if(user[socket.use]==undefined){
  console.log("received");
socket.use=chat.user;
user[socket.use]=socket;
}*/
Chat.updateOne(query,{$push:{msg:chat.chat1}},function(){
  user[use].emit('output',{
    chat:[chat.chat1],
    flag:1
  });
  if(user[receive]!=undefined && user[receive].chatid==user[use].chatid){
user[receive].emit('output',{
  chat:[chat.chat1],
  flag:1
});
}
});
});
socket.on('disconnect',function(data){
  if(!socket.name)return;
  delete user[socket.name];
})
});


  /*Chat.findById(req.params.id,function(err,chat){
    res.render('pchat',{
      chat:chat,
      chats:chat.msg,
      user:req.user,
      errors:errors
    });
  });*/


router.post('/new',ensureAuthenticated,function(req,res){
  var query={username:req.body.rname};
  var flag=true;
  User.find(query,function(err,user1){
      Chat.find({},function(err,chat1){
    if(typeof user1[0] === "undefined"){
      req.flash('danger','Reciever ID not found');
      res.redirect('/chats/');
      flag=false;
    }
    if(req.body.rname === req.user.username){
      req.flash('danger','Enter valid ID');
      res.redirect('/chats/');
      flag=false;
    }
    for(var i=0;i<chat1.length;i++){
      if(chat1[i].id1===req.body.rname && chat1[i].id2===req.user.username || chat1[i].id2===req.body.rname && chat1[i].id1===req.user.username){
        req.flash('danger','Connection already Exists');
        res.redirect('/chats/');
        flag=false;
        break;
      }
    }
    if(flag==true){
      var chat = new Chat();
      chat.id1=req.user.username,
      chat.id2=req.body.rname,
      chat.msg=[{
        name:"NodeKb",
        message:"Now you are connected",
        date:1/1/1990
      }]
      chat.save(function(err){
        if(err){
        console.log(err);
        return;
      }
      else{
        req.flash('success','Connected');
        res.redirect('/chats/');
      }
      });
}
});
});
});

/*router.post("/:id",function(req,res){
  console.log(req.body);
  var query ={_id:req.params.id};

  Chat.updateOne(query,{$push:{msg:req.body}},function(err){
    if(err){
    res.sendStatus(500);
    return;
  }
  else{
    //res.sendStatus(200);
    Chat.findById(req.params.id,function(err,chat){
      res.render('pchat',{
        chat:chat,
        chats:chat.msg,
        user:req.user,
        errors:errors
      });
    });
  }
});
});*/

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
