module.exports = function (gulp, config, $, args) {

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

}