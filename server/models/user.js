/*-----
用户
------*/
var mongoose = require('./db-moogoose');
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
  company: { type: objID},
  // 手机
  mobile: { type: String, default: '' }, // match: /^1\d{10}$/
  // 邮箱
  email: { type: String, default: '' }, // match: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
  // 加入时间
  createTime: { type: Date, default: Date.now },
  // 签名
  notes: { type: String, default: '' },
  // 微信信息
  wechat: Schema.Types.Mixed,
  // 好友
  friends: [Schema.Types.Mixed],
  // 群
  groups: [{ type: Schema.Types.ObjectId, ref: 'group' }],
  // 邀请对方添加好友
  requset_friends: [Schema.Types.Mixed],
  // 被邀请添加好友
  response_friends: [Schema.Types.Mixed],
  // 邀请对方加群
  requset_groups: [Schema.Types.Mixed],
  // 被邀请加群
  response_groups: [Schema.Types.Mixed],
  // 融云token
  rongyunToken: { type: String, default: '' },
  // 设置
  setting: Schema.Types.Mixed
});

// 登录
UserSchema.statics.login = function (name, password, cb) {
  var md5 = crypto.createHash('md5');
  md5.update(password);
  var md5pwd = md5.digest('hex');
  return this.find({ username: name, password: md5pwd }, cb);
}
// 密码MD5加密
UserSchema.path('password').set(function (rawpwd) {
  var md5 = crypto.createHash('md5');
  md5.update(v);
  var pwd = md5.digest('hex');
  return pwd;
});
// 融云toke
UserSchema.statics.getRongyunToken = function (userid, name, headImg, cb) {
  // 融云token获取
  rongcloudSDK.user.getToken(userid, name, headImg, function (err, resultText) {
    if (err) {
      // Handle the error
      // console.log('获取融云token err:'+ err);
    }
    else {
      var result = JSON.parse(resultText);
      if (result.code === 200) {
        // Handle the result.token
        // console.log('获取融云token suceess:'+ result.token);
        cb(result.token);
      }
    }
  });
}
// 按照真实姓名与公司筛选
UserSchema.statics.findByCompanyAndName = function (name, company, callback) {
  var cregex = new RegExp('/cc/i');
  var param = ".*" + name + ".*";
  cregex.compile(param);

  this.find({ username: { $regex: cregex } })
    .populate('company', '-_id')
    .exec(function (err, doc) {
      var company = ".*" + company + ".*";
      cregex.compile(company);

      var ret = [];
      for (var i = 0; i < doc.length; i++) {
        if (doc[i].company && cregex.test(doc[i].company.name)) {
          ret.push(i, 1);
        }
      }
      callback(null, ret);
    });
}

// 自己验证
//schema.set('validateBeforeSave', false);
//schema.path('name').validate(function (value) {
//    return v != null;
//});

var UsersModel = mongoose.model('Users', UserSchema);

module.exports = UsersModel;


