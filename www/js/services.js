angular.module('starter.services', [])
    // 用户全局引用
    .service("currentUser", function (CacheFactory) {
        var userinfo = null;
        var projectinfo = null;

        var userservive = {
            getUserinfo: function () {
                if (userinfo == null) {
                    userinfo = angular.fromJson(CacheFactory.get('UserAccount'));
                }
                return userinfo;
            },
            setUserinfo: function (val) {
                userinfo = val;
                return;
            },
            getProjectinfo: function () {
                return projectinfo;
            },
            setProjectinfo: function (val) {
                projectinfo = val;
                return;
            }
        }
        return userservive;
    })
    // 视频服务
    .factory('signaling', function (socketFactory, baseUrl) { // 聊天服务
        var myIoSocket = io.connect('http://115.29.51.196:5000/chat');
        mySocket = socketFactory({
            ioSocket: myIoSocket
        });
        return mySocket;
    })
    // 好友服务
    .factory('Friends', function (RequestUrl, getFriends, signaling, currentUser, $interval) {
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
                    obj.portrait = retdata[i].headimgurl ? RequestUrl + 'Images/Photo/' + retdata[i].headimgurl : null;
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
                signaling.emit('checkOnline', userids);
                checkOnlineCallback(callback);
            });
        }
        // 刷新在线列表(10s)
        $interval(function () {
            if (loaded) {
                signaling.emit('checkOnline', userids);
            }
        }, 10000);
        // 获取在线列表
        function checkOnlineCallback(callback) {
            // 确保事件只注册一次
            if (!loaded) {
                loaded = true;
                signaling.on('checkOnline_suc', function (ids) {
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
            add: function (friend) {
            }
        }
    })
    // 工作组服务
    .factory('Groups', function (getTeams, RequestUrl, signaling, currentUser, projectTeam,
        getGroupMembers, $interval) {
        var groups = [];
        var groupsMenmberinfo = [];
        var globalUser = currentUser;
        var curUID = globalUser.getUserinfo().UserID;
        var projectCode = globalUser.getUserinfo().PCode;

        // 后台请求数据
        function loadData(callback) {
            getTeams(curUID, function (data) {
                // ==此方法会造成一段时间无数据(加载数据会造成时延)==
                groups = [];
                groupsMenmberinfo = [];
                // ==

                // 获取时即同步
                var data = data.data;
                var dataLen = data.length;
                for (var i = 0; i < dataLen; i++) {
                    var obj = {};
                    var tempdata = data[i];
                    var rawGroupID = tempdata.GroupID;
                    obj.id = 'cre_' + rawGroupID;
                    obj.number = tempdata.Members.length + 1;// 群主
                    obj.max_number = 30;
                    obj.name = tempdata.GroupName;
                    obj.conversationType = 'GROUP';
                    obj.type = 'create';
                    obj.portrait = null;//'亿达别苑维修工_200.png';
                    groups.push(obj);
                    // 同步群
                    signaling.emit('findGroup', obj.id, obj.name, tempdata.Members, '');
                    (function (rid, compid) {
                        getGroupMembers(rid, function (data) {
                            groupsMenmberinfo.push({ id: compid, members: data.data });
                        });
                    })(rawGroupID, obj.id);
                }
                // ===项目组===
                // 排除非项目人员
                if (!projectCode) {
                    if (callback) {
                        callback(groups)
                    }
                } else {
                    // ===TODO： 优化 ===
                    projectTeam(projectCode, function (data) {
                        var obj = {};
                        var userids = [];
                        var data = data.data;
                        var dataLen = data.length;
                        for (var i = 0; i < dataLen; i++) {
                            userids.push(data[i].UserID);
                        }
                        obj.id = "prj_" + projectCode;
                        obj.number = dataLen;
                        obj.max_number = 10;
                        obj.name = globalUser.getProjectinfo()[0].PName + '项目组';
                        obj.conversationType = 'GROUP';
                        obj.type = 'project';
                        obj.portrait = null;
                        groups.unshift(obj);
                        // 同步群(项目组)
                        signaling.emit('findGroup', obj.id, obj.name, userids, '');
                        groupsMenmberinfo.push({ id: obj.id, members: data.data });
                        if (callback) {
                            callback(groups)
                        }
                    });
                }
            });
        }

        //TODO:组判重
        function groupsIsExist() {
        }
        //TODO:组员判重
        function menmberIsExist() {
        }

        return {
            all: function (callback) {
                if (groups.length > 0) {
                    callback(groups);
                }
                else {
                    loadData(callback);
                    $interval(function () {
                        loadData(callback);
                    }, 10000);
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
            httpXhr.getData('UserInfo_newBLL.getFriends', { UserID: userid }).then(function (data) {
                callback(data);
            });
        }
        return getFriends;
    })
    // 加载团队
    .service("getTeams", function ($http, httpXhr, $timeout) {
        /// UserID
        function getTeams(userid, callback) {
            httpXhr.getData('UserInfo_newBLL.getTeams', { UserID: userid }).then(function (data) {
                callback(data);
            });
        }
        return getTeams;
    })
    // 加载项目组
    .service("projectTeam", function ($http, httpXhr) {
        function projectTeam(projectCode, callback) {
            // 项目编号有可能不存在
            if (!projectCode) {
                return;
            }
            httpXhr.getData('UserInfo_newBLL.GetUserInfoByPCode', { projectCode: projectCode }).then(function (data) {
                callback(data);
            });
        }
        return projectTeam;
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
    // 过去团队成员
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
                var arr = [
                    {
                        targetId: 11, senderUserId: 1, sentTime: '2016-06-01 10:00', unreadMessageCount: 2,
                        latestMessage: 'i am bat11!', conversationType: 'PRIVATE', conversationTitle: '陌生人'
                    },
                    {
                        targetId: 12, senderUserId: 1, sentTime: '2016-06-01 10:00', unreadMessageCount: 2,
                        latestMessage: 'i am bat12!', conversationType: 'PRIVATE', conversationTitle: '陌生人'
                    },
                    {
                        targetId: 14, senderUserId: 1, sentTime: '2016-06-01 10:00', unreadMessageCount: 2,
                        latestMessage: 'i am bat14!', conversationType: 'PRIVATE', conversationTitle: '陌生人'
                    },
                    {
                        targetId: 13, senderUserId: 1, sentTime: '2016-06-01 10:00', unreadMessageCount: 2,
                        latestMessage: 'i am bat13!', conversationType: 'PRIVATE', conversationTitle: '陌生人'
                    },
                    {
                        targetId: 16, senderUserId: 1, sentTime: '2016-06-01 10:00', unreadMessageCount: 2,
                        latestMessage: 'i am bat!12', conversationType: 'PRIVATE', conversationTitle: '陌生人'
                    },
                ];
                // 模拟新消息
                $timeout(function () {
                    $rootScope.$broadcast("newMsg", '{"targetId": 11, "senderUserId": 1, "sentTime":"2016-06-01 10:00", ' +
                        '"content": {"text":"new message"}, "conversationType": "PRIVATE", "objectName": "RC:TxtMsg"}');
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
    // 照相及相册
    .factory('PhotoAndImages', function ($q) { // 照片相关
        return {
            // 拍照
            getPhoto: function (opts) {
                var defer = $q.defer();
                var option1 = {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    targetHeight: 800,
                    targetWidth: 800,
                    correctOrientation: true,
                    encodingType: Camera.EncodingType.PNG
                };
                if (opts) {
                    option1 = opts;
                }
                navigator.camera.getPicture(function onSuccess(data) {
                    defer.resolve(data);
                }, function onError() {
                }, option1);
                return defer.promise;
            },
            // 相册
            getImages: function (opts) {
                var defer = $q.defer();
                var option2 = {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    targetWidth: 800,
                    targetHeight: 800,
                    encodingType: Camera.EncodingType.PNG
                };
                if (opts) {
                    option2 = opts;
                }
                navigator.camera.getPicture(function onSuccess(data) {
                    defer.resolve(data);
                }, function onError(err) {
                    alert('相册取照片出错了！！' + err);
                }, option2);
                return defer.promise;
            }
        }
    })
    .factory('UpdateService', function ($log, $q) {
        var fs = new CordovaPromiseFS({
            Promise: Promise
        });

        var loader = new CordovaAppLoader({
            fs: fs,
            serverRoot: 'http://120.24.54.92:9111',
            localRoot: 'www',
            cacheBuster: true, // make sure we're not downloading cached files.
            checkTimeout: 10000, // timeout for the "check" function - when you loose internet connection
            mode: 'mirror',
            manifest: 'manifest.json' + "?" + Date.now()
        });

        return {
            // Check for new updates on js and css files
            check: function () {
                var defer = $q.defer();
                loader.check().then(function (updateAvailable) {
                    if (updateAvailable) {
                        defer.resolve(updateAvailable);
                    }
                    else {
                        defer.reject(updateAvailable);
                    }
                });
                return defer.promise;
            },
            // Download new js/css files
            download: function (onprogress) {
                var defer = $q.defer();
                loader.download(onprogress).then(function (manifest) {
                    defer.resolve(manifest);
                }, function (error) {
                    defer.reject(error);
                });
                return defer.promise;
            },
            // Update the local files with a new version just downloaded
            update: function (reload) {
                alert('ok');
                return loader.update(reload);
            },
            // Check wether the HTML file is cached
            isFileCached: function (file) {
                if (angular.isDefined(loader.cache)) {
                    return loader.cache.isCached(file);
                }
                return false;
            },
            // returns the cached HTML file as a url for HTTP interceptor
            getCachedUrl: function (url) {
                if (angular.isDefined(loader.cache)) {
                    return loader.cache.get(url);
                }
                return url;
            }
        };
    })
    .factory('HttpFactory', function ($http, $ionicPopup, $ionicLoading, myNote, $timeout) {

        /**
         * method – {string} – HTTP method (e.g. 'GET', 'POST', etc)
         * url – {string} – Absolute or relative URL of the resource that is being requested.
         * params – {Object.<string|Object>} – Map of strings or objects which will be turned to ?key1=value1&key2=value2 after the url. If the value is not a string, it will be JSONified.
         * data – {string|Object} – Data to be sent as the request message data.
         * headers – {Object} – Map of strings or functions which return strings representing HTTP headers to send to the server. If the return value of a function is null, the header will not be sent.
         * xsrfHeaderName – {string} – Name of HTTP header to populate with the XSRF token.
         * xsrfCookieName – {string} – Name of cookie containing the XSRF token.
         * transformRequest – {function(data, headersGetter)|Array.<function(data, headersGetter)>} – transform function or an array of such functions. The transform function takes the http request body and headers and returns its transformed (typically serialized) version. See Overriding the Default Transformations
         * transformResponse – {function(data, headersGetter)|Array.<function(data, headersGetter)>} – transform function or an array of such functions. The transform function takes the http response body and headers and returns its transformed (typically deserialized) version. See Overriding the Default Transformations
         * cache – {boolean|Cache} – If true, a default $http cache will be used to cache the GET request, otherwise if a cache instance built with $cacheFactory, this cache will be used for caching.
         * timeout – {number|Promise} – timeout in milliseconds, or promise that should abort the request when resolved.
         * withCredentials - {boolean} - whether to set the withCredentials flag on the XHR object. See requests with credentials for more information.
         * responseType - {string} - see requestType.
         */
        var count = 0;
        var send = function (config) {

            !!config.scope && (config.scope.loading = true);

            !!config.mask && $ionicLoading.show({
                template: typeof config.mask == "boolean" ? '请稍等...' : config.mask
            });

            config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

            config.method == 'post' && (config.data = config.data || {});

            ionic.extend(config, {
                timeout: 15000
            });
            var http = $http(config);
            http.catch(function (error) {
                $timeout(function () {
                    $ionicLoading.hide();
                    myNote.myNotice('请求出错,请检查网络！');
                }, 3000);
                if (error.status == 0) {
                    count++;
                    if (count > 7) {
                        count = 0;
                        myNote.myNotice('网络出现问题，请检查网络');
                    }
                }
                // else if (status == 403 ) {
                //        error.data = {
                //            template: '/(ㄒoㄒ)/~~403'
                //        }
                //    } else {
                //        error.data = {
                //            template: '错误信息都在这了：' + JSON.stringify(error.data)
                //        }
                //    }
                //    $ionicPopup.alert({
                //        title: '悲剧了...',
                //        template: error.data.template,
                //        buttons: [
                //            {
                //                text: '算了',
                //                type: 'button-balanced'
                //            }
                //        ]
                //    });
            });
            http.finally(function () {
                !!config.scope && (config.scope.loading = false);
                !!config.mask && $ionicLoading.hide();
            });
            return http;
        };
        return {
            send: send
        }
    })
    .factory('CacheFactory', function ($window) {
        var save = function (key, value) {
            if (!!value && value != null) {
                $window.localStorage.setItem(key, typeof value == 'object' ? JSON.stringify(value) : value);
            }
        };
        var get = function (key) {
            return $window.localStorage.getItem(key) || null;
        };
        var remove = function (key) {
            $window.localStorage.removeItem(key);
        };
        var removeAll = function () {
            $window.localStorage.removeItem('Login');
            $window.localStorage.removeItem('UserAccount');
            $window.localStorage.removeItem('rongyunToken');
        };
        return {
            save: save,
            get: get,
            remove: remove,
            removeAll: removeAll
        };
    })
    .factory('myNote', function ($ionicLoading, $timeout) {
        return {
            myNotice: function (msg, timeout, prev, post) {
                $ionicLoading.show({ template: msg });
                $timeout(function () {
                    prev && prev();
                    $ionicLoading.hide();
                    post && post();
                }, timeout || 2000);
                return false;
            }
        }
    })
    ;