angular.module('chat.directive')
    .directive('resFriendTeam', function ($ionicLoading, $timeout, ResFriend, ResTeam) {
        return {
            restrict: "E",
            templateUrl: 'dist/dev/static/tab_chat/directives/resfriendteam/resfriendteam.tpl',
            replace: true,
            scope: {
                groupinviteList_local: "=groupinviteList",
                friendinviteList_local: "=friendinviteList",
                responseReq_local: "&responseReq",
            },
            link: function (scope, element, attrs, controller) {
                scope.responseReq_local = function (id, name, type, state, $index) {
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
                            $timeout(function () {
                                $ionicLoading.hide();
                            }, 750);
                            scope.responseReq()(obj, $index);
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
                            $timeout(function () {
                                $ionicLoading.hide();
                            }, 750);
                            scope.responseReq()(obj, $index, type);
                        }
                    }
                }
            }
        };
    });
