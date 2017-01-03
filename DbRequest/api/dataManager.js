var Joi = require('joi');
var HttpRequest = require('request').defaults({ jar: true });
var env = require('../config/env');

module.exports.route = {
	method: 'POST',
	path: '/api/dataManager',
	handler: function (request, reply) {
		
        var name = request.payload.name || 'utilisateur';
		var password = request.payload.password || 'mot de passe';
		
		
		var urlSession = request.payload.urlSession || 'http://data.plantnet-project.org/_session';
		var urlRequete = request.payload.urlRequete || 'http://data.plantnet-project.org/dbrequest/';
		var requete = request.payload.requete || '_design/mm_21ae80a2b24bbfdee73ce4a3b40011a0';
		
		var RequeteSurDataManager = function() {
			
			var identifiers = { name: name , password: password };
			var options = { method: 'post', body: identifiers, json: true, url: urlSession };
			
			// La première requête permet d'obtenir le cookie de session pour autoriser les autres requêtes.
			// HttpRequest se charge de conserver ce cookie et le transmet aux requêtes suivantes.
			HttpRequest(options, function (error, response, body) {
				if (!error && body.ok) {
					HttpRequest(urlRequete + requete, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							var json = JSON.parse(body);
							console.log(json);
							return reply(json);
            
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
		// auth: false,
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST connection dataManager',
		notes: "Identifie l\'utilisateur et execute la requete",
		validate: {
			
		}
	}

}