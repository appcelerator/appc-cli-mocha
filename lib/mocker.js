/**
 * appc-cli-mocha (Request mocker)
 */
var express = require('express'),
	bodyParser = require('body-parser'),
	async = require('async'),
	_ = require('lodash');

var instance = module.exports.instance = null;

module.exports.port = '8118';
module.exports.hostname = '127.0.0.1';

/** [createAppInstance description] */
function createAppInstance() {
	module.exports.app = express(); // express appliaction instance

	/** application configuration */
	module.exports.app.use(bodyParser.json()); // allow json in req,body
	module.exports.app.use(require('connect-busboy')()); // module to handle muti-part form data
}

createAppInstance();

/**
 * Appends a api endpoint to the application
 * @param {Object} apiEndpoint [description]
 */
module.exports.add = function add(apiEndpoint) {
	var method = apiEndpoint.method && apiEndpoint.method.toLowerCase() || 'all',
		handle = apiEndpoint.handle || function () { };

	/** append custom middleware */
	function customMiddleware() {
		var args = Array.prototype.slice.call(arguments),
			req = args[0],
			opts = {};

		// handle multi-part data
		if (req.busyboy) {
			req.pipe(req.busyboy);
		}

		// concat req data into opts
		if (typeof req.body === 'object') {
			opts = _.extend(opts, req.body);
		}
		if (typeof req.query === 'object') {
			opts = _.extend(opts, req.query);
		}

		// append opts to arguments
		args.splice(1, 0, opts);
		return handle.apply(this, args);
	}
	// assign endpoint
	module.exports.app[method](apiEndpoint.path, customMiddleware);
};

/** [start description] */
module.exports.start = function start(done) {
	instance = module.exports.app.listen(module.exports.port, module.exports.hostname, function () {
		console.log('[INFO] server instance created');
		done();
	});
};

/** [end description] */
module.exports.end = function end() {
	if (instance) {
		instance.close();
		console.log('[INFO] server instance closed');
		instance = null; // reset instanceå
		createAppInstance();
	}
};
