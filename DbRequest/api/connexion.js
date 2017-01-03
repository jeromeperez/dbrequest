var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'POST',
	path: '/api/utilisateur/connexion',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		
        var nomUtilisateur = request.payload.nomUtilisateur || 'utilisateur';
		var motDePasse = request.payload.motDePasse || 'mot de passe';
		/* console.log('payload nomUtilisateur OK', request.payload.nomUtilisateur);
		console.log('payload motDePasse OK', request.payload.motDePasse); */
	
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT MailUtilisateur, NomUtilisateur, TokenUtilisateur, scope, LangueUtilisateur FROM _UTILISATEURS WHERE NomUtilisateur = $1 and MotDePasse = $2 and Actif = true',
			[nomUtilisateur , motDePasse],
			function(err, result) {
				
				if(err) {
					return console.error('error running query', err);
				};
				
				var d = new Date();
				client.query('UPDATE _UTILISATEURS SET datederniereconnexion = $1',
				[d], 
				function(err2, result2) {
					// call 'done()' to release the client back to the pool
					done();
					if(err2) {
						return console.error('error running query', err2);
					}
					// retour du query précèdent
					return reply(result.rows);
				});
			});
		});
		
		
	},
	
	config: {
		auth: false,
		tags: ['api'],
		description: 'POST connection',
		notes: "Identifie l\'utilisateur est renvoi le jeton",
		validate: {
			/* payload: { headers: {
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
