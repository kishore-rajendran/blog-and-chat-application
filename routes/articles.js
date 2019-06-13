var express=require('express');
var router=express.Router();

var Article=require('../models/article');
var User=require('../models/user');
var errors={};

// Edit
router.get('/edit/:id',ensureAuthenticated,function(req,res){
  Article.findById(req.params.id,function(err,articles){
    if(articles.author!=req.user.id){
      req.flash('danger','Not Athorized');
      res.redirect('/');
    }else{
    res.render('edit_article',{
      title : "Edit",
      articles:articles,
      errors:errors
    });
    }
  });
});

//post the edit_article
router.post('/edit/:id',function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  //get error
  var errors=req.validationErrors();
  if(errors){
    Article.findById(req.params.id,function(err,articles){
      res.render('edit_article',{
        title : "Edit",
        articles:articles,
        errors:errors
      });
  });
}
  else{
  var article = {};
  article.title = req.body.title;
  article.body = req.body.body;

  var query ={_id:req.params.id}

  Article.updateOne(query,article,function(err){
    if(err){
    console.log(err);
    return;
  }
  else{
    req.flash('success','Article updated');
    res.redirect('/');
  }
});
}
});



//add route
router.get('/add',ensureAuthenticated,function(req,res){
  //var errors={};
  res.render('add',{
    title:'Addes page',
    errors:errors
  });
});

//form submit route
router.post('/add',function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  //get error
  var errors=req.validationErrors();
  if(errors){
    res.render('add',{
      title:'Addes page',
      errors:errors
    });
  }
  else{
    var article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.save(function(err){
      if(err){
      console.log(err);
      return;
    }
    else{
      req.flash('success','Article Added');
      res.redirect('/');
    }
    });
  }
});


//show article msg
router.get('/:id',function(req,res){
  Article.findById(req.params.id,function(err,articles){
    User.findById(articles.author,function(err,user){
      res.render('article',{
        articles:articles,
        author:user.username
    });
    });
  });
});

//Delete
router.delete('/:id',function(req,res){

  if(!req.user._id){
    res.status(500).send();
  }

  var query={_id:req.params.id}

  Article.findById(req.params.id,function(err,articles){
    if(articles.author!=req.user._id){
      res.status(500).send();
    }
    else{
      Article.deleteOne(query,function(err){
        if(err){
          console.log(err);
        }
        res.send("success");
      });
    }
  });
});

//access controls

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
