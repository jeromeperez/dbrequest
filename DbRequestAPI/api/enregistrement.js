var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');
var funcUtil = require('../utilitaires/utilitaires');

module.exports.route = {
	method: 'POST',
	path: '/api/utilisateur/enregistrement',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var mailUtilisateur = request.payload.mailUtilisateur || 'mail@utilisateur.fr';
		var nomUtilisateur = request.payload.nomUtilisateur || 'utilisateur';
		var motDePasse = request.payload.motDePasse || 'mot de passe';
		var langueUtilisateur = request.payload.langueUtilisateur || 'fr';
		
		var secret = env.secret; 
		var utilisateur = {
		NomUtilisateur : nomUtilisateur,
		//scope: ['lecteur' , 'redacteur' , 'admin']
		scope: ['lecteur']
		};
		var tokenUtilisateur = JWT.sign(utilisateur, secret); 
		var d = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('INSERT INTO _UTILISATEURS (NomUtilisateur , MotDePasse , MailUtilisateur , TokenUtilisateur , Actif ,dateinscription,datevalidationinscription,datederniereconnexion, DroitLecture , DroitEcriture ,DroitAdmin , scope , LangueUtilisateur) VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9, $10, $11, $12, $13)',
			//[nomUtilisateur , motDePasse , mailUtilisateur, tokenUtilisateur , true, d, null, d, true, true, true, 'lecteur redacteur admin', langueUtilisateur],
			[nomUtilisateur , motDePasse , mailUtilisateur, tokenUtilisateur , true, d, null, d, true, false, false, 'lecteur', langueUtilisateur],
			function(err, result) {
			
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				// envoi d'un mail aux administrateurs
				funcUtil.demandeValidationInscription(mailUtilisateur , nomUtilisateur, request);
				return reply(result.rows);
			});
		});
		
		
	},
	
	config: {
		auth: false,
		tags: ['api'],
		description: 'POST enregistrement',
		notes: "Enregistre un utilisateur",
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
