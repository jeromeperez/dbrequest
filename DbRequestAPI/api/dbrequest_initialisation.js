var Joi = require('joi');
var pg = require('pg');
var JWT = require('jsonwebtoken');
var env = require('../config/env');
var nomBase = '_dbrequest';


module.exports.route = {
	method: 'GET',
	path: '/api/dbrequest/init/{drop}',
	handler: function (request, reply) {
		
		var drop = request.params.drop; // Ecrasement des données précédentes
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database_init,
			user: env.pg_user_init,
			password: env.pg_password_init
		};
		
    		
    		var baseExiste = false ;
	
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT datname FROM pg_database WHERE datistemplate = false AND datname = $1',[nomBase]
            		, function(err, result) {
		
				if(err) {
				    return console.error('erreur : ', err);
				}
				if (result.rowCount > 0) {
					baseExiste = true ;
				}	
				console.log('la base existe : ' , baseExiste)
				if (baseExiste) {
				    if (drop) {
					var d = new Date();
					Number.prototype.formatNombre = function(size) {
						var s = String(this);
						while (s.length < (size || 2)) {s = "0" + s;}
						return s;
					}
					var extentionDate = '_' + d.getFullYear() + '_' + (parseInt(d.getMonth()) + 01).formatNombre() + '_' + d.getDate().formatNombre() + '_' + d.getHours().formatNombre() + 'h_' + d.getMinutes().formatNombre() + 'm_' + d.getSeconds().formatNombre() + 's';
					var nomBaseSvg = nomBase + '_svg' + extentionDate ;
					client.query('REVOKE CONNECT ON DATABASE ' + nomBase + ' FROM public ; ' +
								 'ALTER DATABASE ' + nomBase + ' CONNECTION LIMIT 0 ; ' +
								 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = \'' + 									    nomBase + '\' ; ' + 
								 'ALTER DATABASE ' + nomBase + ' RENAME TO ' + nomBaseSvg + ' ; '
                    			, function(err, result) {
						if(err) {
						return console.error('erreur rename ancienne base ', err);
						}
						console.log('sauvegarde ancienne base Ok')
						done();
						creationBase();
						return reply();
					});
				    } else {
					    done();
					    creationFichiers();
					    return reply();
				    };
				} else {
					done();
					creationBase();
					return reply();
				}
			});
		

		});
	
	 

	},



	config: {
		auth: false,
		tags: ['api'],
		description: 'GET init dbrequest',
		notes: 'Initialisation des fichiers systeme de dbrequest',
		validate: {
			params: {
				drop: Joi.boolean()
					.default('false')
					.required()
					.description('Init\' remplacement des fichiers (true/false)')
			}
		}
	}

}


function creationBase() {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database_init,
			user: env.pg_user_init,
			password: env.pg_password_init
		};


		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				console.log('error fetching client from pool', err);
				return console.error('error fetching client from pool', err);
			}
			
			client.query('CREATE DATABASE ' + nomBase + ' WITH OWNER = ' + env.pg_user_init + ' ENCODING = \'UTF8\' TABLESPACE = pg_default ' +
			 'CONNECTION LIMIT = -1'
            		, function(err, result) {
				done();
				if(err) {
				    return console.error('erreur creation nouvelle base ', err);
				}
				console.log('construction nouvelle base Ok')
				creationFichiers();
				return;
			});
		});      
} 

function creationFichiers() {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: nomBase,
			user: env.pg_user_init,
			password: env.pg_password_init
		};
		

		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				console.log('error fetching client from pool', err);
				return console.error('error fetching client from pool', err);
			};

			
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_utilisateurs']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_utilisateurs',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _utilisateurs ' +
							'(nomutilisateur character varying(15) NOT NULL, ' +
  							'motdepasse character varying(256) NOT NULL, ' +
  							'mailutilisateur character varying(50) NOT NULL, ' +
  							'tokenutilisateur character varying(256), ' +
  							'actif boolean, ' +
  							'dateinscription timestamp without time zone, ' +
  							'datevalidationinscription timestamp without time zone, ' +
  							'datederniereconnexion timestamp without time zone, ' +
  							'droitlecture boolean, ' +
  							'droitecriture boolean, ' +
  							'droitadmin boolean,  ' +
  							'scope character varying(60),  ' +
							'langueutilisateur character varying(2),  ' +
  							'CONSTRAINT utilisateurs_pkey PRIMARY KEY (mailutilisateur), ' +
  							'CONSTRAINT utilisateurs_mailutilisateur_check CHECK (mailutilisateur::text <> \'\'::text)) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _utilisateurs OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _utilisateurs.nomutilisateur IS \'Nom de l\'\'utilisateur\'; ' +
							'COMMENT ON COLUMN _utilisateurs.motdepasse IS \'Mot de passe\'; ' +
							'COMMENT ON COLUMN _utilisateurs.mailutilisateur IS \'Mail de l\'\'utilisateur\'; ' +
							'COMMENT ON COLUMN _utilisateurs.tokenutilisateur IS \'Jeton de l\'\'utilisateur\'; ' +
							'COMMENT ON COLUMN _utilisateurs.actif IS \'Atif / NonActif\'; ' +
							'COMMENT ON COLUMN _utilisateurs.dateinscription IS \'Date inscription\'; ' +
							'COMMENT ON COLUMN _utilisateurs.datevalidationinscription IS \'validation de l\'\'inscription\'; ' +
							'COMMENT ON COLUMN _utilisateurs.datederniereconnexion IS \'Dernière connexion\'; ' +
							'COMMENT ON COLUMN _utilisateurs.droitlecture IS \'Droit en lecture\'; ' +
							'COMMENT ON COLUMN _utilisateurs.droitecriture IS \'Droit en ecriture\'; ' +
							'COMMENT ON COLUMN _utilisateurs.droitadmin IS \'Droit d\'\'aministration\'; ' +
							'COMMENT ON COLUMN _utilisateurs.scope IS \'Scope de l\'\'utilisateur\'; ' +
							'COMMENT ON COLUMN _utilisateurs.langueutilisateur IS \'Langue de l\'\'utilisateur\'; '
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_utilisateurs : ', err);
							}
						console.error('Creation fichier : ','_utilisateurs',' Ok');
						var mailUtilisateur = 'amap.dbrequest@gmail.com';
        					var nomUtilisateur = 'admin';
						var motDePasse = '772ed69de3e474a2b12671a121beef37bfc0cb9fe3a93bec03cb654bb6aafee9';
						var langueUtilisateur = 'fr';
		
						var secret = env.secret; 
						var utilisateur = {
							NomUtilisateur : nomUtilisateur,
							scope: ['lecteur' , 'redacteur' , 'admin']
						};
						var tokenUtilisateur = JWT.sign(utilisateur, secret); 
						var d = new Date();


						client.query('INSERT INTO _UTILISATEURS (NomUtilisateur , MotDePasse , MailUtilisateur , TokenUtilisateur ,' + 									' Actif ,dateinscription,datevalidationinscription,datederniereconnexion, DroitLecture ,' + 									' DroitEcriture ,DroitAdmin , scope , LangueUtilisateur) ' +
								' VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9, $10, $11, $12, $13)' ,
								[nomUtilisateur , motDePasse , mailUtilisateur, tokenUtilisateur , true, d, null, d, true, true, true, 'lecteur redacteur admin', langueUtilisateur],
			
						function(err, result) {
			
								if(err) {
									return console.error('erreur création super utilisateur admin', err);
								}
				
							console.error('création super utilisateur admin',' Ok');
						});

					});
				} else {
						console.error('Creation fichier : ','_utilisateurs',' Le fichier existe déja !');
				}
			});

			
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_basesdbrequestexclues']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_basesdbrequestexclues',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _basesdbrequestexclues ' +
							'(nombaseexclue character varying(30) NOT NULL)' +
                                   	             	' WITH (OIDS=FALSE);' +
							' ALTER TABLE _basesdbrequestexclues OWNER TO ' + env.pg_user_init + ';' +
							' COMMENT ON COLUMN _basesdbrequestexclues.nombaseexclue IS \'Nom de la base à exclure\';'
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_basesdbrequestexclues : ', err);
							}
						console.error('Creation fichier : ','_basesdbrequestexclues',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_basesdbrequestexclues',' Le fichier existe déja !');
				}
			});
			
		
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_importbases']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_importbases',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _importbases ' +
  							'(nombase character varying(512) NOT NULL, ' +
  							'nomnouvellebase character varying(512) NOT NULL, ' +
  							'extentiondate text NOT NULL, ' +
  							'detailstructuresimportees text, ' +
  							'dateimport timestamp without time zone, ' +
  							'nombasejson character varying(512), ' +
  							'basejsonok boolean, ' +
  							'datebasejsonok timestamp without time zone, ' +
  							'nomsqlbase character varying(512), ' +
  							'sqlbaseok boolean, ' +
  							'datesqlbaseok timestamp without time zone, ' +
  							'nombasesvg character varying(512), ' +
  							'svgok boolean, ' +
  							'datefinimportation timestamp without time zone, ' +
  							'CONSTRAINT importbases_pkey PRIMARY KEY (nombase, nomnouvellebase, extentiondate), ' +
  							'CONSTRAINT importbases_nombase_check CHECK (nombase::text <> \'\'::text)) WITH (OIDS=FALSE); ' +
							'ALTER TABLE _importbases OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _importbases.nombase IS \'Nom de la base\'; ' +
							'COMMENT ON COLUMN _importbases.nomnouvellebase IS \'Nom de la nouvelle base sur DbRequest\'; ' +
							'COMMENT ON COLUMN _importbases.detailstructuresimportees IS \'Détail des structures importées\'; ' +
							'COMMENT ON COLUMN _importbases.nombasejson IS \'Nom de la base json importée sur DbRequest\'; ' +
							'COMMENT ON COLUMN _importbases.basejsonok IS \'création base json Ok\'; ' +
							'COMMENT ON COLUMN _importbases.nomsqlbase IS \'Nom du sql de la base\'; ' +
							'COMMENT ON COLUMN _importbases.sqlbaseok IS \'création sql base Ok\'; ' +
							'COMMENT ON COLUMN _importbases.nombasesvg IS \'Nom de la sauvegarde de l\'\'ancienne base sur DbRequest\'; ' +
							'COMMENT ON COLUMN _importbases.svgok IS \'sauvegarde ancienne base Ok\'; '
					, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_importbases :', err);
							}
						console.error('Creation fichier : ','_importbases',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_importbases',' Le fichier existe déja !');
				}
			});
			
			
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_invitations']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_invitations',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _invitations ' +
							'(mailutilisateur character varying(50) NOT NULL, ' +
							'dateinvitation timestamp without time zone, ' +
  							'CONSTRAINT invitations_pkey PRIMARY KEY (mailutilisateur), ' +
  							'CONSTRAINT invitations_mailutilisateur_check CHECK (mailutilisateur::text <> \'\'::text)) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _invitations OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _invitations.mailutilisateur IS \'Mail de l\'\'utilisateur\'; ' +
							'COMMENT ON COLUMN _invitations.dateinvitation IS \'Date invitation\'; ' 
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_invitations : ', err);
							}
						console.error('Creation fichier : ','_invitations',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_invitations',' Le fichier existe déja !');
				}
			});
			
			
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes ' +
							'(nomrequete character varying(512) NOT NULL, ' +
							'nomutilisateur character varying(15), ' +
							'nombase character varying(50), ' +
							'idrequete serial NOT NULL, ' +							
							'validation boolean, ' +
							'datevalidation timestamp without time zone, ' +
							'datecreation timestamp without time zone, ' +
							'datemodification timestamp without time zone, ' +
							'tagsuppression boolean, ' +
							'datesuppression timestamp without time zone, ' +
  							'CONSTRAINT requetes_pkey PRIMARY KEY (nomrequete , nomUtilisateur , nombase)) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes.nomrequete IS \'Nom de la requête\'; ' +
							'COMMENT ON COLUMN _requetes.nomutilisateur IS \'Nom de l\'\'utilisateur\'; ' +
							'COMMENT ON COLUMN _requetes.nombase IS \'Nom de la base\'; ' +
							'COMMENT ON COLUMN _requetes.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes.validation IS \'Validation du script\'; ' +
							'COMMENT ON COLUMN _requetes.datevalidation IS \'Date de validation du script\'; ' +
							'COMMENT ON COLUMN _requetes.datecreation IS \'Date creation\'; ' +
							'COMMENT ON COLUMN _requetes.datemodification IS \'Date derniére modification\'; ' +
							'COMMENT ON COLUMN _requetes.tagsuppression IS \'Requête Supprimée\'; ' +
							'COMMENT ON COLUMN _requetes.datesuppression IS \'Date de suppression\'; '  
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes : ', err);
							}
						console.error('Creation fichier : ','_requetes',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes',' Le fichier existe déja !');
				}
			});
			
			

			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes_champs']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes_champs ' +
							'(idrequete integer, ' +
							'idchamp serial NOT NULL, ' +
							'nomchamp character varying(512), ' +	
							'nomtable character varying(512), ' +
							'agregateur character varying(10), ' +	
							'alias character varying(512), ' +
  							'CONSTRAINT requetes_champs_pkey PRIMARY KEY (idrequete , idchamp )) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes_champs OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes_champs.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes_champs.idchamp IS \'Numero du champ\'; ' +
							'COMMENT ON COLUMN _requetes_champs.nomchamp IS \'Nom du champ\'; ' +
							'COMMENT ON COLUMN _requetes_champs.nomtable IS \'Nom de la table\'; ' +
							'COMMENT ON COLUMN _requetes_champs.agregateur IS \'Nom fonction agrégation\'; ' +
							'COMMENT ON COLUMN _requetes_champs.alias IS \'Alias du champ\'; '  
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes_champs : ', err);
							}
						console.error('Creation fichier : ','_requetes_champs',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes_champs',' Le fichier existe déja !');
				}
			});	

			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes_selection']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes_selection ' +
							'(idrequete integer, ' +
							'idselection serial NOT NULL, ' +
							'nomchamp character varying(512), ' +
							'nomtable character varying(512), ' +	
							'operateur character varying(20), ' +	
							'valeur character varying(1024), ' +
							'valeurnomchamp character varying(512), ' +
							'valeurnomtable character varying(512), ' +					
							'connecteur character varying(3), ' +
  							'CONSTRAINT requetes_selection_pkey PRIMARY KEY (idrequete , idselection )) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes_selection OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes_selection.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes_selection.idselection IS \'Numero de la selection\'; ' +
							'COMMENT ON COLUMN _requetes_selection.nomchamp IS \'Nom du champ\'; ' +
							'COMMENT ON COLUMN _requetes_selection.nomtable IS \'Nom de la table\'; ' +
							'COMMENT ON COLUMN _requetes_selection.operateur IS \'Operateur\'; ' +
							'COMMENT ON COLUMN _requetes_selection.valeur IS \'Valeur\'; ' +
							'COMMENT ON COLUMN _requetes_selection.valeurnomchamp IS \'Nom du champ pour la valeur\'; ' +
							'COMMENT ON COLUMN _requetes_selection.valeurnomtable IS \'Nom de la table pour la valeur\'; ' +
							'COMMENT ON COLUMN _requetes_selection.connecteur IS \'Connecteur\'; '  
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes_selection : ', err);
							}
						console.error('Creation fichier : ','_requetes_selection',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes_selection',' Le fichier existe déja !');
				}
			});										

			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes_tri']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes_tri',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes_tri ' +
							'(idrequete integer, ' +
							'idtri serial NOT NULL, ' +
							'nomchamp character varying(512), ' +
							'nomtable character varying(512), ' +	
							'ordre character varying(4), ' +	
  							'CONSTRAINT requetes_tri_pkey PRIMARY KEY (idrequete , idtri )) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes_tri OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes_tri.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes_tri.idtri IS \'Numero du tri\'; ' +
							'COMMENT ON COLUMN _requetes_tri.nomchamp IS \'Nom du champ\'; ' +
							'COMMENT ON COLUMN _requetes_tri.nomtable IS \'Nom de la table\'; ' +
							'COMMENT ON COLUMN _requetes_tri.ordre IS \'Odre du tri\'; ' 
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes_tri : ', err);
							}
						console.error('Creation fichier : ','_requetes_tri',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes_tri',' Le fichier existe déja !');
				}
			});	

			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes_jointure']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes_jointure',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes_jointure ' +
							'(idrequete integer, ' +
							'idjointure serial NOT NULL, ' +
							'nomchampsource character varying(512), ' +
							'nomtablesource character varying(512), ' +		
							'typedejointure character varying(2), ' +	
							'nomchampdestination character varying(512), ' +
							'nomtabledestination character varying(512), ' +	
  							'CONSTRAINT requetes_jointure_pkey PRIMARY KEY (idrequete , idjointure )) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes_jointure OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes_jointure.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes_jointure.idjointure IS \'Numero de la jointure\'; ' +
							'COMMENT ON COLUMN _requetes_jointure.nomchampsource IS \'Nom du champ source\'; ' +
							'COMMENT ON COLUMN _requetes_jointure.nomtablesource IS \'Nom de la table source\'; ' +
							'COMMENT ON COLUMN _requetes_jointure.typedejointure IS \'Type de jointure\'; ' +
							'COMMENT ON COLUMN _requetes_jointure.nomchampdestination IS \'Nom du champ destination\'; ' +
							'COMMENT ON COLUMN _requetes_jointure.nomtabledestination IS \'Nom de la table destination\'; ' 
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes_jointure : ', err);
							}
						console.error('Creation fichier : ','_requetes_jointure',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes_jointure',' Le fichier existe déja !');
				}
			});
			
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes_groupby']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes_groupby',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes_groupby ' +
							'(idrequete integer, ' +
							'idgroupby serial NOT NULL, ' +
							'nomchamp character varying(512), ' +
							'nomtable character varying(512), ' +		
  							'CONSTRAINT requetes_groupby_pkey PRIMARY KEY (idrequete , idgroupby )) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes_groupby OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes_groupby.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes_groupby.idgroupby IS \'Numero du groupby\'; ' +
							'COMMENT ON COLUMN _requetes_groupby.nomchamp IS \'Nom du champ\'; ' +
							'COMMENT ON COLUMN _requetes_groupby.nomtable IS \'Nom de la table\'; ' 
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes_groupby : ', err);
							}
						console.error('Creation fichier : ','_requetes_groupby',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes_groupby',' Le fichier existe déja !');
				}
			});		
			
			client.query('SELECT count(tablename) FROM  pg_tables' +
			' WHERE schemaname NOT IN ( \'information_schema\' ,\'pg_catalog\' ) AND schemaname IN (\'public\' )' +
			' AND tablename  = $1 ' ,['_requetes_script']
            		, function(err, result) {
				
				if(err) {
				    return console.error('erreur creation fichier : ','_requetes_script',' : ', err);
				}

				if (result.rows[0].count != 1) {
					client.query('CREATE TABLE _requetes_script ' +
							'(idrequete integer, ' +
							'idlignescript serial NOT NULL, ' +
							'lignescript character varying(1024), ' +
  							'CONSTRAINT requetes_script_pkey PRIMARY KEY (idrequete , idlignescript )) ' +
							'WITH (OIDS=FALSE); ' +
							'ALTER TABLE _requetes_script OWNER TO ' + env.pg_user_init + '; ' +
							'COMMENT ON COLUMN _requetes_script.idrequete IS \'Identifiant de la requête\'; ' +
							'COMMENT ON COLUMN _requetes_script.idlignescript IS \'Numero de la ligne du script\'; ' +
							'COMMENT ON COLUMN _requetes_script.lignescript IS \'ligne du script\'; ' 
							
            				, function(err, result) {
				
						if(err) {
				    			return console.error('erreur creation fichier : ','_requetes_script : ', err);
							}
						console.error('Creation fichier : ','_requetes_script',' Ok');
					});
				} else {
						console.error('Creation fichier : ','_requetes_script',' Le fichier existe déja !');
				}
			});	


			done();
			console.error('Création fichiers système dbRequest Ok');
			return;
		});    
  
} 




