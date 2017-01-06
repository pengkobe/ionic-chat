# GULP重构参考
- 重构参考pinkyjie的[重构你的gulpfile](http://pinkyjie.com/2015/03/24/refactor-your-gulpfile)
- http://pinkyjie.com/2015/08/12/commonly-used-gulp-plugins-part-1/
- http://pinkyjie.com/2015/08/12/commonly-used-gulp-plugins-part-2/  

完整项目案例参考：https://github.com/PinkyJie/generator-aio-angular  


## 引入新插件
* browser-sync ( 无用,使用ionic-cli即可 ): 能让浏览器实时、快速响应您的文件更改（html、js、css、sass、less等）并自动刷新页面，  
                 Browsersync可以同时在PC、平板、手机等设备下进项调试。[文档](http://www.browsersync.cn/docs)  
* gulp-load-plugins ：加载插件，可以按需加载
* yargs : 用来接收命令行参数 
* gulp-task-listing ：方便列出加载的插件
* run-sequence ：*4.0发布之前的临时解决方案*，Runs a sequence of gulp tasks in the specified order. [github地址](https://github.com/OverZealous/run-sequence)
* gulp-inject ： takes a stream of source files, transforms each file to a string and injects each transformed string 
                 into placeholders in the target stream files,github地址：[gulp-inject](https://github.com/klei/gulp-inject)
* gulp-if ： 顾名思义即可，[gulp-if](https://github.com/robrich/gulp-if)
* wiredep ： bower解决了前端库依赖管理的痛点,而wiredep解决了bower前端库引入进html的问题
* merge-stream ：  顾名思义即可，[merge-stream](https://github.com/grncdr/merge-stream)
* gulp-plumber ： Prevent pipe breaking caused by errors from gulp plugins(exit gracefully if something fails after this)
* gulp-flatten ： remove or replace relative path for files
* gulp-useref ： 可以把html里零碎的引入合并成一个文件，不负责代码压缩。[gulp-useref](https://www.npmjs.com/package/gulp-useref)
* gulp-fliter : [gulp-filter](https://www.npmjs.com/package/gulp-filter)
* gulp-csso : [gulp-csso](https://www.npmjs.com/package/gulp-csso)
* gulp-uglify : 压缩
* gulp-header : 头标注
* gulp-rev : Static asset revisioning by appending content hash to filenames: unicorn.css → unicorn-d41d8cd98f.css
* gulp-rev-replace : Rewrite occurences of filenames which have been renamed by gulp-rev
* gulp-watch : gulp.watch 无法检测文件的新增与删除，解决方法是使用 gulp-watch，[链接](http://stackoverflow.com/questions/22391527/gulps-gulp-watch-not-triggered-for-new-or-deleted-files)

* gulp-angular-templatecache : 把html模板转换为angularjs模板 
* gulp-ng-annotate : 解决依赖注入的小问题( source-map支持否？ )
* gulp-order : 解决angular依赖顺序问题  [gulp-order](https://github.com/sirlantis/gulp-order)  

* gulp-bytediff : Compare file sizes before and after your gulp build process.
* gulp-minify-html : Minify html with minimize.
                     This package has been deprecated in favor of gulp-htmlmin, which should be faster and more comprehensive.
* gulp-imagemin : Minify PNG, JPEG, GIF and SVG images


## 报错
1. Error: No selenium server jar found at the specified location,
   解决方案: http://floatincode.net/post/running-protractor-selenium-tests-with-grunt    
   ```bash
   node node_modules/protractor/bin/webdriver-manager update
   ```
2. asmine.getEnv().currentSpec returns undefined  
   解决方案:https://github.com/jasmine/jasmine/issues/1212
   