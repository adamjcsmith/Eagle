'use strict';


var DashboardModel = require('../../models/dashboard');
var Components = require('../../models/component.js');
var Marks = require('../../models/mark.js');
var Students = require('../../models/student.js');

module.exports = function (router) {

    //var model = new DashboardModel();


    router.get('/', function (req, res) {
        
		Components.find({type: 'Exam', open: '1'}, {}, function(error, comps) {
			
			Marks.find({}, {}, function(error, markz) {
				
				Students.find({}, {}, function(error, studentz) {
					
					res.render('dashboard', {components: comps, marks: markz, students: studentz});					
					
				});
				
				

				
			});
			
			
			
		});
		
		
        
        
    });
	
	router.get('/insights/', function(req, res) {
	
		// Connect to the model here.
	
		res.render('insights', model);
	
	});

};
