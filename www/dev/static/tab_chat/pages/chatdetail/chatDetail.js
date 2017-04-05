angular.module('chat.controllers')
    .controller('chatDetail', function ($scope, $rootScope, $stateParams, newMessageEventService, CacheFactory,
        $ionicScrollDelegate, $timeout, $state, Friends, Groups, $interval, $ionicModal, PhotoAndImages,
        rongyunService, mediaService) {
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        /***
         * bugfix purpose
         */
        $scope.fixReflowtag = false;
        var targetId = $stateParams.targetId;
        var conversationType = $stateParams.conversationType;
        $scope.name = $stateParams.name ? $stateParams.name : "";
        $scope.conversationType = conversationType;
        // 加载成员，用于显示姓名
        if ($scope.conversationType == "GROUP") {
            getGroupMem();
        }
        var members = [];
        function getGroupMem() {
            if (targetId && targetId.substr(0, 4) == "cre_") {
                getGroupMembers(targetId.substr(4), callback);
            }
            function callback(data) {
                var data = data.data;
                var length = data.length;
                for(var i = 0; i < length; i++) {
                    var obj = {};
                    obj.id = data[i].UserID;
                    obj.name = data[i].UserName;
                    members.push(obj);
                }
                getLatestMsg(targetId, "GROUP");
            }
        }

        // 语音消息交互(BEGIN)
        $scope.recordWait = false;
        $scope.isStartRecord = false;
        $scope.onVoiceHold = function () {
            $scope.isStartRecord = true;
            $scope.recordWait = false;
            try {
                //实例化录音类
                VoicechangeAnimation();
                mediaService.startRecord();
                return false;
            } catch (err) {
                dialog.show('err m:' + err)
            }
        }
        $scope.onVoiceRelease = function () {
            $scope.recordWait = true;
            $timeout(function () {
                $scope.isStartRecord = false;
            }, 1000);
            mediaService.finishRecord().then(function (tmpPath, mediaRec) {
                rongyunService.sendVoiceMessage(conversationType,
                    targetId, tmpPath, dur).then(function (data) {
                        mediaRec.release();
                        appendNewMsg(data, true);
                    });
            });
            return false;
        }
        //  工具栏交互
        $scope.send_content = {
            text: ''
        };
        $scope.showPhonebar = false;
        $scope.onShowPhonebar = function () {
            if (!$scope.showPhonebar) {
                $scope.showPhonebar = true;
                $scope.showWXFace = false;
                scrolltoBottom();
            } else if ($scope.showPhonebar && $scope.showWXFace) {
                $scope.showWXFace = false;
            } else if ($scope.showPhonebar && !$scope.showWXFace) {
                $scope.showPhonebar = false;
            }
        }
        $scope.showWXFace = false;
        $scope.onShowWXFace = function () {
            if (!$scope.showPhonebar) {
                $scope.showPhonebar = true;
                $scope.showWXFace = true;
                scrolltoBottom();
                document.querySelector("#text_content").focus();
            } else if ($scope.showPhonebar && !$scope.showWXFace) {
                $scope.showWXFace = true;
                document.querySelector("#text_content").focus();
            } else if ($scope.showPhonebar && $scope.showWXFace) {
                $scope.showPhonebar = false;
                $scope.showWXFace = false;
            }
        }
        $scope.selectQQFace = function (text_content) {
            $scope.send_content.text = $scope.send_content.text + text_content;
            document.querySelector("#text_content").focus();
        }
        // 拉取历史消息
        $scope.doRefresh = function () {
            console.log('Refreshing!');
            $timeout(function () {
                // 拉取历史消息
                rongyunService.getHistoryMsg(targetId, conversationType)
                    .then(function (data) {
                        $scope.hisMsgs = data;
                    });
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };
        $scope.onSendTextMessage = function () {
            var message = $scope.send_content.text;
            sendMessage(conversationType, targetId, message);
            $scope.send_content.text = '';
            scrolltoBottom();
        }
        $scope.hisMsgs = [];
        var init = function () {
            if (conversationType == 'PRIVATE') {
                getLatestMsg(targetId, 'PRIVATE');
            }
            clearMessagesUnreadStatus();
        }
        //init();

        // ===  融云消息处理(BEGIN) ===
        // 发送文本消息
        function sendMessage(ctype, target, content) {
            rongyunService.sendMessage(ctype, target, content).then(function (data) {
                appendNewMsg(data, true);
            })
        }
        // 标为已读
        function clearMessagesUnreadStatus() {
            var ctype = conversationType;
            var targetid = targetId;
            rongyunService.clearMessagesUnreadStatus(ctype, target).then(function (data) {
            });
        }
        // 获取最新消息
        function getLatestMsg(targetid, ctype) {
            rongyunService.getLatestMsg(targetid, ctype).then(function (data) {
                $scope.hisMsgs = result;
                scrolltoBottom();
            });
        }
        $scope.sendPhoto = sendPhoto;
        // 发送图片(chattoolbar发起)
        function sendPhoto(imageURI) {
            rongyunService.sendImageMessage(conversationType, targetId, imageURI).then(function (data) {
                appendNewMsg(data, true);
            });
        };
        // ===  融云消息处理(END) ===

        // 滚动至底部(有bug)
        function scrolltoBottom() {
            $timeout(function () {
                viewScroll.scrollBottom(true);
            }, 50);
            $scope.fixReflowtag = !$scope.fixReflowtag;
        }

        // 添加新消息
        function appendNewMsg(msg, flag) {
            var curMsg = myUtil.resolveMsg(msg);
            $scope.hisMsgs.push(curMsg);
            scrolltoBottom();
        }

        // 模拟声音大小变化
        $scope.voiceImg = { url: 'assets/img/voice/recog000.png' };
        function VoicechangeAnimation() {
            var voicechange = $interval(function () {
                if (!$scope.recordWait) {
                    var i = Math.round(Math.random() * 9);
                    $scope.voiceImg.url = 'img/voice/recog00' + i + '.png';
                } else {
                    voicechange = undefined;
                }
            }, 400);
        }
        // 视频通话
        $scope.onVoiceCall = function () {
            //alert('chatdetial:' + targetId);
            var obj = { isCalling: true, contactName: targetId };
            $state.go('tab.call', obj);
        }
        $scope.onVedioCall = function () {
            //alert('chatdetial:' + targetId);
            var obj = { isCalling: true, contactName: targetId };
            $state.go('tab.call', obj);
        }
        // 初次加载
        $scope.$on("$ionicView.enter", function () {
            scrolltoBottom();
            console.log('chatdetial.enter');
        });
        window.addEventListener("native.keyboardshow", function (e) {
            scrolltoBottom();
        });

        // 监听消息发送事件(实时刷新消息)
        var newMsgCallBack = function (d, data) {
            var jsonMsg = JSON.parse(data);
            if (targetId == jsonMsg.targetId) {
                // clearMessagesUnreadStatus();
                // 获取群成员姓名
                if (jsonMsg.conversationType == "GROUP") {
                    if (members.length > 0) {
                        for (var m = 0; m < members.length; m++) {
                            if (members[m].id == jsonMsg.senderUserId) {
                                jsonMsg.name = members[m].name;
                            }
                        }
                    }
                }
                console.log('jsonMsg:', jsonMsg);
                var tmpMsg = myUtil.resolveMsg(jsonMsg);
                $scope.hisMsgs.push(tmpMsg);
                scrolltoBottom();
            }
        };
        newMessageEventService.listen(newMsgCallBack);
    })
