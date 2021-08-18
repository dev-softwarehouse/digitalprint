var _ = require('lodash');
var EditorObject = require('./EditorObject').EditorObject;


	/**
	* Klasa reprezentująca warstwę.
	*
	* @class Layer
	* @constructor
	*/
	function Layer( name, dataBaseId ){
		
		// wywołanie nadrzędnych konstruktorów w kontekscię Layer

		createjs.Container.call(this);
		//EditorObject.call( this, false, {}, true );

		this.removeChild( this.borderLayer );
		this.removeChild( this.mainLayer );
        this.removeChild( this.shadowLayer );
        this.removeChild( this.backgroundFrameLayer );
        

		this.borderLayer = null;
		this.mainLayer = null;

		this.name = name;
		this.objects = {};
		this.layers = {};
		this.attributes = {};
		this.pages = {};
		this.objectsOrder = [];
		this.dbId = dataBaseId;// id z bazy danych

		this.composedObjects = {

			top: [],
			bottom: []

		};

	};


	var p = Layer.prototype = $.extend( true, new createjs.Container() , Object.create( EditorObject.prototype) );

	p.constructor = Layer;



	/**
	* Lokalna tablica przechowujaca informacje o obiektach kompozycyjnych
	*
	* @property composedObjects
	*/



	/**
	* Dodaje obiekt kompozycjy do dolnej części obiektu ( wyświetlana jest zawsze na samym dole )
	*
	* @method addBottomCompoundObject
	*/
	p.addBottomCompoundObject = function( object ){

		var lastBottomComposedObject = this.composedObjects.bottom.length;
		this.addChildAt( object, lastBottomComposedObject );
		this.composedObjects.bottom.push( object );

	};


	/**
	* Dodaje obiekt kompozycjy do górnej części obiektu ( wyświetlana jest zawsze na samej górzye)
	*
	* @method addTopCompoundObject
	*/
	p.addTopCompoundObject = function( object ){

		this.addChild( object );
		this.composedObjects.top.push( object );

	};


	p.rebuildCompoundObjects = function(){

		this.composedObjects.top.map( ( elem ) => {

			this.removeChild( elem );

		});

		this.composedObjects.bottom.map( ( elem ) => {
			
			this.removeChild( elem );

		});

		this.composedObjects.top.map( ( elem ) => {
			
			this.addChild( elem );

		});

		this.composedObjects.bottom.map( ( elem, index ) => {
			
			this.addChildAt( elem, index );

		});

	}


	/**
	* Usuwa wsZystkie obiekty z warstwy
	*
	* @method removeAllObjects
	*/
	p.getCompoundsObjectsCount = function(){

		return this.composedObjects.top.length + this.composedObjects.bottom.length;

	};


	p.returnCompounds = function(){

		return this.composedObjects;

	};


	p.getCompoundsTopObjectsCount = function(){

		return this.composedObjects.top.length;

	};


	p.getCompoundsBottomObjectsCount = function(){

		return this.composedObjects.bottom.length;

	};


	p.getRealNumChildren = function(){

		return this.getNumChildren() - this.getCompoundsObjectsCount();

	};


	p.addMainChildAt = function( object, index ){

		this.addChildAt( object, index+this.getCompoundsBottomObjectsCount() );

	};


	p.addMainChild = function( object ){

		this.addChildAt( object, this.getNumChildren()-this.getCompoundsTopObjectsCount() );

	};


	/**
	* Zwraca lokalną tablicę sortowania - nie powinno już być używane!.
	*
	* @method getObjectsOrder
	*/
	p.getObjectsOrder = function(){

		return this.objectsOrder;

	};


	/**
	* Dodaje text do obiektu warstwy
	*
	* @method addText
	* @param {Object} object Instancja EditorText.
	*/
	p.addText = function( object ){

		var l = Editor.stage.getObjectById( MAIN_LAYER );
		Editor.stage.addObject( object );

		this.objectsOrder.push({ 'type': 't', id : object.id, name: object.name });

		this.objects[object.id] = object;

		l.addChild( object );

	};



	/**
	* Dodaje obiekt do warstwy
	*
	* @method addObject
	* @param {Object} object Obiekt dodawany do warstwy.
	* @param {Int} index Pozycja dodawanego obiektu
	*/
	p.addObject = function( object, index ){

		var Editor = this.editor;
		var t = Editor.stage.getObjectById( MAIN_LAYER );

		Editor.stage.addObject( object );
		this.objects[object.id] = object;

		this.objectsOrder.push({ 'type': 'o', id : object.id, name: object.name });

		if( index != undefined ){

			this.addChildAt( object, index);
		
		}
		else {
		
			this.addChild( object );
		
		}

	};


	/**
	* Usuwa wszystkie obiekty z warstwy.
	*
	* @method removeAllObjects
	*/
	p.removeAllObjects = function(){

		for( var key in this.objects ){

			var parent = Editor.stage.getObjectById(this.objects[key].parent.id);
			parent.removeChild( this.objects[key]);
		
			if( this.objects[key].image ){
				this.objects[key].image = null;
				this.objects[key] = null;
			}

			delete this.objects[key];
		}

		var mainLayer = Editor.stage.getMainLayer();

		for( var key in this.layers ){

			if( this.objectsOrder ){
				for( var i=0; i<this.objectsOrder.length; i++){

					var orders = this.objectsOrder;

					delete this.objectsOrder[i];
					this.objectsOrder.length--;
				}
			}
			this.objectsOrder.length = 0;
			this.layers[key].removeAllObjects();

			if( key != MAIN_LAYER){
				//this.layers[key].body.removeAllChildren();
				var layerParent = Editor.stage.getObjectById( this.layers[key].parent.id );

				if( layerParent instanceof createjs.Stage ){
					layerParent.removeChild( this.layers[key] );
				}
				else {
					layerParent.removeChild( this.layers[key] );
					delete this.layers[key];
				}
			}
		}
		this.objectsOrder = [];

	};


	/**
	* Usuwa wszystkie obiekty z warstwy.
	*
	* @method removeObject
	* @param {Int} object_id Id usuwania obiektu
	*/
	p.removeObject = function( object_id ){

		var childToRemove = Editor.stage.getObjectById( object_id );

		for( var i=0; i < this.objectsOrder.length; i++ ){

			if( this.objectsOrder[i].id == object_id  ){

				if( this.objectsOrder[i].type == 'o' ){

					delete this.objects[this.objectsOrder[i].id];

				}
				else if( this.objectsOrder[i].type =='l' ){

					delete this.layers[this.objectsOrder[i].id];

				}

				this.objectsOrder.splice(i, 1);

			}

		}

		this.removeChild( childToRemove );

	};


	/**
	* Usuwa wszystkie obiekty z warstwy.
	*
	* @method detachLayer
	* @param {Int} layer_id Id usuwanej warstwy
	*/
	p.detachLayer = function( layer_id ){

		var childToRemove = Editor.stage.getObjectById( layer_id );

		for( var i = 0; i < this.objectsOrder.length; i++ ){

			if( this.objectsOrder[i].id == layer_id ){

				this.removeChild( childToRemove );
				delete this.layers[ this.objectsOrder[i].id ];
				this.objectsOrder.splice(i, 1);

			}

		}

	};


	/**
	* Dodaje warstwę do obiektu.
	*
	* @method addLayer
	* @param {Object} layer Obiekt warstwy
	* @param {Int} dataBaseId Id obiektu w bazie danych
	*/	
	p.addLayer = function( layer, dataBaseId ){

		Editor.stage.addObject( layer );
		Editor.stage.pushLayer( layer );
		this.layers[layer.id] = layer;

		this.objectsOrder.push({ 'type': 'l', name : layer.name, id: layer.id, dbId : dataBaseId });

		this.addChild( layer );

	};


	p.addPage = function( page ){

		Editor.stage.pushLayer( page );
		Editor.stage.addObject( page );
		this.pages[page.id] = page;
		this.objectsOrder.push( { 'type' : 'p', name : page.name, id : page.id } );
		this.addChild( page );

	};


	/**
	* Sortuje obiekty wewnątrez warstwy za pomocą przekazanej tablicy
	*
	* @method sortArray
	* @param {Array} sortedArray Tablica nowo posortowanych obiektów
	*/
	p.sortArray = function( sortedArray ){

		for( var i=0; i < sortedArray.length; i++){

			this.swapObjects( parseInt(sortedArray[i]), parseInt( this.objectsOrder[i].id ) );

		}

	};


	/**
	* Zmienia widoczność obiektu
	*
	* @method toggleVisible
	*/
	p.toggleVisible = function(){

		if( this.visible ){

			this.visible = false;

		} else {

			this.visible = true;

		}

	};


	/**
	* Zmienia blokowanie myszki obiektu
	*
	* @method toggleLock
	*/
	p.toggleLock = function(){

		if( this.mouseEnabled ){

			this.mouseEnabled = false;

		} else {

			this.mouseEnabled = true;

		}

	};


	/**
	* Przekazuje obiekt do innej warstwy
	*
	* @method swapObjectBetweenLayers
	* @param {Int} object_id Id obiektu który ma zostać przeniesiony
	* @param {Int} layer_id Id warstwy do której ma zostać przeniesiony obiekt
	*/
	p.swapObjectBetweenLayers = function( object_id, layer_id ){

		var childToMove = Editor.stage.getObjectById( object_id );
		this.removeObject( object_id );
		var layer = Editor.stage.getObjectById( layer_id );

		if( childToMove instanceof Editor.Text ){

			layer.addText( childToMove );

		}
		else{

			layer.addObject( childToMove );

		}

	};


	/**
	* Przekazuje warstwę potomną do innej warstwy
	*
	* @method moveLayerToOther
	* @param {Int} layerId Id warstwy która ma zostać przeniesiona
	* @param {Int} destinationLayer Id warstwy do której ma zostać przeniesiony obiekt
	*/
	p.moveLayerToOther = function( layerId, destinationLayer ){

		var layer = Editor.stage.getObjectById( layerId );
		var parentLayer = Editor.stage.getObjectById( layer.parent.id );
		var destinationLayer = Editor.stage.getObjectById( destinationLayer );
			
		this.detachLayer( layerId );

	};


	/**
	* Zwraca posortowaną tablicę obiektów
	*
	* @method getSortArray
	* @return {Array} Posortowana tablica obiektów.
	*/
	p.getSortArray = function( ){

		var array = [];

		for( var i =0; i < this.getNumChildren(); i++ ){

			array.push( this.getChildAt( i ).id );

		}

		return array;

	};


	/**
	* Zamienia dwa obiekty miejscami
	*
	* @method swapObjects
	* @param {Int} object1_id Pierwszy obiekt
	* @param {Int} object2_id Drugi obiekt
	*/
	p.swapObjects = function( object1_id, object2_id ){

		//console.log([  this.objectsOrder[0], this.objectsOrder[1] ] );
		// zamienia pozycjami dwa obiekty, zmienia to kolejnosc renderingu
		var object1 = Editor.stage.getObjectById( parseInt(object1_id));
		var object2 = Editor.stage.getObjectById( parseInt(object2_id));

		this.swapChildren( object1, object2 );

		var o1;
		var o2;

		for( var i=0; i < this.objectsOrder.length; i++){

			var current =  this.objectsOrder[i];
			if( current.id == object1_id) o1 = i;
			if( current.id == object2_id) o2 = i;

		}

		var temp = this.objectsOrder[o1];

		this.objectsOrder[o1] = this.objectsOrder[o2];
		this.objectsOrder[o2] = temp;

	};


	/**
	* Aktualizuje obiekty wewnątrz warstwy lub innego obiektu posiadającego dzieci. Przelicza ich rozmiar.<br>
	* <b>Nie bierze pod uwagę obiektów kompozycji!.</b>
	*
	* @method updateInsideObjects
	*/	
	p.updateInsideObjects = function(){

		// topCompoundObjects and botomCompoundsObjects
		var tco = this.getCompoundsTopObjectsCount();
		var bco = this.getCompoundsBottomObjectsCount();
		var childrenLength = this.children.length;
		var trueChildLenght = childrenLength - tco - bco;

		for( var i=bco; i< bco + trueChildLenght; i++ ){

			this.children[i]._updateSize();
			//console.log("prawdziwe obiekty");
			//console.log( this.children[i] );

		}

	};


	/**
	* HTML'owa reprezentacjia obiektu jako warstwa
	*
	* @method toLayerHTML
	* @return {DOMElement} HTML'owa reprezentacja obiektu
	*/
	p.toLayerHTML = function(){

		var _this = this;

		var layerElem = document.createElement('li');

		layerElem.addEventListener('click', function( e ){

			e.stopPropagation();
			//console.log('tutaj powinno multi zaznaczenie obiektow w  warstwie');

		});

        var layerVisibility = document.createElement('span');
        layerVisibility.className = 'objectVisibility  shown ' + ( ( this.visible ) ? 'visible' : 'notvisible' );
        layerVisibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( _this.visible ){
                _this.visible = false;
                layerVisibility.className = 'objectVisibility ' + ( ( _this.visible ) ? 'visible' : 'notvisible' );
            }
            else {
                _this.visible = true;
                layerVisibility.className = 'objectVisibility ' + ( ( _this.visible ) ? 'visible' : 'notvisible' );
            }

        });

        var layerElemTitle = document.createElement('span');
        layerElemTitle.className = 'objectName';
        layerElemTitle.innerHTML = this.name;

        var layerChildren = document.createElement('ul');

        for( var i=0; i < this.children.length; i++ ){

        	layerChildren.appendChild( this.children[i].toLayerHTML() );

        }

        var layerHideButton = document.createElement('span');
        layerHideButton.className = 'layerHideButton shown';

        layerHideButton.addEventListener('click', function( e ){

        	e.stopPropagation();
        	if( $( this ).hasClass('shown') ){

        		$( this ).parent().removeClass('shown').addClass('hiden');
        		$( this ).removeClass('shown').addClass('hiden');

        	}else {

        		$( this ).removeClass('hiden').addClass('shown');
        		$( this ).parent().removeClass('hiden').addClass('shown');

        	}

        });

        layerElem.appendChild( layerVisibility );
        layerElem.appendChild( layerElemTitle );
        layerElem.appendChild( layerHideButton );
        layerElem.appendChild( layerChildren );

        return layerElem;

	};


	/**
	* HTML'owa reprezentacjia obiektu
	*
	* @method HTMLoutput
	* @return {String} Napis reprezentujący obiekt
	*/
	p.HTMLoutput = function(){

		var HTML = "";

		var num =  this.getNumChildren();

		for( var i=num-1; i >= 0; i-- ){

			var object = this.getChildAt(i);
			object = this.editor.stage.getObjectById( object.id );
			//console.log( object );
			if( object ){

				HTML += object.HTMLoutput();

			}

		}

		HTML += "</ul>";

		return HTML;

	};

export { Layer };