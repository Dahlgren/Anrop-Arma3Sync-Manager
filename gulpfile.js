var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var server = require('gulp-express')

gulp.task('js', function () {
  gulp.src(['app/**/module.js', 'app/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('public/app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
    .pipe(server.notify())
})

gulp.task('default', ['watch'], function () {
    // Start the server at the beginning of the task
  server.run(['app.js'])
})

gulp.task('watch', ['js'], function () {
  gulp.watch('app/**/*.js', ['js'])
  gulp.watch(['app/**/*.html', 'public/index.html'], server.notify)
  gulp.watch(['app.js', 'api/**/*.js', 'lib/**/*.js'], [server.run])
})
