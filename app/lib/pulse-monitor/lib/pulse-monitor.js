/**
 *
 *
 *
 */

'use strict';

let request = require('request');

let debug = require('debug')('pulse-monitor-app');
let Pulse = {};

Pulse.Monitor = (function () {
    function Monitor(config) {
        let _self = this;
        this.debug = false;
        this.profileQueue = [];
        this.profileList = {};
        this.taskRunning = false;
        setInterval(function () {
            _self.processQueue();
        }, 1000);
    }

    Monitor.prototype.error = function (log) {
        if (this.debug === true) { return; }
        console.error(log);
    };

    Monitor.prototype.warn = function (log) {
        if (this.debug === true) { return; }
        console.warn(log);
    };

    Monitor.prototype.log = function (log) {
        if (this.debug === true) { return; }
        console.log(log);
    };

    Monitor.uuidv4 = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
    };

    Monitor.prototype.buildProcessQueue = function () {
        let profileKeys = Object.keys(this.profileList),
            processTime = new Date().getTime();

        for (let i = 0; i < profileKeys.length; i++) {

            let taskProfileId = profileKeys[i];

            if (this.profileList[taskProfileId].locked === false &&
                this.profileList[taskProfileId].scheduledCheck <= processTime) {

                this.profileList[taskProfileId].locked = true;
                this.profileQueue.push(taskProfileId);

            }

        }
    };

    Monitor.prototype.processQueue = function () {
        let _self = this;

        this.buildProcessQueue();

        // this.log('Queue size: ' + this.profileQueue.length);
        // https://www.npmjs.com/package/request#oauth-signing

        if (this.profileQueue.length === 0) { return false; }
        if (this.taskRunning === true) { return false; }
        this.taskRunning = true;

        let taskProfileId = this.profileQueue.shift();
        let taskProfile = this.profileList[taskProfileId];

        let fetchProfile = {
            method: 'get',
            url: taskProfile.url,
            time: true,
            timeout: 5000
        };

        // change to npm request
        request(fetchProfile, function (error, response, body) {

            if (error) {

                // _self.log(error);
                _self.profileList[taskProfileId].lastChecked = new Date().getTime();
                _self.profileList[taskProfileId].scheduledCheck = new Date().getTime() + _self.profileList[taskProfileId].intervalCheck;
                _self.profileList[taskProfileId].locked = false;
                _self.taskRunning = false;
                // report error

            } else {

                let responseObject = {
                    headers: response.headers,
                    contentType: response.headers['content-type'],
                    statusCode: response.statusCode,
                    timingPhases: response.timingPhases
                };
                debug('Task Profile: ' + taskProfileId);
                debug(responseObject);
                _self.profileList[taskProfileId].lastChecked = new Date().getTime();
                _self.profileList[taskProfileId].scheduledCheck = new Date().getTime() + _self.profileList[taskProfileId].intervalCheck;
                _self.profileList[taskProfileId].locked = false;
                _self.taskRunning = false;
                // report success

            }

        });

        return true;
    };

    Monitor.prototype.addToQueue = function ( profile ) {
        let profileBlob = {
            id: Monitor.uuidv4(),
            name: profile.name || 'Default Website',
            type: profile.type || 'HTTP',
            url: profile.url || '',
            upTime: 0,
            upSince: 0,
            responseHistory: [],
            intervalCheck: 60 * 1000 * 5,
            intervalDelta: 0,
            created: new Date().getTime(),
            updated: new Date().getTime(),
            lastChecked: 0,
            scheduledCheck: 0,
            paused: false,
            locked: false
        };

        if (!this.profileList[profileBlob.id]) {
            this.profileList[profileBlob.id] = profileBlob;
            return profileBlob;
        }

        return false;
    };

    return Monitor;
}());

/**
 * Expose `monitorApplication()`.
 */

exports = module.exports = new Pulse.Monitor();