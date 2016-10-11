// Ionic Starter App

// 主页
var _aaa = ['dash','account','chat'];// ,
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'chat.common.directive',
  'chat.common.services', "ionchat.config", 'nsPopover',
  'ngCordova', 'btford.socket-io'].concat(_aaa),
  function ($httpProvider) {
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
  }
  )

  .run(function ($ionicPlatform) {
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

  /**
   * 全局/平台样式配置
   */
  .config(function ($ionicConfigProvider, $urlRouterProvider) {
    $ionicConfigProvider.platform.android.views.transition('android');
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('standard');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
    $urlRouterProvider.otherwise('/index');

    // 配置后退按钮文字消失
    $ionicConfigProvider.backButton.previousTitleText(false);

  })
  .config(function ($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    // 获取加载地址(缓存 or 本地)
    //var manifest = localStorage.getItem("manifest");
    var root = '';
    // if (manifest) {
    //   manifest = JSON.parse(manifest)
    //   root = (manifest.root + '/') || '';
    // }

    $stateProvider
      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        controller: 'tabCtrl',
        abstract: true,
        templateUrl: 'module/app/tpl/tabs.html'
      })
      // ===dash===
      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'module/dash/tpl/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })
      // ===account===
      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'module/chat/tpl/tab-account.html',
            controller: 'AccountCtrl'
          }
        },
        // resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        //   loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //     // you can lazy load files for an existing module
        //     return $ocLazyLoad.load(root+'dist/js/account.min.js');
        //   }]
        // }
      });
    // if none of the above states are matched, use this as the fallback
     $urlRouterProvider.otherwise('/tab/dash');
  })
  /* 
  * 抽象模块
  */
  .controller('tabCtrl', function ($scope, $stateParams) {
    debugger;
  });
