/**
 * gulp 首页
 */

var gulp = require('gulp');
// 配置文件
var config = require('./gulp.config')();
// gulp-load-plugins:无须 require 直接加载模块
var $ = require('gulp-load-plugins')({lazy: true});
// 命令行参数读取插件
var args = require('yargs').argv;

// 从 tasks 文件夹中读取子任务
var taskList = require('fs').readdirSync('./www/gulp/tasks/');
taskList.forEach(function (file) {
    require('./tasks/' + file)(gulp, config, $, args);
});

// default task: 列出已安装的所有插件
gulp.task('default', $.taskListing);

