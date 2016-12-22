var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var sourcemaps = require('gulp-sourcemaps');

var config = require('./gulp.config')();
var $ = require('gulp-load-plugins')({ lazy: true });
var args = require('yargs').argv;
// 网模块中传参数
var taskList = require('fs').readdirSync('./tasks/');
taskList.forEach(function (file) {
    require('./tasks/' + file)(gulp, config, $, args);
});

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
 * 全局打包css至common
 */
gulp.task('buildcss', function (done) {
    gulp.src(['www/**/*.css', '!www/lib/**/*.css'])
        .pipe(concat('style.css'))
        .pipe(gulp.dest('www/dist/css'))
        .on('end', done);;
});

