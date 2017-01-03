var Hapi = require('hapi');
var Good = require('good');
var pg   = require('pg');

var hapiAuthJWT = require('hapi-auth-jwt2');
var JWT         = require('jsonwebtoken');
var Handlebars  = require('handlebars');
var Path        = require('path');

var pack = require('./package');
var api  = require('./api/api');

var env    = require('./config/env');
var secret = env.secret;




var validate = function (decoded, request, callback) {
  /* console.log(" - - - - - - - decoded token:");
  console.log(decoded);
  console.log(" - - - - - - - request info:");
  console.log(request.info);
  console.log(" - - - - - - - user agent:");
  console.log(request.headers['user-agent']); */

  // On verifie que l'utilisateur renseigné par le token est valide 
  
  var utilisateurConnecte = decoded || {};
  
  var utilisateurOk = function (request, reply) {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		
        var nomUtilisateur = utilisateurConnecte.NomUtilisateur || 'utilisateur';
		var scope = utilisateurConnecte.Scope || 'scope';
		console.log('token nomUtilisateur OK', utilisateurConnecte.NomUtilisateur);
		console.log('token scope OK', utilisateurConnecte.Scope);
	
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT COUNT(*) FROM _UTILISATEURS WHERE NomUtilisateur = $1 and scope = $2 and actif = true',[nomUtilisateur , scope], function(err, result) {
				
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				return reply(result.rows);
			});
		});
		
		
	};
  
  if (utilisateurOk) {	  
    
    return callback(null, true,utilisateurConnecte);
  }
  else {
    return callback(null, false,utilisateurConnecte);
  }
};


// Server configuration
var server = new Hapi.Server();
server.connection({ port: env.port , routes: {cors: true} });


// API documentation
var swagger_options = {
	apiVersion: pack.version,
	basePath: server.info.uri,
	documentationPath: '/',
	info: {
		title: pack.name,
		description: pack.description
	}
};

server.register({
	register: require('hapi-swagger'),
	options: swagger_options
}, function (err) {
	if (err) {
		server.log(['error'], 'Plugin "hapi-swagger" load error: ' + err);
	} else {
		server.log(['start'], 'Swagger interface loaded');
	}
});


server.register(hapiAuthJWT, function (err) {
  if(err){
    console.log(err);
  }
  // sheme et strategie
  server.auth.strategy('jwt', 'jwt', true,
  { key: secret,  validateFunc: validate,
    verifyOptions: { ignoreExpiration: true }
  });

// Routes
for (var i = 0; i < api.config.length; i++) {
	var ressource = require('./api/' + api.config[i]);
	server.route(ressource.route);
}

});

// Mail
var mailer_options = {
    transport: {
        service: env.mailer_service ,
        auth: {
	    secure: true,
            user: env.mailer_user,
            pass: env.mailer_password
        }
    },
    views: {
        engines: {
            html: {
                module: Handlebars.create(),
                path: Path.join(__dirname, env.mailer_path)
            }
        }
    }
};

server.register({
	register: require('hapi-mailer'),
	options: mailer_options
}, function (err) {
	if (err) {
		console.log('Plugin "hapi-mailer" load error: ' , err);
		server.log(['error'], 'Plugin "hapi-mailer" load error: ' + err);
	} else {
		console.log('Mailer interface loaded');
		server.log(['start'], 'Mailer interface loaded');
	}
});





// Lab (test utility) doesn't need a running server
if (!module.parent) {
	server.register({
		register: Good,
		options: {
			reporters: [{
				reporter: require('good-console'),
				args:[{
					log: '*',
					response: '*'
				}]
			}]
		}
	}, function (err) {
		if (err) {
			throw err;
		}
		server.start(function () {
			server.log('info', 'Server running at: ' + server.info.uri);
		});
	});
}

// Expose server for Lab
module.exports = server;
