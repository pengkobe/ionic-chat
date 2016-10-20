;
var chats = angular.module('chat.services', []);

/**
 * Signaling
 * socket.io视频服务实例
 */
chats.provider('Signaling', function () {
    this.backendUrl = "";
    this.setBackendUrl = function (newUrl) {
        if (this.backendUrl == "") {
            this.backendUrl = newUrl;
        }
    }
    this.$get = function ($http, socketFactory) {
        var self = this;
        var myIoSocket = io.connect(self.backendUrl);
        mySocket = socketFactory({
            ioSocket: myIoSocket
        });
        return myIoSocket;
    }
});

// 用户全局引用
chats.factory('initRong', function ($rootScope, $state, _appKey) {
    function initRong(token) {
        $rootScope.arrMsgs = new Array();
        $rootScope.arrCons = new Array();
        // 融云初始化
        RongCloudLibPlugin.init({
            appKey: _appKey
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
    .factory('Friends', function (RequestUrl, getFriends, Signaling, currentUser, $interval) {
        var loaded = false;
        var friends = [];
        var userids = [];
        var curUID = currentUser.getUserinfo().UserID;

        // 后台请求数据
        function loadData(callback) {
            getFriends(curUID, function (data) {
                friends = [];
                var retdata = data.data;
                var dataLen = retdata.length;
                for (var i = 0; i < dataLen; i++) {
                    var obj = {};
                    obj.id = retdata[i].UserID;
                    obj.name = retdata[i].UserName == null ? "无名(" + retdata[i].UserID + ")" : retdata[i].UserName;
                    obj.alpha = makePy(obj.name)[0][0].toUpperCase();
                    obj.conversationType = 'PRIVATE';
                    obj.online = '0';
                    obj.Mobile = retdata[i].Mobile;
                    var portrait = retdata[i].headimgurl ? (retdata[i].headimgurl.indexOf("http") == -1 ? RequestUrl + 'Images/Photo/' + retdata[i].headimgurl : retdata[i].headimgurl) : null;
                    obj.portrait = portrait;
                    friends.push(obj);
                }

                // 按字母排序
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
                    friends[m].scrollHeight = m * 42 + alphaCount * 20;
                    userids.push(tmp.id);
                }
                // 获取在线列表
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
            // 确保事件只注册一次
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
                if (friends.length > 0) {
                    callback(friends);
                } else {
                    loadData(callback);
                    $interval(function () {
                        loadData(callback);
                    }, 3000);
                }
            },
            //（获取某好友）
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
            add: function (friend) { }
        }
    })
    // 工作组服务
    .factory('Groups', function (getTeams, RequestUrl, Signaling, currentUser, $rootScope,
        getGroupMembers, $interval) {
        var groups = [];
        var groupsMenmberinfo = [];
        var globalUser = currentUser;
        var curUID = globalUser.getUserinfo().UserID;
        var projectCode = globalUser.getUserinfo().PCode;

        // 后台请求数据
        function loadData(callback) {
            projectCode = globalUser.getUserinfo().PCode;
            getTeams.load(curUID).then(function (teamList) {
                // ==此方法会造成一段时间无数据(加载数据会造成时延)==
                groups = [];
                groupsMenmberinfo = [];
                var dataLen = teamList.length;
                for (var i = 0; i < dataLen; i++) {
                    teamList[i].conversationType = 'GROUP';
                    teamList[i].type = 'create';
                    (function (compid) {
                        var rid = compid.substr(4);
                        getGroupMembers(rid, function (data) {
                            groupsMenmberinfo.push({ id: compid, members: data.data });
                        });
                    })(teamList[i].id);
                }
                groups = teamList;
                callback(groups)
            });
        }

        //TODO:组判重
        function groupsIsExist() { }
        //TODO:组员判重
        function menmberIsExist() { }

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
            getGroupMember: function (groupId, userid) {
                var retIndex = -1;
                var arrLen = groupsMenmberinfo.length;
                for (var i = 0; i < arrLen; i++) {
                    var tmpgroup = groupsMenmberinfo[i];
                    if (tmpgroup.id == groupId && tmpgroup.members) {
                        var tmpmemLen = tmpgroup.members.length;
                        for (var j = 0; j < tmpmemLen; j++) {
                            var tempUser = tmpgroup.members[j];
                            if (tempUser.UserID == userid) {
                                return {
                                    id: tempUser.UserID,
                                    name: tempUser.UserName,
                                    img: tempUser.headimgurl
                                };
                            };
                        }
                    }
                }
                return null;
            }
        }
    })
    // 好友请求服务
    .service("ResFriend", function ($http, httpXhr, $timeout) {
        ///UserID 自己
        ///FriendID:接收人
        ///state{0：发邀请，1:接受，-1：拒绝}
        function ResFriend(UserID, FriendID, state, callback) {
            var obj = { UserID: +UserID, FriendID: +FriendID, state: +state };
            var data = JSON.stringify(obj);
            httpXhr.getData('UserInfo_newBLL.ResFriend', { model: data }).then(function (data) {
                callback(data);
            });
        }
        return ResFriend;
    })
    // 群组请求服务
    .service("ResTeam", function ($http, httpXhr, $timeout) {
        ///groupID 群组名称
        ///MemberID:自己
        ///state{0：发邀请，1:接受，-1：拒绝}
        function ResTeam(groupID, MemberID, state, callback) {
            var obj = { groupID: groupID.substr(4), MemberID: MemberID, state: state };
            var data = JSON.stringify(obj);
            httpXhr.getData('UserInfo_newBLL.ResTeam', { model: data }).then(function (data) {
                callback(data);
            });
        }
        return ResTeam;
    })
    // 加载好友
    .service("getFriends", function ($http, httpXhr, $timeout) {
        /// UserID
        function getFriends(userid, callback) {
            var data = JSON.parse('{"data":[{"UserID":16,"IsProject":true,"UserName":"亿达别苑维修工","UserAccount":"ydwxg","headimgurl":"nxt.png"},{"UserID":17,"IsProject":true,"UserName":"亿达别苑客服","UserAccount":"ydkf","headimgurl":"nxt.png"},{"UserID":18,"IsProject":true,"UserName":"亿达别苑工程主管","UserAccount":"ydgczg","headimgurl":"nxt.png"},{"UserID":384,"IsProject":true,"UserName":"彭奕","UserAccount":"py","headimgurl":"15602452846-201609051736.png"},{"UserID":386,"IsProject":true,"UserName":"刘新琼","UserAccount":"lxq","headimgurl":"lxq-20161010177.png"},{"UserID":388,"IsProject":true,"UserName":"袁晓勇","UserAccount":"yxy","headimgurl":"13760425110-201609191259.png"},{"UserID":412,"IsProject":true,"UserName":"何总","UserAccount":"heyc","headimgurl":"heyc-201609142139.png"},{"UserID":414,"IsProject":true,"UserName":"万华利","UserAccount":"wanhuali","headimgurl":null},{"UserID":415,"IsProject":true,"UserName":"李建民","UserAccount":"lijm","headimgurl":"lijm-201609220947.png"},{"UserID":417,"IsProject":true,"UserName":"肖荣界","UserAccount":"xiaorj","headimgurl":null},{"UserID":419,"IsProject":true,"UserName":"李文帅","UserAccount":"liws","headimgurl":null},{"UserID":420,"IsProject":true,"UserName":"陈国辉","UserAccount":"chengh","headimgurl":null},{"UserID":421,"IsProject":true,"UserName":"叶昱君","UserAccount":"yeyj","headimgurl":null},{"UserID":422,"IsProject":true,"UserName":"郭仲春","UserAccount":"guozc","headimgurl":null},{"UserID":423,"IsProject":true,"UserName":"李斌","UserAccount":"lib","headimgurl":null},{"UserID":424,"IsProject":true,"UserName":"周文","UserAccount":"zhouw","headimgurl":"zhouw-201609202117.png"},{"UserID":425,"IsProject":true,"UserName":"田克清","UserAccount":"tiankq","headimgurl":null},{"UserID":426,"IsProject":true,"UserName":"戴白露","UserAccount":"daibl","headimgurl":null},{"UserID":427,"IsProject":true,"UserName":"黄金云","UserAccount":"haungjy","headimgurl":null},{"UserID":428,"IsProject":true,"UserName":"高明霞","UserAccount":"gaomx","headimgurl":null},{"UserID":431,"IsProject":true,"UserName":"钟盛樱","UserAccount":"zhongsy","headimgurl":null},{"UserID":432,"IsProject":true,"UserName":"朱雷","UserAccount":"zhul","headimgurl":null},{"UserID":433,"IsProject":true,"UserName":"戴露","UserAccount":"dl","headimgurl":"dl-201609191259.png"},{"UserID":434,"IsProject":true,"UserName":"黄健","UserAccount":"hj","headimgurl":"hj-201609202146.png"},{"UserID":435,"IsProject":true,"UserName":"周枫","UserAccount":"zf","headimgurl":"zf-201609202116.png"},{"UserID":436,"IsProject":true,"UserName":"蔡强","UserAccount":"cq","headimgurl":null},{"UserID":437,"IsProject":true,"UserName":"宋细辉","UserAccount":"sxh","headimgurl":"sxh-201609191313.png"},{"UserID":438,"IsProject":true,"UserName":"关观海","UserAccount":"ggh","headimgurl":null},{"UserID":439,"IsProject":true,"UserName":"安志强","UserAccount":"azq","headimgurl":null},{"UserID":440,"IsProject":true,"UserName":"欧阳德才","UserAccount":"oydc","headimgurl":null},{"UserID":441,"IsProject":true,"UserName":"卢蝶","UserAccount":"ld","headimgurl":"ld-201609201557.png"},{"UserID":442,"IsProject":true,"UserName":"李萍","UserAccount":"lp","headimgurl":"lp-201609200945.png"},{"UserID":443,"IsProject":true,"UserName":"胡小振","UserAccount":"hxz","headimgurl":null},{"UserID":444,"IsProject":true,"UserName":"林志章","UserAccount":"lzz","headimgurl":null}]}');
            callback(data);
        }
        return getFriends;
    })
    // 加载团队
    .service("getTeams", function ($http, httpXhr, $timeout, $q) {
        /// UserID
        // function getTeams(userid, callback) {
        //     httpXhr.getData('urk', { UserID: userid }).then(function (data) {
        //         callback(data);
        //     });
        // }
        var defer = $q.defer();
        var data = [
            { id: 'prj_8', number: 12, max_number: 30, name: '香年广场', portrait: null },
            { id: 'prj_11', number: 12, max_number: 30, name: '安徽大厦', portrait: null },
            { id: 'prj_15', number: 12, max_number: 30, name: '有色大厦', portrait: null }
        ];

        $timeout(function () {
            defer.resolve(data);
        }, 2000);
        this.load = function (userid) {
            return defer.promise;
        }
    })
    // 加载好友请求
    .service("FindFriendsReq", function ($http, httpXhr, $interval) {
        /// UserID
        var friendRquestList = [];
        var intervalid = 0;

        function FindFriendsReq(userid, callback) {
            httpXhr.getData('UserInfo_newBLL.FindFriendsReq', { UserID: userid }).then(function (data) {
                var retData = data.data;
                var dataLen = retData.length;
                friendRquestList = [];
                for (var i = 0; i < dataLen; i++) {
                    var friendRquest = {};
                    friendRquest.id = retData[i].UserID;
                    friendRquest.name = retData[i].UserName;
                    friendRquest.info = "[" + retData[i].UserName + "]" + "请求添加您为好友！";
                    friendRquest.portrait = retData[i].headimgurl;
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
                    /// 10s
                    intervalid = $interval(function () {
                        FindFriendsReq(userid, callback);
                    }, 10000);
                }
            }
        };
        return friendsReqApi;
    })
    // 加载团队请求
    .service("findTeamsReq", function ($http, httpXhr, $interval) {
        var teamRquestList = [];
        var intervalid = 0;
        /// UserID
        function findTeamsReq(userid, callback) {
            httpXhr.getData('UserInfo_newBLL.findTeamsReq', { UserID: userid }).then(function (data) {
                teamRquestList = [];
                var retData = data.data;
                var dataLen = retData.length;
                for (var i = 0; i < dataLen; i++) {
                    var groupRquest = {};
                    var tempdata = retData[i];
                    groupRquest.id = 'cre_' + tempdata.GroupID;
                    groupRquest.name = tempdata.GroupName;
                    groupRquest.info = (tempdata.UserName == null ? "(无名)" : tempdata.UserName) + "邀您加入群:" + "[" + tempdata.GroupName + "]";
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
                    clearInterval(intervalid);
                    intervalid = $interval(function () {
                        findTeamsReq(userid, callback);
                    }, 10000);
                }
            }
        };
        return teamsReqApi;
    })
    //团队成员
    .service("getGroupMembers", function ($http, httpXhr) {
        function getGroupMembers(groupID, callback) {
            if (!groupID) {
                return;
            }
            httpXhr.getData('UserInfo_newBLL.getGroupMembers', { groupID: groupID }).then(function (data) {
                callback(data);
            });
        }
        return getGroupMembers;
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
            // { id: 'grp6', username: 'grp6', portrait: 'img/personPhoto.png'}
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
    .factory('mediaService', function () {
        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();
        var mediaRec;
        var path = "";
        // media路径处理
        var src = "cordovaIMVoice.amr";
        if (isIOS) {
            // path = cordova.file.documentsDirectory;
            src = "cordovaIMVoice.wav";
        } else {
            // path = cordova.file.externalApplicationStorageDirectory;
        }
        // url辅助方法
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
            if (isIOS) {// ios
                return 'img/vedio-chat.mp3';
            } else {
                //alert('file://' + path + 'img/vedio-chat.mp3');
                //路径有问题
                return 'file://' + path + 'img/vedio-chat.mp3';
            }
        };
        return {
            playSound: function () {
                //实例化录音类, src:需要播放的录音的路径
                var ring = new Media(getPhoneGapPath(),
                    // 成功操作
                    function () {
                    },
                    // 失败操作
                    function (err) {
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
                    // 录音执行函数
                    function () { },
                    // 录音失败执行函数
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
                    // 成功操作
                    function () {
                        console.log("touchend():Audio Success");
                    },
                    // 失败操作
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
    .factory('phoneRTCService', function () {
        return {
            createSession: function (isInitiator) {
                if (isInitiator) {
                    sendMessage('[发起视频通话]');
                }
                console.log(new Date().toString() + ': calling to ' +
                    contactName + ', isInitiator: ' + isInitiator);
                // 自个服务器 turn server
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