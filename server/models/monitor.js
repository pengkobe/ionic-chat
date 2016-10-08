/*-----
公司

1. 验证已先去掉
------*/

var mongoose = require('./db-mongoose');


var Schema = mongoose.Schema;
var objID = Schema.Types.ObjectId;

var company12Schema = new Schema({
  // 名称
  name:{type: String},
  // 地址
  location:{type: String},
  // 电话
  tel: { type: String}, // match: /^0\d{2,3}-?\d{7,8}$/ 
  // 邮箱
  email:{ type: String}, // match: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
  // 加入时间
  createTime:{ type: Date, default: Date.now},
  
  isVerified:{type:Number},
  
  inviteList:[{ type: objID, ref: 'invitations' }],
});

// 
company12Schema.statics.findByName = function (name,callback) {
	var cregex = new RegExp(name, 'i');
　	company12Schema.find({ company12:cregex })
	.limit(10)
	.sort('-company12')
	.exec(callback);
}


var company12Model = mongoose.model('company12',company12Schema);


module.exports = company12Model; 

    