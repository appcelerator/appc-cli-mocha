module.exports = [
	{
		method: 'get',
		path: '/example',
		/** [handle description] */
		handle: function (req, opts, res) {
			return res.status(200).type('application/json').send({
				success: true
			});
		}
	}
];
