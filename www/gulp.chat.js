function GulpChat(done) {
  gulp.src([
    'www/module/chat/js/chat.directive.js', 
    'www/module/chat/js/chat.filter.js', 
    'www/module/chat/js/chat.route.js', 
    'www/module/chat/js/chat.service.js', 
    'www/module/chat/business/**/*.js', 
    'www/module/chat/js/Controllers/*.js', 
    'www/module/chat/js/chat.module.js', 
  ])
    // .pipe(uglify())
    .pipe(concat('chat.min.js'))
    .pipe(gulp.dest('www/dist/js'));
}

module.exports = GulpChat;