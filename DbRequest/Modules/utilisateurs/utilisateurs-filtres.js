angular.module('uiRouterDbR.utilisateurs.filtres', [

])
// Filtres sur liste des utilisateurs
// Tous ; nonValide ; nonActif
.filter('filtrerListeUtil', [function($filter) {
	 return function(liste, triListe){
		 var nouvelleListe=[];
		 if(triListe.tri == 'tous'){
			 return liste;
		 };
		 if(triListe.tri == 'nonValide'){
			 angular.forEach(liste, function(utilisateur){
				if (utilisateur.datevalidationinscription == null) {
					nouvelleListe.push(utilisateur);
			 	};
			 });
			 return nouvelleListe;
		 };
		 if(triListe.tri == 'nonActif'){
			 angular.forEach(liste, function(utilisateur){
					if (utilisateur.actif == false) {
						nouvelleListe.push(utilisateur);
				 	};
			 });
			 return nouvelleListe;
		 };
		 return liste;
	 };
}])
// L'utilisateur est il actif ou non
.filter('actifNonActif', function() {
	return function(input) {
		return input ? '\u2713' : '\u2718';
	};
})
// L'utilisateur est il validé ou non
.filter('valideNonvalide', function() {
	return function(input) {
		if (input==null) {
			return('\u2718');
		} else {
			return('\u2713');
		};
	};
});

