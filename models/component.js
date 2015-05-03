'use strict';

var mongoDB = require('mongodb');
var mongoose = require('mongoose');

var Schema = mongoose.Schema

// Define a Component:
var Component = new Schema({
	_id : String, 
	type: String, 
	series: Number, 
	title: String, 
	weighting: String, 
	open: String, 
	startYear: String, 
	moduleName: String,
	moduleCode: String
});

// Set the model:
var ComponentModel = mongoose.model('components', Component);

module.exports = ComponentModel;