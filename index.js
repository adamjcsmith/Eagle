'use strict';

var http = require('http');
var express = require('express');
var kraken = require('kraken-js');
var db = require('./lib/database');
var lusca = require('lusca');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var options, app, server;


/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
    onconfig: function (config, next) {
        /*
         * Add any additional config setup or overrides here. `config` is an initialized
         * `confit` (https://github.com/krakenjs/confit/) configuration object.
         */
		 
		db.config(config.get('databaseConfig'));
		 
        next(null, config);
    }
};

app = module.exports = express();
app.use(kraken(options));

/* Need these to use Lusca: */
app.use(cookieParser());

app.use(session({
	secret: 'keyboard-cat',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));

/* Lusca: */
app.use(lusca({
	csrf: true,
	csp: { /* */ },
	xframe: 'SAMEORIGIN',
	p3p: 'ABCDEF',
	hsts: {maxAge: 31536000, includeSubDomains: true},
	xssProtection: true
}));



app.on('start', function () {
    console.log('Application ready to serve requests.');
    console.log('Environment: %s', app.kraken.get('env:env'));
});




/*
 * Create and start HTTP server.
 */
if (!module.parent) {

    /*
     * This is only done when this module is run directly, e.g. `node .` to allow for the
     * application to be used in tests without binding to a port or file descriptor.
     */
    server = http.createServer(app);
    server.listen(process.env.PORT || 8000);
    server.on('listening', function () {
        console.log('Server listening on http://localhost:%d', this.address().port);
    });

}