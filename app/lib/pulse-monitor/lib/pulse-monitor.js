/**
 *
 *
 *
 */

'use strict';

let MongoDB = require('mongodb');
let MongoClient = require('mongodb').MongoClient;
let request = require('request');

let debug = require('debug')('pulse-monitor-app');
let Pulse = {
    Client: null,
    Database: null,
    Collection: null
};

MongoClient.connect(process.env.DATABASE_URL, { useNewUrlParser: true }, function (err, client) {
    if (err) {
        debug("Error connecting: " + err.message);
    } else {
        Pulse.Client = client;
    }
});


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
                _self.profileList[taskProfileId].responseHistory.unshift(responseObject);
                _self.profileList[taskProfileId].lastChecked = new Date().getTime();
                _self.profileList[taskProfileId].scheduledCheck = new Date().getTime() + _self.profileList[taskProfileId].intervalCheck;
                _self.profileList[taskProfileId].locked = false;
                _self.taskRunning = false;
                while (_self.profileList[taskProfileId].responseHistory > 1000) {
                    _self.profileList[taskProfileId].responseHistory.pop();
                }
                // report success

                if (Pulse.Client && !Pulse.Database) {
                    Pulse.Database = Pulse.Client.db('pulse-app');
                }
                // Pulse.Collection = Pulse.Database.collection('pulse-report');
                Pulse.Database.collection('pulse-report', { strict: false }, function(error, collection) {
                    if (error) {
                        debug(error);
                    } else {
                        let document = {
                            "_id": MongoDB.ObjectId(),
                            "profileId": MongoDB.ObjectId('5c3de1476e7a672790ba1695'),
                            "report": responseObject
                        };
                        collection.insertOne(document, {w: "majority"})
                            .then(function (result) {
                                // debug(result);
                                debug('Document added: ' + new Date().getTime());
                            }, function(err) {
                                debug("Insert failed: " + err.message);
                            });
                    }
                });

            }

        });

        return true;
    };

    /**
     *
     * @param profile {object}
     * @returns {object}
     */
    Monitor.prototype.addToQueue = function ( profile ) {
        let profileBlob = {
            id: Monitor.uuidv4(),
            name: profile.name || 'Default Website',
            type: profile.type || 'HTTP',
            url: profile.url || '',
            upTime: 0,
            upSince: 0,
            responseHistory: [],
            intervalCheck: 15 * 1000, // 60 * 1000 * 5
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

    Monitor.prototype.fetchProfile = function ( profileId ) {
        return false;
    };

    Monitor.prototype.fetchProfiles = function () {
        return false;
    };

    return Monitor;
}());

/**
 * Expose `monitorApplication()`.
 */

exports = module.exports = function ( applicationConfig ) {
    return new Pulse.Monitor(applicationConfig);
};