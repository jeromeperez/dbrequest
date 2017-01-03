var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var fs = require('fs');

module.exports.route = {
	method: 'POST',
	path: '/api/requetes/transfert_utilisateur',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var listeRequete = request.payload.listeRequete || [] ;
		var nomNouvelUtilisateur = request.payload.nomNouvelUtilisateur || 'nouvel utilisateur' ;
		var nomUtilisateur = request.payload.nomUtilisateur || 'utilisateur' ;
		var nomBase = request.payload.nomBase || 'base' ;
		
		var d = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
				listeRequete.forEach(function(requete) {
					console.log('Transfert requête : ');
					console.log('Id requête  : ', requete.idrequete);
					console.log('Nom requête : ', requete.nomrequete);
				
					client.query('INSERT INTO _REQUETES (NomRequete , NomUtilisateur , NomBase , Validation , DateValidation , 						Datecreation , TagSuppression , DateSuppression) ' + 
							'SELECT NomRequete , $1 , NomBase , false , null , $2 , false , null FROM _REQUETES WHERE IdRequete = $3',
			    			[nomNouvelUtilisateur , d , requete.idrequete ],
						function(err, result) {
			
							if(err) {
								return console.error('error running query', err);
							}
					});
				});

				return reply(null);
		});	
	},
	
	config: {
		auth: {
            strategy: 'jwt',
            scope: ['admin' , 'redacteur']
        },
		tags: ['api'],
		description: 'POST transfert requête(s) vers nouvel utilisateur',
		notes: "Transfert d\'une liste de requêtes vers un nouvel utilisateur. ",
		validate: {
			
		}
	}

}
