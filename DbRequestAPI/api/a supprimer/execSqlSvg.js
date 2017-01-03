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
				done();
				if(err) {
				    return console.error('erreur recuperation SQL ', err);
				}
				console.log('recuperation SQL Ok') ;
				var d1 = new Date();
				console.log(d1) ;
				ExecuteSQL(result) ;
				return;
			});
			
			
                });

    
    

    		function ExecuteSQL(result) {
	
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
			result.rows.forEach( function( row ) {
					
				    SQLcreation = SQLcreation + row.lignesql  + ' ' ;
			}) ;	
			
			client.query( SQLcreation
            		, function(err, result) {
		
				if(err) {
				    return console.error('erreur creation table nouvelle base ', err);
				}
				console.log('Execution SQL Ok');
				var d2 = new Date();
				console.log(d2) ;
				
				done();
				return;
			});
		});  
    		} 


};
