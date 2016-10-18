angular.module('chat.controllers')
    // 聊天
    .controller('chatDetail', function ($scope, $rootScope, $stateParams, newMessageEventService, CacheFactory,
        $ionicScrollDelegate, $timeout, $state, Friends, Groups, $interval, $ionicModal, PhotoAndImages,
        getGroupMembers, projectTeam, currentUser, rongyunService) {
        var mediaRec;
        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();
        var path = "";
        var members = [];
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        var targetId = $stateParams.targetId;
        $scope.conversationType = $stateParams.conversationType;
        $scope.name = $stateParams.name ? $stateParams.name : "";

        // media路径处理
        var src = "cordovaIMVoice.amr";
        if (isIOS) {
            // path = cordova.file.documentsDirectory;
            src = "cordovaIMVoice.wav";
        } else {
            // path = cordova.file.externalApplicationStorageDirectory;
        }

        // 获取组内用户（用于显示群成员名称）
        if ($scope.conversationType == "GROUP") {
            getGroupMem();
        }

        function getGroupMem() {
            if (targetId && targetId.substr(0, 4) == "cre_") {
                getGroupMembers(targetId.substr(4), callback);
            } else if (targetId && targetId.substr(0, 4) == "prj_") {
                var projectCode = currentUser.getUserinfo().PCode;
                projectTeam(projectCode, callback);
            }

            function callback(data) {
                var data = data.data;
                var length = data.length;
                for (var i = 0; i < length; i++) {
                    var obj = {};
                    obj.id = data[i].UserID;
                    obj.name = data[i].UserName;
                    members.push(obj);
                }
                getLatestMsg(targetId, "GROUP");
            }
        }

        // === $scope 初始化(BEGIN) ===
        $scope.$on("$ionicView.beforeEnter", function () {
            $timeout(function () {
                viewScroll.scrollBottom(true);
            }, 50);
        });
        window.addEventListener("native.keyboardshow", function (e) {
            viewScroll.scrollBottom(true);
        });
        // 监听消息发送事件
        var newMsgCallBack = function (d, data) {
            var jsonMsg = JSON.parse(data);
            if ($stateParams.targetId == jsonMsg.targetId) {
                // clearMessagesUnreadStatus();
                // 本地测试
                var target;
                if (jsonMsg.conversationType == "PRIVATE") {
                } else if (jsonMsg.conversationType == "GROUP") {
                    if (members.length > 0) {
                        for (var m = 0; m < members.length; m++) {
                            if (members[m].id == jsonMsg.senderUserId) {
                                jsonMsg.name = members[m].name;
                            }
                        }
                    }
                } else if (jsonMsg.conversationType == "CUSTOMER_SERVICE") {
                }
                console.log('jsonMsg:', jsonMsg);
                var tmpMsg = myUtil.resolveMsg(jsonMsg);
                $scope.hisMsgs.push(tmpMsg);
                $timeout(function () {
                    viewScroll.scrollBottom(true);
                }, 50);
            }
        };
        newMessageEventService.listen(newMsgCallBack);
        // === $scope 初始化(END) ===

        // === 视频/音频通话(BEGIN) ===
        $scope.onVoiceCall = function () {
            //alert('chatdetial:' + $stateParams.targetId);
            var obj = { isCalling: true, contactName: $stateParams.targetId };
            $state.go('chat.call', obj);
        }
        $scope.onVedioCall = function () {
            //alert('chatdetial:' + $stateParams.targetId);
            var obj = { isCalling: true, contactName: $stateParams.targetId };
            $state.go('chat.call', obj);
        }
        // === 视频/音频通话(END) ===

        // === 语音消息交互(BEGIN)  ===
        $scope.voiceImg = { url: 'assets/img/voice/recog000.png' };
        $scope.recordWait = false;
        $scope.isStartRecord = false;
        $scope.onVoiceHold = function () {
            $scope.isStartRecord = true;
            $scope.recordWait = false;
            try {
                //实例化录音类
                startRec();
                //开始录音
                mediaRec.startRecord();
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

                    rongyunService.sendVoiceMessage($stateParams.conversationType,
                        $stateParams.targetId, tmpPath, dur).then(function (data) {
                            mediaRec.release();
                            appendNewMsg(data, true);
                        });
                }
            }, 100);
            return false;
        }
        //开始录音
        function startRec() {
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
            // 模拟声音大小变化
            var voicechange = $interval(function () {
                if (!$scope.recordWait) {
                    var i = Math.round(Math.random() * 9);
                    $scope.voiceImg.url = 'img/voice/recog00' + i + '.png';
                } else {
                    voicechange = undefined;
                }
            }, 400);

        }
        // ===  语音消息交互(END) ===

        // === 工具栏交互 ===
        $scope.send_content = {
            text: ''
        };
        $scope.showPhonebar = false;
        $scope.onShowPhonebar = function () {
            if (!$scope.showPhonebar) {
                $scope.showPhonebar = true;
                $scope.showWXFace = false;
                viewScroll.scrollBottom(true);
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
                viewScroll.scrollBottom(true);
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
        // === 工具栏交互(END) ===
        
        // 下拉刷新
        $scope.doRefresh = function () {
            console.log('Refreshing!');
            $timeout(function () {
                // 拉取历史消息
                rongyunService.getHistoryMsg($stateParams.targetId, $stateParams.conversationType)
                    .then(function (data) {
                        $scope.hisMsgs = data;
                    });
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };


        // === 文本消息(BEGIN) ===
        $scope.onSendTextMessage = function () {
            var message = $scope.send_content.text;
            sendMessage($stateParams.conversationType, $stateParams.targetId, message);
            $scope.send_content.text = '';
            viewScroll.scrollBottom(true);
        }
        // === 文本消息(END) ===

        // ===  融云消息处理(BEGIN) ===
        // 发送文本消息
        function sendMessage(ctype, target, content) {
            rongyunService.sendMessage(ctype, target, content).then(function (data) {
                appendNewMsg(data, true);
            })
        }
        // 标为已读
        function clearMessagesUnreadStatus() {
            var ctype = $stateParams.conversationType;
            var targetid = $stateParams.targetId;
            rongyunService.clearMessagesUnreadStatus(ctype, target).then(function (data) {
            });
        }
        // 获取最新消息
        function getLatestMsg(targetid, ctype) {
            rongyunService.getLatestMsg(targetid, ctype).then(function (data) {
                $scope.hisMsgs = result;
                $timeout(function () {
                    viewScroll.scrollBottom(true);
                }, 50);
            });
        }
        $scope.sendPhoto = sendPhoto;
        // 发送图片(chattoolbar发起)
        function sendPhoto(imageURI) {
            var picPath = imageURI;
            if (isIOS) {
                picPath = imageURI.replace('file://', '');
            }
            if (isAndroid) {
                if (imageURI.indexOf('?') !== -1) {
                    picPath = imageURI.substring(0, imageURI.indexOf('?'));
                } else { }
            }
            rongyunService.sendImageMessage($stateParams.conversationType, $stateParams.targetId, picPath).then(function (data) {
                appendNewMsg(data, true);
            });
        };
        // ===  融云消息处理(END) ===

        // === 初始化(BEGIN) ===
        $scope.hisMsgs = [];
        var init = function () {
            // alert('p y is here in init $scope.curUID:'+$scope.curUID+"target:"+$scope.targetId);
            if ($stateParams.conversationType == 'PRIVATE') {
                getLatestMsg($stateParams.targetId, 'PRIVATE');
            } else if ($stateParams.conversationType == 'GROUP') { }
            // 标为已读
            clearMessagesUnreadStatus();
            $scope.$on("$ionicView.enter", function () {
                viewScroll.scrollBottom(true);
                console.log('$ionicView.enter');
            });
        }
        //init();
        // === 初始化(END) ===

        // === 辅助方法(BEGIN) ===
        // url辅助
        function getMediaURL(s) {
            if (device.platform.toLowerCase() === "android") return path + s;
            return (path + s).replace('file://', '');
        }

        function getNewMediaURL(s) {
            if (device.platform.toLowerCase() === "android") return path + s;
            return "documents://" + s;
        }
        // 添加新消息
        function appendNewMsg(msg, flag) {
            var curMsg = myUtil.resolveMsg(msg);
            // 消息此时未发送成功，可以加入样式标明；成功后更新样式
            $scope.hisMsgs.push(curMsg);

            // 滚动至底部(有bug)
            $timeout(function () {
                viewScroll.scrollBottom(true);
            }, 50);
        }
        // === 辅助方法(END) ===
    })
