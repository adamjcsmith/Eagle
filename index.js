'use strict';

var http = require('http');
var express = require('express');
var kraken = require('kraken-js');
var db = require('./lib/database');
var lusca = require('lusca');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoDB = require('mongodb');
var mongoose = require('mongoose');
var monk = require('monk');
//var data = monk('localhost:8000/eagledb');
mongoose.createConnection('mongodb://fyp-user:password@ds034878.mongolab.com:34878/eagledb-fyp');	
	
	
var io;
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

// Make Database Visible:
app.use(function(req,res,next){
	req.io = io;
    next();
}); 

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
	
	io = require('socket.io').listen(server);
	var Students = require('./models/student.js');
	var Marks = require('./models/mark.js');	
	var Cohorts = require('./models/cohort.js');
	var Components = require('./models/component.js');
	
	io.on('connection', function(socket){
		console.log('a user connected');
		
		socket.on('studentRequest', function(data) {
			
			// Connect to the DB here and find the name...
			//console.log("Trying to find student ID: " + data);
			//var intData = Number(data);
			//console.log("data is: " + typeof(intData));
			//console.log("entered input is: " + typeof(33108072));
			
			Students.find({_id: data}, function(error, docs) {
				
				if(docs.length == 0) { console.log("Student: " + data + " has been requested but is not found in the DB!"); return; }
				
				Marks.find({studentID: data}, {}, function(error, marks) {
					// Find Cohort:
					Cohorts.find({_id: docs[0].degreescheme}, {}, function(error, cohortz) {
						socket.emit('studentResponse', {name: docs[0].fullname, marks: marks, originalid: data, cohort: cohortz[0].name});						
					})
				})
			})
		});
		
		socket.on('componentRequest', function(data) {
			
			// Find module name, code and series (year):
			Components.find({_id: data}, {}, function(error, result) {
				
				console.log("Found: " + result[0].title + " " + result[0].type);
				socket.emit('componentResponse', {title: result[0].title, type: result[0].type});
				
			})
			
		});
		
		
		
	})
	
    server.on('listening', function () {
        console.log('Server listening on http://localhost:%d', this.address().port);
    });

}