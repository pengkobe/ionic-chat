'use strict';
angular.module('chat.route', [])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('call', {
                cache: false,
                url: '/call/:contactName?isCalling',
                controller: 'CallCtrl',
                templateUrl: 'templates/chat/call.html'
            })
            .state('chat.contacts', {
                url: '/contacts',
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/contacts.html',
                        controller: 'contacts'
                    }
                }
            })
            .state('chat.friendInfo', {
                url: '/friendInfo/:targetId/:targetName/:conversationType',
                cache: false,
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/friendinfo.html',
                        controller: 'friendInfoCtrl'
                    }
                }
            })
            .state('chat.groupInfo', {
                url: '/groupInfo/:targetId/:targetName/:groupType/:conversationType',
                cache: false,
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/groupinfo.html',
                        controller: 'groupInfoCtrl'
                    }
                }
            })
            .state('chat.chatDetail', {
                url: '/chat-detail',
                params: { messageId: null, name: null, targetId: null, conversationType: null },
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/chat-detail.html',
                        controller: 'chatDetail'
                    }
                }
            })


            .state('chat.addTeam', {
                url: '/addTeam',
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/add/addTeam.html',
                        controller: 'addTeamCtrl'
                    }
                }
            })
            .state('chat.addTeammate', {
                url: '/addTeammate',
                params: { GroupID: null },
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/add/addTeammate.html',
                        controller: 'addTeammateCtrl'
                    }
                }
            })
            .state('chat.addFriend', {
                url: '/addFriend',
                views: {
                    'yipeng-chat': {
                        templateUrl: 'templates/chat/add/addFriend.html',
                        controller: 'addFriendCtrl'
                    }
                }
            });
    }]);