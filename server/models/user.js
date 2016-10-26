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
  company: { type: objID },
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
  requset_friends: [{}],
  // 被邀请添加好友
  response_friends: [{}],
  // 邀请对方加群
  requset_groups: [{}],
  // 被邀请加群
  response_groups: [{}],
  // 融云token
  rongyunToken: { type: String, default: '' },
  // 设置
  setting: Schema.Types.Mixed
});

var UsersModel = mongoose.model('User', UserSchema);
/**
 * 登录 (methods定义实例方法，依赖与与model实现)
 */
UserSchema.methods.login = function (cb) {
  var md5 = crypto.createHash('md5');
  md5.update(this.password);
  var md5pwd = md5.digest('hex');
  return this.model('User').find({ password: md5pwd, username: this.username }, cb);
}

/**
 * 查找所有好友
 */
UserSchema.statics.loadFriends = function (username, cb) {
  UsersModel.findOne({ username: username })
    .populate('friends')
    .exec(function (err, users) {
      if (err) { }
      if (users.length == 0) {
        console.log('no friend yet!');
      } else {
        console.log('The first friend:', users.friends[0].username);
        cb(users);
      }
    });
}

/**
 * 查找所有群
 */
UserSchema.methods.loadGroups = function (cb) {
  UsersModel.findOne({ username: this.username })
    .populate('groups')
    .exec(function (err, user) {
      if (err) { }
      console.log('The first group:', user.friends[0].username);
    });
}

/**
 * 添加好友
 */
UserSchema.statics.addFriend = function (username, friendid, cb) {
  var query = { username: username };
  UsersModel.findOne(query)
    .exec(function (err, doc) {
      if (doc && doc.length > 0) {
        var friends = [];
        friends.concat(doc.friends);
        // 类型转换
        var friendid = mongoose.Types.ObjectId(friendid);
        friends.push(friendid);
        UserModel.update(
          { username: username },   // condition
          { friends: friends },     // doc
          { multi: false },         // option
          function (err, raw) {     // callback
            if (err) {
              // todo
            }
            console.log('ret:', raw);
          });
      }
    });
}

/**
 * 密码MD5加密
 */
UserSchema.path('password').set(function (rawpwd) {
  var md5 = crypto.createHash('md5');
  md5.update(v);
  var pwd = md5.digest('hex');
  return pwd;
});

/**
 * 融云toke(statics定义实例方法，可直接在Model级使用)
 */
UserSchema.statics.getRongyunToken = function (userid, name, headImg, cb) {
  rongcloudSDK.user.getToken(userid, name, headImg,
    function (err, resultText) {
      if (err) {
        console.log('获取融云token err:' + err);
      }
      else {
        var result = JSON.parse(resultText);
        if (result.code === 200) {
          console.log('获取融云token suceess:' + result.token);
          cb(result.token);
        }
      }
    });
}

module.exports = UsersModel;


