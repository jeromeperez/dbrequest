/*
 *  Utilitaires pour l'application DbRequest
 */
var funcUtil2 = require('../utilitaires/suiviImportation'); 
var funcUtil3 = require('../utilitaires/execSql'); 
 
module.exports.baseDB2SQL = function (nomBaseDataManager, nomNouvelleBase, extentionDate, req) {
    
	
	var pg = require('pg');
	var Cursor = require('pg-cursor');
    	var env = require('../config/env');

	
	var filename = req.query.fn || "datamanager_export.sql",
        mmids = req.query.mmids.split(','),
        fkmod = (req.query.fkmod == 'true'),
        fkref = (req.query.fkref == 'true'),
        fieldprops = (req.query.fieldprops == 'true'),
        target = req.query.target;
       
	
    	var jsonBase = [];	
	
	
	var cn = {
		host: env.pg_host, // Nom du serveur ou adresse IP;
		port: env.pg_port,
		database: env.pg_database,
		user: env.pg_user,
		password: env.pg_password	
	};
	
	var nombasejson = '_' + nomNouvelleBase + extentionDate + '_' + 'couchDb';
    	var nomsqlbase = '_' + nomNouvelleBase + extentionDate + '_' + 'sql';
	var nomsqllog = '_' + nomNouvelleBase + extentionDate + '_' + 'sqllog';
		
	var ligneLog = ' ';
	
	pg.connect(cn, function(err, client, done) {
		
		if(err) {
			return console.error('error fetching client from pool', err);
		}
		
		console.log('Début traduction base CouchDB en SQL')
		console.log('Récupération base CouchDB au format JSON')
		var d6 = new Date();
		console.log(d6) ;	

		client.query('SELECT * FROM '  +  nombasejson 
			
		, function(err, result) {
			
			if(err) {
				return console.error('error running query', err);
			}
			
			jsonBase = result.rows;
			
			console.log('Traduction base CouchDB en SQL')
			var d4 = new Date();
			console.log(d4) ;
			client.query('CREATE TABLE ' + nomsqlbase + '(numligne integer NOT NULL, ligneSQL text, ' +
				'CONSTRAINT "' + 'clef primaire KSQL' + extentionDate + '" PRIMARY KEY (numligne)) WITH (OIDS=FALSE)'
			
				, function(err, result) {
					// call 'done()' to release the client back to the pool

				if(err) {
					return console.error('error running query', err);
				}
				client.query('CREATE TABLE ' + nomsqllog + '(dateLog timestamp without time zone NOT NULL, ligneLog text ) WITH (OIDS=FALSE)'
			
					, function(err, result) {
						// call 'done()' to release the client back to the pool
					done();

					if(err) {
						return console.error('error running query', err);
					}
					ligneLog ='Début traduction base CouchDB en SQL';
					funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
					ligneLog ='Récupération base CouchDB au format JSON';
					funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
					ligneLog ='Traduction base CouchDB en SQL';
			                funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)

					main(nomBaseDataManager, nomNouvelleBase, extentionDate, req);
				});
			});
		});
		
		return;
	});     
	
	
	var numligneSQL = 0;
	//
    	function send(ligne) {
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				console.log('error fetching client from pool', err);
				return console.error('error fetching client from pool', err);
			}
			
			numligneSQL++;
			client.query('INSERT INTO ' + nomsqlbase + ' (ligneSQL, numligne) VALUES($1,$2)',[ligne, numligneSQL]
			, function(err, result) {
				// call 'done()' to release the client back to the pool
				done();

				if(err) {
					console.log('error fetching client from pool', err);
					return console.error('error running query', err);
				}
				return ;
			});
		});      
    }
	
	var indexRow = -1;
	var MaxRow = 0;	
	// 
    	function getRow() {
		MaxRow = jsonBase.length -1;
		//console.log(MaxRow) ;
		if (indexRow < MaxRow && MaxRow > 0 ) {
			indexRow++ ;
			if (indexRow == -1) {
			// console.log('jsonBase[indexRow].lignejsonb') ;
			// console.log(jsonBase[indexRow].lignejsonb) ;
			// console.log(typeof (jsonBase[indexRow].lignejsonb)) ;
			//var monjson = JSON.parse(jsonBase[indexRow].lignejsonb);
			// console.log('monjson') ;
			// console.log(monjson) ;
			// console.log(typeof (monjson)) ;
			}
			return JSON.parse(jsonBase[indexRow].lignejsonb);
		} else {
			return false;
		};
    }
	
	
	
	
	
    // returns SQL equivalent of DataManager's type t
    function getType(t) {

        switch(t) {
            case 'text': return 'varchar(255)';
            case 'longtext': return 'text';
            case 'integer': return 'integer';
            case 'boolean': return 'boolean';
            case 'float': return 'real';
            case 'date': return 'varchar(10)';
            case 'time': return 'time';
            case 'url': return 'varchar(255)';
            case 'geoloc': return 'varchar(255)';
            case 'enum': return 'varchar(255)'; // MySQL:enum PgSQL:?
            case 'multi-enum': return 'varchar(255)'; // ?
            case 'range': return 'real';
            case 'ref': return 'varchar(255)';
            default: return 'varchar(255)';
        }
    }

    // escapes single quotes by doubling them
    function escape(val) {
		try {
    			val = val.replace( /'/g , "''");
		}
		catch(err) {
			ligneLog ='probléme de valeur : '+ val ;
			funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
    			console.log('probléme de valeur ::::::') ;
			console.log(val) ;
			console.log(typeof(val)) ;
		}
		return val ;
        
    }

    // quotes tables/columns identifiers, depending on the target DBMS
    function quote(val) {

        if (target == 'mysql') {
            return '`' + val + '`';
        }
        if (target == 'postgresql') {
            return '"' + val + '"';
        }
        return val;
    }

    
    function getVal(v, t) {
	
        var val = (v ? v : null);

        if (val != null) {
            if (t == 'real' || t == 'integer') {
		if (val == 'NA') {
			val = 0 ;
			val = String(val);
		
		} else if (t == 'real') {
			var regex = /^[ ]*[-]*[0-9]*,[0-9]+/;
			if (regex.test(val)) {
				var str = ""+val;
				var resultat = str.replace(",",".");
				val = resultat;
			} else {
				val = String(val);
			}

		} else if (isNaN(val)) {
			ligneLog ='La valeur doit être numérique ! : val : ' + val + '  type : '+ t ;
			funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
			
			console.log('La valeur doit être numérique ! : ');
			console.log('val : ',val);
			console.log('type : ',t);
			
			val = 0 ;
			val = String(val);
	
                } else {
			val = String(val);
		};
            } else if (t == 'boolean') {
                val = (val ? 'true' : 'false'); // beware of "checked" value

	    } else if  (t == 'float') {
		console.log('float') ;
		console.log(val) ;
		console.log(typeof(val)) ;

	    } else if  (t == 'date') {
		// on en profite ici pour vérifier le format de la date
		var regex2 = /^[0-9][0-9][0-9][0-9]-[0-9]?[0-9]-[0-9]?[0-9]/;
		if (regex2.test(val)) {
				val = "'" + escape(val) + "'";
			} else {
				ligneLog ='Une date est mal formatée : ' + val + ' ; Date de remplacement : 1968-04-27' ;
				funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
				console.log('Une date est mal formatée : ');
    				console.log(val);
				console.log('Date de remplacement : 1968-04-27');
				val = '1968-04-27';
				val = "'" + escape(val) + "'";
			}
            } else {
				
		// test supplémentaire 
		if (typeof(val) == 'number') {
			val = String(val);
		} else if (typeof(val) == 'object') {
			val =  "'" + val + "'";
		} else {
			val = "'" + escape(val) + "'";
		}  
            }
        }
        return (val ? val : null);
    }

     

    // normalizes name n to make it SQL safe (no white spaces, lower case, no special chars)
    function normalizeName(n) {
		return n.toLowerCase().replace(/[àâä]/gi, 'a')
        .replace(/[éèêë]/gi, 'e')
        .replace(/[îï]/gi, 'i')
        .replace(/[ôö]/gi, 'o')
        .replace(/[ùûü]/gi, 'u')
        .replace(/ /gi, '_');
        //return libutils.no_accent(n.toLowerCase());
        //return n.toLowerCase().replace(' ', '_');
    }

    // converts a mm doc into one "create table" per modi, and returns the SQL-compliant schema
    function createTables(doc) {

        send('-- creating tables for model (' + doc.name + ')\n');
        var sqlModel = {
            name: normalizeName(doc.name),
            desc: doc.desc, // TODO escape single quotes
            modules: {},
            structure: {},
            serial: 0 // manual PK int id
        };
        for (var mt in doc.modules) { // copy & normalize modules
            var modt = doc.modules[mt];
            sqlModel.modules[mt] = {
                name: normalizeName(modt.name),
                desc: modt.desc,
                attachments: modt.withimg || modt.withattchs,
                fields: []
            };
            for (var i=0; i < modt.fields.length; i++) {
                var f = modt.fields[i];
                sqlModel.modules[mt].fields.push({
                    name: (f.label ? normalizeName(f.label) : normalizeName(f.name)), // f.name should already be normalized
                    realName: f.name,
                    type: getType(f.type),
		    // pour vérification
		    realType: f.type,
                    desc: f.desc,
                    mandatory: f.mandatory,
                    unique: (f.uniq ? true : false),
                    defaultValue: f.default_value,
                    target: ((f.type == 'ref') ? f.mm : null)
                });
            }
        }
        for (var m in doc.structure) { // one table per modi, store normalized structure in sqlModel
            var modi = doc.structure[m];
                module = sqlModel.modules[modi[0]];
                inst = '',
                title = module.name + m;
            if ((modi.length > 3) && (modi[3])) {
                title = modi[3];
            }
            sqlModel.structure[m] = {
                tableName: sqlModel.name + '.' + normalizeName(title),
                title: ((modi.length > 3) && (modi[3])) ? modi[3] : null,
                module: modi[0],
                parent: modi[1]
            };
            var comments = []; // for postgresql
            inst += 'CREATE TABLE ' + quote(sqlModel.structure[m].tableName) + ' (';
            inst += quote('_id') + ' integer PRIMARY KEY, ' + quote('_parent') + ' integer, ';
            for (var f=0; f <  module.fields.length; f++) {
                var field = module.fields[f];
                inst += quote(field.name) + ' ' + field.type;
                if (field.desc && target == 'mysql') {
                    inst += " COMMENT '" + escape(field.desc) + "'";
                }
                if (field.desc && target == 'postgresql') {
                    comments.push(
                        'COMMENT ON COLUMN ' + quote(sqlModel.structure[m].tableName)
                        + '.' + quote(field.name)
                        + " IS '" + escape(field.desc) + "';"
                    );
                }
                if (f < module.fields.length - 1) {
                    inst += ', ';
                }
            }

	    for (var f=0; f <  module.fields.length; f++) {
                var field = module.fields[f];
		// console.log('realtype ::: typeSQL');
                // console.log(field.realType , field.type);
	    } ;
            
	    inst += ')';

            if (module.desc && target == 'mysql') {
                inst += " COMMENT='" + escape(module.desc) + "'";
            }
            inst += ';\n';
            if (module.desc && target == 'postgresql') {
                inst += 'COMMENT ON TABLE ' + quote(sqlModel.structure[m].tableName)
                    + " IS '" + escape(module.desc) + "';\n";
                for (var i=0; i < comments.length; i++) {
                    inst += comments[i] + '\n';
                }
            }
            send(inst);
        }
        send('\n');
        return sqlModel;
    }

    // converts a mm doc into one "create view" per modt
    function createViews(mm) {

        var modelsByModule = {};
        for (var m in mm.structure) {
            var model = mm.structure[m];
            if (! (model.module in modelsByModule)) {
                modelsByModule[model.module] = {
                    name: mm.modules[model.module].name,
                    instances: []
                };
            }
            modelsByModule[model.module].instances.push(model.tableName);
        }
        for (var m in modelsByModule) {
            var mbm = modelsByModule[m];
            send('-- view for all instances of module (' + mbm.name + ') in model (' + mm.name + ')\n');
            var inst = 'CREATE VIEW ' + quote(mm.name + '.' + mbm.name) + ' AS ';
            for (var i=0; i < mbm.instances.length; i++) {
                inst += 'SELECT * FROM ' + quote(mbm.instances[i]);
                if (i < mbm.instances.length - 1) {
                    inst += ' UNION ';
                }
            }
            // inst += " COMMENT='view for all instances of module (" + mbm.name + ") in model (" + mm.name + ")'";
            inst += ';\n';
            if (target == 'postgresql') {
                inst += 'COMMENT ON VIEW ' + quote(mm.name + '.' + mbm.name)
                + " IS 'view for all instances of module (" + mbm.name + ") in model (" + mm.name + ")';\n";
            }
            send(inst);
        }
        send('\n');
    }

    function insertInto(doc, mm, storedIds) {
      
		
        var modt = mm.modules[doc.$modt],
            modi = mm.structure[doc.$modi];

	if (modi == undefined || modt == undefined ) { 
			
		    console.log('PROBLEME RENCONTRE AVEC CE DOCUMENT');
	            console.log('doc :::::::');
		    console.log(doc);
		    /* console.log('doc.$modi :::::::');
		    console.log(doc.$modi);
		    console.log('doc.$type :::::::');
		    console.log(doc.$type);
		    console.log('mm :::::::');
		    console.log(mm);
		    console.log('mm.structure :::::::');
		    console.log(mm.structure);
		    console.log('modi = mm.structure[doc.$modi]');
		    console.log(modi);
		    console.log('modi.tableName');
		    console.log(modi.tableName); */
	} else {		
        var inst = 'INSERT INTO ' + quote(modi.tableName),
            fields = quote('_id') + ', ' + quote('_parent') + ', ',
            values = '' + mm.serial + ', ';

	


        // try to get parent id
        //var parentId = String.substring(doc._id, 0, String.lastIndexOf(doc._id, '##')),
		//    sqlParentId = (storedIds[parentId] ? storedIds[parentId] : 'null');
		var parentId = doc._id.substring( 0 , doc._id.lastIndexOf('##') );
        var sqlParentId = (storedIds[parentId] ? storedIds[parentId] : 'null');
        values += '' + sqlParentId + ', ';
        for (var i=0; i < modt.fields.length; i++) {
	    // Boucle sur les champs du fichier
            var f = modt.fields[i];

            fields += quote(f.name);

	/* if (modi.tableName == 'observations.observation.0') {
		if (f.name == 'observation_number') {
			
			console.log('f');
			console.log(f);
			console.log('f.realName');
			console.log(f.realName);
			console.log('f.type');
			console.log(f.type);
			console.log('doc[f.realName]');
			console.log(doc[f.realName]);
			var bibi = getVal2(doc[f.realName], f.type);
		};       
          }; 								*/
                
	    // Récupération des valeurs pour les champs du fichier
	    values += getVal(doc[f.realName], f.type);

            if (i < modt.fields.length - 1) {
                fields += ', ';
                values += ', ';
            }
        }
        inst += ' (' + fields + ') VALUES (' + values + ')';
        inst += ';\n';
        send(inst);
        storedIds[doc._id] = mm.serial;
        mm.serial++;
        }
    }

    // produces the beginning of an INSERT statement, specifying columns
    function insertColumns(doc, mm) {

        var modt = mm.modules[doc.$modt],
            modi = mm.structure[doc.$modi];
        var inst = 'INSERT INTO ' + quote(modi.tableName),
            fields = quote('_id') + ', ' + quote('_parent') + ', ';

        for (var i=0; i < modt.fields.length; i++) {
            var f = modt.fields[i];
            fields += quote(f.name);
            if (i < modt.fields.length - 1) {
                fields += ', ';
            }
        }
        inst += ' (' + fields + ') VALUES ';

        return inst;
    }

    function bulkInsert(doc, mm, storedIds) {

        var modt = mm.modules[doc.$modt],
            inst = '(' + mm.serial + ', ';
        // try to get parent id
        var parentId = String.substring(doc._id, 0, String.lastIndexOf(doc._id, '##')),
            sqlParentId = (storedIds[parentId] ? storedIds[parentId] : 'null');

        inst += '' + sqlParentId + ', ';
        for (var i=0; i < modt.fields.length; i++) {
            var f = modt.fields[i];
            inst += getVal(doc[f.realName], f.type);
            if (i < modt.fields.length - 1) {
                inst += ', ';
            }
        }
        inst += ')';
        storedIds[doc._id] = mm.serial;
        mm.serial++;

        return inst;
    }

    // produces an "add constraint foreign key" to reflect modules structure in a mm
    function setFkOnModules(mms) {

        send('\n-- definition of foreign keys for model structure\n');
        for (var mm in mms) {
            var model = mms[mm].sql;
            for (var m in model.structure) {
                var modi = model.structure[m];
                if (modi.parent) {
                    var parentModi = model.structure[modi.parent],
                        inst = 'ALTER TABLE ' + quote(modi.tableName);
                    inst += ' ADD CONSTRAINT ' + quote(m + '_parentFk'); // beware of too long identifiers causing errors!
                    inst += ' FOREIGN KEY (' + quote('_parent') + ') REFERENCES '
                            + quote(parentModi.tableName) + ' (' + quote('_id') + ')';
                    inst += ' ON UPDATE CASCADE ON DELETE SET NULL'; // optional
                    inst += ';\n';
                    send(inst);
                }
            }
        }
    }

    // @TODO produces an "add constraint foreign key" for each "reference" typed field
    function setFkOnReferenceFields(mms) {

        send('\n-- definition of foreign keys for reference fields\n');
        return false;

        for (var mm in mms) {
            var model = mms[mm].sql;
            for (var m in model.structure) {
                var modi = model.structure[m],
                    modt = model.modules[modi.module],
                    inst = 'ALTER TABLE ' + quote(modi.tableName);
                for (var i=0; i < modt.fields.length; i++) {
                    var f = modt.fields[i];
                    if (f.type == "ref") {
                        var target = f.target;
                        if (target) {
                            // ??
                        }
                    }
                }
            }
        }
    }

    // adds "unique", "not null" and "default" constraints/properties on each field
    function setFieldsProperties(mms) {

        send('\n-- definition of field properties (unique, not null, default value)\n');
        for (var mm in mms) {
            var model = mms[mm].sql;
            for (var m in model.structure) {
                var modi = model.structure[m],
                    modt = model.modules[modi.module],
                    uniqueFields = [],
                    inst = 'ALTER TABLE ' + quote(modi.tableName);
                for (var i=0; i < modt.fields.length; i++) {
                    var f = modt.fields[i];
                    if (f.unique) {
                        uniqueFields.push(f.name);
                    }
                    if (f.mandatory) { // mandatory
                        if (target == 'mysql') {
                            send(inst + ' MODIFY ' + quote(f.name) + ' ' + f.type + ' NOT NULL;\n');
                        }
                        if (target == 'postgresql') {
                            send(inst + ' ALTER COLUMN ' + quote(f.name) + ' SET NOT NULL;\n');
                        }
                    }
                    if (f.defaultValue && f.type != 'text') { // default value, forbidden for text/blob
                        if (target == 'mysql') {
                            send(inst + ' MODIFY ' + quote(f.name) + ' ' + f.type + ' DEFAULT '
                                    + getVal(f.defaultValue, f.type) + ';\n');
                        }
                        if (target == 'postgresql') {
                            send(inst + ' ALTER COLUMN ' + quote(f.name) + ' ' + ' SET DEFAULT '
                                    + getVal(f.defaultValue, f.type) + ';\n');
                        }
                    }
                }
                // unique constraint
                if (uniqueFields.length) {
                    inst += ' ADD CONSTRAINT ' + quote(m + '_unique') + ' '; // beware of too long identifiers causing errors!
                    inst += 'UNIQUE (';
                    for (var i=0; i < uniqueFields.length; i++) {
                        inst += quote(uniqueFields[i]);
                        if (i < uniqueFields.length - 1) {
                            inst += ', ';
                        }
                    }
                    inst += ');\n';
                    send(inst);
                }
            }
        }
    }

    // main
	function main(nomBaseDataManager, nomNouvelleBase, extentionDate, req) {
	ligneLog ='Création de la base : ' + nomNouvelleBase + ' a partir de la base DataManager : ' + nomBaseDataManager ;
	funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
    	var mms = {},
        row,
        storedIds = {},
        lastModel = null;
	
    if (target == 'postgresql') {
        send('SET datestyle = "ISO, YMD";\n');
    }
	
	send('-- creation de la base : ' + nomNouvelleBase + ' a partir de la base DataManager : ' + nomBaseDataManager + ' \n');
	
	
    while ((row = getRow())) {
		
		//if (row.key[1] == 0) { // mm
		if (row.id.match(/_design\/mm_.*/)) { // mm
		
			if ((mmids[0] == 'null') || (mmids.indexOf(row.id) > -1)) {
                mms[row.id] = {
                    doc: row.doc
                };
			//	console.log(mms);
                var sqlModel = createTables(row.doc);
                mms[row.id].sql = sqlModel;
                createViews(mms[row.id].sql);
            }
        } else { // data doc
            if ((mmids[0] == 'null') || (mmids.indexOf(row.doc.$mm) > -1)) { // exclude docs from models not selected
              if (row.doc.$type != 'view') {
		var mm = mms[row.doc.$mm];
                if (mm == undefined) {
                    // log('unknown mm:[' + row.doc.$mm + ']');
                } else {
                    if (lastModel != row.doc.$mm) { // needs to detect modi change 
                        
                        send('\n-- inserting data for model (' + mm.doc.name + ')\n');
                        lastModel = row.doc.$mm;
                        storedIds = {};
                    }
				
                    insertInto(row.doc, mm.sql, storedIds);
                }
	      } else {	
			ligneLog ='Problème de type : ' +  row.doc.$type ;
			funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
			console.log('problème de type');
			console.log(row.doc.$type);
	      }	
            }
        }
    }
    
    // set constraints ?
    if (fkmod) {
        setFkOnModules(mms);
    }
    if (fkref) {
        setFkOnReferenceFields(mms);
    }
    if (fieldprops) {
        setFieldsProperties(mms);
    }

    send('\n-- export completed'); 
	
    var mmids2 = req.query.mmids ;
    funcUtil2.suiviImportation('creationSQLBaseOk', nomBaseDataManager, mmids2, nomNouvelleBase, extentionDate);
    console.log('Traduction base CouchDB en SQL Ok')
    var d5 = new Date();
    console.log(d5) ;
    creationBaseDbRequest(nomBaseDataManager, mmids2, nomNouvelleBase, extentionDate);
    }
	
    function creationBaseDbRequest(nomBaseDataManager, mmids, nomNouvelleBase, extentionDate) {
	
	console.log('creation de la nouvelle base');
	
	var pg = require('pg');
    var env = require('../config/env');
	var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};
		
    var nomsqlbase = '_' + nomNouvelleBase + extentionDate + '_' + 'sql';
	var nombasesvg = '_' + nomNouvelleBase + extentionDate + '_' + 'svg';
    var baseExiste = false ;
	var SQLcreation = '' ;
		
		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query('SELECT datname FROM pg_database WHERE datistemplate = false AND datname = $1',[nomNouvelleBase]
            , function(err, result) {
		
				if(err) {
				    return console.error('erreur : ', err);
				}
				if (result.rowCount > 0) {
					baseExiste = true ;
				}	
				console.log('la base existe : ' , baseExiste)
				if (baseExiste) {
					client.query('REVOKE CONNECT ON DATABASE ' + nomNouvelleBase + ' FROM public ; ' +
								 'ALTER DATABASE ' + nomNouvelleBase + ' CONNECTION LIMIT 0 ; ' +
								 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = \'' + 									  nomNouvelleBase + '\' ; ' + 
								 'ALTER DATABASE ' + nomNouvelleBase + ' RENAME TO ' + nombasesvg + ' ; '
                    			, function(err, result) {
						if(err) {
						return console.error('erreur rename ancienne base ', err);
						}
						console.log('sauvegarde ancienne base Ok')
						funcUtil2.suiviImportation('SauvegardeBaseOk', nomBaseDataManager, mmids, nomNouvelleBase, extentionDate);
						ligneLog ='Sauvegarde ancienne base Ok';
			                	funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
						creationBase();
						return;
					});
				} else {
					done();
					funcUtil2.suiviImportation('SauvegardeBaseOk', nomBaseDataManager, mmids, nomNouvelleBase, extentionDate);
					creationBase();
					
					return;
				}
			});
		}); 
	 
	 
	 
	 
	function creationBase() {
		
		var cn = {
			host: env.pg_host, // Nom du serveur ou adresse IP;
			port: env.pg_port,
			database: env.pg_database,
			user: env.pg_user,
			password: env.pg_password
		};

		pg.connect(cn, function(err, client, done) {
		
			if(err) {
				console.log('error fetching client from pool', err);
				return console.error('error fetching client from pool', err);
			}
			
			client.query('CREATE DATABASE ' + nomNouvelleBase + ' WITH OWNER = postgres ENCODING = \'UTF8\' TABLESPACE = pg_default ' +
			    ' CONNECTION LIMIT = -1' + ' ; '
            		, function(err, result) {
				done();
				if(err) {
				    return console.error('erreur creation nouvelle base ', err);
				} ;
				ligneLog ='Construction nouvelle base Ok';
				funcUtil2.logDesErreurs(ligneLog, nomNouvelleBase, extentionDate)
				console.log('construction nouvelle base Ok')
				funcUtil3.ExecutionSql(nomNouvelleBase, nomsqlbase) ;
				return;
			});
		});      
    } 


}
}


module.exports.demandeValidationInscription = function (mailDemandeur, nomDemandeur, request) {
        // console.log(mailDemandeur);
	// console.log(nomDemandeur);
	// on recupère les adresses mail des administrateurs
	var env = require('../config/env');
	var pg = require('pg');
	
	var cn = {
		host: env.pg_host, // Nom du serveur ou adresse IP;
		port: env.pg_port,
		database: env.pg_database,
		user: env.pg_user,
		password: env.pg_password
	};
		
	pg.connect(cn, function(err, client, done) {
		
		if(err) {
			console.log('error fetching client from pool', err);
			return console.error('error fetching client from pool', err);
		}
		
		client.query('SELECT MailUtilisateur FROM _UTILISATEURS WHERE Scope like \'%admin%\' and Actif = true'
        , function(err, result) {
			done();
			if(err) {
				return console.error('erreur recuperation adresse admin ', err);
			}
			var json = JSON.stringify(result.rows);
			json2 = JSON.parse(json) ;
			result.rows.forEach( function( row ) {
			    console.log('Envoi demande de validation à ', row.mailutilisateur) ;
			    EnvoiMailDemandeValidation(mailDemandeur, nomDemandeur, row.mailutilisateur, request ) ;
			}) ;	
			console.log('Envoi demande de validation Ok') ;
			return;
		});
	}); 

	
	function EnvoiMailDemandeValidation(mailDemandeur, nomDemandeur, MailAdmin, request) {
		
		var data = {
			from: env.mailer_user_demande_validation ,
			to: MailAdmin ,
			subject: env.mailer_subject_demande_validation ,
			html: {
				path: env.mailer_demande_validation_html
			},
			context: {
				name: nomDemandeur
			}
        };

		var Mailer = request.server.plugins.mailer;
		Mailer.sendMail(data, function (err, info) {
			if(err) {
				console.log('Erreur pour l\'envoi du mail de demande de validation : ', err);
				return;
			}
			return;
		});
    } ; 
	
}

