/**
 * Created by Administrator on 2016/7/28.
 */
angular.module("starter.contactsNavUtil", [])

  .factory("contactsNavUtil",function(){

    /*
    * 功能：提示框的显示与消失
    * 参数：falg==true表示显示，此时value必须传 flag==false表示消失
    * 作者：LXQ
    * 最后修改时间：2016/7/29
    * */
    function togglePromptBox(flag,value){
      var obj=angular.element(document.querySelectorAll(".promptBox-hydNav"));
      if(obj.length>1){
        throw("hydContactsNav: the container with class of promptBox-hydNav is not only");
      }
      if(obj.length<1){
        throw("hydContactsNav: the container with class of promptBox-hydNav is null");
      }
      if(flag){
        var h3=obj.find("h3");
        if(h3.length>0){
          obj.find("h3").html(value);
          obj.css("display","block");
        }else{
          throw("hydContactsNav: the container with class of promptBox-hydNav need a h3 tag");
        }
      }else{
        obj.css("display","none");
      }
    }

    /*
     功能：对js数组排序的升级，可以针对对象数组中对象的某一个属性进行排序
     参数：name为对象字段名
     作者：LXQ
     最后修改时间：2016/7/29
     */
    var by = function (name) {
      return function (o, p) {
        var a, b;
        if (o && p && typeof o=== 'object' && typeof p === 'object') {
          a = o[name];
          b = p[name];
          if (a === b) {
            return 0;
          }
          if (typeof a === typeof b) {
            return a < b ? -1 : 1;
          }
          return typeof a < typeof b ? -1 : 1;
        } else {
          throw("hydContactsNav:sort the array error");
        }
      }
    };

    /*
     * 功能：将对象数组按照姓名首字母分类并排序
     * 参数：需要如此处理的对象数组,对象哪个字段为依据
     * 作者：LXQ
     * 最后修改时间：2016/7/29
     * */
    function SortByFirstCode(data,attr) {
      var ary = [];
      for (var i = 0; i < data.length; i++) {
        var attrValue = data[i][attr];
        if(!attrValue){
          throw("hydContactsNav:this attribute is not exist in data");
        }
        if (typeof (attrValue) != "string" || attrValue.trim().length===0) {
          //console.log("not string");
          var aryObj = isAryExist(ary, "#");
          if (aryObj) {
            aryObj.data.push(data[i]);
          } else {
            //todo：表现为#的时候，前台变现为##，不是一个有效的选择器,甚至一些特殊字符也会存在问题，
            //解决办法：增加单独的id字段
            var objForSpecial = {id:"hydContactsNav"+(ary.length+1),firstCode: "#", data: [data[i]]};
            ary.push(objForSpecial);
          }
        } else {
          //需要解决为空串的问题:如果是空串，当做非字符串对待,能进入这里说明长度大于0，chatAt(0)可以不做判断啦。。
          //console.log( attrValue.trim().length);
          var firstCode = pinyin.getCamelChars(attrValue).charAt(0);
          var obj = isAryExist(ary, firstCode);
          if (obj) {
            obj.data.push(data[i]);
          } else {
            var objForNormal = {id:"hydContactsNav"+(ary.length+1),firstCode: firstCode, data: [data[i]]};
            ary.push(objForNormal);
          }
        }
      }
      return ary.sort(by("firstCode"));
    }

    /*
     * 功能：判断当前首字母对象在数组中是否已经存在
     * 参数：对象数组，是否存在的首字母字符
     * 作者：LXQ
     * 最后修改时间：2016/7/27
     * */
    function isAryExist(ary, c) {
      for (var i = 0; i < ary.length; i++) {
        if (ary[i].firstCode === c) {
          return ary[i];
        }
      }
    }

    return {
      togglePromptBox:togglePromptBox,
      SortByFirstCode: SortByFirstCode
    }

  });
