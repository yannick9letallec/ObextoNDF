// la procédure d'authentification concrète
function authentifierUtilisateur () {

	// $('#modal-connexion').modal( 'toggle' ); 

	// on vérifie les droits sur le serveur si OK, autoconnect et accès page accueil sinon on affiche l'écran de connexion
	console.log( 'DANS : authentifierUtilisateur()' );
	if( utilisateurDejaEnregistre() ){
		document.getElementById( 'connexionPane' ).style.display = 'none';
		// console.log( 'utilisateurDejaEnregistre() -> OUI -> masquage du connexion Pane, appel de la procédure de connexion ,et vérification des droits' );
		// connexionErpMobile( window.localStorage.getItem( 'login' ), window.localStorage.getItem( 'password' ), window.localStorage.getItem( 'server' ) );
		// verifierDroitsAccesErp();
		window.location.assign ( "./choixApp.html" );
		// document.getElementById( 'connexionPane' ).style.display = 'initial';
	} else { 	
		console.log( 'utilisateurDejaEnregistre() -> NON -> affichage du connexion Pane' );
		document.getElementById( 'connexionPane' ).style.display = 'initial';
		// $('#modal-connexion').modal( 'toggle' ); 
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
	console.log( "log : " + login + " , pw : " + password + " , server : " + server );

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

	console.log( "SOAP MSG : " + soapMsg );

        // FEATURE DETECTION & ADAPTATION NAVIGATEUR
        if( window.XMLHttpRequest ) {
                var xhr = new XMLHttpRequest();
        } else if ( window.ActiveXObject ) {
                var xhr = new ActiveXObject( "Microsoft.XMLHTTP" );
        } else {
                // Ajax not supported -> polyfill
        }

	if ( window.XMLHttpRequest ) {
                xhr.onreadystatechange = function () {
                        if ( xhr.readyState == 4 ) {
                                if ( xhr.status == 200 ) {
					window.localStorage.setItem( "SOAPResponse", xhr.responseText.toString() );
					console.log( login + " XHR SOAP : " + xhr.responseText.toString() /* localStorage.SOAPResponse */ );
				} else {
					console.log( '[KO] Connexion Internet' );
				}
				errorResponse = xhr.responseXML;
                        } else { 
				// alert( xhr.status + "  XHR SOAP : " + xhr.responseText  /* localStorage.SOAPResponse */ ); 
			}
                }
		xhr.onloadstart = function () {
			to = setTimeout( function() { verifierDroitsAccesErp(); }, 8000 );
			console.log( "loadstart" );
		}
		xhr.onloadend = function () {
			verifierDroitsAccesErp();
			clearTimeout( to );
			console.log( "loadend" );
		}
        } else {
                console.log( "XHR KO" );
        }


	// developpement.obexto.fr:8443
	try{
		xhr.open( "POST", "https://" + localStorage.getItem( "server" ) + "/Services/Mobile.asmx" );
		xhr.setRequestHeader( "Content-Type", "text/xml; charset=utf-8;" ); // application/x-www-form-urlencoded; charset=utf-8;" );
		xhr.setRequestHeader( "SOAPAction", "http://obexto.fr/Services/ExecuteCommand" );
	} catch( e ) {
		console.log( e.message );
	}


        try { 
		xhr.send( soapMsg );
	 } catch( e ) { 
		console.log( "Message erreur XHR : " + e.message ); 
	}
}


function verifierDroitsAccesErp () {
	console.log( 'DANS : verifierDroitsAccesErp()' );
	console.log( "VAR : SOAPResponse ( in localStorage ) : " + window.localStorage.SOAPResponse );

	// DROITS ACCES OK
	if( typeof window.localStorage.SOAPResponse == "string" ){
		var res = window.localStorage.SOAPResponse.search( 'OK');
		if( res == -1 ){
			window.localStorage.setItem( 'authentificationOK', "false" );
		
			// récupération du msg d'erreur de conexion
			try {
			} catch ( e ){
				console.log( e.message );
			}
				errorCxContext = errorResponse.getElementsByTagName( 'ErrorContext' )[0].childNodes[0].textContent;
				errorCxMsg = errorResponse.getElementsByTagName( 'ErrorMessage' )[0].childNodes[0].textContent;

			// intégration IHM
			document.getElementById('ZoneErreur').style.display = 'initial';
			document.getElementById('ZoneErreur').innerHTML = errorCxContext + " : " + errorCxMsg;
			window.setTimeout( function () { document.getElementById('ZoneErreur').style.display = 'none' }, 3000 );
			console.log( "ACCES KO" ); // réafficher le formulaire de connexion
		} else {
			console.log( "ACCES OK" ); // recuperation des droits liés aux types de notes
			window.localStorage.setItem( 'authentificationOK', "true" );
			
			// information de confirmation
			document.getElementById( "ZoneErreur" ).style.display = "initial";
			document.getElementById( "ZoneErreur" ).innerText = "Mise à jour réussie.";
			window.setTimeout( function() { window.location.assign ( "./choixApp.html" )}, 2000 );
		}
	} else { // DROITS ACCES RESEAU KO + notification interface
		window.localStorage.setItem( 'authentificationOK', "false" );
		console.log( "Vs n'êtes pas authentifié" );
		document.getElementById( "ZoneErreur" ).style.display = "initial";
		document.getElementById( "ZoneErreur" ).innerText = "Adresse Réseau Inatteignable.";
		setTimeout( function () { document.getElementById( "ZoneErreur" ).style.display = "none" }, 3000 ); 
	}
}


function validerFormulaireConnexion() {
	var login = document.getElementById( 'login' ).value;
	var password = document.getElementById( 'password' ).value;
	var server = document.getElementById( 'server' ).value;

	if( server === "" || login === "" || password === "" ) {
		document.getElementById( "ZoneErreur" ).style.display = "initial";
		document.getElementById( "ZoneErreur" ).innerText = "Merci de remplir tous les champs.";
		setTimeout( function () { document.getElementById( "ZoneErreur" ).style.display = "none" }, 3000 ); 
	} else {
		// $('#modal-connexion').modal( 'toggle' ); 

		console.log( "DANS : validerFormulaireConnexion()" );
		// affichage de la fenetre : connexion en cours
		// document.getElementById( 'modal-connexion' ).style.display = "initial";

		console.log( "ACTION : reinitialisation du localStorage" );
		
		window.localStorage.clear();

		var login = document.getElementById( 'login' ).value;
		var password = document.getElementById( 'password' ).value;
		var server = document.getElementById( 'server' ).value;

		console.log( "ACTION : appel enregistrerUtilisateurCxInformation()" );
		enregistrerUtilisateurCxInformation( login, password, server );
		console.log( "ACTION : appel connexionErpMobile()" );
		connexionErpMobile( login, password, server  );
		console.log( "ACTION : verifierDroitsAccesErp()" );
		// verifierDroitsAccesErp();

		// $('#modal-connexion').modal( 'toggle' ); 
	}
}


function enregistrerUtilisateurCxInformation( log, pw, server ) {
	console.log( "DANS : enregistrerUtilisateurCxInformation()" );
	window.localStorage.setItem( "login", log );
	window.localStorage.setItem( "password", pw );
	window.localStorage.setItem( "server", server );
	console.log( "ACTION : initialisation localStorage ( login, password, server )" );
}


function validerConnexionOffline() {
	if( window.localStorage.getItem( "authentificationOK" ) == "true") {
		// connexion autorisée
		window.location.assign( "./choixApp.html" );
	} else {
		// connexion refusée
		document.getElementById( 'connexionPane' ).style.display = 'initial';
		document.getElementById( 'ZoneErreur' ).innerHTML = "Aucune connexion internet détectée, <br /> \
		Pour démarrer, connectez votre appareil. <br > ";
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
