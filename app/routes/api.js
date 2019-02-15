/**
 * Created on 29/05/2018.
 */

'use strict';

module.exports = function ( applicationConfig ) {

    let express = require('express');
    let router = express.Router();
    let debug = require('debug')('pulse-monitor-app:routing-api');

    let pulseMonitor = require('../lib/pulse-monitor')(applicationConfig);

    router.get('/', function(req, res, next) {
        Buffer.from('username:password').toString('base64');
        res.send({
            auth: Buffer.from('username:password').toString('base64'),
            version: applicationConfig.version
        });
    });

    router.post('/login', function(req, res, next) {
        res.send({
            version: applicationConfig.version
        });
    });

    router.post('/register', function(req, res, next) {
        res.send({
            version: applicationConfig.version
        });
    });

    router.post('/addToQueue', function(req, res, next) {
        if (req.body && req.body.url) {
            pulseMonitor.addToQueue({url: req.body.url});
        }
        res.send({
            body: req.body,
            version: applicationConfig.version
        });
    });

    router.post('/reports', function(req, res, next) {
        res.send({
            version: applicationConfig.version
        });
    });

    return router;

};