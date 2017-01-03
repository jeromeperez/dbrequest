angular.module('uiRouterDbR.authentification', [
  'ui.router', 'ui.bootstrap'
])
  
.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        ///////////////
        // Connexion //
        ///////////////
        .state('connexion', {
        	
          url: '/connexion',
          
          onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
              $modal.open({
                  templateUrl: 'Vues/authentification/connexion.html',
                  resolve: {
                	  
                  	configuration: ['configuration',
                  	                     function( configuration){
                  	                       return  configuration.all() ;
                  	                     }
                  	]
                  },
                  controller: [            '$rootScope','$scope', '$state', 'AuthFactory',
                                function (  $rootScope , $scope,   $state,   AuthFactory ) {
   
                	  				$scope.signatureUtilisateur = {
                	  			  			nomUtilisateurConnexion: '',
                	  			  			motDePasseConnexion: ''
                	  			  	};
          	  						
                	  			  	$scope.connexion = function (validationOk , signatureUtilisateur) {
                	  			  	   if (validationOk) {
                	  			  			AuthFactory.connexion(signatureUtilisateur).then(function () {
                	  			  				$rootScope.$emit('Connexion','CONNEXION_OK');
                	  			  				$scope.$dismiss();
                	  			  				// Appel de la fonction retourEtatPrecedent pour être redirigé vers l'état
                	  			  				//  précédant la demande de connexion
                	  			  				$rootScope.retourEtatPrecedent();  
                	  			  			})
                	  			  		} else {
                	  			  			$rootScope.$emit('Connexion','CONNEXION_KO');
                	  			  			$scope.submitted = true;	
                	  			  		}	
                	  			  	};
        	  						
        	  						$scope.annulation = function() {
    	  								$scope.$dismiss();
    	  								$state.go('dbrequest');  
    	  							};
                  				}
                  ]        
              })   
          }]   
        })
        
        /////////////////
        // Déconnexion //
        /////////////////
        .state('deconnexion', {
        	
          url: '/deconnexion',

          onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
              $modal.open({
                  templateUrl: 'Vues/authentification/deconnexion.html',
                  resolve: {
                	  
                    	configuration: ['configuration',
                    	                     function( configuration){
                    	                       return  configuration.all() ;
                    	                     }
                    	]
                  },
                  controller: [            '$rootScope','$scope', '$state', 'AuthFactory',
                                function (  $rootScope , $scope,   $state,   AuthFactory ) {
        	  
        	  						$scope.deconnexion = function () {
        	  							AuthFactory.deconnexion().then(function () {
        	  								$rootScope.$emit('Connexion','DECONNEXION_OK');
        	  								// $rootScope.baseSelectionneeOK = false ;
        	  								$scope.$dismiss();
        	  								// $state.go('dbrequest',{},{reload: true});  
        	  								$state.go('dbrequest'); 
        	  							})
        	  						};
        	  						
        	  						$scope.annulation = function() {
    	  								$scope.$dismiss();
    	  								$rootScope.retourEtatPrecedent();
    	  							};
                  				}
                  ]        
              })   
          }]    
        })

        ////////////////////
        // Enregistrement //
        ////////////////////
        .state('enregistrement', {
        	
          url: '/enregistrement',
          
          onEnter: [        '$stateParams', '$state', '$modal', 'AuthFactory', '$translate', 
                    function($stateParams ,  $state ,  $modal ,  AuthFactory ,  $translate) {
              $modal.open({
                  templateUrl: 'Vues/authentification/enregistrement.html',
                  resolve: {
                	  
                    	configuration: ['configuration',
                    	                     function( configuration){
                    	                       return  configuration.all() ;
                    	                     }
                    	]
                  },
                  controller: [		   '$rootScope','$scope',
                               function($rootScope , $scope) {
                	  
                	  							$scope.enregistrementUtilisateur = {
                	  										mailUtilisateur: '',
                	  										nomUtilisateur: '',
                	  										motDePasse: '',
                	  										motDePasseConfirme: '',
                	  										langueChoisie: $translate.use()
                	  							};
                	  							 
                	  							$scope.listeLanguesUtilisateur=['fr', 'en', 'es'] ;
                	  		            	   /* $scope.langueUtilisateur = $translate.use(); 
                	  		            	    console.log($scope.langueUtilisateur);
                	  							*/
                	  							$scope.enregistrement = function(validationOk , enregistrementUtilisateur) {
                	  								if (validationOk) {
                	  									AuthFactory.enregistrement(enregistrementUtilisateur).then(function () {
                	  										$rootScope.$emit('Connexion','ENREGISTREMENT_OK');
                	  										$scope.$dismiss();
                	  										$state.go('dbrequest');  
                	  									})
                	  								} else {
                	  									$rootScope.$emit('Connexion','ENREGISTREMENT_KO');
                	  									$scope.submitted = true;	
                	  								}
                	  							};  
                	  
                	  							$scope.annulation = function() {
                	  								$scope.$dismiss();
                	  								$rootScope.retourEtatPrecedent();
                	  							};
                  				}
                  ]
              })
          }]
        })
        
        /////////////////////////////
        // Changement Mot de Passe //
        /////////////////////////////
        .state('changementMdp', {
        	
          url: '/changementMdp',
          
          onEnter: [        '$stateParams', '$state', '$modal', 'AuthFactory' , 
                    function($stateParams ,  $state ,  $modal ,  AuthFactory) {
              $modal.open({
                  templateUrl: 'Vues/authentification/changementMdp.html',
                  resolve: {
                	  
                    	configuration: ['configuration',
                    	                     function( configuration){
                    	                       return  configuration.all() ;
                    	                     }
                    	]
                  },
                  controller: [		   '$rootScope','$scope',
                               function($rootScope , $scope) {
                	  
                	  							$scope.changementMdpUtilisateur = {
                	  										mailUtilisateur: ''
                	  							};
                	    
                	  							$scope.changementMdp = function(validationOk , changementMdpUtilisateur) {
                	  								if (validationOk) {
                	  									AuthFactory.changementMdp(changementMdpUtilisateur).then(function () {
                	  										$rootScope.$emit('Connexion','CHANGEMENT_MDP_OK');
                	  										$scope.$dismiss();
                	  										$state.go('dbrequest');  
                	  									})
                	  								} else {
                	  									$rootScope.$emit('Connexion','CHANGEMENT_MDP_KO');
                	  									$scope.submitted = true;	
                	  								}
                	  							};  
                	  
                	  							$scope.annulation = function() {
                	  								$scope.$dismiss();
                	  								$rootScope.retourEtatPrecedent();
                	  							};
                  				}
                  ]
              })
          }]
        })
        
    }
  ]
);
