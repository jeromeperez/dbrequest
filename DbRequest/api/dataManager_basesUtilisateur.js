var Joi = require('joi');
var HttpRequest = require('request').defaults({ jar: true });
var async = require('async');
var env = require('../config/env');

module.exports.route = {
	method: 'POST',
	path: '/api/dataManager/basesUtilisateur',
	handler: function (request, reply) {
		
        var name = request.payload.name || 'utilisateur';
		var password = request.payload.password || 'mot de passe';
		
		
		var urlSession = request.payload.urlSession || 'http://data.plantnet-project.org/_session';
		var urlRequete = request.payload.urlRequete || 'http://data.plantnet-project.org/';
		
		var RequeteSurDataManager = function() {
			
			var identifiers = { name: name , password: password };
			var options = { method: 'post', body: identifiers, json: true, url: urlSession };
			
			var toutesLesBases = [];
			var basesAccessibles = [];
			
			// La première requête permet d'obtenir le cookie de session pour autoriser les autres requêtes.
			// HttpRequest se charge de conserver ce cookie et le transmet aux requêtes suivantes.
			HttpRequest(options, function (error, response, body) {
				if (!error && body.ok) {
					HttpRequest(urlRequete + '_all_dbs', function (error, response, body) {
						if (!error && response.statusCode == 200) {
							toutesLesBases = JSON.parse(body);
							// Utilisation de async pour la boucle de verification de l'acces aux bases
							async.each(toutesLesBases, function (base, callback) {
								HttpRequest(urlRequete + base, function (error, response, body) {
									if (!error && response.statusCode == 200) {
										var json = JSON.parse(body);
										basesAccessibles.push(json.db_name);
									}
									callback();
								})
							}, function (error) {
								if (error) console.error(error.message);
								return reply(basesAccessibles);
							})
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
		description: 'POST recupération bases',
		notes: "Recupération des bases dataManager accessibles par l\'utilisateur",
		validate: {
			
		}
	}

}