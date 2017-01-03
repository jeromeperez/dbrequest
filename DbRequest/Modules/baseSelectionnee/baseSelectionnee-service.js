(function () {
  'use strict';
  
angular.module('uiRouterDbR.baseSelectionnee.service', [

])

  .factory('baseSelectionnee', ['$http', '$state', '$q', '$window','$translate', 
                  function ($http,   $state,   $q ,  $window , $translate) {
	
	var factory = {};
	
	var baseSelectionneeInfo = {
    		datname: null,
			id: null
      };
	
	  factory.getBaseSelectionneeInfo = function () {
		  return baseSelectionneeInfo;
	  };
	  
	  factory.getNomBaseSelectionnee = function () {
		  return baseSelectionneeInfo.datname;
	  };
	  
	  factory.setNomBaseSelectionnee = function (nomBase) {
		  baseSelectionneeInfo.datname = nomBase;
		  return ;
	  };
	  
	  factory.setBaseSelectionneeInfo = function (base) {
		  baseSelectionneeInfo.datname = base.datname ;
		  baseSelectionneeInfo.id = base.id ;
    	  // Chargement de baseSelectionneeInfo dans la session du navigateur    
    	  $window.sessionStorage["baseSelectionneeInfo"] = JSON.stringify(baseSelectionneeInfo);
		  return baseSelectionneeInfo;
	  };
	   
	  factory.deleteBaseSelectionneeInfo = function () {
		  baseSelectionneeInfo.datname = null ;
		  baseSelectionneeInfo.id = null ;
		  $window.sessionStorage.removeItem("baseSelectionneeInfo");
		  return baseSelectionneeInfo;
	  };
	  
	  factory.estSelectionnee = function () {
		  if (angular.isUndefined(baseSelectionneeInfo.datname)) {  
			  return false;
	      } else {
	    	  	  if (baseSelectionneeInfo.datname == null) {
	    	  	    return false;
	    	  	  }  else {
	    	  		return true;  
	    	  	  }
	      }
	  };
	  
	 	 
	  // En cas de rechargement de la page on récupère la base sélectionnée par le biais de la session
      factory.init = function() {
    	  if ($window.sessionStorage["baseSelectionneeInfo"]) {
    		  baseSelectionneeInfo = JSON.parse($window.sessionStorage["baseSelectionneeInfo"]);
    	  }
      };
      factory.init();
      
	return factory;
	
  }]);		
		
})();