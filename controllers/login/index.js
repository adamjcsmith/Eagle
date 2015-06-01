'use strict';


var LoginModel = require('../../models/login');


module.exports = function (router) {

    var model = new LoginModel();


    router.get('/', function (req, res) {
        
        res.render('login', model);
        
    });
	
	router.post('/', function(req, res) {
		
		if(req.body.username == 'fypdemo') {
			
			if(req.body.password == 'demo') {
				
				var username = req.body.username;
			
				req.session.username = username;				
				
				res.redirect('/dashboard/');
				
			}
			else {
				res.redirect('/');
			}
			
		}
		else {
			res.redirect('/');
		}
		
	});

};
