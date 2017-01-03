(function () {
  'use strict';
  
angular.module('uiRouterDbR.permissions.service', [

])

  .factory('PermFactory', [         '$http', '$state', '$q', 'utilisateur', 
                           function ($http,   $state,   $q,   utilisateur) {
	
	  var factory = {};
	
	  factory.permissionsOK = function (permissionsRequises) {
		  var deferred = $q.defer();
		  var permisOk = false;
		  var utilisateurInfo = utilisateur.getUtilisateurInfo();
          
		  if (utilisateur.estConnecte()){
		    angular.forEach(permissionsRequises, function(permission) {
		      if (utilisateurInfo.roleUtilisateur.indexOf(permission) > -1) {
		    	  permisOk = true;
		      };
		  });
		  };
		  
		  if (permisOk) {  
			  	  deferred.resolve({utilisateurAutorise: true});
	      } else {
	        	  deferred.reject({ utilisateurAutorise: false });
	      }
		  return deferred.promise; 
	  };
	    
	return factory;
  }]);	
	
		
})();