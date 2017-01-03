angular.module('uiRouterDbR.dbrequest.filtres', [

])
// Filtres sur liste des bases de PostgreSQL

.filter('filtrerListeDb', [function($filter) {
	 return function(liste , userListe){
		 var nouvelleListe=[];
		 angular.forEach(liste, function(base){
			if (base.datname.search("_dbrequest") == -1) {
				if (base.datname.search("postgres") == -1) {
					if (base.datname.search(/\d\d\d\d_\d\d_\d\d_\d\dh_\d\dm_\d\ds_svg/) == -1) {	
						nouvelleListe.push(base);
					};
				};
			}; 
		 });
		 return nouvelleListe;
	 };
}])



