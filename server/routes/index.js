var express = require('express');
var router = express.Router();
var verify_token = require('../middlewares/verify_token.js');

var route_user = require('./route_user.js');
var route_group = require('./route_group.js');
var jwt_route = require('./jwt.js');

// 生成token
router.post('/register');

// 注册
router.post('/register', route_user.register);

// 登录
router.post('/login', route_user.login);

// 用户头像上传
router.post('/user/headimg', route_user.user_headimg);

// 更新密码
router.post('/updatepwd', route_user.updatepwd);

// 拉取好友列表
router.post('/loadfriends', verify_token,route_user.loadfriends);

// 查询好友列表
router.post('/searchfriends', route_user.searchfriends);

// 拉取群列表
router.post('/loadgroups', route_user.loadgroups);

// 添加好友请求(验证成功)
router.post('/req_addfriend', route_user.req_addfriend);

// 拉取好友请求(验证成功)
router.post('/loadfriendrequest', route_user.loadfriendrequest);


// 同意/拒绝好友邀请
router.post('/res_addfriend', route_user.res_addfriend);



// 创建群
router.post('/creategroup', route_group.createGroup);

// 创建群
router.post('/loadgroupmembers', route_group.loadGroupMembers_);

// 拉取好友进群请求
router.post('/loadgrouprequesst', route_group.loadgrouprequesst);

// 添加好友进群
router.post('/addgroupmember', route_group.addgroupmember);

// 同意/拒绝进群
router.post('/res_addgroupmember', route_group.res_addgroupmember);


module.exports = router;