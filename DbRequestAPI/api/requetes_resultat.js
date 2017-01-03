var Joi = require('joi');
var env = require('../config/env');
var JWT = require('jsonwebtoken');
var funcUtil = require('../utilitaires/utilitaires');
var json2csv = require('json2csv');
var fs = require('fs');

module.exports.route = {
	method: 'GET',
	path: '/api/requetes/resultat/{filename}',
	
	handler: {
        file: function (request) {
            return request.params.filename;
        }
    } ,
	
	config: {
		auth: {
            		strategy: 'jwt',
            		scope: ['admin' , 'redacteur']
        	},
		tags: ['api'],
		description: 'GET resultat requête',
		notes: "Resultat d'une requête",
		validate: {
			
		}
	}

}
