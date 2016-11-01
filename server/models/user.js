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

/**
 * 请求添加对方为好友SCHEMA
 */
var Requset_friendSchema = new Schema({
  to: { type: Schema.Types.ObjectId },
  time: { type: Date, default: Date.now },
  state: { type: Number, default: 0 },
});


/**
* 被邀请添加对方为好友SCHEMA
*/
var Response_friendSchema = new Schema({
  from: { type: Schema.Types.ObjectId },
  time: { type: Date, default: Date.now },
  state: { type: Number, default: 0 },
});

/**
* 邀请朋友进群
*/
var Requset_groupSchema = new Schema({
  to: { type: Schema.Types.ObjectId },
  groupid: { type: Schema.Types.ObjectId },
  time: { type: Date, default: Date.now },
  state: { type: Number, default: 0 },
});

/**
* 被邀请进群
*/
var Response_groupSchema = new Schema({
  from: { type: Schema.Types.ObjectId },
  groupid: { type: Schema.Types.ObjectId },
  time: { type: Date, default: Date.now },
  state: { type: Number, default: 0 },
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
UserSchema.methods.loadGroups = function (cb) {
  this.findOne({ username: username })
    .populate('groups')
    .exec(cb);
}

/**
 * 添加好友
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Function} cb 回调函数
 */
UserSchema.statics.addFriend = function (username, friendid, cb) {
  var that = this;
  var mongoose_ids = [];
  // 类型转换
  for (var i = 0; i < _ids.length; i++) {
    if (_ids[i] && _ids[i] != "") {
      mongoose_ids.push(mongoose.Types.ObjectId(_ids[i]));
    }
  }

  var query = { username: username };
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
        that.update(
          { username: username },   // condition
          { friends: friends },     // doc
          { multi: true },          // option
          cb                        // callback
        );
      } else {
        console.log('addfriend 0 ret:', doc);
      }
    });
}

/**
 * 更新好友请求状态
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Object} state 状态[ 0:待确认 | 1:成为好友 ]
 */
UserSchema.statics.updateResponse_friendDoc = function (username, friendid, state) {
  this.update({ username: username, "response_friends.from": friendid },
    { $set: { "response_friends.$.state": state } })
}


/**
 * queryRequset_friendsDoc [查找请求好友状态]
 * @param {Object} username 用户名
 * @param {Function} cb 回调函数 
 */
function queryRequset_friendsDoc(username, cb) {
  var query = { username: username };
  this.find(query)
    .exec(function (err, requset_friends) {
      requset_friends.find()
        .populate('to')
        .exec(function (err, docs) {
          if (err) return console.log(err);
          console.log('addRequset_friendsDoc Success!');
          cb(docs)
        });
    });
}

/**
 * addRequset_friendsDoc [添加请求好友状态]
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Function} cb 回调函数 
 */
function addRequset_friendsDoc(username, friendid, cb) {
  var query = { username: username };
  this.find(query)
    .exec(function (err, doc) {
      // doc.requset_friends.create({ to: friendid, state: 0 }); // 简便方法
      // parent.children.id(id).remove(); // 删除
      doc.requset_friends.unshift({ to: friendid, state: 0 });
      var subdoc = doc.requset_friends[0];
      subdoc.isNew;
      doc.save(function (err) {
        if (err) return console.log(err);
        console.log('Success!');
      })
    });
}

/**
 * updateRequset_friendsDoc [更新请求好友状态]
 * @param {Object} username 用户名
 * @param {Object} friendid 好友编号
 * @param {Object} state 状态[ 0:待确认 | 1:成为好友 ]
 */
UserSchema.statics.updateRequset_friendsDoc = function (username, friendid, state) {
  this.update({ username: username, "requset_friends.to": friendid },
    { $set: { "requset_friends.$.state": state } })
}

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

// must put it there or won't found any methods
var UsersModel = mongoose.model('User', UserSchema);
module.exports = UsersModel;


