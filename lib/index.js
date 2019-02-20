/**
 * appc-cli-mocha (core)
 */
var _ = require('lodash'),
	path = require('path'),
	fs = require('fs'),
	os = require('os'),
	AppC = require('appc-platform-sdk'),
	appc = require('./appc'),
	mocker = require('./mocker');

var defaultConditions = {
	/** [mac description] */
	mac: function (func) {
		if (/^darwin/.test(process.platform)) {
			return func;
		}

		return func.skip;
	},
	/** [linux description] */
	linux: function (func) {
		if (/^linux/.test(process.platform)) {
			return func;
		}

		return func.skip;
	},
	/** [win description] */
	win: function (func) {
		if (/^win/.test(process.platform)) {
			return func;
		}

		return func.skip;
	}
};

/** @type {path} path to test directory */
module.exports.testDir = path.dirname(module.parent.filename);

/**
 * Loads mocha conditions
 * @param {Array} __conditions optional
 */
module.exports.loadMochaConditions = function loadMochaConditions(__conditions) {
	var conditions = __conditions && _.extend(__conditions, defaultConditions) || defaultConditions,
		conditionsKeys = Object.keys(conditions),
		toAddFunctions = [ describe, it, before, after, beforeEach, afterEach ];

	// itterate through the functions
	toAddFunctions.forEach(function (func) {
		// itterate though the conditions
		conditionsKeys.forEach(function (key) {
			// append condition
			func[key] = conditions[key](func);
		});
	});
};

/**
 * [newTest description]
 * @param  {string}   plugin   [description]
 * @param  {Object}   opts     [description]
 * @param  {Function} callback [description]
 */
module.exports.newTest = function newTest(plugin, opts, callback) {
	var selectedPlugin;

	/** find & load plugin */
	if (typeof plugin === 'object') {
		selectedPlugin = plugin;
	} else {
		selectedPlugin = findPlugin(plugin);
	}

	if (!plugin) {
		var noPluginError = new Error('Failed to load plugin `%s`', plugin);
		console.warn(noPluginError);
	}

	/** initiate test */
	return describe(plugin + ' Test', function run() {
		// define appc
		this.appc = appc;

		/** [finished description] */
		before(function (done) {
			// Set AppC enviroment
			process.env.APPC_ENV = 'development';
			AppC.setEnvironment({
				baseurl: 'http://' + mocker.hostname + ':' + mocker.port,
				registryurl: 'http://' + mocker.hostname + ':' + mocker.port,
				securityurl: 'http://' + mocker.hostname + ':' + mocker.port,
				isProduction: false,
				supportUntrusted: true,
				secureCookies: false
			});

			/** itterate through the plugins */
			if (opts.endpoints) {
				/** load requests */
				opts.endpoints.forEach(mocker.add);
			}

			if (opts.endpoints_include) {
				opts.endpoints_include.forEach(function (endpoints) {
					endpoints.forEach(mocker.add);
				});
			}

			// Start the mocker server
			mocker.start(done);
		});

		/** [description] */
		beforeEach(function () {
			// flush the logs
			appc.log.flush();
		});

		/** [finished description] */
		after(function () {
			// stop the mocker Server
			mocker.end();
		});

		// define temp directory
		this.tmpDir = os.tmpdir();

		return callback.apply(this, [ null, selectedPlugin ]);
	});
};

/** [findPlugin description] */
function findPlugin(pluginName) {
	// standardize pluginName
	if (!/.js$/.test(pluginName)) {
		pluginName += '.js';
	}

	var filePaths = [
		path.join(module.exports.testDir, '..', 'plugins', pluginName),
		path.join(module.exports.testDir, '..', pluginName),
		path.join(module.exports.testDir, pluginName),
		pluginName
	];

	do {
		var filePath = filePaths.shift();
		if (fs.existsSync(filePath)) {
			return require(filePath);
		}
	} while (filePaths.length > 0);
}
