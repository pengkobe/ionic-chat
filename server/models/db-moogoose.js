var settings = require('../settings'),
        mongoose = require('mongoose');
        
// 需要建立多个连接时用
// var db = mongoose.createConnection(settings.host,settings.db); 
// module.exports = mongoose;
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