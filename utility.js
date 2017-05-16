var CONST = require('./constants')();

module.exports.fetch = function (request, querystring, callback) {
	var options = {
		host: CONST.ENDPOINT_HOST,
		path: CONST.ENDPOINT_PATH+querystring
	};

	console.log(options)

	var req = request(options, function(res) {
		// console.log(res.statusCode);
		var output = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			output += chunk;
		});
		res.on('end', function () {
			callback(output);
		})
	});

	req.on('error', function(err) {
		// console.log('error: '+err.message);
		callback(err);
	});

	req.end();
};