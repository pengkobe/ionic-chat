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
  UserEntity.save();
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
// 拉取群列表

// 拉取好友请求
// 拉取好友邀请进群请求

// 同意/拒绝好友邀请
// 同意/拒绝进群


module.exports = router;
