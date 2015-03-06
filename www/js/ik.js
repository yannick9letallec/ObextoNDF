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
		btn.setAttribute( "ontouchstart", "javascript:startSpeech( 'REMQ_IK' );" );
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
	toggleASRBtn( "INIT" ); // active ou pas le bouton pour la prise de note vocale
}
function connexionKO () {
	console.log( "[KO] Connexion Internet" );
	toggleASRBtn( "KO" ); // active ou pas le bouton pour la prise de note vocale
}

function getDateJour() {
	var j, m, a, date;

	date = new Date( );
	j = date.getDay() + 1;
	m = date.getMonth() + 1;
	a = date.getFullYear();
	// TODO :: prefix with 0 for single digit date elements

	var element = document.getElementById( "DTE_CREA_IK" ).value = prefixDate( a ) + "-" + prefixDate( m ) + "-" + prefixDate( j ); 

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
	DTE_CREA_IK = document.getElementById( "DTE_CREA_IK" ).value;
	DTE_CREA_IK = dateFormatSQLServer ( DTE_CREA_IK );

	REMQ_IK = document.getElementById( "REMQ_IK" ).value;
	NB_KM_IK = document.getElementById( "NB_KM_IK" ).value;

	isOnline( sendSOAP, 
	function() {
		generateSOAP();
		cacheSOAP();
	});
}


function generateSOAP () {
	var log = window.localStorage.getItem( 'login' );
	var pw = window.localStorage.getItem( 'password' );
	var command = "mobile.IK_AJOUTER";
	
	return soapMsg = "<?xml version='1.0' encoding='utf-8'?>" +
	"<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>" + 
	 "<soap:Body>" + 
	    "<ExecuteCommand xmlns='http://obexto.fr/Services'>" + 
	      "<userName>" + log + "</userName>" + 
	      "<password>" + pw + "</password>" + 
	      "<commandName>" + command + "</commandName>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@DTE_CREA_IK"  + "</ParameterName>" + 
		  "<Value xsi:type='xsd:dateTime'>" + DTE_CREA_IK + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@DTE_PREM_ENV_UTC"  + "</ParameterName>" + 
		  "<Value xsi:type='xsd:'>" + NB_KM_IK + "</Value>" + 
		"</ActualParameter>" + 
		"<ActualParameter>" + 
		  "<ParameterName>" + "@REMQ_IK" + "</ParameterName>" + 
		   "<Value xsi:type='xsd:string'>" + REMQ_IK + "</Value>" +
		"</ActualParameter>"; 
}
function sendSOAP() {
	
}
function cacheSOAP() {
	var nb = 0;
	for( var i = 0; i < localStorage.length; i++ ){
		if( typeof localStorage.getItem( "IK_" + i ) === "string" ){
			console.log( "IK presente" );
			nb ++;
		} else {
			console.log( "IK ABSENTE" );
		}
	}
	localStorage.setItem( "IK_" + nb, soapMsg );
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
