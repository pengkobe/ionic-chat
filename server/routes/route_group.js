var GroupModel = require('../models/group.js');
var UserModel = require('../models/user.js');

// 拉取群列表
exports.loadgroups = function (req, res) {
    var username = req.body.username;
    UserModel.loadGroups({ username: username }, function (err, users) {
        if (err) {
            console.log('loadgroups err!');
        }
        if (users.length == 0) {
            console.log('no group yet!');
        } else {
            console.log('The first group:', users.groups[0].groupname);
            res.json(users.groups);
        }
    });
}

// 拉取群列表
exports.createGroup = function (req, res) { //成功
    // 创建者
    var username = req.body.username;
    // 群名
    var groupname = req.body.groupname;
    // 初始用户
    var members = req.body.members;
    var groupimg = req.body.groupimg ? req.body.groupimg : '';
    var GroupEntity = new GroupModel({ groupname: groupname, members: members, groupimg: groupimg });
    GroupEntity.save(function (err, doc) {
        console.log(doc)
        if (err) {
            res.json({ state: -1, message: err });
        } else {
            UserModel.addGroup(username, [doc._id], function (err, user) {
                if (err) {
                    res.json({ state: -1, message: err });
                } else {
                    // 需要在这里发起进群请求
                    res.json({ state: 1, group: doc });
                }
            });
        }
    });
}

// 拉取好友进群请求
exports.loadgrouprequesst = function (req, res) { };

// 添加好友进群
exports.addgroupmember = function (req, res) { };

// 同意/拒绝进群
exports.res_addgroupmember = function (req, res) { };
