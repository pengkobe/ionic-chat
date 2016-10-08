/*-----
公司

1. 验证已先去掉
------*/

var mongoose = require('./db-moogoose');


var Schema = mongoose.Schema;
var objID = Schema.Types.ObjectId;

var companySchema = new Schema({
  // 名称
  name: { type: String },
  // 地址
  location: { type: String },
  // 电话
  tel: { type: String }, // match: /^0\d{2,3}-?\d{7,8}$/ 
  // 邮箱
  email: { type: String }, // match: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
  // 加入时间
  createTime: { type: Date, default: Date.now },

  isVerified: { type: Number },

  inviteList: [{ type: objID, ref: 'invitations' }],
});

// 
companySchema.statics.findByName = function (name, callback) {
  var cregex = new RegExp('/cc/i');
  var param = ".*" + name + ".*";
  cregex.compile(param);
　this.find({ name: { $regex: cregex } }, callback);
}


var companyModel = mongoose.model('company', companySchema);


module.exports = companyModel;

