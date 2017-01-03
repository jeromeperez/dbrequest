var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'POST',
	path: '/api/utilisateur/deconnexion',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		
		pg.connect(cn, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT NomUtilisateur FROM _UTILISATEURS' 
			, function(err, result) {
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				reply('Fin de connexion')
				.header("Authorization", request.headers.authorization);
			});
		});
		
	},
	
	config: {
		auth: 'jwt',	
		tags: ['api'],
		description: 'POST Déconnexion',
		notes: 'Met fin à la connexion de l\'utilisateur',
		validate: {
			params: {
				
			}
		}
	}

}