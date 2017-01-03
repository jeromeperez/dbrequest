angular.module('uiRouterDbR.utilisateurs.service', [

])


// Gestion des utilisateurs de la base de données sur PostgreSQL
.factory('utilisateurs', ['CheminsAPI' , '$http', 'utils','$q', 'utilisateur', 
                function ( CheminsAPI  ,  $http ,  utils,  $q ,  utilisateur ) {
  
  var factory = {};
  var listeUtilisateurs = {};
  
  factory.all = function () {
	  var deferred = $q.defer();
	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
	  console.log(utilisateurInfo.tokenUtilisateur);
	  var urlApi = CheminsAPI.get('utilisateursListe') ;
	  $http({
	    method: "GET",
	    url: urlApi ,
	    headers: {
	              "Authorization" : utilisateurInfo.tokenUtilisateur
	    }
	  }).then(function (response) {
		  							listeUtilisateurs = response.data ;
		  						    deferred.resolve(listeUtilisateurs);
	  }, function(error) {
		  console.log(error); 
	      deferred.reject(error);
	  });
	 
	    return deferred.promise;  							
  };
  
  factory.selection = function (ListeUtilisateurs,mailutilisateur) {
	    
	    	for (var i = 0; i < ListeUtilisateurs.length; i++) {
	            if (ListeUtilisateurs[i].mailutilisateur == mailutilisateur) return listeUtilisateurs[i];
	        }
	  
  };
 
  
  factory.invitation = function (invitationUtilisateur) {
	  var deferred = $q.defer();
	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
	  console.log(invitationUtilisateur.mailUtilisateur);
	  var urlApi = CheminsAPI.get('utilisateursInvitation');
	  $http({
		      method: "POST",
		      url: urlApi,
		      data: {
		    	      mailUtilisateur : invitationUtilisateur.mailUtilisateur	
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
  
  factory.modificationDuCompte = function (modifications) {
	  var deferred = $q.defer();
	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
	  var urlApi = CheminsAPI.get('utilisateursModificationcompte');
	  console.log(modifications.mailUtilisateur) ;
	  console.log(modifications.mailUtilisateurChoisi) ;
	  console.log(modifications.autorisationChoisie) ;
	  console.log(modifications.permissionsChoisies) ;
	  console.log(modifications.langueChoisie) ;
	  
	  $http({
		      method: "POST",
		      url: urlApi,
		      data: {
		    	      mailUtilisateur : modifications.mailUtilisateur ,
		    	      mailUtilisateurChoisi : modifications.mailUtilisateurChoisi ,
		    	      autorisationChoisie : modifications.autorisationChoisie ,
		    	      permissionsChoisies : modifications.permissionsChoisies ,	
		    	      langueChoisie : modifications.langueChoisie 
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
  
  factory.validationDuCompte = function (modifications) {
	  var deferred = $q.defer();
	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
	  var urlApi = CheminsAPI.get('utilisateursValidationcompte');
	  
	  console.log(modifications.mailUtilisateurChoisi) ;
	  
	  $http({
		      method: "POST",
		      url: urlApi,
		      data: {
		    	      mailUtilisateur : modifications.mailUtilisateurChoisi ,
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
  
  return factory;
}]);