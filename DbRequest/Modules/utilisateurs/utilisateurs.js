angular.module('uiRouterDbR.utilisateurs', [
  'ui.router'
])
  
.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        //////////////////
        // Utilisateurs //
        //////////////////
        .state('utilisateurs', {
       
          abstract: true,

          url: '/utilisateurs',

          templateUrl: 'Vues/utilisateurs/utilisateurs.html',
          
          data: {
              permissionsNecessaires : ['admin']
          } ,
          
          resolve: {
        	  
        	configuration: ['configuration',
     	                     function( configuration){
     	                       return  configuration.all() ;
     	                     }
     	    ] ,   
        	  
        	utilisateurAuthentifie: ['AuthFactory','configuration',
        	             	 function(AuthFactory , configuration){
        	             	            return  AuthFactory.connexionOK();
        	             	          }
        	] ,    
        	
            utilisateurAutorise: ['$state','PermFactory','configuration',
                         function( $state , PermFactory , configuration){  
              						  return  PermFactory.permissionsOK(this.data.permissionsNecessaires);
              	             	    }
            ] ,
              	
            listeUtilisateurs: ['utilisateurs','configuration',
                       function( utilisateurs , configuration){
                			   return utilisateurs.all();
                             }
            ]
          },

          controller: ['$scope', '$state', 'listeUtilisateurs', 'utils' ,'$translate' ,
            function (  $scope,   $state,   listeUtilisateurs,   utils ,  $translate ) {
              $scope.listeUtilisateurs = listeUtilisateurs;
              $state.triListe = {tri : 'tous'};
            }]
        })

        ////////////////////////////////////////////////////////
        // Utilisateurs > Liste des utilisateurs de DbRequest //
        ////////////////////////////////////////////////////////

        .state('utilisateurs.liste', {

          url: '',
          
          cache: false, // Pour le rechargement de la page
          
          templateUrl: 'Vues/utilisateurs/utilisateurs.liste.html',
          
          controller: ['$state','$scope','$translate' ,
              function ($state, $scope , $translate) {
        	  	$scope.triListe = $state.triListe ;
        	  	$scope.$watch(function($scope) { return $scope.triListe.tri },
                            function(newValue, oldValue) {
        		  				$state.triListe.tri = newValue;
                         	}
        	    );
          }]
        })

        ////////////////////////////
        // Utilisateurs > Détail //
        ///////////////////////////

        .state('utilisateurs.detail', {

          url: '/{utilisateurId}',

          views: {

            '': {
              templateUrl: 'Vues/utilisateurs/utilisateurs.detail.html',
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'utilisateurs',
                function (  $scope , $rootScope ,  $state   , $stateParams,   utilisateurs) {
            	  var utilisateur = utilisateurs.selection($scope.listeUtilisateurs, $stateParams.utilisateurId);
            	  
            	  $scope.utilisateurSelectionne = utilisateur ;
            	  
            	  $scope.modif = { 	mailUtilisateur : utilisateur.mailutilisateur ,
            			  			mailUtilisateurChoisi : utilisateur.mailutilisateur ,
            			  			autorisationChoisie : utilisateur.actif ,
            			  			permissionsChoisies : utilisateur.scope.split(" ") ,
            	  					langueChoisie : utilisateur.langueutilisateur || ' ' 
            	                 };
            	  
            	  $scope.autorisationUtilisateur = utilisateur.actif ;
            	  $scope.listePermissionsUtilisateur=['lecteur', 'redacteur', 'admin'];
            	  $scope.permissionsUtilisateur = utilisateur.scope.split(" ") ;
            	  $scope.listeLanguesUtilisateur=['fr', 'en', 'es'] ;
            	  $scope.langueUtilisateur = utilisateur.langueutilisateur || ' '; 
            	 
                  $scope.modifiezCompte = function(modif) {
                	  utilisateurs.modificationDuCompte(modif).then(function () {
                		  $rootScope.$broadcast('Compte modifié');
                		  $scope.listeUtilisateurs = utilisateurs.all().then(function () {
                			  $state.go('utilisateurs.liste',{},{reload: true});  
                		  });
                	  })
                  };  
                  
                  $scope.validezCompte = function(modif) {
                	  utilisateurs.modificationDuCompte(modif).then(function () {
                		  $rootScope.$broadcast('Compte modifié');
                		  utilisateurs.validationDuCompte(modif).then(function () {
                			  $rootScope.$broadcast('Compte validé');
                			  $scope.listeUtilisateurs = utilisateurs.all().then(function () {
                				  $state.go('utilisateurs.liste',{},{reload: true}); 
                        	  }); 
                		  });
                	  });  
                  };  
             
                }]
            },

            'utilisateurIdentification': {
              templateProvider: ['$stateParams',
                function (        $stateParams) {
                  return "<hr><h4>{{ 'UTILISATEURS_UTILISATEUR_SELECTIONNE' | translate }} : " + $stateParams.utilisateurId + "</h4>";
                }]
            }
          }
        })

        
      ///////////////////////////////////
      // Invitez un nouvel utilisateur //
      ///////////////////////////////////
      .state('utilisateurs.liste.invitezNouvelUtilisateur', {
      	
        url: '/invitation',
        
        onEnter: [        '$stateParams', '$state', '$modal', 'utilisateurs' , 
                  function($stateParams ,  $state ,  $modal ,  utilisateurs) {
            $modal.open({
                templateUrl: 'Vues/utilisateurs/utilisateurs.invitezNouvelUtilisateur.html',
                
                controller: [		   '$rootScope','$scope',
                             function($rootScope , $scope) {
              	  
              	  							$scope.invitationUtilisateur = {
              	  										mailUtilisateur: '',
              	  							};
              	    
              	  							$scope.invitation = function(validationOk , invitationUtilisateur) {
              	  								if (validationOk) {
              	  								utilisateurs.invitation(invitationUtilisateur).then(function () {
              	  										$rootScope.$broadcast('Invitation OK');
              	  										$scope.$dismiss();
              	  									    $rootScope.retourEtatPrecedent();
              	  									})
              	  								} else {
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
      });
    }
  ]
);
