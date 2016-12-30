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

* gulp-angular-templatecache : 把html模板转换为angularjs模板 
* gulp-ng-annotate : 解决依赖注入的小问题( source-map支持否？ )
* gulp-order : 解决angular依赖顺序问题  [gulp-order](https://github.com/sirlantis/gulp-order)
