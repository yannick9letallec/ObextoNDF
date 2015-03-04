function selectPictureSrc () {
	try {
		navigator.notification.confirm( "Choix Image Source :", photoConfirmCallback, "Image Source", ["CAMERA", "GALLERY" ] ); 
	} catch ( e ) {
		// alert( e.message );
	}
}
function photoConfirmCallback( buttonIndex ) {
	if( buttonIndex == 1 ) { // CAMERA
		takePicture( 1 );
	} else if ( buttonIndex == 2 ) { // GALLERY
		takePicture( 2 );
	}
}
function takePicture ( x ) {
	// Base64 :: Camera.DestinationType.DATA_URL
	// URL :: Camera.DestinationType.FILE_URI
	 navigator.camera.getPicture( onPhotoDataSuccess, onFail, { sourceType: x,  encodingType: Camera.EncodingType.JPEG, quality: 25, destinationType: Camera.DestinationType.FILE_URI, correctOrientation: true } ); 

	function onPhotoDataSuccess( imageSrc ) {
		  file = encodeURI( imageSrc );
		  path_to_img = file;

		  releveGeoLocalisation( "IMG" );
		  //  "data:image/jpeg;base64,"
		  // On récupère le chemin de la photo
		  /*
			1 - afficher fenetre modale bootstrap
			2 - y loger l'image
			3 - Action : { valider, annuler, recommencer }
				valider : on garder et on affiche l'url
				annuler : on annule tout et on efface tout
				recommencer : on relance la fonction de prise de photo
		  */
		  var divImg = document.getElementById( 'rcpt_post_image' );
		  // cas initial, le div conteneur est vide
		  // suppression des childsNodes si image déjà présente

		  if( divImg.hasChildNodes() ) {

			  var divChild = divImg.childNodes;

			  while( divImg.hasChildNodes() == true ) {
				var enfant = divChild.item( 0 );
				divImg.removeChild( enfant );
		  	}
		  }
		  
		  var image = document.createElement( "IMG" );
		  image.src = file;
		  image.className = "img-responsive";
		  document.getElementById( 'rcpt_post_image' ).appendChild( image );
	
		  // generation du base 64 pour l'image
		  PATH_FIC = file;
		  NOM_FIC = file.slice( file.lastIndexOf( "/" ) + 1 );
		  
		  // activation du bouton ENVOYER
		  document.getElementById( "btnEnvoyerNote" ).disabled = false;

		  // ONLINE ou OFFLINE, on génère le base64, qui sera éventuellement transformé en chemin si envoi offline
		  img2base64();

	}
	function onFail ( msg ) {
		// alert( "Impossible de lancer l'appreil photo : " + msg  );
	}
} 
