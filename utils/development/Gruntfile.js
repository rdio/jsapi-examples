/*globals module */
module.exports = function(grunt) {

    // ----------
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // ----------
    var packageJson = grunt.file.readJSON("package.json"),
        distribution = "build/rdio-utils.js",
        minified = "build/rdio-utils.min.js",
        releaseRoot = "../",
        sources = [
            "src/main.js",
            "src/album-widget.js",
            "src/collection-tracker.js"
        ];

    // ----------
    // Project configuration.
    grunt.initConfig({
        pkg: packageJson,
        clean: {
            build: ["build"]
        },
        concat: {
            options: {
                banner: "//! <%= pkg.name %> <%= pkg.version %>\n"
                    + "//! Built on <%= grunt.template.today('yyyy-mm-dd') %>\n"
                    + "//! https://github.com/rdio/jsapi-examples/tree/master/utils\n"
                    + "//! Copyright 2013, Rdio, Inc.\n"
                    + "//! Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php\n"
                    + "\n"
                    + "// NOTE: This is a built file; to edit the code, see the development folder.\n\n",
                process: true
            },
            dist: {
                src:  [ "<banner>" ].concat(sources),
                dest: distribution
            }
        },
        uglify: {
            options: {
                preserveComments: "some"
            },
            build: {
                src: [ distribution ],
                dest: minified
            }
        },
        watch: {
            files: [ "Gruntfile.js", "src/*.js" ],
            tasks: "build"
        },
        jshint: {
            options: {
                laxbreak: true
            },
            beforeconcat: sources,
            afterconcat: [ distribution ]
        }
    });

    // ----------
    // Copy:build task.
    // Copies the other files into the appropriate location in the build folder.
    grunt.registerTask("copy:build", function() {
        grunt.file.copy("src/rdio-utils.css", "build/rdio-utils.css");
    });

    // ----------
    // Copy:release task.
    // Copies the contents of the build folder into the release folder.
    grunt.registerTask("copy:release", function() {
        grunt.file.recurse("build", function(abspath, rootdir, subdir, filename) {
            var dest = releaseRoot
                + (subdir ? subdir + "/" : '/')
                + filename;

            grunt.file.copy(abspath, dest);
        });
    });

    // ----------
    // Build task.
    // Cleans out the build folder and builds the code and images into it, checking lint.
    grunt.registerTask("build", [
        "clean:build", "jshint:beforeconcat", "concat", "jshint:afterconcat", "uglify", "copy:build"
    ]);

    // ----------
    // Publish task.
    // Cleans the built files out of the release folder and copies newly built ones over.
    grunt.registerTask("publish", ["build", "copy:release"]);

    // ----------
    // Default task.
    // Does a normal build.
    grunt.registerTask("default", ["build"]);
};
