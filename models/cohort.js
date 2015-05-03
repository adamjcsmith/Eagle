'use strict';

var mongoDB = require('mongodb');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
  
// Define a student:
var Cohort = new Schema({
	_id : String, name : String
});

// Set the model:
var CohortModel = mongoose.model('cohorts', Cohort);


module.exports = CohortModel;