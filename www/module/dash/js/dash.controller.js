/*
 * controller负责数据对接与权限控制
 */
angular.module('dash', ["dash.service"])
  .controller('DashCtrl', function ($scope, Mocking_Users, Mocking_Friends, loadAllFriend) {
    // 构建消息UI模板
    $scope.buildTplUrl = function (type) {

      /** 业务类模板 */
      var tplUrl;
      switch (type) {
        case 'industry':
          tplUrl = 'industry';
          break;
        case 'medical':
          tplUrl = 'medical';
          break;
        case 'aircondition':
          tplUrl = 'aircondition';
          buildAircondition();
          break;
        default:
        // TODO：隐藏业务tab
      }
      return 'module/dash/business/' + tplUrl + '/' + tplUrl + '.html';
    };

    /**
     * 构建Aircondition业务
     */
    $scope.expanders = [
      {
        title: 'Click me to expand',
        text: 'Hi there folks, I am the content that was hidden but is now shown.'
      },{
        title: 'Click this',
        text: 'I am even better text than you have seen previously'
      },{
        title: 'Test',
        text: 'test'
      }];
    function buildAircondition() {

    }

    $scope.mockingUsers = function () {
      alert('模拟用户数据');
      Mocking_Users.init();
      console.log("模拟用户数据...");
    };
    $scope.mockingFriends = function () {
      alert('模拟添加用户好友数据');
      Mocking_Friends.init();
      console.log("模拟添加用户好友数据...");
    };
    $scope.testLoadAllFriends = function () {
      alert('测试Loadfriends');
      loadAllFriend.init();
      console.log("测试Loadfriends...");
    };
  })
