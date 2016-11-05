var express = require('express');
var router = express.Router();


var route_user = require('./route_user.js');
var route_group = require('./route_group.js');

// 注册
router.post('/register', route_user.register);

// 登录
router.post('/login', route_user.login);

// 用户头像上传
router.post('/user/headimg', route_user.user_headimg);

// 更新密码
router.post('/updatepwd', route_user.updatepwd);

// 拉取好友列表
router.post('/loadfriends', route_user.loadfriends);

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


// ==========FOR TEST ===========
// 加载所有用户
router.post('/loadallusers', function (req, res) {
    UserModel.find()
        .exec(function (err, users) {
            if (err) { }
            if (users.length == 0) {
                console.log('no user yet!');
            } else {
                console.log('The first user:', users[0].username);
                res.json(users);
            }
        });
});

// 加载所有用户
router.post('/loadallgroups', function (req, res) {
    GroupModel.find()
        .exec(function (err, groups) {
            if (err) { }
            if (groups.length == 0) {
                console.log('no group yet!');
            } else {
                console.log('The first group:', groups[0].username);
                res.json(groups);
            }
        });
});


// 添加好友请求
router.post('/addfriend', function (req, res) {
    var username = req.body.username;
    var _ids = req.body._ids.split(";");
    UserModel.addFriend(username, _ids,
        function (err, raw) {
            if (err) {
                // todo
                res.json(err);
            } else {
                res.json(raw);
            }
            console.log('ret:', raw);
        })
});



module.exports = router;
