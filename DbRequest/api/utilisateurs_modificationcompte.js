var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');
var funcUtil = require('../utilitaires/utilitaires');

module.exports.route = {
	method: 'POST',
	path: '/api/utilisateurs/modificationcompte',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var mailUtilisateur = request.payload.mailUtilisateur || 'mail@utilisateur.fr' ;
		var mailUtilisateurChoisi = request.payload.mailUtilisateurChoisi || 'mailchoisi@utilisateur.fr' ;
        var autorisationChoisie = request.payload.autorisationChoisie || 'false' ;
		var permissionsChoisies = request.payload.permissionsChoisies || ['lecteur'] ;
		var langueChoisie = request.payload.langueChoisie || 'fr' ;
		
		
		var secret = env.secret; 
		var d = new Date();
		
		
		if (mailUtilisateur == mailUtilisateurChoisi) {
		
			pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
			
				client.query('SELECT NomUtilisateur , MotDePasse FROM _UTILISATEURS WHERE MailUtilisateur = $1', [mailUtilisateur] ,
				function(err, result) {
			
					if(err) {
						return console.error('error running query', err);
					}
					
					var nomUtilisateur = result.rows[0].nomUtilisateur ;
					var motDePasse = result.rows[0].motDePasse ;
					
					var utilisateur = {
						NomUtilisateur : nomUtilisateur,
						MotDePasse : motDePasse,
						scope: permissionsChoisies
					};
					var tokenUtilisateur = JWT.sign(utilisateur, secret); 
					
					var scopeChoisi = permissionsChoisies.join(" ");
					console.log(autorisationChoisie);
					
					client.query('UPDATE _UTILISATEURS SET TokenUtilisateur = $1 , Actif = $2 , Scope = $3 , LangueUtilisateur = $4 WHERE mailutilisateur = $5' ,
					[tokenUtilisateur , autorisationChoisie , scopeChoisi , langueChoisie , mailUtilisateur] ,
					function(err2, result2) {
						done();
						if(err2) {
							return console.error('error running query', err2);
						}
						
						return reply(null);
					});	
					
					return;
				});
			});
			
		} else {
			
			pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
			
				client.query('SELECT NomUtilisateur, MotDePasseDateInscription, DateValidationInscription, DateDerniereConnexion, DroitLecture, DroitEcriture, DroitAdmin FROM _UTILISATEURS WHERE MailUtilisateur = $1', [mailUtilisateur] ,
				function(err, result) {
			
					if(err) {
						return console.error('error running query', err);
					}
					
					var nomUtilisateur = result.rows[0].nomUtilisateur ;
					var motDePasse = result.rows[0].motDePasse ;
					var dateinscription = result.rows[0].dateinscription ;
					var datevalidationinscription = result.rows[0].datevalidationinscription ;
					var datederniereconnexion = result.rows[0].datederniereconnexion ;
					var droitLecture = result.rows[0].droitlecture ;
					var droitEcriture = result.rows[0].droitecriture ;
					var droitAdmin = result.rows[0].droitadmin ;
				
					var utilisateur = {
						NomUtilisateur : nomUtilisateur,
						MotDePasse : motDePasse,
						scope: permissionsChoisies
					};
					var tokenUtilisateur = JWT.sign(utilisateur, secret); 
					
					var scopeChoisi = permissionsChoisies.join(" ");
					console.log(autorisationChoisie);
					
					client.query('INSERT INTO _UTILISATEURS (NomUtilisateur , MotDePasse , MailUtilisateur , TokenUtilisateur , Actif ,DateInscription,DateValidationInscription,DateDerniereConnexion, DroitLecture , DroitEcriture ,DroitAdmin , scope , LangueUtilisateur)' +
					' VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9, $10, $11, $12, $13)',
					[nomUtilisateur , motDePasse , mailUtilisateurChoisi, tokenUtilisateur, autorisationChoisie, dateinscription, datevalidationinscription, datederniereconnexion, droitLecture, droitEcriture, droitAdmin, scopeChoisi, langueChoisie],
					function(err2, result2) {

						if(err2) {
							return console.error('error running query', err2);
						}
						
						client.query('DELETE FROM _UTILISATEURS WHERE MailUtilisateur = $1' ,[mailUtilisateur],
						function(err3, result3) {
							done();
							if(err3) {
								return console.error('error running query', err3);
							}
						
							return reply(null);
						
						});	
					});
					return;
				});
			});
		};
	
	},
	
	config: {
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST modification compte',
		notes: "Modifier un compte utilisateur",
		validate: {
			
		}
	}

}
