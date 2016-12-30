module.exports = function (gulp, config, $, args) {
    /**
     * 监视文件变化，自动执行
     */
    gulp.task('watch', function () {
        var isDev = true;
        // only watch files for development environment
        var watchedFiles = [].concat(
            config.js.app.source,
            config.css.singleSource,
            config.html.source
        );
        if (isDev) {
            gulp.watch(watchedFiles, ['build:dev'])
                .on('change', changeEvent);
        }
    });

    function changeEvent(event) {
        var srcPattern = new RegExp('/.*(?=/' + config.client.source + ')/');
        config.fn.log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
    }
}


