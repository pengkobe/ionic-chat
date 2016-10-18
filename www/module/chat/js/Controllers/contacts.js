angular.module('chat.controllers')
    // 协同主界面
    // todo：
    // 1. 根据项目编号切换联系人
    .controller('contacts', function ($scope, $state, $location, $ionicLoading,
        $ionicScrollDelegate, $timeout, $interval, Friends, Groups, $rootScope, ResFriend,
        $ionicPopup, newMessageEventService,FindFriendsReq, findTeamsReq,
        ResTeam, unreadMessages, chatUnreadMessage, currentUser, FormateRongyunErr) {
        $scope.data = {
            searchword: ''
        };
        $scope.clearKeyword = function (data) {
            data.scorearchword = '';
        }
        // 初始化
        $scope.$on("$ionicView.beforeEnter", function () {
            // todo
            $scope.popup = {
                isPopup: false,
                index: 0
            };
        });
        // === tab切换 ===
        if (!$scope.currentFeedsType) {
            $scope.currentFeedsType = "messagetab";
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
        } // tabswitch

        // 联系人右边导航栏
        $scope.cri = { DataValue: '' };
        $scope.alphabet = ['↑', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
            'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        $scope.gotoList = function (letter) {
            var showBox = $ionicLoading.show({ template: letter });
            $timeout(function () {
                $ionicLoading.hide();
            }, 550);
            if (letter == '↑')
                letter = "top";
            // 导航至对应字幕开头的[这里改做一个操作，匹配最近的！]
            var index_alpha = document.querySelector("a[name=index_" + letter + "]");
            index_alpha = angular.element(index_alpha);
            var scrollTop = index_alpha.attr("scrollTop");
            if (scrollTop) {
                $ionicScrollDelegate.scrollTo(0, scrollTop, true);
            }
        }

        // === 融云 ===
        $scope.friends = [];
        $scope.groups = [];
        $scope.friends_message = [];
        // 好友/团队邀请
        $scope.friendinviteList = [];
        $scope.groupinviteList = [];
        var projectCode = currentUser.getUserinfo().PCode;
        var curUID = currentUser.getUserinfo().UserID;
        // alert('projectCode:'+projectCode);

        // 加载好友列表
        Friends.all(function (data) {
            $scope.friends = data;
        });
        // 加载群组
        Groups.all(function (data) {
            $scope.groups = data;
        });
        // 加载好友邀请
        FindFriendsReq.all(curUID, function (data) {
            $scope.friendinviteList = data;
        });
        // 加载群组邀请
        findTeamsReq.all(curUID, function (data) {
            $scope.groupinviteList = data;
        });
        // 同意与拒绝请求
        $scope.responseReq = function (id, name, type, state, $index) {
            if (type == "PRIVATE") {
                // 好友请求 UserID, FriendID, state
                ResFriend(curUID, id, state, callback);
            } else {
                // 团队邀请 groupID, MemberID, state
                ResTeam(id, curUID, state, callback);
            }
            var showMsg = '';
            function callback(data) {
                // 成功后删掉记录并刷新好友列表
                var obj = {};
                if (type == "PRIVATE") {
                    if (state == '1') {
                        showMsg = "您已添加" + name + "为好友!";
                        // 同步至融云(可选，已在服务端做同步)
                    } else {
                        showMsg = "您已拒绝" + name + "的好友请求!";
                    }
                    $ionicLoading.show({
                        template: showMsg
                    });
                    // 添加到通讯录
                    obj.id = id;
                    obj.name = name;
                    obj.alpha = makePy(obj.name)[0][0].toUpperCase();
                    obj.conversationType = 'PRIVATE';
                    obj.portrait = null;
                    // 不能直接插入，需要进行排序
                    $scope.friends.unshift(obj);
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 750);
                    $timeout(function () {
                        $scope.friendinviteList.splice($index, 1);
                    }, 400);
                } else {
                    if (state == '1') {
                        showMsg = "您已加入群" + name + "!";
                    } else {
                        showMsg = "您已拒绝加入群" + name + "!";
                    }
                    $ionicLoading.show({
                        template: showMsg
                    });
                    // 添加到通讯录
                    obj.id = 'cre_' + id;
                    obj.number = 10;
                    obj.max_number = 30;
                    obj.name = name;
                    obj.conversationType = 'GROUP';
                    obj.type = 'create';
                    obj.portrait = null;//'亿达别苑维修工_200.png';
                    $scope.groups.unshift(obj);
                    $timeout(function () {
                        $ionicLoading.hide();
                    }, 750);
                    $timeout(function () {
                        $scope.groupinviteList.splice($index, 1);
                    }, 400);
                }

            }
        }
        // 添加团队与添加好友
        $scope.addTeam = function () {
            $state.go('tab.addTeam');
        };
        $scope.addFriend = function () {
            $state.go('tab.addFriend');
        };

        $scope.initTalk = function (friendID, username, type, $event) {
            $state.go('tab.chatDetail', {
                messageId: '1', name: username, targetId: friendID,
                conversationType: type
            });
            $event.stopPropagation();
            $event.preventDefault();
        } // initTalk

        // === 融云消息监听 ===
        var newMsgCallBack = function (d, data) {
            /// console.log('conversation newMessage' + data);
            jsonMsg = JSON.parse(data);
            jsonMsg.unreadMessageCount = "1";
            var target;
            var groupMemberinfo = null;
            if (jsonMsg.conversationType == "PRIVATE") {
                // target = Friends.get(jsonMsg.targetId);
                var friends = $scope.friends;
                var friend_nums = friends.length;
                for (var i = 0; i < friend_nums; i++) {
                    if (friends[i].id == jsonMsg.targetId) {
                        target = friends[i];
                        break;
                    }
                }
            }
            else if (jsonMsg.conversationType == "GROUP") {
                // target = Groups.get(jsonMsg.targetId);
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
            // console.log('target:' + JSON.stringify(target));
            jsonMsg = myUtil.resolveCon(jsonMsg, 1, target, groupMemberinfo);
            // console.log('jsonMsg after resolveCon:' + JSON.stringify(jsonMsg));
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
            RongCloudLibPlugin.clearConversations({
                conversationTypes: ["PRIVATE", "GROUP"]
            },
                function (ret, err) {
                    if (ret) {
                        alert("已清除所有会话: " + result.status);
                        $scope.$apply(function () {
                            $scope.friends_message = [];
                        });
                    }
                    if (err) {
                        FormateRongyunErr.formate(err);
                    }
                }
            );
        }
        // 将某人消息设为已读
        function clearSomeoneConversition(targetId,type) {
            RongCloudLibPlugin.clearMessagesUnreadStatus({
                conversationType: type,
                targetId: targetId
            }, function (ret, err) {
                // test succeed
                //alert(ret.status);
                if (err) {
                    FormateRongyunErr.formate(err);
                }
            });
        }
        // 将某人消息删除
        function removeSomeoneConversition(targetId,type) {
            RongCloudLibPlugin.removeConversation({
                conversationType:type,
                targetId: targetId
            }, function (ret, err) {
                //alert(ret.status);
                if (err) {
                    FormateRongyunErr.formate(err);
                }
            });
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

        // 弹出框
        $scope.popupMessageOpthins = function (message) {
            $scope.popup.index = $scope.friends_message.indexOf(message);
            $scope.popup.optionsPopup = $ionicPopup.show({
                templateUrl: "templates/chat/popup.html",
                scope: $scope,
            });
            $scope.popup.isPopup = true;
        };
       // 设为已读
        $scope.markMessage = function () {
            var index = $scope.popup.index;
            var message = $scope.friends_message[index];
            chatUnreadMessage.addUnreadMessage(-message.unreadMessageCount);
            message.unreadMessageCount = 0;
            $scope.popup.optionsPopup.close();
            $scope.popup.isPopup = false;
            clearSomeoneConversition(message.targetId,message.conversationType);
        };
        // 删除消息
        // TODO：需要清除消息状态，否则刷新后会再出来(待测)
        $scope.deleteMessage = function () {
            var index = $scope.popup.index;
            var message = $scope.friends_message[index];

            chatUnreadMessage.addUnreadMessage(-message.unreadMessageCount);
            $scope.friends_message.splice(index, 1);
            $scope.popup.optionsPopup.close();
            $scope.popup.isPopup = false;
            removeSomeoneConversition(message.targetId,message.conversationType);
        };

        $scope.gotoChatDetils = function (friend, $index) {
            // 清空未读消息
            $scope.friends_message[$index].unreadMessageCount = 0;
            var target;
            if (friend.conversationType == "PRIVATE") {
                var friends = $scope.friends;
                var friend_nums = friends.length;
                for (var i = 0; i < friend_nums; i++) {
                    if (friends[i].id == friend.targetId) {
                        target = friends[i];
                        break;
                    }
                }
            }
            else if (friend.conversationType == "GROUP") {
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
            $state.go("tab.chatDetail",
                { targetId: friend.targetId, name: name, conversationType: friend.conversationType }
            );
        }
        // 获取消息列表
        var getConversationList = function () {
            RongCloudLibPlugin.getConversationList(
                function (ret, err) {
                    if (ret) {
                        // alert('getConversationList:' + JSON.stringify(ret));
                        var result = ret.result;
                        var resultLen = result.length;
                        var target;
                        var groupMemberinfo = null;
                        for (var i = 0; i < resultLen; i++) {
                            if (result[i].conversationType == "PRIVATE") {
                                target = Friends.get(result[i].targetId);
                            }
                            else if (result[i].conversationType == "GROUP") {
                                target = Groups.get(result[i].targetId);
                                try {
                                    groupMemberinfo = Groups.getGroupMember(result[i].targetId, result[i].senderUserId);
                                } catch (e) {
                                    alert('groupMemberinfo err:' + JSON.stringify(e));
                                    break;
                                }
                                // alert('groupMemberinfo_ret:' + JSON.stringify(groupMemberinfo));
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
                    }
                    if (err) {
                        FormateRongyunErr.formate(err);
                    }
                }
            );
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
        // init test
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
    })
