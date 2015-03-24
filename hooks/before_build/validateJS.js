#! /usr/bin/nodejs

console.log( "DEBUT VALIDATION HTML" );
var validator = require( 'html-validator' );
var fs = require( 'fs' );
var results = [], resHTML = [];	
var opts = {
	format: "text"
	};

var walk = function( path ){
	var list = fs.readdirSync( path );
	for( var i = 0; i < list.length; i++ ){
		var p = path + "/" + list[i];
		var stat = fs.lstatSync( p );
		results.push( p );
	}
	return results;
};

var filtreHtmlFile = function( ){
	for( var i = 0; i < results.length; i++	){
		var res = results[i].match( /.html$/g );
		if( res === null ){ 
			delete results[i];
			// console.log( results[i] ); 
		} else {
			resHTML.push( results[i] );
			console.log( results[i] ); 
			}
	}
	// reinit de results
	results = [];

	return resHTML;
};


walk( "/var/www/ObextoNDF/www" );
filtreHtmlFile( );

// TODO : improve with a closure !!
var val, ida;
( function (){
	fs.writeFile( "/var/www/ObextoNDF/outs/html-validator.txt", "" );
	for( var k = 0; k < resHTML.length; k ++ ){
		var fichier = resHTML[k];
			
		// fonction auto executée avec l'argument fichier en 
		(function t ( fichier ) {
			fs.readFile( fichier, "utf8", function( err, html ) {
				if( err) throw err;
		
				opts.data = html;

				validator( opts, function( err, data ){
					if( err) throw err;
					fs.appendFile( "/var/www/ObextoNDF/outs/html-validator.txt", "\r\n" + fichier, function( err ){
						// console.log( err );
					});
					fs.appendFile( "/var/www/ObextoNDF/outs/html-validator.txt", data, function( err ){
						// console.log( err );	
					});
				});
			});
		})( fichier );
	}
})();
