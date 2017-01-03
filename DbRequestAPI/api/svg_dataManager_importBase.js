var Joi = require('joi');
var HttpRequest = require('request').defaults({ jar: true });
var pg = require('pg');
var async = require('async');
var env = require('../config/env');
var funcUtil = require('../utilitaires/utilitaires');
var funcUtil2 = require('../utilitaires/suiviImportation');





module.exports.route = {
	method: 'POST',
	path: '/api/dataManager/importBase',
	handler: function (request, reply) {
		
        var name = request.payload.name || 'utilisateur';
		var password = request.payload.password || 'mot de passe';
		
		
		var urlSession = request.payload.urlSession || 'http://data.plantnet-project.org/_session';
		var urlRequete = request.payload.urlRequete || 'http://data.plantnet-project.org';
		var nomBaseDataManager = request.payload.nomBaseDataManager || 'dbrequest';
		var tableauMmids = request.payload.structuresAImporter || [];
		var monNouvelleBase = request.payload.monNouvelleBase || 'newdbrequest';
		var mmids = tableauMmids.toString();
		
		
		
		
		
		var RequeteSurDataManager = function() {
			
			var identifiers = { name: name , password: password };
			var options = { method: 'post', body: identifiers, json: true, url: urlSession };
			
			// La première requête permet d'obtenir le cookie de session pour autoriser les autres requêtes.
			// HttpRequest se charge de conserver ce cookie et le transmet aux requêtes suivantes.
			HttpRequest(options, function (error, response, body) {
				if (!error && body.ok) {
					urlRequeteAlldocs = urlRequete + '/' + nomBaseDataManager + '/_all_docs?&include_docs=true';
					console.log(urlRequeteAlldocs);
					HttpRequest(urlRequeteAlldocs, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							//console.log(body);
							var json = JSON.parse(body);
						    //console.log(json);
							console.log('Téléchargement fichier CouchDb Ok');
							console.log('Début chargement fichier CouchDb dans PostgreSQL');
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
			Number.prototype.formatNombre = function(size) {
				var s = String(this);
				while (s.length < (size || 2)) {s = "0" + s;}
				return s;
			}
			var d = new Date();
			var extentionDate = '_' + d.getFullYear() + '_' + (parseInt(d.getMonth()) + 01).formatNombre() + '_' + d.getDate().formatNombre() + '_' + d.getHours().formatNombre() + 'h_' + d.getMinutes().formatNombre() + 'm_' + d.getSeconds().formatNombre() + 's';
			var nomBaseImport = '_' + monNouvelleBase + extentionDate + '_' + 'couchdb';
			
			funcUtil2.suiviImportation('creationJsonBase', nomBaseDataManager, mmids, monNouvelleBase, extentionDate);
			
			/* setTimeout(function(){funcUtil.suiviImportation('creationJsonBaseOk', nomBaseDataManager, mmids, monNouvelleBase, extentionDate, d)},3000);
			setTimeout(function(){funcUtil.suiviImportation('creationSQLBaseOk', nomBaseDataManager, mmids, monNouvelleBase, extentionDate, d)},4000);
			setTimeout(function(){funcUtil.suiviImportation('SauvegardeBaseOk', nomBaseDataManager, mmids, monNouvelleBase, extentionDate, d)},5000); */
			
			pg.connect(cn, function(err, client, done) {
				if(err) {
					return console.error('erreur de récupération du client depuis le pool', err);
				};
				
				client.query('DROP TABLE ' + nomBaseImport 
					, function(err, result) {
						if(err) {
						};
						// client.query('CREATE TABLE ' + nomBaseImport + '(numligne integer NOT NULL, lignejsonb jsonb, ' +
						client.query('CREATE TABLE ' + nomBaseImport + '(numligne integer NOT NULL, lignejsonb text, ' +
                                       'CONSTRAINT "' + 'clef primaire K' + extentionDate + '" PRIMARY KEY (numligne)) WITH (OIDS=FALSE)'
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
									funcUtil2.suiviImportation('creationJsonBaseOk', nomBaseDataManager, mmids, monNouvelleBase, extentionDate)
									console.log('Chargement fichier terminé');
									// Appel de la fonction qui traite la base couchDB et génère l'SQL correspondant
									//localhost:5984/baserapha2/_design/datamanager/_list/db2sql/export?fn=baserapha2.sql&include_docs=true&fkmod=true&fkref=false&fieldprops=true&target=postgresql&mmids=_design%2Fmm_c103d7c7cbfc5f7ccadc65e7b200662a%2C_design%2Fmm_ca97b1eda4df9c4bbb92a17ad600253f%2C_design%2Fmm_c103d7c7cbfc5f7ccadc65e7b20006ec%2C_design%2Fmm_c103d7c7cbfc5f7ccadc65e7b2008fc4
									// On récupère les id des strutures
									// var mmidsold = '' ;
									// jsonBase.rows.forEach( function( row ) {
										// if (row.hasOwnProperty('id') && (row.id.match(/_design\/mm_.*/ ) || row.id.match(/mm_.*/))) {
										// console.log('row ::::');		
										// if (row.type == 'mm') { console.log('yes!')};	
										// mmidsold = mmidsold + row.id + ',';
										// }
									// });
									// mmidsold = mmidsold + ' ';
									// console.log(mmidsold);
									// console.log(mmids);
									
									
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
									
									funcUtil.baseDB2SQL(nomBaseDataManager, monNouvelleBase, extentionDate, req);
									// funcUtil.suiviImportation('creationSQLBaseOk', nomBaseDataManager, mmids, monNouvelleBase, extentionDate, d);
									// funcUtil.creationBaseDbRequest(monNouvelleBase, extentionDate);
									// funcUtil.suiviImportation('SauvegardeBaseOk', nomBaseDataManager, mmids, monNouvelleBase, extentionDate, d);
									
									// Appel de 'done()' pour libérer le client
									done();
									return;
								});
				
							}
				
						);
						
						
						
				    }
				);
			
				// On n'attend pas la fin du chargement de la base couchDb
				return reply({"reponse":["Tout"," va" ," bien"]});
			
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
