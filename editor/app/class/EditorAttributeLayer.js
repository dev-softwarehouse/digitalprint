"use strict"

Editor = Editor || {};

(function (){

	/**
	* Klasa reprezentująca warstwę posiadającą możliwości edycyjne.
	*
	* @class EditorAttributeLayer
	* @constructor
	*/

	function AttributeLayer( name, layerType, dataBaseId ){

		Editor.Layer.call(this, name, dataBaseId );

		this.name = name;
		this.objects = {};
		this.layers = {};
		this.attributes = {};
		this.objectsOrder = [];
		this.dbId = dataBaseId;
		this.attributeName;
		this.attributeOptions = {};

		this.type ='bitmap';
		this.layerType = layerType;

		this.atribute_id = null;
		this.atribute_name = null;

		// polaczenie warstwy/obiektu z opcja
		this.attribute_layers_connections = {};
		this.options = [];
		this.optionsCombination = {};
		this.forUser = true;

		Editor.stage.addAttributeLayer( this );

		//console.log("Informacje o warstwei");
		//console.log( this );

	};


	var p = AttributeLayer.prototype = Object.create( Editor.Layer.prototype );

	p.constructor = AttributeLayer;


	/**
	* Zbiera informacje o aktualnej czcionce i zwraca odpowiednią.
	*
	* @method DB_remove
	* @param {function} callback Funkcja wykonana zaraz po otrzymaniu odpowiedzi z serwera.
	*/
	p.DB_remove = function( callback ){

		var _this = this;

		$.ajax({

			url : "http://api.digitalprint9.pro/adminProjectOnlyLayers/"+ _this.dbId,

			type : "DELETE",

			crossDomain: true,

			success : function (){

				if( callback )
					callback();

			},

			error : function(){

			}

		});

	};


	/**
	* Zmienia wybrany atrybut w bazie danych.
	*
	* @method DB_setAttribute
	* @param {string} attribute Nazwa atrybutu, który będzie zmieniany w bazie danych
	* @param {string} value nowa wartość dla wybranego atrybutu ( kolumny )
	* @param {function} callback Funkcja wykonana zaraz po otrzymaniu odpowiedzi z serwera.
	*/
	p.DB_setAttribute = function( attribute, value, callback ){

		$.ajax({

			url: 'http://api.digitalprint9.pro/adminProjectOnlyLayers/'+this.dbId,

			type: "POST",

			headers: {

				'x-http-method-override' : "patch"

			},

			crossDomain: true,

			contentType: 'application/json',

			data :"{ \"" +attribute+ "\" : " +value+ "}",

			success : function( data ){

				if( callback )
					callback();

			},

			error : function( data ){

				console.error( data );

			}

		});

	};


	/**
	* Funkcja zwracająca prawdziwą skalę obiektu ( biorąc pod uwagę transformację rodziców )
	*
	* @method getTrueScale
	* @return {Object} Obiekt zawierający informacje o skalowaniu { x: scaleX, y: scaleY }
	*/
	p.getTrueScale = function(){

		var scaleX = this.scaleX;
		var scaleY = this.scaleY;

		var parent = this.parent;

		while( parent ){

			scaleX *= parent.scaleX;
			scaleY *= parent.scaleY;

			parent = parent.parent;
		
			if( !parent.parent )
				parent = parent.parent;

		}

		return {

			x : scaleX,
			y : scaleY

		};

	};


	p.getCompoundsObjectsCount = function(){
		return 0;
	};


	/**
	* Funkcja wykonująca przyblizenie sceny i wykadrowanie na ekranie obiektu	
	*
	* @method getRealScale
	*/
	p.getRealScale = function(){

		var scaleX = 1;
		var scaleY = 1;

		var tmpX = Editor.getStage().scaleX;
		var tmpY = Editor.getStage().scaleY;

		var parent = this;
		while( parent ){
			scaleX *= parent.scaleX;
			scaleY *= parent.scaleY;
			parent = parent.parent;

			if( !parent.parent )
				parent = parent.parent;

		}

		////////////////////////
		// do nowej funkcji skalujacej
		//console.log( this );
		//console.log("prawdziwy rozmiar: ");
		//console.log( this.trueWidth * scaleX );
		//console.log( this.trueHeight * scaleY );

		//console.log( Editor.getCanvas().width() );
		//console.log( Editor.getCanvas().height() );

		var offset = 80;
		var destinationMaxWidth = Editor.getCanvas().width() - offset;
		var destinationMaxHeight = Editor.getCanvas().height() - offset;
		var maxSize = 0;

			maxSize = destinationMaxHeight;

		var maxHeight = destinationMaxHeight;
		var maxWidth  = destinationMaxWidth;

		//console.log( maxSize );

		//console.log( "stage scale: " );
		//console.log( maxSize/(this.trueHeight * scaleX) );

		var windowPosition = {
			x : (( Editor.getCanvas().width() - maxSize )/2),
			y : (( Editor.getCanvas().height() -maxSize )/2)
		};

		//console.log( scaleX );
		//console.log( windowPosition );

		var that = this;

		var test = maxSize/(that.trueHeight * scaleX)/50 + tmpX;
		//console.log( "skala");
		//console.log( Editor.getStage().scaleX );
		//console.log( maxSize/(that.trueHeight * scaleX));

		var posG = this.localToLocal( this.regX, this.regY, Editor.getStage() );

		var vector = {
			x : Editor.getStage().x - posG.x*Editor.getStage().scaleX,
			y : Editor.getStage().y - posG.y
		};

		//console.log( vector );
		//console.log( posG );
		//console.log( Editor.getStage().x);
		posTemp = posG.x/50;

		var stageStart = Editor.getStage().x / Editor.getStage().scaleX;
		//console.log("stageStart");
		//console.log( stageStart );

		var vector = {
			x : Editor.getStage().x - posG.x*Editor.getStage().scaleX,
			y : Editor.getStage().y - posG.y*Editor.getStage().scaleX
		};

		//console.log( Editor.getStage().x/Editor.getStage().scaleX );

		if( this.trueWidth < this.trueHeight ){

			if( test > maxSize/(that.trueHeight * scaleX)){
				//console.log( "oddalanie ");

				var interval = setInterval( function(){

						if( test > maxSize/(that.trueHeight * scaleX) ){
							Editor.getStage().scaleX = test;
							Editor.getStage().scaleY = test;
							Editor.getStage().x = -posG.x * Editor.getStage().scaleX + Editor.getCanvas().width()/2;
							Editor.getStage().y = -posG.y * Editor.getStage().scaleY + Editor.getCanvas().height()/2;

							posTemp += posG.x/50;
							test -= maxSize/(that.trueHeight * scaleX)/25;
						} else {
							clearInterval( interval );
						}
					
				},1000/60);

			}		
			else {
				var interval = setInterval( function(){


						if( test < maxSize/(that.trueHeight * scaleX) ){
							Editor.getStage().scaleX = test;
							Editor.getStage().scaleY = test;
							Editor.getStage().x = -posG.x * Editor.getStage().scaleX + Editor.getCanvas().width()/2;
							Editor.getStage().y = -posG.y * Editor.getStage().scaleY + Editor.getCanvas().height()/2;

							posTemp += posG.x/50;
							test += maxSize/(that.trueHeight * scaleX)/50;
						} else {
							clearInterval( interval );
						}
					
				},1000/60);
			}

		}
		else {

			if( test > maxSize/(that.trueHeight * scaleX)){

				//console.log( "oddalanie ");

				var interval = setInterval( function(){

						if( test > maxSize/(that.trueHeight * scaleX) ){
							Editor.getStage().scaleX = test;
							Editor.getStage().scaleY = test;
							Editor.getStage().x = -posG.x * Editor.getStage().scaleX + Editor.getCanvas().width()/2;
							Editor.getStage().y = -posG.y * Editor.getStage().scaleY + Editor.getCanvas().height()/2;

							posTemp += posG.x/50;
							test -= maxSize/(that.trueHeight * scaleX)/25;
						} else {
							clearInterval( interval );
						}
					
				},1000/60);

			}		
			else {

				var interval = setInterval( function(){


						if( test < maxWidth/(that.trueWidth * scaleX) ){
							Editor.getStage().scaleX = test;
							Editor.getStage().scaleY = test;
							Editor.getStage().x = -posG.x * Editor.getStage().scaleX + Editor.getCanvas().width()/2;
							Editor.getStage().y = -posG.y * Editor.getStage().scaleY + Editor.getCanvas().height()/2;

							posTemp += posG.x/50;
							test += maxWidth/(that.trueWidth * scaleX)/50;
						} else {
							clearInterval( interval );
						}
					
				},1000/60);

			}

		}


		var pos = Editor.stage.getMousePosition( windowPosition.x  , windowPosition.y );
		//console.log( pos );

		//console.log( posG );

		return { sx: scaleX, sy: scaleY };

	};


	/**
	* Dodaje tekst do contenera
	*
	* @method addText
	* @param {Editor.Text} object Obiekt tekstu, który ma zostać dodany
	*/
	p.addText = function( object ){

		var l = Editor.stage.getObjectById( MAIN_LAYER );
		Editor.stage.addObject( object );

		this.objectsOrder.push({ 'type': 't', id : object.id, name: object.name });

		this.objects[object.id] = object;
		this.addChild( object );

	};


	/**
	* Zapisuje w bazie nowo powstały obiekt
	*
	* @method saveToDB
	* @param {Int} project_id Numer projectu, do którego zostanie dopisany obiekt
	* @param {bool} addToHistory Flaga informująca czy zmiana ma zostać dodana do histori projektu
	* @param {callBack} callback Funkcja wykonana po otrzymaniu odpowiedzi z serwera
	*/
	p.saveToDB = function( project_id, addToHistory, callBack ){

		var that = this;
		$.ajax({
			url: 'http://api.digitalprint9.pro/adminProjects/'+project_id+'/adminProjectLayers/',
			crossDomain: true,
			contentType: 'application/json',
			type: "POST",
			data: "{ \"name\" : \""+String( this.name)+"\",\"typeID\" : \"2\"}",

			success: function( data ){

				that.dbId = data.item.ID;
				Editor.updateLayers();

				that.history_tmp = {};
				that.history_tmp.action = 'addLayer';
				that.history_tmp.info = {};
				that.history_tmp.info.name = that.name;
				that.history_tmp.info.id = that.id;
				that.history_tmp.info.dbId = that.dbId;
				that.history_tmp.info.parent = that.parent.id;

				if( addToHistory )
					Editor.addToHistory( that.history_tmp );		

				Editor.stage.saveSort();

				if( callBack )
					callBack();

			},

			error : function(){

				alert('wystapil problem');

			}

		});

	};


	/**
	* Usuwa wszystkie obiekty wraz z warstwami znajdującymi się wewnątrz
	*
	* @method removeAllObjects
	*
	*/
	p.removeAllObjects = function(){

		for( var key in this.objects ){
			delete this.objects[key];
		}
		for( var key in this.layers ){
			this.layers[key].removeAllObjects();
			delete this.layers[key];
		}

	};


	/**
	* Zmienia rodzica warstwy
	*
	* @method moveLayerToOther
	* @deprecated Trzeba ja wyjebać i zmienić na niżej poziomową
	*/
	p.moveLayerToOther = function( layerId, destinationLayer ){

		var layer = Editor.stage.getObjectById( layerId );
		var parentLayer = Editor.stage.getObjectById( layer.body.parent.id );
		var destinationLayer = Editor.stage.getObjectById( destinationLayer );
			
		this.detachLayer( layerId );

	};


	/**
	* Zmienia rodzica warstwy
	*
	* @method checkActivity
	* @deprecated Trzeba ja wyjebać!
	*/
	p.checkActivity = function( selectedOptions ){
		
		var state = true;
		for( var key in this.optionsCombination ){

			if( selectedOptions[key] != parseInt(this.optionsCombination[key].options['0'].id) ){

				state = false;
			}
		}

		return state;

	};


	/**
	* Ustala czy warstwa jest widoczna dla użytkownika ( wykorzystana po stronie administracyjnej )
	*
	* @method visibleForUser
	* @param {bool} bool
	*/
	p.visibleForUser = function( bool ){

		this.body.visible = bool;
		this.forUser = bool;

	};


	/**
	* W tym momencie ( 16.10.14 ) niewiem do czego to jest ;)
	*
	* @method setOptionLayer
	* @param {Int} option_id
	* @param {Int} layer_id
	*/
	p.setOptionLayer = function( option_id, layer_id ){

		this.attribute_layers_connections[option_id] = layer_id;

	};


	/**
	* Dodaje do obiektu warstwę. Będzie usunięta i zamieniona globalnie na "addObject"
	*
	* @method addLayer
	* @param {Object} layer Warstwa która ma zostać dodana
	*/
	p.addLayer = function( layer ){

		Editor.stage.addObject( layer );
		Editor.stage.pushLayer( layer );
		this.layers[layer.id] = layer;
		this.objectsOrder.push({ 'type': 'l', name : layer.name, id: layer.id,  dbID : layer.dbID });
		this.addChild( layer );

	};


	p.addAttributeLayer = function( layer ){

		Editor.stage.pushLayer( layer );
		this.attributes[layer.id] = layer;

		this.objectsOrder.push({ 'type': 'al', name : layer.name, id: layer.id });
		this.addChild( layer );

	};


	/**
	* Usuwa warstwę pokrewną. Będzie usunięta i zamieniona globalnie na "removeObject"
	*
	* @method detachLayer
	* @param {Int} object_id Id usuwanej warstwy
	*/
	p.detachLayer = function( object_id ){

		var childToRemove = Editor.stage.getObjectById( object_id );

		for( var i = 0; i < this.objectsOrder.length; i++ ){

			if( this.objectsOrder[i].id == object_id ){

				this.removeChild( childToRemove );
				delete this.layers[ this.objectsOrder[i].id ];
				this.objectsOrder.splice(i, 1);

			}

		}

	};


	/**
	* Dodaje kombinację cechy i opcji do warstwy
	* TO DO : napisanie lepszej dokumentacji
	*
	* @method addCombinationOption
	* 
	*/
	p.addCombinationOption = function( attr, option, dbId ){
		if( !this.optionsCombination[attr.id] ){

			this.optionsCombination[attr.id] = {
				'dbId' : dbId,
				name: attr.name,
				options : []
			};

			this.optionsCombination[attr.id].options.push( { id : option.id, name : option.name } );

		}
		else {
			this.optionsCombination[attr.id].options.push( { id : option.id, name : option.name } );
		}
	};


	/**
	* Usuwa kombinację cechy i opcji do warstwy
	*
	* @method removeCombinationOption
	* @param {Int} attrID Id atrybutu do usunięcia
	* @param {Int} optionID Id opcji do usunięcia
	*/
	p.removeCombinationOption = function( attrID, optionID ){

		var attrOptions = this.optionsCombination[attrID];

		for( var i=0; i < attrOptions.options.length; i++){

			if( attrOptions.options[i].id == optionID ){

				delete attrOptions.options[i];
				attrOptions.options.length--;
				if( attrOptions.options.length == 0) delete this.optionsCombination[attrID];

			}

		}

	};


	p.checkOptionsCombination = function( attributesWithOptions ){

		for( var key in attributesWithOptions ){
				
		}
	};



	/**
	* Dodaje obiekt do warstwy
	*
	* @method addObject
	* @param {Object} object Obiekt który ma zostać dodany
	* @param {Int} index Niewymagany, określa pozycję dodawanego obiektu
	*/
	p.addObject = function( object,index ){

		Editor.stage.addObject( object );
		this.objects[object.body.id] = object;
		this.objectsOrder.push({ 'type': 'o', id : object.body.id, name: object.name });

		//console.log("miejsce dodania obiektu");
		//console.log( index );

		if( index != undefined ){

			this.body.addChildAt( object.body, index);
		
		}
		else {
		
			this.body.addChild( object.body );
		
		}

		return object.body.id;

	};


	/**
	* Zmienia widoczność obiektu
	*
	* @method toggleVisible
	*/
	p.toggleVisible = function(){

		if( this.body.visible ){

			this.body.visible = false;

		} else {

			this.body.visible = true;

		}

	};


	/**
	* Blokuje|odblokowuje interakcje myszki
	*
	* @method toggleLock
	*/
	p.toggleLock = function(){

		if( this.body.mouseEnabled ){

			this.body.mouseEnabled = false;

		} else {

			this.body.mouseEnabled = true;

		}

	};


	/**
	* Zwraca lokalną tablicę posortowanych obiektów. Nie powinno się używać! Do usunięcia!
	*
	* @method getObjectsOrder
	*/
	p.getObjectsOrder = function(){

		return this.objectsOrder;

	};


	p.sortArray = function( sortedArray ){

		for( var i=0; i < sortedArray.length; i++){
			this.swapObjects( sortedArray[i], this.objectsOrder[i].id  );
		}

	};


	p.swapObjectBetweenLayers = function( object_id, layer_id ){

		var childToMove = Editor.stage.getObjectById( object_id );
		this.removeObject( object_id );
		//this.body.removeChild( childToMove.body );
		var layer = Editor.stage.getLayer( layer_id );

		if( childToMove instanceof Editor.Text ){
			layer.addText( childToMove );
		}
		else {
			layer.addObject( childToMove );
		}
	};



	/**
	* Usuwa obiekt z warstwy.
	*
	* @method removeObject
	* @param {Int} object_id Id obiektu
	*/
	p.removeObject = function( object_id ){

		var childToRemove = Editor.stage.getObjectById( object_id );

		for( var i=0; i < this.objectsOrder.length; i++ ){

			if( this.objectsOrder[i].id == object_id ){

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
	* Zamienia dwa obiekty miejscem.
	*
	* @method swapObjects
	* @param {Int} object1_id Id pierwszego obiektu
	* @param {Int} object2_id Id drugiego obiektu 
	*/
	p.swapObjects = function( object1_id, object2_id ){
		
		//console.log([  this.objectsOrder[0], this.objectsOrder[1] ] );
		// zamienia pozycjami dwa obiekty, zmienia to kolejnosc renderingu
		var object1 = Editor.stage.getObjectById( object1_id);
		var object2 = Editor.stage.getObjectById( object2_id);

		this.body.swapChildren( object1.body, object2.body );

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
	* Zwraca tablicę sortowania.
	*
	* @method getSortArray
	* @return {Array} Posortowana tablica obiektów
	*/
	p.getSortArray = function( ){

		var array = [];

		for( var i =0; i < this.body.getNumChildren(); i++ ){

			array.push( this.body.getChildAt( i ).id );

		}

		return array;
		
	};


	/**
	* Dodaje wszystkie obiekty z warstwy do sceny. Metoda powinna znaleść się w module "stage"
	*
	* @method addAllObjects
	*/
	p.addAllObjects = function(){

		for( var key in this.objects ){

			Editor.stage.addObject( this.objects[ key ] );

		}

		for( var key in this.layers ){

			Editor.stage.addObject( this.objects[ key ] );

		}

	};


	/**
	* Usuwa ze sceny wszystkie obiekty z warstwy. Powinna zlaleść się w module "stage"
	*
	* @method removeObjects
	*/
	p.removeObjects = function(){

		for( var key in this.objects ){

			Editor.stage.removeObject( key );

		}

		for( var key in this.layers ){

			this.layers[key].removeObjects();

			Editor.stage.removeObject( key );

		}

	};	



	/**
	* Zwraca HTML'ową reprezentację obiektu
	*
	* @method HTMLoutput
	* @return {String} HTML'owa reprezentacja obiektu
	*/
	p.HTMLoutput = function(){

		var HTML = "";

		HTML += "<li class='attributes-options' data-id='"+ this.id +"'>";
		HTML += " <span class='li-button attributes-layer' data-base-id='"+this.dbId+"' data-id='" + this.id + "'>";
		HTML += "<span class='visibility"+(( this.visible)? " active" : " un-active" )+"' data-id='"+this.id+"' data-base-id='" + this.dbId + "'></span>";
		HTML += "<span class='group-attr'></span><span class='object-name'>" + this.name + " " + this.id + " </span>";
		HTML += "<span data-base-id='" + this.dbId + "' class='locker"+((this.mouseEnabled)? " active" : " un-active" )+"'></span><span class='remover' data-id="+this.id+">x</span>";
		HTML += "<span class='attrCombinations'></span>";
		HTML += "<span class='attrList-attrLayer'>";
		HTML += "<ul>";

		for( var key in this.optionsCombination ){

			HTML += "<li>" + this.optionsCombination[key].name + ":";
			HTML += "<ul>";
			for( var li=0; li < this.optionsCombination[key].options.length; li++){
				HTML += "<li>";
				HTML += this.optionsCombination[key].options[li].name;
				HTML += "<span data-base-id='"+this.optionsCombination[key].dbId+"' data-attr-id='"+key+"' data-opt-id='"+this.optionsCombination[key].options[li].id+"' data-layer-id='"+this.id+"' class='option-remover'>-</span>";
				HTML += "</li>";
			}
			HTML += "</ul>";
			HTML += "</li>";

		}

		HTML += "</ul></span></span>";

		HTML += '<ul class="sortArea '+(( this.getNumChildren() == 0) ? "empty": "" )+'">';

		var num =  this.getNumChildren();

		for( var i=num-1; i >= 0; i-- ){

			var object = this.getChildAt(i);	
			object = Editor.stage.getObjectById( object.id );

			if( object ){

				HTML += object.HTMLoutput();
			
			}

		}

		HTML += "</ul>";
		HTML += "</li>";

		return HTML;

	};

	Editor.AttributeLayer = AttributeLayer;

})();