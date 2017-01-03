angular.module('uiRouterDbR.dataManager', [
  'ui.router', 'checklist-model'
])
  
.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        /////////////////
        // DataManager //
        /////////////////
        .state('dataManager', {

          abstract: true,
        	
          url: '/dataManager',
          
          templateUrl: 'Vues/dataManager/basesDataManager.html',

          resolve: {
        	  
        	  configuration: ['configuration',
      	                     function( configuration){
      	                       return  configuration.all() ;
      	                     }
      	      ] ,   
        	  
        	  utilisateurDataManagerAuthentifie: ['DataManagerFactory','configuration',
         	             	              function(DataManagerFactory , configuration){
         	             	            return  DataManagerFactory.UtilisateurDataManagerOk();
         	             	          }
         	  ] ,
         	  
         	  
         	  basesDataManager: ['DataManagerFactory','configuration',
	             	     function(DataManagerFactory , configuration){
								var urlSession = 'http://data.plantnet-project.org/_session';	
								var urlRequete = 'http://data.plantnet-project.org/';	  
	             	            return  DataManagerFactory.baseUtilisateurDataManager(urlSession,urlRequete);
	             	     }
         	  ]  ,
         	  
              importationsEnCours: ['DataManagerFactory','configuration',
                            function(DataManagerFactory , configuration){
           	             		return  DataManagerFactory.importBasesDataManagerEnCours();
           	          		}
           	  ] 
          },
          controller: [           '$rootScope', '$scope', '$interval', '$state', 'basesDataManager','importationsEnCours', 'utils', 'DataManagerFactory',
                       function (  $rootScope ,  $scope,   $interval ,  $state,   basesDataManager , importationsEnCours,  utils ,  DataManagerFactory  ) {

                         $scope.basesDataManager = basesDataManager;
                    
                   	 	 if (!(angular.isUndefined(importationsEnCours[0])) && importationsEnCours[0].nombase != null ) {
                   	 		 	$rootScope.$emit('ImportationLancee');
                   	 			$rootScope.$emit('FinDemandeImportation');
                   	 	 };  
      
                         var rechercheImportationsEnCours;
                         
                         $scope.startRechercheImportationsEnCours = function() {
                          if (angular.isUndefined(rechercheImportationsEnCours)) { 
                           rechercheImportationsEnCours = $interval(function() 	{
                        	 enCours = DataManagerFactory.importBasesDataManagerEnCours();	
                        	 enCours.then(function(value) {
                        		 /*console.log(value[0]);
                        		 console.log(value[0].nombase);*/
                        		 if (!(angular.isUndefined(value[0])) && value[0].nombase != null ) {
                        			console.log('Importation Lancee pour : ' , value[0].nombase); 
                        			$rootScope.$emit('ImportationLancee');
                       	 			$rootScope.$emit('FinDemandeImportation');
                        		 } else { 
                        			if ($rootScope.flagDemandeImportationEnCours != true) {
                        				console.log('Importation pas lancee mais $rootScope.flagDemandeImportationEnCours = ' ,$rootScope.flagDemandeImportationEnCours); 
                        				$rootScope.$emit('ImportationTerminee');
                        			}
                        			else {
                        				console.log('Importation pas lancee mais $rootScope.flagDemandeImportationEnCours = ' ,$rootScope.flagDemandeImportationEnCours);
                        				$rootScope.$emit('ImportationLancee');
                        			}
                        		 }
                        	 });  
                         
                           }, 20000, 60);// 20000 60 Toutes les 20 secondes pendant 20 minutes
                          }
                         };
                         
                         $scope.LancerRechercheImportationsEnCours = function() {
                        	 $scope.stopRechercheImportationsEnCours();
                        	 $scope.startRechercheImportationsEnCours();
     	  				 };
                        	
     	  				 $scope.stopRechercheImportationsEnCours = function() {
                             if (angular.isDefined(rechercheImportationsEnCours)) {
                               $interval.cancel(rechercheImportationsEnCours);
                               rechercheImportationsEnCours = undefined;
                             }
                         };
     	  				 
                         $scope.$on('$destroy', function() {
                             // Pour être sùr que $interval soit stopé à la sortie de la page
                             $scope.stopRechercheImportationsEnCours();
                         });
                       
                       }
          ]
         

       
        })
        
        ///////////////////////////////////////////////////
        // DataManager : Liste des bases de DataManager  //
        ///////////////////////////////////////////////////

        // Using a '.' within a state name declares a child within a parent.
        // So you have a new state 'list' within the parent 'tables' state.
        .state('dataManager.liste', {

          // Using an empty url means that this child state will become active
          // when its parent's url is navigated to. Urls of child states are
          // automatically appended to the urls of their parent. So this state's
          // url is '/tables' (because '/tables' + '').
          url: '',

          // IMPORTANT: Now we have a state that is not a top level state. Its
          // template will be inserted into the ui-view within this state's
          // parent's template; so the ui-view within tables.html. This is the
          // most important thing to remember about templates.
          templateUrl: 'Vues/dataManager/basesDataManager.liste.html' ,
          
          controller: [           '$scope',
                       function (  $scope ) {
        	  						
        	  $scope.bibi = function() {
 					console.log('jai clicker');
 					$scope.$emit('someEvent', [1,2,3]);
 				};
                         
                                  }
          ]
        
        })
        
        //////////////////////////////////////////////////////
        // DataManager : détail d'une bases de DataManager  //
        //////////////////////////////////////////////////////


        .state('dataManager.detail', {

          
          url: '/{baseDataManagerId}',

          resolve: {
        	      	  
        	  detailBaseDataManager: [        'DataManagerFactory','$stateParams',
        	             	          function(DataManagerFactory , $stateParams){
        								var urlSession = 'http://data.plantnet-project.org/_session';		  
        								var urlRequete = 'http://data.plantnet-project.org'
        							    return  DataManagerFactory.detailBaseDataManager(urlSession,urlRequete,$stateParams.baseDataManagerId);	
        	  						  }
        	  ],
        	  
        	  detailImportationsBaseDataManager: [        'DataManagerFactory','$stateParams',
        	                                      function(DataManagerFactory , $stateParams){
                									return  DataManagerFactory.detailImportationsBaseDataManager($stateParams.baseDataManagerId);	
                	          					  }
              ] 
        
          },
          
          
          views: {

            //'': {  
        	'detailStructures': {  
              templateUrl: 'Vues/dataManager/basesDataManager.detail.structures.html',
              controller: ['$scope', '$state', '$stateParams', 'detailBaseDataManager',
                function (  $scope ,  $state ,  $stateParams,   detailBaseDataManager) {
            	  //$scope.nomDeLaBaseSelectionnee = $stateParams.baseDataManagerId;
                  $scope.structuresDeLaBaseSelectionnee = detailBaseDataManager;
                  $state.structuresDeLaBaseSelectionnee = detailBaseDataManager;
                }]
            },
            
            'detailImportations': {  
                templateUrl: 'Vues/dataManager/basesDataManager.detail.importations.html',
                controller: ['$scope', '$stateParams', 'detailImportationsBaseDataManager',
                  function (  $scope,   $stateParams,   detailImportationsBaseDataManager) {
                	 $scope.importationsDeLaBaseSelectionnee = detailImportationsBaseDataManager;
                  }]
              },
              
            /*// This one is targeting the ui-view="menuTip" within the parent state's template.
            'menuTip': {
              // templateProvider is the final method for supplying a template.
              // There is: template, templateUrl, and templateProvider.
              templateProvider: ['$stateParams',
                function (        $stateParams) {
                  // This is just to demonstrate that $stateParams injection works for templateProvider.
                  // $stateParams are the parameters for the new state we're transitioning to, even
                  // though the global '$stateParams' has not been updated yet.
                 return '<hr><div>Détails de la base DataManager : ' + $stateParams.baseDataManagerId + '</div>';
                }]
            },*/
            'importIdentification': {
                templateProvider: ['$stateParams',
                  function (        $stateParams) {
              	  return "<hr><h4>{{ 'DATAMANAGER_DETAIL_IMPORTATIONS' | translate }} : <strong>{{nomBase}}</strong></h4>";
                  }] ,
                controller: ['$scope',  '$stateParams', 'requetes',
                  function (  $scope ,   $stateParams ,  requetes ) {
                           	  $scope.nomBase = $stateParams.baseDataManagerId ;
                  }
                ]  
              }
          }
        })
        
        
        ///////////////////////////////////////////////////////////
        // DataManager : importation d'une bases de DataManager  //
        ///////////////////////////////////////////////////////////

        .state('dataManager.detail.nouvelleImportation', {

          
          url: '/nouvelleImportation',
          
          onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
              $modal.open({
                  templateUrl: 'Vues/dataManager/basesDataManager.detail.nouvelleImportation.choixImportation.html',
                  
                  controller: [            '$rootScope','$scope', '$state', '$stateParams', 'DataManagerFactory',
                                function (  $rootScope , $scope,   $state ,  $stateParams ,  DataManagerFactory) {
                	                $scope.listeStructuresAImporter = $state.structuresDeLaBaseSelectionnee ;
                	       
                	  			  	$scope.choixImportation = {
                	  			  		    structuresAImporter : DataManagerFactory.structuresAImporter($state.structuresDeLaBaseSelectionnee),
                	  			  			nomNouvelleBase : angular.lowercase($stateParams.baseDataManagerId)
                	  			  	};
                	  			   
                	  			    //console.log(JSON.stringify($scope.listeStructuresAImporter, null, 4));
                	  			    //console.log(JSON.stringify($scope.choixImportation.structuresAImporter, null, 4));
                	  			    
                	  			  	$scope.annulation = function() {
                	  			  		$scope.$dismiss();
                	  			  		// $rootScope.retourEtatPrecedent();
                	  			  		$state.go('dataManager.liste');    
                	  			  	};
                	  			  	
                	  			  	$scope.importation = function (validationOk , choixImportation) {
                	  			  		if (validationOk) {
                	  			  			var urlSession = 'http://data.plantnet-project.org/_session';		  
                     	                	var urlRequete = 'http://data.plantnet-project.org';
                     	                	console.log('je lance le service');
                     	                	DataManagerFactory.importBaseDataManager(urlSession,urlRequete,$stateParams.baseDataManagerId,choixImportation.structuresAImporter, choixImportation.nomNouvelleBase);
                     	                	$scope.$dismiss();
                	  			  			$state.go('dataManager.liste');    	
                	  			  		} else {
                	  			  			$scope.submitted = true;	
                	  			  		}	
                	  			  	};
        	  						
        	  						
                  				}
                  ]        
              })   
          }]
          
        })
        
        ///////////////////////////////////////////////////////////
        // DataManager : suppression du détail d'une importation //
        ///////////////////////////////////////////////////////////

        .state('dataManager.detail.supprimerDetailImportBase', {

          
          url: '/{detailId}',
          
          onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
              $modal.open({
                  templateUrl: 'Vues/dataManager/basesDataManager.detail.importations.detailsImportation.supprimer.html',
                  
                  controller: [            '$rootScope','$scope', '$state', '$stateParams', 'DataManagerFactory', 'baseSelectionnee',
                                function (  $rootScope , $scope,   $state ,  $stateParams ,  DataManagerFactory ,  baseSelectionnee ) {
                	                
                	                
                	                $scope.detailId = $stateParams.detailId;
                	                
                	                $scope.annulation = function() {
                	  			  		$scope.$dismiss();
                	  			  		$state.go('dataManager.detail');    
                	  			  	};
                	  			  	
                	  			  	$scope.suppressionDetailImportBase = function (BasePourSuppression ,dateImport) {
                	  			  			console.log('Suppression détail importation base lancée');
                	  			  			DataManagerFactory.suppressionDetailBaseImportee(BasePourSuppression , dateImport).then(function () {
                	  			  				$scope.$dismiss();
                	  			  				console.log('Retour suppression détail importation base');
                	  			  				// $rootScope.retourEtatPrecedent();
                	  			  				// $state.go('dataManager.liste');
                	  			  				$state.go('dataManager.detail' , BasePourSuppression , {reload: true});
                	  			  			});
                	  			  	};
                  				}
                  ]        
              })   
          }]
          
        })
        
        ////////////////////////////////////////////////////////////////////////
        // DataManager : détail d'une importation d'une bases de DataManager  //
        ////////////////////////////////////////////////////////////////////////


        .state('dataManager.detail.detailsImportation', {
      
          url: '/detailsImportation/:importationId',
          
          views: {

            'detailDetailsImportation': {  
                templateUrl: 'Vues/dataManager/basesDataManager.detail.importations.detailsImportation.html',
                controller: ['$scope', '$stateParams', '$state', 'DataManagerFactory',
                  function (  $scope,   $stateParams,   $state ,  DataManagerFactory) {
                	 console.log('coucou de detailDetailsImportation');
                	 $scope.importationSelectionne = DataManagerFactory.selectionImportation($scope.importationsDeLaBaseSelectionnee, $stateParams.importationId);
                	 $scope.struturesImportationSelectionne = [] ;
                	 $scope.struturesImportationSelectionne = $scope.importationSelectionne.detailstructuresimportees.split(",") ;
                	 console.log('struturesImportationSelectionne');
                  } 
                ]
        
            }
        
        
          }
        })
        
        ///////////////////////////////////////////////////////////////
        // DataManager : Identification utilisateur de DataManager   //
        ///////////////////////////////////////////////////////////////

        .state('identificationUtilisateurDataManager', {

          
          url: 'identificationUtilisateurDataManager',

          onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
              $modal.open({
                  templateUrl: 'Vues/dataManager/connexionDataManager.html',
                  
                  controller: [            '$rootScope','$scope', '$state','DataManagerFactory',
                                function (  $rootScope , $scope,   $state , DataManagerFactory) {
        	  
                	  			  	$scope.signatureUtilisateurDataManager = {
                	  			  			name: '',
                	  			  			password: ''
                	  			  	};
          	  						
                	  			  	$scope.connexion = function (validationOk , signatureUtilisateurDataManager) {
                	  			  		if (validationOk) {
                	  			  				DataManagerFactory.connexionDataManagerOk('http://data.plantnet-project.org/_session',signatureUtilisateurDataManager.name, signatureUtilisateurDataManager.password).then(function () {
                	  			  				$scope.$dismiss();
                	  			  				// Appel de la fonction retourEtatPrecedent pour être redirigé vers l'état
                	  			  				//  précédant la demande de connexion
                	  			  				$rootScope.retourEtatPrecedent();  
                	  			  			})
                	  			  		} else {
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
        
  }   
   
  ]
);
