'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

gulp.task('develop',  function () {

  return $.nodemon({ script: 'app.js'
    , ext: 'html js'
    , tasks: ['styles', 'inject'] })
    .on('restart', function () {
      console.log('restarted!')
    })
});
