var UserModel = require('../models/user.js');
var GroupModel = require('../models/group.js');

// 生成身份二维码
var qr = require('qr-image');
var fs = require("fs");

function file(name) {
    return fs.createWriteStream('../public/img/' + name);
}


// 注册
exports.register = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var nickname = req.body.nickname;
    var headimg = req.body.headimg ? req.body.headimg : '';
    var UserEntity = new UserModel({
        username: username,
        password: password,
        nickname: nickname,
        headimg: headimg
    });
    UserEntity.save(function (err, doc) {
        console.log(doc)
        // 生成二维码名片,默认为png
        // var ustr = JSON.stringify(doc);
        // qr.image(ustr, { type: 'png', ec_level: 'Q', parse_url: false, margin: 1 })
        //   .pipe(file(doc._id + '.png'));
        if (err) {
            res.json({ state: -1, message: err });
        } else {
            res.json({ state: 1, user: doc });
        }
    });
}

// 登录
exports.login = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log('login username:', this.username);
    console.log('login password:', this.password);

    var UserEntity = new UserModel({ username: username, password: password });
    UserEntity.login(function (err, users) {
        if (err) {
            res.json({ state: -1, message: err });
        }
        console.log('login users:', users);
        if (users.length == 0) {
            res.json({ state: -1, message: "账户或密码错误！" });
        } else {
            res.json(users[0]);
        }
    });
}

// 用户头像上传
exports.user_headimg = function (req, res) {
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
}


// 更新密码
exports.updatepwd =  function(req, res) {
    var username = req.body.username;
    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;
    // 删除所有好友了:(,new表示返回更新后的值
    UserModel.findOneAndUpdate({ username: username, password: oldpassword }, { $set: { password: newpassword } }, { new: true },
        function (err, raw) {
            if (err) {
                // todo
            }
            console.log('ret:', raw);
        });
}


// 拉取好友列表
exports.loadfriends =  function (req, res) {
    var username = req.body.username;
    UserModel.loadFriends(username, function (err, users) {
        if (err) {
            console.log('loadfriends err!');
        }
        if (users.length == 0) {
            console.log('no friend yet!');
        } else {
            console.log('The first friend:', users.friends[0].username);
            res.json(users);
        }
    })
}

// 添加好友请求(验证成功)
exports.req_addfriend =  function (req, res) {
    var username = req.body.username;
    var friendid = req.body.friendid;
    UserModel.addRequset_friendsDoc(username, friendid,
        function (err, raw) {
            if (err) {
                // todo
                res.json(err);
            } else {
                res.json(raw);
            }
            console.log('ret:', raw);
        })
}

// 拉取好友请求(验证成功)
exports.loadfriendrequest =function (req, res) {
    var username = req.body.username;
    UserModel.findOne({ username: username })
        .exec(function (err, user) {
            if (err) {
                console.log('loadfriendrequest err!');
            }
            if (user.length == 0) {
                console.log('username no exist!');
            } else {
                var opts = [{
                    path: 'response_friends.from',
                    model: 'User'
                }];

                UserModel.populate(user, opts, function (err, populatedDocs) {
                    res.json(populatedDocs)
                });
            }
        });
}


// 同意/拒绝好友邀请
exports.res_addfriend =function (req, res) {

}
