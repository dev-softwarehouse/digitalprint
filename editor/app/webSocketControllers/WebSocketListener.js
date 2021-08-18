	
class WebSocketListener{
	
	constructor( callback ){

		this.id = Math.floor( Math.random()*1100000 );
		this.callback = callback;

	}

	getID (){

		return this.id;

	}

	run ( data ){

		this.callback( data );

	}
	
};


export { WebSocketListener };