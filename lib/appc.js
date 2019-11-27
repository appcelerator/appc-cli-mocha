/**
 * appc-cli-mocha (appc mocker)
 */

var async = require('async'),
	request = require('request'),
	mocker = require('./mocker'),
	_ = require('lodash'),
	chalk = require('chalk');

/** @type {Object} */
var config = {};

module.exports = {
	spinner: {
		/** [start description] */
		start: function () {},
		/** [stop description] */
		stop: function () {}
	},
	log: {
		info: captureLogs('info'),
		trace: captureLogs('trace'),
		debug: captureLogs('debug'),
		error: captureLogs('error'),
		warn: captureLogs('warn')
	},
	commands: {
		config: {
			/** [get description] */
			get: function (key) {
				return config[key];
			},
			/** [set description] */
			set: function (key, value) {
				config[key] = value;
			}
		}
	},
	async: async,
	request: request,
	chalk: chalk,
	lodash: _,
	constants: {
		APPC_SECURITY_SERVER: 'http://' + mocker.hostname + ':' + mocker.port,
		/** [getDeveloperPrivateKeyFile description] */
		getDeveloperPrivateKeyFile: function getDeveloperPrivateKeyFile() {
			return '';
		}
	}
};

module.exports.log.error.wrap = wrapLogs('error');

var logs = {};

/** [captureLogs description] */
function captureLogs(type) {
	return function () {
		if (typeof logs[type] === 'undefined') {
			logs[type] = [];
		}
		var log = Array.prototype.slice.call(arguments);
		for (var i = 0, l = log.length; i < l; ++i) {
			if (typeof log[i] === 'object') {
				log[i] = JSON.stringify(log[i]);
			}
		}
		console.log(log.join(' '));
		logs[type].push(log.join(' '));
	};
}

/** [wrapLogs description] */
function wrapLogs(type) {
	return function () {
		var args = Array.prototype.slice.call(arguments);
		captureLogs(type).apply(this, [ args.join(' ').toString() ]);
	};
}

/** [flush description] */
module.exports.log.flush = function flushLogs() {
	logs = {};
};

/** [get description] */
module.exports.log.get = function getLog(type) {
	return type ? logs[type] && logs[type].join('\n') : logs;
};
