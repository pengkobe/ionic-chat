angular.module('starter.controllers', [])
    // 登录
    .controller('LoginCtrl', function ($timeout, $scope, HttpFactory, $state, $ionicPopup,
        myNote, CacheFactory, $rootScope, signaling, RequestUrl, currentUser) {
        $scope.$on('$ionicView.beforeEnter', function () {
            if (!!CacheFactory.get('Login')) {
                var cache = angular.fromJson(CacheFactory.get('UserAccount'));
                if (!cache.Mobile || cache.Mobile == 'null') {
                    $state.go('checkMobile');
                } else {
                    $state.go('YIPENG.person');
                }
            }
        });

        $scope.user = {};
        $scope.loginIn = function (valid) {
            if (valid) {
                $scope.user.VerificationCode = {};
                $scope.user.UseVerificationCode = false;
                HttpFactory.send({
                    url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.SignUp',
                    data: {
                        name: $scope.user.name,
                        pwd: $scope.user.pwd
                    },
                    method: 'post'
                }).success(function (data) {
                    // console.log(data);
                    if (data.data.length == 0) {
                        myNote.myNotice("用户名或密码错误!");
                    } else {
                        var uuid = ionic.Platform.device().uuid;
                        if (data.data[0].IsBindPhone == '1') {
                            if (data.data[0].PhoneCode == null) {
                                //写入uuid；
                                setPhoneCode(data.data[0].UserID, uuid);
                            } else if (data.data[0].PhoneCode != uuid) {
                                myNote.myNotice('该账号不能在这个手机上登录！');
                                return;
                            }
                        }
                        //存储登录信息
                        CacheFactory.save('Login', true);
                        currentUser.setUserinfo(data.data[0]);
                        CacheFactory.save('UserAccount', data.data[0]);
                        if (data.data[0].Mobile == null) {
                            $state.go('checkMobile');
                        } else {
                            $state.go('YIPENG.person');
                        }
                    }
                });
            } else {
                if ($scope.user.name == undefined && $scope.user.pwd == undefined) {
                    myNote.myNotice("用户名和密码不能为空!");
                }
                else if ($scope.user.name == undefined) {
                    myNote.myNotice("用户名不能为空!");
                }
                else if ($scope.user.pwd == undefined) {
                    myNote.myNotice("密码不能为空!");
                }
            }
        };
        function setPhoneCode(userId, uuid) {
            HttpFactory.send({
                url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.APP_CommonBLL.UpdateBindPhoneInfo',
                data: {
                    UserID: userId,
                    PhoneCode: uuid
                },
                method: 'post'
            }).success(function (data) {
                //手机绑定成功
            })
        }
    })
    // 注册
    .controller('RegisterCtrl', function (CacheFactory, $scope, $state, myNote, HttpFactory, RequestUrl, $timeout, $interval) {
        $scope.user = { state: true };
        $scope.canClick = false;
        $scope.buttonTitle = '获取验证码';

        $scope.SendMsgCode = function (mobPhone) {
            if ($scope.user.phone == null) {
                myNote.myNotice('手机号码不能为空', 2000);
                return;
            }
            if (!/^1\d{10}$/.test(mobPhone)) {
                myNote.myNotice('手机号码格式不正确');
                return;
            }
            $scope.canClick = true;
            $scope.buttonTitle = 60;
            var itr = $interval(function () {
                if ($scope.buttonTitle == 0) {
                    $scope.buttonTitle = '获取验证码';
                    $interval.cancel(itr);
                    $scope.canClick = false;
                } else {
                    $scope.buttonTitle -= 1;
                }
            }, 1000);
            AV.Cloud.requestSmsCode(mobPhone).then(function () {
                //发送成功
                console.log('success');
            }, function (err) {
                //发送失败
                myNote.myNotice(err.message);
            });
        };
        $scope.toProtocol = function () {
        };
        $scope.tip = true;
        $scope.register = function () {
            if (!$scope.tip) {
                return;
            } else {
                $scope.tip = false;
                $timeout(function () {
                    $scope.tip = true;
                }, 5000);
            }
            if ($scope.user.phone == null) {
                myNote.myNotice('手机号不能为空!', 1000);
                return;
            } else if ($scope.user.smsCode == null) {
                myNote.myNotice('验证码不能为空!', 1000);
                return;
            } else if ($scope.user.state == false) {
                myNote.myNotice('请先同意协议！', 1000);
                return;
            } else if ($scope.user.pwd == null) {
                myNote.myNotice('密码不能为空！', 1000);
                return;
            }
            var reg1 = /^1[3|4|5|7|8][0-9]{9}$/;
            var reg2 = /\d/;
            var reg3 = /[a-z]/;
            var reg4 = /[a-z0-9]{6,12}/;
            var phone = $scope.user.phone;
            var pwd = $scope.user.pwd.toLowerCase();
            if (!reg1.test(phone)) {
                myNote.myNotice('手机号格式不对！')
            } else if (!(reg2.test(pwd) && reg3.test(pwd) && reg4.test(pwd))) {
                myNote.myNotice('密码格式不对！')
            } else {
                var user = new AV.User();
                user.signUpOrlogInWithMobilePhone({
                    mobilePhoneNumber: $scope.user.phone,
                    smsCode: $scope.user.smsCode
                }).then(function (user) {
                    //注册或者登录成功
                    personData(phone, pwd);
                    //console.log(user);
                }, function (error) {
                    // 失败
                    myNote.myNotice(error.message);
                });
            }
            function personData(phone, pwd) {
                HttpFactory.send({
                    url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.SignIn',
                    data: {
                        model: angular.toJson({
                            Mobile: phone,
                            Password: pwd,
                            SumPoint: 50
                        })
                    },
                    method: 'post'
                }).success(function (data) {
                    CacheFactory.save('token', true);
                    console.log(data);
                    if (data.data.length == 0) {
                        myNote.myNotice('该号码已注册，请直接登录！', 2000);
                        $timeout(function () {
                            $state.go('login');
                        }, 2000);
                    } else {
                        CacheFactory.save('Login', true);
                        CacheFactory.save('UserAccount', data.data[0]);
                        $state.go('YIPENG.person');
                    }
                })
            }
        };
    })
    // MAIN CONTROL
    .controller('YIPENGCtrl', function ($rootScope, $scope, newMessageEventService) {
        /// ==== 协同相关, 全局监听消息(BEGIN) ====
        var chMsg = function (newValue, oldValue) {
            // alert('mainpage:来消息了！newValue:'+newValue +":oldValue:" + oldValue);
            if (newValue !== oldValue) {
                var jsonMsg = newValue.pop();
                if (typeof jsonMsg !== "undefined" && jsonMsg !== "undefined") {
                    newMessageEventService.broadcast(jsonMsg);
                }
            }
        };
        // watch items的变化
        var listener = $rootScope.$watch('arrMsgs', chMsg, true);

        $scope.$on('$destroy', function () {
            console.log('destroy');
            listener();
        });
        /// ==== 协同相关, 全局监听消息(END) ====
    })
    // 验证手机
    .controller('checkMobileCtrl', function ($scope, $interval, myNote, CacheFactory, HttpFactory, baseUrl, $state) {
        $scope.canClick = false;
        $scope.buttonTitle = '获取验证码';
        $scope.user = {};
        $scope.SendMsgCode = function (tel) {
            if (!/^1\d{10}$/.test(tel)) {
                myNote.myNotice('手机号码格式不正确');
                return;
            }
            $scope.canClick = true;
            $scope.buttonTitle = 60;

            var itr = $interval(function () {
                if ($scope.buttonTitle == 0) {
                    $scope.buttonTitle = '获取验证码';
                    $interval.cancel(itr);
                    $scope.canClick = false;
                } else {
                    $scope.buttonTitle -= 1;
                }
            }, 1000);

            AV.Cloud.requestSmsCode(tel).then(function () {
                //发送成功
                console.log('success');
            }, function (err) {
                //发送失败
                myNote.myNotice(err.message);
            });
        };

        $scope.commit = function () {
            var user = new AV.User();
            user.signUpOrlogInWithMobilePhone({
                mobilePhoneNumber: $scope.user.phone,
                smsCode: $scope.user.smsCode
            }).then(function (user) {
                //注册或者登录成功
                updateMobile()
            }, function (error) {
                // 失败
                myNote.myNotice(error.message);
            });
        };

        function updateMobile() {
            var cache = angular.fromJson(CacheFactory.get('UserAccount'));

            HttpFactory.send({
                url: baseUrl + 'UserInfo_newBLL.UpdateMsg',
                data: {
                    UserID: cache.UserID,
                    columnName: 'Mobile',
                    value: $scope.user.phone
                },
                method: 'post'
            }).success(function (data) {
                console.log(data);
                if (data == 'false') {
                    myNote.myNotice('该号码已注册，无法绑定！');
                } else {
                    cache.Mobile = $scope.user.phone;
                    CacheFactory.save('UserAccount', cache);
                    $state.go('YIPENG.person');
                }

            });
        }
    });