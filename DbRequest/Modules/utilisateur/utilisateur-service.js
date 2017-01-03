(function () {
  'use strict';
  
angular.module('uiRouterDbR.utilisateur.service', [

])

  .factory('utilisateur', ['$http', '$state', '$q', '$window','$translate', 
                  function ($http,   $state,   $q ,  $window , $translate) {
	
	var factory = {};
	
	var utilisateurInfo = {
			mailUtilisateur: null,
    		nomUtilisateur: null,
  			tokenUtilisateur: null,
  			roleUtilisateur : null,
  			langueUtilisateur: null
      };
	
	  factory.getUtilisateurInfo = function () {
		  return utilisateurInfo;
	  };
	  
	  factory.getNomUtilisateur = function () {
		  return utilisateurInfo.nomUtilisateur;
	  };
	  
	  factory.getLangueUtilisateur = function () {
		  return utilisateurInfo.langueUtilisateur;
	  };
	  
	  factory.setLangueUtilisateur = function (langueUtilisateur) {
		  utilisateurInfo.langueUtilisateur = langueUtilisateur;
		  return ;
	  };
	  
	  factory.setUtilisateurInfo = function (mailUtilisateur,nomUtilisateur,tokenUtilisateur,roleUtilisateur,langueUtilisateur) {
		  utilisateurInfo.mailUtilisateur = mailUtilisateur ;
		  utilisateurInfo.nomUtilisateur = nomUtilisateur ;
		  utilisateurInfo.tokenUtilisateur = tokenUtilisateur ;
		  utilisateurInfo.roleUtilisateur = roleUtilisateur.split(' ') ;
		  utilisateurInfo.langueUtilisateur = langueUtilisateur ;
    	  // Chargement de utilisateurInfo dans la session du navigateur    
    	  $window.sessionStorage["utilisateurInfo"] = JSON.stringify(utilisateurInfo);
		  return utilisateurInfo;
	  };
	   
	  factory.deleteUtilisateurInfo = function () {
		  utilisateurInfo.mailUtilisateur = null ;
		  utilisateurInfo.nomUtilisateur = null ;
		  utilisateurInfo.tokenUtilisateur = null ;
		  utilisateurInfo.roleUtilisateur = null; 
		  utilisateurInfo.langueUtilisateur = null; 
		  $window.sessionStorage.removeItem("utilisateurInfo");
		  return utilisateurInfo;
	  };
	  
	  factory.estConnecte = function () {
		  if (angular.isUndefined(utilisateurInfo.nomUtilisateur)) {  
			  return false;
	      } else {
	    	  	  if (utilisateurInfo.nomUtilisateur == null) {
	    	  	    return false;
	    	  	  }  else {
	    	  		return true;  
	    	  	  }
	      }
	  };
	  
	  factory.estUn = function (role) {
		  if (angular.isUndefined(utilisateurInfo.nomUtilisateur)) {  
			  return false;
	      } else {
	    	      if (utilisateurInfo.roleUtilisateur == null) {
	    	    	  return false;
	    	  	  }  else {
	    	  		  if (utilisateurInfo.roleUtilisateur.indexOf(role) > -1) {   
	    	  		    return true;
	    	  		}  else {
	    	  			return false;
	    	  		}
	    	  	  }
	      }
	  };
	 	 
	  // En cas de rechargement de la page on récupère l'utilisateur par le biais de la session
      factory.init = function() {
    	  if ($window.sessionStorage["utilisateurInfo"]) {
    		  utilisateurInfo = JSON.parse($window.sessionStorage["utilisateurInfo"]);
    		  $translate.use(utilisateurInfo.langueUtilisateur);
    		  console.log('Bonjour : ',utilisateurInfo.nomUtilisateur);
    	  }
      };
      factory.init();
      
	return factory;
	
  }]);		
		
})();