var gulp 	= 	require('gulp'),
	concat	=	require('gulp-concat');

var path = {
	js: [
	'bower_components/jquery/dist/jquery.min.js',
	'bower_components/moment/min/moment.min.js',
	'bower_components/boostrap/dist/js/bootstrap.js',
	'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
	'bower_components/wiky.js/wiky.js'
	],
	css: ['bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
	'bower_components/bootstrap/dist/css/bootstrap.css',
	'bower_components/bootstrap/dist/css/bootstrap-theme.css'],
	fonts: ['bower_components/bootstrap/dist/fonts/**']
};

gulp.task('default', ['js', 'css', 'fonts']);

gulp.task('js', function(){
	return gulp.src(path.js)
		.pipe(concat('lib.js'))
		.pipe(gulp.dest('app/js'));	
})

gulp.task('css', function(){
	return gulp.src(path.css)
		.pipe(concat('lib.css'))
		.pipe(gulp.dest('app/css'));
})

gulp.task('fonts', function(){
	return gulp.src(path.fonts)
		.pipe(gulp.dest('app/fonts'));
});