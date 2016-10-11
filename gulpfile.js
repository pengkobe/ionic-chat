var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
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
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
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
  gulp.src([
    'www/module/chat/js/chat.directive.js', 
    'www/module/chat/js/chat.filter.js', 
    'www/module/chat/js/chat.route.js', 
    'www/module/chat/js/chat.service.js', 
    'www/module/chat/js/chat.controller.js', 
    'www/module/chat/business/**/*.js', 
    'www/module/chat/js/Controllers/*.js', 
    'www/module/chat/js/chat.module.js', 
  ])
    // .pipe(uglify())
    .pipe(concat('chat.min.js'))
    .pipe(gulp.dest('www/dist/js'));
});


/**
 * 全局打包css至common
 */
gulp.task('buildcss', function (done) {
  gulp.src(['www/**/*.css', '!www/lib/**/*.css'])
    .pipe(concat('style.css'))
    .pipe(gulp.dest('www/dist/css'));
});