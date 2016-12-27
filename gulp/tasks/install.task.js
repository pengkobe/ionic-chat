module.exports = function (gulp, config, $, args) {

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            $.util.log('bower', $.util.colors.cyan(data.id), data.message);
        });
});

}
