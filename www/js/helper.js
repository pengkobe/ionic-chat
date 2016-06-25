angular.module('starter.helper', [])
  // 实现深拷贝
  .factory('deepCopy', function () {
    return {
      deepCopy: function (sObj) {
        if (typeof sObj !== "object") {
          return sObj;
        }
        var s = {};
        if (sObj.constructor == Array) {
          s = [];
        }
        for (var i in sObj) {
          s[i] = this.deepCopy(sObj[i]);
        }
        return s;
      }
    }
  })
  // 事件注册 polyfill
  .factory('addEvent', function () {
    // 游览器事件注册
    function contains(p, c) {
      return p.contains ?
        p != c && p.contains(c) :
        !!(p.compareDocumentPosition(c) & 16);
    }

    function fixedMouse(e, target) {
      var related, type = e.type.toLowerCase();

      if (type == 'mouseover') {
        related = e.relatedTarget || e.fromElement
      } else if (type = 'mouseout') {
        related = e.relatedTarget || e.toElement
      } else return true;

      return related && related.prefix != 'xul' && !contains(target, related) && related !== target;
    }

    var addEventFunc = (function () {
      if (document.addEventListener) {
        return function (el, type, fn) {
          if (el.length) {
            for (var i = 0; i < el.length; i++) {
              addEvent(el[i], type, fn);
            }
          } else {
            el.addEventListener(type, fn, false);
          }
        };
      } else {
        return function (el, type, fn) {
          if (el.length) {
            for (var i = 0; i < el.length; i++) {
              addEvent(el[i], type, fn);
            }
          } else {
            el.attachEvent('on' + type, function () {
              return fn.call(el, window.event);
            });
          }
        };
      }
    })();

    return {
      addEvent: addEventFunc
    };

  })
  // 获取相对位置
  .factory('getRelativePosition', function () {
    return {
      getRelativePosition: function (evt) {
        var mouseX, mouseY;
        var e = evt.originalEvent || evt,
          canvas = evt.currentTarget || evt.srcElement,
          boundingRect = canvas.getBoundingClientRect();
        if (e.touches) {
          mouseX = e.touches[0].clientX - boundingRect.left;
          mouseY = e.touches[0].clientY - boundingRect.top;

        }
        else {
          mouseX = e.clientX - boundingRect.left;
          mouseY = e.clientY - boundingRect.top;
        }
        return {
          x: mouseX,
          y: mouseY
        };
      }
    };
  })
