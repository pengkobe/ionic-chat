angular.module('chat.controllers')
    // 聊天
    .controller('chatDetail', function ($scope, $rootScope, $stateParams, newMessageEventService, CacheFactory,
        $ionicScrollDelegate, $timeout, $state, $filter, Friends, Groups, $interval, $ionicModal, PhotoAndImages,
        getGroupMembers, projectTeam, currentUser) {
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
                if (jsonMsg.conversationType == "PRIVATE") { } else if (jsonMsg.conversationType == "GROUP") {
                    if (members.length > 0) {
                        for (var m = 0; m < members.length; m++) {
                            if (members[m].id == jsonMsg.senderUserId) {
                                jsonMsg.name = members[m].name;
                            }
                        }
                    }
                } else if (jsonMsg.conversationType == "CUSTOMER_SERVICE") { } else if (jsonMsg.conversationType == "CHATROOM") { }
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

                    // 发送语音消息
                    RongCloudLibPlugin.sendVoiceMessage({
                        conversationType: $stateParams.conversationType,
                        targetId: $stateParams.targetId,
                        voicePath: tmpPath,
                        duration: dur,
                        extra: ""
                    },
                        function (ret, err) {
                            mediaRec.release();
                            if (ret) {
                                $scope.lstResult = "sendVoiceMessage:" + JSON.stringify(ret);
                                // TODO:消息此时未发送成功，可以加入样式标明；成功后更新样式
                                if (ret.status == "prepare") {
                                    // alert("sendVoiceMessage prepare2:" + JSON.stringify(ret));
                                    appendNewMsg(ret.result.message, true);
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
                }
            }, 100);
            return false;
        }
        // 播放音频文件
        $scope.play = function (voiFile, type) {
            if (mediaRec) {
                mediaRec.stop();
                mediaRec.release();
            }
            var target = angular.element(event.target).find("i");
            if (type == "you") {
                target.addClass("web_wechat_voice_gray_playing");
            } else {
                target.addClass("web_wechat_voice_playing");
            }
            if (isIOS) {
                voiFile = voiFile.replace('file://', '');
            }
            mediaRec = new Media(voiFile,
                // 成功操作
                function () {
                    if (type == "you") {
                        target.removeClass("web_wechat_voice_gray_playing");
                    } else {
                        target.removeClass("web_wechat_voice_playing");
                    }
                    console.log("play():Audio Success");
                },
                // 失败操作
                function (err) {
                    if (type == "you") {
                        target.removeClass("web_wechat_voice_gray_playing");
                    } else {
                        target.removeClass("web_wechat_voice_playing");
                    }
                    console.log("play():Audio Error: " + err.code);
                }
            );
            //开始播放录音
            mediaRec.play();
            return false;
        };
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
       $scope.send_content={
            text:''
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

        // 下拉刷新
        $scope.doRefresh = function () {
            console.log('Refreshing!');
            $timeout(function () {
                getHistoryMsg($stateParams.targetId, $stateParams.conversationType);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };
        // === 工具栏交互(END) ===

        // === 文本消息(BEGIN) ===
        $scope.onSendTextMessage = function () {
            var message = $scope.send_content.text;
            sendMessage($stateParams.conversationType, $stateParams.targetId, message);
            $scope.send_content.text='';
            viewScroll.scrollBottom(true);
        }
        // === 文本消息(END) ===

        $ionicModal.fromTemplateUrl('module/chat/tpl/message/BigImage.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openImage = function (data) {
            $scope.imageData = data;
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.openImage = function (data) {
            $scope.imageData = data;
            $scope.modal.show();
        };
        // === 图片交互(END) ===


        // ===  融云消息处理(BEGIN) ===
        // 发送文本消息
        function sendMessage(ctype, target, content) {
            var curMsg;
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
                            appendNewMsg(ret.result.message, true);
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
        }
        // 标为已读
        function clearMessagesUnreadStatus() {
            RongCloudLibPlugin.clearMessagesUnreadStatus({
                conversationType: $stateParams.conversationType,
                targetId: $stateParams.targetId
            },
                function (ret, err) {
                    if (err) {
                        alert("标为已读 error: " + JSON.stringify(err));
                    }
                }
            );
        }
        // 获取最新消息
        function getLatestMsg(targetid, ctype) {
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
                        $scope.hisMsgs = result;
                        $timeout(function () {
                            viewScroll.scrollBottom(true);
                        }, 50);
                    }
                    if (err) {
                        alert("getLatestMessages error: " + JSON.stringify(err));
                    }
                }
            );
        }
        // 拉取历史数据(暂未启用，从云端加载时需要付费用户才能使用)
        function getHistoryMsg(targetid, ctype) {
            var oldestMessageId = 0;
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
                        $scope.hisMsgs = hisArr;
                    }
                    if (err) {
                        alert("getHistoryMessages error: " + JSON.stringify(err));
                    }
                }
            );
        }
        $scope.sendPhoto = sendPhoto;
        // 发送图片
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
            //alert('开始发送:' + picPath);
            RongCloudLibPlugin.sendImageMessage({
                conversationType: $stateParams.conversationType,
                targetId: $stateParams.targetId,
                imagePath: picPath,
                extra: ""
            },
                function (ret, err) {
                    if (ret) {
                        //消息此时未发送成功，可以加入样式标明；成功后更新样式
                        if (ret.status == "prepare") {
                            // alert("prepare");
                            appendNewMsg(ret.result.message, true);
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
            if ($stateParams.conversationType == "CUSTOMER_SERVICE") { // 客服
            } else if ($stateParams.conversationType == "CHATROOM") { // 聊天室
            } else if ($stateParams.conversationType == "DISCUSSION") { // 讨论组
            }
            $scope.$on("$ionicView.enter", function () {
                // alert('p y is here  $ionicView.enter');
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
        // 构建消息UI模板
        $scope.buildUrl = function (type) {
            var tmpName;
            switch (type) {
                case 'RC:TxtMsg':
                    tmpName = 'txt';
                    break;
                case 'RC:ImgMsg':
                    tmpName = 'img';
                    break;
                case 'RC:DizNtf':
                    tmpName = 'diz';
                    break;
                case 'RC:LBSMsg':
                    tmpName = 'lbs';
                    break;
                case 'RC:ImgTextMsg':
                    tmpName = 'imgtext';
                    break;
                case 'RC:VcMsg':
                    tmpName = 'vc';
                    break;
                default:

            }
            return 'module/chat/tpl/message/' + tmpName + '.html';
        }
        // === 辅助方法(END) ===
    })
