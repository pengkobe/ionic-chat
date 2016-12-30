module.exports = function (gulp, config, $, args) {
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


}