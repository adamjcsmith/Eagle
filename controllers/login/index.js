'use strict';


var LoginModel = require('../../models/login');


module.exports = function (router) {

    var model = new LoginModel();


    router.get('/', function (req, res) {
        
        res.render('login', model);
        
    });
	
	router.post('/', function(req, res) {
	
		var username = req.body.username;
	
		req.session.username = username;
	
		//res.send("Hello " + username + "!");
		res.redirect('/dashboard/');
	
	});

};
