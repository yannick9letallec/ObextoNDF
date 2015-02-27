function startSpeech () {
	var maxMatches = 1
	var promptString = "C'est à vous !";
	var language = "fr_FR";
	window.plugins.speechrecognizer.startRecognize( 
		function( result ) {
			document.getElementById('REMQ_NOTE_FRAI').innerHTML = result;
		},
		function( errorMessage ) {
			console.log( "Erreur : " + errorMessage );
		}, maxMatches, promptString, language );
} 
function testSpeech( ) {
	if ( window.plugins.speechrecognizer ) {
		startSpeech();
	} else {
		console.log( "Plugin Speech Recognizer non Installé" );
	}
} 
