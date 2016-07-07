/* restful api for mobile & web app
*  session用不上，需要改变验证方式
*/
var express = require('express');
var router = express.Router();

var chatUser = require('../models/chatUser.js');
var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;

// 保存二维码身份图片
function file(name) {
    return fs.createWriteStream('../public/img/' + name);
}

// app:注册,[todo:短信注册]
router.post('/reg', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	// 可用于短信验证
	var tel = req.body.tel;
	// 身份暂未设置
	var uobj = {
		username: username,
		password: password,
		tel: tel
	};
	
	var user = new chatUser(uobj);
	console.log('user:' + user);
	// 二维码内容待究
	var ustr = JSON.stringify(uobj);
	user.save(function (err, user) {
		console.log('save:' + user);
		if (user) {
			// 生成二维码名片,默认为png
			qr.image(ustr, { type: 'png', ec_level: 'Q', parse_url: false, margin: 1 })
				.pipe(file(user._id + '.png'));
			// 获取融云token
			console.log('获取融云token开始...id:' + user._id + ' username:' + user.username);
			chatUser.getRongyunToken(user._id, user.username, 'http://yipeng.info/public/img/favicon.ico',
				function (token) {
					console.log('token:' + token);
					user.update({ rongyunToken: token }, null);
				});
		}
		res.json({ err: err, info: user });
	});
});

// app login [短信登录 &&　用户名＼密码登录]
router.post('/login', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	chatUser.login(username, password, function (err, user) {
		res.json({ user: user });
	});
});

// 用户头像上传
router.post('/user/imgupload', function (req, res) {
	var userid = req.body.userid;
	var imgData = req.body.imgData;
	console.log('上传中:' + userid);
	// 过滤data:URL(已经在前端过滤)
	// var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
	var dataBuffer = new Buffer(imgData, 'base64');
	// 头像存储路径[相对路径]
	var imgPath = '../public/headimg/' + userid + '.png';
	console.log('上传中(path):' + imgPath);
	fs.writeFile(imgPath, dataBuffer, function (err) {
		if (err) {
			res.send(err);
			console.log(err);
		} else {
			console.log("保存成功！");
			res.send("保存成功！");
		}
	});
});

module.exports = router;
