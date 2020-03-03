const gulp = require('gulp');
const ts = require('gulp-typescript');
const replace = require('gulp-replace');
const del = require('del');
const version = require('../package.json').version;
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');

const webpack = require('webpack');
const webpackConfig = require('./../webpack.config.js');

gulp.task('build:clean', function() {
  return del(['build/**/*']);
});

gulp.task('typescript:main', () => {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(replace('@{VERSION}', version))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/main'));
});

gulp.task('typescript:modules', () => {
  const tsProject = ts.createProject('tsconfig.module.json');
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(replace('@{VERSION}', version))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/module'));
});

gulp.task('webpack:dev', () => {
  return new Promise((resolve, reject) => {
    let conf = Object.assign({}, webpackConfig[2]);

    conf.mode = 'development';
    conf.output.path = path.resolve(path.join(__dirname, './../build/browser-dev')),

    webpack(conf, (err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(new Error(stats.compilation.errors.join('\n')));
      }
      resolve();

    });
  });
});

gulp.task('build:typescript', gulp.series(['build:clean', 'typescript:main', 'typescript:modules']));

gulp.task('build', gulp.series(['build:typescript']));

gulp.task('build:watch', () => {
  return gulp.watch('src/**/*.ts', {
    delay: 400,
    ignoreInitial: false,
  }, gulp.series(['build:clean', 'typescript:modules', 'webpack:dev']));
});
