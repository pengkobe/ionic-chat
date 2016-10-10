// Ionic Starter App

// 主页
var aaa = ['dash'];

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', "oc.lazyLoad"].concat(aaa), function ($httpProvider) {
  // AngularJS默认为JSON，这里全局修改为:x-www-form-urlencoded
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  var param = function (obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
    for (name in obj) {
      value = obj[name];
      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
    return query.length ? query.substr(0, query.length - 1) : query;
  };
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function (data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})

  .run(function ($ionicPlatform, $ocLazyLoad) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        // fix ios Keyboard cannot scroll
        window.cordova.plugins.Keyboard.shrinkView(true);
        // fix ios toolbar
        window.cordova.plugins.Keyboard.hideFormAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      // 开启动态更新
      window.BOOTSTRAP_OK = true;
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    // 获取加载地址(缓存 or 本地)
    var manifest= localStorage.getItem("manifest");
     var root = '';
    if(manifest){
      manifest = JSON.parse(manifest)
      root = (manifest.root +'/') || '';
    }
    

    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        controller: 'tabCtrl',
        abstract: true,
        templateUrl: 'app/tpl/tabs.html'
      })

      // ===dash===
      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'dash/tpl/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })

      // ===chats===
      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'chat/tpl/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        },
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
          loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load([root+ 'chat/chat.min.js']);
          }]
        }
      })

      .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'chat/tpl/chat-detail.html',
            controller: 'ChatDetailCtrl'
          }
        }
      })

      // ===account===
      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'chat/tpl/tab-account.html',
            controller: 'AccountCtrl'
          }
        },
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
          loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load(root+'account/account.min.js');
          }]
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
  })
  /* 
  * 抽象模块
  */
  .controller('tabCtrl', function ($scope, $stateParams) {
  });
