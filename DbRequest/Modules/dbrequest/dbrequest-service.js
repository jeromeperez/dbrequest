angular.module('uiRouterDbR.dbrequest.service', [
])
// Récupération des différentes bases de données de DbRequest sur PostgreSQL
.factory('basesDeDonnees', ['$http', 'CheminsAPI','utils', '$window', '$rootScope' ,'$q','utilisateur',  
                   function ($http ,  CheminsAPI , utils ,  $window ,  $rootScope  , $q , utilisateur) {
  var factory = {};
  
  /*var path = CheminsAPI.get('basesListe') ;
  
  var basesDeDonnees = $http.get(path).then(	function (response) {
	  												return basesDeDonnees = response.data
	  										 	});
//  var baseSelectionnee = null ;
  
  factory.all = function () {
    return basesDeDonnees ;
  };*/
  
var basesDeDonnees = {};
  
  factory.all = function () {
	  var deferred = $q.defer();
	  var cheminAPI = CheminsAPI.get('basesListe') ;
	  $http({
	    method: "GET",
	    url: cheminAPI,
	  }).then(function (response) {
		  basesDeDonnees = response.data ;
		  						    deferred.resolve(basesDeDonnees);
	  }, function(error) {
		  console.log(error); 
	      deferred.reject(error);
	  });
	 
	  return deferred.promise;  							
  };
  
  
  
  factory.get = function (nomBase) {
  	base = utils.findById(basesDeDonnees, nomBase) ;
  	return base ;
  };

  factory.suppressionBaseImportee = function (nomBaseDbRequest) {
	  var utilisateurInfo = utilisateur.getUtilisateurInfo();
	  var deferred = $q.defer();
	  var urlApi = CheminsAPI.get('basesSuppressionBaseImportee');
	  $http({
		      method: "POST",
		      url: urlApi,
		      headers: {
	    	    	"Authorization" : utilisateurInfo.tokenUtilisateur
	    	  },
		      data: {
		    	  nomBaseDbRequest : nomBaseDbRequest	  
		      }
	  }).then(function(response) {
		  	if (typeof response.data === 'string') {
		  		resultRequete = response.data;
		  		if (resultRequete == 'Ok') {
		  			console.log('Suppression Base Importée :');
		  			console.log(resultRequete);	  
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



  
  
  
  
  return factory;
}]);
