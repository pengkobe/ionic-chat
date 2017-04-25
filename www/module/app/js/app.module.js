(function () {
   /** for templatecache */
    angular
        .module('app.core', []);
	})();

var _modules = ['dash', 'account', 'chat', 'login'];

angular.module('starter', [
  'ionic','app.core',
  'app.directive', 'app.service',
  "ionchat.config", "oc.lazyLoad",
  'nsPopover', 'ngCordova', 
  'btford.socket-io'].concat(_modules),
  function ($httpProvider) { // 修改 http 请求头
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

  .run(function ($ionicPlatform, $ionicPopup, $ionicHistory, HotUpdateService) {
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

    // 退出应用/ 物理按键事件注册( android )
    $ionicPlatform.registerBackButtonAction(function (e) {
      e.preventDefault();
      function showConfirm() {
        var confirmPopup = $ionicPopup.confirm({
          title: '<strong>退出应用?</strong>',
          template: '你确定要退出应用吗?',
          okText: '退出',
          cancelText: '取消'
        });
        confirmPopup.then(function (res) {
          if (res) {
            ionic.Platform.exitApp();
          } else {
            return false;
          }
        });
      }
      if ($location.path() == '/chat/account') {
        showConfirm();
      } else if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else {
        showConfirm();
      }
      return false;
    }, 100);
    // 热更新
    // updateFiles();
    function updateFiles() {
      var check = HotUpdateService.check();
      check.then(function (result) {
        if (result === true) {
          var download = HotUpdateService.download();
          download.then(function () {
            HotUpdateService.update(false);
          },function (error) {
              console.log(JSON.stringify(error));
            }
          );
        } else { // 无可用更新
          console.log('not update available');
        }
      },function (error) { // 检查更新出错
          console.log("error:",JSON.stringify(error));
        });
    }
  })

  /**
   * 全局/平台样式配置
   */
  .config(function ($ionicConfigProvider, $ocLazyLoadProvider) {
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

    // 配置后退按钮文字消失
    $ionicConfigProvider.backButton.previousTitleText(false);
  })
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    // 获取加载地址(缓存 or 本地)
    // var manifest = localStorage.getItem("manifest");
    // var root = '';
    // if (manifest) {
    //   manifest = JSON.parse(manifest)
    //   root = (manifest.root + '/') || '';
    // }

    $stateProvider
      .state('tab', {
        url: '/tab',
        controller: 'tabCtrl',
        abstract: true,
        templateUrl: 'dev/static/app/tpl/tabs.html'
      })
      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'dev/static/tab_dash/tpl/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })
      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'dev/static/tab_account/tpl/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })
        // resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        //   loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //     // you can lazy load files for an existing module
        //     return $ocLazyLoad.load(root + 'dist/js/devtest.min.js');
        //   }]
        // }
      ;

    $urlRouterProvider.otherwise('/login');

    // $httpProvider.interceptors.push(function ($rootScope, HotUpdateService) {
    //   return {
    //     request: function (config) {
    //       if (HotUpdateService.isFileCached(config.url)) {
    //         config.url = HotUpdateService.getCachedUrl(config.url);
    //       }
    //       $rootScope.$broadcast('loading:show');
    //       return config;
    //     },
    //     response: function (response) {
    //       $rootScope.$broadcast('loading:hide');
    //       return response;
    //     }
    //   }
    // });
  })
  /*
  * 抽象模块
  */
  .controller('tabCtrl', function ($scope, $stateParams) {
  });

// 调试 Hot Update 用
// angular.bootstrap(document.body,["starter"]);