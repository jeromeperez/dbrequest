angular.module('uiRouterDbR.tables', [
  'ui.router'
])
  
.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        ////////////
        // Tables //
        ////////////
        .state('tables', {

          // Avec abstract = true, cet état ne peut pas être apellé explicitement.
          // il ne peut être appelé que par l'activation d'un de ces enfants.
          abstract: true,

          // Cet état va faire précédé par /tables tous les url des enfants.
          url: '/tables',

          // Cette vue va être insérée dans ui-view de index.html
          templateUrl: 'Vues/tables/tables.html',
          // On utilise resolve pour résoudre toutes les dépendances asynchrones du contrôleur.
          //  exemple : ici le contrôleur attendra que tables.all() soit résolu avant l'instanciation. 
          
          data: {
              permissionsNecessaires : ['admin','redacteur']
          } ,
          
          resolve: {
        	  
        	configuration: ['configuration',
        	                     function( configuration){
        	                       return  configuration.all() ;
        	                     }
        	] ,   
        	  
        	utilisateurAuthentifie: [ 'AuthFactory','configuration',
        	             	  function(AuthFactory , configuration){
        	             	            return  AuthFactory.connexionOK();
        	             	          }
        	] ,
        	
        	utilisateurAutorise: ['$state','PermFactory','configuration',
        	                  function( $state, PermFactory , configuration){  
        	              				return  PermFactory.permissionsOK(this.data.permissionsNecessaires);
        	              	          }
        	            ] ,
        	
        	toutesLestables: [ 'tables', 'configuration' ,
        	          function( tables ,  configuration){
        				return tables.all();
        			}
        	],
        	
        	tousLesDetails: [ 'tables', 'toutesLestables','configuration',
        	        function(  tables ,  toutesLestables , configuration){
        	        	return tables.details();
        	        }
        	]
        
          },

          controller: ['$rootScope','$scope', '$state', 'tousLesDetails', 'toutesLestables', 'utils', '$translate' ,'basesDeDonnees',
                       'baseSelectionnee' ,
            function (  $rootScope , $scope ,  $state ,  tousLesDetails ,  toutesLestables,   utils ,  $translate  , basesDeDonnees ,
            		    baseSelectionnee ) {
              // Tous les enfants auront accès à "tables" c'est l'héritage du scope.
        	  $rootScope.baseSelectionnee = baseSelectionnee.getNomBaseSelectionnee() ;
        	  $scope.laBaseSelectionnee = $rootScope.baseSelectionnee ;
        	  $scope.tables = toutesLestables;
              $scope.tablesDetails = tousLesDetails;
            }]
        })

        ///////////////////
        // Table > List  //
        ///////////////////

        // En utilisant le '.' on déclare un nouvel état (enfant) dont le parent est "tables" 
        .state('tables.liste', {
          // En utilisant une url vide cet état enfant deviendra actif si on navigue sur l'url de 
          //  son parent car les urls des enfants sont rajoutés à celui de leur parent,
          //  l'url est donc '/tables'  parce que '/tables' + '' = '/tables' ).
          url: '',

          // Cette vue sera insérée dans le ui-view de son parent.
          //  Ici tables.html.
          templateUrl: 'Vues/tables/tables.liste.html'
        })

        /////////////////////
        // Tables > Detail //
        /////////////////////

        // Un autre enfant de "tables"
        .state('tables.detail', {
          // Les peuvent avoir des paramètres 
          url: '/{tableId}',
          // Avec l'option views on peut viser une autre vue. 
          //  Syntaxe : 'ici@ladedans' ui-view nommée 'ici' dans la vue de l'état 'ladedans'.
          views: {
            // Ici dans l'ui-view nom nommée du parent 
            '': {
              templateUrl: 'Vues/tables/tables.detail.html',
              controller: ['$scope', '$stateParams', 'utils',
                function (  $scope,   $stateParams,   utils) {
            	  var lesTables = $scope.tables;
            	  var lesChamps = $scope.tablesDetails;
                  $scope.tableSelectionnee = utils.findById(lesTables, $stateParams.tableId);
                  $scope.champsTableSelectionnee = utils.findListeById(lesChamps, $stateParams.tableId);
                }]
            },
         
            // Vise l'ui-view nommée commentaire d'un ancêtre (ici index.html).
            'commentaire@': {
              template: 'Détail de la table'
            },

            'tableIdentification': {
              templateProvider: ['$stateParams', 
                function (        $stateParams ) {
                  // return '<hr><a class="muted">' + "{{ 'TABLES_TABLE_SELECTIONNE' | translate }}" + ' : ' + $stateParams.tableId + '</a>' ;
                  return "<hr><h4>{{ 'TABLES_TABLE_SELECTIONNE' | translate }} : " + $stateParams.tableId + "</h4>";
                }]
            }
          }
        })
    }
  ]
);

