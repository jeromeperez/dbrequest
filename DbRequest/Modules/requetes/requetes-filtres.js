angular.module('uiRouterDbR.requetes.filtres', [

])

// Filtres sur liste des requetes
// Toutes ; requette d'un utilisateur
.filter('filtrerListeParUtilisateur', [function($filter) {
	 return function(liste, utilisateurListe){
		 var nouvelleListe=[];
		 if(utilisateurListe.utilisateur == 'tous'){
			 return liste;
		 };
		 if(utilisateurListe.utilisateur != 'tous'){
			 angular.forEach(liste, function(requete){
				console.log(requete.utilisateur); 
				console.log(utilisateurListe.utilisateur); 
				if (requete.nomutilisateur == utilisateurListe.utilisateur) {
					nouvelleListe.push(requete);
			 	};
			 });
			 return nouvelleListe;
		 };
		 
		 return liste;
	 };
}])

// Filtres sur liste des requetes
// Tous ; nonValide ; nonActif
.filter('filtrerListe', [function($filter) {
	 return function(liste, triListe){
		 var nouvelleListe=[];
		 if(triListe.tri == 'toutes'){
			 return liste;
		 };
		 if(triListe.tri == 'nonValidees'){
			 angular.forEach(liste, function(requete){
				if (requete.validation == false) {
					nouvelleListe.push(requete);
			 	};
			 });
			 return nouvelleListe;
		 };
		 if(triListe.tri == 'validees'){
			 angular.forEach(liste, function(requete){
					if (requete.validation == true) {
						nouvelleListe.push(requete);
				 	};
			 });
			 return nouvelleListe;
		 };
		 return liste;
	 };
}])

// La requête est elle validée ou non
.filter('valideeNonValidee', function() {
	return function(input) {
		if (input == false) {
			return('\u2718');
		} else {
			return('\u2713');
		};
	};
});

