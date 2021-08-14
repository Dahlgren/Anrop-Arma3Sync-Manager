const gulp = require('gulp')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const ngAnnotate = require('gulp-ng-annotate')
const liveServer = require('gulp-live-server')

const server = liveServer('app.js')

gulp.task('js', () => {
  return gulp.src(['app/**/module.js', 'app/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('public/app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
    .on('end', () => {
      server.notify({ path: 'public/app.js' })
    })
})

gulp.task('watch:frontend:js', () => {
  return gulp.watch('app/**/*.js', gulp.series('js'))
})

gulp.task('watch:frontend:static', () => {
  return gulp.watch('public/**/*')
    .on('change', (path) => {
      server.notify({ path: path })
    })
})

gulp.task('watch:server', () => {
  return gulp.watch(['app.js', 'api/**/*.js', 'lib/**/*.js'])
    .on('change', () => {
      server.start.bind(server)()
    })
})

gulp.task('watch:frontend', gulp.parallel('watch:frontend:js', 'watch:frontend:static'))

gulp.task('watch', gulp.parallel('watch:frontend', 'watch:server'))

gulp.task('server', () => {
  // Start the server at the beginning of the task
  return server.start()
})

gulp.task('default', gulp.parallel('js', 'watch', 'server'))
