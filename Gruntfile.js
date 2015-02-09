Configuration = require('./app/helpers/Configuration');

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      files: ['app/**/*.js', 'web/**/*.js']
    },
    jscs: {
      main: ['app/**/*.js', 'web/**/*.js']
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "web",
          name: "../bower_components/almond/almond",
          include: [ 'main' ],
          optimize: 'none',
          out: "dist/app.js"
        }
      }
    },

    jadeUsemin: {
      vendor: {
        options: {
          tasks: {
            js: ['concat']
          }
        },
        files: [{
          src: 'app/views/index-development.jade'
        }]
      }
    },
    vows: {
      all: {
        options: {
          color: true,
          isolate: true
        },
        src: [ 'specs/**/*.tests.js' ]
      }
    },
    mongodb_fixtures: {
      dev: {
        options: {
          connection: Configuration.get('tests.mongodbUrl')
        },
        files: {
          src: ['fixtures']
        }
      }
    },
    ngtemplates: {
      app: {
        cwd: 'web',
        src: [ 'partials/**/*.html' ],
        dest: 'dist/app.js',
        options: {
          append: true,
          prefix: '/',
          htmlmin: {
            collapseBooleanAttributes:      false,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeEmptyAttributes:          false,
            removeRedundantAttributes:      false,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          },
          bootstrap: function(module, script) {
            return 'window.addTemplatesToCache = function ($templateCache) { ' + script + ' };';
          }
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      app: {
        files: {
          'dist/app.min.js': [ 'dist/app.js' ]
        }
      }
    },
    less: {
      production: {
        options: {
          cleancss: true
        },
        files: {
          "dist/resources/stylesheets/styles.css": "web/resources/stylesheets/styles.less"
        }
      }
    },
    copy: {
      dist: {
        files: [
          { expand: true, cwd: 'web/resources', src: [ '**' ], dest: 'dist/resources' },
          { expand: true, cwd: 'web/languages', src: [ '**' ], dest: 'dist/languages' },
          {
            expand: true,
            cwd: 'bower_components/jquery-ui/themes/smoothness',
            src: [ '**' ],
            dest: 'dist/resources/jquery-ui'
          }
        ]
      },
      release: {
        files: [
          {
            expand: true,
            src: [
              'app/**',
              'dist/**',
              'node_modules/**',
              'README.md',
              'configurationSchema.js',
              'app.js',
              'config.js',
              'package.json'
            ],
            dest: 'release'
          }
        ]
      }

    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-jscs-checker');
  grunt.loadNpmTasks('grunt-vows');
  grunt.loadNpmTasks('grunt-jade-usemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.loadTasks('./tasks');

  grunt.registerTask('codestyling', [ 'jshint', 'jscs' ]);
  grunt.registerTask('testing', [ 'run_server', 'load_fixture_images', 'vows' ]);
  grunt.registerTask('build', [
    'jadeUsemin:vendor',
    'requirejs:compile',
    'ngtemplates:app',
    'uglify:app',
    'less:production',
    'copy:dist'
  ]);
  grunt.registerTask('release', [
    'build',
    'copy:release'
  ]);
};
