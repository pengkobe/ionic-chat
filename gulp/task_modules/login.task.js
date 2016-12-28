module.exports = function (gulp, config, $, args) {
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

}