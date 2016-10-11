'use strict';
angular.module('chat.route', [])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('tab.call', {
                cache: false,
                url: '/call/:contactName?isCalling',
                controller: 'CallCtrl',
                templateUrl: 'module/chat/business/call/call.html'
            })
            .state('tab.chat.contacts', {
                url: '/contacts',
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/contacts.html',
                        controller: 'contacts'
                    }
                }
            })
            .state('tab.chat.friendInfo', {
                url: '/friendInfo/:targetId/:targetName/:conversationType',
                cache: false,
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/friendinfo.html',
                        controller: 'friendInfoCtrl'
                    }
                }
            })
            .state('tab.chat.groupInfo', {
                url: '/groupInfo/:targetId/:targetName/:groupType/:conversationType',
                cache: false,
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/groupinfo.html',
                        controller: 'groupInfoCtrl'
                    }
                }
            })
            .state('tab.chat.chatDetail', {
                url: '/chat-detail',
                params: { messageId: null, name: null, targetId: null, conversationType: null },
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/chat-detail.html',
                        controller: 'chatDetail'
                    }
                }
            })


            .state('tab.chat.addTeam', {
                url: '/addTeam',
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/add/addTeam.html',
                        controller: 'addTeamCtrl'
                    }
                }
            })
            .state('tab.chat.addTeammate', {
                url: '/addTeammate',
                params: { GroupID: null },
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/add/addTeammate.html',
                        controller: 'addTeammateCtrl'
                    }
                }
            })
            .state('tab.chat.addFriend', {
                url: '/addFriend',
                views: {
                    'ion-chat': {
                        templateUrl: 'module/chat/tpl/add/addFriend.html',
                        controller: 'addFriendCtrl'
                    }
                }
            });
    }]);