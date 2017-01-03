var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'POST',
	path: '/api/dataManager/importBaseEnCours',
	handler: function (request, reply) {
		
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
			
			client.query('SELECT * FROM _importbases WHERE datefinimportation IS NULL ORDER BY nombase , dateimport DESC ', function(err, result) {
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				// var json = JSON.stringify(result.rows);
				// reply(json);
				reply(result.rows);
			});
		});
		
	
	
	},
	
	config: {
		//auth: false,
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST importations en cours base couchDb',
		notes: "Importation en cours d\'une base couchDb",
		validate: {
			
		}
	}

}
