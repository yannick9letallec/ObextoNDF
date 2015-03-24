if( navigator.userAgent.match( /Trident/ ) ){
	var msViewPortStyle = document.createElement( "style" );
	msViewPortStyle.setAttribute( "type", "text/css" );
	var cssText = "@-ms-viewport{ width: device-width!important }"

	if( msViewPortStyle.styleSheet ){
		msViewPortStyle.styleSheet.cssText = cssText;
 	} else {
		msViewPortStyle.appendChild( document.createTextNode( cssText ));
	}
	document.getElementsByTagName( "head" )[0].appendChild( msViewPortStyle );
}
