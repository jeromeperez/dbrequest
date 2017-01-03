var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'GET',
	path: '/api/tables/details/{id_base}',
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
			
			client.query('SELECT c.relname ,c.relname AS id ,c.oid ,a.attname ,a.attnum ,a.atttypid ,t.typname, a.atttypmod, a.attlen, a.attnum ,' +
							'a.attbyval ,a.attstorage ,a.attalign FROM pg_attribute a ,pg_class c ,pg_type t ' +
			                'WHERE a.attrelid = c.oid  AND a.attnum >= 1 AND a.atttypid = t.oid AND ' +
							'c.relname in(SELECT t.tablename FROM  pg_tables t WHERE t.schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' )' +
							'AND t.schemaname IN (\'public\' ))'
		    ,function(err, result) {
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				reply(result.rows);
			});
			
		});
		
	},
	
	config: {
		/* auth: false , */
		auth: {
            strategy: 'jwt',
            scope: ['admin' , 'redacteur']
        },
		tags: ['api'],
		description: 'GET détail tables ',
		notes: 'Renvoi les différentes colonnes des tables d\'une base passée en paramètre',
		validate: {
			params: {
				id_base: Joi.string()
					.required()
					.description('Tables\' identifiant base (_id_base)')
			}
		}
	}

}