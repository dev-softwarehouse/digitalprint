var textReturns = {
	
	'alt+l' : 'ł'

};

var getCharFromEvent = function( e ){

	console.log( e );
	if( e.altKey )
		console.log('jest alt');
}