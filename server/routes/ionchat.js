var express = require('express');
var router = express.Router();
var https = require('https');
var settings = require('../settings');

var _User = require('../models/user.js');
var _Group = require('../models/group.js');

// 生成身份二维码
var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;

// 注册
// 登录
router.post('/login', checkLogin);
router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    _User.login(username, password, function (err, user) {
		res.json({ user: user });
	});
});

// 拉取好友列表
// 拉取群列表

// 拉取好友请求
// 拉取好友邀请进群请求

// 同意/拒绝好友邀请
// 同意/拒绝进群


module.exports = router;
