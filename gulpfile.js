'use strict'

const gulp        = require('gulp'),
      babel       = require('gulp-babel'),
    //   browserify  = require('gulp-browserify'),
	  minify      = require('gulp-minify'),
	  minifyCSS   = require('gulp-clean-css'),
      rename      = require('gulp-rename'),
      concat      = require('gulp-concat');

//////////////////////////////////
// - JS build
/////////////////////////////////
const JS_SRC  = ['src/js/video-categories.js', 'src/js/app.js'];
const JS_DEST = 'build';
gulp.task('build_js', () => {
    return gulp.src(JS_SRC)
        .pipe(concat('bundle.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(minify({
            min: '.js'
        }))
        .pipe(gulp.dest(JS_DEST));
});

gulp.task('watch_js', () => gulp.watch(CSS_SRC, ['build_js']));

//////////////////////////////////
// - CSS minify
/////////////////////////////////

const CSS_SRC  = 'src/styles/main.css';
const CSS_DEST = 'build';
gulp.task('minify_css', () => {
    return gulp.src(CSS_SRC)
        .pipe(minifyCSS())
        .pipe(rename({suffix: '-min'}))
        .pipe(gulp.dest(CSS_DEST));
});

gulp.task('watch_css', () => gulp.watch(CSS_SRC, ['minify_css']));


gulp.task('default', ['minify_css', 'watch_css', 'build_js', 'watch_js']);