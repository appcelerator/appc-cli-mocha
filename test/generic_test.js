var core = require('..'),
	path = require('path'),
	should = require('should'),
	request = require('request'),
	exec = require('child_process').exec;

core.loadMochaConditions();

core.newTest('', {
	endpoints: [
		{
			method: 'all',
			path: '/*',
			/** [execute description] */
			handle: function (req, opts, res, next) {
				console.log('[MOCK-ADDR]', req.url);
				return next();
			}
		},
		{
			method: 'get',
			path: '/test',
			/** [execute description] */
			handle: function (req, opts, res) {
				res.status(200).type('application/json').send({
					success: true
				});
			}
		}
	],
	endpoints_include: [ require('./endpoints/example.js') ]
}, function (err, plugin) {
	var appc = this.appc,
		tmpDir = this.tmpDir,
		async = appc.async;

	describe('OS restrictive conditional tests', function () {
		it.mac('mac only condition', function () {

		});

		it.linux('linux only condition', function () {

		});

		it.win('win only condition', function () {

		});
	});

	describe('express test', function () {
		it('endpoint /test', function (done) {
			request({
				method: 'get',
				url: 'http://127.0.0.1:8118/test',
				json: true
			}, function (err, req, res) {
				should.not.exist(err);
				should(res).have.property('success');
				return done();
			});
		});

		it('endpoint /example', function (done) {
			request({
				method: 'get',
				url: 'http://127.0.0.1:8118/example',
				json: true
			}, function (err, req, res) {
				should.not.exist(err);
				should(res).have.property('success');
				return done();
			});
		});
	});
});
