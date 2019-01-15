module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'public/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'public/css',
                    ext: '.min.css'
                }]
            }
        },
        sass: {
            dist: {
                files: {
                    'public/css/main.css': [
                        'public/sass/main.scss'
                    ]
                }
            }
        },
        uglify: {
            options: {
                beautify: false,
                sourceMap: false,
                mangle: false
            },
            js: {
                src:['public/javascripts/lib/modernizr.js', 'public/javascripts/script.js'],
                dest:'public/javascripts/script.min.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['sass', 'cssmin', 'uglify']);
    grunt.registerTask('buildCSS', ['sass', 'cssmin']);
};