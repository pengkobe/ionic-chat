angular.module('starter.controllers')
.controller('friendInfoCtrl', function ($scope, Friends, Blacklist, $state, $ionicLoading,
     $stateParams, $timeout, ResFriend, currentUser) {
        $scope.Target = Friends.get($stateParams.targetId);
        var targetId = $stateParams.targetId;
        var targetName = $stateParams.targetName;
        $scope.isFriend = true;
        
        // 非好友
        if ($scope.Target == null) {
            $scope.isFriend = false;
            $scope.Target = { name: targetName, id: targetId };
        }

        $scope.settings = {
            inBlackList: false
        };
        var lists = Blacklist.all();
        if (!lists.length) {
            // 获取黑名单
            RongCloudLibPlugin.getBlacklist(
                function (ret, err) {
                    if (ret) {
                        console.log('getBlacklist:' + JSON.stringify(ret));
                        var userinfo;
                        for (var i = 0; i < ret.result.length; i++) {
                            userinfo = Friends.get(ret.result[i]);
                            lists.push({ id: ret.result[i], username: userinfo.username, portrait: userinfo.portrait });
                        }
                        Blacklist.set(lists);
                        console.log('Blacklist:' + JSON.stringify(Blacklist.all()));
                        console.log($stateParams.targetId);
                        console.log(JSON.stringify(Blacklist.get($stateParams.targetId)));
                        if (Blacklist.get($stateParams.targetId))
                            $scope.settings.inBlackList = true;
                    }
                    if (err) {
                        console.log('logout error:' + JSON.stringify(err));
                        alert('logout error:' + JSON.stringify(err));
                    }
                }
            );
        }
        else {
            if (Blacklist.get($stateParams.targetId))
                $scope.settings.inBlackList = true;
        }

        // 发送消息,跳转到聊天界面
        $scope.sendMsg = function () {
            //alert('p y is here ready to home:' + $stateParams.targetId + ":" + $stateParams.conversationType);
            $state.go('YIPENG.chatDetail', {
                messageId: '1', name: targetName, targetId: targetId,
                conversationType: $stateParams.conversationType
            });
        }
        // 直接视频聊天
        $scope.vedioChat = function () {
            //alert('chatdetial:' + $stateParams.targetId);
            var obj = { isCalling: true, contactName: $stateParams.targetId };
            $state.go('YIPENG.call', obj);
        }

        // 添加陌生人为好友
        $scope.addFriend = function () {
            // 0 为发送好友请求
            var UserID = currentUser.getUserinfo().UserID;
            ResFriend(UserID, targetId, 0, function () {
                // 成功后删掉记录并刷新好友列表
                var showMsg = "您已发送好友请求!";
                $ionicLoading.show({
                    template: showMsg
                });
                $timeout(function () {
                    $ionicLoading.hide();
                }, 750);
            });
        }

        // 添加/移除黑名单
        $scope.chBlackList = function () {
            if ($scope.settings.inBlackList) {
                RongCloudLibPlugin.addToBlacklist({ userId: $stateParams.targetId },
                    function (ret, err) {
                        if (ret) {
                            alert('加入黑名单成功!');
                            var userinfo = Friends.get($stateParams.targetId);
                            Blacklist.addOne({ id: $stateParams.targetId, username: userinfo.username, 
                                portrait: userinfo.portrait });
                        }
                        if (err) {
                            alert('addToBlacklist error:' + JSON.stringify(err));
                        }
                    }
                );
            }
            else {
                RongCloudLibPlugin.removeFromBlacklist({ userId: $stateParams.targetId },
                    function (ret, err) {
                        if (ret) {
                            Blacklist.removeOne($stateParams.targetId);
                            alert('移出黑名单成功!');
                        }
                        if (err) {
                            alert('removeFromBlacklist error:' + JSON.stringify(err));
                        }
                    }
                );
            }
        }
    })