var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');


module.exports.route = {
	method: 'POST',
	path: '/api/utilisateurs/validationcompte',
	handler: function (request, reply) {
		
		var mailUtilisateur = request.payload.mailUtilisateur || 'mail@utilisateur.fr';
		
		
		var data = {
			from: env.mailer_user_validation ,
			to: mailUtilisateur ,
			subject: env.mailer_subject_validation ,
			html: {
				path: env.mailer_validation_html
			},
			context: {
				name: env.mailer_context_name_validation
			}
        };

		var Mailer = request.server.plugins.mailer;
		Mailer.sendMail(data, function (err, info) {
			if(err) {
				console.log('Erreur pour l\'envoi du mail de validation : ', err);
				return;
			}
		});
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		
		var d = new Date();
		
		pg.connect(cn, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('UPDATE _UTILISATEURS SET datevalidationinscription = $1 WHERE MailUtilisateur = $2',[d, mailUtilisateur] 
			, function(err, result) {
				
				done();

				if(err) {
					return console.error('error running query', err);
				}
				reply('Validation OK')
				.header("Authorization", request.headers.authorization);
			});
		});
		
	},
	
	config: {
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST Validation',
		notes: 'Validation d\'un utilisateur DbRequest',
		validate: {
			params: {
				
			}
		}
	}

}


