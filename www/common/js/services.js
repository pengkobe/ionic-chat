angular.module('chat.common.services', [])
    // 用户全局引用
    .service("currentUser", function (CacheFactory, $rootScope) {
        var userinfo = null;
        var projectinfo = null;
        // 项目切换
        $rootScope.$on("change Project", function (evt, PCode, PName) {
            userinfo.PCode = PCode;
            projectinfo.PName = PName;
        });
        var userservive = {
            getUserinfo: function () {
                if (userinfo == null) {
                    var json = { "UserID": "384", "nickname": "15602452846", "UserAccount": "py", "UserName": "彭奕", "Password": "E10ADC3949BA59ABBE56E057F20F883E", "RoleID": "7", "PRoleID": "-2", "State": "1", "Mobile": "15602452846", "IsBindPhone": null, "PhoneCode": null, "IsSystem": null, "BCode": "12", "SumPoint": null, "openid": null, "EMail": "yipeng.info@gmail.com", "headimgurl": "15602452846-201609051736.png", "Area": null, "FocusTime": null, "DeputyCreateTime": null, "ProjectCreatTime": "2016/8/24 11:38:43", "UserType": "1", "IsProject": "True", "MCode": null, "PCode": null, "IsDemo": "0", "flag": "1", "permission": "[{\"ID\":1,\"FunctionName\":\"APP\",\"ParentID\":0,\"Level\":1,\"Enable\":1},{\"ID\":11,\"FunctionName\":\"首页\",\"ParentID\":1,\"Level\":2,\"Enable\":1},{\"ID\":12,\"FunctionName\":\"告警\",\"ParentID\":1,\"Level\":2,\"Enable\":1},{\"ID\":13,\"FunctionName\":\"协同\",\"ParentID\":1,\"Level\":2,\"Enable\":1},{\"ID\":14,\"FunctionName\":\"我的\",\"ParentID\":1,\"Level\":2,\"Enable\":1},{\"ID\":21,\"FunctionName\":\"设施\",\"ParentID\":11,\"Level\":3,\"Enable\":1},{\"ID\":22,\"FunctionName\":\"能源\",\"ParentID\":11,\"Level\":3,\"Enable\":1},{\"ID\":23,\"FunctionName\":\"办公\",\"ParentID\":11,\"Level\":3,\"Enable\":0},{\"ID\":24,\"FunctionName\":\"医疗\",\"ParentID\":11,\"Level\":3,\"Enable\":0},{\"ID\":31,\"FunctionName\":\"告警\",\"ParentID\":12,\"Level\":3,\"Enable\":1},{\"ID\":32,\"FunctionName\":\"事件\",\"ParentID\":12,\"Level\":3,\"Enable\":1},{\"ID\":51,\"FunctionName\":\"任务\",\"ParentID\":14,\"Level\":3,\"Enable\":1},{\"ID\":52,\"FunctionName\":\"积分\",\"ParentID\":14,\"Level\":3,\"Enable\":1},{\"ID\":53,\"FunctionName\":\"分享\",\"ParentID\":14,\"Level\":3,\"Enable\":1},{\"ID\":54,\"FunctionName\":\"认证\",\"ParentID\":14,\"Level\":3,\"Enable\":1},{\"ID\":55,\"FunctionName\":\"设置\",\"ParentID\":14,\"Level\":3,\"Enable\":1},{\"ID\":56,\"FunctionName\":\"关于\",\"ParentID\":14,\"Level\":3,\"Enable\":1},{\"ID\":57,\"FunctionName\":\"考勤\",\"ParentID\":14,\"Level\":3,\"Enable\":0},{\"ID\":58,\"FunctionName\":\"签到\",\"ParentID\":14,\"Level\":3,\"Enable\":0},{\"ID\":521,\"FunctionName\":\"付款\",\"ParentID\":52,\"Level\":4,\"Enable\":1},{\"ID\":522,\"FunctionName\":\"积分\",\"ParentID\":52,\"Level\":4,\"Enable\":1},{\"ID\":523,\"FunctionName\":\"兑现\",\"ParentID\":52,\"Level\":4,\"Enable\":1},{\"ID\":524,\"FunctionName\":\"勘察\",\"ParentID\":52,\"Level\":4,\"Enable\":0},{\"ID\":525,\"FunctionName\":\"生产\",\"ParentID\":52,\"Level\":4,\"Enable\":0},{\"ID\":526,\"FunctionName\":\"测试\",\"ParentID\":52,\"Level\":4,\"Enable\":0},{\"ID\":527,\"FunctionName\":\"安装\",\"ParentID\":52,\"Level\":4,\"Enable\":0},{\"ID\":528,\"FunctionName\":\"验收\",\"ParentID\":52,\"Level\":4,\"Enable\":0},{\"ID\":529,\"FunctionName\":\"运营\",\"ParentID\":52,\"Level\":4,\"Enable\":0}]" };
                    userinfo = json;
                }
                return userinfo;
            },
            setUserinfo: function (val) {
                userinfo = val;
                return;
            },
            getProjectinfo: function () {
                return projectinfo;
            },
            setProjectinfo: function (val) {
                projectinfo = val[0];
                return;
            }
        }
        return userservive;
    })
    // 照相及相册
    .factory('PhotoAndImages', function ($q) { // 照片相关
        return {
            // 拍照
            getPhoto: function (opts) {
                var defer = $q.defer();
                var option1 = {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    targetHeight: 800,
                    targetWidth: 800,
                    correctOrientation: true,
                    encodingType: Camera.EncodingType.PNG
                };
                if (opts) {
                    option1 = opts;
                }
                navigator.camera.getPicture(function onSuccess(data) {
                    defer.resolve(data);
                }, function onError() {
                }, option1);
                return defer.promise;
            },
            // 相册
            getImages: function (opts) {
                var defer = $q.defer();
                var option2 = {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    targetWidth: 800,
                    targetHeight: 800,
                    encodingType: Camera.EncodingType.PNG
                };
                if (opts) {
                    option2 = opts;
                }
                navigator.camera.getPicture(function onSuccess(data) {
                    defer.resolve(data);
                }, function onError(err) {
                    alert('相册取照片出错了！！' + err);
                }, option2);
                return defer.promise;
            }
        }
    })

    // ajax请求服务
    .factory('HttpFactory', function ($http, $ionicPopup, $ionicLoading, myNote, $timeout) {

        /**
         * method – {string} – HTTP method (e.g. 'GET', 'POST', etc)
         * url – {string} – Absolute or relative URL of the resource that is being requested.
         * params – {Object.<string|Object>} – Map of strings or objects which will be turned to ?key1=value1&key2=value2 after the url. If the value is not a string, it will be JSONified.
         * data – {string|Object} – Data to be sent as the request message data.
         * headers – {Object} – Map of strings or functions which return strings representing HTTP headers to send to the server. If the return value of a function is null, the header will not be sent.
         * xsrfHeaderName – {string} – Name of HTTP header to populate with the XSRF token.
         * xsrfCookieName – {string} – Name of cookie containing the XSRF token.
         * transformRequest – {function(data, headersGetter)|Array.<function(data, headersGetter)>} – transform function or an array of such functions. The transform function takes the http request body and headers and returns its transformed (typically serialized) version. See Overriding the Default Transformations
         * transformResponse – {function(data, headersGetter)|Array.<function(data, headersGetter)>} – transform function or an array of such functions. The transform function takes the http response body and headers and returns its transformed (typically deserialized) version. See Overriding the Default Transformations
         * cache – {boolean|Cache} – If true, a default $http cache will be used to cache the GET request, otherwise if a cache instance built with $cacheFactory, this cache will be used for caching.
         * timeout – {number|Promise} – timeout in milliseconds, or promise that should abort the request when resolved.
         * withCredentials - {boolean} - whether to set the withCredentials flag on the XHR object. See requests with credentials for more information.
         * responseType - {string} - see requestType.
         */
        var count = 0;
        var send = function (config) {

            !!config.scope && (config.scope.loading = true);

            !!config.mask && $ionicLoading.show({
                template: typeof config.mask == "boolean" ? '请稍等...' : config.mask
            });

            config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

            config.method == 'post' && (config.data = config.data || {});

            ionic.extend(config, {
                timeout: 15000
            });
            var http = $http(config);
            http.catch(function (error) {
                $timeout(function () {
                    $ionicLoading.hide();
                    myNote.myNotice('请求出错,请检查网络！');
                }, 3000);
                if (error.status == 0) {
                    count++;
                    if (count > 7) {
                        count = 0;
                        myNote.myNotice('网络出现问题，请检查网络');
                    }
                }
                // else if (status == 403 ) {
                //        error.data = {
                //            template: '/(ㄒoㄒ)/~~403'
                //        }
                //    } else {
                //        error.data = {
                //            template: '错误信息都在这了：' + JSON.stringify(error.data)
                //        }
                //    }
                //    $ionicPopup.alert({
                //        title: '悲剧了...',
                //        template: error.data.template,
                //        buttons: [
                //            {
                //                text: '算了',
                //                type: 'button-balanced'
                //            }
                //        ]
                //    });
            });
            http.finally(function () {
                !!config.scope && (config.scope.loading = false);
                !!config.mask && $ionicLoading.hide();
            });
            return http;
        };
        return {
            send: send
        }
    })
    .factory('httpXhr', function (HttpFactory, baseUrl, $q) {
        return {
            getData: function (path, data) {
                var defer = $q.defer();
                HttpFactory.send({
                    url: baseUrl + path,
                    data: data,
                    method: 'post'
                }).success(function (data) {
                    defer.resolve(data);
                });
                return defer.promise;
            }
        }
    })
    // 缓存服务
    .factory('CacheFactory', function ($window) {
        var save = function (key, value) {
            if (!!value && value != null) {
                $window.localStorage.setItem(key, typeof value == 'object' ? JSON.stringify(value) : value);
            }
        };
        var get = function (key) {
            return $window.localStorage.getItem(key) || null;
        };
        var remove = function (key) {
            $window.localStorage.removeItem(key);
        };
        var removeAll = function () {
            $window.localStorage.removeItem('Login');
            $window.localStorage.removeItem('UserAccount');
            $window.localStorage.removeItem('rongyunToken');
        };
        return {
            save: save,
            get: get,
            remove: remove,
            removeAll: removeAll
        };
    })
    // 消息模态框
    .factory('myNote', function ($ionicLoading, $timeout) {
        return {
            myNotice: function (msg, timeout, prev, post) {
                $ionicLoading.show({ template: msg });
                $timeout(function () {
                    prev && prev();
                    $ionicLoading.hide();
                    post && post();
                }, timeout || 2000);
                return false;
            }
        }
    })
    /**
    * 热更新服务
    */
    .factory('HotUpdateService', ["$log", "$q"], function ($log, $q) {
        var fs = new CordovaPromiseFS({
            Promise: Promise
        });

        var loader = new CordovaAppLoader({
            fs: fs,
            serverRoot: 'http://120.24.54.92:9111',
            localRoot: 'www',
            cacheBuster: true, // make sure we're not downloading cached files.
            checkTimeout: 10000, // timeout for the "check" function - when you loose internet connection
            mode: 'mirror',
            manifest: 'manifest.json' + "?" + Date.now()
        });

        return {
            // Check for new updates on js and css files
            check: function () {
                var defer = $q.defer();
                loader.check().then(function (updateAvailable) {
                    if (updateAvailable) {
                        defer.resolve(updateAvailable);
                    }
                    else {
                        defer.reject(updateAvailable);
                    }
                });
                return defer.promise;
            },
            // Download new js/css files
            download: function (onprogress) {
                var defer = $q.defer();
                loader.download(onprogress).then(function (manifest) {
                    defer.resolve(manifest);
                }, function (error) {
                    defer.reject(error);
                });
                return defer.promise;
            },
            // Update the local files with a new version just downloaded
            update: function (reload) {
                alert('ok');
                return loader.update(reload);
            },
            // Check wether the HTML file is cached
            isFileCached: function (file) {
                if (angular.isDefined(loader.cache)) {
                    return loader.cache.isCached(file);
                }
                return false;
            },
            // returns the cached HTML file as a url for HTTP interceptor
            getCachedUrl: function (url) {
                if (angular.isDefined(loader.cache)) {
                    return loader.cache.get(url);
                }
                return url;
            }
        };
    })
    /**
    * 大版本更新
    */
    // .factory('VersionUpdateService', ["$http", "Services", '$q', '$cordovaNetwork', '$cordovaAppVersion', 
    // '$ionicPopup', '$ionicLoading', '$cordovaFileTransfer', '$cordovaFileOpener2', '$timeout',
    //     function ($http, Services, $q, $cordovaNetwork, $cordovaAppVersion, $ionicPopup, $ionicLoading,
    //      $cordovaFileTransfer, $cordovaFileOpener2, $timeout) {
    //         return {
    //             checkVersionData: checkVersionData,
    //             checkVersion: checkVersion,
    //         };

    //         function checkVersionData(data) {
    //             var deferred = $q.defer();
    //             $http({ method: 'GET', url: Services.CHECK_VERSION.url, params: data }).success(function (data) {
    //                 deferred.resolve(data.data);
    //             }).error(function (err) {
    //                 deferred.reject(err);
    //             });
    //             return deferred.promise;
    //         }

    //         function checkVersion(scope) {
    //             var deferred = $q.defer();
    //             var params = {
    //                 platform: 'android',
    //                 version: ''
    //             };
    //             var networkType = $cordovaNetwork.getNetwork();

    //             $cordovaAppVersion.getVersionNumber().then(function (version) {
    //                 params.version = version;
    //                 // 获取服务器版本信息
    //                 checkVersionData(params)
    //                     .then(function (data) {
    //                         if (data.updateFlag) {
    //                             var json = {
    //                                 title: '',
    //                                 subTitle: data.description
    //                             };
    //                             // 0.0.1 => 00001 => 1
    //                             var nowVersionNum = parseInt(version.toString().replace(new RegExp(/(\.)/g), '0'));
    //                             // 10000
    //                             var newVersionNum = parseInt(data.version.toString().replace(new RegExp(/(\.)/g), '0'));
    //                             if (newVersionNum > nowVersionNum) {

    //                                 if (data.updateFlag == 1) {  // 普通更新
    //                                     if (networkType == 'wifi') {
    //                                         json.title = 'APP版本更新'
    //                                     }
    //                                     else {
    //                                         json.title = 'APP版本更新（建议WIFI下升级）';
    //                                     }
    //                                     updateAppPopup(json, scope).then(function (res) {
    //                                         if (res == 'update') {
    //                                             UpdateForAndroid(data.url);
    //                                         }
    //                                     });
    //                                 }
    //                                 else if (data.updateFlag == 2 && networkType == 'wifi') {  // 强制更新
    //                                     UpdateForAndroid(data.url);
    //                                 }
    //                             }
    //                         }
    //                         deferred.resolve(data.updateFlag);
    //                     }, function (err) {
    //                         deferred.reject(null);
    //                     })
    //             });

    //             return deferred.promise;
    //         }

    //         function updateAppPopup(json, scope) {
    //             return $ionicPopup.show({
    //                 title: json.title,
    //                 subTitle: json.subTitle,
    //                 scope: scope,
    //                 buttons: [
    //                     {
    //                         text: '取消',
    //                         type: 'button-clear button-assertive',
    //                         onTap: function () {
    //                             return 'cancel';
    //                         }
    //                     },
    //                     {
    //                         text: '更新',
    //                         type: 'button-clear button-assertive border-left',
    //                         onTap: function (e) {
    //                             return 'update';
    //                         }
    //                     }
    //                 ]
    //             });
    //         }


    //         function UpdateForAndroid(downloadUrl) {
    //             $ionicLoading.show({
    //                 template: "已经下载：0%"
    //             });
    //             var targetPath = "/sdcard/Download/tianmicaifu.apk";
    //             var trustHosts = true;
    //             var options = {};
    //             $cordovaFileTransfer.download(downloadUrl, targetPath, options, trustHosts).then(function (result) {
    //                 $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
    //                 ).then(function () {
    //                     // 成功
    //                 }, function (err) {
    //                     console.log(err);
    //                 });
    //                 $ionicLoading.hide();
    //             }, function (err) {
    //                 $ionicLoading.show({
    //                     template: "下载失败"
    //                 });
    //                 $ionicLoading.hide();
    //             }, function (progress) {
    //                 $timeout(function () {
    //                     var downloadProgress = (progress.loaded / progress.total) * 100;
    //                     $ionicLoading.show({
    //                         template: "已经下载：" + Math.floor(downloadProgress) + "%"
    //                     });
    //                     if (downloadProgress > 99) {
    //                         $ionicLoading.hide();
    //                     }
    //                 });
    //             });
    //         }
    //     }])
    // ;