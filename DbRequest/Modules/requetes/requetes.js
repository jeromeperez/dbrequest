angular.module('uiRouterDbR.requetes', [
  'ui.router'
])
  
.config(
  [          '$stateProvider', '$urlRouterProvider',
    function ($stateProvider,   $urlRouterProvider) {
      $stateProvider
        //////////////
        // Requêtes //
        //////////////
        .state('requetes', {
        	
          abstract: true,

          url: '/requetes',

          templateUrl: 'Vues/requetes/requetes.html',
          
          data: {
              permissionsNecessaires : ['admin','redacteur']
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
                          function( $state, PermFactory , configuration){  
              						  return  PermFactory.permissionsOK(this.data.permissionsNecessaires);
              	             	    }
            ] ,
              	
            listeRequetes: ['requetes','configuration',
                   function( requetes , configuration){
                			   return requetes.all();
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

          controller: ['$rootScope','$scope', '$state', 'listeRequetes', 'utils' ,'$translate' , 'basesDeDonnees' , 'baseSelectionnee' , 'utilisateur',
            function (  $rootScope , $scope,   $state,   listeRequetes,   utils ,  $translate  ,  basesDeDonnees ,   baseSelectionnee  ,  utilisateur ) {
        	  $rootScope.baseSelectionnee = baseSelectionnee.getNomBaseSelectionnee() ;
        	  $scope.laBaseSelectionnee = $rootScope.baseSelectionnee ;
              $scope.listeRequetes = listeRequetes;
              var utilisateurInfo = utilisateur.getUtilisateurInfo() ;
              var utilisateurEstUnAdmin = utilisateur.estUn('admin') ;
              if (utilisateurEstUnAdmin) {
            	  $state.utilisateurListe = {utilisateur : 'tous'};
            	  $state.listeAdmin = true;
              } else {
            	  $state.utilisateurListe = {utilisateur : utilisateurInfo.nomUtilisateur};
            	  $state.listeAdmin = false;
              }
              $state.triListe = {tri : 'toutes'};
            }]
        })

        ////////////////////////////////////////////////
        // Requêtes > Liste des requêtes de DbRequest //
        ////////////////////////////////////////////////
        
        .state('requetes.liste', {

          url: '',
          
          cache: false, // Pour le rechargement de la page
          
          templateUrl: 'Vues/requetes/requetes.liste.html',

          controller: ['$state','$scope','$translate' ,
              function ($state, $scope , $translate) {
        	  	$scope.utilisateurListe = $state.utilisateurListe ;
        	  	$scope.listeAdmin = $state.listeAdmin ;
        	  	$scope.triListe = $state.triListe ;
        	  	$scope.$watch(	function($scope) { return $scope.triListe.tri },
                            	function(newValue, oldValue) {
        		  					$state.triListe.tri = newValue;
                         		}
        	  	); 
        	  	$scope.requetesSelectionnees = [] ;
        	  	$state.requetesSelectionnees = $scope.requetesSelectionnees;
        	  	// Gestion pour les checkboxs des requêtes
                $scope.checkboxSuppRequete = function(){
                	// console.log($scope.requetesSelectionnees)
                };
        	  	
          }]
        })

        ///////////////////////
        // Requêtes > Detail //
        ///////////////////////
        .state('requetes.detail', {

          url: '/{requeteId}',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.html',
              resolve: {
            	  
            	  detailsRequeteChamps: ['$state', '$stateParams', 'requetes',
                          function( $state ,  $stateParams ,  requetes){  
            		  			return  requetes.getDetailsRequeteChamps($stateParams.requeteId);
                  	      }     
            	  ] ,
            	  detailsRequeteSelection: ['$state', '$stateParams', 'requetes',
            	                          function( $state ,  $stateParams ,  requetes){  
            	            		  			return  requetes.getDetailsRequeteSelection($stateParams.requeteId);
            	                  	      }     
            	  ] ,
            	  detailsRequeteTri: ['$state', '$stateParams', 'requetes',
            	            	          function( $state ,  $stateParams ,  requetes){  
            	            	            	return  requetes.getDetailsRequeteTri($stateParams.requeteId);
            	            	          }     
            	  ] ,   
            	  detailsRequeteJointure: ['$state', '$stateParams', 'requetes',
            	            	          function( $state ,  $stateParams ,  requetes){  
            	            	            	return  requetes.getDetailsRequeteJointure($stateParams.requeteId);
            	            	     	  }     
            	  ] ,
            	  detailsRequeteGroupBy: ['$state', '$stateParams', 'requetes',
            	                      	  function( $state ,  $stateParams ,  requetes){  
	            	            				return  requetes.getDetailsRequeteGroupBy($stateParams.requeteId);
	            	          			  }     
            	  ]  
              },
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'detailsRequeteChamps', 'detailsRequeteSelection',
                           'detailsRequeteTri', 'detailsRequeteJointure', 'detailsRequeteGroupBy', 'requetes', 'tables' ,  
                function (  $scope , $rootScope ,  $state   , $stateParams,   detailsRequeteChamps ,  detailsRequeteSelection ,
                		    detailsRequeteTri ,  detailsRequeteJointure ,  detailsRequeteGroupBy ,  requetes ,  tables ) {
            	  
            	  $scope.requete = requetes.get($scope.listeRequetes, $stateParams.requeteId) ;
            	  $scope.tables = tables.get() ;
            	  $scope.tablesSelectionnees = [] ;
            	  $scope.tablesSelectionneesAvecTousLesChamps = [] ;
            	  $scope.detailsRequeteChamps = detailsRequeteChamps.data ;
            	  $scope.detailsRequeteSelection = detailsRequeteSelection.data ;
            	  $scope.detailsRequeteTri = detailsRequeteTri.data ;
            	  $scope.detailsRequeteJointure = detailsRequeteJointure.data ;
            	  $scope.detailsRequeteGroupBy = detailsRequeteGroupBy.data ;
            	  $scope.champsTablesSelectionnees = [] ;
            	  // Pour la manipulation de la checkbox des champs sélectionnés
            	  $scope.utilisateurDuSQL = {
            			  selectTousLesChamps : [],
            			  champs : []
            	  } ;
            	  $scope.requeteModifiee = true ;
            	  $scope.donneesEnSortie = [] ;
            	  $scope.donneesEnSortieTmp = [] ;
            	  $scope.messages = [] ;
            	  $scope.executionOk = null ;
            	  
            	  // Initialisation des tables contenues dans la requête SQL
            	  //  et des champs selectionnés de la clause SELECT 
            	  for (var i = 0; i < $scope.detailsRequeteChamps.length; i++) {
            		  var nomDeLaTable = $scope.detailsRequeteChamps[i].nomtable ;
            		  var nomDuChamp = $scope.detailsRequeteChamps[i].nomchamp ;
            		  var champsDeLaTable = tables.getDetails(nomDeLaTable) ;
            		  var x = $scope.tablesSelectionnees.indexOf(nomDeLaTable) ;
            		  if (x == -1) {
            			  $scope.tablesSelectionnees.push(nomDeLaTable) ;
            			  $scope.champsTablesSelectionnees.push({nomtable : nomDeLaTable , champs : champsDeLaTable}) ;
            		  }
            		  for (var ii = 0; ii < champsDeLaTable.length; ii++) {
            			  if (champsDeLaTable[ii].attname == nomDuChamp ) {
            				  var champ = champsDeLaTable[ii] ;
            				  $scope.utilisateurDuSQL.champs.push(champ) ; 
            			  } ;
            		  } ;
            	  } ;
            	 
            	  $state.go('requetes.detail.constructeur') ; 
            	  
            	  $scope.executezRequete = function() {
            		  $scope.executionOk = requetes.executionRequete($stateParams.requeteId, $scope.tablesSelectionnees , $scope.detailsRequeteChamps , $scope.detailsRequeteSelection ,
                			  $scope.detailsRequeteJointure , $scope.detailsRequeteTri , $scope.detailsRequeteGroupBy)
                			  .then(function (reponse) {
                				  $scope.messages = [] ;
                				  $scope.donneesEnSortieTmp = reponse.data ;
                				  $scope.donneesEnSortieTmp.length ;
                				  var ligneMessage = 'Nombre de lignes extraites' + ' : ' + $scope.donneesEnSortieTmp.length  ;
                				  $scope.messages.push(ligneMessage);
                				  $scope.donneesEnSortie=[];
                				  for (var ii = 0; ii < 50; ii++) {
                					  if ($scope.donneesEnSortieTmp[ii] === undefined || $scope.donneesEnSortieTmp[ii] === null){
                						  ii = 50 ;
                					  }else {
                						  $scope.donneesEnSortie.push($scope.donneesEnSortieTmp[ii]);
                					  }
                				  } ;
                        		  $state.go('requetes.detail.editeur.donnees');
                			  }, function(err) {
                				  var erreur = err.data
                				  var ligneMessageErr = 'statutCode' +' : ' + erreur.statusCode ;
                				  $scope.messages.push(ligneMessageErr);
                				  var ligneMessageErr = 'error' +' : ' + erreur.error ;
                				  $scope.messages.push(ligneMessageErr);
                				  var ligneMessageErr = 'message' +' : ' + erreur.message ;
                				  $scope.messages.push(ligneMessageErr);
            		  			  $state.go('requetes.detail.editeur.messages');
                			  });
                  };  
                  
                  $scope.modifiezRequete = function() {
                	  requetes.modificationRequete($stateParams.requeteId, $scope.tablesSelectionnees , $scope.detailsRequeteChamps , $scope.detailsRequeteSelection ,
                			  $scope.detailsRequeteJointure , $scope.detailsRequeteTri , $scope.detailsRequeteGroupBy) ;
                  }; 
                  
                  $scope.telechargezRequete = function() {
                	  requetes.telechargementRequete($stateParams.requeteId, $scope.tablesSelectionnees , $scope.detailsRequeteChamps , $scope.detailsRequeteSelection ,
                			  $scope.detailsRequeteJointure , $scope.detailsRequeteTri , $scope.detailsRequeteGroupBy) ;
                  }; 
                  
                  $scope.telechargezResultat = function() {
                	  requetes.telechargementResultat($stateParams.requeteId, $scope.tablesSelectionnees , $scope.detailsRequeteChamps , $scope.detailsRequeteSelection ,
                			  $scope.detailsRequeteJointure , $scope.detailsRequeteTri , $scope.detailsRequeteGroupBy) ;
                  };  
                  
                }]
            },

            'requeteIdentification': {
              templateProvider: ['$stateParams',
                function (        $stateParams) {
            	  return "<hr><h4>{{ 'REQUETES_REQUETE_SELECTIONNEE' | translate }} : <strong>{{nomRequete}}</strong></h4>";
                }] ,
              controller: ['$scope',  '$stateParams', 'requetes',
                function (  $scope ,   $stateParams ,  requetes ) {
                         	  $scope.nomRequete = requetes.get($scope.listeRequetes, $stateParams.requeteId).nomrequete ;
                }
              ]  
            }
          }
        })
        //////////////////////////////////////
        // Requêtes > Detail > Constructeur //
        //////////////////////////////////////
        .state('requetes.detail.constructeur', {

          url: '/detail/constructeur',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.constructeur.html',
              
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'requetes', 'tables' , 
                function (  $scope , $rootScope ,  $state  ,  $stateParams ,  requetes ,  tables) {

            	  $state.go('requetes.detail.constructeur.champs'); 
                  // Gestion pour les checkboxs des tables
                  $scope.checkboxModifTable = function(){
                	  // Ajout d'une nouvelle table ?
                	  var tableTrouveOK = false ;
                	  for (var i = 0; i < $scope.tablesSelectionnees.length; i++) {
                		  tableTrouveOK = false ;
                		  for (var ii = 0; ii < $scope.champsTablesSelectionnees.length; ii++) {
                			  if ($scope.champsTablesSelectionnees[ii].nomtable == $scope.tablesSelectionnees[i]) { 
                			  		tableTrouveOK = true ;
                			  } ;
                		  } ;
                		  if (tableTrouveOK == false ){
                			  var champsDeLaTable = tables.getDetails($scope.tablesSelectionnees[i]) ;
                			  $scope.champsTablesSelectionnees.push({nomtable : $scope.tablesSelectionnees[i] , champs : champsDeLaTable}) ;	  
                			  return ;
                		  } ;
                      }
                	  // Supression d'une table ?
                	  var tableTrouveOK = false ;
                	  for (var i = 0; i < $scope.champsTablesSelectionnees.length; i++) {
                		  tableTrouveOK = false ;
                		  for (var ii = 0; ii < $scope.tablesSelectionnees.length; ii++) {
                			  if ($scope.tablesSelectionnees[ii] == $scope.champsTablesSelectionnees[i].nomtable ) { 
                			  		tableTrouveOK = true ;
                			  } ;
                		  } ;
                		  if (tableTrouveOK == false ){
                			  // supression des champs qui auraient été sélectionnés
                			  for (var ii = $scope.detailsRequeteChamps.length - 1 ;ii > -1; ii--) {
                    			  if ($scope.detailsRequeteChamps[ii].nomtable == $scope.champsTablesSelectionnees[i].nomtable ) { 
                    				  $scope.detailsRequeteChamps.splice(ii,1) ;
                    				  $scope.requeteModifiee = true ;
                    			  } ;
                    		  } ;
                    		// la table est elle utilisée dans la selection, le tri ou la jointure
                			  for (var iii = $scope.detailsRequeteSelection.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteSelection[iii].nomtable == $scope.champsTablesSelectionnees[i].nomtable
                					  	  || $scope.detailsRequeteSelection[iii].valeurnomtable == $scope.champsTablesSelectionnees[i].nomtable){
                					  $scope.detailsRequeteSelection.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteTri.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteTri[iii].nomtable == $scope.champsTablesSelectionnees[i].nomtable) {
                					  $scope.detailsRequeteTri.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteJointure.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteJointure[iii].nomtablesource == $scope.champsTablesSelectionnees[i].nomtable
                						  || $scope.detailsRequeteJointure[iii].nomtabledestination == $scope.champsTablesSelectionnees[i].nomtable){
                					  $scope.detailsRequeteJointure.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteGroupBy.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteGroupBy[iii].nomtable == $scope.champsTablesSelectionnees[i].nomtable) {
                					  $scope.detailsRequeteGroupBy.splice(iii,1);		
                				  } ; 
                			  };
                    		  for (var ii = $scope.utilisateurDuSQL.champs.length - 1 ;ii > -1; ii--) {
                    			  // console.log(JSON.stringify($scope.utilisateurDuSQL.champs[ii].relname, null, 4)) ;
                    			  if ($scope.utilisateurDuSQL.champs[ii].relname == $scope.champsTablesSelectionnees[i].nomtable ) { 
                    				  $scope.utilisateurDuSQL.champs.splice(ii,1) ;
                    			  } ;
                    		  } ;
                    		  // supression de la liste des tables sélectionnées avec tout leur champs
                    		  for (var ii = $scope.utilisateurDuSQL.selectTousLesChamps.length - 1 ;ii > -1; ii--) {
                    			  if ($scope.utilisateurDuSQL.selectTousLesChamps[ii].nomtable == $scope.champsTablesSelectionnees[i].nomtable){
                    				  $scope.utilisateurDuSQL.selectTousLesChamps.splice(ii,1);	
                    			  } ;
                    		  } ;
                    		  // supression de la liste des tables sélectionnées avec tout leur champs
                    		  for (var ii = $scope.tablesSelectionneesAvecTousLesChamps.length - 1 ;ii > -1; ii--) {
                    			  if ($scope.tablesSelectionneesAvecTousLesChamps[ii] == $scope.champsTablesSelectionnees[i].nomtable){
                    				  $scope.tablesSelectionneesAvecTousLesChamps.splice(ii,1);	
                    			  } ;
                    		  } ;
                    		  // supression de la liste des champs de la table sélectionnées
                    		  $scope.champsTablesSelectionnees.splice(i,1);
                			  return ;
                		  } ;
                	  }
                  }	;
                  
                  // Gestion pour la checkbox pour sélection de tous les champs de la table
            	  $scope.checkboxSelectTousLesChamps = function(){
            		  // Sélection de tous les champs ?
                	  var selectionTousTrouveOK = false ;
                	  for (var i = 0; i < $scope.utilisateurDuSQL.selectTousLesChamps.length; i++) {
                		  selectionTousTrouveOK = false ;
                		  for (var ii = 0; ii < $scope.tablesSelectionneesAvecTousLesChamps.length; ii++) {
                			  if ($scope.utilisateurDuSQL.selectTousLesChamps[i].nomtable == $scope.tablesSelectionneesAvecTousLesChamps[ii]){
                				  selectionTousTrouveOK = true ;
                			  } ;
                		  } ;
                		  if (selectionTousTrouveOK == false ){
                			  // console.log('Pas trouvé');
                			  // console.log($scope.utilisateurDuSQL.selectTousLesChamps);
                			  $scope.tablesSelectionneesAvecTousLesChamps.push($scope.utilisateurDuSQL.selectTousLesChamps[i].nomtable) ;	
                			  // console.log($scope.tablesSelectionneesAvecTousLesChamps);
                			  
                			  for (var ii = 0; ii < $scope.champsTablesSelectionnees.length; ii++) {
          			  			if ($scope.champsTablesSelectionnees[ii].nomtable == $scope.utilisateurDuSQL.selectTousLesChamps[i].nomtable){
          			  				for (var iii = 0; iii < $scope.champsTablesSelectionnees[ii].champs.length; iii++) {
          			  					
          			  					champTrouveOK = false ;
          			  					for (var iiii = 0; iiii < $scope.detailsRequeteChamps.length; iiii++) {
          			  						if ($scope.utilisateurDuSQL.selectTousLesChamps[i].nomtable == $scope.detailsRequeteChamps[iiii].nomtable
          			  							&& $scope.champsTablesSelectionnees[ii].champs[iii].attname == $scope.detailsRequeteChamps[iiii].nomchamp ){
          			  							champTrouveOK = true ;
          			  						} ;
          			  					} ;
          			  					if (champTrouveOK == false ) {
          			  						var x = 1 ;
          			  						for (var iiiii = 0; iiiii < $scope.detailsRequeteChamps.length; iiiii++) {
          			  							if ($scope.detailsRequeteChamps[iiiii].idchamp >= x){
          			  								x = $scope.detailsRequeteChamps[iiiii].idchamp + 1
          			  							} ;
          			  						} ;
          			  						var champ = {
          			  									idrequete : $stateParams.requeteId ,
          			  									idchamp : x ,
          			  									nomchamp : $scope.champsTablesSelectionnees[ii].champs[iii].attname ,
          			  									nomtable : $scope.utilisateurDuSQL.selectTousLesChamps[i].nomtable ,
          			  									agregateur : ' ' ,
          			  									alias : ' '
          			  						};
          			  						$scope.detailsRequeteChamps.push(champ) ;
          			  						$scope.utilisateurDuSQL.champs.push($scope.champsTablesSelectionnees[ii].champs[iii]) ;
          			  						
          			  					};
          			  				};
          			  			};
          			  	      };
                              
                              $scope.requeteModifiee = true ;
                		  } ;
                	  } ;
                	  // Désélection de tous les champs ?
                	  var selectionTousTrouveOK = false ;
                	  for (var i = 0; i < $scope.tablesSelectionneesAvecTousLesChamps.length; i++) {
                		  selectionTousTrouveOK = false ;
                		  for (var ii = 0; ii < $scope.utilisateurDuSQL.selectTousLesChamps.length; ii++) {
                			  if ($scope.utilisateurDuSQL.selectTousLesChamps[ii].nomtable == $scope.tablesSelectionneesAvecTousLesChamps[i] ) { 
                				  selectionTousTrouveOK = true ;
                			  } ;
                		  } ;
                		  if (selectionTousTrouveOK == false ){
                			  
                			  // supression des champs qui auraient été sélectionnés
                			  for (var ii = $scope.detailsRequeteChamps.length - 1 ;ii > -1; ii--) {
                    			  if ($scope.detailsRequeteChamps[ii].nomtable == $scope.tablesSelectionneesAvecTousLesChamps[i] ) { 
                    				  $scope.detailsRequeteChamps.splice(ii,1) ;
                    				  // console.log('Trouvé');
                    				  $scope.requeteModifiee = true ;
                    			  } ;
                    		  } ;
                    		// la table est elle utilisée dans la selection, le tri ou la jointure
                			  for (var iii = $scope.detailsRequeteSelection.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteSelection[iii].nomtable == $scope.tablesSelectionneesAvecTousLesChamps[i]
                					  	  || $scope.detailsRequeteSelection[iii].valeurnomtable == $scope.tablesSelectionneesAvecTousLesChamps[i]){
                					  $scope.detailsRequeteSelection.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteTri.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteTri[iii].nomtable == $scope.tablesSelectionneesAvecTousLesChamps[i]) {
                					  $scope.detailsRequeteTri.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteJointure.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteJointure[iii].nomtablesource == $scope.tablesSelectionneesAvecTousLesChamps[i]
                						  || $scope.detailsRequeteJointure[iii].nomtabledestination == $scope.tablesSelectionneesAvecTousLesChamps[i]){
                					  $scope.detailsRequeteJointure.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteGroupBy.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteGroupBy[iii].nomtable == $scope.tablesSelectionneesAvecTousLesChamps[i]) {
                					  $scope.detailsRequeteGroupBy.splice(iii,1);		
                				  } ; 
                			  };
                    		  for (var ii = $scope.utilisateurDuSQL.champs.length - 1 ;ii > -1; ii--) {
                    			  // console.log(JSON.stringify($scope.utilisateurDuSQL.champs[ii].relname, null, 4)) ;
                    			  if ($scope.utilisateurDuSQL.champs[ii].relname == $scope.tablesSelectionneesAvecTousLesChamps[i] ) { 
                    				  $scope.utilisateurDuSQL.champs.splice(ii,1) ;
                    			  } ;
                    		  } ;
                    		  // supression de la liste des tables entiérement sélectionnées
                    		  $scope.tablesSelectionneesAvecTousLesChamps.splice(i,1);
                			  return ;
                		  } ;
                	  }
                  
                	  
            	  } ;
            	  
                  // Gestion pour les checkboxs des champs
                  $scope.checkboxModifChamp = function(){
                	  // Ajout d'un nouveau champ ?
                	  var champTrouveOK = false ;
                	  for (var i = 0; i < $scope.utilisateurDuSQL.champs.length; i++) {
                		  champTrouveOK = false ;
                		  for (var ii = 0; ii < $scope.detailsRequeteChamps.length; ii++) {
                			  if ($scope.utilisateurDuSQL.champs[i].relname == $scope.detailsRequeteChamps[ii].nomtable
                					  && $scope.utilisateurDuSQL.champs[i].attname == $scope.detailsRequeteChamps[ii].nomchamp ){
                				  champTrouveOK = true ;
                			  } ;
                		  } ;
                		  if (champTrouveOK == false ){
                			  var x = 1 ;
                			  for (var ii = 0; ii < $scope.detailsRequeteChamps.length; ii++) {
                				  if ($scope.detailsRequeteChamps[ii].idchamp >= x){
                					  x = $scope.detailsRequeteChamps[ii].idchamp + 1
                				  } ;
                			  } ;
                              var champ = {
                        			  		idrequete : $stateParams.requeteId ,
                                      		idchamp : x ,
                                            nomchamp : $scope.utilisateurDuSQL.champs[i].attname ,
                                            nomtable : $scope.utilisateurDuSQL.champs[i].relname ,
                                            agregateur : ' ' ,
                                            alias : ' '
                              			  }
                			  $scope.detailsRequeteChamps.push(champ) ;
                              $scope.requeteModifiee = true ;
                			  return ;
                		  } ;
                	  } ;
                	  
                	// suppression d'un champ ?
                	  var champTrouveOK = false ;
                	  for (var i = 0; i < $scope.detailsRequeteChamps.length; i++) {
                		  champTrouveOK = false ;
                		  for (var ii = 0; ii < $scope.utilisateurDuSQL.champs.length; ii++) {
                			  if ($scope.detailsRequeteChamps[i].nomtable == $scope.utilisateurDuSQL.champs[ii].relname
                					  && $scope.detailsRequeteChamps[i].nomchamp == $scope.utilisateurDuSQL.champs[ii].attname ){
                				  champTrouveOK = true ;
                			  } ;
                		  } ;
                		  if (champTrouveOK == false ){
                			  // le champ est il utilisé dans la selection, le tri ou la jointure
                			  for (var iii = $scope.detailsRequeteSelection.length - 1 ;iii > -1; iii--) {
                				  if (($scope.detailsRequeteSelection[iii].nomtable == $scope.detailsRequeteChamps[i].nomtable
                						  && $scope.detailsRequeteSelection[iii].nomchamp == $scope.detailsRequeteChamps[i].nomchamp)
                					  	  || ($scope.detailsRequeteSelection[iii].valeurnomtable == $scope.detailsRequeteChamps[i].nomtable
                						  && $scope.detailsRequeteSelection[iii].valeurnomchamp == $scope.detailsRequeteChamps[i].nomchamp))
                				  {
                					  $scope.detailsRequeteSelection.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteTri.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteTri[iii].nomtable == $scope.detailsRequeteChamps[i].nomtable
                						  && $scope.detailsRequeteTri[iii].nomchamp == $scope.detailsRequeteChamps[i].nomchamp){
                					  $scope.detailsRequeteTri.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteJointure.length - 1 ;iii > -1; iii--) {
                				  if (($scope.detailsRequeteJointure[iii].nomtablesource == $scope.detailsRequeteChamps[i].nomtable
                						  && $scope.detailsRequeteJointure[iii].nomchampsource == $scope.detailsRequeteChamps[i].nomchamp)
                					  	  || ($scope.detailsRequeteJointure[iii].nomtabledestination == $scope.detailsRequeteChamps[i].nomtable
                						  && $scope.detailsRequeteJointure[iii].nomchampdestination == $scope.detailsRequeteChamps[i].nomchamp))
                				  {
                					  $scope.detailsRequeteJointure.splice(iii,1);		
                				  } ; 
                			  };
                			  for (var iii = $scope.detailsRequeteGroupBy.length - 1 ;iii > -1; iii--) {
                				  if ($scope.detailsRequeteGroupBy[iii].nomtable == $scope.detailsRequeteChamps[i].nomtable
                						  && $scope.detailsRequeteGroupBy[iii].nomchamp == $scope.detailsRequeteChamps[i].nomchamp){
                					  $scope.detailsRequeteGroupBy.splice(iii,1);		
                				  } ; 
                			  };
                			  // Si la checkbox tout les champs avait été selectionné
                			  for (var iii = 0; iii < $scope.tablesSelectionneesAvecTousLesChamps.length; iii++) {
                        		  if ($scope.tablesSelectionneesAvecTousLesChamps[iii] == $scope.detailsRequeteChamps[i].nomtable ) { 
                        			  $scope.tablesSelectionneesAvecTousLesChamps.splice(iii,1);
                        		  } ; 
                			  }
                			  for (var iii = 0; iii < $scope.utilisateurDuSQL.selectTousLesChamps.length; iii++) {
                    			  if ($scope.utilisateurDuSQL.selectTousLesChamps[iii].nomtable == $scope.detailsRequeteChamps[i].nomtable  ) { 
                    				  $scope.utilisateurDuSQL.selectTousLesChamps.splice(iii,1);
                    			  } ;
                    		  } ;
                			  
                			  
                			  $scope.detailsRequeteChamps.splice(i,1);
                			  $scope.requeteModifiee = true ;
                			  // Re-Numérotation
                			  var id = [] ;
                			  for (var ii = $scope.detailsRequeteChamps.length - 1 ;ii > -1; ii--) {
                   				id.push($scope.detailsRequeteChamps[ii].idchamp) ;
                   			  } ;
                   			  id.sort();
                   			  for (var ii = 0; ii < $scope.detailsRequeteChamps.length; ii++) {
                   				$scope.detailsRequeteChamps[ii].idchamp = id.indexOf($scope.detailsRequeteChamps[ii].idchamp) + 1 ;
                  			  } ;
                			  return ;
                		  } ;
                	  } ;
                  } ;
                  
                }]
            }    
          }
        })
        
        //////////////////////////////////////////////////////////////
        // Requêtes > Detail > Constructeur > Champs sélectionnés //
        //////////////////////////////////////////////////////////////
        .state('requetes.detail.constructeur.champs', {

          url: '/detail/constructeur/champs',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.constructeur.champs.html',
              
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'requetes', '$modal','$translate' ,
                function (  $scope , $rootScope ,  $state   , $stateParams,   requetes ,  $modal , $translate ) {
            	
            	  $scope.idChampSelectionne = null;
            	  $scope.selectionChamp = function (idChampSelectionne) {
            		  if ($scope.idChampSelectionne != null && $scope.idChampSelectionne == idChampSelectionne) {
            			  $scope.idChampSelectionne = null ;
            		  } else {
            			  $scope.idChampSelectionne = idChampSelectionne;
            		  } ;
            	  }; 
            	  $scope.selectionAlias = function (idChamp) {

					  for (var i = 0; i < $scope.detailsRequeteChamps.length; i++) {
						  if ($scope.detailsRequeteChamps[i].idchamp == idChamp) {
							  $scope.aliasInitial = $scope.detailsRequeteChamps[i].alias ;
					  	  };
		  			  };
		  			  $scope.enregistrementUtilisateur = {
		  					aliasUtilisateur : $scope.aliasInitial
	  			  	  };
					  
            		  $modal.open({
        				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.champs.choixAlias.html',
        				  size: 'lg',
        				  scope: $scope ,
        				  controller: ['$scope',
        				    function (  $scope ) {
        					  
        		                $scope.selectionAlias = function (validationOk , enregistrementAliasUtilisateur) {
        		                	if (validationOk) {
        		                		console.log(idChamp);
        		                		console.log(enregistrementAliasUtilisateur.aliasUtilisateur);
        		                		for (var i = 0; i < $scope.detailsRequeteChamps.length; i++) {
            				  				if ($scope.detailsRequeteChamps[i].idchamp == idChamp) {
            				  					// console.log(enregistrementAliasUtilisateur.aliasUtilisateur);
            				  					$scope.detailsRequeteChamps[i].alias = enregistrementAliasUtilisateur.aliasUtilisateur ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                	  			  			   
            								
                	  			  	} else {
                	  			  		$scope.submitted = true;	
                	  			  	}	
        		                };
        				    }    
        			      ]       
        		      });	  
            	  }; 
            	  $scope.selectionAgregateur = function (idChamp) {
                		$modal.open({
        				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.champs.choixAgregateur.html',
        				  size: 'xs',
        				  scope: $scope ,
        				  controller: ['$scope',
        				    function (  $scope ) {
        				  		$scope.listeAgregateurs = [' ','AVG','COUNT','MIN','MAX','SUM'];
        				  		
        		                $scope.selectionAgregateur = function (agregateurSelectionne) {
        		                	console.log('agregateurSelectionne');
        		                	console.log(agregateurSelectionne);
            				  		for (var i = 0; i < $scope.detailsRequeteChamps.length; i++) {
            				  			console.log(idChamp);
            				  			console.log($scope.detailsRequeteChamps[i].idchamp);
        				  				if ($scope.detailsRequeteChamps[i].idchamp == idChamp) {
        				  					$scope.detailsRequeteChamps[i].agregateur = agregateurSelectionne ;
        				  					console.log($scope.detailsRequeteChamps[i].agregateur);
        				  				};
        				  			};
            				  		$scope.$dismiss();
            		            }; 			
        				    }    
        			      ]       
        		        });
            		  
              	  }; 
            	  
            	  $scope.monterChamp = function () {
             		 if ($scope.idChampSelectionne != null){
             			var oK = false ;
             			var id = [] ;
             			for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             				id.push($scope.detailsRequeteChamps[i].idchamp) ;
             			} ;
             			id.sort(function(a, b){return a-b});
             			var x = id.indexOf($scope.idChampSelectionne); 
             			if (x > 0) {
             				var idSup = id[x-1] ;
             				console.log(JSON.stringify(idSup, null, 4)) ;
             				for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             					if ($scope.detailsRequeteChamps[i].idchamp == idSup) {
             						$scope.detailsRequeteChamps[i].idchamp = -1 ;
             					} ;
                 			} ;
                 			for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             					if ($scope.detailsRequeteChamps[i].idchamp == $scope.idChampSelectionne) {
             						$scope.detailsRequeteChamps[i].idchamp = idSup ;
             					} ;
                 			} ;
                 			for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             					if ($scope.detailsRequeteChamps[i].idchamp == -1) {
             						$scope.detailsRequeteChamps[i].idchamp = $scope.idChampSelectionne ;
             					} ;
                 			} ;
                 			$scope.idChampSelectionne = idSup
             			} ; 
             		 } else {
             			 alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
             		 } ;
             	  }; 
             	  
             	 $scope.descendreChamp = function () {
             		 if ($scope.idChampSelectionne != null){
             			var id = [] ;
             			for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             				id.push($scope.detailsRequeteChamps[i].idchamp) ;
             			} ;
             			id.sort(function(a, b){return a-b});
             			var x = id.indexOf($scope.idChampSelectionne); 
             			if (x < $scope.detailsRequeteChamps.length - 1) {
             				var idInf = id[x+1] ;
             				console.log(JSON.stringify(idInf, null, 4)) ;
             				for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             					if ($scope.detailsRequeteChamps[i].idchamp == idInf) {
             						$scope.detailsRequeteChamps[i].idchamp = -1 ;
             					} ;
                 			} ;
                 			for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             					if ($scope.detailsRequeteChamps[i].idchamp == $scope.idChampSelectionne) {
             						$scope.detailsRequeteChamps[i].idchamp = idInf ;
             					} ;
                 			} ;
                 			for (var i = $scope.detailsRequeteChamps.length - 1 ;i > -1; i--) {
             					if ($scope.detailsRequeteChamps[i].idchamp == -1) {
             						$scope.detailsRequeteChamps[i].idchamp = $scope.idChampSelectionne ;
             					} ;
                 			} ;
                 			$scope.idChampSelectionne = idInf
             			} ;  
             			 
             		 } else {
             			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
             		 } ;
             	  }; 
            	  
                }]
            }
          }
        })  
        ////////////////////////////////////////////////////////////////////
        // Requêtes > Detail > Constructeur > enregistrement sélectionnés //
        ////////////////////////////////////////////////////////////////////
        .state('requetes.detail.constructeur.selection', {

          url: '/detail/constructeur/selection',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.constructeur.selection.html',
              
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'requetes','$modal',
                function (  $scope , $rootScope ,  $state   , $stateParams,   requetes , $modal ) {
            	  
            	  $scope.selectionLigne = function (idSelectionSelectionne) {
            		  if ($scope.idSelectionSelectionne != null && $scope.idSelectionSelectionne == idSelectionSelectionne ) {
            			  $scope.idSelectionSelectionne = null ;
            		  } else {
            			  $scope.idSelectionSelectionne = idSelectionSelectionne;
            		  } ;	
	              }; 
            	  
            	  $scope.selectionChamp = function (idSelection) {
            		  if ($scope.champsTablesSelectionnees.length != 0) {
            			  $modal.open({
            				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.selection.choixChamp.html',
            				  size: 'xs',
            				  scope: $scope ,
            				  controller: ['$scope',
            				    function (  $scope ) {
            				  		$scope.tablesChoixChamp = $scope.champsTablesSelectionnees ;
            				  		$scope.champsTableSelectionnee = null ;
            				  		
            				  		$scope.nomTableSelectionnee = $scope.tablesChoixChamp[0].nomtable;
            				  		$scope.champsTableSelectionnee = $scope.tablesChoixChamp[0].champs;
            				  		
            				  		$scope.selectionTable = function (nomTableSelectionnee) {
            				  			$scope.nomTableSelectionnee = nomTableSelectionnee;
            				  			for (var i = 0; i < $scope.tablesChoixChamp.length; i++) {
            				  				if ($scope.tablesChoixChamp[i].nomtable == nomTableSelectionnee) {
            				  					$scope.champsTableSelectionnee = $scope.tablesChoixChamp[i].champs;
            				  				};
            				  			};
            		                };
            		                $scope.selectionChamp = function (champSelectionne) {
                				  		for (var i = 0; i < $scope.detailsRequeteSelection.length; i++) {
            				  				if ($scope.detailsRequeteSelection[i].idselection == idSelection) {
            				  					$scope.detailsRequeteSelection[i].nomchamp = champSelectionne ;
            				  					$scope.detailsRequeteSelection[i].nomtable = $scope.nomTableSelectionnee ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                		            }; 			
            				    }    
            			      ]       
            			
            		      });
            		  } else {
            			  alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_2'));
 			          }  
            	  };
              	 
              	  $scope.selectionOperateur = function (idSelection) {
              		$modal.open({
      				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.selection.choixOperateur.html',
      				  size: 'xs',
      				  scope: $scope ,
      				  controller: ['$scope',
      				    function (  $scope ) {
      				  		$scope.listeOperateurs = ['=','!=','<','<=','>','>=','BETWEEN','LIKE','NOT LIKE','ILIKE','NOT ILIKE',
      				  		                          'IN','NOT IN','NOT BETWEEN','IS NULL','IS NOT NULL'];
      				  		
      		                $scope.selectionOperateur = function (operateurSelectionne) {
          				  		for (var i = 0; i < $scope.detailsRequeteSelection.length; i++) {
      				  				if ($scope.detailsRequeteSelection[i].idselection == idSelection) {
      				  					$scope.detailsRequeteSelection[i].operateur = operateurSelectionne ;
      				  				};
      				  			};
          				  		$scope.$dismiss();
          		            }; 			
      				    }    
      			      ]       
      		        });
          		  
            	  }; 
            	  $scope.selectionValeur = function (idSelection) {

					  for (var i = 0; i < $scope.detailsRequeteSelection.length; i++) {
						  if ($scope.detailsRequeteSelection[i].idselection == idSelection) {
							  if ($scope.detailsRequeteSelection[i].valeurnomchamp === undefined 
									  || $scope.detailsRequeteSelection[i].valeurnomchamp == null
									  || $scope.detailsRequeteSelection[i].valeurnomchamp == "") {
								  $scope.valeurInitiale = $scope.detailsRequeteSelection[i].valeur ;
							  } else {
								  $scope.valeurInitiale = null ;
							  };
					  	  };
		  			  };
		  			  $scope.enregistrementUtilisateur = {
		  					valeurUtilisateur : $scope.valeurInitiale
	  			  	  };
					  
            		  $modal.open({
        				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.selection.choixValeur.html',
        				  size: 'lg',
        				  scope: $scope ,
        				  controller: ['$scope',
        				    function (  $scope ) {
        					  
        		                $scope.selectionValeur = function (validationOk , enregistrementUtilisateur) {
        		                	if (validationOk) {
        		                		for (var i = 0; i < $scope.detailsRequeteSelection.length; i++) {
            				  				if ($scope.detailsRequeteSelection[i].idselection == idSelection) {
            				  					$scope.detailsRequeteSelection[i].valeur = enregistrementUtilisateur.valeurUtilisateur ;
            				  					$scope.detailsRequeteSelection[i].valeurnomchamp = null ;
            				  					$scope.detailsRequeteSelection[i].valeurnomtable = null ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                	  			  			   
            								
                	  			  	} else {
                	  			  		$scope.submitted = true;	
                	  			  	}	
        		                };
        		                
            		            $scope.tablesChoixChamp = $scope.champsTablesSelectionnees ;
        				  		$scope.champsTableSelectionnee = null ;
        				  		
        				  		$scope.nomTableSelectionnee = $scope.tablesChoixChamp[0].nomtable;
        				  		$scope.champsTableSelectionnee = $scope.tablesChoixChamp[0].champs;
        				  		
        				  		$scope.selectionTable = function (nomTableSelectionnee) {
        				  			$scope.nomTableSelectionnee = nomTableSelectionnee;
        				  			for (var i = 0; i < $scope.tablesChoixChamp.length; i++) {
        				  				if ($scope.tablesChoixChamp[i].nomtable == nomTableSelectionnee) {
        				  					$scope.champsTableSelectionnee = $scope.tablesChoixChamp[i].champs;
        				  				};
        				  			};
        		                };
        		                $scope.selectionChamp = function (champSelectionne) {
            				  		for (var i = 0; i < $scope.detailsRequeteSelection.length; i++) {
        				  				if ($scope.detailsRequeteSelection[i].idselection == idSelection) {
           				  					$scope.detailsRequeteSelection[i].valeurnomchamp = champSelectionne ;
        				  					$scope.detailsRequeteSelection[i].valeurnomtable = $scope.nomTableSelectionnee ;
        				  					$scope.detailsRequeteSelection[i].valeur = $scope.nomTableSelectionnee + '.' + champSelectionne ;	
        				  				};
        				  			};
            				  		$scope.$dismiss();
            		            }; 			
        				    }    
        			      ]       
        		      });	  
            	  }; 
                  $scope.selectionConnecteur = function (idSelection) {
                    		$modal.open({
            				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.selection.choixConnecteur.html',
            				  size: 'xs',
            				  scope: $scope ,
            				  controller: ['$scope',
            				    function (  $scope ) {
            				  		$scope.listeConnecteurs = ['AND','OR'];
            				  		
            		                $scope.selectionConnecteur = function (connecteurSelectionne) {
                				  		for (var i = 0; i < $scope.detailsRequeteSelection.length; i++) {
            				  				if ($scope.detailsRequeteSelection[i].idselection == idSelection) {
            				  					$scope.detailsRequeteSelection[i].connecteur = connecteurSelectionne ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                		            }; 			
            				    }    
            			      ]       
            		      });	  
                  };   
            	  $scope.ajouterSelection = function () {
            		  var x = 1 ;
        			  for (var ii = 0; ii < $scope.detailsRequeteSelection.length; ii++) {
        				  if ($scope.detailsRequeteSelection[ii].idselection >= x){
        					  x = $scope.detailsRequeteSelection[ii].idselection + 1
        				  } ;
        			  } ;
        			  var nouvelleRequeteSelection = {
        					  idrequete : $stateParams.requeteId ,
        					  idselection : x ,
        					  nomchamp : ' ' ,
  							  nomtable : ' ' ,
  							  operateur : '=',
  							  valeur : ' ' ,
  							  valeurnomchamp : ' ' ,
							  valeurnomtable : ' ' ,
  							  connecteur : 'AND'
        			  } ;
        			  $scope.detailsRequeteSelection.push(nouvelleRequeteSelection) ;
        			  //console.log(JSON.stringify( $scope.detailsRequeteSelection, null, 4)) ;
        			  $scope.idSelectionSelectionne = null ;
              	  }; 
              	  $scope.supprimerSelection = function () {
              		if ($scope.idSelectionSelectionne != null) {
              			for (var ii = $scope.detailsRequeteSelection.length - 1 ;ii > -1; ii--) {
              			  if ($scope.detailsRequeteSelection[ii].idselection == $scope.idSelectionSelectionne ) { 
              				$scope.detailsRequeteSelection.splice(ii,1) ;
              				$scope.idSelectionSelectionne = null ;
              			  } ;
              		    } ;
              		// Re-Numérotation
          			  var id = [] ;
          			  for (var ii = $scope.detailsRequeteSelection.length - 1 ;ii > -1; ii--) {
             				id.push($scope.detailsRequeteSelection[ii].idselection) ;
             			  } ;
             			  id.sort();
             			  for (var ii = 0; ii < $scope.detailsRequeteSelection.length; ii++) {
             				 $scope.detailsRequeteSelection[ii].idselection = id.indexOf($scope.detailsRequeteSelection[ii].idselection) + 1 ;
            			  } ;
          			  return ;
              			
              		} else {
              			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
            		} ;
            	  }; 
            	  
                }]
            }
          }
        })  
        ////////////////////////////////////////////
        // Requêtes > Detail > Constructeur > Tri //
        ////////////////////////////////////////////
        .state('requetes.detail.constructeur.tri', {

          url: '/detail/constructeur/tri',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.constructeur.tri.html',
              
              controller: ['$scope','$rootScope','$state','$stateParams','requetes','$modal',
                function (  $scope , $rootScope , $state , $stateParams , requetes , $modal ) {
            	  
            	  $scope.triLigne = function (idTriSelectionne) {
            		  if ($scope.idTriSelectionne != null && $scope.idTriSelectionne == idTriSelectionne ) {
            			  $scope.idTriSelectionne = null ;
            		  } else {
            			  $scope.idTriSelectionne = idTriSelectionne;
            		  } ;	
	              }; 
            	  
            	  $scope.triChamp = function (idTri) {
            		  if ($scope.detailsRequeteChamps.length != 0) {
            			  $modal.open({
            				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.tri.choixChamp.html',
            				  size: 'xs',
            				  scope: $scope ,
            				  controller: ['$scope',
            				    function (  $scope ) {
            				  		$scope.listeTableChamp = $scope.detailsRequeteChamps ;
            				  		
            		                $scope.selectionTableChamp = function (tableChampSelectionne) {
                				  		for (var i = 0; i < $scope.detailsRequeteTri.length; i++) {
            				  				if ($scope.detailsRequeteTri[i].idtri == idTri) {
            				  					$scope.detailsRequeteTri[i].nomchamp = tableChampSelectionne.nomchamp ;
            				  					$scope.detailsRequeteTri[i].nomtable = tableChampSelectionne.nomtable ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                		            }; 			
            				    }    
            			      ]       
            			
            		      });
            		  } else {
            			  alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_3'));
 			          }  
            	  };
              	 
              	  $scope.triOrdre = function (idTri) {
              		$modal.open({
      				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.tri.choixOrdre.html',
      				  size: 'xs',
      				  scope: $scope ,
      				  controller: ['$scope',
      				    function (  $scope ) {
      				  		$scope.listeOrdre = ['ASC','DESC'];
      				  		
      		                $scope.selectionOrdre = function (ordreSelectionne) {
          				  		for (var i = 0; i < $scope.detailsRequeteTri.length; i++) {
      				  				if ($scope.detailsRequeteTri[i].idtri == idTri) {
      				  					$scope.detailsRequeteTri[i].ordre = ordreSelectionne ;
      				  				};
      				  			};
          				  		$scope.$dismiss();
          		            }; 			
      				    }    
      			      ]       
      		        });
          		  
            	  };  
            	  
            	  $scope.ajouterTri = function () {
            		  var x = 1 ;
        			  for (var ii = 0; ii < $scope.detailsRequeteTri.length; ii++) {
        				  if ($scope.detailsRequeteTri[ii].idtri >= x){
        					  x = $scope.detailsRequeteTri[ii].idtri + 1
        				  } ;
        			  } ;
        			  var nouvelleRequeteTri = {
        					  idrequete : $stateParams.requeteId ,
        					  idtri : x ,
        					  nomchamp : ' ' ,
  							  nomtable : ' ' ,
  							  ordre : 'ASC',
        			  } ;
        			  $scope.detailsRequeteTri.push(nouvelleRequeteTri) ;
        			  console.log(JSON.stringify( $scope.detailsRequeteTri, null, 4)) ;
        			  $scope.idTriSelectionne = null ;
              	  }; 
              	  $scope.supprimerTri = function () {
              		if ($scope.idTriSelectionne != null) {
              			for (var ii = $scope.detailsRequeteTri.length - 1 ;ii > -1; ii--) {
              			  if ($scope.detailsRequeteTri[ii].idtri == $scope.idTriSelectionne ) { 
              				$scope.detailsRequeteTri.splice(ii,1) ;
              				$scope.idTriSelectionne = null ;
              			  } ;
              		    } ;
              		// Re-Numérotation
          			  var id = [] ;
          			  for (var ii = $scope.detailsRequeteTri.length - 1 ;ii > -1; ii--) {
             				id.push($scope.detailsRequeteTri[ii].idtri) ;
             			  } ;
             			  id.sort();
             			  for (var ii = 0; ii < $scope.detailsRequeteTri.length; ii++) {
             				 $scope.detailsRequeteTri[ii].idtri = id.indexOf($scope.detailsRequeteTri[ii].idtri) + 1 ;
            			  } ;
          			  return ;
              			
              		} else {
              			 alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
            		} ;
            	  }; 
            	  $scope.monterTri = function () {
              		 if ($scope.idTriSelectionne != null){
              			var oK = false ;
              			var id = [] ;
              			for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              				id.push($scope.detailsRequeteTri[i].idtri) ;
              			} ;
              			id.sort(function(a, b){return a-b});
              			var x = id.indexOf($scope.idTriSelectionne); 
              			if (x > 0) {
              				var idSup = id[x-1] ;
              				console.log(JSON.stringify(idSup, null, 4)) ;
              				for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteTri[i].idtri == idSup) {
              						$scope.detailsRequeteTri[i].idtri = -1 ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteTri[i].idtri == $scope.idTriSelectionne) {
              						$scope.detailsRequeteTri[i].idtri = idSup ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteTri[i].idtri == -1) {
              						$scope.detailsRequeteTri[i].idtri = $scope.idTriSelectionne ;
              					} ;
                  			} ;
                  			$scope.idTriSelectionne = idSup
              			} ; 
              		 } else {
              			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
              		 } ;
              	  }; 
              	  
              	 $scope.descendreTri = function () {
              		 if ($scope.idTriSelectionne != null){
              			var id = [] ;
              			for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              				id.push($scope.detailsRequeteTri[i].idtri) ;
              			} ;
              			id.sort(function(a, b){return a-b});
              			var x = id.indexOf($scope.idTriSelectionne); 
              			if (x < $scope.detailsRequeteTri.length - 1) {
              				var idInf = id[x+1] ;
              				console.log(JSON.stringify(idInf, null, 4)) ;
              				for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteTri[i].idtri == idInf) {
              						$scope.detailsRequeteTri[i].idtri = -1 ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteTri[i].idtri == $scope.idTriSelectionne) {
              						$scope.detailsRequeteTri[i].idtri = idInf ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteTri.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteTri[i].idtri == -1) {
              						$scope.detailsRequeteTri[i].idtri = $scope.idTriSelectionne ;
              					} ;
                  			} ;
                  			$scope.idTriSelectionne = idInf
              			} ;  
              			 
              		 } else {
              			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
              		 } ;
              	  }; 
            	  
            	  
                }]
            }
          }
        })    
        /////////////////////////////////////////////////
        // Requêtes > Detail > Constructeur > Jointure //
        /////////////////////////////////////////////////
        .state('requetes.detail.constructeur.jointure', {

          url: '/detail/constructeur/jointure',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.constructeur.jointure.html',
              
              controller: ['$scope','$rootScope','$state','$stateParams','requetes','$modal',
                function (  $scope , $rootScope , $state , $stateParams , requetes , $modal ) {
            	  
            	  $scope.jointureLigne = function (idJointureSelectionne) {
            		  if ($scope.idJointureSelectionne != null && $scope.idJointureSelectionne == idJointureSelectionne ) {
            			  $scope.idJointureSelectionne = null ;
            		  } else {
            			  $scope.idJointureSelectionne = idJointureSelectionne;
            		  } ;	
	              }; 
            	  
            	  $scope.jointureChampSource = function (idJointure) {
            		  if ($scope.champsTablesSelectionnees.length >= 2) {
            			  $modal.open({
            				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.jointure.choixChampSource.html',
            				  size: 'xs',
            				  scope: $scope ,
            				  controller: ['$scope',
            				    function (  $scope ) {
            				  		$scope.tablesChoixChamp = $scope.champsTablesSelectionnees ;
            				  		$scope.champsTableSelectionnee = null ;
            				  		
            				  		$scope.nomTableSelectionnee = $scope.tablesChoixChamp[0].nomtable;
            				  		$scope.champsTableSelectionnee = $scope.tablesChoixChamp[0].champs;
            				  		
            				  		$scope.selectionTable = function (nomTableSelectionnee) {
            				  			$scope.nomTableSelectionnee = nomTableSelectionnee;
            				  			for (var i = 0; i < $scope.tablesChoixChamp.length; i++) {
            				  				if ($scope.tablesChoixChamp[i].nomtable == nomTableSelectionnee) {
            				  					$scope.champsTableSelectionnee = $scope.tablesChoixChamp[i].champs;
            				  				};
            				  			};
            		                };
            		                $scope.selectionChamp = function (champSelectionne) {
                				  		for (var i = 0; i < $scope.detailsRequeteJointure.length; i++) {
            				  				if ($scope.detailsRequeteJointure[i].idjointure == idJointure) {
            				  					$scope.detailsRequeteJointure[i].nomchampsource = champSelectionne ;
            				  					$scope.detailsRequeteJointure[i].nomtablesource = $scope.nomTableSelectionnee ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                		            }; 			
            				    }    
            			      ]       
            			
            		      });
            		  } else {
            			  alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_4'));
 			          }  
            	  };
              	 
              	  $scope.jointureTypeDeJointure = function (idJointure) {
              		$modal.open({
      				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.jointure.choixTypeDeJointure.html',
      				  size: 'xs',
      				  scope: $scope ,
      				  controller: ['$scope',
      				    function (  $scope ) {
      				  		$scope.listeTypeDeJointure = ['=','<','<=','>','>='];
      				  		
      		                $scope.selectionTypeDeJointure = function (typeDeJointureSelectionne) {
          				  		for (var i = 0; i < $scope.detailsRequeteJointure.length; i++) {
      				  				if ($scope.detailsRequeteJointure[i].idjointure == idJointure) {
      				  					$scope.detailsRequeteJointure[i].typedejointure = typeDeJointureSelectionne ;
      				  				};
      				  			};
          				  		$scope.$dismiss();
          		            }; 			
      				    }    
      			      ]       
      		        });
          		  
            	  };  
            	  
            	  $scope.jointureChampDestination = function (idJointure) {
            		  
            		  $scope.champSource = {
        					  nomchampsource : ' ' ,
  							  nomtablesource : ' ' ,
        			  } ;
            			
            		  for (var i = 0; i < $scope.detailsRequeteJointure.length; i++) {
			  				if ($scope.detailsRequeteJointure[i].idjointure == idJointure) {
			  					$scope.champSource.nomchampsource = $scope.detailsRequeteJointure[i].nomchampsource ;
			  					$scope.champSource.nomtablesource = $scope.detailsRequeteJointure[i].nomtablesource ;
			  				};
			  		  };
        
            		  if ($scope.champSource.nomchampsource != ' ' ) {
            			  $modal.open({
            				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.jointure.choixChampDestination.html',
            				  size: 'xs',
            				  scope: $scope ,
            				  controller: ['$scope',
            				    function (  $scope ) {			  
            					  	$scope.tablesChoixChampDestination = [];
            					  	angular.copy($scope.champsTablesSelectionnees, $scope.tablesChoixChampDestination);		  	
            				  		$scope.champsTableSelectionnee = null ;
            				  		
            				  		for (var ii = $scope.tablesChoixChampDestination.length - 1 ;ii > -1; ii--) {
                          			  if ($scope.tablesChoixChampDestination[ii].nomtable == $scope.champSource.nomtablesource ) { 
                          				  $scope.tablesChoixChampDestination.splice(ii,1) ;
                          			  } ;
            				  		} ;
            				  		
            				  		$scope.nomTableSelectionnee = $scope.tablesChoixChampDestination[0].nomtable;
            				  		$scope.champsTableSelectionnee = $scope.tablesChoixChampDestination[0].champs;
            				  			  		
            				  		$scope.selectionTable = function (nomTableSelectionnee) {
            				  			$scope.nomTableSelectionnee = nomTableSelectionnee;
            				  			for (var i = 0; i < $scope.tablesChoixChampDestination.length; i++) {
            				  				if ($scope.tablesChoixChampDestination[i].nomtable == nomTableSelectionnee) {
            				  					$scope.champsTableSelectionnee = $scope.tablesChoixChampDestination[i].champs;
            				  				};
            				  			};
            		                };
            		                $scope.selectionChamp = function (champSelectionne) {
                				  		for (var i = 0; i < $scope.detailsRequeteJointure.length; i++) {
            				  				if ($scope.detailsRequeteJointure[i].idjointure == idJointure) {
            				  					$scope.detailsRequeteJointure[i].nomchampdestination = champSelectionne ;
            				  					$scope.detailsRequeteJointure[i].nomtabledestination = $scope.nomTableSelectionnee ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                		            }; 			
            				    }    
            			      ]       
            			
            		      });
            		  } else {
            			  alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_5'));
 			          }  
            		  
            	  };
            	  
            	  $scope.ajouterJointure = function () {
            		  var x = 1 ;
        			  for (var ii = 0; ii < $scope.detailsRequeteJointure.length; ii++) {
        				  if ($scope.detailsRequeteJointure[ii].idjointure >= x){
        					  x = $scope.detailsRequeteJointure[ii].idjointure + 1
        				  } ;
        			  } ;
        			  var nouvelleRequeteJointure = {
        					  idrequete : $stateParams.requeteId ,
        					  idjointure : x ,
        					  nomchampsource : ' ' ,
  							  nomtablesource : ' ' ,
  							  typedejointure : '=',
  							  nomchampdestination : ' ' ,
							  nomtabledestination : ' ' ,
        			  } ;
        			  $scope.detailsRequeteJointure.push(nouvelleRequeteJointure) ;
        			  console.log(JSON.stringify( $scope.detailsRequeteJointure, null, 4)) ;
        			  $scope.idJointureSelectionne = null ;
              	  }; 
              	  $scope.supprimerJointure = function () {
              		if ($scope.idJointureSelectionne != null) {
              			for (var ii = $scope.detailsRequeteJointure.length - 1 ;ii > -1; ii--) {
              			  if ($scope.detailsRequeteJointure[ii].idjointure == $scope.idJointureSelectionne ) { 
              				$scope.detailsRequeteJointure.splice(ii,1) ;
              				$scope.idJointureSelectionne = null ;
              			  } ;
              		    } ;
              		// Re-Numérotation
          			  var id = [] ;
          			  for (var ii = $scope.detailsRequeteJointure.length - 1 ;ii > -1; ii--) {
             				id.push($scope.detailsRequeteJointure[ii].idjointure) ;
             			  } ;
             			  id.sort();
             			  for (var ii = 0; ii < $scope.detailsRequeteJointure.length; ii++) {
             				 $scope.detailsRequeteJointure[ii].idjointure = id.indexOf($scope.detailsRequeteJointure[ii].idjointure) + 1 ;
            			  } ;
          			  return ;
              			
              		} else {
              			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
            		} ;
            	  }; 
                }]
            }
          }
        })
        ////////////////////////////////////////////////
        // Requêtes > Detail > Constructeur > GroupBy //
        ////////////////////////////////////////////////
        .state('requetes.detail.constructeur.groupBy', {

          url: '/detail/constructeur/groupBy',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.constructeur.groupBy.html',
              
              controller: ['$scope','$rootScope','$state','$stateParams','requetes','$modal',
                function (  $scope , $rootScope , $state , $stateParams , requetes , $modal ) {
            	  
            	  $scope.groupByLigne = function (idGroupBySelectionne) {
            		  if ($scope.idGroupBySelectionne != null && $scope.idGroupBySelectionne == idGroupBySelectionne ) {
            			  $scope.idGroupBySelectionne = null ;
            		  } else {
            			  $scope.idGroupBySelectionne = idGroupBySelectionne;
            		  } ;	
	              }; 
            	  
            	  $scope.groupByChamp = function (idGroupBy) {
            		  if ($scope.detailsRequeteChamps.length != 0) {
            			  $modal.open({
            				  templateUrl: 'Vues/requetes/requetes.detail.constructeur.groupBy.choixChamp.html',
            				  size: 'xs',
            				  scope: $scope ,
            				  controller: ['$scope',
            				    function (  $scope ) {
            				  		$scope.listeTableChamp = $scope.detailsRequeteChamps ;
            				  		
            		                $scope.selectionTableChamp = function (tableChampSelectionne) {
                				  		for (var i = 0; i < $scope.detailsRequeteGroupBy.length; i++) {
            				  				if ($scope.detailsRequeteGroupBy[i].idgroupby == idGroupBy) {
            				  					$scope.detailsRequeteGroupBy[i].nomchamp = tableChampSelectionne.nomchamp ;
            				  					$scope.detailsRequeteGroupBy[i].nomtable = tableChampSelectionne.nomtable ;
            				  				};
            				  			};
                				  		$scope.$dismiss();
                		            }; 			
            				    }    
            			      ]       
            			
            		      });
            		  } else {
            			  alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_3'));
 			          }  
            	  };
              	 
              	  
            	  
            	  $scope.ajouterGroupBy = function () {
            		  var x = 1 ;
        			  for (var ii = 0; ii < $scope.detailsRequeteGroupBy.length; ii++) {
        				  if ($scope.detailsRequeteGroupBy[ii].idgroupby >= x){
        					  x = $scope.detailsRequeteGroupBy[ii].idgroupby + 1
        				  } ;
        			  } ;
        			  var nouvelleRequeteGroupBy = {
        					  idrequete : $stateParams.requeteId ,
        					  idgroupby : x ,
        					  nomchamp : ' ' ,
  							  nomtable : ' ' 
        			  } ;
        			  $scope.detailsRequeteGroupBy.push(nouvelleRequeteGroupBy) ;
        			  console.log(JSON.stringify( $scope.detailsRequeteGroupBy, null, 4)) ;
        			  $scope.idGroupBySelectionne = null ;
              	  }; 
              	  $scope.supprimerGroupBy = function () {
              		if ($scope.idGroupBySelectionne != null) {
              			for (var ii = $scope.detailsRequeteGroupBy.length - 1 ;ii > -1; ii--) {
              			  if ($scope.detailsRequeteGroupBy[ii].idgroupby == $scope.idGroupBySelectionne ) { 
              				$scope.detailsRequeteGroupBy.splice(ii,1) ;
              				$scope.idGroupBySelectionne = null ;
              			  } ;
              		    } ;
              		// Re-Numérotation
          			  var id = [] ;
          			  for (var ii = $scope.detailsRequeteGroupBy.length - 1 ;ii > -1; ii--) {
             				id.push($scope.detailsRequeteGroupBy[ii].idgroupby) ;
             			  } ;
             			  id.sort();
             			  for (var ii = 0; ii < $scope.detailsRequeteGroupBy.length; ii++) {
             				 $scope.detailsRequeteGroupBy[ii].idgroupby = id.indexOf($scope.detailsRequeteGroupBy[ii].idgroupby) + 1 ;
            			  } ;
          			  return ;
              			
              		} else {
              			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
            		} ;
            	  }; 
            	  $scope.monterGroupBy = function () {
              		 if ($scope.idGroupBySelectionne != null){
              			var oK = false ;
              			var id = [] ;
              			for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              				id.push($scope.detailsRequeteGroupBy[i].idgroupby) ;
              			} ;
              			id.sort(function(a, b){return a-b});
              			var x = id.indexOf($scope.idGroupBySelectionne); 
              			if (x > 0) {
              				var idSup = id[x-1] ;
              				console.log(JSON.stringify(idSup, null, 4)) ;
              				for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteGroupBy[i].idgroupby == idSup) {
              						$scope.detailsRequeteGroupBy[i].idgroupby = -1 ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteGroupBy[i].idgroupby == $scope.idGroupBySelectionne) {
              						$scope.detailsRequeteGroupBy[i].idgroupby = idSup ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteGroupBy[i].idgroupby == -1) {
              						$scope.detailsRequeteGroupBy[i].idgroupby = $scope.idGroupBySelectionne ;
              					} ;
                  			} ;
                  			$scope.idGroupBySelectionne = idSup
              			} ; 
              		 } else {
              			alert($translate.instant('REQUETE_CONSTRUCTEUR_MENU_MESSAGE_ALERT_1'));
              		 } ;
              	  }; 
              	  
              	 $scope.descendreGroupBy = function () {
              		 if ($scope.idGroupBySelectionne != null){
              			var id = [] ;
              			for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              				id.push($scope.detailsRequeteGroupBy[i].idgroupby) ;
              			} ;
              			id.sort(function(a, b){return a-b});
              			var x = id.indexOf($scope.idGroupBySelectionne); 
              			if (x < $scope.detailsRequeteGroupBy.length - 1) {
              				var idInf = id[x+1] ;
              				console.log(JSON.stringify(idInf, null, 4)) ;
              				for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteGroupBy[i].idgroupby == idInf) {
              						$scope.detailsRequeteGroupBy[i].idgroupby = -1 ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteGroupBy[i].idgroupby == $scope.idGroupBySelectionne) {
              						$scope.detailsRequeteGroupBy[i].idgroupby = idInf ;
              					} ;
                  			} ;
                  			for (var i = $scope.detailsRequeteGroupBy.length - 1 ;i > -1; i--) {
              					if ($scope.detailsRequeteGroupBy[i].idgroupby == -1) {
              						$scope.detailsRequeteGroupBy[i].idgroupby = $scope.idGroupBySelectionne ;
              					} ;
                  			} ;
                  			$scope.idGroupBySelectionne = idInf
              			} ;  
              			 
              		 } else {
              			 alert('Veuiller sélectionner une ligne');
              		 } ;
              	  }; 
            	  
            	  
                }]
            }
          }
        })    
        /////////////////////////////////////////////
        // Requêtes > Detail > Editeur             //
        /////////////////////////////////////////////
        .state('requetes.detail.editeur', {

          url: '/detail/editeur',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.editeur.html',
              
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'requetes',
                function (  $scope , $rootScope ,  $state   , $stateParams,   requetes ) {
            	  
            	  $scope.script =requetes.getScript( $scope.tablesSelectionnees , $scope.detailsRequeteChamps , $scope.detailsRequeteSelection ,
            			  $scope.detailsRequeteJointure , $scope.detailsRequeteTri , $scope.detailsRequeteGroupBy) ;
            	  // console.log(JSON.stringify($scope.script, null, 4)) ;
            	  $state.go('requetes.detail.editeur.donnees');
            	  
            	  	
                }]
            }
          }
        })
        /////////////////////////////////////////////////////
        // Requêtes > Detail > Editeur > donnees en sortie //
        /////////////////////////////////////////////////////
        .state('requetes.detail.editeur.donnees', {

          url: '/detail/editeur/donnees',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.editeur.donnees.html',
              
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'requetes',
                function (  $scope , $rootScope ,  $state   , $stateParams,   requetes ) {
            	  
            	  
            	  
                }]
            }
          }
        })
        /////////////////////////////////////////////////////////////
        // Requêtes > Detail > Editeur > messages de la console SQL//
        /////////////////////////////////////////////////////////////
        .state('requetes.detail.editeur.messages', {

          url: '/detail/editeur/messages',

          views: {

            '': {
              templateUrl: 'Vues/requetes/requetes.detail.editeur.messages.html',
              
              controller: ['$scope','$rootScope', '$state' , '$stateParams', 'requetes',
                function (  $scope , $rootScope ,  $state   , $stateParams,   requetes ) {
            	  
                }]
            }
          }
        })
        /////////////////////////////////////
        // Creation d'une nouvelle requête //
        /////////////////////////////////////
        .state('requetes.liste.creationNouvelleRequete', {
      	
          url: '/creation',
        
          onEnter: [        '$stateParams', '$state', '$modal', 'requetes' , '$translate', 
                    function($stateParams ,  $state ,  $modal ,  requetes  ,  $translate ) {
        	  			$modal.open({
        	  			templateUrl: 'Vues/requetes/requetes.creationNouvelleRequete.html',
                
        	  			  controller: [	'$rootScope','$scope',
        	  			        function($rootScope , $scope) {
              	  
              	  							$scope.enregistrementCreationRequete = {
              	  										nomRequete: ''
              	  							};
              	    
              	  							$scope.creationDeLaRequete = function(validationOk , enregistrementCreationRequete) {
              	  								if (validationOk) {
              	  								requetes.creationRequete(enregistrementCreationRequete).then(function () {
              	  										$rootScope.$broadcast('Creation OK');
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
              }
          ]
        })
        
      ////////////////////////////////////////////
      // Suppression des requêtes selectionnées //
      ////////////////////////////////////////////
      .state('requetes.liste.suppressionRequetes', {
    	
        url: '/suppression',
      
        onEnter: [        '$stateParams', '$state', '$modal', 'requetes' , '$translate', 
                  function($stateParams ,  $state ,  $modal ,  requetes  ,  $translate ) {
      	  			$modal.open({
      	  			templateUrl: 'Vues/requetes/requetes.suppressionRequetes.html',
              
      	  			  controller: [	'$rootScope','$state','$scope',
      	  			        function($rootScope , $state , $scope) {
      	  				  					
      	  				  					$scope.listeRequetesPourSuppression = $state.requetesSelectionnees;
      	  				  
            	  							$scope.suppressionDesRequetes = function() {
            	  								requetes.suppressionDesRequetes($state.requetesSelectionnees).then(function () {
            	  										$rootScope.$broadcast('Suppression OK');
            	  										$scope.$dismiss();
            	  									    $rootScope.retourEtatPrecedent();
            	  								})	
            	  							};  
            	  
            	  							$scope.annulation = function() {
            	  								$scope.$dismiss();
            	  								$rootScope.retourEtatPrecedent();
            	  							};
              				}
      	  			 ]
      	  		    })
            }
        ]
      })
      
      ////////////////////////////////////////////
      // Tranfert des requêtes selectionnées //
      ////////////////////////////////////////////
      .state('requetes.liste.transfertRequetes', {
    	
        url: '/transfert',
      
        onEnter: [        '$stateParams', '$state', '$modal', 'requetes' , '$translate', 
                  function($stateParams ,  $state ,  $modal ,  requetes  ,  $translate ) {
      	  			$modal.open({
      	  			templateUrl: 'Vues/requetes/requetes.transfertRequetes.html',
              
      	  			  controller: [	'$rootScope','$state','$scope',
      	  			        function($rootScope , $state , $scope) {
      	  				  					
      	  				  					$scope.listeRequetesPourTransfert = $state.requetesSelectionnees;
      	  				  					
      	  				  					$scope.nouvelUtilisateur = {
      	  				  						nomNouvelUtilisateur: ''
      	  				  					};
              	  						
      	  				  					$scope.transfertDesRequetes = function (validationOk , nouvelUtilisateur) {
      	  				  					console.log('transfertDesRequetes1111');
      	  				  						if (validationOk) {
      	  				  							console.log('transfertDesRequetes');
      	  				  							requetes.transfertDesRequetesVersNouvelUtilisateur($state.requetesSelectionnees , nouvelUtilisateur.nomNouvelUtilisateur).then(function () {
      	  				  									$rootScope.$broadcast('Tranfert OK');
      	  				  									$scope.$dismiss();
      	  				  									$rootScope.retourEtatPrecedent();
      	  				  							});
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
            }
        ]
      });
    }
  ]
);
