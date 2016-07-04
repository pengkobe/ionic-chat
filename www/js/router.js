/**
 * 路由
 */
angular.module('starter.router', [])
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
        $httpProvider.interceptors.push(function ($rootScope) {
            return {
                request: function (config) {
                    $rootScope.$broadcast('loading:show');
                    return config;
                },
                response: function (response) {
                    $rootScope.$broadcast('loading:hide');
                    return response;
                }
            }
        });

        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('bottom');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-ios-arrow-left');
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.platform.ios.views.transition('none');
        $ionicConfigProvider.platform.android.views.transition('none');
        $stateProvider
            .state('YIPENG', {
                cache: false,
                url: '/YIPENG',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: 'YIPENGCtrl'
            })
            .state('login', {
                cache: false,
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            })
            .state('checkMobile', {
                url: '/checkMobile',
                templateUrl: 'templates/checkMobile.html',
                controller: 'checkMobileCtrl'
            })
            .state('YIPENG.person', {
                url: '/person',
                views: {
                    'yipeng-person': {
                        templateUrl: 'templates/setting/person.html',
                        controller: 'PersonCtrl'
                    }
                }
            })
            .state('YIPENG.setting', {
                url: '/person/setting',
                views: {
                    'yipeng-person': {
                        templateUrl: 'templates/setting/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            .state('YIPENG.integral', {
                url: '/person/integral',
                views: {
                    'yipeng-person': {
                        templateUrl: 'templates/setting/integral.html',
                        controller: 'IntegralCtrl'
                    }
                }
            })
            .state('YIPENG.contacts', {
                url: '/contacts',
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/contacts.html',
                        controller: 'contacts'
                    }
                }
            })
            .state('YIPENG.friendInfo', {
                url: '/friendInfo/:targetId/:targetName/:conversationType',
                 cache:false,
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/friendinfo.html',
                        controller: 'friendInfoCtrl'
                    }
                }
            })
            .state('YIPENG.groupInfo', {
                url: '/groupInfo/:targetId/:targetName/:groupType/:conversationType',
                 cache:false,
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/groupinfo.html',
                        controller: 'groupInfoCtrl'
                    }
                }
            })
            .state('YIPENG.chatDetail', {
                url: '/chat-detail',
                params: {messageId: null, name: null, targetId: null, conversationType: null},
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/chat-detail.html',
                        controller: 'chatDetail'
                    }
                }
            })
            .state('YIPENG.call', {
                cache: false,
                url: '/call/:contactName?isCalling',
                views: {
                    'yipeng-chat': {
                        controller: 'CallCtrl',
                        templateUrl: 'templates/chat/call.html'
                    }
                }
            })
              .state('YIPENG.addTeam', {
                url: '/addTeam',
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/add/addTeam.html',
                        controller: 'addTeamCtrl'
                    }
                }
            })
            .state('YIPENG.addTeammate', {
                url: '/addTeammate',
                params: {GroupID: null},
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/add/addTeammate.html',
                        controller: 'addTeammateCtrl'
                    }
                }
            })
            .state('YIPENG.addFriend', {
                url: '/addFriend',
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/add/addFriend.html',
                        controller: 'addFriendCtrl'
                    }
                }
            });
            
        $urlRouterProvider.otherwise('/login');

        $httpProvider.interceptors.push(['UpdateService', function (UpdateService) {
            return {
                'request': function (config) {
                    if (UpdateService.isFileCached(config.url)) {
                        config.url = UpdateService.getCachedUrl(config.url);
                    }
                    return config;
                },
                'response': function (response) {
                    return response;
                }
            };
        }]);
    });