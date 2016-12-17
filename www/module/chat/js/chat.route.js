'use strict';
angular.module('chat.route', [])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('tab.call', {
                cache: false,
                url: '/call/:contactName?isCalling',
                controller: 'CallCtrl',
                templateUrl: 'module/chat/pages/call/call.html'
            })
            .state('tab.chat', {
                url: '/chat',
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/tpl/contacts.html',
                        controller: 'contacts'
                    }
                }
            })
            .state('tab.friendInfo', {
                url: '/friendInfo/:targetId/:targetName/:conversationType',
                cache: false,
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/pages/friendinfo/friendinfo.html',
                        controller: 'friendInfoCtrl'
                    }
                }
            })
            .state('tab.groupInfo', {
                url: '/groupInfo/:targetId/:targetName/:groupType/:conversationType',
                cache: false,
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/pages/groupinfo/groupinfo.html',
                        controller: 'groupInfoCtrl'
                    }
                }
            })
            .state('tab.chatDetail', {
                url: '/chat-detail',
                params: { messageId: null, name: null, targetId: null, conversationType: null },
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/pages/chatdetail/chatdetail.html',
                        controller: 'chatDetail'
                    }
                }
            })
            .state('tab.addGroup', {
                url: '/addGroup',
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/pages/addgroup/addgroup.html',
                        controller: 'addGroupCtrl'
                    }
                }
            })
            .state('tab.addGroupmember', {
                url: '/addGroupmember',
                params: { GroupID: null },
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/pages/addgroupmember/addgroupmember.html',
                        controller: 'addGroupmember'
                    }
                }
            })
            .state('tab.addFriend', {
                url: '/addFriend',
                views: {
                    'tab-chat': {
                        templateUrl: 'module/chat/pages/addfriend/addfriend.html',
                        controller: 'addFriendCtrl'
                    }
                }
            });
    }]);
