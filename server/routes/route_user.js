var UserModel = require('../models/user.js');
var GroupModel = require('../models/group.js');

// 生成身份二维码
var qr = require('qr-image');
var fs = require("fs");

function file(name) {
    return fs.createWriteStream('../public/img/' + name);
}

// 注册
exports.register = function(req, res) {
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
    UserEntity.save(function(err, doc) {
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
exports.login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log('login username:', this.username);
    console.log('login password:', this.password);

    var UserEntity = new UserModel({ username: username, password: password });
    UserEntity.login(function(err, users) {
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
exports.user_headimg = function(req, res) {
    var userid = req.body.userid;
    var imgData = req.body.imgData;
    // 过滤data:URL,已经在前端过滤
    // var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(imgData, 'base64');
    // 头像存储路径[相对路径]
    var imgPath = '../public/headimg/' + userid + '.png';
    fs.writeFile(imgPath, dataBuffer, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send("保存成功！");
        }
    });
}

// 更新密码
exports.updatepwd = function(req, res) {
    var username = req.body.username;
    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;
    // 删除所有好友了:(,new表示返回更新后的值
    UserModel.findOneAndUpdate({ username: username, password: oldpassword }, { $set: { password: newpassword } }, { new: true },
        function(err, raw) {
            if (err) {
                // todo
            }
            console.log('ret:', raw);
        });
}

// 拉取好友列表
exports.loadfriends = function(req, res) {
    var username = req.body.username;
    UserModel.loadFriends(username, function(err, users) {
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

// 拉取群列表
exports.loadgroups = function(req, res) {
    var username = req.body.username;
    UserModel.loadGroups(username, function(err, groups) {
        if (err) {
            console.log('loadgroups err!');
            res.json('loadgroups err!');
        }
        if (groups.length == 0) {
            console.log('no group yet!');
            res.json('no group yet!');
        } else {
            var opts = [{
                path: 'members',
                model: 'User'
            }];
            GroupModel.populate(groups, opts, function(err, populatedDocs) {
                res.json(populatedDocs)
            });
            // console.log('The first group:', users.groups[0].groupname);
            // res.json(users.groups);
        }
    });
}

// 添加好友请求(验证成功)
exports.req_addfriend = function(req, res) {
    var username = req.body.username;
    var friendid = req.body.friendid;
    UserModel.addRequset_friendsDoc(username, friendid,
        function(err, raw) {
            if (err) {
                // todo
                res.json(err);
            } else {
                res.json(raw);
            }
            console.log('ret:', raw);
        });
}

// 拉取好友请求(验证成功)
exports.loadfriendrequest = function(req, res) {
    var username = req.body.username;
    UserModel.findOne({ username: username })
        .exec(function(err, user) {
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

                UserModel.populate(user, opts, function(err, populatedDocs) {
                    res.json(populatedDocs.response_friends)
                });
            }
        });
}


// 同意/拒绝好友邀请
exports.res_addfriend = function(req, res) {
    var userid = req.body.userid;
    var friendid = req.body.friendid;
    var state = req.body.state;
    console.log("userid", userid);
    console.log("friendid", friendid);
    console.log("state", state);
    // 添加好友(此用法可能是循环锁还是咋的，会失败)
    // UserModel.addFriend(userid, [friendid], function (err, doc) {
    //     if (err) {
    //         res.json(err);
    //     } else {
    //         // 添加好友
    //         UserModel.addFriend(friendid, [userid], function (err, doc) {
    //             if (err) {
    //                 res.json(err);
    //             } else {
    //                 // 更新回复状态
    //                 UserModel.updateResponse_friendDoc(userid, friendid, state, function (err, doc) {
    //                     if (err) {
    //                         res.json(err);
    //                     } else {
    //                         // 更新请求状态
    //                         UserModel.updateRequset_friendsDoc(friendid, userid, state, function (err, doc) {
    //                             if (err) {
    //                                 res.json(err);
    //                             } else {
    //                                 res.json({ message: "succeed!" });
    //                             }
    //                         });
    //                     }
    //                 });
    //             }

    //         });
    //     }
    // });
    // 同意添加为好友，则互相加为好友
    if (state == 1 || state == "1") {
        UserModel.addFriend(userid, [friendid], function(err, doc) {
            if (err) {
                res.json(err);
            } else {

            }
        });
        // 添加好友
        UserModel.addFriend(friendid, [userid], function(err, doc) {
            if (err) {
                res.json(err);
            } else {
            }

        });
    }

    // 更新回复状态
    UserModel.updateResponse_friendDoc(userid, friendid, state, function(err, doc) {
        if (err) {
            res.json(err);
        } else {
        }
    });
    // 更新请求状态
    UserModel.updateRequset_friendsDoc(friendid, userid, state, function(err, doc) {
        if (err) {
            res.json(err);
        } else {

        }
    });

    setTimeout(function() { res.json({ message: "succeed!" }); }, 1500);
}
