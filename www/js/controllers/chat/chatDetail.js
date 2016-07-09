angular.module('starter.controllers')
 // 聊天
    .controller('chatDetail', function ($scope, $rootScope, $stateParams, newMessageEventService, CacheFactory,
        $ionicScrollDelegate, $timeout, $state, $filter, Friends, Groups, $interval, $ionicModal, PhotoAndImages,
        getGroupMembers, projectTeam, currentUser) {
        // === 变量声明提前(BEGIN) ===
        var mediaRec;
        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();
        var src = "cordovaIMVoice.amr";
        var path = "";
        $scope.conversationType = $stateParams.conversationType;
        var members = [];
        var targetId = $stateParams.targetId;
        if ($scope.conversationType == "GROUP") {
            getGroupMem();
        }
        function getGroupMem() {
            if (targetId && targetId.substr(0, 4) == "cre_") {
                getGroupMembers(targetId.substr(4), callback);
            }
            else if (targetId && targetId.substr(0, 4) == "prj_") {
                var projectCode = currentUser.getUserinfo().PCode;
                projectTeam(projectCode, callback);
            }
            function callback(data) {
                var data = data.data;
                var length = data.length;
                //var userids = [];
                for (var i = 0; i < length; i++) {
                    var obj = {};
                    obj.id = data[i].UserID;
                    obj.name = data[i].UserName;
                    members.push(obj);
                }
                // alert("members:" +JSON.stringify(members));
                getLatestMsg(targetId, "GROUP");
            }
        }
        if (isIOS) {
            //path = cordova.file.documentsDirectory;
            src = "cordovaIMVoice.wav";
        }
        else {
            //path = cordova.file.externalApplicationStorageDirectory;
        }

        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        $scope.name = $stateParams.name ? $stateParams.name : "";
        // === 变量声明提前(END) ===

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
            // console.log('CD新消息:' + data);
            var jsonMsg = JSON.parse(data);
            if ($stateParams.targetId == jsonMsg.targetId) {
                // clearMessagesUnreadStatus();
                // 本地测试
                var target;
                if (jsonMsg.conversationType == "PRIVATE") {
                    // target = Friends.get(jsonMsg.targetId);
                }
                else if (jsonMsg.conversationType == "GROUP") {
                    if (members.length > 0) {
                        for (var m = 0; m < members.length; m++) {
                            if (members[m].id == jsonMsg.senderUserId) {
                                jsonMsg.name = members[m].name;
                            }
                        }
                    }
                    // target = Groups.get(jsonMsg.targetId);
                }
                else if (jsonMsg.conversationType == "CUSTOMER_SERVICE") {
                    // target = Groups.get(jsonMsg.targetId);
                }
                else if (jsonMsg.conversationType == "CHATROOM") {
                    // target = Groups.get(jsonMsg.targetId);
                }
                console.log('jsonMsg:', jsonMsg);
                var tmpMsg = myUtil.resolveMsg(jsonMsg);
                // console.log(tmpMsg);
                $scope.hisMsgs.push(tmpMsg);
                // $ionicFrostedDelegate.update();
                // $ionicScrollDelegate.scrollBottom(true);
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
            $state.go('YIPENG.call', obj);
        }
        $scope.onVedioCall = function () {
            //alert('chatdetial:' + $stateParams.targetId);
            var obj = { isCalling: true, contactName: $stateParams.targetId };
            $state.go('YIPENG.call', obj);
        }
        // === 视频/音频通话(END) ===

        // === 语音消息交互(BEGIN)  ===
        $scope.voiceImg = { url: 'img/voice/recog000.png' };
        $scope.isVoiceMethod = true;
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
            }, 2000);
            if (mediaRec) {
                //结束录音
                mediaRec.stopRecord();
                //释放系统底层的音频播放资源
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

            //开始播放录音
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
                    // alert('tmpPath:' + tmpPath);

                    // 发送语音消息
                    RongCloudLibPlugin.sendVoiceMessage({
                        conversationType: $stateParams.conversationType,
                        targetId: $stateParams.targetId,
                        voicePath: tmpPath,
                        duration: dur,
                        extra: "语音消息"
                    },
                        function (ret, err) {
                            mediaRec.release();
                            // TODO：$cordovaFile api 已过时
                            // $cordovaFile.removeFile(path, src)
                            //     .then(function (success) {
                            //         // success
                            //         alert('removeFile2:' + JSON.stringify(success));
                            //     }, function (error) {
                            //         // error
                            //         alert('removeFile2 err:' + JSON.stringify(error));
                            //     });
                            if (ret) {
                                $scope.lstResult = "sendVoiceMessage:" + JSON.stringify(ret);
                                if (ret.status == "prepare") {
                                    // TODO:消息此时未发送成功，可以加入样式标明；成功后更新样式
                                    // alert('语音发送成功！');
                                    // alert("sendVoiceMessage prepare2:" + JSON.stringify(ret));
                                    appendNewMsg(ret.result.message, true);
                                    // alert("prepare");
                                }
                                if (ret.status == "success") {
                                    // alert("success");
                                    // TODO:后续加入发送成功后修改显示样式
                                }
                            }
                            if (err) {
                                // TODO:这里需要对错误状态进行判断并友好的提示用户
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
            //console.log('start play!' + voiFile);
            if (mediaRec) {
                mediaRec.release();
            }
            var target = angular.element(event.target).find("i");
            if (type == "you") {
                target.addClass("web_wechat_voice_gray_playing");
            } else {
                target.addClass("web_wechat_voice_playing");
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
                function () {
                    console.log("start():Audio Success");
                },
                // 录音失败执行函数
                function (err) {
                    console.log("start():Audio Error: " + JSON.stringify(err) + "----" + getMediaURL(src));
                }
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
        $scope.showPhonebar = false;
        $scope.onShowPhonebar = function () {
            if (!$scope.showPhonebar) {
                $scope.showPhonebar = true;
                $scope.showWXFace = false;
                viewScroll.scrollBottom(true);
            } else if($scope.showPhonebar && $scope.showWXFace) {
                $scope.showWXFace= false;
            }else if($scope.showPhonebar && !$scope.showWXFace) {
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
            }else if($scope.showPhonebar && !$scope.showWXFace){
                $scope.showWXFace = true;
                document.querySelector("#text_content").focus();
            }else if($scope.showPhonebar && $scope.showWXFace){
                $scope.showPhonebar = false;
                $scope.showWXFace = false;
            }
        }
        $scope.choseWXFace = function (event) {
            if(event.srcElement.title){
                  var  text_content = document.querySelector("#text_content");
                   $scope.send_content = text_content.value + "["+event.srcElement.title +"]";
                   document.querySelector("#text_content").focus();
            }
        }
        $scope.switchInputMethod = function (evtobj) {
            if ($scope.isVoiceMethod = !$scope.isVoiceMethod, $scope.isVoiceMethod) {
                var i = 1;
            } else {
                var input = evtobj.currentTarget.parentNode.querySelector("textarea");
                $scope.isStartRecord = !1,
                    $timeout(function () {
                        // input.focus()
                    }, 500);
            }
        }
        // 下拉刷新
        $scope.doRefresh = function () {
            console.log('Refreshing!');
            $timeout(function () {
                //simulate async response
                getHistoryMsg($stateParams.targetId, $stateParams.conversationType);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };
        // === 工具栏交互(END) ===



        // === 文本消息(BEGIN) ===
        $scope.onSendTextMessage = function () {
            var message = $scope.send_content;
            sendMessage($stateParams.conversationType, $stateParams.targetId, message);
            // 发送完清空消息
            $scope.send_content = '';
            viewScroll.scrollBottom(true);
            $timeout(function () {
                document.querySelector("#text_content").focus();
            }, 0);
        }
        // === 文本消息(END) ===


        // === 图片交互(BEGIN) ===
        $scope.takePic = function (way) {
            var options;
            if (way) {
                // 相册
                options = {
                    quality: 80,
                    targetWidth: 320,
                    targetHeight: 320,
                    saveToPhotoAlbum: false,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    destinationType: Camera.DestinationType.FILE_URI
                };
                PhotoAndImages.getImages(options).then(function (data) {
                    //alert('相册成功' + data);
                    sendPhoto(data);
                });
            } else {
                // 拍照 
                options = {
                    quality: 80,
                    targetWidth: 320,
                    targetHeight: 320,
                    saveToPhotoAlbum: false,
                    sourceType: Camera.PictureSourceType.Camera,
                    destinationType: Camera.DestinationType.FILE_URI
                };
                PhotoAndImages.getPhoto(options).then(function (data) {
                    //alert('拍照成功' + data);
                    sendPhoto(data);
                });
            }
        }
        $ionicModal.fromTemplateUrl('templates/chat/message/BigImage.html', {
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
                        if (ret.status == "prepare") {
                            // $scope.lstResult = JSON.stringify(ret);
                            // alert('你发了文字消息：' +JSON.stringify(ret));
                            //消息此时未发送成功，可以加入样式标明；成功后更新样式
                            appendNewMsg(ret.result.message, true);
                        }
                        if (ret.status == "success") {
                            // alert("success");
                        }
                    }
                    if (err) {
                        alert("sendTextMessage error: " + JSON.stringify(err));
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
                        alert("clearMessagesUnreadStatus error: " + JSON.stringify(err));
                    }
                }
            );
        }
        // 获取最新消息(未读)
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
                            result.unshift(tmp);
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
        // 拉取历史数据(暂未启用，付费用户才能使用)
        function getHistoryMsg(targetid, ctype) {
            // return;
            // 找到最新信息！
            var $tar = document.querySelectorAll("#lstMessage > li:first-child")[0];
            if (!tar) {
                return;
            }
            // alert($tar);
            var oldestMessageId = $tar.getAttribute("data-messageid");
            RongCloudLibPlugin.getHistoryMessages({
                conversationType: ctype,
                targetId: targetid,
                count: 5,
                oldestMessageId: oldestMessageId
            },
                function (ret, err) {
                    if (ret) {
                        console.log("getHistoryMessages:" + JSON.stringify(ret));
                        var result = new Array(), tmp;
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
        // 发送图片
        function sendPhoto(imageURI) {
            // console.log($stateParams.conversationType + '--' + imageURI);
            var picPath = imageURI;
            console.log("getPicture:" + picPath);
            if (isIOS) {
                picPath = imageURI.replace('file://', '');
            }
            if (isAndroid) {
                if (imageURI.indexOf('?') !== -1) {
                    picPath = imageURI.substring(0, imageURI.indexOf('?'));
                } else {

                }
            }
            //alert('开始发送:' + picPath);
            RongCloudLibPlugin.sendImageMessage({
                conversationType: $stateParams.conversationType,
                targetId: $stateParams.targetId,
                imagePath: picPath,
                extra: "extra text"
            },
                function (ret, err) {
                    // $scope.lstResult = JSON.stringify(ret);
                    if (ret) {
                        if (ret.status == "prepare") {
                            //消息此时未发送成功，可以加入样式标明；成功后更新样式
                            appendNewMsg(ret.result.message, true);
                            // alert("prepare");
                        }
                        if (ret.status == "success") {
                            //alert("success");
                            // 后续加入发送成功后修改显示样式
                        }
                    }
                    if (err) {
                        alert("sendImageMessage error: " + JSON.stringify(err));
                        console.log("sendImageMessage error: " + JSON.stringify(err));
                    }
                }
            );
        };
        // ===  融云消息处理(END) ===


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
        // 构建UI模板链接
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
            return 'templates/chat/message/' + tmpName + '.html';
        }
        // === 辅助方法(END) ===

        // === 初始化(BEGIN) ===
        $scope.hisMsgs = [];
        var init = function () {
            // alert('p y is here in init $scope.curUID:'+$scope.curUID+"target:"+$scope.targetId);
            if ($stateParams.conversationType == 'PRIVATE') {
                getLatestMsg($stateParams.targetId, 'PRIVATE');
                //$scope.target = Friends.get($stateParams.targetId);
            } else if ($stateParams.conversationType == 'GROUP') {
                // $scope.target = Groups.get($stateParams.targetId);
            }
            // 标为已读
            clearMessagesUnreadStatus();
            if ($stateParams.conversationType == "CUSTOMER_SERVICE") {// 客服
                //  return;
            }
            else if ($stateParams.conversationType == "CHATROOM") {// 聊天室
                // RongCloudLibPlugin.joinChatRoom({
                //     chatRoomId: $stateParams.targetId,
                //     defMessageCount: 20
                // }, function (ret, err) {
                //     if (ret) {
                //         if (ret.status == 'success')
                //             console.log("joinChatRoom", JSON.stringify(ret));
                //     }
                //     if (err) {
                //         alert('joinChatRoom error:' + err.code);
                //     }
                // })
                // return;
            }
            else if ($stateParams.conversationType == "DISCUSSION") {// 讨论组
                // RongCloudLibPlugin.addMemberToDiscussion({
                //     discussionId: $stateParams.targetId,
                //     userIdList: [$scope.curUID]
                // }, function (ret, err) {
                //     if (ret) {
                //         if (ret.status == 'success')
                //             console.log("addMemberToDiscussion", JSON.stringify(ret));
                //     }
                //     if (err) {
                //         console.log('addMemberToDiscussion error:' + err.code);
                //     }
                // })
            }
            // 获取15条最新消息
            // getLatestMsg($stateParams.targetId, $stateParams.conversationType);

            $scope.$on("$ionicView.enter", function () {
                // alert('p y is here  $ionicView.enter');
                viewScroll.scrollBottom(true);
                console.log('$ionicView.enter');
            });
        }
        //init();
        // === 初始化(END) ===

        // === TODO:垃圾回收(BEGIN) ===
        // === TODO:垃圾回收(END) ===

    }) 