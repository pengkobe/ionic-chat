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
    });
    // 打包css
    gulp.task('buildchat_css', function (done) {
        return gulp.src([
                'www/module/chat/css/*.css',
                'www/module/chat/pages/**/*.css',
                'www/module/chat/directives/**/*.css',
            ])
            .pipe(concat('chat.min.css'))
            .pipe(gulp.dest('www/dist/css'))
            .on('end', done);
    });
};