angular.module('chat.call', [])
    // 通话
    .controller('CallCtrl', function ($scope, $state, $rootScope, $timeout, $ionicHistory,
        $stateParams, signaling, Friends, rongyunService, mediaService) {
        var duplicateMessages = [];
        // 获取联系人
        $scope.contacts = {};
        // 静音
        $scope.muted = false;
        // 是否通话中
        $scope.callInProgress = false;
        // 是否主动发起
        $scope.isCalling = $stateParams.isCalling === 'true';

        // 响铃
        if (!$scope.isCalling) {
            mediaService.playSound();
        }
        // 查找联系人信息
        var contactUser = Friends.get($stateParams.contactName);
        if (!contactUser) {
            return;
        }
        $scope.contactUser = contactUser;
        $scope.contactName = contactUser.id;

        function call(isInitiator, contactName) {
            if (isInitiator) {
                sendMessage('[发起视频通话]');
            }
            // session通话初始化
            var session = phoneRTCService.createSession();
            session.on('sendMessage', function (data) {
                signaling.emit('sendMessage', contactName, {
                    type: 'phonertc_handshake',
                    data: JSON.stringify(data)
                });
            });
            session.on('answer', function () {
                // console.log('Answered!');
            });
            session.on('disconnect', function () {
                if ($scope.contacts[contactName]) {
                    delete $scope.contacts[contactName];
                }
                if (Object.keys($scope.contacts).length === 0) {
                    signaling.emit('sendMessage', contactName, { type: 'ignore' });
                    //junmback();
                    alert('************disconnects*************');
                }
            });
            session.call();
            // 保存连接
            $scope.contacts[contactName] = session;
        }
        // 拨号[发起]
        if ($scope.isCalling) {
            //alert('发起聊天：' + $scope.contactName + 'is Calling:' + $scope.isCalling);
            signaling.emit('sendMessage', $scope.contactName, { type: 'call' });
        }

        // 忽略
        $scope.ignore = function (msg) {
            alert('忽略');
            if (ring) {
                ring.release();
            }
            sendMessage(msg);
            var contactNames = Object.keys($scope.contacts);
            if (contactNames.length > 0) {
                $scope.contacts[contactNames[0]].disconnect();
            } else {
                signaling.emit('sendMessage', $scope.contactName, { type: 'ignore' });
                $scope.callInProgress = false;
                junmback();
            }
        };

        // 结束通话
        $scope.end = function () {
            alert('结束');
            sendMessage('[结束通话]');
            Object.keys($scope.contacts).forEach(function (contact) {
                $scope.contacts[contact].close();
                delete $scope.contacts[contact];
            });
            signaling.emit('sendMessage', $scope.contactName, { type: 'end' });
            $scope.callInProgress = false;
            junmback();
        };

        // 接听
        $scope.answer = function () {
            //alert('接听');
            if (ring) {
                ring.release();
            }
            if ($scope.callInProgress) {
                alert('*****正在通话中哦*****');
                return;
            }
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
        // $scope.toggleMute = function () {
        //     $scope.muted = !$scope.muted;
        //     Object.keys($scope.contacts).forEach(function (contact) {
        //         var session = $scope.contacts[contact];
        //         session.streams.audio = !$scope.muted;
        //         session.renegotiate();
        //     });
        // };

        $scope.updateVideoPosition = function () {
            $rootScope.$broadcast('videoView.updatePosition');
        };

        // === socket.io消息分类处理(BEGIN) ===
        function onMessageReceive(name, message) {
            switch (message.type) {
                case 'answer':
                    // alert('************别人点了接听呀*************');
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
                    // alert('************call 方法没有问题呀*************');
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
                            $scope.callInProgress = false;
                            junmback();
                        }
                    } else {
                        $scope.callInProgress = false;
                        junmback();
                    }
                    break;
                // 结束通话
                case 'end':
                    // alert('对方已经结束通话');
                    Object.keys($scope.contacts).forEach(function (contact) {
                        $scope.contacts[contact].close();
                        delete $scope.contacts[contact];
                    });
                    $timeout(function () {
                        $scope.callInProgress = false;
                        junmback();
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
                    alert("add_to_group");
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
                    junmback();
                    break;
                default: break;
            }
        }
        signaling.on('messageReceived', onMessageReceive);
        $scope.$on('$destroy', function () {
            signaling.removeListener('messageReceived', onMessageReceive);
        });
        function sendMessage(content) {
            rongyunService.sendMessage("PRIVATE", contactUser.id, content).then(function (data) {
                appendNewMsg(data, true);
            });
        }
        function junmback() {
            $ionicHistory.goBack(-1);
        }
    });
