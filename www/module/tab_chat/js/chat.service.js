;
var chats = angular.module('chat.services', []);

// 用户全局引用
chats.factory('initRong', function ($rootScope, $state, RONGYUN_APPKEY) {
    function initRong(token) {
        $rootScope.arrMsgs = new Array();
        $rootScope.arrCons = new Array();
        // 融云初始化
        RongCloudLibPlugin.init({
            appKey: RONGYUN_APPKEY
        },
            function (ret, err) {
                if (ret) {
                    // alert('init:' + JSON.stringify(ret));
                }
                if (err) {
                    alert('init error:' + JSON.stringify(err));
                }
            }
        );
        RongCloudLibPlugin.setConnectionStatusListener(
            function (ret, err) {
                if (ret) {
                    // 只允许单用户登录
                    if (ret.result.connectionStatus == 'KICKED') {
                        alert('您的帐号已在其他端登录!');
                        $rootScope.hideTabs = false;
                        //$ionicHistory.clearCache();
                        $state.go('login');
                    }
                }
                if (err) {
                    alert('setConnectionStatusListener error:' + JSON.stringify(err));
                }
            }
        );
        // 建立连接
        RongCloudLibPlugin.connect({
            token: token
        },
            function (ret, err) {
                if (ret) {
                    $rootScope.$apply();
                }
                if (err) {
                    alert('init error:' + JSON.stringify(err));
                }
            }
        );
        // 消息接收
        RongCloudLibPlugin.setOnReceiveMessageListener(
            function (ret, err) {
                // 接收消息
                if (ret) {
                    $rootScope.arrMsgs.push(JSON.stringify(ret.result.message));
                    $rootScope.$apply();
                }
                if (err) {
                    alert('setOnReceiveMessageListener error:' + JSON.stringify(err));
                }
            }
        );
    }
    return {
        init: initRong
    };
})
    // 好友服务
    .factory('Friends', function (RequestUrl, Signaling, UserService, $interval, LOAD_FRIENDS_URL, HttpPromiseService) {
        var intervalid = 0;
        var currentUser = UserService.getUserinfo();
        var loaded = false;
        var friends = [];
        var userids = [];
        var curUID = '';
        function getFriends(callback) {
            var params = {
                username: currentUser.username,
            };
            HttpPromiseService.getData(LOAD_FRIENDS_URL, params).then(function (data) {
                console.log(data);
                if (data && data.friends) {
                    callback(data.friends);
                } else {
                    callback([]);
                }
            });
        }
        function loadData(callback) {
            getFriends(function (retdata) {
                friends = [];
                var dataLen = retdata.length;
                for (var i = 0; i < dataLen; i++) {
                    var obj = {};
                    obj.id = retdata[i]._id;
                    obj.name = retdata[i].nickname == null ? retdata[i].username : retdata[i].nickname;
                    obj.alpha = makePy(obj.name)[0][0].toUpperCase();
                    obj.conversationType = 'PRIVATE';
                    obj.online = '0';
                    obj.Mobile = "212312312222";//测试
                    obj.portrait = retdata[i].headimg ? (RequestUrl + 'Images/Photo/' + retdata[i].headimg) : null;
                    friends.push(obj);
                }
                // 按首字母排序
                friends = friends.sort(function (a, b) {
                    var bool = a.alpha > b.alpha;
                    return bool ? 1 : -1;
                });
                // 删除本人
                var retIndex;
                for (var i = 0; i < friends.length; i++) {
                    if (friends[i].id == curUID) {
                        retIndex = i;
                        break;
                    }
                }
                if (retIndex) {
                    friends.splice(retIndex, 1);
                }
                // 首字母索引位置计算
                var friendCount = friends.length;
                var nowalpha = '';
                var alphaCount = 0;
                for (var m = 0; m < friendCount; m++) {
                    var tmp = friends[m];
                    if (tmp.alpha != nowalpha) {
                        nowalpha = obj.alpha;
                        alphaCount++;
                    }
                    userids.push(tmp.id);
                }
                callback(friends);
                Signaling.emit('checkOnline', userids);
                checkOnlineCallback(callback);
            });
        }
        // 刷新在线列表(10s)
        $interval(function () {
            if (loaded) {
                Signaling.emit('checkOnline', userids);
            }
        }, 10000);
        // 获取在线列表
        function checkOnlineCallback(callback) {
            if (!loaded) {
                loaded = true;
                Signaling.on('checkOnline_suc', function (ids) {
                    var friendlistCount = friends.length;
                    for (var m = 0; m < friendlistCount; m++) {
                        var tmp = friends[m];
                        for (var n = 0; n < ids.length; n++) {
                            if (tmp.id == ids[n].id) {
                                friends[m].online = "1";
                            }
                        }
                    }
                    if (callback) {
                        callback(friends);
                    }
                });
            }
        }

        return {
            // 获取好友列表
            all: function (callback) {
                //return;
                if (friends.length > 0) {
                    callback(friends);
                } else {
                    loadData(callback);
                    intervalid = $interval(function () {
                        loadData(callback);
                    }, 20000);
                }
            },
            // 获取单个好友
            get: function (friendId) {
                var retIndex = -1;
                for (var i = 0; i < friends.length; i++) {
                    if (friends[i].id == friendId) {
                        retIndex = i;
                        break;
                    }
                }
                return retIndex > -1 ? friends[retIndex] : null;
            },
            //（未启用）
            set: function (val) {
                friends = val;
            },
            //（未启用）
            add: function (friend) { },
            stopReq: function () {
                loaded = false;
                $interval.cancel(intervalid);
            }
        }
    })
    // 搜多用户添加好友
    .factory('SearchUsers', function (UserService, $interval, SEARCH_FRIENDS_URL, HttpPromiseService) {
        return {
            load: function (str) {
                var params = {
                    username: str
                }
                return HttpPromiseService.getData(SEARCH_FRIENDS_URL, params).then(function (data) {
                    return data;
                });
            }
        }
    })
    // 群组服务
    .factory('Groups', function (Signaling, UserService, $rootScope,
        $interval, LOAD_GROUPS_URL, HttpPromiseService) {
        var groups = [];
        var curUID = '';
        var currentUser = UserService.getUserinfo();
        // 后台请求数据
        function loadData(callback) {
            var params = {
                username: currentUser.username,
            };
            HttpPromiseService.getData(LOAD_GROUPS_URL, params).then(function (grouplist) {
                console.log(grouplist);
                groups = [];
                for (var i = 0; i < grouplist.length; i++) {
                    var group = {};
                    group.id = grouplist[i]._id;
                    group.name = grouplist[i].groupname;
                    group.number = 12;
                    group.max_number = 13;
                    group.conversationType = 'GROUP';
                    group.type = 'create';
                    group.members = grouplist[i].members;
                    groups.push(group);
                }
                callback(groups)
            });
        }

        return {
            all: function (callback) {
                if (groups.length > 0) {
                    callback(groups);
                } else {
                    loadData(callback);
                    $interval(function () {
                        loadData(callback);
                    }, 10000);
                    $rootScope.$on("change Project", function (evt, PCode, PName) {
                        loadData(callback);
                    });
                }
            },
            set: function (val) {
                groups = val;
            },
            get: function (groupId) {
                var retIndex = -1;
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].id == groupId) {
                        retIndex = i;
                        break;
                    }
                }
                return retIndex > -1 ? groups[retIndex] : null;
            },
            // 获取组内成员
            getGroupMembers: function (groupId, cb) {
                var retIndex = -1;
                for (var i = 0; i < groups.length; i++) {
                    if (groupId == groups[i].id) {
                        return cb(groups[i].members);
                    }
                }
                return [];
            }
        }
    })
    // 创建组
    .factory('CreateGroups', function (UserService, HttpPromiseService, CREATE_GROUP_URL) { // 成功
        var currentUser = UserService.getUserinfo();
        return {
            create: function (group) {
                var params = {
                    userid: currentUser._id,
                    groupname: group.name,
                    groupimg: '',
                    members: group.member
                };
                return HttpPromiseService.getData(CREATE_GROUP_URL, params);
            }
        }
    })
    // 发送加好友请求
    .factory('AddFriendRequest', function (UserService, HttpPromiseService, REQ_FRIEND_URL) { // 成功
        var currentUser = UserService.getUserinfo();
        return {
            init: function (friendid, cb) {
                var params = {
                    // userid: currentUser._id,
                    username: currentUser.username,
                    friendid: friendid
                };
                HttpPromiseService.getData(REQ_FRIEND_URL, params).then(function (data) {
                    cb(data);
                });
            }
        }
    })
    // 发送入群请求
    .factory('AddGroupRequest', function (UserService, HttpPromiseService, REQ_GROUP_MEMBER_URL) { // 成功
        return {
            init: function (friendid, groupid, cb) {
                var currentUser = UserService.getUserinfo();
                var params = {
                    userid: currentUser._id,
                    friendid: friendid,
                    groupid: groupid
                };
                HttpPromiseService.getData(REQ_GROUP_MEMBER_URL, params).then(function (data) {
                    console.log(data);
                    cb(data);
                });
            }
        }
    })
    // 加载好友请求
    .service("FindFriendsReq", function ($http, httpXhr, $interval, UserService, HttpPromiseService, LOAD_FRIEND_REQUEST_URL) {
        var friendRquestList = [];
        var intervalid = 0;
        var currentUser = UserService.getUserinfo();
        function FindFriendsReq(callback) {
            var params = {
                username: currentUser.username,
            };
            HttpPromiseService.getData(LOAD_FRIEND_REQUEST_URL, params).then(function (res_friendlist) {
                friendRquestList = [];
                for (var i = 0; i < res_friendlist.length; i++) {
                    var reqfrom = res_friendlist[i].from;
                    console.log(res_friendlist);
                    var friendRquest = {};
                    friendRquest.id = reqfrom._id;
                    friendRquest.name = reqfrom.nickname;
                    friendRquest.info = "[" + reqfrom.nickname + "]" + "请求添加您为好友！";
                    friendRquest.portrait = reqfrom.headimg;
                    friendRquest.type = "PRIVATE";
                    friendRquestList.push(friendRquest);
                }
                callback(friendRquestList);
            });
        }

        var friendsReqApi = {
            all: function (userid, callback) {
                if (friendRquestList.length > 0) {
                    callback(friendRquestList);
                } else {
                    FindFriendsReq(userid, callback);
                    clearInterval(intervalid);
                    intervalid = $interval(function () {
                        FindFriendsReq(userid, callback);
                    }, 20000);
                }
            }
        };
        return friendsReqApi;
    })
    // 加载团队请求
    .service("findTeamsReq", function ($http, httpXhr, $interval, UserService, HttpPromiseService, LOAD_GROUP_REQUEST_URL) {
        var teamRquestList = [];
        var intervalid = 0;
        var currentUser = UserService.getUserinfo();
        function findTeamsReq(callback) {
            var params = {
                username: currentUser.username
            };
            HttpPromiseService.getData(LOAD_GROUP_REQUEST_URL, params).then(function (data) {
                console.log(data);
                teamRquestList = [];
                var dataLen = data.length;
                for (var i = 0; i < dataLen; i++) {
                    var groupRquest = {};
                    var tempdata = data[i];
                    groupRquest.id = tempdata.groupid._id;
                    groupRquest.name = tempdata.groupid.groupname;
                    groupRquest.info = (tempdata.from.nickname == null ? "(无名)" : tempdata.from.nickname) + "邀您加入群:" + "[" + tempdata.groupid.groupname + "]";
                    groupRquest.portrait = null;
                    groupRquest.type = "GROUP";
                    teamRquestList.push(groupRquest);
                }
                callback(teamRquestList);
            });
        }
        var teamsReqApi = {
            all: function (userid, callback) {
                if (teamRquestList.length > 0) {
                    callback(teamRquestList);
                } else {
                    findTeamsReq(userid, callback);
                    $interval.cancel(intervalid);
                    intervalid = $interval(function () {
                        findTeamsReq(userid, callback);
                    }, 10000);
                }
            },
            stopReq: function () {
                $interval.cancel(intervalid);
            }
        };
        return teamsReqApi;
    })
    // 好友请求服务
    .service("ResFriend", function ($http, httpXhr, $timeout, UserService, HttpPromiseService, RES_FRIEND_REQUEST) {
        // UserID 自己
        // FriendID:接收人
        // state{0：发邀请，1:接受，-1：拒绝}
        var currentUser = UserService.getUserinfo();
        function ResFriend(FriendID, state, callback) {
            var params = {
                userid: currentUser._id,
                friendid: FriendID,
                state: state
            };
            HttpPromiseService.getData(RES_FRIEND_REQUEST, params).then(function (data) {
                console.log(data);
                callback(data);
            });
        }
        return ResFriend;
    })
    // 群组请求服务
    .service("ResTeam", function ($http, httpXhr, $timeout, HttpPromiseService, UserService, RES_GROUP_REQUEST) {
        // groupID 群组名称
        // FriendID:发起请求的人
        // userid:自己
        // state{0：发邀请，1:接受，-1：拒绝}
        var currentUser = UserService.getUserinfo();
        function ResTeam(groupID, FriendID, state, callback) {
            var obj = { groupID: groupID.substr(4), userid: currentUser._id, state: state };
            var params = {
                userid: userid,
                friendid: FriendID,
                groupid: groupID,
                state: state
            };
            HttpPromiseService.getData(RES_GROUP_REQUEST, params).then(function (data) {
                debugger;
                console.log(data);
                callback(data);
            });
        }
        return ResTeam;
    })

    // 协同全局未读消息计算
    .service("chatUnreadMessage", function ($rootScope) {
        var messages = 0;
        var chatUnreadMessageservive = {
            getUnreadMessage: function () {
                return messages;
            },
            setUnreadMessage: function (val) {
                messages = val;
                $rootScope.chatUnreadMessageNum = val;
                return;
            },
            addUnreadMessage: function (val) {
                messages += val;
                $rootScope.chatUnreadMessageNum = messages;
                return;
            }
        }
        return chatUnreadMessageservive;
    })
    // 全局消息监听
    .service("newMessageEventService", function ($rootScope) {
        var msgService = {
            broadcast: function (data) {
                $rootScope.$broadcast("newMsg", data);
            },
            listen: function (callback) {
                $rootScope.$on("newMsg", callback);
            }
        };
        return msgService;
    })
    // 未读消息模拟（For PC）
    .service("unreadMessages", function ($http, $rootScope, $timeout) {
        var unreadMessages = [
            { unreadMessageCount: 2, latestMessage: 'ficl upi' },
        ];
        var util = {
            getUnreadList: function () {
                var arr = [{
                    targetId: 11,
                    senderUserId: 1,
                    sentTime: '2016-06-01 10:00',
                    unreadMessageCount: 2,
                    latestMessage: 'i am bat11!',
                    conversationType: 'PRIVATE',
                    conversationTitle: '陌生人'
                }, {
                    targetId: 12,
                    senderUserId: 1,
                    sentTime: '2016-06-01 10:00',
                    unreadMessageCount: 2,
                    latestMessage: 'i am bat12!',
                    conversationType: 'PRIVATE',
                    conversationTitle: '陌生人'
                }, {
                    targetId: 14,
                    senderUserId: 1,
                    sentTime: '2016-06-01 10:00',
                    unreadMessageCount: 2,
                    latestMessage: 'i am bat14!',
                    conversationType: 'PRIVATE',
                    conversationTitle: '陌生人'
                }, {
                    targetId: 13,
                    senderUserId: 1,
                    sentTime: '2016-06-01 10:00',
                    unreadMessageCount: 2,
                    latestMessage: 'i am bat13!',
                    conversationType: 'PRIVATE',
                    conversationTitle: '陌生人'
                }, {
                    targetId: 16,
                    senderUserId: 1,
                    sentTime: '2016-06-01 10:00',
                    unreadMessageCount: 2,
                    latestMessage: 'i am bat!12',
                    conversationType: 'PRIVATE',
                    conversationTitle: '陌生人'
                },];
                // 模拟新消息
                $timeout(function () {
                    $rootScope.$broadcast("newMsg",
                        '{"targetId": 11, "senderUserId": 1, "sentTime":"2016-06-01 10:00", '
                        + '"content": {"text":"new message"}, "conversationType": "PRIVATE", "objectName": "RC:TxtMsg"}');
                }, 4000);
                return arr;
            },
        }
        return util;
    })
    // 黑名单服务
    .factory('Blacklist', function () {
        var lists = [
            { id: 'group1', username: 'group1', portrait: 'img/personPhoto.png' },
        ];
        return {
            all: function () {
                return lists;
            },
            set: function (val) {
                lists = val;
            },
            addOne: function (val) {
                lists.push(val);
            },
            removeOne: function (val) {
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i].id == val) {
                        lists.splice(i, 1);
                        break;
                    }
                }
            },
            get: function (id) {
                // Simple index lookup
                var retIndex = -1;
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i].id == id) {
                        retIndex = i;
                        break;
                    }
                }
                return retIndex > -1 ? lists[retIndex] : null;
            }
        }
    })
    // 格式化融云错误
    .factory('FormateRongyunErr', function (myNote) {
        return {
            formate: function (err) {
                var errcode = 1;
                if (err && err.code) {
                    errcode = err.code;
                } else if (err && err.result) {
                    errcode = err.result.code;
                }
                switch (errcode) {
                    case 30001:
                        myNote.myNotice('网络出现问题，请检查网络! 30001');
                        break;
                    case -10000:
                        myNote.myNotice('网络出现问题，请检查网络!-10000');
                        break;
                    case -1:
                        myNote.myNotice('初始化失败！重启试试？! -1');
                        break;
                    default:
                        break;
                }
            }
        }
    })
    // 融云服务
    .factory('rongyunService', function ($q, FormateRongyunErr) {
        return {
            /**
             * 获取历史数据
             */
            getConversationList: function (targetid, ctype) {
                var oldestMessageId = 0;
                var promise = $q.defer();
                RongCloudLibPlugin.getConversationList(
                    function (ret, err) {
                        if (ret) {
                            promise.resolve(ret);
                        }
                        if (err) {
                            FormateRongyunErr.formate(err);
                        }
                    }
                );
            },
            getHistoryMsg: function (targetid, ctype) {
                var oldestMessageId = 0;
                var promise = $q.defer();
                RongCloudLibPlugin.getHistoryMessages({
                    conversationType: ctype,
                    targetId: targetid,
                    count: 5,
                    oldestMessageId: oldestMessageId
                },
                    function (ret, err) {
                        if (ret) {
                            var result = new Array(),
                                tmp;
                            for (var i = ret.result.length - 1; i >= 0; i--) {
                                tmp = ret.result[i];
                                tmp = myUtil.resolveMsg(tmp);
                                result.push(tmp);
                            }
                            var hisArr = result.concat($scope.hisMsgs);
                            promise.resolve(hisArr);

                        }
                        if (err) {
                            alert("getHistoryMessages error: " + JSON.stringify(err));
                        }
                    }
                );
            },
            sendMessage: function (ctype, target, content) {
                var promise = $q.defer();
                RongCloudLibPlugin.sendTextMessage({
                    conversationType: ctype,
                    targetId: target,
                    text: content,
                    extra: "extra text"
                },
                    function (ret, err) {
                        if (ret) {
                            //消息此时未发送成功，可以加入样式标明
                            if (ret.status == "prepare") {
                                // alert('你发了文字消息：' +JSON.stringify(ret));
                                promise.resolve(ret.result.message);
                            }
                            //成功后更新样式
                            if (ret.status == "success") {
                                // alert("success");
                            }
                        }
                        if (err) {
                            alert("发送文本消息 error: " + JSON.stringify(err));
                        }
                    }
                );
            },
            clearMessagesUnreadStatus: function (conversationType, targetId) {
                var promise = $q.defer();
                RongCloudLibPlugin.clearMessagesUnreadStatus({
                    conversationType: conversationType,
                    targetId: targetId
                },
                    function (ret, err) {
                        promise.resolve(ret);
                        if (err) {
                            alert("标为已读 error: " + JSON.stringify(err));
                        }
                    }
                );
            },
            getLatestMsg: function (targetid, ctype) {
                var promise = $q.defer();
                RongCloudLibPlugin.getLatestMessages({
                    conversationType: ctype,
                    targetId: targetid,
                    count: 15
                },
                    function (ret, err) {
                        //alert("getLatestMessages ret:" + JSON.stringify(ret));
                        if (ret) {
                            var result = [];
                            var tmp;
                            for (var i = ret.result.length - 1; i >= 0; i--) {
                                tmp = ret.result[i];
                                if (ctype == "GROUP" && members.length > 0) {
                                    for (var m = 0; m < members.length; m++) {
                                        if (members[m].id == tmp.senderUserId) {
                                            tmp.name = members[m].name;
                                        }
                                    }
                                }
                                tmp = myUtil.resolveMsg(tmp);
                                // 处理IOS倒序顺序bug
                                if (isIOS) {
                                    result.push(tmp);
                                } else {
                                    result.unshift(tmp);
                                }
                            }
                            promise.resolve(result);
                        }
                        if (err) {
                            alert("getLatestMessages error: " + JSON.stringify(err));
                        }
                    }
                );
            },
            sendImageMessage: function (ctype, targetId, imageURI) {
                var isIOS = ionic.Platform.isIOS();
                var isAndroid = ionic.Platform.isAndroid();
                var picPath = imageURI;
                if (isIOS) {
                    picPath = imageURI.replace('file://', '');
                }
                if (isAndroid) {
                    if (imageURI.indexOf('?') !== -1) {
                        picPath = imageURI.substring(0, imageURI.indexOf('?'));
                    } else { }
                }
                var promise = $q.defer();
                RongCloudLibPlugin.sendImageMessage({
                    conversationType: ctype,
                    targetId: targetId,
                    imagePath: picPath,
                    extra: ""
                },
                    function (ret, err) {
                        if (ret) {
                            //消息此时未发送成功，可以加入样式标明；成功后更新样式
                            if (ret.status == "prepare") {
                                // alert("prepare");
                                promise.resolve(ret.result.message);

                            }
                            if (ret.status == "success") {
                                //alert("success");
                            }
                        }
                        if (err) {
                            alert("sendImageMessage error: " + JSON.stringify(err));
                        }
                    }
                );
            },
            sendVoiceMessage: function (ctype, targetId, tmpPath, dur) {
                var promise = $q.defer();
                // 发送语音消息
                RongCloudLibPlugin.sendVoiceMessage({
                    conversationType: ctype,
                    targetId: targetId,
                    voicePath: tmpPath,
                    duration: dur,
                    extra: ""
                },
                    function (ret, err) {
                        if (ret) {
                            $scope.lstResult = "sendVoiceMessage:" + JSON.stringify(ret);
                            // TODO:消息此时未发送成功，可以加入样式标明；成功后更新样式
                            if (ret.status == "prepare") {
                                // alert("sendVoiceMessage prepare2:" + JSON.stringify(ret));
                                promise.resolve(data);
                            }
                            // TODO:后续加入发送成功后修改显示样式
                            if (ret.status == "success") {
                                // alert("success");
                            }
                        }
                        if (err) { // TODO:这里需要对错误状态进行判断并友好的提示用户
                            alert("语音消息输入过短! ");
                            //alert("语音消息发送错误: " + JSON.stringify(err));
                        }
                    }
                );
            },
            clearConversition: function (ctype, targetId, tmpPath, dur) {
                var promise = $q.defer();
                RongCloudLibPlugin.clearConversations({
                    conversationTypes: ["PRIVATE", "GROUP"]
                },
                    function (ret, err) {
                        if (ret) {
                            alert("已清除所有会话: " + result.status);
                            promise.resolve();
                        }
                        if (err) {
                            FormateRongyunErr.formate(err);
                        }
                    }
                );
            },
            clearMessagesUnreadStatus: function (targetid, ctype) {
                var promise = $q.defer();
                RongCloudLibPlugin.clearMessagesUnreadStatus({
                    conversationType: type,
                    targetId: targetId
                }, function (ret, err) {
                    // test succeed
                    promise.resolve();
                    if (err) {
                        FormateRongyunErr.formate(err);
                    }
                });
            },
            removeConversation: function (targetid, ctype) {
                var promise = $q.defer();
                RongCloudLibPlugin.removeConversation({
                    conversationType: type,
                    targetId: targetId
                }, function (ret, err) {
                    promise.resolve();
                    //alert(ret.status);
                    if (err) {
                        FormateRongyunErr.formate(err);
                    }
                });
            }
        }
    })
    // 媒体服务(音频)
    .factory('mediaService', function () {
        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();
        var mediaRec;
        var path = "";
        var src = "cordovaIMVoice.amr";
        if (window.cordova && isIOS) {
            path = cordova.file.documentsDirectory;
            src = "cordovaIMVoice.wav";
        } else if (window.cordova) {
            path = cordova.file.externalApplicationStorageDirectory;
        }
        function getMediaURL(s) {
            if (device.platform.toLowerCase() === "android") return path + s;
            return (path + s).replace('file://', '');
        }
        function getNewMediaURL(s) {
            if (device.platform.toLowerCase() === "android") return path + s;
            return "documents://" + s;
        }
        function getPhoneGapPath() {
            // bug
            var path = window.location.pathname;
            path = path.substr(path, path.length - 9);
            if (isIOS) {
                return 'img/vedio-chat.mp3';
            } else {
                //alert('file://' + path + 'img/vedio-chat.mp3');//路径有问题
                return 'file://' + path + 'img/vedio-chat.mp3';
            }
        };
        return {
            playSound: function () {
                //实例化录音类, src:需要播放的录音的路径
                var ring = new Media(getPhoneGapPath(),
                    function () {
                    }, function (err) {
                    }
                );
                //开始播放录音
                ring.play();
            },
            startRecord: function () {
                if (mediaRec) {
                    mediaRec.release();
                }
                //实例化录音类
                mediaRec = new Media(getNewMediaURL(src),
                    function () { },
                    function (err) { }
                );
                //开始录音
                mediaRec.startRecord();
            },
            finishRecord: function () {
                var promise = $q.defer();
                if (mediaRec) {
                    mediaRec.stopRecord();
                    mediaRec.release();
                }
                //实例化录音类, src:需要播放的录音的路径
                mediaRec = new Media(getMediaURL(src),
                    function () {
                        console.log("touchend():Audio Success");
                    },
                    function (err) {
                        console.log("touchend():Audio Error: " + err.code);
                    }
                );
                mediaRec.play();
                mediaRec.stop();

                //在html中显示当前状态
                var counter = 0;
                var timerDur = setInterval(function () {
                    counter = counter + 100;
                    if (counter > 2000) {
                        clearInterval(timerDur);
                    }
                    var dur = mediaRec.getDuration();
                    if (dur > 0) {
                        clearInterval(timerDur);
                        // alert('mediaRec.getDuration():' + dur);
                        // alert('mediaRec.src:' + mediaRec.src);
                        var tmpPath = mediaRec.src;
                        if (isIOS) {
                            tmpPath = path + src;
                        }
                        tmpPath = tmpPath.replace('file://', '');
                        promise.resolve(tmpPath, mediaRec);
                    }
                }, 100);
            }
        }
    })
    // phonertc服务
    .factory('phoneRTCService', function () {
        return {
            createSession: function (isInitiator) {
                if (isInitiator) {
                    sendMessage('[发起视频通话]');
                }
                console.log(new Date().toString() + ': calling to ' +
                    contactName + ', isInitiator: ' + isInitiator);
                // 自个部署的服务器turn server
                var config = {
                    isInitiator: isInitiator,
                    stun: {
                        host: 'stun:115.29.51.196'
                    },
                    turn: {
                        host: 'turn:115.29.51.196',
                        username: 'test',
                        password: 'test'
                    },
                    streams: {
                        audio: true, // 支持音频
                        video: true, // 支持视频
                    }
                };

                var session = new cordova.plugins.phonertc.Session(config);
            }
        }
    });
