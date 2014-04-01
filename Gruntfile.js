module.exports = function(grunt) {
  // Project Configuration
	grunt.initConfig({
		uglify: {
			my_target: {
				options: {
      				mangle: true
    			},
				files: {
					'script/app-min.js': ['script/app.js'],
					'conf/appconf-min.js': ['conf/appconf.js'],
					'conf/yuiconf-min.js': ['conf/yuiconf.js'],
				}
			}
		},
		cssmin: {
		  build: {
		    files: {
		      'assets/styles/main-min.css': [ 'assets/styles/main.css' ],
		      'assets/styles/twitteriframe-min.css': [ 'assets/styles/twitteriframe.css' ]
		    }
		  }
		},
		copy: {
			remoteProduction: {
				src: [
						'assets/**',
						'!assets/styles/main.css',
						'!assets/styles/twitteriframe.css',
						'!assets/styles/twitter.css',
						// 'lib/**', Da peoblemas al copiarse
						'script/app-min.js',
					],
				dest: '../voicereader.github.io/',
				options: {
					process: function (content, srcpath) {
						return content.replace(/"assets\/styles\/twitteriframe.css"/g,'src="assets/styles/twitteriframe-min.css"');
					}
				}
			},

			remoteProductionEnableMinOption: {
				src: [
						'conf/*',
						'!conf/smartcomments',
						'!conf/appconf.js',
						'!conf/yuiconf.js'],
				dest: '../voicereader.github.io/',
				options: {
					process: function (content, srcpath) {
						return content.replace(/filter:"debug"/g,'filter:"min"');
					}
				}
			},

			remoteProductionHTMLLoad: {
				src: ['index.html'],
				dest: '../voicereader.github.io/',
				options: {
					
					process: function (content, srcpath) {
						content = content.replace(/href="assets\/styles\/main.css"/g,'href="assets/styles/main-min.css"');
						content = content.replace(/src="conf\/yuiconf.js"/g,'src="conf/yuiconf-min.js"');
						content = content.replace(/src="conf\/appconf.js"/g,'src="conf/appconf-min.js"');
						content = content.replace(/src="script\/app.js"/g,'src="script/app-min.js"');
						content = content.replace(/src="..\/..\/framework\/yui3\/3.11.0\/build\/yui\/yui-min.js"/g,'src="http://yui.yahooapis.com/3.11.0/build/yui/yui-min.js"');
						return content;
					}
				}
			}

		}
	});

  	// Load task-providing plugins.
  	grunt.loadNpmTasks('grunt-contrib-copy');
  	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask(
		'prod',
		'Compiles all of the assets and copies the files to the build directory.', 
		[ 'uglify','cssmin', 'copy' ]
	);
};