var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'GET',
	path: '/api/tables/liste/{id_base}',
	handler: function (request, reply) {
		
		var id_base = request.params.id_base; // La base de données est récupérée  à partir de l'URL
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: id_base, // La base de donnée est celle passée en paramètre
			user: env.pg_user,
			password: env.pg_password
		};
		
		pg.connect(cn, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT tablename, tablename as id FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )'
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
		description: 'GET tables liste',
		notes: 'Renvoi la liste des tables de la base de données passée en paramètre',
		validate: {
			params: {
				id_base: Joi.string()
					.required()
					.description('Tables\' identifiant base (_id_base)')
			}
		}
	}

}