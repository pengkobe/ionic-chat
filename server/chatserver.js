'use strict';
/**
 * 1. 用户登录
 * 2. 视频聊天
 */
var _ = require('lodash-node');
var _http = require('http');

var users = [];

/**
 * 视频聊天中转服务器
 * TODO:在线状态并不可信，手机端因为某些原因不一定会调用disconnect方法
*/
module.exports = function (io) {
    var UserModel = require('./models/userid.js');
    var GroupModel = require('./models/group.js');
    io.of('/chat').on('connection', function (socket) {
        /**
         *  用户登录
         */
        socket.on('login', function (userid, username, headImg) {
            var index = _.findIndex(users, { userid: userid })
            if (index !== -1) {
                var contact = users[index];
                console.log(contact.userid + ' 在其他地方登陆！');                              
                users.splice(index, 1);
            }
            // 查询token  userid, username, headImg, callback
            UserModel.getRongyunToken(userid, username, '', callback);

            function callback(err, info) {
                if (err) {
                    socket.emit('login_error', err);
                } else {
                    users.push({
                        userid: info.userid,
                        socket: socket.id
                    });
                    socket.emit('login_successful', info);
                    socket.broadcast.emit('online', info.userid);
                    console.log(userid + ' logged in');
                }
            }
        });


        /**
         *  视频/音频消息中转服务
         */
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
            // var contact = _.find(users, { userid: userid });
            console.log('contact:' + JSON.stringify(contact));
            if (!contact) {
                return;
            }
            console.log('send message to(finded):' + userid +
                'currentUser.userid:' + userid + 'socket:' + contact.socket);
            io.of('/chat').to(contact.socket).emit('messageReceived', currentUser.userid, message);
        });

        /**
         *  离线处理
         */
        socket.on('disconnect', function () {
            var index = _.findIndex(users, { socket: socket.id });
            if (index !== -1) {
                socket.broadcast.emit('offline', users[index].userid);
                console.log(users[index].userid + ' 失联了！');
                users.splice(index, 1);
            }
        });

        /**
         *  创建群组
         */
        socket.on('findGroup', function (groupid, groupname, userids, headImg) {
            GroupModel.findGroup(groupid, groupname, userids, headImg, callback);
            function callback(err, ret) {
                if (err) {
                    socket.emit('findGroup_err', err);
                } else {
                    socket.emit('findGroup_successful', ret);
                }
            }
        });

        /**
         *  检查用户在线状态(融云接口只能检查单个)
         */
        socket.on('checkOnline', function (userids) {
            // 方法1：使用融云判断
            // GroupModel.checkOnline(userids, callback);
            // function callback(err, ret) {
            //     // TODO:emit方法需要再做处理
            //     if (err) {
            //         socket.emit('checkOnline_err', err);
            //     } else {
            //         socket.emit('checkOnline_suc', ret);
            //     }
            // }
            // 方法2,直接使用服务端维存的列表
            var useridLen = userids.length;
            var usersLen = users.length;
            var i, j;
            var ret = [];
            for (i = 0; i < useridLen; i++) {
                for (j = 0; j < usersLen; j++) {
                    if (userids[i] == users[j].userid) {
                        ret.push({ id: userids[i], state: 1 });
                    }
                }
            }
            socket.emit('checkOnline_suc', ret);
        });

        /**
         *  加入群组
         */
        socket.on('joinGroup', function (groupid, userid) {
        });
    });
}
