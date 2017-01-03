var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'GET',
	path: '/api/requetes/liste/{nomBase}',
	handler: function (request, reply) {
		
		var nomBase = request.params.nomBase; // La base de données est récupérée  à partir de l'URL
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database, 
			user: env.pg_user,
			password: env.pg_password
		};
		
		pg.connect(cn, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT * FROM _REQUETES WHERE NomBase = $1 AND TagSuppression = false;',[nomBase]
			, function(err, result) {
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				// var json = JSON.stringify(result.rows);
				// reply(json);
				reply(result.rows)
				.header("Authorization", request.headers.authorization);
			});
		});
		
	},
	
	config: {
		/* auth: 'jwt',	 */
		auth: {
            strategy: 'jwt',
            scope: ['admin' , 'redacteur']
        },
		tags: ['api'],
		description: 'GET requetes liste',
		notes: 'Renvoi la liste des requetes concernant la base de données passée en paramètre',
		validate: {
			params: {
				nomBase: Joi.string()
					.required()
					.description('Requetes\' identifiant base (_nomBase)')
			}
		}
	}

}
