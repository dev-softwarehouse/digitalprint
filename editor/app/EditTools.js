var EditComponent = require('./EditComponent').EditComponent;


	/**
	* Klasa zarządzająca komponentami edycyjnymi.
	*
	* @class EditTools
	* @constructor
	*/
export function EditTools( name ){

	this.name = name;
	this.components = [];

	this.addComponent = function( component ){

		if( component instanceof EditComponent){

			this.components.push( component );

		}
		else {

			console.log( component );
			console.trace();
			console.error("błędny typ");

		}

	};

};
