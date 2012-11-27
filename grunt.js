module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-shell');

	grunt.initConfig({
		pkg:'<json:package.json>',
		meta:{
			version:'<%=pkg.version%>',
			banner:'/*! soma-interact - v<%= meta.version %> - Romuald Quantin - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* http://soundstep.github.com/soma-interact/\n' +
				'* MIT licence <%= grunt.template.today("yyyy") %> ' +
				'*/'
		},
		concat: {
			dist: {
				src: [
					'src/1.prefix.js',
					'src/2.core.js',
					'src/3.export.js',
					'src/4.suffix.js'
				],
				dest: 'build/soma-interact.js'
			}
		},
		min:{
			dest:{
				src:['<banner:meta.banner>', 'build/soma-interact.js'],
				dest:'build/soma-template-v<%= meta.version %>.min.js'
			}
		},
		watch:{
			scripts:{
				files:[
					'src/*.js',
					'grunt.js'
				],
				tasks:'concat min'
			}
		}
	});

	grunt.registerTask('default', 'concat min');
}
