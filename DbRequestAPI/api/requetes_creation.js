var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var json2csv = require('json2csv');
var fs = require('fs');

module.exports.route = {
	method: 'POST',
	path: '/api/requetes/creation',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var nomRequete = request.payload.nomRequete || 'requête 0' ;
		var nomUtilisateur = request.payload.nomUtilisateur || 'utilisateur' ;
		var nomBase = request.payload.nomBase || 'base' ;
		
		var d = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
			
				client.query('INSERT INTO _REQUETES (NomRequete , NomUtilisateur , NomBase , Validation , DateValidation , 						Datecreation , TagSuppression , DateSuppression) VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 );',
			    		[nomRequete , nomUtilisateur , nomBase , false , null , d , 0 , null ],
				function(err, result) {
			
					if(err) {
						return console.error('error running query', err);
					}
				    	var resultat = [ { "Pas":" ","de":" ","resultat":" "} ];
					var nomFichierCsv = 'Requete_' + nomRequete + '_' + nomUtilisateur + '_' + nomBase +  '.csv'
				
					json2csv({ data: resultat }, function(err, csv) {
						if (err) console.log(err);
						fs.writeFile(nomFichierCsv, csv, function(err) {
							if (err) throw err;
							console.log('fichier sauvegardé');
						});
					});
						
				    return reply(null);
					
				});
			});	
	
	},
	
	config: {
		auth: {
            strategy: 'jwt',
            scope: ['admin' , 'redacteur']
        },
		tags: ['api'],
		description: 'POST création requête',
		notes: "Création d\'une requête. ",
		validate: {
			
		}
	}

}
