var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var sourcemaps = require('gulp-sourcemaps');

var paths = {
  sass: ['./scss/**/*.scss'],
  chat: ['./www/module/chat/**/*'],
  login: ['./www/module/login/**/*']
};

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

/**
 * 监视文件变化，自动执行
 */
gulp.task('watch', function () {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.chat, ['buildchat']);
  gulp.watch(paths.login, ['buildlogin']);
});

gulp.task('install', ['git-check'], function () {
  return bower.commands.install()
    .on('log', function (data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function (done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});


/**
 * buildchat
 */
gulp.task('buildchat', function (done) {
  // 打包js
  gulp.src([
    'www/module/chat/js/chat.directive.js',
    'www/module/chat/directives/**/*.js',
    'www/module/chat/js/chat.filter.js',
    'www/module/chat/js/chat.route.js',
    'www/module/chat/js/chat.service.js',
    'www/module/chat/js/chat.controller.js',
    'www/module/chat/pages/**/*.js',
    'www/module/chat/js/Controllers/*.js',
    'www/module/chat/js/chat.module.js',
  ])
    .pipe(sourcemaps.init())
    // .pipe(uglify())
    .pipe(concat('chat.min.js'))
    .pipe(sourcemaps.write()) //'./maps' inline
    .pipe(gulp.dest('www/dist/js'))

    ;

  // 打包css
  gulp.src([
    'www/module/chat/css/*.css',
    'www/module/chat/pages/**/*.css',
    'www/module/chat/directives/**/*.css',
  ])
    .pipe(concat('chat.min.css'))
    .pipe(gulp.dest('www/dist/css'))
    .on('end', done);;
});

/**
 * builddash
 */
gulp.task('builddash', function (done) {
  // 打包js
  gulp.src([
    'www/module/dash/js/dash.service.js',
    'www/module/dash/js/dash.controller.js',
    'www/module/dash/pages/**/*.js',
  ])
    .pipe(concat('dash.min.js'))
    .pipe(gulp.dest('www/dist/js'));

  // 打包css
  gulp.src([
    'www/module/dash/css/*.css',
    'www/module/dash/pages/**/*.css',
  ])
    .pipe(concat('dash.min.css'))
    .pipe(gulp.dest('www/dist/css'))
    .on('end', done);;
});

/**
 * buildaccount
 */
gulp.task('buildaccount', function (done) {
  // 打包js
  gulp.src([
    'www/module/account/js/account.service.js',
    'www/module/account/js/account.controller.js',
  ])
    .pipe(concat('account.min.js'))
    .pipe(gulp.dest('www/dist/js'));

  // 打包css
  gulp.src([
    'www/module/account/css/*.css',
  ])
    .pipe(concat('account.min.css'))
    .pipe(gulp.dest('www/dist/css'))
    .on('end', done);;
});

/**
 * builddevtest
 */
gulp.task('buildlogin', function (done) {
  // 打包js
  gulp.src([
    'www/module/login/js/login.js',
    'www/module/login/js/login.service.js',
    'www/module/login/js/login.route.js',
    'www/module/login/js/login.controller.js',
  ])
    .pipe(concat('login.min.js'))
    .pipe(gulp.dest('www/dist/js'));

  // 打包css
  gulp.src([
    'www/module/login/css/*.css',
  ])
    .pipe(concat('login.min.css'))
    .pipe(gulp.dest('www/dist/css'))
    .on('end', done);;
});


/**
 * builddevtest
 */
gulp.task('builddevtest', function (done) {
  // 打包js
  gulp.src([
    'www/module/devtest/devtest.service.js',
    'www/module/devtest/devtest.js',
  ])
    .pipe(concat('devtest.min.js'))
    .pipe(gulp.dest('www/dist/js'));

  // 打包css
  gulp.src([
    'www/module/devtest/*.css',
  ])
    .pipe(concat('devtest.min.css'))
    .pipe(gulp.dest('www/dist/css'))
    .on('end', done);;
});

/**
 * 全局打包css至common
 */
gulp.task('buildcss', function (done) {
  gulp.src(['www/**/*.css', '!www/lib/**/*.css'])
    .pipe(concat('style.css'))
    .pipe(gulp.dest('www/dist/css'))
    .on('end', done);;
});


// var taskList = require('fs').readdirSync('./gulp/tasks/');
// taskList.forEach(function (file) {
//   require('./tasks/' + file)(gulp, config, $, args);
// });