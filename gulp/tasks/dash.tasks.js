module.exports = function (gulp, config, $, args) {

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

}