var gulp = require('gulp');
var concat = require('gulp-concat');

/*----------------------------------------------
 * Libraries
 ----------------------------------------------*/

// Concat js files
gulp.task('lib_js', () => {
  return gulp.src([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/popper.js/dist/umd/popper.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js'
  ])
  .pipe(concat('lib.min.js'))
  .pipe(gulp.dest('./dist/scripts/'))
});

// Concat css files
gulp.task('lib_css', () => {
	return gulp.src([
			'./node_modules/bootstrap/dist/css/bootstrap.min.css'
		])
		.pipe(concat('lib.min.css'))
		.pipe(gulp.dest('./dist/styles/'))
});

// Get gov data
gulp.task('grab_data', () => {
  return 
});

// Task chain
gulp.task('default', gulp.series(
  'lib_js', 
  'lib_css'
));
