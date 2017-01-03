var Joi = require('joi');
var pg = require('pg');
var env = require('../env');

module.exports.route = {
	method: 'GET',
	path: '/tables/{id}',
	handler: function (request, reply) {
		// Query's parameters
		var id = request.params.id;

		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: id,
			user: env.pg_user,
			password: env.pg_password
		};
		
		pg.connect(cn, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('select datname, datname as id from pg_database where datistemplate = false', function(err, result) {
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				// var json = JSON.stringify(result.rows);
				// reply(json);
				reply(result.rows);
				
				client.end();
			});
		});
	},
	config: {
		tags: ['api'],
		description: 'GET tables',
		notes: 'Renvoi la liste des tables de la base de données passée en paramètre',
		validate: {
			params: {
				id: Joi.string()
					.required()
					.min(1)
					.description('Table\' identifiant (_id)')
			}
		}
	}
};