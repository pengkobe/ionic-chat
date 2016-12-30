module.exports = function (gulp, config, $, args) {
    
    gulp.task('styles', [], function () {//'clean:styles'
        config.fn.log('Compiling sass file to CSS');

        return gulp.src(config.css.source) // _sass
            .pipe($.plumber()) // exit gracefully if something fails after this
            .pipe($.sass())
            .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
            .pipe($.flatten())
            .on('error', $.sass.logError)
            .pipe($.minifyCss({
                keepSpecialComments: 0
            }))
            .pipe($.rename({ extname: '.min.css' }))
            .pipe(gulp.dest(config.dist.dev + 'static/styles'))
    });


}