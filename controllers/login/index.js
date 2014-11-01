'use strict';


var LoginModel = require('../../models/login');


module.exports = function (router) {

    var model = new LoginModel();


    router.get('/', function (req, res) {
        
        res.render('login', model);
        
    });

};
