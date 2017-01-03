var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');

module.exports.route = {
	method: 'POST',
	path: '/api/utilisateur/changementMdp',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var mailUtilisateur = request.payload.mailUtilisateur || 'mail@utilisateur.fr';
		var nouveauMotDePasse = request.payload.motDePasse || 'mail@utilisateur.fr';
		var secret = env.secret; 
		
		pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
			
				client.query('SELECT NomUtilisateur , scope FROM _UTILISATEURS WHERE MailUtilisateur = $1', [mailUtilisateur] ,
				function(err, result) {
			
					if(err) {
						return console.error('error running query', err);
					}
					
					var nomUtilisateur = result.rows[0].nomUtilisateur ;
					var scope = result.rows[0].scope.split(" ") ;
					var utilisateur = {
						NomUtilisateur : nomUtilisateur ,
						MotDePasse : nouveauMotDePasse ,
						scope: scope
					};
					var tokenUtilisateur = JWT.sign(utilisateur, secret) ; 
					
					client.query('UPDATE _UTILISATEURS SET TokenUtilisateur = $1 , MotDePasse = $2 WHERE mailutilisateur = $3' ,
					[tokenUtilisateur , nouveauMotDePasse , mailUtilisateur] ,
					function(err2, result2) {
						console.log('coucou 1');
						if(err2) {
							return console.error('error running query', err2);
						}
						client.query('SELECT MailUtilisateur, NomUtilisateur, TokenUtilisateur, scope, LangueUtilisateur FROM _UTILISATEURS WHERE MailUtilisateur = $1 and MotDePasse = $2 and Actif = true',
						[mailUtilisateur , nouveauMotDePasse],
						function(err3, result3) {
							done();
							console.log('coucou 2');
							if(err3) {
								return console.error('error running query', err3);
							};
							console.log('coucou 3');
							console.log(result3.rows);
							return reply(result3.rows);
							
						});
					});	
				});
			});
		
	},
	
	config: {
		auth: 'jwt',	
		tags: ['api'],
		description: 'POST Changement MDP',
		notes: 'Modification du mot de passe de l\'utilisateur',
		validate: {
			params: {
				
			}
		}
	}

}