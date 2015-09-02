'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;

gulp.task('inject', ['partials', 'styles', 'home_inject', 'lang_inject', 'adminpage_inject'], function () {

  var partialsInjectFile = gulp.src(paths.tmp + '/partials/templateCacheHtml.js');
  var partialsInjectOptions = {
    starttag: '//- inject:partials',
    addRootSlash: false,
    addPrefix: '../..'
  };

  var injectStyles = gulp.src([
    paths.tmp + '/serve/{app,components}/*.css',
    '!' + paths.tmp + '/serve/app/404.css',
  ]);

  var injectScripts = gulp.src([
    paths.src + '/{app,components}/**/*.js',
    '!' + paths.src + '/application.js',
    '!' + paths.src + '/config.js'
  ]).pipe($.angularFilesort());

  var injectOptions = {
    relative: true
  };

  var wiredepOptions = {
    src: paths.tmp + '/serve/index.jade',
    directory: 'bower_components',
    ignorePath: ['/..'],
    exclude: ['/angular-dropdowns/angular-dropdowns.css', '/angular-dropdowns/dist/angular-dropdowns.css' ]
  };

  return gulp.src(paths.jade + '/index.jade')
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(wiredep(wiredepOptions))
    .pipe(gulp.dest(paths.tmp + '/serve'))
    .pipe($.jade({ pretty: true}))
    .pipe(gulp.dest(paths.tmp + '/serve'));

});

gulp.task('home_inject', function () {
  return gulp.src('app/resources/home.js')
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe(gulp.dest(paths.tmp + '/'));
});

gulp.task('adminpage_inject', function () {
  return gulp.src('app/resources/adminPage.js')
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe(gulp.dest(paths.tmp + '/'));
});

gulp.task('lang_inject', function () {
  return gulp.src(paths.src + '/languages/*.json')
    .pipe(gulp.dest(paths.dist + '/languages'))
    .pipe(gulp.dest(paths.tmp + '/languages'));
});
