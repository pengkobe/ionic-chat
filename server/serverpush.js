'use strict';

module.exports = function(io) {
	// 加载model
	var appUser = require('./models/appUser.js');
	var companyModel = require('./models/company.js');
	var invitations = require('./models/tests.js');
	
	// 用户数据
	var userData=[];

    io.on('connection', function(socket) {
		/*用户进入app,关联相关公司*/
        socket.on('open', function(data, callback) {
			/* 
			  var data={
			  latitude:data.latitude,
			  lontitude:data.lontitude,
			  radius:data.radius,
			  userid:userid,
			  company:company,
			  role:role，
			  watchList:[userid...]
			 };
			*/
			socket.join(wlist[i].userid);

			console.dir('open'+data.toString());
			// 存储用户信息
			data.socketId=socket.id;
			userData[socket.id]=data;

           // 职员 且有访问记录
		   // 前台 且有访问记录
		   // 邀访者 且有访问记录
            console.dir(data.userid+':connected!');
			
		    // 刷新数据
			for(var u in userData){
				var wlist = userData[u].watchList;
				for(var w in wlist){
					if(wlist[w] == data.userid){
					   io.sockets.in(userData[u].socketId).emit('refresh',data); 
					   callback(data);
					}
				}
			}
			
			// 拉取数据
			var Llist = data.watchList;
			var ladata=[];
			for(var i=0; i<Llist.length; i++){
				for(var Lu in userData){
					if(Llist[i] === userData[Lu].userid){
						ladata.push(Lu);
					}
				}
			}
			io.sockets.in(socket.id).emit('refresh',data); 
        });
		
		/* 更新位置信息 */
        socket.on('uploadPosition', function(data, callback) {
			/*
			  var data={
			  latitude:data.latitude,
			  lontitude:data.lontitude,
			  radius:data.radius,
			  userid:userid,
			};*/
			
			console.dir('uploadPosition:'+data.userid);
			if(!userData[socket.id]){
				data.socketId=socket.id;
				userData[socket.id]=data;
			}
			
			// 更新位置信息
			userData[socket.id].latitude = data.latitude;
			userData[socket.id].lontitude = data.lontitude;
			userData[socket.id].radius = data.radius;
			console.dir('watchList:'+data.watchList);

		    // 刷新数据
			for(var u in userData){
				var wlist = userData[u].watchList;
				for(var w in wlist){
					if(wlist[w] == data.userid){
					   console.dir('refresh:'+data.userid);
					   console.dir('socketId:'+userData[u].socketId);
					   // socket.broadcast.to(userData[u].socketId).emit('refresh',data);
					   io.sockets.in(userData[u].socketId).emit('refresh',data); 
					   callback(data);
					}
				}
			}
        });
		
		/*位置推送*/
        socket.on('getCposition', function(data, callback) {
		
           // 职员 且有访问记录
		   
		   // 前台 且有访问记录
		   
		   // 邀访者 且有访问记录
  
        });
		
		/*失联*/
		socket.on('disconnect', function () {
			if(!!userData[socket.id]){
				delete userData[socket.id];
			}
		});
		
		/*发生报错*/
		socket.on('err', function(err) {
            console.dir(err);
        });
    });
}