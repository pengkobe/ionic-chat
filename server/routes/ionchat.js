var express = require('express');
var router = express.Router();
var https = require('https');
var settings = require('../settings');

var UserModel = require('../models/user.js');
var GroupModel = require('../models/group.js');

// 生成身份二维码
var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;

// 注册
router.post('/register', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var UserEntity = new UserModel({ username: username, password: password });
  UserEntity.save(function(err,doc){
    if(err){
      console.log(err)
    }
      console.log(doc)
     res.json({ user: doc });
  });
});


// 登录
router.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var UserEntity = new UserModel({ username: username, password: password });
  UserEntity.login(function (err, user) {
    res.json({ user: user });
  });
});

// 用户头像上传
router.post('/user/headimg', function (req, res) {
	var userid = req.body.userid;
	var imgData = req.body.imgData;
	// 过滤data:URL,已经在前端过滤
	// var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
	var dataBuffer = new Buffer(imgData, 'base64');
	// 头像存储路径[相对路径]
	var imgPath = '../public/headimg/' + userid + '.png';
	fs.writeFile(imgPath, dataBuffer, function (err) {
		if (err) {
			res.send(err);
		} else {
			res.send("保存成功！");
		}
	});
});


// 更新密码
router.post('/update', function (req, res) {
  var username = req.body.username;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;
  // 删除所有好友了:(,new表示返回更新后的值
  UserModel.findOneAndUpdate(
    { username: username, password: oldpassword },
    { $set: { password:newpassword } }, 
    { new: true },
    function (err, raw) {        
      if (err) {
        // todo
      }
      console.log('ret:', raw);
    });
});


// 拉取好友列表
router.post('/loadfriends', function (req, res) {
   var username = req.body.username;
    UserModel.loadFriends(username,function(friends){
      	res.send(friends);
    })
});

// 拉取群列表
router.post('/loadgroups', function (req, res) {

});

// 拉取好友请求
router.post('/loadfriendrequest', function (req, res) {

});

// 拉取好友进群请求
router.post('/loadgrouprequesst', function (req, res) {

});

// 添加好友请求
router.post('/addfriend', function (req, res) {

});

// 添加好友进群
router.post('/addgroupmember', function (req, res) {

});

// 同意/拒绝好友邀请
router.post('/res_addfriend', function (req, res) {

});

// 同意/拒绝进群
router.post('/res_addgroupmember', function (req, res) {

});



// ==========FOR TEST ===========
// router.post('/addusers', function (req, res) {

// });

// router.post('/addgroups', function (req, res) {

// });



module.exports = router;
