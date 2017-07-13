var gulp 	= 	require('gulp'),
	concat	=	require('gulp-concat'),
	inject	=	require('gulp-inject');

var path = {
	js: [
	'node_modules/jquery/dist/jquery.min.js',
	'node_modules/moment/min/moment.min.js',
	'node_modules/boostrap/dist/js/bootstrap.js',
	'node_modules/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
	'node_modules/wiky.js/wiky.js',
		'node_modules/angular-debounce/dist/angular-debounce.js'
	],
	css: ['node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
	'node_modules/bootstrap/dist/css/bootstrap.css',
	'node_modules/bootstrap/dist/css/bootstrap-theme.css'],
	fonts: ['node_modules/bootstrap/dist/fonts/**']
};

gulp.task('default', ['js', 'css', 'fonts', 'index']);

gulp.task('index', function(){
	var target = gulp.src('./src/index.html');

	var sources = gulp.src(['./app/src/**/*.js', './app/src/**/*.css'], {read: false});
	return target.pipe(inject(sources, {ignorePath: "app"}))
	.pipe(gulp.dest('./app/'));
});

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