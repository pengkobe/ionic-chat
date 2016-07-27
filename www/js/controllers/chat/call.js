angular.module('starter.controllers')
    // 通话
    .controller('CallCtrl', function ($scope, $state, $rootScope, $timeout, $interval, $ionicHistory,
        $ionicModal, $stateParams, signaling, CacheFactory, Friends) {
       var duplicateMessages = [];
        // 是否通话中
        $scope.callInProgress = false;
        $scope.contacts = {};
        $scope.muted = false;
        $scope.showVedio = false;

        //实例化录音类, src:需要播放的录音的路径
        var ring = new Media(getPhoneGapPath(),
            // success
            function () {}, function (err) {}
        );
        // 是否主动发起 === false
        $scope.isCalling = $stateParams.isCalling === 'true';
        if (!$scope.isCalling) {
            //开始播放录音
            ring.play();
        }

         // === 联系人模块(BEGIN) ===
        // 在线用户列表
        $scope.hideFromContactList = [$scope.contactName];
        // 联系人列表模板
        // $ionicModal.fromTemplateUrl('templates/select_contact.html', {
        //     scope: $scope,
        //     animation: 'slide-in-up'
        // }).then(function (modal) {
        //     $scope.selectContactModal = modal;
        // });
        // $scope.openSelectContactModal = function () {
        //     cordova.plugins.phonertc.hideVideoView();
        //     $scope.selectContactModal.show();
        // };
        // $scope.closeSelectContactModal = function () {
        //     cordova.plugins.phonertc.showVideoView();
        //     $scope.selectContactModal.hide();
        // };
        // $scope.addContact = function (newContact) {
        //     $scope.hideFromContactList.push(newContact);
        //     signaling.emit('sendMessage', newContact, { type: 'call' });
        //     cordova.plugins.phonertc.showVideoView();
        //     $scope.selectContactModal.hide();
        // };
        // === 联系人模块(END) ===

        
        // 显示已通话时间
        // $scope.VedioTime = 0;
        // $interval(function () {
        //     $scope.VedioTime++;
        // }, 1000);
        $scope.contactUser = {};
        var contactUser = Friends.get($stateParams.contactName);
        if (!contactUser) {
            return;
        }
        $scope.contactUser = contactUser;
        $scope.contactName = contactUser.id;

        // session通话初始化
        function call(isInitiator, contactName) {
            if (isInitiator) {
                sendMessage('[发起视频通话]');
            }
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
            session.on('sendMessage', function (data) {
                signaling.emit('sendMessage', contactName, {
                    type: 'phonertc_handshake',
                    data: JSON.stringify(data)
                });
            });
            session.on('answer', function () {
              
            });
            session.on('disconnect', function () {
                if ($scope.contacts[contactName]) {
                    delete $scope.contacts[contactName];
                }
                if (Object.keys($scope.contacts).length === 0) {
                    signaling.emit('sendMessage', contactName, { type: 'ignore' });
                    //$ionicHistory.goBack(-1);
                }
            });
            session.call();
            // 保存连接
            $scope.contacts[contactName] = session;
        }
        // 拨号[发起]
        if ($scope.isCalling) {
            //alert('发起聊天：' + $scope.contactName + 'isCalling:' + $scope.isCalling);
            signaling.emit('sendMessage', $scope.contactName, { type: 'call' });
        }
        // 忽略
        $scope.ignore = function (msg) {
             // alert('忽略');
            if (ring) {
                ring.stop();
                ring.release();
            }
            sendMessage(msg);
            var contactNames = Object.keys($scope.contacts);
            if (contactNames.length > 0) {
                $scope.contacts[contactNames[0]].disconnect();
            } else {
                signaling.emit('sendMessage', $scope.contactName, { type: 'ignore' });
                $scope.callInProgress = false;
                $ionicHistory.goBack(-1);
            }
        };
        // 结束通话
        $scope.end = function () {
            //alert('结束');
            sendMessage('[结束通话]');
            Object.keys($scope.contacts).forEach(function (contact) {
                $scope.contacts[contact].close();
                delete $scope.contacts[contact];
            });
            signaling.emit('sendMessage', $scope.contactName, { type: 'end' });
            $scope.callInProgress = false;
            // 跳转回聊天页面
            $ionicHistory.goBack(-1);
        };
        // 接听
        $scope.answer = function () {
            //alert('接听');
            if (ring) {
                ring.release();
            }
            if ($scope.callInProgress) {
                return;
            }
            $scope.showVedio = true;
            $scope.callInProgress = true;
            // 1s 后显示视频
            $timeout($scope.updateVideoPosition, 1000);
            call(false, $scope.contactName);
            // 1.5s 后接听
            setTimeout(function () {
                signaling.emit('sendMessage', $scope.contactName, { type: 'answer' });
            }, 1500);
        };
        // 静音
        $scope.toggleMute = function () {
            $scope.muted = !$scope.muted;
            Object.keys($scope.contacts).forEach(function (contact) {
                var session = $scope.contacts[contact];
                session.streams.audio = !$scope.muted;
                session.renegotiate();
            });
        };

        // 更新视频位置???
        $scope.updateVideoPosition = function () {
            $rootScope.$broadcast('videoView.updatePosition');
        };
        // 隐藏自个
        $scope.hideCurrentUsers = function () {
            return function (item) {
                return $scope.hideFromContactList.indexOf(item) === -1;
            };
        };

        // === socket.io消息分类处理(BEGIN) ===
        function onMessageReceive(name, message) {
            // alert('在call里onMessageReceive!');
            switch (message.type) {
                case 'answer':
                    $scope.showVedio = true;
                    $scope.$apply(function () {
                        $scope.callInProgress = true;
                        $timeout($scope.updateVideoPosition, 1000);
                    });
                    var existingContacts = Object.keys($scope.contacts);
                    if (existingContacts.length !== 0) {
                        signaling.emit('sendMessage', name, {
                            type: 'add_to_group',
                            contacts: existingContacts,
                            isInitiator: false
                        });
                    }
                    call(true, name);
                    break;
                // 拒绝接听(忽略)
                case 'ignore':
                    var len = Object.keys($scope.contacts).length;
                    if (len > 0) {
                        if ($scope.contacts[name]) {
                            $scope.contacts[name].close();
                            delete $scope.contacts[name];
                        }

                        var i = $scope.hideFromContactList.indexOf(name);
                        if (i > -1) {
                            $scope.hideFromContactList.splice(i, 1);
                        }

                        if (Object.keys($scope.contacts).length === 0) {
                            // 跳转回聊天页面
                            $scope.callInProgress = false;
                            $ionicHistory.goBack(-1);
                        }
                    } else {
                        // 跳转回聊天页面
                        $scope.callInProgress = false;
                        $ionicHistory.goBack(-1);
                    }
                    break;
                // 结束通话
                case 'end':
                    // alert('对方已经结束通话');
                    Object.keys($scope.contacts).forEach(function (contact) {
                        $scope.contacts[contact].close();
                        delete $scope.contacts[contact];
                    });
                    // 跳转回聊天页面
                    $timeout(function () {
                        $scope.callInProgress = false;
                        $ionicHistory.goBack(-1);
                    }, 1000);
                    break;
                case 'phonertc_handshake':
                    // 本意是屏蔽重复信息，这里我@kobepeng先去掉了
                    //if (duplicateMessages.indexOf(message.data) === -1) { 
                    // key : receiveMessage
                    $scope.contacts[name].receiveMessage(JSON.parse(message.data));
                    //   duplicateMessages.push(message.data);
                    // }
                    break;
                case 'add_to_group':
                    message.contacts.forEach(function (contact) {
                        $scope.hideFromContactList.push(contact);
                        call(message.isInitiator, contact);
                        if (!message.isInitiator) {
                            $timeout(function () {
                                signaling.emit('sendMessage', contact, {
                                    type: 'add_to_group',
                                    contacts: [ContactsService.currentName],
                                    isInitiator: true
                                });
                            }, 1500);
                        }
                    });
                    break;
                case 'callInProgress':
                    alert('对方正在通话中!');
                    $ionicHistory.goBack(-1);
                    break;
                default: break;
            }
        }
        signaling.on('messageReceived', onMessageReceive);
        // === socket.io消息分类处理(END) ===

        $scope.$on('$destroy', function () {
            signaling.removeListener('messageReceived', onMessageReceive);
        });

        // 融云消息提示
        function sendMessage(content) {
            RongCloudLibPlugin.sendTextMessage({
                conversationType: "PRIVATE",
                targetId: contactUser.id,
                text: content,
                extra: "extra text"
            },
            function (ret, err) {
                    if (ret) {
                        if (ret.status == "prepare") {
                            appendNewMsg(ret.result.message, true);
                        }
                        if (ret.status == "success") {
                            // alert("success");
                        }
                    }
                    if (err) {
                        FormateRongyunErr.formate(err);
                    }
                }
            );
        }

        function getPhoneGapPath() {
            var path = window.location.pathname;
            path = path.substr(path, path.length - 9);
             if (isIOS) {
                return 'img/vedio-chat.mp3';
             } else {
                return 'file://' + path+ 'img/vedio-chat.mp3';
            }
        };
    });