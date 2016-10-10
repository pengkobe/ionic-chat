// Ionic Starter App
var db = null;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.router',
  'starter.services', 'starter.directive', 'starter.config', 'nsPopover',
  'ngCordova', 'btford.socket-io'])
  .run(function (UpdateService, $cordovaSQLite, $ionicPlatform, $rootScope,
    $ionicLoading, $cordovaAppVersion, HttpFactory, RequestUrl,
    $cordovaFileTransfer, $cordovaFileOpener2, $timeout, $ionicPopup, $location, $ionicHistory) {
    $ionicPlatform.ready(function () {
      // 发短信 id/key
      window.BOOTSTRAP_OK = true;
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
        // 存聊天系统消息记录
        db = $cordovaSQLite.openDB({ name: "sqLite.db" });
      } else {
        db = window.openDatabase("sqLite.db", "1.0", "database", 5 * 1024 * 1024);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      // Android软件更新
      //checkUpdate();
    });

    // 热更新
    function updateFiles() {
      var check = UpdateService.check();
      check.then(function (result) {
        if (result === true) {
          var download = UpdateService.download();
          download.then(function () {
            UpdateService.update(false);
          },
            function (error) {
              console.log(JSON.stringify(error));
            }
          );
        } else {
          console.log('not update available');
        }
      },
        function (error) {
          console.log('no update available');
          console.log(JSON.stringify(error));
        });
    }

    // 大版本更新
    function checkUpdate() {
      var serverAppVersion = null;
      HttpFactory.send({
        url: RequestUrl + 'url',
        method: 'post'
      }).success(function (data) {
        serverAppVersion = data.data[0].Version;
        var type = data.data[0].type;
        $rootScope.version = '1.1.1';
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $rootScope.version = version;
          if (version != serverAppVersion && type == 5) {
            showUpdateConfirm(data.data[0].VersionContent);
          }
          else {
            //  updateFiles();
          }
        })
      });
    }

    // 更新确认
    function showUpdateConfirm(updateContent) {
      var confirmPopup = $ionicPopup.confirm({
        title: '发现新版本',
        //从服务端获取更新的内容
        template: updateContent,
        cancelText: '以后再说',
        okText: '立即升级'
      });
      confirmPopup.then(function (res) {
        if (res) {
          $ionicLoading.show({
            template: "已经下载：0%"
          });
          //可以从服务端获取更新APP的路径
          var url = RequestUrl + "app_download/efos-black-beta.apk";
          //APP下载存放的路径，可以使用cordova file插件进行相关配置
          var targetPath = "file:///storage/sdcard0/Download/efos-black-beta.apk";
          var trustHosts = true;
          var options = {};
          $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
            // 打开下载下来的APP
            $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
            ).then(function () {
              // 成功
            }, function (err) {
              // 错误
            });
            $ionicLoading.hide();
          }, function (err) {
            alert('下载失败');
          }, function (progress) {
            $timeout(function () {
              var downloadProgress = (progress.loaded / progress.total) * 100;
              $ionicLoading.show({
                template: "已经下载：" + Math.floor(downloadProgress) + "%"
              });
              if (downloadProgress > 99) {
                $ionicLoading.hide();
              }
            })
          });
        } else {
          // 取消更新
        }
      });
    }

    $rootScope.$on('loading:hide', function () {
      $ionicLoading.hide();
    });

    // 退出应用/ 物理按键事件注册
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
      if ($location.path() == '/YIPENG/index') {
        showConfirm();
      } else if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else {
        showConfirm();
      }
      return false;
    }, 100);
  })
  ////////////////////////////////////ws/////////////////////////////////////////////
  // 全局监听PhoneRtc消息
  .run(function ($state, signaling, $ionicLoading) {
    signaling.on('messageReceived', function (name, message, signaling) {
      switch (message.type) {
        case 'call':
          if ($state.current.name === 'call') {
            signaling.emit('sendMessage', name, { type: 'callInProgress' });
            return;
          }
          // alert('收到视频通话请求，准备跳转！' + message.type);
          $state.go('call', { isCalling: false, contactName: name });
          break;
      }
    });
  })
  /// 字符转码
  .filter('trustHtml', function ($sce) {
    return function (input) {
      return $sce.trustAsHtml(input);
    }
  });
