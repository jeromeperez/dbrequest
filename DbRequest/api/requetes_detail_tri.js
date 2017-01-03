var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');

module.exports.route = {
	method: 'POST',
	path: '/api/requetes/detail/tri',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		var idRequete = request.payload.idRequete || 0 ;
		
		var d = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
			
				client.query('SELECT * FROM _REQUETES_TRI WHERE IdRequete = $1;',
			    		[idRequete],
				function(err, result) {
					done();
					
					if(err) {
						return console.error('error running query', err);
					}
						
				    return reply(result.rows);
					
				});
			});	
	
	},
	
	config: {
		auth: {
            strategy: 'jwt',
            scope: ['admin' , 'redacteur']
        },
		tags: ['api'],
		description: 'POST détail requête tri',
		notes: "Détail de la clause ORDER d\'une requête. ",
		validate: {
			
		}
	}

}
