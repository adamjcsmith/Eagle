'use strict';

var mongoDB = require('mongodb');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
  
// Define a student:
var Module = new Schema({
	_id : String, 
	name : String, 
	code: String
});

// Set the model:
var ModuleModel = mongoose.model('modules', Module);

module.exports = ModuleModel;