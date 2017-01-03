(function () {
  'use strict';
  
angular.module('uiRouterDbR.dataManager.service', [

])

  .factory('DataManagerFactory', [  '$rootScope' , '$http','$state','CheminsAPI','$q','$window','utilisateur',  
                           function ($rootScope  ,  $http , $state , CheminsAPI , $q , $window , utilisateur) {
	
	var factory = {};
	var resultRequete = {}; 
	
	
	var utilisateurDataManager = {
    		name: null,
    		password : null
    };
	  
	  factory.deleteUtilisateurDataManager = function () {
		  utilisateurDataManager.name = null ;
		  utilisateurDataManager.password = null ;
		  $window.sessionStorage.removeItem("utilisateurDataManager");
		  return utilisateurDataManager;
	  };
	
	// En cas de rechargement de la page on récupère l'utilisateur par le biais de la session
      factory.init = function() {
    	  if ($window.sessionStorage["utilisateurDataManager"]) {
    		  utilisateurDataManager = JSON.parse($window.sessionStorage["utilisateurDataManager"]);
    	  }
      };
      factory.init();
	  
	  factory.connexionDataManagerOk = function (urlSession,name,password) {
		  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManager');
		  
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  },
			      data: {
			    		  name      : name ,
			    		  password  : password,
			    		  urlSession: urlSession ,	
		  				  urlRequete: urlSession ,	  
		  				  requete   : ' '	
			      }
		  }).then(function(response) {
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response DataManager:');	
			  		console.log(resultRequete);
			  		utilisateurDataManager.name = name ;
					utilisateurDataManager.password = password ;
					// Chargement de utilisateurDataManager dans la session du navigateur    
			    	$window.sessionStorage["utilisateurDataManager"] = JSON.stringify(utilisateurDataManager);
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
	  
	  
	  
	  
	  
	  factory.UtilisateurDataManagerOk = function () {
		  var deferred = $q.defer();		  
		  if (angular.isUndefined(utilisateurDataManager.name)) {  
			  deferred.reject({ utilisateurDataManagerAuthentifie : false });
	      } else {
	    	  	  if (utilisateurDataManager.name == null) {
	    	  		  	deferred.reject({ utilisateurDataManagerAuthentifie : false });
	    	  	  }  else {
	    	  		   	deferred.resolve(utilisateurDataManager);
	    	  	  }
	      } 
		  return deferred.promise; 
	  };
	  
	  factory.structuresAImporter = function (structuresDeLaBaseSelectionnee) {
		  var structures = [];
      	  for (var i=0; i<structuresDeLaBaseSelectionnee.length; i++){ 
      		  			structures.push(structuresDeLaBaseSelectionnee[i].id);
      	  };
      	  console.log('structures');
          console.log(structures);
          return structures;
      }
	 
	  
	  factory.baseUtilisateurDataManager = function (urlSession, urlRequete) {
		  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManagerBasesUtilisateur');
		  
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  },
			      data: {
			    		  name      : utilisateurDataManager.name ,
			    		  password  : utilisateurDataManager.password,
			    		  urlSession: urlSession ,	
		  				  urlRequete: urlRequete,	  
		  				  
			      }
		  }).then(function(response) {
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response DataManager:');	
			  		console.log(resultRequete);	  
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
	 
      
      
      factory.detailBaseDataManager = function (urlSession, urlRequete, nomBaseDataManager) {
		  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManagerDetailBase');
		  
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  },
			      data: {
			    		  name      : utilisateurDataManager.name ,
			    		  password  : utilisateurDataManager.password,
			    		  urlSession: urlSession ,	
		  				  urlRequete: urlRequete,
		  				  nomBaseDataManager: nomBaseDataManager	  
			      }
		  }).then(function(response) {
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response DataManager:');
			  		console.log(resultRequete);	  
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
      
      factory.importBasesDataManagerEnCours = function () {
    	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  console.log('importBasesDataManagerEnCours');
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManagerImportBaseEnCours');
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  }
		  }).then(function(response) {
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response Importation Base En cours:');
			  		console.log(resultRequete);	  
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
      
      factory.detailImportationsBaseDataManager = function (nomBaseDataManager) {
    	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  console.log('detailImportationsBaseDataManager');
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManagerDetailImportationsBase');
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  },
			      data: {
			    	  nomBaseDataManager : nomBaseDataManager	  
			      }
		  }).then(function(response) {
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response detailImportationsBase :');
			  		console.log(resultRequete);	  
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
      
      
      factory.selectionImportation = function (ListeImportations,extentiondate) {
  	    
	    	for (var i = 0; i < ListeImportations.length; i++) {
	            if (ListeImportations[i].extentiondate == extentiondate) return ListeImportations[i];
	        }
	  
      };
      /*setTimeout(function() {
	  $rootScope.$emit('FinDemandeImportation');
	  deferred.resolve("terminé par Timeout !");
      console.log('Ca va être long');
      return deferred.promise;
  }, 120000);*/
      
      factory.importBaseDataManager = function (urlSession, urlRequete, nomBaseDataManager, structuresAImporter, monNouvelleBase) {
    	  $rootScope.$emit('DebutDemandeImportation');
    	  $rootScope.$emit('ImportationLancee');
    	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManagerImportBase');
		  console.log('Début Service lancé');
		  
		  setTimeout(function() {
			  	$rootScope.$emit('FinDemandeImportation');
			  	deferred.resolve("terminé par Timeout !");
			  	console.log('Ca va être long');
			  	return deferred.promise;
		  }, 60000);
		  
		  
		  
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  },
			      data: {
			    		  name      : utilisateurDataManager.name ,
			    		  password  : utilisateurDataManager.password,
			    		  urlSession: urlSession ,	
		  				  urlRequete: urlRequete,
		  				  nomBaseDataManager: nomBaseDataManager,
		  				  structuresAImporter : structuresAImporter,
		  				  monNouvelleBase : monNouvelleBase 
			      }
		  }).then(function(response) {
			  console.log('Service Retour 1');
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response DataManager:');	
			  		console.log(resultRequete);	
			  		$rootScope.$emit('FinDemandeImportation');
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		console.log('Service Retour 2');
			  		$rootScope.$emit('FinDemandeImportation');
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
			  console.log('Service Retour 3');
			  $rootScope.$emit('FinDemandeImportation');
		      deferred.reject(error);
		  });
		  	console.log('Fin Service lancé');
		    return deferred.promise;
      };
      
      
       
      
      factory.suppressionDetailBaseImportee = function (nomBaseImportee , dateImport) {
        	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
    		  console.log('Suppression détail import base');
    		  var deferred = $q.defer();
    		  var urlApi = CheminsAPI.get('dataManagerSuppressionDetailImportBase');
    		  $http({
    			      method: "POST",
    			      url: urlApi,
    			      headers: {
    		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
    		    	  },
    			      data: {
    			    	  nomBaseImportee : nomBaseImportee	,  
    			    	  dateImport : dateImport	  
    			      }
    		  }).then(function(response) {
    			  if (typeof response.data === 'string') {
    			  		resultRequete = response.data;
    			  		if (resultRequete == 'Ok') {
    			  			console.log('Suppression détail importation base : ',resultRequete);
    			  			deferred.resolve(resultRequete);
    			  		} else {
    			  			deferred.reject(resultRequete);
    			  		}
    			  	} else {
    			  	  // Réponse invalide
    			  		deferred.reject(response.data);
    			  	};
    		  }, function(error) {
    		      deferred.reject(error);
    		  });
    		 
    		    return deferred.promise;
          };
      
      
      
      factory.requeteDataManager = function (urlSession, urlRequete, requete) {
    	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('dataManager');
		  
		  $http({
			      method: "POST",
			      url: urlApi,
			      headers: {
		    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
		    	  },
			      data: {
			    		  name      : utilisateurDataManager.name ,
			    		  password  : utilisateurDataManager.password,
			    		  urlSession: urlSession ,	
		  				  urlRequete: urlRequete,	  
		  				  requete   : requete	
			      }
		  }).then(function(response) {
			  	if (typeof response.data === 'object') {
			  		resultRequete = response.data;
			  		console.log('response DataManager:');	
			  		console.log(resultRequete);	  
			  		deferred.resolve(resultRequete);
			  	} else {
			  	  // Réponse invalide
			  		deferred.reject(response.data);
			  	};
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
     
	return factory;
  }])
		
})();