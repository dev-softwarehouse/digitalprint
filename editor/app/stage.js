import {safeImage} from "./utils";

var EditableArea = require('./class/editablePlane').EditableArea;
var Cover = require('./class/CoverObject.js').default;
import { Layer } from './class/Layer';
import {EditorLayer} from './class/EditorLayer';
import {Bitmap} from './class/EditorBitmap';

export class Stage {


	constructor ( Editor ){

		this.firstAAA = true;
		this._stage = Editor.getStage();
		this.stage = Editor.getStage();
		this.editor = Editor;
		this.tools = Editor.tools;
		this.updateTools = false;
		this.pages = [];
		this.editGroups = [];
		this.mainLayer;
		this.layers = {};
		this.attributesLayers = {};
		this.layersOrder = []; // kolejnosc rysowania warstw
		this.dragOverObjects = [];
		this.overObjects = [];
	    this.width = 5000;
	    this.height = 5000;

	    this.netHelper = null;
	    this.rulersLayer = null;
	    this.rulerTopLayer = null;
	    this.rulerRightLayer = null;
	    this.scaleDigits = null;
	    this.toolsLayer = null;
	    this.IRulersLayer = null;
	    this.objectToMove = null;
	    this.backgroundClicker = null;
	    this.settings = {
	    	netHelperDistance : 50,
	    	netResolution : 5000
	    };
	    this.cursorsObjects = {};
	    this.objectsDB = {};
		this.objects = {};
		this.photos = {}; // zdjecia oczekujace na dodanie do sceny
		this.editableAreas = {};
		this.selectedObjects = [];
		this.width;
		this.height;
		this.startWidth;
		this.startHeight;
		this.rulerContainer = new createjs.Container();
		this.rulerXbg = new createjs.Shape();
		this.rulerYbg = new createjs.Shape();
		this.rulerCorner = new createjs.Shape();
		this.mouseCursorX = new createjs.Shape();
		this.mouseCursorY = new createjs.Shape();

		this.mouseCursorX.graphics.f("red").mt(0,0).lt(6,6).lt(12,0).ef();
		this.mouseCursorX.regX = 6;

		this.mouseCursorY.graphics.f("red").mt(0,0).lt(6,6).lt(0,12).ef();
		this.mouseCursorY.regY = 6;

		this.rulerX = new createjs.Container();
		this.rulerY = new createjs.Container();

		this.rulerContainer.addChild( this.rulerXbg, this.rulerYbg, this.rulerX, this.rulerY, this.rulerCorner, this.mouseCursorX, this.mouseCursorY);

		this.layer = new createjs.Container();
		this.layer.x = this.layer.y = 0;

		this.mouseOffset = false;
		this.sceneContainer = new createjs.Container();
		this.mask = new createjs.Shape();

		this.moveVector;
		this.mouseDown;

		this.mouseButton;

	}

	getInfo(){

		return [ this.sceneContainer, this.layers, this.pages, this.layersOrder, this.objects, this.editableAreas ];

	}

	cameraToCenter(){

        var canvasWidth = this.editor.getCanvas().width();
        var canvasHeight = this.editor.getCanvas().height();

        var bounds = this.editor.stage.getMainLayer().getTransformedBounds();

        this.editor.getStage().x = canvasWidth/2 - (bounds.x+(bounds.width/2))*  this.editor.getStage().scaleX; // + (canvasWidth/2)/stageScale;
        this.editor.getStage().y = canvasHeight/2 - (bounds.y+(bounds.height/2))*  this.editor.getStage().scaleX;//

    }

    centerCameraX(){

        var stageScale = this.editor.getStage().scaleX;
        var canvasWidth = this.editor.getCanvas().width();
        var bounds = this.editor.stage.getMainLayer().getTransformedBounds();
        this.editor.getStage().x = ( canvasWidth/2 - (bounds.x+(bounds.width/2))*stageScale ) + 100  ;

    }


    centerCameraY(){

        var stageScale =  this.editor.getStage().scaleX;
        var canvasHeight = this.editor.getCanvas().height();
        var bounds = this.editor.stage.getMainLayer().getTransformedBounds();
        this.editor.getStage().y = ( canvasHeight/2 - (bounds.y+(bounds.height/2))*stageScale ) + 9 ;


    }

    centerCameraToEditableAreaX(){

        var stageScale = this.stage.scaleX;
        var canvasWidth = this.editor.getCanvas().width();
        var bounds = this.editor.stage.getPages()[0].getTransformedBounds();
        this.editor.getStage().x = ( canvasWidth/2 - (bounds.x+(bounds.width/2))*stageScale ) + 100  ;

    }


    centerCameraToEditableAreaY(){


        var stageScale = this.editor.getStage().scaleX;
        var canvasHeight = this.editor.getCanvas().height();
        var bounds = this.editor.stage.getPages()[0].getTransformedBounds();
        this.y = ( canvasHeight/2 - (bounds.y+(bounds.height/2))*stageScale ) + 9 ;

    }


    objectsBoundsIsBigerThenVisibleArea(){

        // tu bedzie info o tym czy obraz jest poza boundsami

    }


    cameraCoords( width, height, x, y ){

        var canvasWidth = this.editor.getCanvas().width();
        var canvasHeight = this.editor.getCanvas().height();

        width = width + 30;
        height = height + 30;

        var stageScale = ( canvasWidth/(width+30) < canvasHeight/(height+30)  ) ? canvasWidth/(width+30) : canvasHeight/(height+30);

        this.editor.getStage().scaleX = stageScale;
        this.editor.getStage().scaleY = stageScale;


        var centerPointX = x+width/2;
        var centerPointY = x+height/2;

        this.editor.getStage().x = canvasWidth/2 - (x+(width/2))*stageScale;// + (canvasWidth/2)/stageScale;
        this.editor.getStage().y = canvasHeight/2 - (y+(height/2))*stageScale;//


        //Editor.getStage().y = (y-(height/2))
        //console.log()Editor.getStage().y = (y+(height/2));
    }


	cameraToObject( obj ){

		var scaleX = 1;
		var scaleY = 1;

		var tmpX = this.editor.getStage().scaleX;
		var tmpY = this.editor.getStage().scaleY;

		var parent = obj;

		while( parent ){
			scaleX *= parent.scaleX;
			scaleY *= parent.scaleY;
			parent = parent.parent;


			if( !parent.parent ) parent = parent.parent;


		}

		var offset = 80;
		var destinationMaxWidth = this.editor.getCanvas().width() - offset;
		var destinationMaxHeight = this.editor.getCanvas().height() - offset;
		var maxSize = 0;

		maxSize = destinationMaxHeight;

		var windowPosition = {
			x : (( this.editor.getCanvas().width() - maxSize )/2),
			y : (( this.editor.getCanvas().height() -maxSize )/2)
		};

		var that = this;

		var test = maxSize/(obj.trueHeight * scaleX)/50 + tmpX;

		var posG = obj.localToLocal( obj.regX, obj.regY, this.editor.getStage() );

		var vector = {
			x : this.editor.getStage().x - posG.x*this.editor.getStage().scaleX,
			y : this.editor.getStage().y - posG.y
		};

		posTemp = posG.x/50;


		var stageStart = this.editor.getStage().x / this.editor.getStage().scaleX;


		var vector = {
			x : this.editor.getStage().x - posG.x*this.editor.getStage().scaleX,
			y : this.editor.getStage().y - posG.y*this.editor.getStage().scaleX
		};

		this.editor.getStage().x = -posG.x * this.editor.getStage().scaleX + this.editor.getCanvas().width()/2;
		this.editor.getStage().y = -posG.y * this.editor.getStage().scaleY + this.editor.getCanvas().height()/2;



		var pos = this.editor.stage.getMousePosition( windowPosition.x  , windowPosition.y );


		// az do tad
		////////////////////////
	}

    /**
	* Resetuje scenÄ, doszczÄtnie usĂłwajÄc z niej wszystko
	*
	* @method resetScene
	*/
	resetScene(){

        this.editor.tools.setEditingObject( null );
        this.editor.tools.init();

        this.editor.stage.getMainLayer().removeAllChildren();

	}


	detachLayer( layer_id ){

		var childToRemove = this.editor.stage.getObjectById( layer_id );

		var parent = this.editor.stage.getObjectById( childToRemove.parent.id );


		for( var i = 0; i < parent.objectsOrder.length; i++ ){
			if( parent.objectsOrder[i].id == layer_id ){
				parent.removeChild( childToRemove.body );
				delete parent.layers[ parent.objectsOrder[i].id ];
				parent.objectsOrder.splice(i, 1);
			}
		}

		delete objects[ layer_id ];
		delete layers[ layer_id ];

	}


	moveLayerTo( movingLayer_id, destination_id ){

		var layer = this.editor.stage.getObjectById( movingLayer_id );
		var parentLayer = this.editor.stage.getObjectById( layer.parent.id );
		var destinationLayer = this.editor.stage.getObjectById( destination_id );

		//parentLayer.detachLayer( movingLayer_id );
		detachLayer( movingLayer_id );
		destinationLayer.addLayer( layer );
		this.editor.updateLayers();

	};


	moveAttributesLayerTo( movingLayer_id, destination_id ){

		var layer = this.editor.stage.getObjectById( movingLayer_id );
		var parentLayer = this.editor.stage.getObjectById( layer.parent.id );
		var destinationLayer = this.editor.stage.getObjectById( destination_id );

		detachLayer( movingLayer_id );
		destinationLayer.addAttributeLayer( layer );
		this.editor.updateLayers();

	}


	getAttributeLayers(){

		return attributesLayers;

	}


	selectObject( id ){

		selectedObjects.push( id);

	}


	getObjectsList(){

		var list = new Array();

		document.getElementById('lista').innerHTML = "<ul id='listaUL' class='ui-sortable'>";

		var editingObject = this.editor.tools.getEditObject();

		for( var object in objects ){

			document.getElementById('listaUL').innerHTML += "<li class='ui-state-default item "+ ((editingObject == object) ? 'active' : '' )+"' id='"+object+"'><span class='img_thumb'></span><span class='img_name'>"+objects[object].body.name+"</span><span class='remove'>x</span></li>";
			var test = document.getElementById(object);
			var test2 = test.getElementsByClassName('img_thumb')[0];
			test2.style.backgroundImage = "url('"+objects[object].body.image.src+"')";
			test2.style.backgroundSize = "50px";

		}

		document.getElementById('lista').innerHTML += "</ul>";

		$( "#listaUL" ).sortable({
			revert: true
		});

		$('span.remove').on('click', function(){
			this.editor.stage.removeObject($(this).parent().attr('id'));
		});

		$( "ul, li" ).disableSelection();

		$("#listaUL .item").on('mousedown', function(){
			this.editor.tools.setEditingObject($(this).attr('id'));
			//Editor.getStage().update();
			getObjectsList();
		});

	}

    /**
	* Zwraca informacjÄ o rozmiarach widocznego obszaru
	*
	* @method getVisibleAreaSize
    * @returb {Object}
	*/
    getVisibleAreaSize(){

        var canvasWidth = this.editor.getCanvas().width();
        var canvasHeight = this.editor.getCanvas().height();

        var realWidth = canvasWidth/this.editor.getStage().scaleX;
        var realHeight = canvasHeight/this.editor.getStage().scaleY;

        return { width: realWidth, height : realHeight };

    }


	getEditGroup( editGroupName ){

		return objects[ editGroupName ];

	}

    /**
	* Ustala warstwÄ jako gĹĂłwnÄ warstwÄ
	*
	* @method setMainLayer
    * @param {String} layer_id
	*/
	setMainLayer( layer ){

        var background = new createjs.Shape();
        background.hitArea = new createjs.Shape();
		background.hitArea.graphics.c().f('rgba(12,93,89,0.5)').r( -5000, -5000, 10000, 10000 );

		background.addEventListener('click', function( e ){

			this.editor.stage.updateEditingTools( null );
			e.stopPropagation();
			this.editor.tools.setEditingObject( null );
			this.editor.tools.init();

		}.bind( this ));

		this.backgroundClicker = background;

		this.editor.getStage().addChild( background );

		this.editor.stage.addObject( layer );
		this.editor.stage.pushLayer( layer );

		this.layers[layer.id] = layer;
		//objects[layer.body.id] = layer;
		this.mainLayer = layer;

		//objectsOrder.push({ 'type': 'l', name : layer.name, id: layer.body.id });

		this.editor.getStage().addChild( layer );

	}

    /**
	* Ustala warstwÄ jak warstwa lini pomocniczych
	*
	* @method setNetHelper
    * @param {String} layer_id
	*/
    setNetHelper( layer ){

		this.editor.stage.addObject( layer );
		this.editor.stage.pushLayer( layer );

		this.layers[layer.id] = layer;

		this.netHelper = layer;

		this.editor.getStage().addChild( layer );

    }


	decomposeMainLayer(){

		var layerInfo = [];
		var mainLayer = this.mainLayer;

		for( var i=0; i < mainLayer.objectsOrder.length; i++ ){

			if( mainLayer.objectsOrder[i].type == 'l' ) {
				//layerInfo.push( { id: mainLayer.objectsOrder[i].id, objects: decomposeLayer( mainLayer.objectsOrder[i].name), type: 'l'} ) ;
				layerInfo.push( { type: 'l', id: mainLayer.objectsOrder[i].id, name: mainLayer.objectsOrder[i].name, objects: decomposeLayer( mainLayer.objectsOrder[i].id)} ) ;
			}
			else if( mainLayer.objectsOrder[i].type == 'o' ){
				layerInfo.push({ type: 'o', id: mainLayer.objectsOrder[i].id, name: mainLayer.objectsOrder[i].name } );
			}
			else if( mainLayer.objectsOrder[i].type == 'al'){

				layerInfo.push( { type: 'al', id: mainLayer.objectsOrder[i].id, name: mainLayer.objectsOrder[i].name, objects: decomposeLayer( mainLayer.objectsOrder[i].id)});

			}
			else if( mainLayer.objectsOrder[i].type == 't'){
				layerInfo.push( { type: 't', id: mainLayer.objectsOrder[i].id, name: mainLayer.objectsOrder[i].name } );
			}

		}
		layerInfo.reverse();

		return layerInfo;


	}


	decomposeLayer( layer ){

		var layer = getObjectById( layer );// || getEditGroup( layer );
		var layerInfo = [];

		for( var i=0; i < layer.objectsOrder.length; i++  ){

			if( layer.objectsOrder[i].type == 'l' ) {
				layerInfo.push( { type: 'l', id: layer.objectsOrder[i].id, name: layer.objectsOrder[i].name, objects: decomposeLayer( layer.objectsOrder[i].id)} ) ;
//				layerInfo.push( decomposeLayer( layer.objectsOrder[i].id) );
			}
			else if( layer.objectsOrder[i].type == 'o' ){
				layerInfo.push({ type: 'o', id: layer.objectsOrder[i].id, name: layer.objectsOrder[i].name} );
			}
			else if( layer.objectsOrder[i].type == 'al'){
				layerInfo.push( { type: 'al', id: layer.objectsOrder[i].id, name: layer.objectsOrder[i].name, objects: decomposeLayer( layer.objectsOrder[i].id)});

			}
			else if( layer.objectsOrder[i].type == 'p'){
				layerInfo.push( { type: 'p', id: layer.objectsOrder[i].id, name: layer.objectsOrder[i].name, objects: decomposeLayer( layer.objectsOrder[i].id) } );
			}
			else if( layer.objectsOrder[i].type == 't'){
				layerInfo.push( { type: 't', id: layer.objectsOrder[i].id, name: layer.objectsOrder[i].name } );
			}

		}

		layerInfo.reverse();
		return layerInfo;

	}


	generateLayersHTML( layerInfo ){

		var html2 = "<ul class='sortArea'>";
		html2 += this.editor.stage.getObjectById( this.MAIN_LAYER ).HTMLoutput();
		html2 += "</ul>";

		return html2;

	}


	drawLayer( layerName ){

		var layer = getLayer( layerName );
		//console.log( "rysowanie warstwy" );
		for( var i =0; i < layer.objectsOrder.length; i++ ){

			var toDraw = layer.objectsOrder[i];
			//console.log( toDraw.id );
			var obj = getObjectById( toDraw.id );

			var o = this.editor.getStage().canvas.getContext("2d");
			obj.draw( o, true );

		}

	}


	getObjectsFromLayer( layerName ){

		var layer = this.getLayer( layerName );
		var objects = [];

		for( var key in layer.objects ){

			objects.push( layer.objects[key] );//updateCom

		}

		return objects;

	}


	getObjectOrder( object_id ){

		var object = this.editor.stage.getObjectById( object_id );

		var parentLayer = this.editor.stage.getObjectById( object.parent.id );

		i = parentLayer.getChildIndex( object );

		if( parentLayer instanceof EditableArea )
			i--;

		return i;

	}


	getLayerOrder( layerId ){

		var layer = this.editor.stage.getObjectById( layerId );
		var parentLayer = this.editor.stage.getObjectById( layer.parent.id );

		for( var i=0; i < parentLayer.objectsOrder.length; i++ ){

			if( parentLayer.objectsOrder[i].id == layerId )
				return i;

		}

	}


    /**
	* Zwraca ordera warstwy
	*
	* @method getLayerObjectsOrder
    * @param {String} layer_id
	*/
	getLayerObjectsOrder( layer_id ){

		var layer = this.editor.stage.getObjectById( layer_id );
		var layerCompoundsObjects = layer.getCompoundsObjectsCount();
		var bottomCompounds = layer.getCompoundsBottomObjectsCount();
		var topCompounds = layer.getCompoundsTopObjectsCount();

		var array = {

			'layers' : {},
			'objects' : {}

		};

		for( var i=bottomCompounds; i<layer.children.length- topCompounds ; i++ ){

			var child = layer.children[i];

			if( child instanceof AttributeLayer || child instanceof EditableArea ){

				// wiemy Ĺźe jest to warstwa
				array['layers'][child.dbId] = {

					order   : i - bottomCompounds,
					layerID : (function(){

							if( child.id  != MAIN_LAYER ){

								var parent = child.parent;

								if( parent.id == MAIN_LAYER ){
									return 0;
								}
								else {
									return parent.dbId;
								}
							}

					;})()

				};

				$.extend( true, array, getLayerObjectsOrder( child.id ) );

			}
			else {

				// wiemy Ĺźe jest to obiekt
				array['objects'][child.dbId] = {

					order : i - bottomCompounds,

					layerID : (function(){

						if( child.id  != MAIN_LAYER ){

							var parent = child.parent;

							if( parent.id == MAIN_LAYER ){

								return 0;

							}
							else {

								return parent.dbId;

							}

						}

					;})()

				};

			}

		}

		return array;

	}


    /**
	* Pobiera chierarchiÄ warstw
	*
	* @method getLayersOrderAndParent
	*/
	getLayersOrderAndParent(){

		return getLayerObjectsOrder( MAIN_LAYER );

	}


    /**
	* Dodaje warstwe do kontenera sceny ( nie do sceny! )
	*
	* @method pushALayer
    * @param {EditorLayer} layer
	*/
	pushLayer( layer ){

		this.layers[layer.id] = layer;

		if( layer instanceof EditableArea ){

			this.editableAreas[layer.id] = layer;

		}

	}


    /**
	* Dodaje warstwe do sceny
	*
	* @method pushAttributesLayer
    * @deprecated
	*/
	pushAttributesLayer( aLayer ){

		this.attributesLayers[ aLayer.id ] = aLayer;

	}

    /**
	* Dodaje warstwe do sceny
	*
	* @method addLayer
    * @deprecated
	*/
	addLayer( layer, dataBaseId ){

		mainLayer.addLayer( layer, dataBaseId );

        // Editor.getStage().addchild(   );
		layers[layer.id] = layer;
		layersOrder.push( layer.name );

		var _objects = getObjectsFromLayer( layer.id );

		for( var i=0; i < _objects.length; i++  ){
			addObject( _objects[i] );
		}

		mainLayer.addChild( layer );

	}


    /**
	* Dodaje warstwe atrybutĂłw
	*
	* @method addAttributeLayer
    * @deprecated
	*/
	addAttributeLayer( layer ){

		addObject( layer );
		attributesLayers[layer.id] = layer;

	}


    /**
	* ObsĹuguje event zmiany rozmiaru okna
	*
	* @method onResize
	*/
    onResize(){
        // browser viewport size
        var w = window.innerWidth;
        var h = window.innerHeight;

    }


    /**
	* Tworyz obiekt
	*
	* @method get_random_color
    * @deprecated
    * @return {String} Randomowy kolor
	*/
    createObject( objectInfo ){

        if( objectInfo.content.type == 'EditorBitmap' ){


            var object = new Bitmap( objectInfo.content.name, objectInfo.content.minImg, ((userType == 'admin')? true : false )  );
            object.editor = this.editor;
            var content = objectInfo.content;

           object.updateWithContentFromDB( objectInfo.content );
           object.setTransform( parseFloat( content.x ), parseFloat( content.y ), parseFloat( content.scaleX ), parseFloat( content.scaleY ), parseFloat( content.rotation ), parseFloat( content.skewX ),parseFloat( content.skewY ), parseFloat( content.regX ), parseFloat( content.regY ) );
           object.dbID = objectInfo.id;

        }
        else if( objectInfo.content.type == "EditableArea" ){

            var object = new EditableArea( this.editor, objectInfo.content.name, objectInfo.content.width, objectInfo.content.height, objectInfo.id, objectInfo.content.slope );
            object.editor = this.editor;
            object.updateWithContentFromDB( objectInfo );
            object.dbID = objectInfo.id;
            object.init();

        }
        else if( objectInfo.content.type == 'Text2' ){

            var object = new Text2( 'jaja', 50, objectInfo.content.width, objectInfo.content.height, false,  ((userType == 'admin')? true : false ) );
            object.editor = this.editor;
            object.dbID = objectInfo.id;
            object.updateWithContentFromDB( objectInfo );

            //object.initEvents();
            object.init( 50, false );
            object.generateCursorMap();

        }

        return object;

    }


    /**
	* Dodaje do sceny nowy krsor uzytkownika ( np.gdy sie poĹÄczyĹ)
	*
	* @method get_random_color
    * @return {String} Randomowy kolor
	*/
    get_random_color() {

      function c() {

        return Math.floor(Math.random()*256).toString(16);

      }

      return "#"+c()+c()+c();

    }


    /**
	* Dodaje do sceny nowy krsor uzytkownika ( np.gdy sie poĹÄczyĹ)
	*
	* @method addCursor
    * @param {String} cursorId Id kursora innego uzytkownika
	*/
    addCursor( cursorId ){

        var object = new createjs.Shape();
        object.graphics.f( get_random_color() ).drawCircle(0,0,30);

        cursorsObjects[cursorId] = object;

        this.editor.getStage().addChild( object );

    }


    /**
	* Pobiera obiekt kursora innego uzytkownika
	*
	* @method getCursorById
    * @return {String} cursorId Id kursora innego uzytkownika
	*/
    getCursorById( cursorId ){

        if( cursorsObjects[ cursorId ] ){

            return cursorsObjects[ cursorId ];

        }
        else {

            return null;

        }

    }


    /**
	* Ustawia warstwÄ jako warstwÄ dla narzÄdzi
	*
	* @method setToolsLayer
    * @param {EditorLayer} layer warstwa narzÄdzi
	*/
    setToolsLayer( layer ){

        this.toolsLayer = layer;
        this.editor.getStage().addChild( layer );

    }


    /**
	* Ustawia warstwÄ jako warstwÄ dla linijek pomocnczych
	*
	* @method setRulersLayer
    * @param {EditorLayer} layer warstwa linijek
	*/
    setIRulersLayer( layer ){

        this.IRulersLayer = layer;

        this.editor.getStage().addChild( layer );

    }


    getClosestRulerHelper( x, y ){

        //return ruler;

    }


    /**
	* Zwraca warstwÄ na ktĂłrej sÄ wyĹwietlane narzÄdzia ( jest to najbardziej gĂłrna warstawa sceny, zawsze na przodzie)
	*
	* @method getToolsLayer
    * @return {EditorLayer} warstwa narzÄdzi
	*/
    getToolsLayer(){

        return this.toolsLayer;

    }


    /**
	* Zwraca warstwÄ na ktĂłrej sÄ wyĹwietlane narzÄdzia ( jest to najbardziej gĂłrna warstawa sceny, zawsze na przodzie)
	*
	* @method getIRulersLayer
    * @return {EditorLayer} warstwa narzÄdzi
	*/
    getIRulersLayer(){

        return this.IRulersLayer;

    }



    getRulersLayer(){

    	return this.rulersLayer;

    }


    /**
	* Tworzy Ĺrodkowe linie
	*
	* @method initCenterNetHelper
	*/
    initCenterNetHelper( ){

   		var startLineVert = new createjs.Shape();
        var startLineHor = new createjs.Shape();
        var currentScale = this.editor.getStage().scaleX;

        startLineVert.graphics.ss(2/currentScale).s("#d4d4d4").mt( -this.settings.netResolution/2, 0 ).lt( this.settings.netResolution/2, 0 );
        startLineHor.graphics.ss(2/currentScale).s("#d4d4d4").mt( 0, -this.settings.netResolution/2 ).lt( 0, this.settings.netResolution/2 );

        this.netHelper.addChild( startLineVert );
        this.netHelper.addChild( startLineHor );

    }


    /**
	* Wykonuje update/refresh dla siatki pomocniczej ( w tle )
	*
	* @method updateNetHelper
	*/
	updateNetHelper(){

		if( userType == 'user' || userType == 'advancedUser')
			return;

		var tile = new createjs.Shape();
		var netHelperPos =  0;
		var currentScale = this.editor.getStage().scaleX;


		this.netHelper.removeAllChildren();


		if ( currentScale < 0.8 ){
			this.editor.TileMaker.setTileSize(100,1/this.editor.getStage().scaleX,currentScale);
		}else if (  currentScale > 0.8 && currentScale <= 1.3 ){
			this.editor.TileMaker.setTileSize(50,1/this.editor.getStage().scaleX,currentScale);
		}else if ( currentScale > 1.3 && currentScale <= 1.8 ){
			this.editor.TileMaker.setTileSize(40,1/this.editor.getStage().scaleX,currentScale);
		}else if ( currentScale > 1.8 && currentScale <= 2.3 ){
			this.editor.TileMaker.setTileSize(30,1/this.editor.getStage().scaleX,currentScale);
		}else if ( currentScale > 2.3 && currentScale <= 2.8 ){
			this.editor.TileMaker.setTileSize(20,1/this.editor.getStage().scaleX,currentScale);
		}else if ( currentScale > 2.8 ){
			this.editor.TileMaker.setTileSize(10,1/this.editor.getStage().scaleX,currentScale);
		}


		this.editor.TileMaker.generateTile();

		var patternImage = safeImage();
		patternImage.src = this.editor.TileMaker.getTileImage();

    	var patternMatrix = new createjs.Matrix2D();
    	patternMatrix.scale( 1/currentScale, 1/currentScale);

        var tile = new createjs.Shape();

        patternImage.onload = function(){

			tile.graphics.beginBitmapFill( patternImage , 'repeat', patternMatrix ).r( -2500, -2500, 5000, 5000 );

		}

        this.netHelper.addChild( tile );
        this.initCenterNetHelper();

	}


    /**
	* Tworzy siatkÄ pomocniczÄ ( w tle)
	*
	* @method initNetHelper
	*/
    initNetHelper(){

    	if( userType == 'user' )
    		return;

    	this.editor.TileMaker.init();
    	this.editor.TileMaker.generateTile();

    	var patternImage = safeImage();

        var patternMatrix = new createjs.Matrix2D();
        var tile = new createjs.Shape();


    	patternImage.src = this.editor.TileMaker.getTileImage();


        patternImage.onload = function(){

        	tile.graphics.beginBitmapFill( patternImage , 'repeat', patternMatrix ).r( -2500, -2500, 5000, 5000 );

        }

        this.netHelper.addChild( tile );

        this.initCenterNetHelper();

    }

    /**
	* Funkcja odpowiadajÄca za dodanie obrazka do sceny
	*
	* @method loadImage
    * @param {ProjectImage} image Obiekt project image reprezentujÄcy obraz
    * @param {Bool} used, informacja czy obraz jest juz uĹźyty
    * @param {Float} x Pozycja x
    * @param {Float} y Pozycja y
	*/
    loadImage( image, used, x, y ){

        var _this = this;

        var newBitmap = new Bitmap('test', image.miniature );
        newBitmap.initEvents();
        newBitmap.img = image.imageUrl;
        newBitmap.minImg = image.miniature;
        newBitmap.collectionReference = image;
        image.addImageReferenceInScene( newBitmap );

        newBitmap.width = newBitmap.trueWidth = image.width;
        newBitmap.height = newBitmap.trueHeight = image.height;
        newBitmap.regX = newBitmap.width/2;
        newBitmap.regY = newBitmap.height/2;
        Editor.adminProject.view.layer.addChild( newBitmap );

        //_this.background.visible = false;

        Editor.stage.addObject( newBitmap );

        newBitmap.setCenterReg();
        newBitmap.center();

    }




    // prawdopodobnie do wywalenia
	getSceneContainer(){
		return this.sceneContainer;
	}


    /*
	* Zwraca wartoĹci pozycji (bierze pod uwagÄ siatkÄ przyciÄgania)
	*
	* @method getPulledPosition
    * @param {Float} s Nowa skala
	*/
	getScale(){

		return ( this.sceneContainer.scaleX, this.sceneContainer.scaleY);

	};


    /*
	* Zwraca wartoĹci pozycji (bierze pod uwagÄ siatkÄ przyciÄgania)
	*
	* @method getPulledPosition
    * @param {Float} s Nowa skala
	*/
    getPulledPosition( x, y ){

        var width = 25;
        var iteration = 1;

        var _x = x;// + width/2;
        var _y = y;
        var min = 0;
        var max = width;

        //console.log( _x%50 );

        /*
        if( _x%50 <= 15 ){

            _x = ( _x - _x%50 );

        }
        else if( _x%50 >= 35){

            _x = _x + ( 50 - _x%50 );

        }


        if( _y%50 <= 15 ){

            _y = ( _y - _y%50 );

        }
        else if( _y%50 >= 35){

            _y = ( _y + ( 50 - _y%50 ) );

        }
        */

        return [ _x, _y ];

    }


    /*
	* Zmienia skalÄ sceny
	*
	* @method setScale
    * @param {Float} s Nowa skala
	*/
	setScale( s ){
		//layer.regX += 10;
		sceneContainer.scaleX = sceneContainer.scaleY = s;

		mask.scaleX = sceneContainer.scaleX;
		mask.scaleY = sceneContainer.scaleY;

		width = startWidth * s;
		height = startHeight * s;

		redrawRulers();

	}


    /*
	* Dodaje obiekt do lokalnego kontenera ( nie na scene !) przyĹpiesza to wyszukiwanie, obiekt jest przekazany do dwĂłch
    * KontenerĂłw: objects, oraz objectsDB ( powstanie 3 ktĂłry bÄdzie interpretowaĹ po uid ) objects trzyma informacje w sĹowniku , gdzie sĹowem
    * kluczowym jest lokalne id (przydzielone ze sceny), w objectsDB kluczem jest id z bazy danych danego obiektu
	*
	* @method addObject
	*/
	addObject( object ){

		if( object instanceof createjs.Stage ){

			this.objects[object.id] = object;

		}
		else {

			this.objects[object.id] = object;
            this.objectsDB[object.dbID] = object;
            object.context = this.editor;
            object.editor = this.editor;

		}

	}


    /*
	* Inicjuje na wszystkich stronach widoku warstwÄ pozwalajÄcÄ na upuszczanie obiektĂłw
	*
	* @method stopPageDroping
	*/
    preparePagesToDrop(){

        for( var i=0; i < this.pages.length; i++ ){

            this.pages[i].prepareToDrop();

        }

    }

    setPages( _pages ){

    	this.pages = _pages;

    }

    /*
	* Usuwa ze wszystkich stron warstwÄ dropienia zdjÄÄ
	*
	* @method stopPageDroping
	*/
    stopPageDroping(){

        for( var i=0; i < this.pages.length; i++ ){

            this.pages[i].destroyDropHelper();

        }

    }


    /*
	* PrzeĹadowywuje wszystkie zdjÄcia
	*
	* @method reloadPhotos
    * @deprecated
	*/
	reloadPhotos(){

        // to jest do wywalenia
        document.getElementById('imagesList').innerHTML = '';

		for( var photo in photos){

			if( $("#imagesList #photo_"+photo+"").length == 0 ){
				$("#imagesList").append("<li class='photo-item " + ( (photos[photo].width > photos[photo].height) ? 'height' : 'width' ) + " " +((photos[photo].used)?( 'used' ):( '' ))+"' id='photo_"+photos[photo].id+"' data-id='"+photos[photo].id+"' style='background: url("+photos[photo].image.src+") no-repeat; width: " + Editor.template.userImagesSize + "px; height: " + Editor.template.userImagesSize + "px;'>"+((photos[photo].isUploaded()) ? ('<span class="uploaded"></span>') : ('<span class="uploading"></span>') )+"</li>");
			}
		}

		$('.photo-item').draggable({
            cursorAt: {left: -10, top: -10},
			start : function(){

                preparePagesToDrop();

            },
			drag: function( event, ui ){

				var areas = getEditableAreas();
				for( key in areas ){

					var local = areas[key].globalToLocal(event.clientX, event.clientY-80);
					var bounds = areas[key].getBounds();

				}

			},
			stop : function( event, ui ){

                var overObjects = [];
                _stage._getObjectsUnderPoint( event.clientX, event.clientY-75, overObjects );

                if( overObjects[0] ){

                    event.bitmapObject = event.target;
                    overObjects[0].dispatchEvent( event );

                }

                stopPageDroping();

				var areas = getEditableAreas();



				for( key in areas ){

					var local = areas[key].globalToLocal( event.clientX, event.clientY-80);
					var bounds = areas[key].getBounds();


					if( local.x <= bounds.width && local.x >= 0 && local.y <= bounds.height && local.y >= 0){

						areas[key].addObject( photos[ $(this).attr('data-id')], 1 );
						var obj = _stage.getObjectById( $(this).attr('data-id') );

						Editor.uploader.addItemToUpload( obj.objectInside );
						Editor.uploader.upload();

					}
				}
			},
			revert : false,
			helper : 'clone'

		});

	}


    // prawdopodobnie do usuniecia
	addObjectFromHistory( histObj ){


		var parent = histObj.info.parent;

		if( histObj.info.parent ){

			parent.addObject( histObj.info.object, histObj.info.order );

		}
		else {

			// obsluga obiektu sceny - na przyszlosc trzeba to ujednolicic, bez sensu tak jest
			parent.addChild( histObj.info.object );
			Editor.stage.addObject( histObj.info.object );

		}

		objects[ histObj.info.object.id ] = histObj.info.object;

		if( histObj.info.object instanceof EditableArea ||  histObj.info.object instanceof Editor.AttributeLayer  )
			histObj.info.object.addAllObjects();

	}


    // nie uzywane jeszcze
	getHighestLayerInGroup( layer ){

		var layerChilds = layer.getNumChildren();

		var obj = layer.getChildAt(  layerChilds-1 );

		return obj;

	}


    // prawdopodobnie do usuniecia
	removeObject_ToHistory( object, addToHistory ){

		var object = Editor.stage.getObjectById(object);
		var layer = Editor.stage.getObjectById( object.parent.id );

		if( object instanceof EditorLayer || object instanceof Editor.AttributeLayer || object instanceof EditableArea ){

			object.removeObjects();

		}

		if( addToHistory ){

			var removeHistory = {

				'action' : 'removeObject',
				'info'	 :  {

					object : object,
					order  : layer.getChildIndex( object ),
					parent : layer

				}

			};

			Editor.addToHistory( removeHistory );

		}

		layer.removeObject( object.id );

		if( object instanceof Editor.AttributeLayer || object instanceof EditableArea )
			layer.detachLayer( object.id );

		delete objects[ object.id ];

		// --- > > > > trzeba bedzie odkomentowac < < < < < < ----
		//Editor.updateLayers();

	}


    // prawdopodobnie do usuniecia
	removeLayer_toHistory( object ){

		var layerObject = Editor.getObjectById( object );
		var parentLayer = Editor.stage.getObjectById( layerObject.parent.id );

		var removeHistory = {
			//'removeObject',
			'info' : {

			}
		};

	}


    /*
	* Usuwa referencje z magazynu <b>( nie ze sceny! )</b>
	*
	* @method removeObject
    * @param {object} object Obiekt do usuniÄcia
	*/
	removeObject( object ){

		if( object in objects )
			delete objects[ object ];
		else if( object in layers )
			delete layers[ object ];

	}


    /*
	* Zwraca obiekt, o podanym id z lokalnego przydziaĹy
	*
	* @method getObjectById
    * @param {String} id Lokalne ID obiektu
	*/
	getObjectById( id ){

		return this.objects[id];

	}


    /*
	* Zwraca obiekt, o podanym id w bazie danych
	*
	* @method getObjectByDbId
    * @param {String} id ID obiektu z bazy danych
	*/
    getObjectByDbId( id ){

        return this.objectsDB[id];

    }


    /*
	* Tworzy linijki pomocnycze
	*
	* @method initRulers
	*/
	initRulers(){

		if( userType == 'user' || userType == 'advancedUser')
			return;

		this.rulersLayer = this.rulersLayer || new Layer('RulersLayer');
		this.editor.getStage().addChild( this.rulersLayer );

		this.rulersLayer.removeAllChildren();

		//DigitMaker.generateDigit();
		this.editor.RulerMaker.setRulerSize( 50 );
		this.editor.RulerMaker.init();
    	this.editor.RulerMaker.generateRuler();

    	var patternImageVert  = safeImage();
    	var patternImageHor = safeImage();
    	var currentScale = this.editor.getStage().scaleX;
        var patternMatrix = new createjs.Matrix2D();
        var rulerHor = new createjs.Container();
        var rulerVert = new createjs.Container();

        var rulerHorShape = new createjs.Shape();
        var rulerVertShape = new createjs.Shape();

		var digitsHundredsVert  = new Image();
    	var digitsTensVert = new Image();

		var digitsHundredsVertShape = new createjs.Shape();
        var digitsTensVertShape = new createjs.Shape();


    	var rulerTopBackground = new createjs.Shape();
    	rulerTopBackground.graphics.f('rgba(12,93,89,1)').r(-2500, 0, 5000, 50/currentScale );

    	var rulerRightBackground = new createjs.Shape();
    	rulerRightBackground.graphics.f('rgba(12,93,89,1)').r( 0, -2500, 50/currentScale, 5000 );

    	rulerHor.addChild( rulerTopBackground );
    	rulerVert.addChild( rulerRightBackground );

        //rulerHor.removeAllChildren();
        rulerHor.addChild(rulerHorShape);
        rulerVert.addChild(rulerVertShape);

 		//rulerHor.addChild(DigitMaker.getHundreds(100));
        var horHundreds = {};
        var horTens = {};
        var minusHorHundreds = {};
        var minusHorTens = {};

        var vertHundreds = {};
        var vertTens = {};

        var minusVertHundreds = {};
        var minusVertTens = {};


        //horHundreds[1] = DigitMaker.getHundreds(200);
        //horHundreds[1].x = 200;

        //rulerHor.addChild( horHundreds[1] );




        for ( var i=100 ; i <= 2500 ; i=i+100 ){

        	horHundreds[i/100] = this.editor.DigitMaker.getHundreds(i,"hor");
        	horHundreds[i/100].x = i;
        	horHundreds[i/100].y = 20 / currentScale;
 			horHundreds[i/100].scaleX =  horHundreds[i/100].scaleY = 0.5/ currentScale;

 			//console.log( "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" );
 			//console.log( horHundreds[i/100] );

        	rulerHor.addChild( horHundreds[i/100] );

        }

        if ( currentScale > 2.2 )
        {
	        for ( var i=10 ; i <= 2500 ; i=i+10 ){

	        	horTens[i/10] = this.editor.DigitMaker.getTens(i,"hor");
	        	horTens[i/10].x = i;
	        	horTens[i/10].y = 20 / currentScale;
	 			horTens[i/10].scaleX =  horTens[i/10].scaleY = 0.5 / currentScale;

	        	rulerHor.addChild( horTens[i/10] );

	        }
	    }


        for ( var i=100 ; i >= -2500 ; i=i-100 ){

        	minusHorHundreds[i/100] = this.editor.DigitMaker.getHundreds(i,"hor","minus");
        	minusHorHundreds[i/100].x = i;
        	minusHorHundreds[i/100].y = 20 / currentScale;
 			minusHorHundreds[i/100].scaleX =  minusHorHundreds[i/100].scaleY = 0.5/ currentScale;

 			//console.log( "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" );
 			//console.log( horHundreds[i/100] );

        	rulerHor.addChild( minusHorHundreds[i/100] );

        }


        if ( currentScale > 2.2 )
        {
	        for ( var i=10 ; i >= -2500 ; i=i-10 ){

	        	minusHorTens[i/10] = this.editor.DigitMaker.getTens(i,"hor","minus");
	        	minusHorTens[i/10].x = i;
	        	minusHorTens[i/10].y = 20 / currentScale;
	 			minusHorTens[i/10].scaleX = minusHorTens[i/10].scaleY = 0.5 / currentScale;

	        	rulerHor.addChild( minusHorTens[i/10] );

	        }
	    }




        for ( var i=100 ; i <= 2500 ; i=i+100 ){

        	vertHundreds[i/100] = this.editor.DigitMaker.getHundreds(i,"vert");
        	vertHundreds[i/100].x = 10 / currentScale;
        	vertHundreds[i/100].y = i;
 			vertHundreds[i/100].scaleX = vertHundreds[i/100].scaleY = 0.5/ currentScale;

        	rulerVert.addChild( vertHundreds[i/100] );

        }


        if ( currentScale > 2.2 )
        {
	        for ( var i=10 ; i <= 2500 ; i=i+10 ){

	        	vertTens[i/10] = this.editor.DigitMaker.getTens(i,"vert");
	        	vertTens[i/10].x = 10 / currentScale;
	        	vertTens[i/10].y = i;
	 			vertTens[i/10].scaleX =  vertTens[i/10].scaleY = 0.5 / currentScale;

	        	rulerVert.addChild( vertTens[i/10] );

	        }
	    }

        for ( var i=100 ; i >= -2500 ; i=i-100 ){

        	minusVertHundreds[i/100] = this.editor.DigitMaker.getHundreds(i,"vert","minus");
        	minusVertHundreds[i/100].x = 10 / currentScale;
        	minusVertHundreds[i/100].y = i;
 			minusVertHundreds[i/100].scaleX = minusVertHundreds[i/100].scaleY = 0.5/ currentScale;

        	rulerVert.addChild( minusVertHundreds[i/100] );

        }


		if ( currentScale > 2.2 )
        {
	        for ( var i=10 ; i >= -2500 ; i=i-10 ){

	        	minusVertTens[i/10] = this.editor.DigitMaker.getTens(i,"vert","minus");
	        	minusVertTens[i/10].x = 10 / currentScale;
	        	minusVertTens[i/10].y = i;
	 			minusVertTens[i/10].scaleX =  minusVertTens[i/10].scaleY = 0.5 / currentScale;

	        	rulerVert.addChild( minusVertTens[i/10] );

	        }
	    }




        this.rulerTopLayer = rulerHor;
    	this.rulerRightLayer = rulerVert;

    	patternImageVert.src = this.editor.RulerMaker.getRulerImageVert();
    	patternImageHor.src = this.editor.RulerMaker.getRulerImageHor();



        patternImageHor.onload = function(){

        	//patternMatrix.scale( 1/currentScale, 1/currentScale);

        	var patternMatrix2 = new createjs.Matrix2D();
        	patternMatrix2.scale( 1/currentScale, 1/currentScale);
        	rulerHorShape.graphics.beginBitmapFill( patternImageHor , 'repeat', patternMatrix2 ).r( -2500, 0, 5000, 50/currentScale );
        }



        /*
        scaleNumber.onload = function(){

        	var patternMatrix3 = new createjs.Matrix2D();
        	patternMatrix3.scale( 1/currentScale, 1/currentScale);
        	scaleNumbers.graphics.beginBitmapFill( scaleNumber , 'repeat' , patternMatrix3 ).r( -2500, 0, 5000, 50/currentScale );

        }*/



        patternImageVert.onload = function(){

        	//DigitMaker.getDigit(1);

        	var patternMatrix1 = new createjs.Matrix2D();
        	patternMatrix1.scale( 1/currentScale, 1/currentScale);
        	rulerVertShape.graphics.beginBitmapFill( patternImageVert , 'repeat', patternMatrix1 ).r( 0, -2500, 50/currentScale, 5000 );

        }


        this.rulersLayer.addChild( rulerHor );
        this.rulersLayer.addChild( rulerVert );

        var shape = new createjs.Shape();
        shape.graphics.f("red").r(-3000,0,6000,50);

        var shape2 = new createjs.Shape();
        shape2.graphics.f("red").r(0,-3000,50,6000);

        rulerVert.hitArea = shape2;
        rulerHor.hitArea = shape;

        rulerHor.name = 'rulerHor';
        rulerHor.cursor = 'pointer';


		rulerVert.name = 'rulerVert';
        rulerVert.cursor = 'pointer';

		this.updateRulers();
       //initCenterNetHelper();
    }


    /*
	* CaĹkowicie przerysowuje linijki, tworzy je na nowo
	*
	* @method redrawRulers
	*/
	redrawRulers(){

        //return;

		//rulerTopLayer.parent.removeChild( rulerTopLayer );
		//rulerRightLayer.parent.removeChild( rulerRightLayer );

		//getObjectsList();
		this.initRulers();

	}


    /*
	* OdĹwierza pozycje linijek na scenie, robi to wzglÄdem poĹoĹźenia sceny
	*
	* @method updateRulers
	*/
	updateRulers(){

        //netHelper.removeAllChildren()

        if( userType == 'user' ||userType == 'advancedUser' )
        	return;

        this.rulerTopLayer.y = -this.editor.getStage().y *1/this.editor.getStage().scaleY+0/this.editor.getStage().scaleY;
        this.rulerRightLayer.x = -this.editor.getStage().x/this.editor.getStage().scaleX + (window.innerWidth-40)/this.editor.getStage().scaleX;

	}


    /*
	* Zmienia informacje o pozycji kursora w oknie uĹźytkownika
	*
	* @method setMouseCursor
    * @param {Int} x pozycja x
    * @param {Int} y pozycja y
	*/
	setMouseCursor( x, y ){

		this.mouseCursorX.x = x;
		this.mouseCursorY.y = y;

	}


    /*
	* Zwraca informacje o rozmiarzxe sceny ( element canvas )
	*
	* @method getSize
    * @return  {Object}
	*/
	getSize(){

		return {
			width: this.width,
			height: this.height
		}

	}


    // do usuniecia
	addEditGroup( editGroup ){
		editGroups.push( editGroup );
		getEditGroupList();
	}


    /*
	* Zwraca wszystkie obiekty na scenie
	*
	* @method getObjects
    * @return  {Array}
	*/
	getObjects(){

		return this.objects;

	}


    /*
	* Zwraca gĹĂłwnÄ warstwÄ, na ktĂłrej wyĹwiewtlane sÄ obiektu uĹźytkownika
	*
	* @method getMainLayer
    * @return  {EditorLayer}
	*/
	getMainLayer(){

		return this.mainLayer;

	}


    /*
	* Zwraca wszystkie warstwy
	*
	* @method getLayers
    * @return  {Array}
	*/
	getLayers(){

		return this.layers;

	}


    /*
	* Zwraca warstÄ o konkretnym id
	*
	* @method getLayer
    * @return  {EditorLayer}
    * @deprecated
	*/
	getLayer( layer_id ){

		if( this.layers[ layer_id])
			return this.layers[ layer_id ];
		else if( this.attributesLayers[layer_id] )
			return this.attributesLayers[layer_id];

	}


    /*
	* Zwraca wszystkie obszary robocze ( strony )
	*
	* @method getMousePosition
    * @return  {Array}
    * @deprecated NaleĹźy uĹźywaÄ getPages
	*/
	getEditableAreas(){

		return this.editableAreas;

	}


    /*
	* Zwraca pozycjÄ myszy
	*
	* @method getMousePosition
    * @return  {Array}
	*/
	getMousePosition( stageX, stageY ){

		var x,y;
		var stage = this.editor.getStage();
		y = (stageY - stage.y)/stage.scaleY;
		x = (stageX - stage.x)/stage.scaleX;

		return [x, y];

	}


	getMousePositionFromScreen( screenX, screenY ){

		var canvasMousePosition = [screenX, screenY - $(this.editor.getCanvas()).offset().top ];

		var stage = this.editor.getStage();

		const x = screenX/stage.scaleX - stage.x/stage.scaleX;
		const y = (screenY-80)/stage.scaleY - stage.y/stage.scaleY;

		return { x, y };

	}




    /*
	* Zwraca informacjÄ o przyciskach myszy, ktĂłre sÄ wciĹniÄte
	*
	* @method getMouseButton
    * @return  {Array}
	*/
	getMouseButton(){

		return this.mouseButton;

	}


    /*
	* Centruje scenÄ edytora w konkretnym punkcie
	*
	* @method
    * @param {EditorObject} obj Object do ktĂłrego edytor ma dopasowaÄ romiar
	*/
	resizeToObject( obj ){

		var scaleX = 1;
		var scaleY = 1;

		var tmpX = Editor.getStage().scaleX;
		var tmpY = Editor.getStage().scaleY;

		var parent = obj.parent;

		while( parent ){

			scaleX *= parent.scaleX;
			scaleY *= parent.scaleY;
			parent = parent.parent;

			if( !parent.parent )
				parent = parent.parent;

		}


		var offset = 180;

		var offsetX = 210;
		var offsetY = 70;

		var destinationMaxWidth = Editor.getCanvas().width() - offset;
		var destinationMaxHeight = Editor.getCanvas().height() - offset;
		var maxSize = 0;

		maxSize = destinationMaxHeight - 200;

		var windowPosition = {
			x : (( Editor.getCanvas().width() - maxSize )/2),
			y : (( Editor.getCanvas().height() -maxSize )/2)
		};

		var that = obj;

		var bounds = obj.getGlobalTransformedBounds();//obj.body.getTransformsdBounds();

		var bounds2  = obj.getTransformedBounds();

		var test = maxSize/(bounds.height * scaleX)/50 + tmpX;

		var posG = obj.localToLocal( obj.regX, obj.regY, Editor.getStage() );

		var vector = {
			x : Editor.getStage().x - posG.x*Editor.getStage().scaleX,
			y : Editor.getStage().y - posG.y
		};

		posTemp = posG.x/50;

		var stageStart = Editor.getStage().x / Editor.getStage().scaleX;

		var vector = {
			x : Editor.getStage().x - posG.x*Editor.getStage().scaleX,
			y : Editor.getStage().y - posG.y*Editor.getStage().scaleX
		};

		if( test > maxSize/(bounds.height * scaleX)){

			var interval = setInterval( function(){

					if( test > maxSize/(bounds.height * scaleX) ){
						Editor.getStage().scaleX = test;
						Editor.getStage().scaleY = test;
						Editor.getStage().x = (-posG.x * Editor.getStage().scaleX + Editor.getCanvas().width()/2) + offsetX;
						Editor.getStage().y = (-posG.y * Editor.getStage().scaleY + Editor.getCanvas().height()/2) + offsetY;


						posTemp += posG.x/50;
						test -= maxSize/(bounds.height * scaleX)/25;

						var zoomEvent = new createjs.Event( "stageScroll" );

						centerCameraToEditableAreaX();
						centerCameraToEditableAreaY();
						var scaleNow = Editor.getStage().scaleX;
             	       $( "#zoomSlider" ).slider( { value: scaleNow } );

 						Editor.stage.dispatchEventForAllObject( zoomEvent );
 						Editor.stage.redrawRulers();
                    	Editor.stage.updateNetHelper();

						Editor.tools.init();
					} else {
						clearInterval( interval );
					}

			},1000/60);

		}
		else {
			var interval = setInterval( function(){


					if( test < maxSize/(bounds.height * scaleX) ){
						Editor.getStage().scaleX = test;
						Editor.getStage().scaleY = test;
						Editor.getStage().x = (-posG.x * Editor.getStage().scaleX + Editor.getCanvas().width()/2) + offsetX/Editor.getStage().scaleX;
						Editor.getStage().y = (-posG.y * Editor.getStage().scaleY + Editor.getCanvas().height()/2) + offsetY/Editor.getStage().scaleX;

						posTemp += posG.x/50;
						test += maxSize/(bounds.height * scaleX)/50;

						var zoomEvent = new createjs.Event( "stageScroll" );


						centerCameraToEditableAreaX();
						centerCameraToEditableAreaY();
						var scaleNow = Editor.getStage().scaleX;
                	    $( "#zoomSlider" ).slider( { value: scaleNow } );
 						Editor.stage.dispatchEventForAllObject( zoomEvent );
 						Editor.stage.redrawRulers();
                    	Editor.stage.updateNetHelper();

						Editor.tools.init();
					} else {
						clearInterval( interval );
					}

			},1000/60);
		}



		var pos = Editor.stage.getMousePosition( windowPosition.x  , windowPosition.y );


	}


    /*
	* Centruje scenÄ edytora w konkretnym punkcie
	*
	* @method centerToPoint
    * @param {Float} x Pozycja x
    * @param {Float} y Pozycja y
	*/
    centerToPoint( x, y ){

    	var offsexX = 420;
    	var offsetY = 130;

        var userWidth = window.innerWidth - offsexX ;
        var userHeight = window.innerHeight + offsetY;

        var scale = this.editor.getStage().scaleX;

        var x = userWidth/2 - x/scale;
        var y = userHeight/2 - y/scale;;

        this.editor.getStage().x = x;
        this.editor.getStage().y = y;


        var centerToPointEvent = new createjs.Event( "stageScroll" );


        this.editor.stage.dispatchEventForAllObject( centerToPointEvent );

        this.editor.stage.redrawRulers();
        this.editor.stage.updateNetHelper();


    }


    /*
	* PrzesĂłwa obiekty ktĂłre sÄ zainicjalizowane
	*
	* @method getClosestVerticalLine
    * @param {EditorObject} object Obiekt wzglÄdem ktĂłrego szukamy najbliĹźszej lini przyciÄgajÄcej
	*/
    getClosestVerticalLine( object ){



    }


    /*
	* PrzesĂłwa obiekty ktĂłre sÄ zainicjalizowane
	*
	* @method moveObjects
	*/
    moveObjects(){

    	var Editor = this.editor;

    	let objectToMove = this.objectToMove;

        if( objectToMove ){

			if( objectToMove instanceof EditableArea  ){

				if( objectToMove.blocked )
					return;

			}

            var moveVector = [-objectToMove.moveVector.start[0] + objectToMove.moveVector.stop[0], -objectToMove.moveVector.start[1] + objectToMove.moveVector.stop[1] ];
            var localStartVector = objectToMove.parent.globalToLocal( objectToMove.moveVector.start[0], objectToMove.moveVector.start[1]);
            var localStopVector = objectToMove.parent.globalToLocal( objectToMove.moveVector.stop[0], objectToMove.moveVector.stop[1]);
            var localVector = [-localStartVector.x + localStopVector.x, -localStartVector.y+localStopVector.y];

			objectToMove.setPosition( objectToMove.tmpPos.x + localVector[0], objectToMove.tmpPos.y + localVector[1] );
			/*
            objectToMove.x = objectToMove.tmpPos.x + localVector[0];
            objectToMove.y = objectToMove.tmpPos.y + localVector[1];

            if( objectToMove.mask ){

            	objectToMove.mask.x = objectToMove.x;
            	objectToMove.mask.y = objectToMove.y;

            }

*/
            objectToMove.updateMagneticLines();

            if( Editor.settings.magnetize )
            	objectToMove.checkMagneticLines( true, true, true, true, true, true );

            Editor.tools.updateCompoundBox();

	        objectToMove.dispatchEvent('move');
	        objectToMove.updateMagneticLines();
	        this.updateEditingTools( objectToMove );

        }

    }


    initObjectDefaultEvents( object ){
        return;
        object.addEventListener( 'mousedown', function(e){

            e.stopPropagation();
            var currentObject = e.target;

            if( e.nativeEvent.button == 0 ){

                if( currentObject.moveVector.start == null ){
                    objectToMove = currentObject;
                    currentObject.tmpPos= { x : currentObject.x, y : currentObject.y};
                    currentObject.moveVector.start = [ e.stageX, e.stageY ];
                    currentObject.moveVector.stop =  [ e.stageX, e.stageY ];
                }
                else {
                    currentObject.moveVector.stop = [ e.stageX, e.stageY ];
                }
            }

        });

        object.addEventListener('pressmove', function( e ){

			if( e.nativeEvent.button == 0 ){
                e.stopPropagation();
                var currentObject = e.target;
                currentObject.moveVector.stop =  [ e.stageX, e.stageY ];
            }

        });

        object.addEventListener('pressup', function( e ){

            if( objectToMove ){

                objectToMove.showMagneticLines( 0, 0, 0, 0, 0, 0 );
                objectToMove = null;

                var currentObject = e.target;
                currentObject.moveVector.start = null;
                currentObject.moveVector.stop = null;

            }

        });

    }


    updateComplexView ( complexView ){

    	var mainLayer = Editor.stage.getMainLayer();
    	mainLayer.removeAllChildren();
    	Editor.stage.getIRulersLayer().removeAllChildren();

    	var complexViewLayer = new EditorLayer( 'complexViewLayer' );

    	Editor.complexAdminProject.complexView.setLayer( complexViewLayer );

        if( !complexView ) {

            Editor.template.warningView('Brak widokĂłw do zaĹadowania, musisz utworzyÄ przynajmniej jeden, aby projekt byĹ widoczny dla uĹźytkownika!');
            return false;

        }

        for( var i=0; i < complexView.GroupLayers.length; i++ ){

        	Editor.stage.getMainLayer().addChild( Editor.complexAdminProject.complexView.getGroupLayer( complexView.GroupLayers[ i ].complexGroupID ) );

        }

        Editor.templateAdministration.updateComplexLayers( Editor.stage.getMainLayer().children );


    }


    /*
	* Usuwa wszystkie obiekty ze sceny i na nowo je dodaje, bazujÄc na inofrmacjach zawartyc w widoku <b>(Editor.adminProject.view)</b>
	*
	* @method updateView
	*/
    updateView( view ){

        var Editor = this.editor;
        // trzeba zrobiÄ usuwanie z wszystkich mniejsc referenicj
        var mainLayer = Editor.stage.getLayer( this.MAIN_LAYER );
        mainLayer.removeAllChildren();

        Editor.stage.getIRulersLayer().removeAllChildren();

        // jeĹźeli nie ma zainicjowanego widoku
        if( !view ) {

            Editor.template.warningView('Brak widokĂłw do zaĹadowania, musisz utworzyÄ przynajmniej jeden, aby projekt byĹ widoczny dla uĹźytkownika!');
            return false;

        }


        var test = new EditorLayer( 'widok' );
        var pageLayer = new EditorLayer( 'page' );

        Editor.adminProject.format.view.setLayer( test );

        // to trzeba przenieĹĹÄ do inita view
        var viewLayer = Editor.adminProject.format.view.getLayer();
        Editor.adminProject.format.view.page.setPageLayer( pageLayer );

        mainLayer.addChild( viewLayer );
        mainLayer.addChild( pageLayer );

        var objectsToAdd = [];


        for( var i=0; i < view.EditorTexts.length; i++ ){

        	var text = view.EditorTexts[i];

			var object = new Text2( text.name, 20, text.width, text.height, false, true, Editor );
	        //object.order =
	        object.init( object._currentFontSize, true );
	        object.generateCursorMap();
		 	object.dbID = text._id;

		 	if( text.content ){
				for( var line=0; line < text.content.length; line++ ){

	                var _line = new TextLine( 0, 0, text.content[line].lineHeight );
	                object.addLine( _line );
	                _line.initHitArea();
	                _line.uncache();

	                for( var letter=0; letter < text.content[line].letters.length; letter++ ){

	                    var _letter = new Editor.TextLetter(

	                        text.content[line].letters[letter].text,
	                        text.content[line].letters[letter].fontFamily,
	                        text.content[line].letters[letter].size,
	                        text.content[line].letters[letter].color,
	                        text.content[line].letters[letter].lineHeight,
	                        text.content[line].letters[letter].fontType.regular,
	                        text.content[line].letters[letter].fontType.italic

	                    );

	                    _line.addCreatedLetter( _letter );

	                }

	            }

	        }

	        // niewiem dlaczego nie działa
            //object.generateCursorMap();

	        object.setTrueHeight( text.height );
	        object.setTrueWidth( text.width );
	        object._updateShape();
        	object.setPosition_leftCorner( text.x, text.y );

	        objectsToAdd.push( object );

    	}

        for( var i=0; i < view.EditorBitmaps.length; i++ ){

            if( view.EditorBitmaps[i].ProjectImage ){
                var data = view.EditorBitmaps[i];
                var newEditorBitmap = new Bitmap(

            		data.ProjectImage.name,
            		data.ProjectImage.minUrl,
            		true,
            		true,
            		data

                );
                newEditorBitmap.editor = Editor;
                newEditorBitmap.uid = data.uid;
                newEditorBitmap.dbID = data._id;
                newEditorBitmap.x = data.x;
                newEditorBitmap.y = data.y;
                newEditorBitmap.dbID = data._id;

                newEditorBitmap.regX = data.ProjectImage.width/2;
                newEditorBitmap.regY = data.ProjectImage.height/2;
                newEditorBitmap.order = data.order;

                //newEditorBitmap.initEvents();
                //initObjectDefaultEvents( newEditorBitmap );

                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, 0, data.ProjectImage.width, data.ProjectImage.height );
                newEditorBitmap.hitArea = hit;


                newEditorBitmap.trueHeight = data.ProjectImage.trueHeight;
                newEditorBitmap.trueWidth = data.ProjectImage.trueWidth;
                //newEditorBitmap.setCenterReg();

                objectsToAdd.push( newEditorBitmap );

                var projectImage = Editor.adminProject.getProjectImage(data.ProjectImage.uid);
                //Editor.stage.addObject( newEditorBitmap );
                //Editor.adminProject.format.view.addEditorBitmap( newEditorBitmap, 0 );
                //newEditorBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );

            }

        }


        var needSort = 1;

        do {

            var smaller = false;

            for( var i=0; i< objectsToAdd.length-1; i++ ){

                if( objectsToAdd[i].order > objectsToAdd[i+1].order ){

                    smaller = true;
                    var tmp = objectsToAdd[i+1];
                    objectsToAdd[i+1] = objectsToAdd[i];
                    objectsToAdd[i] = tmp;

                }
            }

            if( smaller )
                needSort = 1;
            else
                needSort = 0;

        }
        while( needSort );

        for( var i=0; i < objectsToAdd.length; i++ ){

            Editor.stage.addObject( objectsToAdd[i] );
            Editor.adminProject.format.view.addEditorObject( objectsToAdd[i] );
            objectsToAdd[i].prepareMagneticLines( Editor.getMagnetizeTolerance() );

        };

        this.pages = [];

		//console.log( view );
		//console.log('---------------------------000000--------------0000000');

        for( var i=0; i<view.Pages.length; i++ ){

            var objectInfo = view.Pages[i];

			//console.log( objectInfo );

			if( objectInfo.type == 1 ){
				//alert('slope');
				var object = new EditableArea( Editor, objectInfo.name, objectInfo.width, objectInfo.height, objectInfo._id, objectInfo.slope, objectInfo.vacancy, objectInfo.spread );
				object.updateWithContentFromDB( objectInfo );
				object.dbID = objectInfo._id;
				object.init();
				object.rotate( view.Pages[i].rotation || 0 );
				this.pages.push( object );
				Editor.stage.addObject( object );
				pageLayer.addChild( object );

			}else if( objectInfo.type == 2 ) {

				var object = new Cover( Editor, objectInfo.name, objectInfo.width, objectInfo.height, objectInfo._id, objectInfo.slope, objectInfo.vacancy, objectInfo.spread, 10 );
				object.updateWithContentFromDB( objectInfo );
				object.dbID = objectInfo._id;
				object.init();
				object.rotate( view.Pages[i].rotation || 0 );
				this.pages.push( object );
				Editor.stage.addObject( object );
				pageLayer.addChild( object );

			}

        }

        //centerToPoint( 0, 0 );
      	Editor.stage.centerCameraX();
        Editor.stage.centerCameraY();


        var centerToPointEvent = new createjs.Event( "stageScroll" );


        Editor.stage.dispatchEventForAllObject( centerToPointEvent );

        Editor.stage.redrawRulers();
        Editor.stage.updateNetHelper();

        Editor.templateAdministration.updateLayers( Editor.adminProject.format.view.getLayer().children );

    }


    /**
	* Dodaje stronÄ na scene
	*
	* @method addPage
    * @param {EditableArea} page strona ktĂłra ma zostaÄ dodana
	*/
    addPage( page ){

        this.pages.push( page );
        this.editor.getStage().addChild( page );
        this.editor.stage.addObject( page );

    }


    /**
	* Zwraca wszystkie strony, ktĂłre znajdujÄ siÄ na scenie
	*
	* @method getPages
    * @return Array
	*/
    getPages(){

        return this.pages;

    }


    /**
	* Przygotowuje inteigentne linie dla wszystkich obiektĂłw.
	*
	* @method prepareMagneticLines
    * @return Array
	*/
    prepareMagneticLines(){



    }


    setObjectToMove ( obj ){

    	this.objectToMove = obj;

    }


    getObjectToMove (){

    	return this.objectToMove;

    }


    updateEditingTools ( obj ){

    	if( userType == 'user' || userType == 'advancedUser' ){

    		return;

    	}

    	//var editingObject = Editor.stage.getObjectById( editing_id );
    	if ( obj == null){

    		//$('#objectSettings-content').addClass('toolsUnactive');
    		document.getElementById('objectXPosition').value = 0;
	    	document.getElementById('objectYPosition').value = 0;
	    	document.getElementById('positionSetW').value = 0;
	    	document.getElementById('positionSetSZ').value = 0;
	    	document.getElementById('alphaValueInput').value = 0;
			document.getElementById('setRotationInput').value = 0;
	    	document.getElementById('shadowMoveXInput').value = 0;
			document.getElementById('shadowMoveYInput').value = 0;
			document.getElementById('shadowBlurInput').value = 0;
			document.getElementById('borderWidthPickerInput').value = 0;

			$('.posSetSZlabel').addClass('toolUnactive');
    		$('.posSetWlabel').addClass('toolUnactive');
    		$('.alphaSettings').addClass('toolUnactive');
    		$('.shadowSettings').addClass('toolUnactive');
    		$('.borderSettings').addClass('toolUnactive');
    		$('.horMirrorLabel').addClass('toolUnactive');
    	    $('.vertMirrorLabel').addClass('toolUnactive');
    		$('.proportionTool').addClass('toolUnactive');
    		$('.setRotationLabel').addClass('toolUnactive');
    		$('.posXSetLabel').addClass('toolUnactive');
    		$('.posYSetLabel').addClass('toolUnactive');

    	} else if( obj != null ){


    		$('#objectSettings-content').removeClass('toolsUnactive');
    	    $('.posXSetLabel').removeClass('toolUnactive');
    		$('.posYSetLabel').removeClass('toolUnactive');
    		$('.setRotationLabel').removeClass('toolUnactive');


    		if( obj.type == "EditableArea" ){

    			$('.posSetSZlabel').addClass('toolUnactive');
    			$('.posSetWlabel').addClass('toolUnactive');
    			$('.alphaSettings').addClass('toolUnactive');
    			$('.shadowSettings').addClass('toolUnactive');
    			$('.borderSettings').addClass('toolUnactive');
    			$('.horMirrorLabel').addClass('toolUnactive');
    			$('.vertMirrorLabel').addClass('toolUnactive');
    			$('.proportionTool').addClass('toolUnactive');





    			if( obj.blocked ){
    				$('.posXSetLabel').addClass('toolUnactive');
    				$('.posYSetLabel').addClass('toolUnactive');
    				$('.setRotationLabel').addClass('toolUnactive');
    			} else{

    				$('.posXSetLabel').removeClass('toolUnactive');
    				$('.posYSetLabel').removeClass('toolUnactive');
    				$('.setRotationLabel').removeClass('toolUnactive');

    			}




    		}else if( obj.type != "EditableArea" ){

    			$('.posSetSZlabel').removeClass('toolUnactive');
    			$('.posSetWlabel').removeClass('toolUnactive');
    			$('.alphaSettings').removeClass('toolUnactive');
    			$('.shadowSettings').removeClass('toolUnactive');
    			$('.borderSettings').removeClass('toolUnactive');
    			$('.horMirrorLabel').removeClass('toolUnactive');
    			$('.vertMirrorLabel').removeClass('toolUnactive');
    			$('.proportionTool').removeClass('toolUnactive');

    			if ( obj.displaySimpleBorder ) {
    				document.getElementById('custom-toggle-flat-border').checked = true;

    			}else {
    				document.getElementById('custom-toggle-flat-border').checked = false;

    			}


    			if ( obj._dropShadow ) {
    				document.getElementById('custom-toggle-flat').checked = true;

    			}else {
    				document.getElementById('custom-toggle-flat').checked = false;

    			}

    		}




    		//console.log (obj.droppedBorder+" <----- WARTOĹÄ RAMKI ZDJÄCIA");

    		if ( obj.getFirstImportantParent() instanceof EditableArea ){

	    		var objBounds = obj.getTransformedBounds();


    		}else{

    			var objBounds = obj.getGlobalTransformedBounds();

    		}


    		document.getElementById('objectXPosition').value = parseInt(objBounds.x).toFixed(2);
	    	document.getElementById('objectYPosition').value = parseInt(objBounds.y).toFixed(2);

	    	document.getElementById('positionSetW').value = parseInt(obj.height * obj.scaleY).toFixed(2);
	    	document.getElementById('positionSetSZ').value = parseInt(obj.width * obj.scaleX).toFixed(2);

	    	document.getElementById('alphaValueInput').value = obj.alpha;



			$('#toggleOnOff2').prop('checked', obj.displaySimpleBorder);
			$('#toggleOnOff2').attr('checked', obj.displaySimpleBorder);


			//console.log(document.getElementById("toggleOnOff2").checked+" <----- WARTOĹÄ FLIP SWITCHA OD RAMKI");

			$('#toggleOnOff2').prop('checked', obj.displaySimpleBorder);
			$('#toggleOnOff2').attr('checked', obj.displaySimpleBorder);

			$("#slider").slider('value', obj.alpha );

    		var tempRotationValue = ( (obj.rotation) % 360 );

    		document.getElementById('setRotationInput').value = parseInt(tempRotationValue).toFixed(0);
	    	document.getElementById('shadowMoveXInput').value = parseInt(obj.shadowOffsetX).toFixed(0);
			document.getElementById('shadowMoveYInput').value = parseInt(obj.shadowOffsetY).toFixed(0);
			document.getElementById('shadowBlurInput').value = parseInt(obj.shadowBlur).toFixed(0);
			document.getElementById('borderWidthPickerInput').value = parseInt(obj.borderWidth).toFixed(0);

    	}

    }


    dispatchEventForAllObject( event ){

    	var scrollEvent = new createjs.Event( event );
        //scrollEvent.initEvent('stageScroll', true, true);

        //var scrollEvent = new Event('stageScroll');

        var stageObjects = this.editor.stage.getObjects();


        for( var key in stageObjects ){

            stageObjects[ key ].dispatchEvent( event );

        }


        //Linie pomocnicze - dodanie eventu scroll
        var IRulers = this.editor.stage.getIRulersLayer().children;

        for (var i=0 ; i < IRulers.length ; i++)
        {
            IRulers[i].dispatchEvent( event );
        }
        //Koniec (Linie pomocnicze - dodanie eventu scroll)


        var stagePages = this.editor.stage.getPages();


        for( var i=0; i < stagePages.length; i++){

            stagePages[i].dispatchEvent( event );

        }


        var rHelpers = this.editor.stage.getIRulersLayer().children;


        for( var i=0; i< rHelpers.length;i++){

            rHelpers[i].dispatchEvent( event );

        }



    }


    /*
	* Ustala Ĺrodek obiektu wskazanego parametrem metody i centruje do niego kamerÄ
	*
	* @method centerAnyObject
    *
	*/

	centerAnyObject( obj ){

		var centerAnyObjectEvent = new createjs.Event( "stageScroll" );

		Editor.stage.resizeToObject( obj );
		//Editor.stage.cameraToObject( obj );



		Editor.stage.redrawRulers();
        Editor.stage.updateNetHelper();


	 	Editor.stage.dispatchEventForAllObject( centerAnyObjectEvent );

		//Editor.stage.resizeToObject( obj );

		//Editor.stage.dispatchEventForAllObject( zoomSlider );


	}


	getObjectsLayer(){

		return this.layer;

	}

	getPagesLayer(){


	}

	getBackgroundLayer(){

		return this.backgroundClicker;

	}

	getStage(){

		return this.stage;

	}

}
