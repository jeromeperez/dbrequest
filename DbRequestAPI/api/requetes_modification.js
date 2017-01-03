var Joi = require('joi');
var pg = require('pg');
var env = require('../config/env');
var JWT = require('jsonwebtoken');
var funcUtil = require('../utilitaires/utilitaires');

module.exports.route = {
	method: 'POST',
	path: '/api/requetes/modification',
	handler: function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};

		var nomBase = request.payload.nomBase || 'base' ;
		var requeteId = request.payload.requeteId || '0' ;
                var tablesSelectionnees = request.payload.tablesSelectionnees || ['table'] ;
		var detailsRequeteChamps = request.payload.detailsRequeteChamps || ['champ'] ;
		var detailsRequeteSelection = request.payload.detailsRequeteSelection || ['selection'] ;
		var detailsRequeteJointure = request.payload.detailsRequeteJointure || ['jointure'] ;
		var detailsRequeteTri = request.payload.detailsRequeteTri || ['tri'] ;
		var detailsRequeteGroupBy = request.payload.detailsRequeteGroupBy || ['groupBy'] ;
		var detailsRequeteScript = request.payload.detailsRequeteScript || ['script'] ;

		var d = new Date();
	
			pg.connect(cn, function(err, client, done) {
		
				if(err) {
				return console.error('error fetching client from pool', err);
				}
				// Vérification de l'entête de la requête
				client.query('SELECT IdRequete FROM _REQUETES WHERE IdRequete = $1', [requeteId] ,
				  function(err, result) {
			
					if(err) {
						return console.error('error running query', err);
					}
					
					// Suppression des anciennes lignes de détail
					client.query('DELETE FROM _REQUETES_CHAMPS WHERE IdRequete = $1', [requeteId] ,
				          function(err1, result1) {
					    if(err1) {
					      return console.error('error running query1', err1);
					    } ;
					    client.query('DELETE FROM _REQUETES_SELECTION WHERE IdRequete = $1', [requeteId] ,
					      function(err2, result2) {
					        if(err2) {
					          return console.error('error running query2', err2);
					        } ;
					        client.query('DELETE FROM _REQUETES_TRI WHERE IdRequete = $1', [requeteId] ,
					          function(err3, result3) {
					        	if(err3) {
					        	  return console.error('error running query3', err3);
					        	} ;
					        	client.query('DELETE FROM _REQUETES_JOINTURE WHERE IdRequete = $1', [requeteId] ,
					        	  function(err4, result4) {
					        		if(err4) {
					        		  return console.error('error running query4', err4);
					        		} ;
					        		client.query('DELETE FROM _REQUETES_GROUPBY WHERE IdRequete = $1', [requeteId] ,
							      	  function(err11, result11) {
							        	if(err11) {
							      	  	  return console.error('error running query11', err11);
							    		} ;					    	
							    		client.query('DELETE FROM _REQUETES_SCRIPT WHERE IdRequete = $1', [requeteId] ,
							    		  function(err5, result5) {
							    			if(err5) {
							    			  return console.error('error running query5', err5);
							    			} ;
					// Insertion des nouvelles lignes de détail
					for (var i = 0; i < detailsRequeteChamps.length; i++) {
					 client.query('INSERT INTO _REQUETES_CHAMPS (idrequete , idchamp , nomchamp , nomtable , agregateur , alias)' +
						' VALUES($1 , $2 , $3 , $4 , $5 , $6)',
						[requeteId , detailsRequeteChamps[i].idchamp , detailsRequeteChamps[i].nomchamp ,
						detailsRequeteChamps[i].nomtable , detailsRequeteChamps[i].agregateur, detailsRequeteChamps[i].alias],
					  function(err6, result6) {

						if(err6) {
							return console.error('error running query6', err6);
						} ;
					  } 
					 ) ;	
					} ;
					for (var i = 0; i < detailsRequeteSelection.length; i++) {
					 client.query('INSERT INTO _REQUETES_SELECTION (idrequete , idselection , nomchamp , nomtable , ' +
						' operateur , valeur , valeurnomchamp , valeurnomtable , connecteur )' +
						' VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9)',
						[requeteId , detailsRequeteSelection[i].idselection , detailsRequeteSelection[i].nomchamp ,
						detailsRequeteSelection[i].nomtable , detailsRequeteSelection[i].operateur , detailsRequeteSelection[i].valeur ,
						detailsRequeteSelection[i].valeurnomchamp , detailsRequeteSelection[i].valeurnomtable , 
						detailsRequeteSelection[i].connecteur] ,
					  function(err7, result7) {

						if(err7) {
							return console.error('error running query7', err7);
						} ;
					  } 
					 ) ;	
					} ;
					for (var i = 0; i < detailsRequeteTri.length; i++) {
					 client.query('INSERT INTO _REQUETES_TRI (idrequete , idtri , nomchamp , nomtable , ordre )' +
						' VALUES($1 , $2 , $3 , $4 , $5)',
						[requeteId , detailsRequeteTri[i].idtri , detailsRequeteTri[i].nomchamp ,
						detailsRequeteTri[i].nomtable , detailsRequeteTri[i].ordre],
					  function(err8, result8) {

						if(err8) {
							return console.error('error running query8', err8);
						} ;
					  } 
					 ) ;	
					} ;
					for (var i = 0; i < detailsRequeteJointure.length; i++) {
					 client.query('INSERT INTO _REQUETES_JOINTURE (idrequete , idjointure , nomchampsource , nomtablesource , ' +
						' typedejointure , nomchampdestination , nomtabledestination )' +
						' VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7)',
						[requeteId , detailsRequeteJointure[i].idjointure , detailsRequeteJointure[i].nomchampsource ,
						detailsRequeteJointure[i].nomtablesource , detailsRequeteJointure[i].typedejointure ,
						detailsRequeteJointure[i].nomchampdestination , detailsRequeteJointure[i].nomtabledestination],
					  function(err9, result9) {

						if(err9) {
							return console.error('error running query9', err9);
						} ;
					  } 
					 ) ;	
					} ;
					for (var i = 0; i < detailsRequeteGroupBy.length; i++) {
					 client.query('INSERT INTO _REQUETES_GROUPBY (idrequete , idgroupby , nomchamp , nomtable )' +
						' VALUES($1 , $2 , $3 , $4 )',
						[requeteId , detailsRequeteGroupBy[i].idgroupby , detailsRequeteGroupBy[i].nomchamp ,
						detailsRequeteGroupBy[i].nomtable ],
					  function(err12, result12) {

						if(err12) {
							return console.error('error running query12', err12);
						} ;
					  } 
					 ) ;	
					} ;
					// Insertion des nouvelles lignes de script
					for (var i = 0; i < detailsRequeteScript.length; i++) {
					console.log(detailsRequeteScript[i]) ;
					 client.query('INSERT INTO _REQUETES_SCRIPT (idrequete , idlignescript , lignescript)' +
						' VALUES($1 , $2 , $3)',
						[requeteId , i + 1 , detailsRequeteScript[i]],
					  function(err10, result10) {

						if(err10) {
							return console.error('error running query10', err10);
						} ;
					  } 
					 ) ;	
					} ;
	
					client.query('UPDATE  _REQUETES SET datemodification = $1  WHERE IdRequete = $2' ,[d , requeteId ],
					   function(err11, result11) {
						done();
						if(err11) {
						  return console.error('error running query11', err11);
						}
						
						return reply(null);
						
					            });
					          });	
					        });	
					      });
					    });	
					  });		
					});
					return;
				});
			});  /* fin  pg.connect */
	}, /* fin  handler */
	
	config: {
		auth: {
            		strategy: 'jwt',
            		scope: ['admin' , 'redacteur']
        	},
		tags: ['api'],
		description: 'POST modification requête',
		notes: "Modifier une requête",
		validate: {
			
		}
	}

}
