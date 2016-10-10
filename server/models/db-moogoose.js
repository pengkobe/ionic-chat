var settings = require('../settings'),
        mongoose = require('mongoose');
        
// 创建数据库连接
mongoose.connect(settings.dbUrl);
var db = mongoose.connection;
//----测试是否连接成功----
db.on('error',function(err){
	console.log('mongoose:'+err.message);
});
db.once('open',function(){
	console.log('moogoose:打开mongodb...');
});

module.exports = mongoose;