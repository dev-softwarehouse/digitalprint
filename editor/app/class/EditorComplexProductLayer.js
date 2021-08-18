
this.Editor = this.Editor || {};

(function(){

	/**
	* Klasa reprezentująca obiekt widoku.
	*
	* @class EditorComplexProductLayer
	* @constructor
	*/
	function EditorComplexProductLayer( productGroup, order ){

        // inicjalizacja konstruktorów
        createjs.Container.call( this );

        this.productGroupName = productGroup.name;
        this.productGroup = productGroup.id;

	};


	var p = EditorComplexProductLayer.prototype = $.extend( true, {}, new Object( createjs.Container.prototype ) );


	p.constructor = EditorComplexProductLayer;


	Editor.EditorComplexProductLayer = EditorComplexProductLaye;

    
})();