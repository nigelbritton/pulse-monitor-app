/**
 * Created on 29/11/2018.
 */

'use strict';

let cluster = require('cluster');
let debug = require('debug')('pulse-monitor-app');
let numCPUs = require('os').cpus().length;

let applicationStatus = {
    version: require('../package.json').version,
    name: require('../package.json').name
};
let applicationStatusDelayedLaunch = -1;

if (cluster.isMaster) {
    cluster.on('fork', function (worker) {
        debug(applicationStatus.name + ' server process started [' + worker.process.pid + ']');
    });
    cluster.on('exit', function (worker) {
        debug(applicationStatus.name + ' server process killed [' + worker.process.pid + ']');
        cluster.fork();
    });

    if (applicationStatusDelayedLaunch >= 0) {

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            setTimeout(function () {
                cluster.fork();
            }, applicationStatusDelayedLaunch);
            applicationStatusDelayedLaunch += 1000;
        }

    } else {

        cluster.fork();

    }
} else {
    require('./app');
}