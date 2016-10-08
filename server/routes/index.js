var express = require('express');
var router = express.Router();
var https = require('https');
var settings = require('../settings');

var User = require('../models/user.js');
var Visitor = require('../models/visitor.js');
var Host = require('../models/host.js');

var appUser = require('../models/appUser.js');
var companyModel = require('../models/company.js');
var invitations = require('../models/tests.js');
var qr = require('qr-image');
var fs = require("fs");
var ObjectID = require('mongodb').ObjectID;

var WechatAPI = require('wechat-api');
var wapi = new WechatAPI(settings.appid, settings.secret);

	/* 主页. */
	router.get('/', function (req, res) {
	    res.render('index');
	});

	/* 网页授权. */
	router.get('/login', function (req_p, res) {
	    var code = req_p.query.code;

	    if(!code){
	    	return res.render('tips',{message:'未在正确的终端打开。'});
	    }

	    getAccesstoken(req_p, res, code,callback);

	    function callback(user){
	 		res.render('login', {
			   headimgurl: user.headimgurl,
			   nickname: user.nickname,
			   realName: user.realName,
			   company: user.company,
		    });
	    }
	});

	router.post('/login', checkLogin);
	router.post('/login', function (req, res) {
	  var openid = req.session.user.openid;

	  // 身份不能固定，快递员既可以是访问者又可以是接待者
	  var company = req.body.company;
	  var realName = req.body.realName;
	  console.log('post:'+openid);
	  User.update(openid,company,realName, function (err) {
	  	if(err){
	  		console.log(err);
	  		res.render('tips',{message:err});
	  		return;
	  	}
	  	 res.render('tips',{message:'提交成功'});
	  	 return;
	    res.redirect('/');
	  });
	});

	router.get('/host', function (req_p, res) {
		var code = req_p.query.code;

	    if(!code){
	    	return res.render('tips',{message:'host:未在正确的终端打开。'});
	    }
	    getAccesstoken(req_p,res,code,callback);

	    function callback(user){
			Host.getall(user.openid,function(err,docs){
				res.render('host',{
					visitors:docs
				});
			});
	    }
	});

	router.get('/visitor', function (req_p, res) {
		var code = req_p.query.code;

	    if(!code && !req_p.session && !req_p.session.user){
	    	return res.render('tips',{message:'visitor:未在正确的终端打开。'});
	    }

	    if(req_p.session && req_p.session.user){
	    	Visitor.getall(req_p.session.user.openid,function(err,docs){
				res.render('visitor',{
					visitors:docs
				});
			});
	    }else{
	    	getAccesstoken(req_p,res,code,callback);

			function callback(user){
				Visitor.getall(user.openid,function(err,docs){
					res.render('visitor',{
						visitors:docs
					});
				});
		    }
	    }
	});

	router.post('/visitor', checkLogin);
	router.post('/visitor', function(req, res){
		var openid = req.session.user.openid;

		var company = req.body.company;
		var notes = req.body.notes;

		var visitor = new Visitor({
		             openid : req.session.user.openid,
		             realName : req.session.user.realName,
		             headimgurl : req.session.user.headimgurl,
		             visitorCompany : req.session.user.company,

		             company : company,
		             hostname :'',

  					 applytime : '',
  					 datetime : '',

  					 notes :notes,

  					 state:0 // 0:申请，1:已到
		        });

		        //如果不存在则新增用户
		        visitor.save(function (err, user) {
		          if (err) {
		              console.log('save user error!');
		          }else{
		          	  Host.getbycompanyname(company,function(err,users){
		          	  		if (err) {
					              console.log('save user error!');
					        }
					        users.forEach(function(user, index){
					        	var text = req.session.user.realName+'要访问你，并说：' + notes;
					        	wapi.sendText(user.openid, text, function(err,info){
					        		console.log('有人要访问你的消息发布出去！');
  								});
					        });
		          	  });
		          	  res.redirect('/visitor');
		          }
		        });
	});

	router.get('/visitordetail', function (req, res) {
		  var _id = req.query._id;
		  var company = req.query.company;
		  console.log(company);
		  res.render('visitordetail', {
		    _id: _id,
		    company:company
		  });
	});

	router.post('/visitordetail', checkLogin);
	router.post('/visitordetail', function (req, res) {
		var _id = req.body._id;
		var company = req.body.company;
		Host.updateState(_id, function (err, user) {
		    console.log('err:'+err);

		    Host.getbycompanyname(company,function(err,users){
		     if (err) {
		         console.log('已经到了 err!'+err);
			  }
			  users.forEach(function(user, index){
			  	var text = req.session.user.realName+'已经到了,赶紧接待吧！';
			  	wapi.sendText(user.openid, text, function(err,info){
			  		console.log('有人已经到了的消息发布出去！');
	  			});
			  });
			});
			res.redirect('/visitor');
	  	});
		//res.redirect('/visitor');
	});



	function checkLogin(req, res, next) {
	  if (!req.session.user) {
	    return res.render('tips',{message:'请在微信中打开此链接'});
	  }
	  next();
	}

	// 获取access_token
	function getAccesstoken(req_p,res,code,callback){
	    	var path = '/sns/oauth2/access_token?appid='+settings.appid+'&secret='+settings.secret+'&code='+code+'&grant_type=authorization_code';
		    var url ='https://api.weixin.qq.com'+ path;

		    // 请求access token
			var req = https.get(url, function(ires){ // auto req.end();
			    ires.setEncoding('utf8');
			    ires.on('data', function(data){
			    	// 刷新
			    	var dadaArr = JSON.parse(data);
			    	console.log('re_uu:'+dadaArr.refresh_token);
			        refreshToken(req_p,res,dadaArr,callback);
			    });
			    ires.on('error', function(err){
			    	console.log('ires error');
			    });
			}).on('error', function(err){
			    console.log('REQUEST ERROR: ' + err);
			});
	    }

	// 刷新token
	function refreshToken(req_p,res,data,callback){
		console.log('re:'+data.refresh_token);
	    var path = '/sns/oauth2/refresh_token?appid='+settings.appid+'&grant_type=refresh_token&refresh_token='+data.refresh_token;
		var url ='https://api.weixin.qq.com'+path;
		console.log(url);
		var req = https.get(url, function(tokenres){ // auto req.end();
		    tokenres.setEncoding('utf8');
		    tokenres.on('data', function(tokeninfo){
		        var tokeninfo = JSON.parse(tokeninfo);
		        User.get(tokeninfo.openid,function(err, user){
		        	if(err || !user){
		        		requestUserinfo(req_p,res,tokeninfo,callback);
		        	}else{
		        	   req_p.session.user = user;
		        	   console.log('refresh_token-i:'+ user.identity);
		        	   callback(user);
		        	}
		        });
		    });
		    tokenres.on('error', function(err){
		    	console.log('tokenres error');
		    });
		}).on('error', function(err){
		    console.log('REQUEST ERROR: ' + err);
		});
	}

	// 获取用户信息
	function requestUserinfo(req_p,res,chunk,callback){
        var path = '/sns/userinfo?access_token='+chunk.access_token+'&openid='+chunk.openid+'&lang=zh_CN';
		var url ='https://api.weixin.qq.com'+path;

		var req = https.get(url, function(userres){ // auto req.end();
		    userres.setEncoding('utf8');
		    userres.on('data', function(userinfo){
		        console.log(userinfo);
		        var userinfo = JSON.parse(userinfo);
		        var searchUser = new User({
		             openid : userinfo.openid,
		             nickname : userinfo.nickname,
		             sex :userinfo.sex,
		             headimgurl : userinfo.headimgurl,
		             country : userinfo.country,
		             city : userinfo.city,
		             province : userinfo.province,
		             unionid : userinfo.unionid,

		             realName : '',
  					 company: '',

		             password : '', // 密码
		             email : '',//邮箱
		             identity : '' // 身份
		        });

		        //如果不存在则新增用户
		        searchUser.save(function (err, user) {
		          if (err) {
		            console.log('save user error!');
		          }else{
		          	req_p.session.user = user;
		          	console.log('requestUserinfo-i:'+ user.identity);
		          	callback(user);
		          }
		        });
		    });
		    userres.on('error', function(err){
		    	console.log('userres error');
		    });
		}).on('error', function(err){
		    console.log('REQUEST ERROR: ' + err);
		});
	}

module.exports = router;
