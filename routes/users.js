var express=require('express');
var router=express.Router();
var bcrypt=require('bcryptjs');
var passport=require('passport');
var User=require('../models/user');

//reg form
var errors={};
router.get('/register',function(req,res){
  res.render('register',{
    errors:errors
  });
});
//register
router.post('/register',function(req,res){
  var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
  var password=req.body.password;
  var password2=req.body.password2;
  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Email is invalid').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','Password is mismatched').equals(req.body.password);
  var errors = req.validationErrors();
  User.find({},function(err,user1){
  for(var i=0;i<user1.length;i++){
  if(user1[i].username===username){
    errors=[{msg:"Username already exist"}];
  }
}
if(password.length<8){
  errors=[{msg:"Password must be more than 8 characters"}];
}
  if(errors){
    res.render('register',{
      errors:errors,
      user:false
    });
  }
  else{
    var newUser= new User({
      name:name,
      email:email,
      username:username,
      password:password
    });
    bcrypt.genSalt(10,function(err,salt){
      bcrypt.hash(newUser.password,salt,function(err,hash){
        if(err){
          console.log(err);
        }
        newUser.password=hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          }
          else{
            req.flash('success','Registration successful');
            res.redirect('/users/login');
          }
        });
      });
    });
  }});
});

router.get('/login',function(req,res){
  res.render('login',{
    errors:errors
  });
});

//login
router.post('/login',function(req,res,next){
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});

//Logout

router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','Logged out');
  res.redirect('/users/login');
});

module.exports = router;
