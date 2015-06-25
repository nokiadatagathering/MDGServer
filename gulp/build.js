'use strict';

var gulp = require('gulp');

var paths = gulp.paths;


var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', [], function () {
  return gulp.src([
    paths.src + '/{app,components}/**/*.html',
    paths.tmp + '/{app,components}/**/*.html'
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'mdg'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'));
});

gulp.task('html', ['inject'], function () {

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/index.css');
  var assets;

  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    //.pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('html2jade',['html'], function () {
  return gulp.src((paths.dist + '/index.html'))
    .pipe($.html2jade())
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('images', function () {
  return gulp.src(paths.src + '/assets/images/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/images/'));
});

gulp.task('icons', function () {
  return gulp.src(paths.src + '/assets/icons/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/icons/'));
});

gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + '/fonts/'));
});

gulp.task('misc', function () {
  return gulp.src(paths.src + '/**/*.ico')
    .pipe(gulp.dest(paths.dist + '/'));
});


gulp.task('clean', function (done) {
  $.del([paths.dist + '/', paths.tmp + '/'], done);
});

gulp.task('testing',['build'], function (done) {
  return gulp.src('specs/**/*.js')
    .pipe($.vows({reporter: 'spec'}));
});

gulp.task('build', ['html2jade', 'images', 'icons', 'fonts', 'misc']);
