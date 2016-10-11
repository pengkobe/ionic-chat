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
            .state('chat.person', {
                url: '/person',
                views: {
                    'yipeng-person': {
                        templateUrl: 'templates/setting/person.html',
                        controller: 'PersonCtrl'
                    }
                }
            })
            .state('chat.setting', {
                url: '/person/setting',
                views: {
                    'yipeng-person': {
                        templateUrl: 'templates/setting/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            
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
