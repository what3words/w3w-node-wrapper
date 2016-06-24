module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                src: ['test/**/*.js']
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            js: ['lib/**/*.js'],
            grunt: ['Gruntfile.js']
        },
        watch: {
            options: {
                livereload: true,
            },
            js: {
                files: ['index.js', 'lib/**/*.js'],
                tasks: ['jshint', 'test']
            },
            grunt: {
                files: ['Gruntfile.js'],
                tasks: ['jshint'],
            },
            test: {
                files: ['test/**/*.js'],
                tasks: ['test']
            }
        }
    });

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('nodsstore', function() {
        grunt.file.expand({
            filter: 'isFile',
            cwd: '.'
        }, ['**/.DS_Store']).forEach(function(file) {
            grunt.file.delete(file);
        });
    });
    grunt.registerTask('test', ['mochaTest']);
};
