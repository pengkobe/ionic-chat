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

            .state('EFOS', {
                cache: false,
                url: '/EFOS',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: 'EFosCtrl'
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
            .state('EFOS.index', {
                url: '/index',
                views: {
                    'efos-index': {
                        templateUrl: 'templates/index/index.html',
                        controller: 'IndexCtrl'
                    }
                }
            })
            .state('EFOS.person', {
                url: '/person',
                views: {
                    'efos-person': {
                        templateUrl: 'templates/person/person.html',
                        controller: 'PersonCtrl'
                    }
                }
            })
            .state('EFOS.update', {
                url: '/person/update',
                cache:false,
                views: {
                    'efos-person': {
                        templateUrl: 'templates/person/update.html',
                        controller: 'UpdateCtrl'
                    }
                }
            })
            .state('EFOS.setting', {
                url: '/person/setting',
                views: {
                    'efos-person': {
                        templateUrl: 'templates/person/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            .state('EFOS.integral', {
                url: '/person/integral',
                views: {
                    'efos-person': {
                        templateUrl: 'templates/person/integral.html',
                        controller: 'IntegralCtrl'
                    }
                }
            })
            .state('EFOS.contacts', {
                url: '/contacts',
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/contacts.html',
                        controller: 'contacts'
                    }
                }
            })
            .state('EFOS.friendInfo', {
                url: '/friendInfo/:targetId/:targetName/:conversationType',
                 cache:false,
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/friendinfo.html',
                        controller: 'friendInfoCtrl'
                    }
                }
            })
            .state('EFOS.groupInfo', {
                url: '/groupInfo/:targetId/:targetName/:groupType/:conversationType',
                 cache:false,
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/groupinfo.html',
                        controller: 'groupInfoCtrl'
                    }
                }
            })
            .state('EFOS.chatDetail', {
                url: '/chat-detail',
                params: {messageId: null, name: null, targetId: null, conversationType: null},
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/chat-detail.html',
                        controller: 'chatDetail'
                    }
                }
            })
            .state('EFOS.call', {
                cache: false,
                url: '/call/:contactName?isCalling',
                views: {
                    'efos-chat': {
                        controller: 'CallCtrl',
                        templateUrl: 'templates/chat/call.html'
                    }
                }
            })
              .state('EFOS.addTeam', {
                url: '/addTeam',
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/add/addTeam.html',
                        controller: 'addTeamCtrl'
                    }
                }
            })
            .state('EFOS.addTeammate', {
                url: '/addTeammate',
                params: {GroupID: null},
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/add/addTeammate.html',
                        controller: 'addTeammateCtrl'
                    }
                }
            })
            .state('EFOS.addFriend', {
                url: '/addFriend',
                views: {
                    'efos-chat': {
                        templateUrl: 'templates/chat/add/addFriend.html',
                        controller: 'addFriendCtrl'
                    }
                }
            })
            .state('EFOS.task', {
                url: '/task',
                views: {
                    'efos-task': {
                        templateUrl: 'templates/task/task.html',
                        controller: 'taskCtrl'
                    }
                }
            });
            
        $urlRouterProvider.otherwise('/register');

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