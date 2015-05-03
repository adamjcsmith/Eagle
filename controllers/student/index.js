'use strict';

// Database Connection:
var mongoDB = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/eagledb');
var Markz = require('../../models/mark.js');
var Students = require('../../models/student.js');
var Cohorts = require('../../models/cohort.js');
var Components = require('../../models/component.js');
var Modules = require('../../models/module.js');

// Define a Result:
/*
var Mark = new Schema({
	_id : ObjectID, studentID : String, componentID : Number, rawResult : Number
});
*/

//var MarkModel = mongoose.model('marks', Mark);

module.exports = function (router) {
	
	// Student parameters:
	router.param('studentid', function(req, res, next, studentid) {
	
		// Try to find the student in question:
		Students.find({_id: studentid}, function(err, docs) {
			
			console.log("Got to Stage 1.  Docs is: " + docs);
		
			// If successful, find their marks as well:
			Markz.find({studentID: studentid}, { _id: 0}, function(error, marks) {
				req.marks = marks;
				req.docs = docs;
				console.log(marks);
				
				// Find cohort:
				Cohorts.find({_id: docs[0].degreescheme}, function(error, cohortz) {
					req.degreescheme = cohortz[0].name;
					next();					
				})
				
				

			});
	  });
	});

    router.get('/', function (req, res) {
		// Get all student data:
		//Students.find({}, {}, function(err, student) {
		// Find all exam components that are this year and are open:
		Components.find({type: 'Exam', startYear: '2014', open: '1'}, {}, function(err, componentz) { 
			if(err) { console.log("An error occurred.")}
			
			Students.find({}, {}, function(err, student) {
				console.log(componentz);
				
				Markz.find({type: 'Exam'}, {}, function(err, markz) {
					
					Modules.find({}, {}, function(err, mods) {
						
						// Render the page:					
						res.render('workflow-allstudents', {name: "All Students", comps: componentz, students: student, allmarks: markz, mods: mods, mode: 'allstudents'});
												
						
					});
					

				})
				
			});


			//res.render('allstudents', {name: "All Students", data: student});	
		});
    });
	
	router.get('/:studentid/', function(req, res) {
		// Check for student existence, if not then return an error page:
		if(req.docs.length > 0) {
			res.render('singlestudent', {context: req.docs[0], marks: req.marks});
		}
		else res.send("Student not found.");
	});
	
	router.get('/:studentid/choiceview', function(req, res) {
		if(req.docs.length > 0) {
			res.render('studentchoiceview', {context: req.docs[0], marks: req.marks, degreescheme: req.degreescheme});
		}
		else res.send("Student not found.");	
	});
	
	router.get('/:studentid/fullview/', function(req, res) {
		// Check for student existence, if not then return an error page:
		if(req.docs.length > 0) {
			res.render('studentfullview', {context: req.docs[0], marks: req.marks, degreescheme: req.degreescheme});
		}
		else res.send("Student not found.");		
	});
	
	router.get('/:studentid/workflow/', function(req, res) {
		// Check for student existence, if not then return an error page:
		if(req.docs.length > 0) {
			res.render('workflow-solostudent', {context: req.docs[0], marks: req.marks, degreescheme: req.degreescheme, mode: 'Student'});
		}
		else res.send("Student not found.");		
	});	

};
