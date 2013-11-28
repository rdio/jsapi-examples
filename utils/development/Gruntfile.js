/*globals module */
module.exports = function(grunt) {

  // ----------
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks("grunt-contrib-connect");

  // ----------
  var packageJson = grunt.file.readJSON('package.json'),
    distribution = 'build/rdio-utils.js',
    minified = 'build/rdio-utils.min.js',
    releaseRoot = '../',
    sources = [
      'src/main.js',
      'src/album-widget.js',
      'src/collection-tracker.js',
      'src/local-queue.js'
    ];

  // ----------
  // Project configuration.
  grunt.initConfig({
    pkg: packageJson,
    clean: {
      build: ['build']
    },
    concat: {
      options: {
        banner: '//! <%= pkg.name %> <%= pkg.version %>\n'
          + '//! Built on <%= grunt.template.today("yyyy-mm-dd") %>\n'
          + '//! https://github.com/rdio/jsapi-examples/tree/master/utils\n'
          + '//! Copyright 2013, Rdio, Inc.\n'
          + '//! Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php\n'
          + '\n'
          + '// NOTE: This is a built file; to edit the code, see the development folder.\n\n',
        process: true
      },
      dist: {
        src:  [ '<banner>' ].concat(sources),
        dest: distribution
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      build: {
        src: [ distribution ],
        dest: minified
      }
    },
    less: {
      build: {
        src: [ 'src/main.less' ],
        dest: 'build/rdio-utils.css'
      }
    },
    watch: {
      files: [ 'Gruntfile.js', 'src/*.js', 'src/*.less' ],
      tasks: 'build'
    },
    jshint: {
      options: {
        laxbreak: true
      },
      beforeconcat: sources,
      afterconcat: [ distribution ]
    },
    connect: {
      test: {
        options: {
          port: 8889,
          base: '.'
        }
      }
    },
    jasmine: {
      main: {
        src: [ 'build/rdio-utils.min.js' ],
        options: {
          // keepRunner: true,
          outfile: 'test/runner.html',
          host : 'http://localhost:8889/',
          vendor: [ 
            'test/lib/jquery-1.9.1.min.js',
            'https://www.rdio.com/api/api.js?client_id=Zg9xdHqnouVe9LxHdyAdBg' 
          ],
          specs: [ 
            'test/spec/general.js', 
            'test/spec/album-widget.js', 
            'test/spec/local-queue.js',
            'test/spec/finish.js'
          ]
        }
      }
    }
  });

  // ----------
  // Copy:build task.
  // Copies the other files into the appropriate location in the build folder.
  grunt.registerTask('copy:build', function() {
    grunt.file.recurse('src/images', function(abspath, rootdir, subdir, filename) {
      grunt.file.copy(abspath, 'build/rdio-utils-images/' + (subdir || '') + filename);
    });
  });

  // ----------
  // Copy:release task.
  // Copies the contents of the build folder into the release folder.
  grunt.registerTask('copy:release', function() {
    grunt.file.recurse('build', function(abspath, rootdir, subdir, filename) {
      var dest = releaseRoot
        + (subdir ? subdir + '/' : '/')
        + filename;

      grunt.file.copy(abspath, dest);
    });
  });

  // ----------
  // Build task.
  // Cleans out the build folder and builds the code and images into it, checking lint.
  grunt.registerTask('build', [
    'clean:build', 'jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify', 'less', 'copy:build'
  ]);

  // ----------
  // Test task.
  // Builds and then tests.
  grunt.registerTask('test', [
    'build', 'connect:test', 'jasmine'
  ]);

  // ----------
  // Publish task.
  // Cleans the built files out of the release folder and copies newly built ones over.
  grunt.registerTask('publish', ['build', 'copy:release']);

  // ----------
  // Default task.
  // Does a normal build.
  grunt.registerTask('default', ['build']);
};
