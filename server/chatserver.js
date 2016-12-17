'use strict';
/**
 * 1. 用户登录
 * 2. 视频聊天
 */
var _ = require('lodash-node');
var _http = require('http');

// 多文件公用 redis 连接
var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');

var users = [];

/**
 * 视频聊天中转服务器
 * TODO:在线状态并不可信，手机端因为某些原因不一定会调用disconnect方法
*/
module.exports = function (io) {
    var UserModel = require('./models/user.js');
    var GroupModel = require('./models/group.js');

    /**
     * socketIO事件处理
     */
    function IOHandler(socket) {
        /**
        *  用户登录
        */
        socket.on('login', function (userid, username, headImg) {
            console.log(socket.client.conn.id + " > " + username + ' login!');
            // 选用redis维护在线列表 or 直接选用程序数组维护
            pub.hset('people', socket.client.conn.id, username);
            pub.publish('chat:people:login', username);
            // 删除已有用户
            var index = _.findIndex(users, { userid: userid })
            if (index !== -1) {
                var contact = users[index];
                console.log(contact.userid + ' 在其他地方登陆！');
                users.splice(index, 1);
            }
            socket.emit('login_successful', {info:123});

            /* 查询token
            *  userid, username, headImg, callback
            */
            //UserModel.getRongyunToken(userid, username, '', callback);
            // function callback(err, info) {
            //     if (err) {
            //         socket.emit('login_error', err);
            //     } else {
            //         users.push({
            //             userid: info.userid,
            //             socket: socket.id
            //         });
            //         socket.emit('login_successful', info);
            //         socket.broadcast.emit('online', info.userid);
            //         console.log(userid + ' logged in');
            //     }
            // }
        });


        /**
         *  视频/音频消息中转服务
         */
        socket.on('sendMessage', function (userid, message) {
            var currentUser = _.find(users, { socket: socket.id });
            if (!currentUser) {
                return;
            }

            console.log('当前所有用户:' + JSON.stringify(users));
            var userlen = users.length;
            // 查找消息发送人
            var contact;
            for (var i = 0; i < userlen; i++) {
                if (users[i].userid == userid) {
                    contact = users[i];
                }
            }
            // var contact = _.find(users, { userid: userid });
            if (!contact) {
                return;
            }
            console.log(JSON.stringify(currentUser) + ' send message to:' + JSON.stringify(contact));
            console.log('send message to(finded):' + userid
                + 'currentUser.userid:' + currentUser.userid
                + 'socket:' + contact.socket);
            // 推送消息
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
            // 直接使用服务端缓存的列表
            var useridLen = userids.length;
            var usersLen = users.length;
            var i, j;
            var ret = [];
            // TODO: 寻找更优算法
            for (i = 0; i < useridLen; i++) {
                for (j = 0; j < usersLen; j++) {
                    if (userids[i] == users[j].userid) {
                        ret.push({ id: userids[i], state: 1 });
                    }
                }
            }
            socket.emit('checkOnline_suc', ret);
        });
    }

    /**
     * Redis 事件处理
     */
    function RedisEvtHander(channel, message) {
        console.log("RedisEvtHander.",message);
        io.of('/chat').emit(channel, message);
    }

    /**
     * Redis pub/sub 监测处理
     */
    pub.on('ready', function () {
        sub.on('ready', function () {
            sub.subscribe('chat:messages:latest', 'chat:people:login');
            io.of('/chat').on('connection', IOHandler);
            sub.on('message', function (channel, message) {
                // console.log(channel + ' : ' + message);
                RedisEvtHander(channel, message);
            });

            return setTimeout(function () {
                console.log('ionic-chat:', 'listening on: http://127.0.0.1:' + process.env.PORT);
                //return callback();
            }, 300); // wait for socket to boot
        });
    });
}
