/**
 * Created by Administrator on 2016/7/27.
 */
var service = angular.module("starter.services", []);

service.factory("ContactsNav", function ($http) {

  function getFriends() {
    return $http({method: "get", url: "3.php"});
  }

  return {
    getFriends: getFriends
  }

});
