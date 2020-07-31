var gulp = require('gulp');
var concat = require('gulp-concat');
var download = require('gulp-download');
var rename = require('gulp-rename');
var JSONtoJS = require('gulp-json-to-js');

/*----------------------------------------------
 * Update cases
 ----------------------------------------------*/
gulp.task('update_cases_chi', () => {
  return download(getDataUrl('chi'))
  .pipe(rename('gov_data_chi.json'))
  .pipe(JSONtoJS())
  .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('update_cases_eng', () => {
  return download(getDataUrl('eng'))
  .pipe(rename('gov_data_eng.json'))
  .pipe(JSONtoJS())
  .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('update_cases', gulp.series(
  'update_cases_chi', 
  'update_cases_eng'
));

function getDataUrl(locale) {
  return `https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fbuilding_list_${locale}.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%7D`;
}

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

// Task chain
gulp.task('default', gulp.series(
  'update_cases',
  'lib_js', 
  'lib_css'
));
