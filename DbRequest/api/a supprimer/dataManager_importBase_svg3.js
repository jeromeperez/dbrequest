var Joi = require('joi');
var HttpRequest = require('request').defaults({ jar: true });
var pg = require('pg');
var async = require('async');
var env = require('../config/env');
var funcUtil = require('../utilitaires/utilitaires');





module.exports.route = {
	method: 'POST',
	path: '/dataManager/importBase',
	handler: function (request, reply) {
		
        var name = request.payload.name || 'utilisateur';
		var password = request.payload.password || 'mot de passe';
		
		
		var urlSession = request.payload.urlSession || 'http://data.plantnet-project.org/_session';
		var urlRequete = request.payload.urlRequete || 'http://data.plantnet-project.org/dbrequest';
		var nomBaseDataManager = request.payload.nomBaseDataManager || 'dbrequest';
		
		var RequeteSurDataManager = function() {
			
			var identifiers = { name: name , password: password };
			var options = { method: 'post', body: identifiers, json: true, url: urlSession };
			
			// La première requête permet d'obtenir le cookie de session pour autoriser les autres requêtes.
			// HttpRequest se charge de conserver ce cookie et le transmet aux requêtes suivantes.
			HttpRequest(options, function (error, response, body) {
				if (!error && body.ok) {
					urlRequeteAlldocs = urlRequete + '/_all_docs?include_docs=true'
					HttpRequest(urlRequeteAlldocs, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							//console.log(body);
							var json = JSON.parse(body);
						    //console.log(json);
							ImportVersDbRequest(json);
							
							return;
						
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
		
		var ImportVersDbRequest = function(jsonBase) {
			
			var cn = {
				host: env.pg_host, // Nom du serveur ou adresse IP;
				port: env.pg_port,
				database: env.pg_database,
				user: env.pg_user,
				password: env.pg_password
		    };
			
			var d = new Date();
			var nomBaseImport = '_import_' + nomBaseDataManager + '_' + d.getFullYear() + '_' + (parseInt(d.getMonth()) + 01).toString() + '_' + d.getDate() + '_' +
			                     d.getHours() + 'h_' + d.getMinutes() + 'm_' + d.getSeconds() + 's';
			
			pg.connect(cn, function(err, client, done) {
				if(err) {
					return console.error('erreur de récupération du client depuis le pool', err);
				};
				
				client.query('DROP TABLE ' + nomBaseImport 
					, function(err, result) {
						if(err) {
						};
						client.query('CREATE TABLE ' + nomBaseImport + '(numligne integer NOT NULL, lignejsonb jsonb, ' +
                                       'CONSTRAINT "' + 'clef primaire ' + nomBaseImport + '" PRIMARY KEY (numligne)) WITH (OIDS=FALSE)'
							, function(err, result) {
								if(err) {
									return console.error('erreur creation table ', err);
								};
								async.forEachOf(jsonBase.rows, function (ligne,i,callback) {
									client.query('INSERT INTO ' + nomBaseImport + ' (numligne , lignejsonb) VALUES($1 , $2)',[ parseInt(i) + 1 , ligne ] 
									, function(err, result) {
										if(err) {
											return console.error('erreur query ', err);
										};
										callback();
									})
								}, function (err) {
									if (err) console.error(err.message);
									console.log('Chargement fichier terminé');
									// Appel de la fonction qui traite la base couchDB et génère l'SQL correspondant
									//localhost:5984/baserapha2/_design/datamanager/_list/db2sql/export?fn=baserapha2.sql&include_docs=true&fkmod=true&fkref=false&fieldprops=true&target=postgresql&mmids=_design%2Fmm_c103d7c7cbfc5f7ccadc65e7b200662a%2C_design%2Fmm_ca97b1eda4df9c4bbb92a17ad600253f%2C_design%2Fmm_c103d7c7cbfc5f7ccadc65e7b20006ec%2C_design%2Fmm_c103d7c7cbfc5f7ccadc65e7b2008fc4
									// On récupère les id des strutures
									var mmids = '';
									jsonBase.rows.forEach( function( row ) {
										if (row.hasOwnProperty('id') && row.id.match(/_design\/mm_.*/ )) {
										mmids = mmids + ' ' + row.id ;
										}
									});
									
									var req = {
										query : {
											fn : nomBaseImport + '.sql',
											include_docs : true , 
											fkmod : true , 
											fkref : true ,
											fieldprops : false ,
											target : 'postgresql',
											mmids : mmids										
										}
									};
									console.log(req);
									
									funcUtil.baseDB2SQL(nomBaseImport,req,jsonBase);
									// Appel de 'done()' pour libérer le client
									done();
									return;
								});
				
							}
				
						);
						
						
						
				    }
				);
			
				// On n'attend pas la fin du chargement de la base couchDb
				return reply(jsonBase.rows[0]);
			
			});
		};
		
		
		
		
		
		
		
		RequeteSurDataManager();
		
	},
	
	config: {
		//auth: false,
		auth: {
            strategy: 'jwt',
            scope: ['admin']
        },
		tags: ['api'],
		description: 'POST import base couchDb',
		notes: "Import une base couchDb vers PostgreSQL",
		validate: {
			
		}
	}

}