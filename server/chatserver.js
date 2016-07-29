'use strict';
var _ = require('lodash-node');
var _http = require('http');

var users = [];

module.exports = function (io) {
    var chatUser = require('./models/chatUser.js');
    var chatGroup = require('./models/chatGroup.js');
    io.of('/chat').on('connection', function (socket) {
        socket.on('login', function (userid, username, headImg) {
            // socket已存在
            if (_.findIndex(users, { socket: socket.id }) !== -1) {
                socket.emit('login_error', '你已经在线了！.');
                return;
            }
            // 用户名已存在
            if (_.findIndex(users, { userid: userid }) !== -1) {
                socket.emit('login_error', '用户名已存在.');
                return;
            }
            // 查询token  userid, username, headImg, callback
            chatUser.getRongyunToken(userid, username, '', callback);

            function callback(err, info) {
                if (err) {
                    socket.emit('login_error', err);
                } else {
                    users.push({
                        userid: info.userid,
                        socket: socket.id
                    });
                    // _.pluck(users, 'userid') 
                    socket.emit('login_successful', info);
                    socket.broadcast.emit('online', info.userid);
                    console.log(userid + ' logged in');
                }
            }
        });

        // 视频/音频消息中转服务
        socket.on('sendMessage', function (userid, message) {
            console.log('send message to:' + userid);
            var currentUser = _.find(users, { socket: socket.id });
            if (!currentUser) {
                return;
            }
            console.log('当前用户s:' + JSON.stringify(users));
            console.log('当前用户:' + JSON.stringify(currentUser));
            var userlen = users.length;
            var contact;
            for (var i = 0; i < userlen; i++) {
                if (users[i].userid == userid) {
                    contact = users[i];
                }
            }
            //   var contact = _.find(users, { userid: userid });
            console.log('contact:' + JSON.stringify(contact));
            if (!contact) {
                return;
            }
            console.log('send message to(finded):' + userid +
                'currentUser.userid:' + userid + 'socket:' + contact.socket);

            io.of('/chat').to(contact.socket).emit('messageReceived', currentUser.userid, message);
        });

        // 离线处理
        socket.on('disconnect', function () {
            var index = _.findIndex(users, { socket: socket.id });
            if (index !== -1) {
                socket.broadcast.emit('offline', users[index].userid);
                console.log(users[index].userid + ' 失联了！');
                users.splice(index, 1);
            }
        });

        // 创建群组
        socket.on('findGroup', function (groupid, groupname, userids, headImg) {
            chatGroup.findGroup(groupid, groupname, userids, headImg, callback);
            function callback(err, ret) {
                // emit方法需要再做处理
                if (err) {
                    socket.emit('findGroup_err', err);
                } else {
                    socket.emit('findGroup_successful', ret);
                }
            }
        });

        // 检查用户在线状态(官方接口只能检查单个)
        socket.on('checkOnline', function (userids) {
            // 方法1：使用融云判断
            // chatGroup.checkOnline(userids, callback);
            // function callback(err, ret) {
            //     // TODO:emit方法需要再做处理
            //     if (err) {
            //         socket.emit('checkOnline_err', err);
            //     } else {
            //         socket.emit('checkOnline_suc', ret);
            //     }
            // }
            // 方法2：直接在node端缓存在线列表
            var useridLen = userids.length;
            var usersLen = users.length;
            var i ,j;
            var ret=[];
            for (i= 0; i < useridLen; i++) {
                for (j=0; j < usersLen; j++) {
                    if (userids[i] == users[j].userid) {
                       ret.push({id:userids[i], state:1});
                    }
                }
            }
            socket.emit('checkOnline_suc', ret);
        });

        // 加入群组
        socket.on('joinGroup', function (groupid, userid) {
        });
    });

    // 监听服务端其它事件（服务端内网通信）
    function monitorEvent(io, socket) {
        var baseUrl = "http://192.168.3.97"; // EmployeeBLL

        // 第一步，getFriends(string UserID)查找已确认好友
        var options = {
            hostname: baseUrl,
            port: 8099,
            method: "POST",
            path: '/Action.ashx?Name=HYD.E3.Business.EmployeeBLL.getFriends',
            headers: {
                'Accept': 'application/json',
                "Content-Type": 'application/x-www-form-urlencoded',
            }
        };
        _http.request(options, getFriendsCallback);
        _http.write(data + "\n");
        function getFriendsCallback(serverret) {
            if (serverret.statusCode == 200) {
                var body = "";
                serverret.on('data', function (data) {
                    body += data;
                }).on('end', function () {
                    // 推送至前端
                    //res.send(200, body); 
                });
            }
            else {
                // 推送至前端
                //res.send(500, "error");
            }
        }
        // 第二步，FindFriendsReq(string UserID)查找好友请求
        // 第三步，getTeams(string UserID) 查找已加入的团队列表
        // 第四步，findTeamsReq(string UserID) 查找团队邀请
    }
}
