/*
 *  Utilitaires pour l'application DbRequest
 */
 
 


module.exports.suiviImportation = function (etape, nomBaseDataManager, mmids, nomNouvelleBase, extentionDate) {
	
	var pg = require('pg');
        var env = require('../config/env');
	var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		
	var nombasejson = '_' + nomNouvelleBase + extentionDate + '_' + 'couchdb';
        var nomsqlbase = '_' + nomNouvelleBase + extentionDate + '_' + 'sql';
	var nombasesvg = '_' + nomNouvelleBase + extentionDate + '_' + 'svg';
	var maintenant = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			
			if (etape == 'creationJsonBase') {
			
			    client.query('INSERT INTO _IMPORTBASES (nombase, detailstructuresimportees, nomnouvellebase, extentionDate, dateimport, nombasejson, basejsonok, sqlbaseok, svgok) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
				    [nomBaseDataManager, mmids, nomNouvelleBase,extentionDate, maintenant, nombasejson, false, false, false], function(err, result) {
		
				    // call 'done()' to release the client back to the pool
				    done();

				    if(err) {
				        return console.error('error running query', err);
				    }
				
				    return;
			    });
			
			}
			
			if (etape == 'creationJsonBaseOk') {
			
			    client.query('UPDATE _IMPORTBASES SET basejsonok = $4 , nomsqlbase = $5 , datebasejsonok = $6 WHERE nombase = $1 AND nomnouvellebase = $2 AND extentionDate = $3',
				    [nomBaseDataManager, nomNouvelleBase, extentionDate, true, nomsqlbase, maintenant], function(err, result) {
		
				    // call 'done()' to release the client back to the pool
				    done();

				    if(err) {
				        return console.error('error running query', err);
				    }
				
				    return;
			    });
			
			}
			
			if (etape == 'creationSQLBaseOk') {
			
			    client.query('UPDATE _IMPORTBASES SET sqlbaseok = $4 , nombasesvg = $5 , datesqlbaseok = $6 WHERE nombase = $1 AND nomnouvellebase = $2 AND extentionDate = $3',
				    [nomBaseDataManager, nomNouvelleBase, extentionDate, true, nombasesvg, maintenant], function(err, result) {
		
				    // call 'done()' to release the client back to the pool
				    done();

				    if(err) {
				        return console.error('error running query', err);
				    }
				
				    return;
			    });
			
			}
			
			if (etape == 'SauvegardeBaseOk') {
			
			    client.query('UPDATE _IMPORTBASES SET svgok = $4  , datefinimportation = $5 WHERE nombase = $1 AND nomnouvellebase = $2 AND extentionDate = $3',
				    [nomBaseDataManager, nomNouvelleBase, extentionDate, true,  maintenant], function(err, result) {
		
				    // call 'done()' to release the client back to the pool
				    done();

				    if(err) {
				        return console.error('error running query', err);
				    }
				
				    return;
			    });
			
			}
			
		}); 
	 
	 
	 
	 
	 
} ;

module.exports.logDesErreurs = function (logErr, nomNouvelleBase, extentionDate) {
	
	var pg = require('pg');
        var env = require('../config/env');
	var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
	};
	

	var nomsqllog = '_' + nomNouvelleBase + extentionDate + '_' + 'sqllog';
	var maintenant = new Date();
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('INSERT INTO '+ nomsqllog+' (dateLog,ligneLog) VALUES($1, $2)' ,
					[maintenant, logErr] ,
					function(err2, result2) {
						done();
						if(err2) {
							return console.error('error running query', err2);
						} ;
			}) ;    
			
		}) ;	
			 
} ;



module.exports.validationRequete = function (requeteId) {
	
	var pg = require('pg');
        var env = require('../config/env');
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
			client.query('UPDATE _REQUETES SET validation = $1 , datevalidation = $2  WHERE idrequete = $3' ,
					[true , d , requeteId] ,
					function(err2, result2) {
						done();
						if(err2) {
							return console.error('error running query', err2);
						} ;
			}) ;
                }) ;
} ;
