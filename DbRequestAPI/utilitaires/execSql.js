/*
 *  Utilitaires pour l'application DbRequest
 */


module.exports.ExecutionSql = function (nomNouvelleBase, nomsqlbase) {
	
		var pg = require('pg');
		var async = require('async');
		var Cursor = require('pg-cursor');
    		var env = require('../config/env');


		// on recupère l'SQL de creation
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};

		
		pg.connect(cn, function(err, client, done) {

			console.log('Début recuperation SQL') ;
			var d1 = new Date();
			console.log(d1) ;

			if(err) {
				console.log('error fetching client from pool', err);
				return console.error('error fetching client from pool', err);
			}

			client.query('SELECT lignesql FROM ' + nomsqlbase + ' ORDER BY numligne '
            		, function(err, result) {

				if(err) {
				    return console.error('erreur recuperation SQL ', err);
				}
				
				var nombreLignesTotales = result.rowCount
				console.log('nombre de ligne SQL générées') ;
				console.log(nombreLignesTotales) ;

				if (nombreLignesTotales < 10000) {
					var maxRows = 100 ;
				} else {
					var maxRows = 1000 ;
				};

				ExecuteSQL(result,maxRows)
				

				return;
			});
		
                });

    		
    

    		function ExecuteSQL(result,maxRows) {
	
		// on se connecte sur la nouvelle base pour executer l'SQL de creation

		cn.database = nomNouvelleBase;
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				console.log('error fetching client from pool', err);
				return console.error('error fetching client from pool', err);
			}
			//  json = JSON.stringify(result.rows);
			//  json2 = JSON.parse(json) ;
			var SQLcreation = '' ;
			var compteurLigneSQL = 0 ;
			var compteurPaquetLignes = 0 ;
			result.rows.forEach( function( row ) {
				if(compteurLigneSQL < maxRows) {
					//  On traite les lignes d'intructions SQL par paquet de maxRows lignes;	
					SQLcreation = SQLcreation + row.lignesql  + ' ' ;
					compteurLigneSQL = compteurLigneSQL + 1;
				} else {
					compteurPaquetLignes = compteurPaquetLignes + 1;	
					client.query( SQLcreation
            				, function(err2, result2) {
						if(err2) {
							console.error('nombre de lignes par paquet : ', maxRows);
							console.error('Paquet numéro : ', compteurPaquetLignes);
							console.error('erreur creation table nouvelle base : ', err2 , SQLcreation);
							SQLcreation = '' ;
							compteurLigneSQL = 0;
						}
						
					});
					SQLcreation = '' ;
					compteurLigneSQL = 0;
				};
			}) ;
			if(compteurLigneSQL != 0) {
					compteurPaquetLignes = compteurPaquetLignes + 1;	
					client.query( SQLcreation
            				, function(err3, result3) {
						if(err3) {
							console.error('nombre de lignes par paquet : ', maxRows);
							console.error('Paquet numéro : ', compteurPaquetLignes);
				    			console.error('erreur creation table nouvelle base : ', err3 , SQLcreation);
							SQLcreation = '' ;
							compteurLigneSQL = 0;
						};
						done();
					});
			} else {
				done();
			};
			console.log('Execution SQL Ok');
			console.error('nombre de lignes par paquet : ', maxRows);
			console.error('nombre de paquet(s) : ', compteurPaquetLignes);
			var d2 = new Date();
			console.log(d2) ;	
			
			return;
			
		});  
    		} 


};
