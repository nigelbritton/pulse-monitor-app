/**
 * Created on 29/05/2018.
 */

'use strict';

module.exports = function (applicationConfig) {

    let express = require('express');
    let router = express.Router();
    let debug = require('debug')('pulse-monitor-app:routing-api');

    let pulse = require('pulse-monitor');

    // let pulseMonitor = require('../lib/pulse-monitor')(applicationConfig);

    router.get('/', function (req, res) {
        res.json({
            updated: new Date().getTime()
        });
    });

    router.post('/authenticate', function (req, res, next) {
        let responseJSON = {
            updated: new Date().getTime()
        };
        let requestJSON = {};

        if (req.headers['content-type'] !== 'application/json') {
            res.status(405);
        }

        requestJSON = req.body;

        pulse.authenticate(requestJSON)
            .then(function (result) {
                responseJSON.action = 'query';
                return result;
            })
            .then(function (result) {
                if (!result) {
                    res.status(403);
                } else {
                    responseJSON.token = result;
                    res.status(200);
                }

                res.json(responseJSON);
            })
            .catch(function (err) {
                res.status(500);
                responseJSON.error = err.message;
                res.json(responseJSON);
            });
    });

    router.get('/account', function (req, res, next) {
        console.log(req.headers);
        res.json({
            updated: new Date().getTime()
        });
    });

    router.post('/account', function (req, res, next) {
        let responseJSON = {
            updated: new Date().getTime()
        };
        let requestJSON = {};

        if (req.headers['content-type'] !== 'application/json') {
            res.status(405);
        }

        requestJSON = req.body;

        pulse.addAccount(requestJSON)
            .then(function (results) {
                res.status(201);
                responseJSON.action = 'query';
                responseJSON.results = results;
                res.json(responseJSON);
            })
            .catch(function (err) {
                res.status(500);
                res.json(responseJSON);
            });
    });

    router.get('/profile/:id', function (req, res, next) {
        console.log(req.headers);
        res.json({});
    });

    router.get('/profiles', function (req, res, next) {
        console.log(req.headers);
        res.json({});
    });

    return router;

};