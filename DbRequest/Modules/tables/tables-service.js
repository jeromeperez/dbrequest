(function () {
  'use strict';

angular.module('uiRouterDbR.tables.service', [

])

// Récupération des différentes tables de la base de données sur PostgreSQL
.factory('tables', ['$http'  , 'CheminsAPI', 'utils', 'AuthFactory','$q', 'utilisateur', 'baseSelectionnee',
          function ( $http   ,  CheminsAPI ,  utils ,  AuthFactory , $q ,  utilisateur ,  baseSelectionnee ) {
  
  var factory = {};
  var tables = {};
  var tablesDetails = {};

  factory.all = function () {
	  var deferred = $q.defer();
	  var LaBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('tablesListe') + '/' + LaBaseSelectionnee.id ;
	  $http({
	    method: "GET" ,
	    url: cheminAPI ,
	    headers: {
	              "Authorization" : utilisateurInfo.tokenUtilisateur
	    }
	  }).then(function (response) {
		  							tables = response.data ;
		  						    deferred.resolve(tables) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });
	 
	    return deferred.promise ;  							
  };
  
  factory.get = function () {
	  return tables ;
  };
  
  factory.details = function () {
	  var deferred = $q.defer();
//	  console.log('coucou') ;
	  var LaBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo() ;
	  var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
	  var cheminAPI = CheminsAPI.get('tablesDetails') + '/' + LaBaseSelectionnee.id ;
	  $http({
	    method: "GET" ,
	    url: cheminAPI ,
	    headers: {
	              "Authorization" : utilisateurInfo.tokenUtilisateur
	    }
	  }).then(function (response) {
		  							tablesDetails = response.data ;
		  						    deferred.resolve(tablesDetails) ;
	  }, function(error) {
	      deferred.reject(error) ;
	  });
	 
	    return deferred.promise ;  							
  };
  
  /*factory.getDetails = function () {
	  return tablesDetails ;
  };*/
  factory.getDetails = function (tableId) {
	  return utils.findListeById(tablesDetails, tableId) ; 
  };
  /*factory.get = function (NomTable) {
    return tables.then(function(){
      return utils.findByName(tables, nomTable);
    })
  };*/
  
  return factory;
}]);
}) ();