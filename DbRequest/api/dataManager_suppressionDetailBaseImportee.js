var Joi = require('joi');
var HttpRequest = require('request').defaults({ jar: true });
var pg = require('pg');
var async = require('async');
var env = require('../config/env');
var funcUtil = require('../utilitaires/utilitaires');
var funcUtil2 = require('../utilitaires/suiviImportation');





module.exports.route = {
	method: 'POST',
	path: '/api/dataManager/suppressionDetailBaseImportee',
	handler: function (request, reply) {
		
        	var nomBaseImportee = request.payload.nomBaseImportee || 'dbrequest';
		var dateImport = request.payload.dateImport || '_2016_01_15_12h_00m_00s';

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
			console.log(nomBaseImportee);
			console.log(dateImport);
			client.query('SELECT * FROM _importbases WHERE nombase = $1 AND extentiondate = $2 ORDER BY nombase , dateimport DESC ',[nomBaseImportee,dateImport]
			  , function(err, result) {
				if(err) {
					return console.error('error running query', err);
				}
					

				async.forEachOf(result.rows, function (ligne,i,callback) {
					console.log(ligne.nomsqlbase);
					client.query('DROP TABLE ' + ligne.nombasejson + ' ;' 
						, function(err2, result2) {
							if(err2) {
							};
							client.query('DROP TABLE ' + ligne.nomsqlbase + ' ;' 
								, function(err2, result2) {
									if(err2) {
									};
									client.query('DROP TABLE ' + ligne.nomsqlbase + 'log' +' ;' 
									, function(err2, result2) {
										if(err2) {
										};
										client.query('REVOKE CONNECT ON DATABASE ' + ligne.nombasesvg + ' FROM public ; ' +
								 		'ALTER DATABASE ' + ligne.nombasesvg + ' CONNECTION LIMIT 0 ; ' +
									 	'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() ' +
										'AND datname = \'' + ligne.nombasesvg + '\' ; ' 
										, function(err2, result2) {
											if(err2) {
											};
											client.query('DROP DATABASE ' + ligne.nombasesvg + ' ; ' 
											, function(err2, result2) {
												if(err2) {
												};
												callback();
											})	

										})
									})
							})	
							
					})
				}, function (err) {
					if (err) console.error(err.message);
					client.query('DELETE FROM _importbases WHERE nombase = $1 AND extentiondate = $2',[nomBaseImportee,dateImport]
						, function(err5, result5) {
						if(err5) {
							return console.error('error running query', err5);
						}
						console.log("supression détail importation base Ok");
						// Appel de 'done()' pour libérer le client
						done();
						return reply("Ok");
					});
				});
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
		description: 'POST suppression détail importation',
		notes: "Suppression de l'historique et de la sauvegarde d/'une importation ",
		validate: {
			
		}
	}

}
