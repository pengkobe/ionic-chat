var mongoose = require('./db-moogoose');
// 融云
var rongcloudSDK = require('rongcloud-sdk');
rongcloudSDK.init('cpj2xarljnzkn', 'D1f3ELpD3Y74');

var Schema = mongoose.Schema;

var chatUsersSchema = new Schema({
    // 用户编号
    userid: { type: String, unique: true },
    // 用户名,使用电话登录时这个用不着
    username: { type: String },//, unique: true
    // 头像
    headimg: { type: String, default: '' },
    // 融云token
    rongyunToken: { type: String, default: '' },
    // enum:[0,1]
    isActivated: { type: Number, default: 0 }
});

// 融云toke
chatUsersSchema.statics.getRongyunToken = function (userid, username, headImg, cb) {
    var that = this;
    // 第一步，查询有没有
    that.find({ userid: userid }, function (err, user) {
        console.log(user);
        if (!user || user.length == 0) {
            // username 同步
            // 第二步，从融云获取token
            rongcloudSDK.user.getToken(userid, user.username, headImg, function (err, resultText) {
                if (err) {
                    console.log('获取融云token err:' + err);
                    cb(err, null);
                }
                else {
                    var result = JSON.parse(resultText);
                    if (result.code === 200) {
                        console.log('获取融云token suceess:' + result.token);
                        // 第三步，保存token
                        var chatuser = new chatUsersModel({
                            userid: userid,
                            username: username,
                            headimg: headImg,
                            rongyunToken: result.token,
                            isActivated: 1
                        });
                        chatuser.save(function (err, doc) {
                            if (doc) {
                                cb(null, doc);
                            } else {
                                cb(err, null);
                            }
                        });
                    }
                }
            });
        } else {
            // 同步用户名
            if (username != user[0].username) {
                function updateDB() {
                    var conditions = { userid: userid }
                        , update = { $set: { username: username } }
                        , options = {};
                    that.update(conditions, update, options, function (err, docs) {
                        if (err) {
                            console.log("update user err:" + err);
                        } else {
                            console.log("update user suc:" + docs.username);
                        }
                    });
                }
                // 同步至融云
                rongcloudSDK.user.refresh(userid, username, user[0].headimg, 'json', updateDB);
            }
            cb(null, user[0]);
        }
    });
}

// 查找用户在线状态(使用融云api)
chatUsersSchema.statics.checkOnline = function (userid) {
    rongcloudSDK.user.checkOnline(userid, 'json', function (err, resultText) {
        if (err) {
            console.log('checkOnline err:' + err);
            cb(err, null);
        }
        else {
            var result = JSON.parse(resultText);
            if (result.code === 200) {
                cb(null, result.status);
            } else {
                console.log('checkOnline err CODE:' + result.code);
                cb('checkOnline err CODE:' + result.code, null);
            }
        }
    });
}

// 监听服务端其它事件
chatUsersSchema.statics.monitorEvent = function (io, socket) {
    // var baseUrl = "http://192.168.3.97:8099/";
    // 第一步，getFriends(string UserID)查找已确认好友
    // 第二步，FindFriendsReq(string UserID)查找好友请求|
    // 第三步，getTeams(string UserID) 查找已加入的团队列表
    // 第四步，findTeamsReq(string UserID) 查找团队邀请
}

var chatUsersModel = mongoose.model('chatUsers', chatUsersSchema);

module.exports = chatUsersModel;