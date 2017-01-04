module.exports = function (gulp, config, $, args) {
    // config -- gulp.config.js
    // $ -- gulp-load-plugins
    // args --- yargs
    gulp.task('buildchat_js', function () {
        // if (args.debug) {
        //     console.log('debug');
        // }
        // console.log('js task');
        // 打包js
        gulp.src([
                'www/dist/dev/static/tab_chat/js/chat.directive.js',
                'www/dist/dev/static/tab_chat/directives/**/*.js',
                'www/dist/dev/static/tab_chat/js/chat.filter.js',
                'www/dist/dev/static/tab_chat/js/chat.route.js',
                'www/dist/dev/static/tab_chat/js/chat.service.js',
                'www/dist/dev/static/tab_chat/js/chat.controller.js',
                'www/dist/dev/static/tab_chat/pages/**/*.js',
                'www/dist/dev/static/tab_chat/js/Controllers/*.js',
                'www/dist/dev/static/tab_chat/js/chat.module.js',
            ])
            .pipe(sourcemaps.init())
            // .pipe(uglify())
            .pipe(concat('chat.min.js'))
            .pipe(sourcemaps.write()) //'./maps' inline
            .pipe(gulp.dest('www/dist/js'))

            ;
    });
    // 打包css
    gulp.task('buildchat_css', function (done) {
        return gulp.src([
                'www/dist/dev/static/tab_chat/css/*.css',
                'www/dist/dev/static/tab_chat/pages/**/*.css',
                'www/dist/dev/static/tab_chat/directives/**/*.css',
            ])
            .pipe(concat('chat.min.css'))
            .pipe(gulp.dest('www/dist/css'))
            .on('end', done);
    });
};