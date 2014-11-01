'use strict';


var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {
        
		// Redirect to Dashboard if already logged in, else login:
		if(req.session.username)
			res.render('index', model);			
		else
			res.redirect('/login');
		
    });

};
