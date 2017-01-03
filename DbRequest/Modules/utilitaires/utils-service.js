angular.module('uiRouterDbR.utils.service', [

])

.factory('utils', function () {
  return {
	    
    // Retrouver un élément d'un tableau avec sa propriété id
    findById: function findById(a, id) {
      for (var i = 0; i < a.length; i++) {
    	/*  console.log(a[i].id)  */
        if (a[i].id == id) {
        	return a[i];        	
        }
      }
      return null;
    },
    
 // Retrouver les éléments d'un tableau avec la propriété id
    findListeById: function findListeById(a, id) {
      var result = [] ;
      for (var i = 0; i < a.length; i++) {
    	/*  console.log(a[i].id)  */
        if (a[i].id == id) {
        	result.push(a[i]) ;        	
        }
      }
      return result ;
    },
  
    // Util for returning a random key from a collection that also isn't the current key
    newRandomKey: function newRandomKey(coll, key, currentKey){
      var randKey;
      do {
        randKey = coll[Math.floor(coll.length * Math.random())][key];
      } while (randKey == currentKey);
      return randKey;
    }
  };
})

// Pour retrouver la configuration en cours avec les fichiers 
//  configurationInitiale.json et configurations.json'
.factory('configuration', ['$http','utils','$q', function ($http, utils,$q) {
	
  var factory = {} ;
  var configInfo = {} ;
  var configEncours ;
  var configDetails ;
	
  
  // var pathConfigInitiale = 'Configuration/configurationInitiale.js' ;
  // var configInitiale = $http.get(pathConfigInitiale).then(function (resp) {
  //	configEncours = JSONConfigInitiale.configInitiale;  
	//  console.log('configEncours');
    //  console.log(configEncours  );
	//  return ;
  // });  
  
 var pathConfigInitiale = 'Configuration/configurationInitiale.json' ;
 var configInitiale = $http.get(pathConfigInitiale).then(function (resp) {
     configEncours = resp.data.configInitiale ;
     console.log('configEncours');
     console.log(configEncours.id);
	 return ;
  });
  
 var pathConfigurations = 'Configuration/configurations.json' ;
 var toutesLesConfig = $http.get(pathConfigurations).then(function (resp) {
     configDetails = resp.data.configurations ;
	 return ;
  });
  
  var configuration = $q.all([
     	                 configInitiale  ,
     	                 toutesLesConfig
     	               ]).then(function () {
     	                	// Une fois les 2 promesses résolues...     	       
     	            	    configInfo = utils.findById(configDetails, configEncours.id)
     	            	    console.log('initOK');
     	                	return configDetails ;
     	               }); 
  
  
  factory.all = function () {
	  return configuration ;
  };
  
  factory.getConfigInfo = function() {
	  return configInfo ;  
  };
  
  return factory;
}])
//Pour retrouver les chemins d'acces vers les services web en fonction de la configuration en cours
.factory('CheminsAPI', ['configuration', function (configuration) {
	
  var factory = {} ;	
  
  factory.get = function(route) {
	  var configInfo = configuration.getConfigInfo() ;
	  return 'http://' + configInfo['hostServerApi'] + configInfo[route] ;
  };
  
  return factory;
}])

.factory('interceptionHttp', ['$q', '$rootScope',  function($q, $rootScope ) {
    // Pour intercepter les requête HTTP en cours ...
	var nombreDeRequeteEnCours  = 0;
    return {
        request: function(config) {
            nombreDeRequeteEnCours ++;
            $rootScope.$emit('ChargementEnCours');
            return config || $q.when(config)
        },
        response: function(response) {
            if ((--nombreDeRequeteEnCours ) === 0) {
        		$rootScope.$emit('ChargementTermine');
            }
            return response || $q.when(response);
        },
        responseError: function(response) {
            if (!(--nombreDeRequeteEnCours )) {
            	$rootScope.$emit('ChargementTermine');
            }
            return $q.reject(response);
        }
    };
}]);


