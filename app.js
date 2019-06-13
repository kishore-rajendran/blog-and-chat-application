var express = require('express');
var app=express();
var path = require('path');
var mongoose=require('mongoose');
var bodyParser = require('body-parser');
var expressValidator =  require('express-validator');
var flash=require('connect-flash');
var session=require('express-session');
var config=require("./config/database")
var passport=require('passport');

//defaults add it
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(expressValidator());


//connect to the database
mongoose.connect(config.database,{ useNewUrlParser: true });

//make connection variable
var db=mongoose.connection;

//checking connected or not
db.once('open',function(){
  console.log("connected to db");
});

//if there is error thn throw error
db.on('error',function(err){
  console.log(err);
});;

//importing the aricle schema and storing them in a constructor
var Article=require('./models/article');
//settiing the views folder for ejs and making it as view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs')

//pubic folder
app.use(express.static(path.join(__dirname,'public')));

//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
require('./config/passport')(passport);
app.get('*',function(req,res,next){
  res.locals.user = req.user || null;
  next();
});
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
  res.locals.user = req.user || null;
  next();
});


//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
var errors={};
var articles=require('./routes/articles');
var users=require('./routes/users');
var chats=require('./routes/chats');
app.use('/articles',articles);
app.use('/users',users);
app.use('/chats',chats);
//rote for the home page which handles req and res
app.get('/',function(req,res){
  //using article constructor which is connected to db we are finding the values
  Article.find({},function(err,articles){
    if(err){
      console.log(err);
    }
    else{
    res.render('index',{
      title:'Articles',
      articles:articles,
    });
  }
  });
});


//listens to port 3000
app.listen(3000,function(){
  console.log('server started on port 3000');
});
