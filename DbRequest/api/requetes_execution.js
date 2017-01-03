var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');
var funcUtil2 = require('../utilitaires/suiviImportation');

var json2csv = require('json2csv');
var fs = require('fs');

module.exports.route = {
	method: 'POST',
	path: '/api/requetes/execution',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};

		var nomBase = request.payload.nomBase || 'base' ;
		var requeteId = request.payload.requeteId || '0' ;
		var detailsRequeteScript = request.payload.detailsRequeteScript || ['script'] ;
		var nomRequete = request.payload.nomRequete || 'nomRequete' ;
		var nomUtilisateurRequete = request.payload.nomUtilisateurRequete || 'nomUtilisateurRequete' ;

		var d = new Date();
		var SQLcreation = '' ;
		
		cn.database = nomBase ;
		
		for (var i = 0; i < detailsRequeteScript.length; i++) {
			SQLcreation = SQLcreation + detailsRequeteScript[i]  + ' ' ;
		} ;	
		console.log(SQLcreation) ;
	
	    pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			console.log('Exécution de la requête N° ' , requeteId )	;
			client.query( SQLcreation
			, function(err, result) {
				
				if(err) {
					console.error('Erreur exécution requête', err);
					reply(err) ;
					return ;
				}
				console.log('Exécution requête Ok')

				var nomFichierCsv = 'Requete_' + nomRequete + '_' + nomUtilisateurRequete + '_' + nomBase +  '.csv'
				
				if (result.rows.length == 0) {	
					
					var resultat = [ { "Pas":" ","de":" ","resultat":" "} ];
					console.log(JSON.stringify(resultat, null, 4)) ;
					json2csv({ data: resultat }, function(err, csv) {
						if (err) console.log(err);
						fs.writeFile(nomFichierCsv, csv, function(err) {
							if (err) throw err;
							console.log('fichier sauvegardé');
						});
					});
				} ;	
				if (result.rows.length >= 1) {			
					var resultat = result.rows ;
					json2csv({ data: resultat }, function(err, csv) {
						if (err) console.log(err);
						fs.writeFile(nomFichierCsv, csv, function(err) {
							if (err) throw err;
							console.log('fichier sauvegardé');
						});
					});
				funcUtil2.validationRequete(requeteId) ;
				} ;
				
			done();	
    			reply(result.rows) ;
				
			});
				
			return ;
		});
	},
	
	config: {
		auth: {
            		strategy: 'jwt',
            		scope: ['admin' , 'redacteur']
        	},
		tags: ['api'],
		description: 'POST execution requête',
		notes: "Executer une requête",
		validate: {
			
		}
	}

}
