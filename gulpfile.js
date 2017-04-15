var gulpLiveScript = require('gulp-livescript');
var gulp = require('gulp');
var gutil = require('gulp-util');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');

gulp.task('ls', function() {
  return gulp.src('./src/*.ls')
    .pipe(gulpLiveScript({bare: true})
    .on('error', gutil.log))
    .pipe(gulp.dest('./js/'));
});

gulp.task('scripts', function() {
  return gulp.src('./js/*.js')
    .pipe(concat('main.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('./'));
});

 