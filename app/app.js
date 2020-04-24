/**
 * Created on 29/05/2018.
 */

'use strict';

const dotenv = require('dotenv').config();

const bodyParser = require('body-parser'),
    compression = require('compression'),
    createError = require('http-errors'),
    debug = require('debug')('pulse-monitor-app'),
    express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    twig = require("twig");

let applicationStatus = {
    version: require('../package.json').version,
    name: require('../package.json').name,
    serverPort: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    accessKeyId: process.env.S3_KEY || '',
    secretAccessKey: process.env.S3_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    cryptoSecret: process.env.CRYPTO_SECRET || '',
    started: new Date()
};

let app = express(),
    expressApplicationLocalFunctions = require('./middleware/expressApplicationLocalFunctions'),
    routingPathsMiddleware = require('./middleware/routingPathsMiddleware'),
    apiRouterV1 = require('./routes/v1/api')(applicationStatus);

app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(bodyParser.json());
app.set('views', path.join(__dirname, '/views'));
app.set("twig options", {
    allow_async: true, // Allow asynchronous compiling
    strict_variables: false
});

app.locals = expressApplicationLocalFunctions;

app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.setHeader('X-Frame-Options', 'deny');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Cache-Control', 'public, max-age=' + 3600);
    next();
});

/**
 * Status Route
 */

app.get('/status', function (req, res) {
    res.json({ status: 200, updated: new Date().getTime() });
});

/**
 * HTML Routes
 */

app.get('/', function (req, res) {
    res.render('index.twig', {
        message: "Hello World"
    });
});

app.get('/login', function (req, res) {
    res.render('login.twig', {
        message: "Hello World"
    });
});

app.get('/register', function (req, res) {
    res.render('register.twig', {
        message: "Hello World"
    });
});

app.get('/dashboard', function (req, res) {
    res.render('dashboard.twig', {
        message: "Hello World"
    });
});

/**
 * API Routes
 */

app.use('/api/v1', apiRouterV1);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({ status: (err.status || 500), error: res.locals.error, updated: new Date().getTime() });
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