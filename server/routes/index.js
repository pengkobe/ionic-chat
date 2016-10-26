/* restful api for mobile & web app
*/
var express = require('express');
var router = express.Router();

var _Company = require('../models/company.js');

var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;

// 保存二维码身份图片
function file(name) {
    return fs.createWriteStream('../public/img/' + name);
}

// app:注册
router.post('/reg', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var tel = req.body.tel;
	var company = req.body.company;

	_Company.findByName(company, function (err, doc) {
		if (doc && doc.length > 0) {
			// 身份暂未设置
			var uobj = {
				username: username,
				password: password,
				tel: tel,
				company: doc[0]._id
			};
			var user = new _User(uobj);
			// 二维码内容待究
			var ustr = JSON.stringify(uobj);
			user.save(function (err, doc) {
				if (doc){
					// 生成二维码名片,默认为png
					qr.image(ustr, { type: 'png', ec_level: 'Q', parse_url: false, margin: 1 })
						.pipe(file(doc._id + '.png'));
					// 获取融云token
					_User.getRongyunToken(doc._id,doc.username,'http://chat.info/public/img/favicon.ico',
					function(token){
						user.update({rongyunToken: token }, null);
					});
				}
				res.json({ err: err, info: doc });
			});
		}
	});
});

module.exports = router;
