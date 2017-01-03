var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');


module.exports.route = {
	method: 'POST',
	path: '/api/utilisateurs/invitation',
	handler: function (request, reply) {
		
		var mailUtilisateur = request.payload.mailUtilisateur || 'mail@utilisateur.fr';
		
		
		var data = {
			from: env.mailer_user_invitation ,
			to: mailUtilisateur ,
			subject: env.mailer_subject_invitation ,
			html: {
				path: env.mailer_invitation_html
			},
			context: {
				name: env.mailer_context_name_invitation
			}
        };

		var Mailer = request.server.plugins.mailer;
		Mailer.sendMail(data, function (err, info) {
			if(err) {
				console.log('Erreur pour l\'envoi du mail de demande de validation : ', err);
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
			
			client.query('INSERT INTO _INVITATIONS (MailUtilisateur , DateInvitation) VALUES($1 , $2)',[mailUtilisateur, d] 
			, function(err, result) {
				
				done();

				if(err) {
					return console.error('error running query', err);
				}
				reply('Invitation OK')
				.header("Authorization", request.headers.authorization);
			});
		});
		
	},
	
	config: {
		// auth: 'jwt',
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST Invitation',
		notes: 'Invite un utilisateur à rejoindre DbRequest',
		validate: {
			params: {
				
			}
		}
	}

}
