var Joi = require('joi');
var pg = require('pg');
var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var async = require('async');
var env = require('../env');

// Pg client

var cn = {
    host: env.pg_host, // Nom du serveur ou adresse IP;
    port: env.pg_port,
    database: 'postgres',
    user: 'postgres',
    password: 'yokomo68'
};

//var client = new pg.Client(cn);

// API configuration
var default_from = env.api_default_from;

module.exports.route = {
	method: 'GET',
	path: '/tables',
	handler: function (request, reply) {
		var custom_error = {
			statusCode: 400,
			error: "Bad request",
			message: " is not allowed to be empty",
			validation: {
				source: "query",
				keys: []
			}
		};

		//var query = JSON.parse(fs.readFileSync('./api/api_species_default_query.json').toString()).query;
		

		// Query's parameters
		//var from = request.query['from'] || default_from;
		
		var conString = "postgres://postgres:yokomo68@localhost/postgres";

		pg.connect(cn, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			console.log('coucou');
			client.query('select datname, datname as id from pg_database where datistemplate = false', function(err, result) {
				//call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				console.log(result.rows[0]);
				
				var json = JSON.stringify(result.rows);
				reply(json);
				console.log(json);
				
				client.end();
			});
		});
		
		
		
		
	//client.query('select datname, datname as id from pg_database where datistemplate = false', function(err, result) {

	        // handle an error from the query
	  //      if(handleError(err)) return;

	        // return the client to the connection pool for other requests to reuse
	    //    done();
	     //   var json = JSON.stringify(result.rows);
	      //  res.writeHead(200, {'content-type':'application/json', 'content-length':Buffer.byteLength(json)}); 
	      //  res.end(json);
		

		
	//	}
	//client.query('select datname, datname as id from pg_database where datistemplate = false').then(function (resp) {
	//		if (!resp.found) {
	//			reply(resp).code(404);
	//		} else {
	//			reply(resp);
	//		}
	//	}, function (err) {
	//		console.log(err.message);
	//	});	
	
	
	// client.connect(function(err) {
  // if(err) {
    // return console.error('could not connect to postgres', err);
  // }
  // client.query('select datname, datname as id from pg_database where datistemplate = false', function(err, result) {
    // if(err) {
      // return console.error('error running query', err);
    // }
    // var json = JSON.stringify(result.rows);
	// reply(json);
	// return console.log(json);
    // client.end();
	// done();
  // });
// });



//	Queries after any operations
// var postQueries = [
    // 'select datname, datname as id from pg_database where datistemplate = false'
// ];


// /**
// * Runs post queries
// */
// var post = function(callback) {
// console.log('-------------------------------------------------');
   // console.log('POST'.yellow);
     // exports.execQueries(postQueries, callback);
// }

	
	
	// exports.execQueries = function(queries, next) {
     // async.eachSeries(queries, function(q, callback) {
         // pg.connect(env.pg_BD, function(err, client, done) {
             // if(err) {
                 // console.log(err);
                 // callback('Error fetching client from pool');
                 // return;
             // }
             // client.query(q, function(err, result) {
				// done();//call 'done()' to release the client back to the pool
	
				// if(err) {
					// console.log(err);
					// callback('Error running query');
					// return;
					// } else {
                     // callback();
					// }
             // });
         // });
     // },
     // function(error) {
         // if (error) {
             // console.log(error.red);
         // }
         // next();
     // });
// }

	
	 },
	config: {
		tags: ['api'],
		description: 'Get tables liste',
		notes: 'Retourne la liste des tables',
		validate: {
			query: {
				
		}
	}
}

}