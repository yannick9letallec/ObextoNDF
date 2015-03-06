function startSpeech ( element ) {
	if ( window.plugins.speechrecognizer ) {
		console.log( "ELEMENT : " + element );
		var maxMatches = 1
		var promptString = "C'est à vous !";
		var language = "fr_FR";
		window.plugins.speechrecognizer.startRecognize( 
			function( result ) {
				document.getElementById( element ).value = result;
			},
			function( errorMessage ) {
				console.log( "Erreur : " + errorMessage );
			}, maxMatches, promptString, language );
	} else {
		console.log( "Plugin Speech Recognizer non Installé" );
	}
} 
