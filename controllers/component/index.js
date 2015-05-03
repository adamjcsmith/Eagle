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
var Series = new Schema({
	_id : String, module : Number, startYear : String, convenor: Number
});

// Define a Module: 
/*
var Module = new Schema({
	_id : Number, name : String, code : Number
});
*/

// Set the models:
var SeriesModel = mongoose.model('series', Series);
//var ModuleModel = mongoose.model('modules', Module);
//var MarkModel = mongoose.model('marks', Mark);



module.exports = function (router) {
	
	
	// Student parameters:
	router.param('componentid', function(req, res, next, componentid) {
	
		// Try to find the component in question:
		Components.find({_id: componentid}, function(err, docs) {
			
			if(docs.length == 0) {console.log("No component with id: " + componentid + " found. "); return;  }
			
			req.type = docs[0].type;
			
			// If successful, find the series info:
			SeriesModel.find({_id: docs[0].series}, {}, function(error, seriesdocs) {
				
				var currentYear = seriesdocs[0].startYear;
				req.year = seriesdocs[0].startYear;
				
				// Then find the module info!:
				ModuleModel.find({_id: seriesdocs[0].module}, {}, function(error, moduledocs) {
						
					req.moduledocs = moduledocs;
						
					// Then, find the relevant mark info:
					Markz.find({$query: {componentID: componentid}, $orderby: { rawResult : -1 } }, {}, function(error, marksdocs) {
						
						/* Magic Here */
					
						mongoJoin
						.query( db.collection("marks"), {}, {}, {} )
						.join({
							joinCollection: db.collection("components"),
							leftKeys: ["componentID"],
							rightKeys: ["_id"],
							newKey: "componentdata"
						})
						.join({
							joinCollection: db.collection("series"),
							leftKeys: ["componentdata.series"],
							rightKeys: ["_id"],
							newKey: "seriesresult"
						})
						.exec(function (err, items) {
							
							// Convert mongoose object to json:							
							var temporaryMarks = marksdocs;
							
							// For each element in marksdocs:
							for (var item in marksdocs) {
								
								var temporaryItem = marksdocs[item].toObject();
								
								temporaryItem.failCount = 0;
								
								var studentTypeAverage = 0;
								var studentTypeCounter = 0;
								
								// Loop through the full mark array:
								for (var result in items) {
									
									// Also find average of same-component marks this year:
									if((items[result].seriesresult.startYear == currentYear) && (items[result].componentdata.type == req.type)) {
										if(items[result].studentID == temporaryMarks[item].studentID) {
											
											studentTypeAverage = studentTypeAverage + parseInt(items[result].rawResult);
											studentTypeCounter++;
										}
									}
									
									if(items[result].studentID == temporaryMarks[item].studentID) {
										
										if(items[result].seriesresult.startYear == currentYear) {
											
											if((items[result].rawResult < 40) && (items[result].componentdata.type == req.type)) {
												
												temporaryItem.failCount++;
												console.log("Adjusted a mark");
											
											}
											
										}
										
									}
									
									
								}
								
								// Add the average here:
								if(studentTypeCounter > 0 )
									temporaryItem.componentTypeAverage = (studentTypeAverage / studentTypeCounter);
								else
									temporaryItem.componentTypeAverage = 0;
								
								marksdocs[item] = JSON.stringify(temporaryItem);
							
							}
							
							
							req.marks = marksdocs;	
							console.log(marksdocs);
							next();	
							
							
						});
						
						
							
					});
				}).lean();
			});
		});
	});

    router.get('/', function (req, res) {
		// Get all components:
		ComponentModel.find({}, {}, function(err, comp) {
			if(err) { console.log("An error occurred.")}

			// Render the page (NOT YET!):
			//res.render('allstudents', {name: "All Students", data: comp});				

		})
    });
	
	router.get('/:componentid/', function(req, res) {
		// Check for component existence, if not then return an error page:
		if(req.moduledocs.length > 0) {
			console.log("Got to the rendering stage...");
			res.render('component', {context: req.moduledocs, marks: req.marks, type: req.type, series: req.year});
		}
		else res.send("Component not found.");
		
	});
	
	router.get('/:componentid/workflow/', function(req, res) {
		// Check for existence:
		if(req.moduledocs.length > 0) {
			res.render('workflow-component', {context: req.moduledocs, marks: req.marks, type: req.type, series: req.year, mode: 'component'});
		}
		else res.send("Component not found.");
		
	});

};
