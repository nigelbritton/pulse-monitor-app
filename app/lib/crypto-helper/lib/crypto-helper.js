/**
 *
 *
 *
 */

'use strict';

const crypto = require('crypto');

let debug = require('debug')('pulse-monitor-app');
let Crypto = {

    /**
     *
     * @param string {string}
     * @param cryptoSecret {string}
     * @returns {*|PromiseLike<ArrayBuffer>}
     */
    encryptSHA256: function ( string, cryptoSecret  ) {
        return crypto.createHmac('sha256', cryptoSecret)
            .update(string)
            .digest('hex');
    },

    /**
     *
     * @param string {string}
     * @returns {*|PromiseLike<ArrayBuffer>}
     */
    encryptMD5: function ( string ) {
        return crypto.createHash('md5')
            .update(string)
            .digest('hex');
    }

};

exports = module.exports = Crypto;