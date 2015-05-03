'use strict';

var mongoDB = require('mongodb');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// Give a random number:
var ObjectID = Schema.ObjectId;
  
// Define a student:
var Student = new Schema({
	_id : String, 
	fullname : String, 
	degreescheme : String,
	course : String
});

// Set the model:
var StudentModel = mongoose.model('students', Student);


module.exports = StudentModel;