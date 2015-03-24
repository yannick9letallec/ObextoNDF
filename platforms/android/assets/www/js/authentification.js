// la procédure d'authentification concrète
function authentifierUtilisateur () {

	// on vérifie les droits sur le serveur si OK, autoconnect et accès page accueil sinon on affiche l'écran de connexion
	console.log( 'DANS : authentifierUtilisateur()' );
	if( utilisateurDejaEnregistre() ){
		document.getElementById( 'connexionPane' ).style.cssText = "display: initial;";
		window.location.assign ( "./choixApp.html" );
	} else { 	
		console.log( '	utilisateurDejaEnregistre() -> NON -> affichage du connexion Pane' );
		document.getElementById( 'connexionPane' ).style.cssText = "display: initial;";
	}
}


// determine si les données de connexion existent et sont initialisées
function utilisateurDejaEnregistre (){
	// test feature localStorage
	if( window.Storage !== "undefined" ){
		// on teste si les variables de connexion existent
		if( localStorage.getItem( "authentificationOK" ) === "false" ){
			return false;
		} else if ( localStorage.getItem( "authentificationOK" ) === "true" ) {
			return true;
		}
	} else {
		alert( "Votre Navigateur semble obsolète, merci de l'actualiser pour bénéficier des fonctionnalitées les plus récentes." );
	}
}


// vérification des droits via le MCD mobile
function connexionErpMobile( login, password, server ) {
	console.log( "DANS : connexionErpMobile" );
	console.log( login + " " + password + " " + server )

	var to = "";
	var command = "mobile.TESTER_CONNEXION";
	var service = "http://obexto.fr/Services";
	var soapMsg = "<?xml version='1.0' encoding='utf-8'?>" +
	"<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'>" + 
        "<soap:Body>" + 
        "<ExecuteCommand xmlns='" + service + "'>" +
                "<userName>" + login + "</userName>" +
                "<password>" + password + "</password>" + 
                "<commandName>" + command + "</commandName>" +
        "</ExecuteCommand>" +
        "</soap:Body>" +
"</soap:Envelope>";


        // FEATURE DETECTION & ADAPTATION NAVIGATEUR
	try {
		var xhr = new XMLHttpRequest();
	}  catch ( e ) {
		console.log( "[KO] Création XHR impossible" );
		return;
	}

                xhr.onreadystatechange = function () {
                        if ( xhr.readyState == 4 ) {
                                if ( xhr.status == 200 ) {
					window.localStorage.setItem( "SOAPResponse", xhr.responseText.toString() );
				} else {
					console.log( '	[KO] Connexion Internet' );
					/* document.getElementById( "ZoneErreur" ).style.cssText = "display: initial;";
					document.getElementById( "ZoneErreur" ).innerText = "Adresse Réseau Inatteignable.";
					setTimeout( function () { document.getElementById( "ZoneErreur" ).style.cssText = "display: none;" }, 3000 ); */
				}
				errorResponse = xhr.responseXML;
                        } else { 
				console.log( "	" + xhr.status + "  XHR SOAP : " + xhr.responseText  /* localStorage.SOAPResponse */ ); 
			}
                }
		xhr.onloadstart = function () {
			to = setTimeout( function() { verifierDroitsAccesErp(); }, 5000 );
			console.log( "loadstart" );
		}
		xhr.onloadend = function () {
			verifierDroitsAccesErp();
			clearTimeout( to );
			console.log( "loadend" );
		}

	// developpement.obexto.fr:8443
	try{
		xhr.open( "POST", "https://" + server + "/Services/Mobile.asmx" );
		xhr.setRequestHeader( "Content-Type", "text/xml; charset=utf-8;" ); // application/x-www-form-urlencoded; charset=utf-8;" );
		xhr.setRequestHeader( "SOAPAction", "http://obexto.fr/Services/ExecuteCommand" );
	} catch( e ) {
		console.log( "	" + e.message );
	}
        try { 
		xhr.send( soapMsg );
	 } catch( e ) { 
		console.log( "	" + "Message erreur XHR : " + e.message ); 
	}
}


function verifierDroitsAccesErp () {
	console.log( 'DANS : verifierDroitsAccesErp()' );
	var msg;

	// DROITS ACCES OK
	if( typeof window.localStorage.SOAPResponse == "string" ){
		var res = window.localStorage.SOAPResponse.search( 'ErrorContext');
		if( res != -1 ){
			// erreur detectée
			window.localStorage.setItem( "authentificationOK", "false" );
		
			errorCxContext = errorResponse.getElementsByTagName( 'ErrorContext' )[0].childNodes[0].textContent;
			errorCxMsg = errorResponse.getElementsByTagName( 'ErrorMessage' )[0].childNodes[0].textContent;
			console.log( errorCxContext + " : " + errorCxMsg );

			// intégration IHM
			document.getElementById( "ZoneErreur" ).style.cssText = "display: initial;";
			document.getElementById( "ZoneErreur" ).innerText = "Erreur : " + errorCxContext + ", " + errorCxMsg;
			setTimeout( function () { document.getElementById( "ZoneErreur" ).style.cssText = "display: none;" }, 3000 ); 
		} else {
			window.localStorage.setItem( "authentificationOK", "true" );
			
			document.getElementById( "ZoneErreur" ).style.cssText = "display: initial;";
			document.getElementById( "ZoneErreur" ).innerText = "Connexion Réussie.";
			window.setTimeout( function() { window.location.assign ( "./choixApp.html" )}, 2000 );
		}
	// DROIT ACCES KO
	} else { 
		window.localStorage.setItem( "authentificationOK", "false" );
		console.log( "	Vs n'êtes pas authentifié" );
		document.getElementById( "ZoneErreur" ).style.cssText = "display: initial;";
		document.getElementById( "ZoneErreur" ).innerText = "Adresse Réseau Inatteignable.";
		setTimeout( function () { document.getElementById( "ZoneErreur" ).style.cssText = "display: none;" }, 3000 ); 
	}
}


function validerFormulaireConnexion() {
	console.log( "DANS : validerFormulaireConnexion()" );

	var login = document.getElementById( 'login' ).value;
	var password = document.getElementById( 'password' ).value;
	var server = document.getElementById( 'server' ).value;

	if( server === "" || login === "" || password === "" ) {
		console.log( "	Présence de champs non remplis" );

		document.getElementById( "ZoneErreur" ).innerText = "Merci de remplir tous les champs.";
		document.getElementById( "ZoneErreur" ).style.cssText = "display: initial;";
		setTimeout( function () { document.getElementById( "ZoneErreur" ).style.cssText = "display: none;" }, 3000 ); 
	} else {
		console.log( "	Reinitialisation du localStorage" );
		window.localStorage.clear();

		var login = document.getElementById( 'login' ).value;
		var password = document.getElementById( 'password' ).value;
		var server = document.getElementById( 'server' ).value;

		console.log( "	Appel enregistrerUtilisateurCxInformation()" );
		enregistrerUtilisateurCxInformation( login, password, server );
		
		console.log( "	Appel connexionErpMobile()" );
		connexionErpMobile( login, password, server  );

	}
}


function enregistrerUtilisateurCxInformation( log, pw, server ) {
	console.log( "DANS : enregistrerUtilisateurCxInformation()" );
	console.log( "	Initialisation localStorage ( login, password, server ) " + log + " / " + pw + " / " + server );
	window.localStorage.setItem( "login", log );
	window.localStorage.setItem( "password", pw );
	window.localStorage.setItem( "server", server );
}


function validerConnexionOffline() {
	if( window.localStorage.getItem( "authentificationOK" ) == "true" ) {
		// connexion autorisée
		window.location.assign( "./choixApp.html" );
	} else {
		// connexion refusée
		document.getElementById( 'connexionPane' ).style.cssText = "display: initial;";
		document.getElementById( 'ZoneErreur' ).innerText = "Aucune connexion internet détectée.";
		setTimeout( function () { document.getElementById( "ZoneErreur" ).style.cssText = "display: none;" }, 3000 ); 
	}
}


function StringtoXML(text){
	if (window.ActiveXObject){
	  var doc=new ActiveXObject('Microsoft.XMLDOM');
	  doc.async='false';
	  doc.loadXML(text);
	} else {
	  var parser=new DOMParser();
	  var doc=parser.parseFromString(text,'text/xml');
	}
	errorResponse = doc;
}
