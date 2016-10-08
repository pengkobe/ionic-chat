angular.module('starter.controllers', [],function($httpProvider){
        // Use x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        var param = function(obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
            for(name in obj) {
                value = obj[name];
                if(value instanceof Array) {
                    for(i=0; i<value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value instanceof Object) {
                    for(subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }
            return query.length ? query.substr(0, query.length - 1) : query;
        };
        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    })
    // 登录
    .controller('LoginCtrl', function ($timeout, $scope, HttpFactory, $state, $ionicPopup,
        myNote, CacheFactory, $rootScope, signaling, RequestUrl, currentUser) {
        $scope.$on('$ionicView.beforeEnter', function () {
            if (!!CacheFactory.get('Login')) {
                $state.go('YIPENG.person');
            }
        });

        $scope.user = {};
        $scope.loginIn = function (valid) {
            if (valid) {
                HttpFactory.send({
                    url: RequestUrl + 'Action.ashx?Name=HYD.E3.Business.UserInfo_newBLL.SignUp',
                    data: {
                        name: $scope.user.name,
                        pwd: $scope.user.pwd
                    },
                    method: 'post'
                }).success(function (data) {
                    // console.log(data);
                    if (data.length == 0) {
                        myNote.myNotice("用户名或密码错误!");
                    } else {
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
    })
    // 注册
    .controller('RegisterCtrl', function (CacheFactory, $scope, $state,
        myNote, HttpFactory, RequestUrl, $timeout, $interval) {
        $scope.user = { };
        $scope.buttonTitle = "注册";

        $scope.register = function () {
            if ($scope.user.password == null) {
                myNote.myNotice('密码不能为空！', 1000);
                return;
            }
            // 非全数字
            var reg2 = /\d/;
            // 非全字母
            var reg3 = /[a-z]/;
            var reg4 = /[a-z0-9]{3,12}/;
            var username = $scope.user.username;
            var password = $scope.user.password.toLowerCase();
            if (!reg4.test(username)) {
                myNote.myNotice('用户名必须为大于3且小于12位的字母或数字！')
            } else if (!(reg2.test(password) && reg3.test(password) && reg4.test(password))) {
                myNote.myNotice('密码格式不对！')
            } else {
                // 直接注册
                register(username, pwd);
            }
            function register(username, Password) {
                HttpFactory.send({
                    url: RequestUrl + 'register',
                    data: {
                        model: angular.toJson({
                            username: username,
                            Password: Password
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
                        CacheFactory.save('UserAccount', data);
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
    });