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
		btn.setAttribute( "ontouchstart", "javascript:startSpeech( 'REMQ' );" );
	break;
	case "KO" :
		console.log( "ASR TOGGLING KO" );
		btn.style.opacity = "0.5";
		btn.removeAttribute( "ontouchstart" );
	break;
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
	getNbNDFTmp( "INIT" );
	toggleASRBtn( "INIT" ); // active ou pas le bouton pour la prise de note vocale
}
function connexionKO () {
	console.log( "[KO] Connexion Internet" );
	getNbNDFTmp( "INIT" );
	toggleASRBtn( "KO" ); // active ou pas le bouton pour la prise de note vocale
}

function getDateJour() {
	var j, m, a, date;

	date = new Date( );
	j = date.getDay() + 1;
	m = date.getMonth() + 1;
	a = date.getFullYear();
	// TODO :: prefix with 0 for single digit date elements

	var element = document.getElementById( "DTE_CREA_UTC" ).value = prefixDate( a ) + "-" + prefixDate( m ) + "-" + prefixDate( j ); 

	function prefixDate( valeur ) {
		if( valeur.toString().length === 1 ) {
			valeur = "0" + valeur;
			return valeur;
		} else {
			return valeur;
		}
	}
}


function validerFormulaireConnexion() {
	DTE_CREA_UTC = document.getElementById( "DTE_CREA_UTC" ).value;
	DTE_CREA_UTC = dateFormatSQLServer ( DTE_CREA_UTC );

	REMQ = document.getElementById( "REMQ" ).value;
	NB_KM = document.getElementById( "NB_KM" ).value;

	isOnline( function(){
		releveGeoLocalisation ( "ENV" );
	}, 
	function() {
		generateSOAP();
		cacheSOAP();
	});
}


function generateSOAP () {
	var log = window.localStorage.getItem( 'login' );
	var pw = window.localStorage.getItem( 'password' );
	var command = "mobile.INDEMNITES_KILOMETRIQUES_AJOUTER";
	
	return soapMsg = "<?xml version='1.0' encoding='utf-8'?>" +
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
		  "<ParameterName>" + "@NB_KM"  + "</ParameterName>" + 
		  "<Value xsi:type='xsd:double'>" + NB_KM + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@REMQ" + "</ParameterName>" + 
		   "<Value xsi:type='xsd:string'>" + REMQ + "</Value>" +
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
		  "<ParameterName>" + "@LAT_ENV" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LAT_ENV ) +
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@LNGT_ENV" + "</ParameterName>" + 
		   isNull( "<Value xsi:type='xsd:double'>", LNGT_ENV ) +
		"</ActualParameter>" + 
	      "</parameters>" + 
	    "</ExecuteCommand>" + 
	  "</soap:Body>" + 
	"</soap:Envelope>";
}
function sendSOAP( payload, origin ) {

        // FEATURE DETECTION & ADAPTATION NAVIGATEUR
        if( window.XMLHttpRequest ) {
                var xhr = new XMLHttpRequest();
        } else if ( window.ActiveXObject ) {
                var xhr = new ActiveXObject( "Microsoft.XMLHTTP" );
	}
	if ( xhr ) {
                xhr.onreadystatechange = function () {
                        if ( xhr.readyState == 4 ) {
                                if ( xhr.status == 200 ) {
					window.localStorage.setItem( "SOAPResponse", xhr.responseText.toString() );
					// reset formulaire, et champ date prérempli de la date du jour 
					getNbNDFTmp( "SUP_IK_TMP" );
					document.getElementById( "ajoutIK" ).reset();
					getDateJour();
				} else {
					console.log( '[KO] Connexion Internet' );
				}
				errorResponse = xhr.responseXML;
                        } else { 
				// alert( xhr.status + "  XHR SOAP : " + xhr.responseText  /* localStorage.SOAPResponse */ ); 
			}
                }
		xhr.onloadstart = function () {
			// to = setTimeout( function() { verifierDroitsAccesErp(); }, 8000 );
			console.log( "loadstart" );
		}
		xhr.onloadend = function () {
			// verifierDroitsAccesErp();
			// clearTimeout( to );
			console.log( "loadend" );
			origin ? localStorage.removeItem( origin ): setTimeout( function() {}, 0 );
		}
        } else {
                console.log( "XHR KO" );
        }

	try{ // developpement.obexto.fr:8443
		xhr.open( "POST", "https://" + localStorage.getItem( "server" ) + "/Services/Mobile.asmx" );
		xhr.setRequestHeader( "Content-Type", "text/xml; charset=utf-8;" ); // application/x-www-form-urlencoded; charset=utf-8;" );
		xhr.setRequestHeader( "SOAPAction", "http://obexto.fr/Services/ExecuteCommand" );
	} catch( e ) {
		console.log( e.message );
	}

        try { 
		xhr.send( payload ? payload : soapMsg );
	 } catch( e ) { 
		console.log( "Message erreur XHR : " + e.message ); 
	}
}
function cacheSOAP() {
	var nb = 0;
	for( var i = 0; i < localStorage.length; i++ ){
		if( typeof localStorage.getItem( "IK_" + i ) === "string" ){
			console.log( "IK Presente" );
			nb ++;
		}
	}
	localStorage.setItem( "IK_" + nb, soapMsg );
	getNbNDFTmp( "AJ_IK_TMP" );

	// reset formulaire, et champ date prérempli de la date du jour 
	document.getElementById( "ajoutIK" ).reset();
	getDateJour();
}

function dateFormatSQLServer ( dateHTML ){
	var date = dateHTML.split( "-" );
	// alert( date[0] + " " + date[1] + " " + date[2] );
	
	// construction d'une date au format SQL Server
	
	var d = new Date();
	d.setFullYear( date[0] );
	d.setMonth( date[1] - 1 );
	d.setDate( date[2] );

	var date = d.toISOString();

	date = date.replace( 'Z', '0000Z' );

	var tmp = date.split( 'Z' );
	return date;
}	

function isNull( pre, data ) {
	if ( typeof data === "undefined" || data == "" ){
		return "";
	} else {
		// var loc =data.toString().trim();
		return pre + data + "</Value>";
	}
}


function releveGeoLocalisation ( type ) {
	var res = ""; 

	// feature Test
	if ( navigator.geolocation !== "undefined" ){
		// navigator.geolocation.getCurrentPosition( geoSuccess, geoError ); */
		navigator.geolocation.getCurrentPosition( geoSuccess, geoError );
		function geoSuccess( position ) { 
			// no var to keep res local
			lat = tronque ( position.coords.latitude );
			lat = lat.replace( ",", "." );
			lngt = tronque ( position.coords.longitude );
			lngt = lngt.replace( ",", "." );
			switch( type ) {
				case "CREA" :
					LAT_CREA = lat;     
					LNGT_CREA = lngt; 
					break;
				case "ENV" :
					LAT_ENV = lat;     
					LNGT_ENV = lngt; 
					generateSOAP();	
					sendSOAP();
					break;
			}
		}
		function geoError ( error ) { 
			res = "[ERREUR] :: GEOLOCALISATION ERREUR : code = " + error.code + " : message : " + error.message;
			console.log( res );
		}
	} else {
		console.log( 'Votre navigateur ne prend pas en charge la Géo Localisation, merci de bien vouloir le mettre à jour' );
	} 
}
function tronque( val ) {
	console.log( 'DANS : tronque()' );
	// String -> Array
	var tmp = val.toString().split('.');
	// on tronque effectivement la chaine	
	tmp[1] = tmp[1].substring( 0, 7 );
	// on recrée la valeur géolocalisation
	return tmp.toString();
}

function verifierCacheIK() {
	var payload = "";

	for( var i = 0; i < localStorage.length; i++ ){
		payload = localStorage.getItem( "IK_" + i );
		if( typeof payload === "string" ){
				activateBlink( "ON", "rcpt_nb_ik_tmp" );
				sendSOAP( payload, "IK_" + i );			
		} else {
			// DO SOMETHING IF NEEDED
		}
	}


}
function activateBlink( etat, elem ){
	switch( etat ){
		case "ON" :
			document.getElementById( elem ).className += " blink";
			$(document).ready( function (){
				$( "#" + elem ).blink( { delay: 100 });
			});
		break;
		case "OFF" :
			document.getElementById( elem ).classList.remove( "blink" );
			$(document).ready( function (){
				$( "#" + elem ).unblink();
			});
		break;
	}

}


function getNbNDFTmp( etat ) {
	var elem = document.getElementById( "rcpt_nb_ik_tmp" );

	switch( etat ){
	case "INIT" :
		console.log( "Comptage IK Temporaires" );
		for( var i = 0; i < localStorage.length; i++ ){
			if ( localStorage.getItem( "IK_" + i )) {
				console.log( "nb_notes_tmp ++" );
				nb_notes_tmp ++;
			}
		}
		if( nb_notes_tmp > 0 ) { 
			console.log( "IK Presentes" );
			elem.innerText = getMsgNbNDFTmp(); 
		}
	break;
	case "AJ_IK_TMP" :
		nb_notes_tmp ++;
		elem.innerText = getMsgNbNDFTmp();
	break;
	case "SUP_IK_TMP" :
		console.log( "NB IK : " + nb_notes_tmp );
		elem.innerText = getMsgNbNDFTmp();
		nb_notes_tmp --;
		if( nb_notes_tmp <= 0 ){
			elem.innerText = "";
			activateBlink( "OFF", "rcpt_nb_ik_tmp" );
		}
	break;
	}
}
function getMsgNbNDFTmp() {
	var txt = "( " + nb_notes_tmp + " ) en attente"; 
	return txt;
}
