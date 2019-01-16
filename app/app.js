/**
 * Created on 29/05/2018.
 */

'use strict';

let express = require('express'),
    debug = require('debug')('pulse-monitor-app'),
    path = require('path'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    createError = require('http-errors'),
    logger = require('morgan');

let applicationStatus = {
    version: require('../package.json').version,
    name: require('../package.json').name,
    serverPort: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    started: new Date()
};

let app = express(),
    pulseMonitor = require('./lib/pulse-monitor'),
    expressApplicationLocalFunctions = require('./middleware/expressApplicationLocalFunctions'),
    routingPathsMiddleware = require('./middleware/routingPathsMiddleware'),
    apiRouter = require('./routes/api')(applicationStatus);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

// pulseMonitor.

app.locals = expressApplicationLocalFunctions;

app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.setHeader('X-Frame-Options' , 'deny' );
    res.setHeader('X-Content-Type-Options' , 'nosniff' );
    res.setHeader('X-Permitted-Cross-Domain-Policies' , 'none' );
    res.setHeader('X-XSS-Protection' , '1; mode=block' );
    res.setHeader('Cache-Control', 'public, max-age=' + 3600);
    next();
});

app.get('/', function(req, res) {
    res.json( { status: 200, updated: new Date().getTime() } );
});

app.get('/status', function(req, res) {
    res.json( { status: 200, updated: new Date().getTime() } );
});

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json( { status: 200, error: res.locals.error, updated: new Date().getTime() } );
});

app.listen(applicationStatus.serverPort, function () {
    debug('');
    debug('############################################################');
    debug('##                    pulse-monitor-app                   ##');
    debug('############################################################');
    debug('');
    debug('Version: ' + applicationStatus.version);
    debug('Started: ' + applicationStatus.started);
    debug('Running environment: ' + applicationStatus.environment);
    debug('Listening on port: ' + applicationStatus.serverPort);
    debug('');
    debug('Application ready and listening... ');
    debug('');
});