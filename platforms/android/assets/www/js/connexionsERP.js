function recupererTypeNote( ) {

	// variable soap et données de connexion
	var log = window.localStorage.getItem( "login" );
	var pw = window.localStorage.getItem( "password" );
	var server = window.localStorage.getItem( "server" );

	var command = "mobile.TYPES_NOTES_DE_FRAIS_EXTRAIRE"; 

	var soapMsg = "<?xml version='1.0' encoding='utf-8'?>" +
	"<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'>" + 
		"<soap:Body>" + 
		"<ExecuteCommand xmlns='http://obexto.fr/Services'>" +
			"<userName>" + log + "</userName>" +
			"<password>" + pw + "</password>" + 
			"<commandName>" + command + "</commandName>" +
		"</ExecuteCommand>" +
		"</soap:Body>" +
	"</soap:Envelope>";

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
                        //alert( "xhr state : " + xhr.readyState + ", xhr status : " + xhr.status );
                        if ( xhr.readyState == 4 ) {
                                if ( xhr.status == 200 ) {

					if( window.DOMParser ){
						parser = new DOMParser();
						xml = parser.parseFromString( xhr.responseText, "text/xml" );
					} else {
						xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async=false;
						xmlDoc.loadXML(text); 
					}    
			
					// intégration des types de note de frai
					var sel = document.getElementById( 'type-ndf' );
					var typeNote = xml.documentElement.getElementsByTagName('LIBL_TYPE_NOTE_FRAI');
					var idTypeNote = xml.documentElement.getElementsByTagName('ID_TYPE_NOTE_FRAI');

					for( var i=0; i < typeNote.length; i++ ){
						if ( i >= 0 ){
							var opt = document.createElement( "option" );
							opt.text = typeNote[i].textContent;
							opt.setAttribute( "value", idTypeNote[i].textContent );
							sel.add( opt );
						}
					}
					// mise en cache
					setCacheOffline( "TYPE_NDF", "false" );

				}
                        }
                }
        } else {
                alert( "XHR KO" );
        }

        xhr.open( "POST", "https://" + server + "/Services/Mobile.asmx", true ); 
        xhr.setRequestHeader( "Content-Type", "text/xml; charset=utf-8;" ); // application/x-www-form-urlencoded; charset=utf-8;" );
        xhr.setRequestHeader( "SOAPAction", "http://obexto.fr/Services/ExecuteCommand" );

        try { xhr.send( soapMsg ); } catch( e ) { alert ( e.message ); }
}


function releveGeoLocalisation ( type ) {
	var res = ""; 

	// feature Test
	if ( navigator.geolocation !== "undefined" ){
		// navigator.geolocation.getCurrentPosition( geoSuccess, geoError ); */
		navigator.geolocation.getCurrentPosition( geoSuccess, geoError );
		function geoSuccess( position ) { 
			// no var to keep res local
			res = '[OK] :: Latitude : ' + tronque( position.coords.latitude ) + "\n" + 'Longitude : ' + tronque( position.coords.longitude );
			console.log( res );
			lat = tronque ( position.coords.latitude );
			lat = lat.replace( ",", "." );
			lngt = tronque ( position.coords.longitude );
			lngt = lngt.replace( ",", "." );
			switch( type ) {
				case "CREA" :
					LAT_CREA = lat;     
					LNGT_CREA = lngt; 
					break;
				case "ASSO" :
					// check / unchecked
					if( document.getElementById( "geoLocManuel" ).checked === true ) {
						LAT_ASSO = lat;     
						LNGT_ASSO = lngt; 
					} else {
						LAT_ASSO = "";     
						LNGT_ASSO = ""; 
					}
					break;
				case "ENV" :
					LAT_ENV = lat;     
					LNGT_ENV = lngt; 

					envoyerNDFSoap();
					break;
				case "IMG" :
					LAT_PHOT = lat;
					LNGT_PHOT = lngt;
					break;
			}
			afficheLocalisations (); 
		}
		function geoError ( error ) { 
			res = "[ERREUR] :: GEOLOCALISATION ERREUR : code = " + error.code + " : message : " + error.message;
			console.log( res );
		}
	} else {
		console.log( 'Votre navigateur ne prend pas en charge la Géo Localisation, merci de bien vouloir le mettre à jour' );
	} 
}


function envoyerNDF () {
	dateFormatSQLServer ( "ENV" );

	// intégration spinning icone
	el = document.getElementById("btnEnvoyerNote");
	el.disabled = true;
	ajout = document.createElement( "i" );
	ajout.id = "btn_spinning";
	ajout.className = "fa";
	ajout.className += " fa-spinner";
	ajout.className += " fa-spin";
	el.insertBefore( ajout, el.firstChild );

	isOnline( function() {
		releveGeoLocalisation ( "ENV" );
	}, function() {
		generateNDFTemporisee();
	});
}


function genererSoapMsg() {

	REMQ_NOTE_FRAI = document.getElementById( 'REMQ_NOTE_FRAI' ).value;
	VAL_NOTE_FRAI = document.getElementById( 'VAL_NOTE_FRAI' ).value;
	getIdTypeNDF();
	getIdMoyPaiement();

	var log = window.localStorage.getItem( 'login' );
	var pw = window.localStorage.getItem( 'password' );
	var command = "mobile.NOTES_DE_FRAIS_AJOUTER"; 
	
	soapMsg = "<?xml version='1.0' encoding='utf-8'?>" +
	"<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>" + 
	 "<soap:Body>" + 
	    "<ExecuteCommand xmlns='http://obexto.fr/Services'>" + 
	      "<userName>" + log + "</userName>" + 
	      "<password>" + pw + "</password>" + 
	      "<commandName>" + command + "</commandName>" + 
	      "<parameters>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@DTE_CREA_UTC"  + "</ParameterName>" + 
		  "<Value xsi:type='xsd:dateTime'>" + DTE_CREA_UTC + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@DTE_PREM_ENV_UTC"  + "</ParameterName>" + 
		  "<Value xsi:type='xsd:dateTime'>" + DTE_PREM_ENV_UTC + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LAT_PHOT" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LAT_PHOT ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LNGT_PHOT" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LNGT_PHOT ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LAT_CREA" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LAT_CREA ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LNGT_CREA" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LNGT_CREA ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LAT_ASSO" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LAT_ASSO ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LNGT_ASSO" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LNGT_ASSO ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LAT_ENV" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LAT_ENV ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LNGT_ENV" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LNGT_ENV ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@ID_TYPE_NOTE_FRAI" + "</ParameterName>" + 
		  "<Value xsi:type='xsd:string'>" + ID_TYPE_NOTE_FRAI + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@ID_MOY_PAIE" + "</ParameterName>" + 
		  "<Value xsi:type='xsd:integer'>" + ID_MOY_PAIE + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@NOM_FIC" + "</ParameterName>" + 
		   "<Value xsi:type='xsd:string'>" + NOM_FIC + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@CONT_DOC_NOTE_FRAI" + "</ParameterName>" + 
		   "<Value xsi:type='xsd:base64Binary'>" + CONT_DOC_NOTE_FRAI + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@REMQ_NOTE_FRAI" + "</ParameterName>" + 
		   "<Value xsi:type='xsd:string'>" + REMQ_NOTE_FRAI + "</Value>" +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@VAL_NOTE_FRAI" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", VAL_NOTE_FRAI ) +
		"</ActualParameter>" + 
	      "</parameters>" + 
	    "</ExecuteCommand>" + 
	  "</soap:Body>" + 
	"</soap:Envelope>";

	return soapMsg;
}
	
function envoyerNDFSoap( soapMsg, origin ) {

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
						if( window.DOMParser ){
							parser = new DOMParser();
							xml = parser.parseFromString( xhr.responseText, "text/xml" );
						} else {
							xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
							xmlDoc.async=false;
							xml = xmlDoc.loadXML(text);
						}
					}
				}
			}
			xhr.onloadend = function () {
				// en cas de note temporaire, suppression des variables dans le localStorage et suppression du fichier dans le cache applicatif
				if( origin ){
					localStorage.removeItem( origin );
					console.log( "Local Storage : suppression de : " + origin );
					nb_notes_tmp--;
					console.log( "nb_notes_tmp : " + nb_notes_tmp );
					document.getElementById( "modal-body" ).innerHTML = "<h5> Il reste <b>" + nb_notes_tmp + " élément(s) </b> en attente de traitement </h5>"
					// il n'y a plus de note temporaires en attente
					if( nb_notes_tmp === 0 ){
						console.log( "nb_notes_tmp = 0" );
						toggleModal( "#div-envoi-ndf-attente" );
					} else {
						console.log( "nb_notes_tmp : " + nb_notes_tmp );
					}
				} else {
					finEnvoyerNDF();
				}
			};

		} else {
			alert( "XHR KO" );
		}

		xhr.open( "POST", "https://" + localStorage.getItem( "server" ) + "/Services/Mobile.asmx", true );
		xhr.setRequestHeader( "Content-Type", "text/xml; charset=utf-8;" ); // application/x-www-form-urlencoded; charset=utf-8;";
		xhr.setRequestHeader( "SOAPAction", "http://obexto.fr/Services/ExecuteCommand" );

		// Si soapMsg fourni, on envoi ça, sinon, on génère la trame SOAP
		try { xhr.send( soapMsg ? soapMsg : genererSoapMsg() ); } catch( e ) { alert ( e.message ); }
}


function afficheLocalisations () {
	var str = "\r";
	str += LAT_CREA + "\r";
	str += LNGT_CREA + "\r";
	str += LAT_ASSO + "\r";
	str += LNGT_ASSO + "\r";
	str += LAT_ENV + "\r";
	str += LNGT_ENV;
}


function dateFormatSQLServer ( type ){
	// construction d'une date au format SQL Server
	var d = new Date();
	var mois = d.getMonth() + 1;
	var date = d.toISOString();

	date = date.replace( 'Z', '0000Z' );

	var tmp = date.split( 'Z' );
	

	switch( type ){
	case "CREA" :
		if( typeof DTE_CREA_UTC === "undefined" ){
			DTE_CREA_UTC = date;
			console.log( "dateFormatSQLServer : date générée : DTE_CREA_UTC : " + date );
		}
		break;
	case "ENV" :
		if( typeof DTE_PREM_ENV_UTC === "undefined" ){
			DTE_PREM_ENV_UTC = date;
			console.log( "dateFormatSQLServer : date générée : DTE_PREM_ENV_UTC : " + date );
		}
		break;
	default :
		console.log( "REINIT des Dates ( DTE_CREA_UTC, DTE_PREM_ENV_UTC )" );
		DTE_CREA_UTC = date;
		DTE_PREM_ENV_UTC = undefined;
	}
}	


function getIdTypeNDF() {
	var sel = document.getElementById( "type-ndf");
	var options = sel.options;
	ID_TYPE_NOTE_FRAI = sel.options[sel.selectedIndex].value;
}
function getIdMoyPaiement() {
	var sel = document.getElementById( "moy-paie");
	var options = sel.options;
	ID_MOY_PAIE = sel.options[sel.selectedIndex].value;
}

function isNull( pre, data ) {
	if ( typeof data === "undefined" || data == "" ){
		return "";
	} else {
		// var loc =data.toString().trim();
		return pre + data + "</Value>";
	}
}


function tronque( val ) {
	console.log( 'TRONQUE FUNCTION' );
	// String -> Array
	var tmp = val.toString().split('.');
	// on tronque effectivement la chaine	
	tmp[1] = tmp[1].substring( 0, 7 );
	// on recrée la valeur géolocalisation
	return tmp.toString();
}


function img2base64( i, path, origine ) {
// transformer l'image prise par l'utilisateur en base 64 et associer le résultat à CONT_DOC_NOTE_FRAI
	window.plugins.Base64.encodeFile( path_to_img, function( base64 ) {
		console.log( "Encodage 64 NDF_" + i ? i : "" );
		var n = base64.indexOf( "," );
		var s = base64.slice( n + 1 );
		CONT_DOC_NOTE_FRAI = s;

		if( origine == "NDFTemporaires" ){
			console.log( "MISE A JOUR NDF TEMP" );
			finaliserNDFAttente( i, CONT_DOC_NOTE_FRAI ) ;
		}
	}); 
}


function recupererMoyensPaiement( ) {

	// variable soap et données de connexion
	var log = window.localStorage.getItem( "login" );
	var pw = window.localStorage.getItem( "password" );
	var server = window.localStorage.getItem( "server" );
	var command = "mobile.NOTES_DE_FRAIS_MOYENS_PAIEMENT_EXTRAIRE"; 

	var soapMsg = "<?xml version='1.0' encoding='utf-8'?>" +
	"<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'>" + 
		"<soap:Body>" + 
		"<ExecuteCommand xmlns='http://obexto.fr/Services'>" +
			"<userName>" + log + "</userName>" +
			"<password>" + pw + "</password>" + 
			"<commandName>" + command + "</commandName>" +
		"</ExecuteCommand>" +
		"</soap:Body>" +
	"</soap:Envelope>";

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
                        //alert( "xhr state : " + xhr.readyState + ", xhr status : " + xhr.status );
                        if ( xhr.readyState == 4 ) {
                                if ( xhr.status == 200 ) {

					if( window.DOMParser ){
						parser = new DOMParser();
						xml = parser.parseFromString( xhr.responseText, "text/xml" );
					} else {
						xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
						xmlDoc.async=false;
						xmlDoc.loadXML(text); 
					}    
			
					// intégration des types de note de frai
					var sel = document.getElementById( 'moy-paie' );
					var typeMoyPaie = xml.documentElement.getElementsByTagName('LIBL_MOY_PAIE');
					var idMoyPaie = xml.documentElement.getElementsByTagName('ID_MOY_PAIE');

					// creation du select
					for( var i=0; i < typeMoyPaie.length; i++ ){
						var opt = document.createElement( "option" );
						opt.text = typeMoyPaie[i].textContent;
						opt.setAttribute( "value", idMoyPaie[i].textContent );
						sel.add( opt );
					
					}
					// mise en cache
					setCacheOffline( "MOY_PAIE", "false" );
				}
                        }
                }
        } else {
                alert( "XHR KO" );
        }

        xhr.open( "POST", "https://" + server + "/Services/Mobile.asmx", true );
        xhr.setRequestHeader( "Content-Type", "text/xml; charset=utf-8;" ); // application/x-www-form-urlencoded; charset=utf-8;" );
        xhr.setRequestHeader( "SOAPAction", "http://obexto.fr/Services/ExecuteCommand" );

        try { xhr.send( soapMsg ); } catch( e ) { alert ( e.message ); }
}

// Lorsque la connexion est OK, mise en cache des listes retournées par l'ERP
function setCacheOffline( call, deja ) {

	switch( call ) {
	case "TYPE_NDF" :
		console.log( "ONLINE : TYPE_NDF : suppression des anciennes valeurs Type NDF du Local Storage" );
		for( var i = 0; i < localStorage.length; i++ ){
			if((  typeof localStorage.getItem( "idTypeNDF_" + i )) || ( typeof localStorage.getItem( "typeNDF_" + i ) === "string" )) {
				console.log( "LS suppression : idTypeNDF_ & typeNDF_" + i );
				localStorage.removeItem( "idTypeNDF_" + i );
				localStorage.removeItem( "typeNDF_" + i );
			} 
		}
		console.log( "ONLINE : Mise en cache des selects : TYPE_NDF" );
		var sel, id_value, type_value;
		// mise en cache TYPE NOTE DE FRAIS
		sel = document.getElementById( "type-ndf");

		for( var j = 0; j < sel.length; j++ ) {
			id_value = sel[j].value; 
			type_value = sel[j].textContent;
			console.log( "id : " + id_value + ", type : " + type_value );

			// MODE OFFLINE : MISE EN CACHE
			localStorage.setItem( "idTypeNDF_" + j, id_value );
			localStorage.setItem( "typeNDF_" + j, type_value );
		}
	break;
	case "MOY_PAIE" :
		console.log( "ONLINE : TYPE_NDF : suppression des anciennes valeurs Moyen Paiement du Local Storage" );
		for( var i = 0; i < localStorage.length; i++ ){
			if(( typeof localStorage.getItem( "idMoyPaie_" + i ) === "string" ) || ( typeof localStorage.getItem( "typeMoyPaie_" + i ) === "string" )) {
				console.log( "LS suppression : idMoyPaie_ & typeMoyPaie_" + i );
				localStorage.removeItem( "idMoyPaie_" + i );
				localStorage.removeItem( "typeMoyPaie_" + i );
			}			
		}

		console.log( "ONLINE : Mise en cache des selects : MOY_PAIE" );
		// mise en cache MOYEN D PAIEMENT
		sel = document.getElementById( "moy-paie");

		for( var k = 0; k < sel.length; k++ ) {
			id_value = sel[k].value; 
			type_value = sel[k].textContent;
			console.log( "id : " + id_value + ", type : " + type_value );

			// MODE OFFLINE : MISE EN CACHE
			localStorage.setItem( "idMoyPaie_" + k, id_value );
			localStorage.setItem( "typeMoyPaie_" + k, type_value );
		}
	break;
	}
}
function getAppDataCache( ) {
	// mise a jour du btn ASR
	toggleASRBtn( "INIT" );
	var sel;
	// Cache TYPE_NDF
	console.log( "OFFLINE : APPEL DU CACHE : SELECT TYPE_NDF FOR IHM" );
	sel = document.getElementById( "type-ndf" );
	// suppression des anciennes options
	while( sel.firstChild ) { sel.removeChild( sel.firstChild ); }

	for( var i=0; i < localStorage.length; i++ ){
		if(( localStorage.getItem( "idTypeNDF_" + i )) || ( localStorage.getItem( "typeNDF_" + i )) ){	
			var opt = document.createElement( "option" );
			opt.setAttribute( "value", localStorage.getItem( "idTypeNDF_" + i ));
			opt.text = localStorage.getItem( "typeNDF_" + i );
			sel.add( opt );
		}
	}

	// Cache MOY_PAIE
	console.log( "OFFLINE : CACHE : SELECT MOY_PAIE FOR IHM" );
	sel = document.getElementById( "moy-paie" );
	// suppression des anciennes options
	while( sel.firstChild ) { sel.removeChild( sel.firstChild ); }

	for( var i=0; i < localStorage.length; i++ ){
		if( localStorage.getItem( "idMoyPaie_" + i )){	
			var opt = document.createElement( "option" );
			opt.setAttribute( "value", localStorage.getItem( "idMoyPaie_" + i ));
			opt.text = localStorage.getItem( "typeMoyPaie_" + i );
			sel.add( opt );
		}
	}

}

function isOnline( yes, no ){
    var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHttp');
    xhr.onload = function(){
        if(yes instanceof Function){
            yes();
        }
    }
    xhr.onerror = function(){
        if(no instanceof Function){
            no();
        }
    }
    xhr.open("GET","http://developpement.obexto.fr/Services/Mobile.asmx",true);
    xhr.send();
}
function connexionOK( ){
	console.log( "[OK] Connexion Internet" );
	recupererTypeNote ();
	recupererMoyensPaiement ();
	toggleASRBtn( "INIT" ); // active ou pas le bouton pour la prise de note vocale

	if( verifierPresenceNDFTemporaire() ){
		console.log( "----------------" + "\r" + "Ouverture Modale pour ( " + nb_notes_tmp + " ) NDF temporaire(s)" );
		toggleModal( "#div-envoi-ndf-attente" );
	}

	localStorage.setItem( "cached_data", true );
}


function reinitSelect( select_id ) {
	// suppression des anciennes options
	var sel = document.getElementById( select_id );
	if( sel.firstChild ) {
		while( sel.firstChild ) { 
			sel.removeChild( sel.firstChild ); 
		}
	} 
}
function generateNDFTemporisee() {
	console.log( "Envoi OFFLINE ... temporisation" );
	console.log( "GENERER NOM NDF TEMPORAIRE" );

	// NDF Temporaire existe ?
	var en_attente
	var k = 0;

	for( var i = 0; i < localStorage.length; i++ ){
		if( typeof localStorage.getItem( "NDF_" + i ) === "string" ){
			en_attente = "true";
			k ++;
			// break;
		}
	}
	
	// transformation de l'image Base64 en path
	CONT_DOC_NOTE_FRAI = path_to_img;

	if( en_attente === "true" ) { 
		console.log( "	[OK] NDF temporaire(s)" + k + " existante(s)" );
		localStorage.setItem( "NDF_" + k, genererSoapMsg() );
	} else {
		console.log( "	[KO] aucune NDF temporaire" );
		localStorage.setItem( "NDF_0", genererSoapMsg() );
	}
	
	finEnvoyerNDF();
}


function finEnvoyerNDF() {
	// reset formulaire
	form = document.getElementById( 'formAjoutNDF' );			
	form.reset();

	// suppression de la vignette
	try {
	img = document.getElementById("rcpt_post_image" );
	img.removeChild( img.childNodes[0] );
	} catch ( e ) {
		console.log( e.message );
	}

	// suppression spinning icone
	el = document.getElementById( "btnEnvoyerNote" );
	if( document.getElementById( "btn_spinning" )) {
		try { el.removeChild( el.childNodes[0] ); } catch (e) { console.log( e.message ); }
	}
	el.disabled = false;

	// desactivation du bouton ENVOYER
	document.getElementById( "btnEnvoyerNote" ).disabled = true;

	// reinitialisation des dates
	dateFormatSQLServer( );	

}


function preparerNDFTemporaires() {
	var deb, fin, part1, part2, note;

	console.log( "[ENVOI] : NOTES TEMPORAIRES" );

	for( var i = 0; i < localStorage.length; i++ ) {
		note = localStorage.getItem( "NDF_" + i );

		if( note ) {
			console.log( "NOTE EN COURS : NDF_" + i );

			// extraction du fichier - pour generer le path_to_img specific
			deb = note.search( "file:///" );
			fin = note.lastIndexOf( ".jpg" ) + 4;

			if( deb === -1 || fin === -1 ){
				console.log( "NDF_" + i + " SANS PHOTO : " + note );
				finaliserNDFAttente( i );
			} else {

				part1 = note.slice( 0, deb );
				part2 = note.slice( fin );

				path_to_img = note.slice( deb, fin );

				console.log( "part1 : " + part1 );
				console.log( "part2 : " + part2 );
				console.log( "path_to_img : " + path_to_img );

				try {	
					// conversion en base64
					img2base64( i, path_to_img, "NDFTemporaires" );
				} catch ( e ) {
					console.log( "[CATCH] RECURSIVITE ENVOYER NDF TEMPORAIRES" );
					preparerNDFTemporaires();
					// console.log( e.message );
				}
		} } }
	document.getElementById( "modal-body" ).innerHTML = "<h5> Il reste <b>" + nb_notes_tmp + " élément(s) </b> en attente de traitement </h5>"
	console.log( nb_notes_tmp + " : NDF en attente de TRAITEMENT" );
};


function verifierPresenceNDFTemporaire () {
	var marque = false;

	for( var i = 0; i < localStorage.length; i++ ){
		if ( localStorage.getItem( "NDF_" + i )) {
			marque = true;
			console.log( "nb_notes_tmp ++" );
			nb_notes_tmp ++;
		}
	}
	if( marque ){
		console.log( "NDF TEMPORAIRES : PRESENCE" );
		preparerNDFTemporaires();
	} else {	
		console.log( "NDF TEMPORAIRES : AUCUNES" );
	}
	console.log( "nb_notes_tmp : " + nb_notes_tmp );
	return marque;
}


function finaliserNDFAttente( i, b64 ){
	var deb, fin, part1, part2;

	note = localStorage.getItem( "NDF_" + i );

	// extraction du fichier
	if( b64 ) {
		console.log( "NDF en attente avec Image" );
		deb = note.search( "file:///" );
		fin = note.lastIndexOf( ".jpg" ) + 4;
		part1 = note.slice( 0, deb );
		part2 = note.slice( fin );

		localStorage.setItem( "NDF_" + i, part1 + b64 + part2 );
	} else {
		console.log( "NDF en attente sans Image" );
	}
	envoyerNDFSoap( localStorage.getItem( "NDF_" + i ), "NDF_" + i );
}

function toggleModal( mod ){
	$( mod ).modal( 'toggle' );
}


function toggleASRBtn( etat ) {
	var btn = document.getElementById( "micro" );
	switch( etat ){
	case "INIT" :
		console.log( "ASR TOGGLING INIT" );
		isOnline( function () {
			toggleASRBtn( "OK" );
		}, function () {
			toggleASRBtn( "KO" );
		});
	break;
	case "OK" :
		console.log( "ASR TOGGLING OK" );
		btn.style.opacity = "1";
		btn.setAttribute( "ontouchstart", "javascript:testSpeech();" );
	break;
	case "KO" :
		console.log( "ASR TOGGLING KO" );
		btn.style.opacity = "0.5";
		btn.removeAttribute( "ontouchstart" );
	break;
	}
}
