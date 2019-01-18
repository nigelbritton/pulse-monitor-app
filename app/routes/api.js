/**
 * Created on 29/05/2018.
 */

'use strict';

module.exports = function ( applicationConfig ) {

    let express = require('express');
    let router = express.Router();
    let debug = require('debug')('pulse-monitor-app:routing-api');

    let pulseMonitor = require('../lib/pulse-monitor');

    router.get('/', function(req, res, next) {
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

    return router;

};