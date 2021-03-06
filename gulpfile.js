var gulp = require('gulp');
var download = require('gulp-download');
var rename = require('gulp-rename');
var JSONtoJS = require('gulp-json-to-js');
var htmlreplace = require('gulp-html-replace');
var moment = require('moment');

function getDataUrl(locale) {
  return `https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fbuilding_list_${locale}.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%7D`;
}

gulp.task('update_cases_chi', () => {
  return download(getDataUrl('chi'))
  .pipe(rename('gov_data_chi.json'))
  .pipe(JSONtoJS())
  .pipe(gulp.dest('./'));
});

gulp.task('update_cases_eng', () => {
  return download(getDataUrl('eng'))
  .pipe(rename('gov_data_eng.json'))
  .pipe(JSONtoJS())
  .pipe(gulp.dest('./'));
});

gulp.task('update_html', function() {
  return gulp.src('index.html')
  .pipe(htmlreplace({ last_update: `<!-- build:last_update -->${moment().format('YYYY-MM-DD')}<!-- endbuild -->` }))
  .pipe(gulp.dest('./'));
});

gulp.task('update_cases', gulp.series(
  'update_cases_chi', 
  'update_cases_eng',
  'update_html'
));

// Task chain
gulp.task('default', gulp.series(
  'update_cases'
));
