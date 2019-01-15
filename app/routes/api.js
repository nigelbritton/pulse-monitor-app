/**
 * Created on 29/05/2018.
 */

'use strict';

module.exports = function ( applicationConfig ) {

    let express = require('express');
    let router = express.Router();
    let debug = require('debug')('pulse-monitor-app:routing-api');

    router.get('/', function(req, res, next) {
        res.send({
            version: applicationConfig.version
        });
    });

    return router;

};