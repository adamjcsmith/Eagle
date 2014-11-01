'use strict';
var database = require('mysql');

var db = function() {
	return {
		config: function(conf) {
			var connection = database.createConnection({ host: conf.host, user: conf.user, password: conf.password, database: conf.database});
			connection.on('error', console.error.bind(console, 'Connection to Database Failed:'));
			connection.once('open', function callback() {
				console.log('Connection to Database Established');
			});
		}
	};

};

module.exports = db();