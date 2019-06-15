var gulp = require('gulp')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var ngAnnotate = require('gulp-ng-annotate')
var liveServer = require('gulp-live-server')

var server = liveServer('app.js')

gulp.task('js', function () {
  return gulp.src(['app/**/module.js', 'app/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('public/app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
    .on('end', function () {
      server.notify({ path: 'public/app.js' })
    })
})

gulp.task('watch:frontend:js', function () {
  return gulp.watch('app/**/*.js', gulp.series('js'))
})

gulp.task('watch:frontend:static', function () {
  return gulp.watch('public/**/*')
    .on('change', function (path) {
      server.notify({ path: path })
    })
})

gulp.task('watch:server', function () {
  return gulp.watch(['app.js', 'api/**/*.js', 'lib/**/*.js'])
    .on('change', function () {
      server.start.bind(server)()
    })
})

gulp.task('watch:frontend', gulp.parallel('watch:frontend:js', 'watch:frontend:static'))

gulp.task('watch', gulp.parallel('watch:frontend', 'watch:server'))

gulp.task('server', function () {
  // Start the server at the beginning of the task
  return server.start()
})

gulp.task('default', gulp.parallel('js', 'watch', 'server'))
