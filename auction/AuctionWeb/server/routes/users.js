var express=require("express")
var router=express.Router()
var mongoose=require("mongoose")
var Users=require("../models/users.js")
var sd = require("silly-datetime");
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");//操作文件
var multer = require('multer');//接收图片


var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, './static/img/uploads')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        cb(null,  file.originalname);
     }
 });

var upload = multer({
    storage: storage
});

mongoose.connect('mongodb://127.0.0.1:27017/auction')


mongoose.connection.on('connected',function(){
  console.log("MongoDB connected success.")
})


mongoose.connection.on('error',function(){
  console.log("MongoDB connected fail.")
})

mongoose.connection.on('disconnected',function(){
  console.log("MongoDB connected disconnected.")

})

// 获取所有user的信息
router.get("/users",function(req,res,next){
  Users.find({}, function (err,doc){
    if(err){
      res.json({
        status: '1',
        msg: err.message
      });
    }else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count:doc.length,
          list:doc
        }
      });
    }
  })
})

// 获取某一个用户的信息
router.post("/userdetails",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else {
      res.json({
        status: '0',
        msg: '',
        result: {
          list:user
        }
      });
    }
  })
})

// 用户登录
router.post("/login",(req,res)=>{
  let _user = req.body
  req.user=req.cookies.user;
  Users.findOne({username:_user.usernamelogin},(err,user)=>{
    if(err){
      console.log(err)
    }
    if(!user){
      return res.json({
        list: '该用户未被注册'
      })
    }
    else if(_user.pwdlogin == user.pwd){
      res.cookie("user", _user.usernamelogin, {maxAge : 3000000});
      res.cookie("admin", user.admin, {maxAge : 3000000});
      res.cookie("icon", user.icon, {maxAge : 3000000});
      let data = {
        "username": String,
        "nickname": "",
        "icon": "",
        "age": "",
        "truename": "",
        "company": "",
        "telephone": "",
        "mail": "",
        "usercreatedate": "",
        "admin": false,
        "auctionnews": [],
        "previews": []
      }
      let a = () => {
        // 为什么在这用遍历key 然后delete pwd的值删不掉
        data["username"] = user["username"]
        data["nickname"] = user["nickname"]
        data["icon"] = user["icon"]
        data["age"] = user["age"]
        data["truename"] = user["truename"]
        data["company"] = user["company"]
        data["telephone"] = user["telephone"]
        data["mail"] = user["mail"]
        data["usercreatedate"] = user["usercreatedate"]
        data["admin"] = user["admin"]
        data["auctionnews"] = user["auctionnews"]
        data["previews"] = user["previews"]
        data["_id"] = user["_id"]
        return data
      }
      return res.json({
        list: 'success',
        user:a()
      })
    }
    else if(_user.pwdlogin != user.pwd){
      return res.json({
        list: 'fail'
      })
    }
  })
  // Users.find({username:_user.usernamelogin,pwd:_user.pwdlogin},(err,user)=>{
  //   if(err){
  //     console.log(err)
  //   }
  //   if(user){
  //     return res.json({
  //       list: 'fail',
  //       doc: user
  //     })
  //   }
    // else{
    //   return res.json({
    //     list: 'success'
    //   })
    // }
  // })
})

// 用户注册操作
router.post("/register",(req,res,next)=>{
  let _user = {
    username: req.body.username,
    pwd: req.body.pwd,
    nickname: req.body.nickname,
    age: req.body.age,
    truename: "",
    idCard1: "",
    idCard2: "",
    reason: "...",
    company: req.body.company,
    telephone: req.body.telephone,
    mail: req.body.mail,
    usercreatedate: sd.format(new Date(), 'YYYY-MM-DD HH:mm')
  };
  Users.findOne({username:_user.username},(err,user)=>{
    if(err){
      console.log(err)
    }
    else if(user){
      return res.json({
        list : '用户名已注册',
        doc:user
      });
    }else{
      Users.findOne({nickname:_user.nickname},(err,nickname)=>{
        if(err){
          console.log(err)
        }
        else if(nickname){
          return res.json({
            list : '该昵称已被使用',
            doc:nickname
          });
        }else{
          let user = new Users(_user);
          user.save((err,user)=>{
            if(err){
              console.log(err);
            }else{
              res.json({
                save: '注册成功'
              })
            }
          })
        }
      })
    }
  })
  // new Users(req.body).save((err,doc)=>{
  //   if(err){
  //     console.log(err)
  //   }
  //   else{
  //     res.json({
  //         list: doc
  //     })
  //   }
  // })
})

router.post("/ChangePwd",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(req.body.newPwd1 !== req.body.newPwd2){
      return res.json({
        status: '1003'
      })
    }else {
      if(req.body.oldPwd == user.pwd){
        Users.update({username:req.body.username},{$set:{pwd:req.body.newPwd1}},(err,user)=>{
          if(err){
            console.log(err)
          }else{
            return res.json({
            status: '1001'
            })
          }
        })
      }else{
        return res.json({
          status: '1002'
        })
      }
    }
  })
})

router.post("/edit/nickname",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.nickname == req.body.nickname){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{nickname:req.body.nickname}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/age",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.age == req.body.age){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{age:req.body.age}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/truename",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.truename == req.body.truename){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{truename:req.body.truename}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/company",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.company == req.body.company){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{company:req.body.company}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/telephone",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.telephone == req.body.telephone){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{telephone:req.body.telephone}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/mail",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.mail == req.body.mail){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{mail:req.body.mail}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/icon",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.icon == req.body.icon){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{icon:req.body.icon}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/reason",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else if(user.reason == req.body.reason){
      return res.json({
        status: '1003'
      })
    }else {
      Users.update({username:req.body.username},{$set:{reason:req.body.reason}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/edit/idcard1",function(req,res,next){
  let _info = req.body
  let infoid = ObjectID(_info._id)
  Users.update({_id:infoid},
    {$set:{idCard1:req.body.idCard1}},(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message
      });
    }else {
      res.json({
        status: '1001',
      });
    }
  })
})

router.post("/edit/idcard2",function(req,res,next){
  let _info = req.body
  let infoid = ObjectID(_info._id)
  Users.update({_id:infoid},
    {$set:{idCard2:req.body.idCard2}},(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message
      });
    }else {
      res.json({
        status: '1001',
      });
    }
  })
})

router.post('/uploads', upload.single('file'), function(req, res, next) {
    // req.file 是 前端表单name=="imageFile" 的文件信息（不是数组）
    fs.rename(req.file.path, "upload/" + req.file.originalname, function(err) {
        if (err) {
            throw err;
        }
        console.log('上传成功!');
    })
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify(req.file));
})

router.post("/users/del",function(req,res,next){
  let delid = ObjectID(req.body.delid)
  Users.findOne({_id:delid}, (err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message
      });
    }else {
      Users.remove({_id:delid},(err,rescult)=>{
        if(err){
          console.log(err)
        }else {
          res.json({
            status: '222'
          })
        }
      })
    }
  })
})

router.post("/users/check",function(req,res,next){
  let userid = ObjectID(req.body.userid)
  Users.findOne({_id:userid}, (err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message
      });
    }else {
      Users.update({_id:req.body.userid},{$set:{isReal:true}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/users/ban",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else {
      Users.update({username:req.body.username},{$set:{isBan:true}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

router.post("/users/unban",function(req,res,next){
  Users.findOne({username:req.body.username},(err,user)=>{
    if(err){
      console.log(err)
    }else {
      Users.update({username:req.body.username},{$set:{isBan:false}},(err,user)=>{
        if(err){
          console.log(err)
        }else{
          return res.json({
          status: '1001'
          })
        }
      })
    }
  })
})

module.exports=router

