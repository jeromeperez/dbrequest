var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');
var funcUtil = require('../utilitaires/utilitaires');

module.exports.route = {
	
	
	config: {
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST modification compte',
		notes: "Modifier un utilisateur",
		validate: {
			
		}
	}

}
"utilisateurs_validationcompte",
		"utilisateurs_reinitialisationmdpcompte",