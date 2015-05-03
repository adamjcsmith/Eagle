'use strict';

var mongoDB = require('mongodb');
var mongoose = require('mongoose');

var Schema = mongoose.Schema
  
// Define a mark:
var Mark = new Schema({
	_id : String, 
	studentID : String, 
	componentID : String, 
	rawResult : Number,
	moduleID: String,
	type: String,
	weighting: String,
	moduleCredit: String,
	moduleCode: String,
	moduleName: String
});

// Set the model:
var MarkModel = mongoose.model('marks', Mark);

module.exports = MarkModel;