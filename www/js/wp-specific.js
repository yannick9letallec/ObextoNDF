if( navigator.userAgent.match( /IEMobile\/10\.0/ ) ){
	var msViewPortStyle = document.createElement( "style" );
	msViewPortStyle.appendChild( 
		document.createTextNode( 
			"@-ms-viewport{ width: auto!important; }"
		)
	);
	document.getElementsByTagName( "head" )[0].appendChild( msViewPortStyle );
