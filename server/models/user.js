/*-----
用户
------*/
var mongoose = require('../db-moogoose');
// 融云
var rongcloudSDK = require('rongcloud-sdk');
rongcloudSDK.init('lmxuhwagxgt9d', 'NpbRLWPxB79');
// 密码加密
var crypto = require('crypto');
var Schema = mongoose.Schema;
var objID = Schema.Types.ObjectId;


/**
 * 请求添加对方为好友SCHEMA
 */
var Requset_friendSchema = new Schema({
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    time: { type: Date, default: Date.now },
    state: { type: Number, default: 0 },
});


/**
 * 被邀请添加对方为好友SCHEMA
 */
var Response_friendSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    time: { type: Date, default: Date.now },
    state: { type: Number, default: 0 },
});

/**
 * 邀请朋友进群
 */
var Requset_groupSchema = new Schema({
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    groupid: { type: Schema.Types.ObjectId, ref: 'Group' },
    time: { type: Date, default: Date.now },
    state: { type: Number, default: 0 },
});

/**
 * 被邀请进群
 */
var Response_groupSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    groupid: { type: Schema.Types.ObjectId, ref: 'Group' },
    time: { type: Date, default: Date.now },
    state: { type: Number, default: 0 },
});

var UserSchema = new Schema({
    // 用户名
    username: { type: String, unique: true },
    // 昵称
    nickname: { type: String, default: '' },
    // 密码
    password: { type: String, default: '' },
    // 头像
    headimg: { type: String, default: '' },
    // 性别
    sex: { type: String, default: '' }, // , enum:['男','女']
    // 年龄
    age: { type: Number, default: 0 }, // , min:12, max:120
    // 公司
    company: { type: String },
    // 手机
    mobile: { type: String, default: '' }, // match: /^1\d{10}$/
    // 邮箱
    email: { type: String, default: '' }, // match: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
    // 加入时间
    createTime: { type: Date, default: Date.now },
    // 签名
    notes: { type: String, default: '' },
    // 微信信息
    wechat: {},
    // 好友
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // 群
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    // 邀请对方添加好友
    requset_friends: [Requset_friendSchema],
    // 被邀请添加好友
    response_friends: [Response_friendSchema],
    // 邀请对方加群
    requset_groups: [Requset_groupSchema],
    // 被邀请加群
    response_groups: [Response_groupSchema],
    // 融云token
    rongyunToken: { type: String, default: '' },
    // 设置
    setting: Schema.Types.Mixed
});




/**
 * 登录 (methods定义实例方法，依赖与与model实现)
 * @param {Function} cb 回调函数
 */
UserSchema.methods.login = function (cb) {
    return this.model('User').find({ password: this.password, username: this.username }, cb);
}
/**
 * 密码MD5加密
 */
UserSchema.path('password').set(function (rawpwd) {
    var md5 = crypto.createHash('md5');
    md5.update(rawpwd);
    var pwd = md5.digest('hex');
    return pwd;
});

/**
 * 查找所有好友
 * @param {Function} cb 回调函数
 */
UserSchema.statics.loadFriends = function (username, cb) {
    this.findOne({ username: username })
        .populate('friends')
        .exec(cb);
}

/**
 * 查找所有群
 * @param {Function} cb 回调函数
 */
UserSchema.statics.loadGroups = function (username, cb) {
    this.findOne({ username: username })
        .populate('groups')
        .exec(function (err, doc) {
            cb(err,doc.groups);
        });
}

/**
 * 添加好友
 * @param {Object} userid 用户编号
 * @param {Array} _ids 好友编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addFriend = function (userid, _ids, cb) {
    var that = this;
    var mongoose_ids = [];
    var query = { _id: userid };

    // 类型转换
    for (var i = 0; i < _ids.length; i++) {
        if (_ids[i] && _ids[i] != "") {
            mongoose_ids.push(mongoose.Types.ObjectId(_ids[i]));
        }
    }
    that.find(query)
        .exec(function (err, doc) {
            if (err) {
                console.log('addfriend err:', err);
                cb(err);
                return;
            }
            if (doc && doc.length > 0) {
                var friends = [];
                // 原有好友
                if (doc.friends) {
                    friends = friends.concat(doc.friends);
                }
                // 新好友
                friends = friends.concat(mongoose_ids);
                console.log('friends:', friends);
                that.update(query,          // condition
                    { friends: friends },   // doc
                    { multi: true },        // option
                    cb                      // callback
                );
            } else {
                console.log('addfriend 0 ret:', doc);
            }
        });
}

/**
 * 添加群组
 * @param {Object} userid 用户编号
 * @param {Object} goup 好友编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addGroup = function (userid, _ids, cb) {
    var that = this;
    var mongoose_ids = [];
    // 类型转换
    for (var i = 0; i < _ids.length; i++) {
        if (_ids[i] && _ids[i] != "") {
            mongoose_ids.push(mongoose.Types.ObjectId(_ids[i]));
        }
    }

    var query = { _id: userid };
    that.find(query)
        .exec(function (err, doc) {
            if (err) {
                console.log('addGroup err:', err);
                cb(err);
                return;
            }
            if (doc && doc.length > 0) {
                var groups = [];
                // 原有群
                if (doc.groups) {
                    groups = groups.concat(doc.groups);
                }
                // 新群
                groups = groups.concat(mongoose_ids);
                console.log('Groups:', groups);
                that.update({ _id: userid }, // condition
                    { groups: groups }, // doc
                    { multi: true }, // option
                    cb // callback
                );
            } else {
                console.log('addGroup 0 ret:', doc);
            }
        });
}

/**
 * addRequset_friendsDoc [添加请求好友状态]
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addResponse_friendsDoc = function (userid, friendid, cb) {
    var query = { _id: userid };
    console.log('xx id:', userid);
    this.findOne(query)
        .exec(function (err, doc) {
            friendid = mongoose.Types.ObjectId(friendid);
            console.log('xx:', doc);
            doc.response_friends.unshift({ from: friendid, state: 0 });
            var subdoc = doc.response_friends[0];
            subdoc.isNew;
            doc.save(cb)
        });
}

/**
 * 更新好友请求状态
 * @param {Object} userid 用户编号
 * @param {Object} friendid 好友编号
 * @param {Object} state 状态[ 0:待确认 | 1:成为好友 ]
 */
UserSchema.statics.updateResponse_friendDoc = function (userid, friendid, state, cb) {
    // var userid = mongoose.Types.ObjectId(userid);
    // var friendid = mongoose.Types.ObjectId(friendid);
    // this.update({ _id: userid, "response_friends.from": friendid }, { $set: { "response_friends.$.state": state } });

    var query = { _id: userid };
    this.findOne(query, function (err, user) {
        console.log("updateResponse_friendDoc", user);
        for (var i = 0; i < user.response_friends.length; i++) {
            if (user.response_friends[i].from == friendid) {
                user.response_friends[i].state = state;
                user.markModified('state');
                user.save(cb);
            }
        }
    });
}

/**
 * queryRequset_friendsDoc [查找请求好友状态]
 * @param {Object} username 用户名
 * @param {Function} cb 回调函数
 */
// UserSchema.statics.queryRequset_friendsDoc = function (username, cb) {
//     var query = { username: username };
//     this.find(query)
//         .exec(function (err, requset_friends) {
//             requset_friends.find()
//                 .populate('to')
//                 .exec(function (err, docs) {
//                     if (err) return console.log(err);
//                     console.log('addRequset_friendsDoc Success!');
//                     cb(docs)
//                 });
//         });
// }

/**
 * addRequset_friendsDoc [添加请求好友状态]
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addRequset_friendsDoc = function (username, rawfriendid, cb) {
    var that = this;
    var query = { username: username };
    that.findOne(query)
        .exec(function (err, doc) {
            // doc.requset_friends.create({ to: friendid, state: 0 }); // 简便方法
            // parent.children.id(id).remove(); // 删除
            friendid = mongoose.Types.ObjectId(rawfriendid);
            if (doc && doc.requset_friends) {
                doc.requset_friends.unshift({ to: friendid, state: 0 });
                var subdoc = doc.requset_friends[0];
                subdoc.isNew;
                doc.save(function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        that.addResponse_friendsDoc(rawfriendid, doc._id, cb)
                    }
                })
            } else {
                cb("no none like" + username);
            }
        });
}

/**
 * updateRequset_friendsDoc [更新请求好友状态]
 * @param {Object} userid 用户编号
 * @param {Object} friendid 好友编号
 * @param {Object} state 状态[ 0:待确认 | 1:成为好友 ]
 */
UserSchema.statics.updateRequset_friendsDoc = function (userid, friendid, state, cb) {
    // var userid = mongoose.Types.ObjectId(userid);
    // var friendid = mongoose.Types.ObjectId(friendid);
    // this.update({ _id: userid, "requset_friends.to": friendid }, { $set: { "requset_friends.$.state": state } })
    var query = { _id: userid };
    this.findOne(query, function (err, user) {
        console.log("updateRequset_friendsDoc", user);
        for (var i = 0; i < user.requset_friends.length; i++) {
            if (user.requset_friends[i].to == friendid) {
                user.requset_friends[i].state = state;
                user.markModified('state');
                user.save(cb);
            }
        }
    });
}

//===================
/**
 * addResponse_groupDoc [添加请求好友进群状态]
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addResponse_groupDoc = function (userid, friendid, groupid, cb) {
    var query = { _id: userid };
    console.log('addRequset_groupDoc id:', userid);
    this.findOne(query)
        .exec(function (err, doc) {
            friendid = mongoose.Types.ObjectId(friendid);
            groupid = mongoose.Types.ObjectId(groupid);
            console.log('addRequset_groupDoc:', doc);
            doc.response_groups.unshift({ from: friendid, groupid: groupid, state: 0 });
            var subdoc = doc.response_groups[0];
            subdoc.isNew;
            doc.save(cb)
        });
}

/**
 * updateResponse_groupDoc 更新群组请求回复状态
 * @param {Object} userid 用户编号
 * @param {Object} friendid 好友编号
 * @param {Object} groupid 群编号
 * @param {Object} state 状态[ 0:待确认 | 1:成为好友 ]
 */
UserSchema.statics.updateResponse_groupDoc = function (userid, friendid, groupid, state, cb) {
    var query = { _id: userid };
    this.findOne(query, function (err, user) {
        console.log("updateResponse_groupDoc", user);
        for (var i = 0; i < user.response_groups.length; i++) {
            if (user.response_groups[i].from == friendid && user.response_groups[i].groupid == groupid) {
                user.response_groups[i].state = state;
                user.markModified('state');
                user.save(cb);
            }
        }
    });
}


/**
 * addRequset_groupsDoc [添加请求群组状态]
 * @param {Object} userid 用户名
 * @param {Object} friendid 好友编号
 * @param {Object} rawgroupid 群编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addRequset_groupsDoc = function (userid, rawfriendid, rawgroupid, cb) {
    var that = this;
    var query = { _id: userid };
    that.findOne(query)
        .exec(function (err, doc) {
            var friendid = mongoose.Types.ObjectId(rawfriendid);
            var groupid = mongoose.Types.ObjectId(rawgroupid);
            if (doc && doc.requset_groups) {
                doc.requset_groups.unshift({ to: friendid, groupid: groupid, state: 0 });
                var subdoc = doc.requset_groups[0];
                subdoc.isNew;
                doc.save(function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        that.addResponse_groupDoc(rawfriendid, doc._id, rawgroupid, cb)
                    }
                })
            } else {
                cb("addRequset_groupsDoc no one id is like:" + userid);
            }
        });
}

/**
 * updateRequset_groupsDoc [更新请求好友入群状态]
 * @param {Object} userid 用户编号
 * @param {Object} friendid 好友编号
 * @param {Object} groupid 群编号
 * @param {Function} cb 回调函数
 * @param {Object} state 状态[ 0:待确认 | 1:成为好友 ]
 */
UserSchema.statics.updateRequset_groupDoc = function (userid, friendid, groupid, state, cb) {
    var query = { _id: userid };
    this.findOne(query, function (err, user) {
        console.log("updateRequset_groupsDoc", user);
        for (var i = 0; i < user.requset_groups.length; i++) {
            if (user.requset_groups[i].to == friendid && user.requset_groups[i].groupid == groupid) {
                user.requset_groups[i].state = state;
                user.markModified('state');
                user.save(cb);
            }
        }
    });
}

/**
 * 融云toke(statics定义实例方法，可直接在Model级使用)
 */
UserSchema.statics.getRongyunToken = function (userid, name, headImg, cb) {
    rongcloudSDK.user.getToken(userid, name, headImg,
        function (err, resultText) {
            if (err) {
                console.log('获取融云token err:' + err);
            } else {
                var result = JSON.parse(resultText);
                if (result.code === 200) {
                    console.log('获取融云token suceess:' + result.token);
                    cb(result.token);
                }
            }
        });
}

// must put it there or won't found any methods
var UsersModel = mongoose.model('User', UserSchema);
module.exports = UsersModel;
