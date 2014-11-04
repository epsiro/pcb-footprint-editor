module.exports = function (grunt) {

// Combine all files in src/
grunt.initConfig({
  uglify: {
    files : {
      options : {
        sourceMap : 'pcb-footprint-editor.min.js.map',
      },
      src : 'js/*.js',
      dest : 'pcb-footprint-editor.min.js'
    }
  },
    watch: {
        js:  { files: 'js/*.js', tasks: [ 'uglify' ] },
    }
});


// load plugins
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-uglify');

// register at least this one task
grunt.registerTask('default', [ 'uglify' ]);


};
