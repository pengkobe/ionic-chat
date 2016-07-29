/**
 * Created by Administrator on 2016/7/27.
 */
var directives=angular.module("starter.directives",[]);

directives.directive("hydContactsNav",function($ionicScrollDelegate,contactsNavUtil){
  return {
    restrict:"E",
    templateUrl:"lib/hydContactsNav/contacts_nav.html",
    replace:false,
    //scope:false,
    scope:{contactsData:"=hydContactsData"},
    link:function(scope, element, attrs, controller){
        //滚动的指定元素
        var hydDelegateHandle=attrs["hydDelegateHandle"];

        /*
         * 功能：用户单独点击，不拖动的处理逻辑
         * 参数：事件对象
         * 作者：LXQ
         * 最后修改时间：2016/7/29
         * */
        scope.goListByTouch=function(event){
          var target=angular.element(event.target);
          var firstCode=target.html();
          var id=target.attr("data-id");
          contactsNavUtil.togglePromptBox(true,firstCode);
          var a_obj=angular.element(document.querySelector("#"+id));
          if(a_obj.length===1){
            var scrollTop=a_obj[0].offsetTop;
            $ionicScrollDelegate.$getByHandle(hydDelegateHandle).scrollTo(0,scrollTop,true);
          }else{
            throw ("hydContactsNav:the nav a is not exits or more than one");
          }

        };

        /*
         * 功能：用户拖动松开逻辑
         * 参数：事件对象
         * 作者：LXQ
         * 最后修改时间：2016/7/29
         * */
        scope.hidePromptBox=function(event){
          contactsNavUtil.togglePromptBox(false);
        };

        /*
         * 功能：用户拖动逻辑处理
         * 参数：事件对象
         * 作者：LXQ
         * 最后修改时间：2016/7/29
         * */
        scope.goList=function(event){
          var target=angular.element(event.target);
          var allHeight=angular.element(target[0].parentElement)[0].offsetHeight;
          var height=target[0].offsetHeight;
          var object=ionic.DomUtil.getPositionInParent(target[0]);
          //todo:因为top值总是高度的整数倍，这也是为什么+1还准确一些的原因,关键是点击第一个元素的准确定位
          var currentTop=object.top+event.gesture.deltaY;
          //console.log(currentTop);
          var index =0;
          var maxIndex=Math.ceil(allHeight/height);
          if(currentTop>allHeight){
            index=maxIndex;
          }else if(currentTop<0){
            index=1;
          }else{
            var roundIndex=Math.round(currentTop/height+1);
            index=roundIndex>maxIndex?maxIndex:roundIndex;
          }
          var detailObj=scope["contactsData"][index-1];
          var firstCode=detailObj.firstCode;
          var id=detailObj.id;
          contactsNavUtil.togglePromptBox(true,firstCode);
          var a_obj=angular.element(document.querySelector("#"+id));
          if(a_obj.length===1){
            var scrollTop=a_obj[0].offsetTop;
            $ionicScrollDelegate.$getByHandle(hydDelegateHandle).scrollTo(0,scrollTop,true);
          }else{
            throw ("hydContactsNav:the nav a is not exits or more than one");
          }
        };
    }

  };
});
