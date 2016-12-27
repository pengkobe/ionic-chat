module.exports = function (gulp, config, $, args) {

    // gulp.task('sass', function (done) {
    //     gulp.src('./scss/ionic.app.scss')
    //         .pipe($.sass())
    //         .on('error', sass.logError)
    //         .pipe(gulp.dest('./www/css/'))
    //         .pipe($.minifyCss({
    //             keepSpecialComments: 0
    //         }))
    //         .pipe($.rename({ extname: '.min.css' }))
    //         .pipe(gulp.dest('./www/css/'))
    //         .on('end', done);
    // });

    /**
     * 全局打包css至common
     */
    // sassgulp.task('buildcss', function (done) {
    //     gulp.src(['www/**/*.css', '!www/lib/**/*.css'])
    //         .pipe($.concat('style.css'))
    //         .pipe(gulp.dest('www/dist/css'))
    //         .on('end', done);;
    // });



    gulp.task('styles', ['clean:styles'], function () {
        config.fn.log('Compiling sass file to CSS');

        return gulp.src(config.css.source_sass)
            .pipe($.plumber()) // exit gracefully if something fails after this
            .pipe($.sass())
            .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
            .pipe($.flatten())
            .on('error', $.sass.logError)
            .pipe($.minifyCss({
                keepSpecialComments: 0
            }))
            .pipe($.rename({ extname: '.min.css' }))
            .pipe(gulp.dest(config.build.dev + 'static/styles'))
    });


}