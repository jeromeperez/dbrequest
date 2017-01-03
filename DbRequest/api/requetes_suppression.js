var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var fs = require('fs');

module.exports.route = {
	method: 'POST',
	path: '/api/requetes/suppression',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var listeRequete = request.payload.listeRequete || [] ;
		var nomUtilisateur = request.payload.nomUtilisateur || 'utilisateur' ;
		var nomBase = request.payload.nomBase || 'base' ;
		
		var d = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
				listeRequete.forEach(function(requete) {
					console.log('Suppression requête : ');
					console.log('Id requête  : ', requete.idrequete);
					console.log('Nom requête : ', requete.nomrequete);
				
					client.query('UPDATE _REQUETES SET TagSuppression = $1 , DateSuppression = $2 WHERE IdRequete = $3 ;',
			    			[true , d , requete.idrequete ],
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
		description: 'POST suppression requête(s)',
		notes: "Suppression d\'une liste de requêtes. ",
		validate: {
			
		}
	}

}
