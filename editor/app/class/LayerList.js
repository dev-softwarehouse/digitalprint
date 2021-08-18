this.Editor = this.Editor || {};

(function(){
	
	function LayerList( stage ){

		this.stage = stage;
		this.layers = {};
	};

	var p = LayerList.prototype;


    /**
	* Generuje wszystkie warstwy na nowo
	*
	* @method generateLayers
	* @return {HTML} Object html'owy reprezentujący element warstw
	*/
	p.generateLayers = function(){

		var children = this.stage.getMainLayer().children;

		var layerHTML = document.createElement('div');

		for( var i=0; i < children.length; i++ ){

			layerHTML.appendChild( children[i].toLayerHTML() );

		}

		return layerHTML;

	};


    /**
	* Zmienia pozycję obiektu w warstwach
	*
	* @method changePosition
	*/
	p.changePosition = function( object, newPosition ){



	};


	Editor.LayerList = LayerList;

})();