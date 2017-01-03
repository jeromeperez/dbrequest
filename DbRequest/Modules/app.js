angular.module('uiRouterDbR', [
  'uiRouterDbR.dbrequest.service',
  'uiRouterDbR.dbrequest.filtres',
  'uiRouterDbR.tables',
  'uiRouterDbR.tables.service',                             
  'uiRouterDbR.utilisateurs',
  'uiRouterDbR.utilisateurs.service',
  'uiRouterDbR.utilisateurs.filtres',
  'uiRouterDbR.requetes',
  'uiRouterDbR.requetes.service',
  'uiRouterDbR.requetes.filtres',
  'uiRouterDbR.utils.service',
  'uiRouterDbR.utilisateur.service',
  'uiRouterDbR.baseSelectionnee.service',
  'uiRouterDbR.authentification',
  'uiRouterDbR.authentification.service',
  'uiRouterDbR.permissions.service',
  'uiRouterDbR.dataManager',
  'uiRouterDbR.dataManager.service',
  'ui.router',
  'pascalprecht.translate',
  'checklist-model',
  'ui.bootstrap',
  'ngAnimate'
])

.run(
  [          '$rootScope', '$state', '$stateParams' , 'utilisateur', 'baseSelectionnee', 'AuthFactory', 'PermFactory', '$translate',
    function ($rootScope,   $state,   $stateParams  ,  utilisateur ,  baseSelectionnee ,  AuthFactory ,  PermFactory ,  $translate ) {
    // Ajout des références à $state et $stateParams dans le $rootScope
    //  pour y accéder dans toute l'application
    //  exemple : <li ng-class="{ active: $state.includes('utilisateurs') }"> va placer <li>
    //  en "actif"  si 'utilisateurs.list' ou un de ces descendants est actif.
    $rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;  
	
	$rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
		$rootScope.estConnecte = utilisateur.estConnecte() ;
		$rootScope.utilisateurConnecte = utilisateur.getNomUtilisateur() ;
		$rootScope.langueUtilisateurConnecte = utilisateur.getLangueUtilisateur() ;
		if ($rootScope.estConnecte) {
			$translate.use($rootScope.langueUtilisateurConnecte) ;
		}
		$rootScope.estRedacteur = utilisateur.estUn('redacteur') ;
		$rootScope.estAdmin = utilisateur.estUn('admin') ;
		$rootScope.baseSelectionneeOK = baseSelectionnee.estSelectionnee() ;
		if ($rootScope.baseSelectionneeOK) {
			$rootScope.baseSelectionnee = baseSelectionnee.getNomBaseSelectionnee() ;
		} else {
			$rootScope.baseSelectionnee = null ;
		}
		/*console.log($rootScope.baseSelectionneeOK);
		console.log($rootScope.baseSelectionnee);*/
		
        // Sauvegarde de l'état précédent 
		if (   toState.name != 'connexion' && toState.name != 'enregistrement' && toState.name != 'deconnexion' && toState.name != 'identificationUtilisateurDataManager' 
		  && fromState.name != 'connexion' && fromState.name != 'enregistrement' && fromState.name != 'deconnexion' && fromState.name != 'identificationUtilisateurDataManager') {	
			$rootScope.nomEtatPrecedent = fromState.name;
			$rootScope.paramsEtatPrecedent = fromParams;
		}
	});
	    
	$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams,error) {
		if (error.utilisateurAuthentifie === false) {
			$rootScope.nomEtatPrecedent = toState.name;
	        $rootScope.paramsEtatPrecedent = toParams;
			$state.go('connexion');
		} else {
				if (error.utilisateurAutorise === false) {
					$rootScope.nomEtatPrecedent = toState.name;
			        $rootScope.paramsEtatPrecedent = toParams;
					$state.go('autorisationInsufisante');	
				} else {
					if (error.utilisateurDataManagerAuthentifie === false) {
						$rootScope.nomEtatPrecedent = toState.name;
				        $rootScope.paramsEtatPrecedent = toParams;
						$state.go('identificationUtilisateurDataManager');
					} else {
						$state.go('erreur');
					}	
				}
		}
	});  
	
	// Fonction de retour pour les états ayant nécessité une connexion préalable
	$rootScope.retourEtatPrecedent = function() {
			if (angular.isUndefined($rootScope.nomEtatPrecedent) || $rootScope.nomEtatPrecedent == '') {
				$rootScope.nomEtatPrecedent = 'dbrequest';
			}
			$state.go($rootScope.nomEtatPrecedent,$rootScope.paramsEtatPrecedent,{reload: true});
    };
	
    }
  ]
)

.controller('ctrlTranslate', ['$translate', '$scope', '$rootScope', 'utilisateur',
                     function ($translate ,  $scope ,  $rootScope ,  utilisateur ) {
	$scope.changeLanguage = function (langKey) {
		utilisateur.setLangueUtilisateur(langKey);
	    $translate.use(langKey);
	};
	
	$rootScope.Commentaire = ' ' ;
	$rootScope.montrerCommentaire = false ;
	
	$rootScope.$on('Connexion', function(event, commentaire) { console.log(commentaire);
		$rootScope.Commentaire = commentaire ;
		$rootScope.montrerCommentaire = true;
		setTimeout(function() {
			$rootScope.montrerCommentaire = false;
	    }, 3000);
	});
	
	
	$rootScope.flagChargementEnCours = false ;
	
	$rootScope.$on('ChargementEnCours', function() {
		$rootScope.flagChargementEnCours = true;
	});
	$rootScope.$on('ChargementTermine', function() {
		$rootScope.flagChargementEnCours = false;
	});
	
	$rootScope.flagImportationEnCours = false ;
	$rootScope.flagDemandeImportationEnCours = false ;
	
	$rootScope.$on('ImportationLancee', function() {
		$rootScope.flagImportationEnCours = true;
	});
	$rootScope.$on('ImportationTerminee', function() {
		$rootScope.flagImportationEnCours = false;
	});
	$rootScope.$on('DebutDemandeImportation', function() {
		console.log('Flag demande pour une importation activé') ;
		$rootScope.flagDemandeImportationEnCours = true;
	});
	$rootScope.$on('FinDemandeImportation', function() {
		console.log('Flag demande pour une importation désactivé') ;
		$rootScope.flagDemandeImportationEnCours = false;
	});
	console.log('etape contrôleur root OK') ;
}])


.config(
  [          '$stateProvider', '$urlRouterProvider','$httpProvider', '$translateProvider',
    function ($stateProvider ,  $urlRouterProvider , $httpProvider ,  $translateProvider ) {
      
	  // HTTP : Permettre les requêtes HTTP "cross domain" 
	  $httpProvider.defaults.useXDomain = true;
	  // HTTP : Pour intercepter les requête HTTP en cours ...
	  $httpProvider.interceptors.push('interceptionHttp');
	  
	  // Translate : definir l'emplacement des fichiers de langue et la langue par défault
	  $translateProvider.useStaticFilesLoader({
		  prefix: 'Langages/',
		  suffix: '.json'
	  });  
	  $translateProvider.preferredLanguage('fr'); 

      // Pour configurer les redirections et les url invalides.
      $urlRouterProvider
        .when('/c?id', '/utilisateurs/:id')
        .when('/user/:id', '/utilisateurs/:id')
        .otherwise('/');
      
      //////////////////////////
      // State Configurations //
      //////////////////////////

      // Pour configurer les états.
      $stateProvider

        ///////////////
        // DbRequest //
        ///////////////

        .state("dbrequest", {

          // L'utilisation de l'URL "/" définit cet état comme étant le point de départ de l'application.
          url: "/",
          templateUrl: 'Vues/dbrequest/dbrequest.html',
          
          resolve: {
        	  
        	  configuration: ['configuration',
        	                     function( configuration){
        	                       return  configuration.all() ;
        	                     }
        	  ] , 
        	  
        	  lesBasesDeDonnees: ['configuration','basesDeDonnees',
                         function( configuration , basesDeDonnees){
                   return  basesDeDonnees.all();
                 }
              ]
          },
          
          controller: [           '$rootScope', '$scope', '$state', 'lesBasesDeDonnees' , 'basesDeDonnees' , 'baseSelectionnee' , 'utils', '$translate' ,
                       function (  $rootScope ,  $scope,   $state,   lesBasesDeDonnees  ,  basesDeDonnees  ,  baseSelectionnee  ,  utils ,  $translate ) {		
        	  				$scope.basesDeDonnees = lesBasesDeDonnees ;
            				$scope.selectionBase = function(nomBase){
            					baseSelectionnee.setBaseSelectionneeInfo(basesDeDonnees.get(nomBase)) ;
            					$rootScope.baseSelectionneeOK = true ;
            					$rootScope.baseSelectionnee = baseSelectionnee.getNomBaseSelectionnee() ;
            					$state.userListe = {user : 'moi'};
            					$state.go('tables.liste');
            				}; 
            				$scope.suppressionDeLaBase = function(nomBase){
            					console.log('SuppressionBaseImportee :');
            					$state.go("dbrequest.supprimerBase", { baseId : nomBase }, { reload: true });    	
            				}; 
            		   }
          ]
          
        })
        //////////////////////////////////////////////////////////////////
        // DbRequest : suppression d'une bases importée de DataManager  //
        //////////////////////////////////////////////////////////////////

        .state("dbrequest.supprimerBase", {

          
        	url: '/{baseId}',
          
          onEnter: ['$stateParams', '$state', '$modal', function($stateParams, $state, $modal) {
              $modal.open({
                  templateUrl: 'Vues/dbrequest/dbrequest.supprimerBase.confirmation.html',
                  
                  controller: [            '$rootScope','$scope', '$state', '$stateParams', 'DataManagerFactory', 'baseSelectionnee', 'basesDeDonnees' ,
                                function (  $rootScope , $scope,   $state ,  $stateParams ,  DataManagerFactory ,  baseSelectionnee ,  basesDeDonnees ) {
                	  	
                	  				$scope.baseDbRequest = $stateParams.baseId;
  	  			  	
                	  			  	$scope.annulation = function() {
                	  			  		$scope.$dismiss();
                	  			  		$rootScope.retourEtatPrecedent();
                	  			  	};
                	  			  	
                	  			  	$scope.suppressionBase = function (BasePourSuppression) {
                	  			  		basesDeDonnees.suppressionBaseImportee(BasePourSuppression).then(function () {
                	  			  			var laBaseSelectionnee = baseSelectionnee.getBaseSelectionneeInfo();
                	  			  			if (laBaseSelectionnee.id == BasePourSuppression) {
                	  			  				baseSelectionnee.deleteBaseSelectionneeInfo();
                	  			  			}
                	  			  			$rootScope.$broadcast('Suppression base OK');
                	  			  			$scope.$dismiss();
                	  			  			$rootScope.nomEtatPrecedent = 'dbrequest';
                	  			  			$rootScope.retourEtatPrecedent();
                	  			  		});
                	  			  		$rootScope.$broadcast('Suppression base KO');
                	  			  		$scope.$dismiss();
                	  			  		$rootScope.retourEtatPrecedent();
                	  			  	};
        	  						
        	  						
                  				}
                  ]        
              })   
          }]
          
        })

        //////////////
        // A propos //
        //////////////

        .state('a_propos', {
          url: '/a_propos',
          templateUrl: 'Vues/a_propos/a_propos.html',
     
          /*resolve: {
        	  		utilisateurAuthentifie: ['AuthFactory',
        	          function(AuthFactory){
        	            return  AuthFactory.connexionOK();
        	          }
        	  		]  
          },*/
          /*templateProvider: ['$timeout',
           function (        $timeout) {
            return $timeout(function () {
            	return '<p class="lead">A visiter :</p>' +
            	 '<ul>' +
            	  '<li><a href="http://amap.cirad.fr/fr/">L\'UMR AMAP</a></li>' +
                  '<li><a href="http://www.cirad.fr/">Le CIRAD</a></li>' +
                  '<li><a href="http://www.cnrs.fr/">Le CNRS</a></li>' +
                  '<li><a href="http://www.inra.fr/">L\'INRA</a></li>' +
                  '<li><a href="http://www.ird.fr/">L\'IRD</a></li>' +
                  '<li><a href="http://www.umontpellier.fr/">L\'UNIVERSITE DE MONTPELLIER</a></li>' +
                 '</ul>';
           }]*/
       
        })
        
       
      /////////////
      // Erreur  //
      /////////////

      .state("erreur", {
          url: "/erreur",
          templateUrl: 'Vues/erreurs/erreur_grave.html'
      })
      ////////////////////////////////
      // Autorisation insuffisante  //
      ////////////////////////////////

    .state("autorisationInsufisante", {
        url: "/autorisationInsufisante",
        templateUrl: 'Vues/erreurs/erreur_autorisation.html'
    })
    
      
    }
  ]
);
