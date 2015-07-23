'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
// var esperanto = require('esperanto');
// var map = require('vinyl-map');
var jetpack = require('fs-jetpack');

var utils = require('./utils');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

var paths = {
    // jsCodeToTranspile: [
    //     'app/**/*.js',
    //     '!app/main.js',
    //     '!app/spec.js',
    //     '!app/node_modules/**',
    //     '!app/bower_components/**',
    //     '!app/vendor/**'
    // ],
    toCopy: [
        'app/main.js',
        'app/spec.js',
        'app/node_modules/**',
        'app/bower_components/**',
        'app/vendor/**',
        'app/**/*.html',
        'app/scripts/*'
    ],
};

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function(callback) {
    return destDir.dirAsync('.', { empty: true });
});


var copyTask = function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true,
        matching: paths.toCopy
    });
};
gulp.task('copy', ['clean'], copyTask);
gulp.task('copy-watch', copyTask);


/*var transpileTask = function () {
    return gulp.src(paths.jsCodeToTranspile)
    .pipe(map(function(code, filename) {
        try {
            var transpiled = esperanto.toAmd(code.toString(), { strict: true });
        } catch (err) {
            throw new Error(err.message + ' ' + filename);
        }
        return transpiled.code;
    }))
    .pipe(gulp.dest(destDir.path()));
};
gulp.task('transpile', ['clean'], transpileTask);
gulp.task('transpile-watch', transpileTask);*/


var sassTask = function () {
    return gulp.src('app/stylesheets/main.scss')
    .pipe(sass())
    .pipe(gulp.dest(destDir.path('stylesheets')));
};
gulp.task('sass', ['clean'], sassTask);
gulp.task('sass-watch', sassTask);


gulp.task('finalize', ['clean'], function () {
    var manifest = srcDir.read('package.json', 'json');
    switch (utils.getEnvName()) {
        case 'development':
            // Add "dev" suffix to name, so Electron will write all
            // data like cookies and localStorage into separate place.
            manifest.name += '-dev';
            manifest.productName += ' Dev';
            break;
        case 'test':
            // Add "test" suffix to name, so Electron will write all
            // data like cookies and localStorage into separate place.
            manifest.name += '-test';
            manifest.productName += ' Test';
            // Change the main entry to spec runner.
            manifest.main = 'spec.js';
            break;
    }
    destDir.write('package.json', manifest);

    var configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json');
    destDir.copy(configFilePath, 'env_config.json');
});


gulp.task('watch', function () {
    // gulp.watch(paths.jsCodeToTranspile, ['transpile-watch']);
    gulp.watch(paths.toCopy, ['copy-watch']);
    gulp.watch('app/**/*.scss', ['sass-watch']);
});


gulp.task('build', [/*'transpile', */'sass', 'copy', 'finalize']);
