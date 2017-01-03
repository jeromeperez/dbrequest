var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');


module.exports.route = {
	method: 'POST',
	path: '/api/utilisateur/nomexiste',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var nomUtilisateur = request.payload.nomUtilisateur || 'nom';
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT NomUtilisateur FROM _UTILISATEURS WHERE NomUtilisateur = $1',[nomUtilisateur], function(err, result) {
				
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				return reply(result.rows);
			});
		});
		
		
	},
	
	config: {
		auth: false,
		tags: ['api'],
		description: 'POST nom existe',
		notes: "Vérifie si un nom est déja connue",
		validate: {
			/* payload: {
			nomUtilisateur: Joi.string()
			.required()
			.description('Utilisateur : Nom de l\'utilisateur (_nomUtilisateur)'),
			motDePasse: Joi.string()
			.required()
			.description('Utilisateur : Mot de passe de l\'utilisateur (_motDePasse)') 
			} */
		}
	}

}