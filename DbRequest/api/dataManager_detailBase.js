var Joi = require('joi');
var HttpRequest = require('request').defaults({ jar: true });
var async = require('async');
var env = require('../config/env');


module.exports.route = {
	method: 'POST',
	path: '/api/dataManager/detailBase',
	handler: function (request, reply) {
		
		var name = request.payload.name || 'utilisateur';
		var password = request.payload.password || 'mot de passe';
		
		
		var urlSession = request.payload.urlSession || 'http://data.plantnet-project.org/_session';
		var urlRequete = request.payload.urlRequete || 'http://data.plantnet-project.org';
		var nomBaseDataManager = request.payload.nomBaseDataManager || 'dbrequest';
		
		var RequeteSurDataManager = function() {
			
			var identifiers = { name: name , password: password };
			var options = { method: 'post', body: identifiers, json: true, url: urlSession };
			
			// La première requête permet d'obtenir le cookie de session pour autoriser les autres requêtes.
			// HttpRequest se charge de conserver ce cookie et le transmet aux requêtes suivantes.
			HttpRequest(options, function (error, response, body) {
				if (!error && body.ok) {
					urlRequeteAlldocs = urlRequete + '/' + nomBaseDataManager + '/_all_docs?&include_docs=false';
					HttpRequest(urlRequeteAlldocs, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							var json = JSON.parse(body);
						    //console.log(json);
							// Détail des strutures de la base
							var structures = [];	
							json.rows.forEach( function( row ) {
										if (row.hasOwnProperty('id') && row.id.match(/_design\/mm_.*/ )) {
											structures.push(row.id);
										};	
							});
							//console.log(structures);
							var urlRequeteDetailStructure = '';
							var detailsStructures = [];
							
							var first = true;
								async.forEachOf(structures, function (structure,i,callback) {
										urlRequeteDetailStructure = urlRequete + '/' + nomBaseDataManager + '/' + structure;
										//console.log(urlRequeteDetailStructure); 
										HttpRequest(urlRequeteDetailStructure, function (error, response, body) {
										if(error) {
											console.log('erreur requête détail ', error);      
											return console.error('erreur requête détail ', error);
										};
										if (!error && response.statusCode == 200) {
											var details = {};
											var jsonDetail = JSON.parse(body);
											details.id = jsonDetail._id;
											details.name = jsonDetail.name || 'pas de nom';
											details.desc = jsonDetail.desc || 'pas de description' ;
											detailsStructures.push(details);
										};
										callback();
										});
								}, function (error) {
									if (error) console.error(error.message);
									console.log('Traitement détail terminé');
									return reply(detailsStructures);
								});
							return;
						
						} else {
							console.log('Echec de la requête :');
							console.log(error);
							console.log(response.statusCode);
							console.error('Echec de la requête', error);
							return reply(null);
						};
					});
				} else {
					console.log('Echec authentification :');
					console.log(error);
					console.log(response.statusCode);
					console.error('Echec authentification', error);
					return reply(null);
			    };
			});
		
		};
	
	RequeteSurDataManager();
	},
	
	config: {
		//auth: false,
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST detail base couchDb',
		notes: "Détail d\'une base couchDb",
		validate: {
			
		}
	}

}