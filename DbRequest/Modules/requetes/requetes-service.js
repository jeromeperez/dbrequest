angular.module('uiRouterDbR.requetes.service', [

])


// Gestion des requetes de la base de données sur PostgreSQL
.factory('requetes', ['$http', 'utils', '$q', 'CheminsAPI', 'utilisateur' , 'baseSelectionnee',
            function ( $http ,  utils ,  $q ,  CheminsAPI ,  utilisateur  ,  baseSelectionnee   ) {
  
  var factory = {};
  var listeRequetes = {};
  
  factory.all = function () {
	  var deferred = $q.defer();
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesListe')  + '/' + laBaseSelectionnee.id;
	  $http({
	    method: "GET",
	    url: cheminAPI,
	    headers: {
	              "Authorization" : utilisateurInfo.tokenUtilisateur
	    }
	  }).then(function (response) {
		  							listeRequetes = response.data ;
		  						    deferred.resolve(listeRequetes);
	  }, function(error) {
		  console.log(error); 
	      deferred.reject(error);
	  });
	 
	  return deferred.promise;  							
  };
  
  factory.get = function (listeRequetes,idrequete) {
	    	for (var i = 0; i < listeRequetes.length; i++) {
	            if (listeRequetes[i].idrequete == idrequete) return listeRequetes[i];
	        }
	  
  };
  
  factory.getNomRequete = function (idrequete) {
  	for (var i = 0; i < listeRequetes.length; i++) {
          if (listeRequetes[i].idrequete == idrequete) return listeRequetes[i].nomrequete;
      }

  };

  factory.getUtilisateurRequete = function (idrequete) {
  	for (var i = 0; i < listeRequetes.length; i++) {
          if (listeRequetes[i].idrequete == idrequete) return listeRequetes[i].nomutilisateur;
      }

  };
  
  factory.getDetailsRequeteChamps = function (requeteId) {
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesDetailChamps') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      idRequete : requeteId ,
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });	 
	  return deferred.promise ;
  };
  
  factory.getDetailsRequeteSelection = function (requeteId) {
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesDetailSelection') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      idRequete : requeteId ,
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });	 
	  return deferred.promise ;
  };
  
  factory.getDetailsRequeteTri = function (requeteId) {
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesDetailTri') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      idRequete : requeteId ,
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });	 
	  return deferred.promise ;
  };
  
  factory.getDetailsRequeteJointure = function (requeteId) {
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesDetailJointure') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      idRequete : requeteId ,
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });	 
	  return deferred.promise ;
  };
  
  factory.getDetailsRequeteGroupBy = function (requeteId) {
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesDetailGroupBy') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      idRequete : requeteId ,
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });	 
	  return deferred.promise ;
  };
  
  factory.creationRequete = function (enregistrementCreationRequete) {
	  console.log('creation requete') ;
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesCreation') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      nomRequete : enregistrementCreationRequete.nomRequete ,
		    	      nomUtilisateur : utilisateurInfo.nomUtilisateur ,
		    	      nomBase : laBaseSelectionnee.id
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  })
	  return deferred.promise ;
  };

  factory.suppressionDesRequetes = function (listeRequetesPourSuppression) {
	  console.log('suppression requêtes') ;
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesSuppression') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      listeRequete : listeRequetesPourSuppression ,
		    	      nomUtilisateur : utilisateurInfo.nomUtilisateur ,
		    	      nomBase : laBaseSelectionnee.id
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  })
	  return deferred.promise ;
  };
  
  factory.modificationRequete = function (requeteId , tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
		  detailsRequeteJointure , detailsRequeteTri, detailsRequeteGroupBy ) {
	  
	  var deferred = $q.defer();
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesModification') ;
	  var detailsRequeteScript = factory.getScript(tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
			  detailsRequeteJointure , detailsRequeteTri, detailsRequeteGroupBy) ;
	  console.log('detailsRequeteScript') ;
	  console.log(detailsRequeteScript) ;		  
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: { 
		    	  	  nomBase : laBaseSelectionnee.id ,
		    	  	  requeteId : requeteId ,
		    	  	  tablesSelectionnees : tablesSelectionnees ,
		    	  	  detailsRequeteChamps : detailsRequeteChamps ,
		    	  	  detailsRequeteSelection : detailsRequeteSelection ,
		    	  	  detailsRequeteJointure : detailsRequeteJointure ,
		    	  	  detailsRequeteTri : detailsRequeteTri ,
		    	  	  detailsRequeteGroupBy : detailsRequeteGroupBy ,
		    	  	  detailsRequeteScript : detailsRequeteScript
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });
	 
	    return deferred.promise;
  };
  
  
  factory.transfertDesRequetesVersNouvelUtilisateur = function (listeRequetesPourTransfert,
		  nouvelUtilisateur) {
	  console.log('transfert requêtes vers nouvel utilisateur') ;
	  var deferred = $q.defer() ;
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesTransfertUtilisateur') ;
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      listeRequete : listeRequetesPourTransfert ,
		    	      nomNouvelUtilisateur : nouvelUtilisateur,
		    	      nomUtilisateur : utilisateurInfo.nomUtilisateur ,
		    	      nomBase : laBaseSelectionnee.id
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	        deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  })
	  return deferred.promise ;
  };
  
  
  factory.telechargementRequete = function (requeteId , tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
		  detailsRequeteJointure , detailsRequeteTri ) {
	  var detailsRequete = factory.getScript(tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
			  detailsRequeteJointure , detailsRequeteTri , detailsRequeteGroupBy) ;
	  var detailsRequeteTxt = ' ' ;
	  for (var i = 0; i < detailsRequete.length; i++) {
		  detailsRequeteTxt = detailsRequeteTxt + detailsRequete[i] ;
	  } ;
	  var nomDeLaRequete = factory.getNomRequete(requeteId);
	  var nomUtilisateurRequete = factory.getUtilisateurRequete(requeteId);
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var nomFichier = 'Requête_' + nomDeLaRequete + '_' + nomUtilisateurRequete + '_' + laBaseSelectionnee.datname
	  download(detailsRequeteTxt, nomFichier, "text/plain");
	  return ;
  };
  factory.telechargementResultat = function (requeteId , tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
		  detailsRequeteJointure , detailsRequeteTri , detailsRequeteGroupBy ) {
	  
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesResultat') ;
	  var nomDeLaRequete = factory.getNomRequete(requeteId);
	  var nomUtilisateurRequete = factory.getUtilisateurRequete(requeteId);
	  
	  $http({
		      method: "GET",
		      url: cheminAPI + 'Requete_' + nomDeLaRequete + '_' + nomUtilisateurRequete + '_' + laBaseSelectionnee.datname +  '.csv',
		      
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  
		      var nomFichier = 'Resultat_requête_' + nomDeLaRequete + '_' + nomUtilisateurRequete + '_' + laBaseSelectionnee.datname
		      download(response.data, nomFichier, "text/plain");
	  }, function(error) {
	      
	  });
  };
  
  
  factory.executionRequete = function (requeteId , tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
		  detailsRequeteJointure , detailsRequeteTri , detailsRequeteGroupBy ) {
	  
	  var deferred = $q.defer();
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('requetesExecution') ;
	  var detailsRequeteScript = factory.getScript(tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
			  detailsRequeteJointure , detailsRequeteTri , detailsRequeteGroupBy ) ;
	  var nomDeLaRequete = factory.getNomRequete(requeteId)
	  var nomUtilisateurDeLaRequete = factory.getUtilisateurRequete(requeteId);
	  
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: { 
		    	  	  nomBase : laBaseSelectionnee.id ,
		    	  	  requeteId : requeteId ,
		    	  	  detailsRequeteScript : detailsRequeteScript ,
		    	  	  nomRequete : nomDeLaRequete ,
		    	  	  nomUtilisateurRequete : nomUtilisateurDeLaRequete
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  		  
	      deferred.resolve(response) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });
	 
	    return deferred.promise;
  };
  
  factory.SuppressionRequete = function (suppressionRequete) {
	  var deferred = $q.defer();
	  var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
	  var cheminAPI = CheminsAPI.get('requeteSuppression');
	  $http({
		      method: "POST",
		      url: cheminAPI,
		      data: {
		    	      nomRequete : suppressionRequete.nomRequete ,
		    	      nomUtilisateur : suppressionRequete.nomUtilisateur ,
		    	      nomBase: laBaseSelectionnee.id
		      },
	          headers: {
	        	  "Authorization" : utilisateurInfo.tokenUtilisateur
	          }		
	  }).then(function(response) {  
		  deferred.resolve(response);
	  }, function(error) {
	      deferred.reject(error);
	  });
	 
	    return deferred.promise;
  };
  
  factory.getScript = function (tablesSelectionnees , detailsRequeteChamps , detailsRequeteSelection ,
		  detailsRequeteJointure , detailsRequeteTri, detailsRequeteGroupBy ) {
	  var script = [];
	  var ligneScript = '' ;
	  var prefixAlphabetTablesSelectionnees = ['a','b','c','d','e','f','g','h','i','j','k','l','n','m','o','p','q' 
	                                              ,'r','s','t','u','v','w','x','y','z','aa','bb','cc','dd','ee','ff','gg' 
	                                              ,'hh','ii','jj','kk','ll','nn','mm','oo','pp','qq' 
	                                              ,'rr','ss','tt','uu','vv','ww','xx','yy','zz'] ;  
	  if (tablesSelectionnees.length > 0) {
		  ligneScript = 'SELECT ' ;
		  script.push(ligneScript) ;
		  if (detailsRequeteChamps.length > 0) {
			  
			  var id = [] ;
   			  for (var iii = detailsRequeteChamps.length - 1 ;iii > -1; iii--) {
   				id.push(detailsRequeteChamps[iii].idchamp) ;
   			  } ;
   			  id.sort(function(a, b){return a-b});
   			  for (var ii = 0; ii < id.length; ii++) {
			  
			  for (var i = 0; i < detailsRequeteChamps.length; i++) {
				  
				  if (detailsRequeteChamps[i].idchamp == id[ii]) {	
				  
				  ligneScript = '' ;
				  var agregateurOk = false ;
				  if (detailsRequeteChamps[i].agregateur != ' ' && detailsRequeteChamps[i].agregateur != null && detailsRequeteChamps[i].agregateur != undefined) {
					  agregateurOk = true ;
					  ligneScript = detailsRequeteChamps[i].agregateur + '( ' ;
				  } ;
				  ligneScript = ligneScript + prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteChamps[i].nomtable)] 
				  + '.' + '"' + detailsRequeteChamps[i].nomchamp + '"' ;
				  if (agregateurOk == true) {
					  ligneScript = ligneScript + ' )' ;
				  } ;
				  if (detailsRequeteChamps[i].alias != ' ' && detailsRequeteChamps[i].alias != null && detailsRequeteChamps[i].alias != undefined) {	
					  ligneScript =	ligneScript + ' AS ' + '"' + detailsRequeteChamps[i].alias + '"' ;
				  } else {
					  ligneScript =	ligneScript + ' AS ' + '"' + prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteChamps[i].nomtable)]
					  + '.' + detailsRequeteChamps[i].nomchamp + '"' ;
				  } ;
				  if (ii != id.length -1) {	
					  ligneScript =	ligneScript + ' ,' ;
				  } ;
				  script.push(ligneScript) ;
				  
				  } ;
				  
			  } ; 
			  
   			  } ;
			  
			  
		  } else {
			  ligneScript = '* ' ;
			  script.push(ligneScript) ;
		  } ;
		  ligneScript = 'FROM ' ;
		  script.push(ligneScript) ;
		  for (var i = 0; i < tablesSelectionnees.length; i++) {
			  ligneScript = '"' + tablesSelectionnees[i] + '"' + ' ' + prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(tablesSelectionnees[i])]
			  if (i != tablesSelectionnees.length -1) {
				  ligneScript =	ligneScript + ' ,' ;
			  } ;
			  script.push(ligneScript) ;
		  };
		  if (detailsRequeteSelection.length > 0) {
			  ligneScript = 'WHERE ' ;
			  script.push(ligneScript) ;
			  for (var i = 0; i < detailsRequeteSelection.length; i++) {
				  ligneScript = prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteSelection[i].nomtable)]
				  + '.' +detailsRequeteSelection[i].nomchamp + ' ' + detailsRequeteSelection[i].operateur + ' ' ;
				  if (detailsRequeteSelection[i].valeurnomchamp != ' ' && detailsRequeteSelection[i].valeurnomchamp != null && detailsRequeteSelection[i].valeurnomchamp != undefined) {	
					  ligneScript =	ligneScript + ' ' + prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteSelection[i].valeurnomtable)]
					  					+ '.' + detailsRequeteSelection[i].valeurnomchamp ;
				  } else {
					  ligneScript =	ligneScript + ' ' + "'" + detailsRequeteSelection[i].valeur + "'";
				  } ;
				  if (i != detailsRequeteSelection.length -1) {	
					  ligneScript =	ligneScript + ' ' + detailsRequeteSelection[i].connecteur + ' ' ;
				  } ;
				  script.push(ligneScript) ;
			  }; 	  
			  
		  } ;
		  if (detailsRequeteJointure.length > 0) {
			  if (detailsRequeteSelection.length > 0) {
				  ligneScript = 'AND ' ;
			  } else {
				  ligneScript = 'WHERE ' ; 
			  } ;
			  script.push(ligneScript) ;
			  for (var i = 0; i < detailsRequeteJointure.length; i++) {
				  ligneScript = prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteJointure[i].nomtablesource)] +
				    '.' + detailsRequeteJointure[i].nomchampsource + ' ' +
				  	detailsRequeteJointure[i].typedejointure + ' ' +
				  	prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteJointure[i].nomtabledestination)] +
				  	'.' + detailsRequeteJointure[i].nomchampdestination + ' ' ;
				  if (i != detailsRequeteJointure.length -1) {	
					  ligneScript =	ligneScript +  'AND ' ;
				  } ;
				  script.push(ligneScript) ;
			  }; 	  
			  
		  } ;
		  if (detailsRequeteGroupBy.length > 0) {
			  ligneScript = ' GROUP BY ' ;
			  script.push(ligneScript) ;	  
			  var idGroup = [] ;
   			  for (var iii = detailsRequeteGroupBy.length - 1 ;iii > -1; iii--) {
   				idGroup.push(detailsRequeteGroupBy[iii].idgroupby) ;
   			  } ;
   			  idGroup.sort(function(a, b){return a-b});
   			  for (var ii = 0; ii < idGroup.length; ii++) {
   				  for (var i = 0; i < detailsRequeteGroupBy.length; i++) {
   					  if (detailsRequeteGroupBy[i].idgroupby == idGroup[ii]) {
   						  ligneScript = prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteGroupBy[i].nomtable )] +
   						  '.'+ '"' + detailsRequeteGroupBy[i].nomchamp + '"';
   						  if (ii != idGroup.length -1) {	
   							  ligneScript =	ligneScript +  ' , ' ;
   						  } ;
   						  script.push(ligneScript) ;
   					  } ;
   				  } ; 	  
   			  } ;
		  } ;
		  if (detailsRequeteTri.length > 0) {
			  ligneScript = ' ORDER BY ' ;
			  script.push(ligneScript) ;
			  var idTri = [] ;
   			  for (var iii = detailsRequeteTri.length - 1 ;iii > -1; iii--) {
   				idTri.push(detailsRequeteTri[iii].idtri) ;
   			  } ;
   			  idTri.sort(function(a, b){return a-b});
   			  for (var ii = 0; ii < idTri.length; ii++) {
   				  for (var i = 0; i < detailsRequeteTri.length; i++) { 
   					if (detailsRequeteTri[i].idtri == idTri[ii]) {
			  
   						ligneScript = prefixAlphabetTablesSelectionnees[tablesSelectionnees.indexOf(detailsRequeteTri[i].nomtable )] +
   						'.' + '"' + detailsRequeteTri[i].nomchamp + '"';
   						if (detailsRequeteTri[i].ordre == 'DESC') {	
   							ligneScript = ligneScript +  ' DESC ' ;
   						} ;
   						if (ii != idTri.length -1) {	
   							ligneScript = ligneScript +  ' , ' ;
   						} ;
   						script.push(ligneScript) ;
   					}; 
   			      };
   			  };
		  } ;
		  ligneScript =	' ; ' ;
	      script.push(ligneScript) ;
	      return script ;
	  } ;
	  
  } ;
  
  
  
  
  
  
  
  
  
  
  return factory;
}])

.directive('nomrequeteexiste', ['$q','$http', 'CheminsAPI', 'utilisateur',
                       function ($q , $http ,  CheminsAPI ,  utilisateur ) {
       	  return {
       		  require: 'ngModel',
       		  link: function (scope, elem, attrs, control) {
       			  control.$asyncValidators.nomrequeteexiste = function(nomRequete) {
       			
       				  var deferred = $q.defer();
       				  var utilisateurInfo = utilisateur.getUtilisateurInfo();
       				  var cheminAPI = CheminsAPI.get('requetesNomExiste');
       				  $http({
       					      method: "POST",
       					      url: cheminAPI,
       					      data: {
       					    	      nomRequete: nomRequete,
       					    	      nomUtilisateur: utilisateurInfo.nomUtilisateur,	
       					      }
       				  }).then(function(response) {
       					  if (angular.isUndefined(response.data[0])) {
       						  deferred.resolve();  
       					  } else {
       					    if (response.data[0].nomrequete == nomRequete){
       					    	deferred.reject();
       					    } else {
       					    	deferred.resolve();
       					    };
       					  }; 
       				  }, function(error) {
       				      deferred.reject();
       				  });
       				    return deferred.promise;
       			      };
       		  }
       	  };
}])

.directive('nomutilisateurtransfertexiste', ['$q','$http','CheminsAPI'
                  ,function ($q , $http, CheminsAPI) {
	  return {
		  require: 'ngModel',
		  link: function (scope, elem, attrs, control) {
			  control.$asyncValidators.nomexiste = function(nomNouvelUtilisateur) {
				  var deferred = $q.defer();
				  console.log(nomNouvelUtilisateur);
				  var urlApi = CheminsAPI.get('utilisateurNomexiste');
				  $http({
					      method: "POST",
					      url: urlApi,
					      data: {
					    	      nomUtilisateur: nomNouvelUtilisateur,	
					      }
				  }).then(function(response) {
					  if (angular.isUndefined(response.data[0])) {
						  deferred.reject();  
					  } else {
					    if (response.data[0].nomutilisateur == nomNouvelUtilisateur){
					    	deferred.resolve();
					    } else {
					    	deferred.reject();  
					    };
					  }; 
				  }, function(error) {
				      deferred.reject();
				  });
				    return deferred.promise;
			      };
		  }
	  };
}])