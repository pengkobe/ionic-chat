/*
 * controller负责数据对接与权限控制
 */

angular.module('dash', [])
  .controller('DashCtrl', function ($scope) {
    // 构建消息UI模板
    $scope.buildTplUrl = function (type) {
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
      return 'dash/business/' + tplUrl + '/' + tplUrl + '.html';
    };

    /**
     * 构建Aircondition业务
     */
    function buildAircondition() {
      $scope.expanders = [
        {
          title: 'Click me to expand',
          text: 'Hi there folks, I am the content that was hidden but is now shown.'
        },
        {
          title: 'Click this',
          text: 'I am even better text than you have seen previously'
        },
        {
          title: 'Test',
          text: 'test'
        }];
    }
  })
