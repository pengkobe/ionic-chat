angular.module('chat.controllers', [])

    /**聊天界面 */
    .controller('contacts', function ($scope, $state,
        $ionicScrollDelegate, $timeout, $interval, Friends, Groups, $rootScope,
        newMessageEventService, FindFriendsReq, findTeamsReq, rongyunService,
        unreadMessages, chatUnreadMessage) {
        $scope.data = {
            searchword: ''
        };
        $scope.clearKeyword = function (data) {
            data.scorearchword = '';
        }
        // === tab切换[消息/联系人] ===
        if (!$scope.currentFeedsType) {
            $scope.currentFeedsType = "contacttab";
        }
        $scope.messagetab = "messagetab";
        $scope.contacttab = "contacttab";
        var scrollPositonRec = { 'top': 0, 'left': 0 };
        var scrollPositonJob = { 'top': 0, 'left': 0 };
        $scope.tabswitch = function (feedsType) {
            if ($scope.currentFeedsType == "messagetab") {
                scrollPositonRec = $ionicScrollDelegate.getScrollPosition();
            } else if ($scope.currentFeedsType == "contacttab") {
                scrollPositonJob = $ionicScrollDelegate.getScrollPosition();
            }

            if (feedsType == "messagetab") {
                $ionicScrollDelegate.scrollTo(scrollPositonRec.left, scrollPositonRec.top);
            } else if (feedsType == "contacttab") {
                $ionicScrollDelegate.scrollTo(scrollPositonJob.left, scrollPositonJob.top);
            }

            $scope.currentFeedsType = feedsType;
        }

        $scope.groups = [];
        $scope.friends_list = [];
        $scope.friends_message = [];
        // 好友/团队邀请
        $scope.friendinviteList = [];
        $scope.groupinviteList = [];
        // 加载好友列表
        $scope.navCharArray = [];
        Friends.all(function (data) {
            $scope.friends_list = data;
            var alphaArr = [];
            var alpha_now = '';
            for (var i = 0; i < data.length; i++) {
                if (alpha_now != data[i].alpha) {
                    alphaArr.push({
                        firstChar: data[i].alpha,
                        id: data[i].id
                    });
                    alpha_now = data[i].alpha;
                }
            }
            $scope.navCharArray = alphaArr;
        });
        // 加载群组
        Groups.all(function (data) {
            $scope.groups = data;
        });
          // 加载好友邀请
        FindFriendsReq.all(function (data) {
            $scope.friendinviteList = data;
        });

        $scope.navCallBack = function () { }

        // 加载群组邀请
        findTeamsReq.all(function (data) {
            $scope.groupinviteList = data;
        });
        // 同意与拒绝请求,成功后删掉记录并刷新好友列表
        function responseReq(obj, $index, type) {
            if (type == "PRIVATE") {
                $scope.friends_list.unshift(obj);
                $timeout(function () {
                    $scope.friendinviteList.splice($index, 1);
                }, 400);
            } else {
                $scope.groups.unshift(obj);
                $timeout(function () {
                    $scope.groupinviteList.splice($index, 1);
                }, 400);
            }
        }
        // 添加团队与添加好友
        $scope.addGroup = function () {
            $state.go('tab.addGroup');
        };
        $scope.addFriend = function () {
            $state.go('tab.addFriend');
        };

        // === 融云消息监听 ===
        var newMsgCallBack = function (d, data) {
            jsonMsg = JSON.parse(data);
            jsonMsg.unreadMessageCount = "1";
            var target;
            var groupMemberinfo = null;
            if (jsonMsg.conversationType == "PRIVATE") {
                var friends = $scope.friends_list;
                var friend_nums = friends.length;
                for (var i = 0; i < friend_nums; i++) {
                    if (friends[i].id == jsonMsg.targetId) {
                        target = friends[i];
                        break;
                    }
                }
            } else if (jsonMsg.conversationType == "GROUP") {
                var groups = $scope.groups;
                var groups_nums = groups.length;
                for (var i = 0; i < groups_nums; i++) {
                    if (groups[i].id == jsonMsg.targetId) {
                        target = groups[i];
                        groupMemberinfo = Groups.getGroupMember(jsonMsg.targetId, jsonMsg.senderUserId);
                        break;
                    }
                }
            }
            jsonMsg = myUtil.resolveCon(jsonMsg, 1, target, groupMemberinfo);
            var friends_message = $scope.friends_message;
            var friendLen = friends_message.length;
            for (var i = 0; i < friendLen; i++) {
                if (friends_message[i].targetId == jsonMsg.targetId) {
                    $scope.friends_message[i].unreadMessageCount = $scope.friends_message[i].unreadMessageCount + 1;
                    $scope.friends_message[i].latestMessage = jsonMsg.latestMessage;
                    return;
                }
            }
            // alert('NEW MEG push now');
            $scope.friends_message.push(jsonMsg);
        }
        newMessageEventService.listen(newMsgCallBack);
        // 清除所有会话
        $scope.clearConversition = function () {
            rongyunService.clearConversations().then(function () {
                $scope.$apply(function () {
                    $scope.friends_message = [];
                });
            });
        }
        // 将某人消息设为已读
        function clearSomeoneConversition(targetId, type) {
            rongyunService.clearMessagesUnreadStatus(targetId, type).then(function () { });
        }
        // 将某人消息删除
        function removeSomeoneConversition(targetId, type) {
            rongyunService.removeConversation(targetId, type).then(function () { });
        }

        // 是否已存在消息
        function findInFriends(val) {
            var friends_message = $scope.friends_message;
            var friendLen = friends_message.length;
            for (var i = 0; i < friendLen; i++) {
                if (friends_message[i].targetId == val) {
                    return i;
                }
            }
            return -1;
        }

        // 设为已读
        $scope.markMessage = function (index) {
            var message = $scope.friends_message[index];
            chatUnreadMessage.addUnreadMessage(-message.unreadMessageCount);
            message.unreadMessageCount = 0;
            clearSomeoneConversition(message.targetId, message.conversationType);
        };
        // 删除消息
        // TODO：需要清除消息状态，否则刷新后会再出来(待测)
        $scope.deleteMessage = function (index) {
            var message = $scope.friends_message[index];
            chatUnreadMessage.addUnreadMessage(-message.unreadMessageCount);
            $scope.friends_message.splice(index, 1);
            removeSomeoneConversition(message.targetId, message.conversationType);
        };

        $scope.gotoChatDetils = function (friend, $index) {
            // 清空未读消息
            $scope.friends_message[$index].unreadMessageCount = 0;
            var target;
            if (friend.conversationType == "PRIVATE") {
                var friends = $scope.friends_list;
                var friend_nums = friends.length;
                for (var i = 0; i < friend_nums; i++) {
                    if (friends[i].id == friend.targetId) {
                        target = friends[i];
                        break;
                    }
                }
            } else if (friend.conversationType == "GROUP") {
                var groups = $scope.groups;
                var groups_nums = groups.length;
                for (var i = 0; i < groups_nums; i++) {
                    if (groups[i].id == friend.targetId) {
                        target = groups[i];
                        break;
                    }
                }
            }
            // 转到聊天主界面
            var name = target ? target.name : '[陌生人]';
            $state.go("tab.chatDetail", { targetId: friend.targetId, name: name, conversationType: friend.conversationType });
        }
        // 获取消息列表
        var getConversationList = function () {
            rongyunService.getConversationList().then(function (result) {
                var resultLen = result.length;
                var target;
                var groupMemberinfo = null;
                for (var i = 0; i < resultLen; i++) {
                    if (result[i].conversationType == "PRIVATE") {
                        target = Friends.get(result[i].targetId);
                    } else if (result[i].conversationType == "GROUP") {
                        target = Groups.get(result[i].targetId);
                        try {
                            groupMemberinfo = Groups.getGroupMember(result[i].targetId, result[i].senderUserId);
                        } catch (e) {
                            alert('groupMemberinfo err:' + JSON.stringify(e));
                            break;
                        }
                    }
                    result[i] = myUtil.resolveCon(result[i], 0, target, groupMemberinfo);
                }
                var messageLen = 0;
                for (var j = 0; j < resultLen; j++) {
                    var index = findInFriends(result[j].targetId);
                    if (index == -1) {
                        $scope.friends_message.push(result[j]);
                        messageLen += result[j].unreadMessageCount;
                    } else {
                        $scope.friends_message[index].unreadMessageCount = result[j].unreadMessageCount;
                        $scope.friends_message[index].latestMessage = result[j].latestMessage;
                        messageLen += result[j].unreadMessageCount;
                    }
                }
                chatUnreadMessage.setUnreadMessage(messageLen);
            });
        }
        // 融云初始化
        var init = function () {
            $scope.friends_message = [];
            // TODO:立即加载在信息联系人未加载完成的情况下失效
            // getConversationList();
            $interval(function () {
                getConversationList();
            }, 3000);
        }

        //init();

        initTest();
        function initTest() {
            $scope.friends_message = [];
            var messageLen = 0;
            $interval(function () {
                var ms = unreadMessages.getUnreadList();
                ms = myUtil.resolveCon(ms, 0, null);
                var msLen = ms.length;
                messageLen = 0;
                for (var j = 0; j < msLen; j++) {
                    var index = findInFriends(ms[j].targetId);
                    if (index == -1) {
                        messageLen += ms[j].unreadMessageCount;
                        $scope.friends_message.push(ms[j]);
                    } else {
                        $scope.friends_message[index].unreadMessageCount = ms[j].unreadMessageCount;
                        messageLen += ms[j].unreadMessageCount;
                        $scope.friends_message[index].latestMessage = ms[j].latestMessage;
                    }
                }
                chatUnreadMessage.setUnreadMessage(messageLen);
            }, 10000);
        }
    });
