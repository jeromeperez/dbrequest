(function () {
  'use strict';
  
angular.module('uiRouterDbR.authentification.service', [

])

  .factory('AuthFactory', [         '$http','$state','CheminsAPI','$q','utilisateur','baseSelectionnee','DataManagerFactory', 
                           function ($http , $state , CheminsAPI , $q , utilisateur , baseSelectionnee , DataManagerFactory) {
	
	var factory = {};
	  
	
	  factory.connexionOK = function () {
		  var utilisateurInfo = utilisateur.getUtilisateurInfo();
		  var deferred = $q.defer();
		  if (utilisateurInfo.nomUtilisateur != null) {  
			  deferred.resolve(utilisateurInfo);
	      } else {
	        	  deferred.reject({ utilisateurAuthentifie: false });
	      }
		  return deferred.promise; 
	  };
	  
	  
	  factory.connexion = function (signatureUtilisateur) {
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('utilisateurConnexion');
		  var sel = "Bvbdkv:!clkkq";
		  var hash = CryptoJS.SHA256(sel + signatureUtilisateur.motDePasseConnexion);
		  var hashStr = hash.toString(CryptoJS.enc.Base64);  
		  $http({
			      method: "POST",
			      url: urlApi,
			      data: {
			    		  nomUtilisateur: signatureUtilisateur.nomUtilisateurConnexion,
			    		  motDePasse:hashStr 
			    		  
			      }
		  }).then(function(response) {
			    utilisateur.setUtilisateurInfo(response.data[0].mailutilisateur, response.data[0].nomutilisateur, response.data[0].tokenutilisateur, response.data[0].scope, response.data[0].langueutilisateur);	  		  
		        deferred.resolve(utilisateur.utilisateurInfo);
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
	 
      
     
      factory.deconnexion = function() {
    	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
    	  var deferred = $q.defer();
    	  var urlApi = CheminsAPI.get('utilisateurDeconnexion');
    	  $http({
    	    method: "POST",
    	    url: urlApi,
    	    headers: {
    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
    	    }
    	  }).then(function(reponse) {
    		  					     utilisateur.deleteUtilisateurInfo();
    		  					     baseSelectionnee.deleteBaseSelectionneeInfo();
    		  					     DataManagerFactory.deleteUtilisateurDataManager();
    		  						 deferred.resolve(reponse);
    	  }, function(error) {
    		  				   deferred.reject(error);
    	  });
    	 
    	  return deferred.promise;
      };
		
      
      factory.changementMdp = function(changementMdpUtilisateur) {
    	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
    	  var deferred = $q.defer();
    	  var urlApi = CheminsAPI.get('utilisateurChangementMdp');
    	  var sel = "Bvbdkv:!clkkq";
		  var hash = CryptoJS.SHA256(sel + changementMdpUtilisateur.motDePasse);
		  var hashStr = hash.toString(CryptoJS.enc.Base64);  
    	  $http({
    	    method: "POST",
    	    url: urlApi,
    	    data: {
    	    	  mailUtilisateur : utilisateurInfo.mailUtilisateur,
	    		  motDePasse : hashStr
	    		 
	        },
    	    headers: {
    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
    	    }
    	  }).then(function(response) {
    		  utilisateur.setUtilisateurInfo(response.data[0].mailutilisateur, response.data[0].nomutilisateur, response.data[0].tokenutilisateur, response.data[0].scope, response.data[0].langueutilisateur);	  		  
		      deferred.resolve(utilisateur.utilisateurInfo);
		        
    	  }, function(error) {
    		  				   deferred.reject(error);
    	  });
    	 
    	  return deferred.promise;
      };
      
      
      
      
      factory.enregistrement = function (enregistrementUtilisateur) {
		  var deferred = $q.defer();
		  var urlApi = CheminsAPI.get('utilisateurEnregistrement');
		  var sel = "Bvbdkv:!clkkq";
		  var hash = CryptoJS.SHA256(sel + enregistrementUtilisateur.motDePasse);
		  var hashStr = hash.toString(CryptoJS.enc.Base64);  
		  $http({
			      method: "POST",
			      url: urlApi,
			      data: {
			    	      mailUtilisateur: enregistrementUtilisateur.mailUtilisateur,	
			    		  nomUtilisateur: enregistrementUtilisateur.nomUtilisateur,
			    		  motDePasse: hashStr,
			    		  langueUtilisateur: enregistrementUtilisateur.langueChoisie
			      }
		  }).then(function(response) {  		  
		        deferred.resolve(response);
		  }, function(error) {
		      deferred.reject(error);
		  });
		 
		    return deferred.promise;
      };
      
	return factory;
  }])	
  
  
  
	
  .directive('estegal', [function () {
	   /*
	   * <input type="password" ng-model="enregistrementUtilisateur.motDePasse" />
	   * <input type="password" ng-model="enregistrementUtilisateur.motDePasseConfirme" estegal="enregistrementUtilisateur.motDePasse" />
	   */
	  return {
		  restrict: 'A', // S'utilise uniquement en tant qu'attribut
		  scope: true,
		  require: 'ngModel',
		  link: function (scope, elem, attrs, control) {
			  var check = function () {
				  // Valeur du champs courant 
				  var v1 = scope.$eval(attrs.ngModel); // attrs.ngModel = "enregistrementUtilisateur.motDePasseConfirme"
				  //valeur du champ à comparer
				  var v2 = scope.$eval(attrs.estegal).$viewValue; // attrs.estegal = "formulaireEnregistrement.motDePasse"
				  return v1 == v2;
			  };
			  scope.$watch(check, function (isValid) {
				// Défini si le champ est valide
				control.$setValidity("estegal", isValid);
			  });
		  }
	  };
  }])


  .directive('mailexiste', ['$q','$http','CheminsAPI'
                  ,function ($q , $http , CheminsAPI) {
	  return {
		  require: 'ngModel',
		  link: function (scope, elem, attrs, control) {
			  console.log('controle mail')
			  control.$asyncValidators.mailexiste = function(mailUtilisateur) {
				  var deferred = $q.defer();
				  console.log(mailUtilisateur);
				  var urlApi = CheminsAPI.get('utilisateurMailexiste');
				  $http({
					      method: "POST",
					      url: urlApi,
					      data: {
					    	      mailUtilisateur: mailUtilisateur,	
					      }
				  }).then(function(response) {
					  if (angular.isUndefined(response.data[0])) {
						  deferred.resolve();  
					  } else {
					    if (response.data[0].mailutilisateur == mailUtilisateur){
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
	
  .directive('nomexiste', ['$q','$http','CheminsAPI'
                  ,function ($q , $http, CheminsAPI) {
	  return {
		  require: 'ngModel',
		  link: function (scope, elem, attrs, control) {
			  control.$asyncValidators.nomexiste = function(nomUtilisateur) {
				  var deferred = $q.defer();
				  console.log(nomUtilisateur);
				  var urlApi = CheminsAPI.get('utilisateurNomexiste');
				  $http({
					      method: "POST",
					      url: urlApi,
					      data: {
					    	      nomUtilisateur: nomUtilisateur,	
					      }
				  }).then(function(response) {
					  if (angular.isUndefined(response.data[0])) {
						  deferred.resolve();  
					  } else {
					    if (response.data[0].nomutilisateur == nomUtilisateur){
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

})();