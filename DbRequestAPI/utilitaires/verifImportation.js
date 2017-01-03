/*
 *  Utilitaires pour l'application DbRequest
 */
 
var $q = require('q');
 


	module.exports.verifImportation = function() {
    			var deferred = $q.defer();

			var pg = require('pg');
        		var env = require('../config/env');
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
			
			
				client.query('SELECT count(nombase) FROM _importbases WHERE datefinimportation IS NULL ', function(err, result) {
					// call 'done()' to release the client back to the pool
					done();
					
					console.log('Je suis dans la vérif');

					if(err) {
						return console.error('error running query', err);
					}

					if(result.rows[0].count == 0) {
						console.log('Vérification Ok, importation lancée !');
       		 				deferred.resolve("Success");
    					} else {
						console.log('Vérification en échec, une importation est en cours !');
        					deferred.reject("Error");
    					}

				});
			
			}); 

    			return deferred.promise;
		};
