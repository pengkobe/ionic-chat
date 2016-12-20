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

// 方案1,数组存储
// var users = [];
// 方案2,对象存储
var users_socket = {};

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
            pub.hget("pushlist", userid, function (err, friends) {
                if (err) {
                    // TODO
                    console.log('hget pushlist err', err);
                    return [];
                }
                if (!friends) {
                    console.log('114 hget pushlist null:', []);
                    return [];
                }
                console.log('friends', friends);
                var friends = JSON.parse(friends);
                // 若果好友已在线，则将在线消息推送至相关好友。
                for (var i = 0; i < friends.length; i++) {
                    var friendid = friends[i]._id;
                    if (users_socket["" + friendid]) {
                        users_socket["" + friendid].emit('friend_online', userid, username)
                    }
                }
            });
            // just for test
            pub.publish('chat:people:login', username);
            socket.emit('login_successful', { info: 123 });
            /* 
            * 1：在线,
            * 0: 不在线
            */
            pub.hset('people', userid, 1);
            pub.hset('socket', socket.client.conn.id, userid);
            // 保存当前socket用户连接
            users_socket["" + userid] = socket;

            /* 查询token
            *  userid, username, headImg, callback
            */
            // UserModel.getRongyunToken(userid, username, '', callback);
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
            if (!users_socket[userid]) {
                return;
            }
            console.log('当前所有用户:' + JSON.stringify(users_socket));
            // 查找消息发送人
            var contact_socket = users_socket[userid];
            var currentuserid = pub.hget('socket', socket.client.conn.id);
            console.log(currentuserid + ' send message to:' + userid);
            console.log('send message to(finded):' + userid
                + 'currentUser.userid:' + currentuserid
                + 'socket:' + contact_socket);
            // 推送消息
            io.of('/chat').to(contact_socket).emit('messageReceived', currentuserid, message);
        });

        /**
         *  离线处理
         */
        socket.on('disconnect', function () {
            var userid = pub.hget('socket', socket.client.conn.id);
            pub.hset('people', userid, 0);
            users_socket["" + userid] = null;
            pub.hget("pushlist", userid, function (err, friends) {
                if (err) {
                    // TODO
                    console.log('hget pushlist err', err);
                    return [];
                }
                if (!friends) {
                    console.log('114 hget pushlist null:', err);
                    return [];
                }
                console.log('disconnect push friends', friends);
                var friends = JSON.parse(friends);
                // 若果好友已在线，则将在线消息推送至相关好友。
                for (var i = 0; i < friends.length; i++) {
                    var friendid = friends[i]._id;
                    if (users_socket["" + friendid]) {
                        users_socket["" + friendid].emit('friend_offline', userid)
                    }
                }
            });
            console.log(userid + ' 失联了！');
        });

        /**
         *  检查用户在线状态(融云接口只能检查单个)
         */
        socket.on('checkOnline', function (userids) {
            // 直接使用服务端缓存的列表

            var i;
            var ret = [];
            // TODO: 寻找更优算法
            var useridLen = userids.length;
            for (i = 0; i < useridLen; i++) {
                if (users_socket.userids[i]) {
                    ret.push({ id: userids[i], state: 1 });
                }
            }
            socket.emit('checkOnline_suc', ret);
        });
    }

    /**
     * Redis 事件处理
     */
    function RedisEvtHander(channel, message) {
        /**
         * 1. 拉取好友列表(MongoDB)
         * 2. 拉取群组(群成员 MongoDB)
         * 3. 拉取在线列表(Redis)
         */
        console.log("RedisEvtHander.", message);
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
