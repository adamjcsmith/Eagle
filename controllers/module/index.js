'use strict';

// Database Connection:
var mongoDB = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/eagledb');
var Markz = require('../../models/mark.js');
var waterfall = require('async-waterfall');
var Components = require('../../models/component.js');
var MJ = require("mongo-fast-join");
var mongoJoin = new MJ();

var ModuleModel = require('../../models/module.js');

var Schema = mongoose.Schema;

var ObjectID = mongoose.Schema.Types.ObjectId;

// Define a series:
/*
var Series = new Schema({
	_id : String, module : Number, startYear : String, convenor: Number
});

// Set the models:
var SeriesModel = mongoose.model('series', Series);
*/

module.exports = function (router) {
	
	// Student parameters:
	router.param('moduleid', function(req, res, next, moduleid) {	
		
		ModuleModel.find({_id: moduleid}, {}, function(error, moduledocs) {
			
			console.log("Trying to find module #" + moduleid + " with the no of results: " + moduledocs.length);
			req.moduledocs = moduledocs;
			next();
			
		})
		
	});

    router.get('/', function (req, res) {
		// Get all modules:
		
		console.log("Accessed etc");
		
		ModuleModel.find({}, {}, function(err, mod) {
			if(err) { console.log("An error occurred.")}
			
			res.render('allmodules', {mods: mod, mode: "All Modules"});

		})
    });
	
	router.get('/:moduleid/', function(req, res) {
		// Check for component existence, if not then return an error page:
		if(req.moduledocs.length > 0) {
			console.log("Got to the rendering stage...");
			
			Components.find({moduleCode: req.moduledocs[0].code}, {}, function(error, comp) {
				if(error) throw err;
				res.render('allmodules', {mods: comp, mode: comp[0].moduleName});
			})
			
		}
		else res.send("Module not found.");
		
	});

};
