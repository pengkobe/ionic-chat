/*-----
app用户
注:
1. 验证已先去掉
------*/

var mongoose = require('./db-moogoose');
// 融云
var rongcloudSDK = require('rongcloud-sdk' );
rongcloudSDK.init( 'lmxuhwagxgt9d', 'NpbRLWPxB79');
// 密码加密
var crypto = require('crypto');

var Schema = mongoose.Schema;
var objID = Schema.Types.ObjectId;

var appUsersSchema = new Schema({
  // 用户名,使用电话登录时这个用不着
  username: {type: String, unique: true},
    // 昵称
  nickname:{type: String, default:''},
  // 密码
  password: {type: String, default:''},

  //----ROlE 在这里先定义为字符串-----
  role:{type: String, default: '职员'},

  // 头像
  headimg:{type: String, default: ''},

  // 真实姓名
  realName:{type: String, default:''},
  // 性别
  sex:{type: String, default:''}, // , enum:['男','女']
  // 年龄
  age:{type: Number, default:0}, // , min:12, max:120
  // 公司
  company:{ type: objID, ref: 'company'},
  // 手机
  mobile: { type: String, default:'' }, // match: /^1\d{10}$/
  // 邮箱
  email:{ type: String, default:''}, // match: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
  // 加入时间
  createTime:{ type: Date, default: Date.now},
  // 微信openid
  openid:{type: String, default:''},
  // 是否绑定微信
  isBindWechat:{type: String, default:'否'}, // , enum:['是','否']

  isActivated:{type: Number, default:0},// , enum:[0,1]
  
  // 融云token
  rongyunToken:{type: String, default:''}
});

// 密码加密
appUsersSchema.path('password').set(function (v) {
　var md5 = crypto.createHash('md5');
　md5.update(v);
　var d = md5.digest('hex');
  return d;
});


// 用户登录模块
appUsersSchema.statics.login = function (name,password,cb) {
  var md5 = crypto.createHash('md5');
　md5.update(password);
　var d = md5.digest('hex');
  return this.find({ username: name, password:d }, cb);
}

// 融云toke
appUsersSchema.statics.getRongyunToken = function (userid,name,headImg,cb) {
    // 融云token获取 'http://chat.info/public/img/favicon.ico'
    rongcloudSDK.user.getToken(userid, name, headImg, function( err, resultText ) {
        if( err ) {
          	console.log('获取融云token err:'+ err);
          // Handle the error
        }
        else {
          var result = JSON.parse( resultText );
          if( result.code === 200 ) {
            //Handle the result.token
            	console.log('获取融云token suceess:'+ result.token);
              cb(result.token);
          }
        }
    });
}


// 按照真实姓名与公司筛选
appUsersSchema.statics.findByCompanyAndName = function (name,company,callback) {
	var cregex = new RegExp('/cc/i');
	var param=".*"+name+".*";
	cregex.compile(param);

	this.find({ username: {$regex:cregex} })
	.populate('company', '-_id')
	.exec(function(err,doc){
		var company=".*"+company+".*";
		cregex.compile(company);

		var ret=[];
		for(var i=0; i<doc.length; i++){
			if(doc[i].company && cregex.test(doc[i].company.name)){
				ret.push(i,1);
			}
		}
		callback(null,ret);
	});
}

// 自己验证
//schema.set('validateBeforeSave', false);
//schema.path('name').validate(function (value) {
//    return v != null;
//});

var appUsersModel = mongoose.model('appUsers',appUsersSchema);

module.exports = appUsersModel;


