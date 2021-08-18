import {Bitmap} from './EditorBitmap';
var Layer = require('./Layer.js').Layer;

    createjs.Graphics.prototype.dashedLineTo = function(x1, y1, x2, y2, dashLen) {
        this.moveTo(x1, y1);

        var dX = x2 - x1;
        var dY = y2 - y1;
        var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
        var dashX = dX / dashes;
        var dashY = dY / dashes;

        var q = 0;
        while (q++ < dashes) {

            x1 += dashX;
            y1 += dashY;
            this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
        }
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
    }

    createjs.Graphics.prototype.drawDashedRect = function(x1, y1, w, h, dashLen) {

        shape.graphics.moveTo(x1, y1);
        var x2 = x1 + w;
        var y2 = y1 + h;
        shape.graphics.dashedLineTo( x1, y1, x2, y1, dashLen );
        shape.graphics.dashedLineTo( x2, y1, x2, y2, dashLen );
        shape.graphics.dashedLineTo( x2, y2, x1, y2, dashLen );
        shape.graphics.dashedLineTo( x1, x2, x1, y1, dashLen );

    }


	/**
	* Klasa reprezentująca pole robocze.
	*
	* @class EditableArea
	* @constructor
	*/
	function EditableArea( editor, name, width, height, dbId, slope, vacancy, spread ){

        this.typeName = 'EditableArea';
        this.editor = editor;
        this.settings = {};
        this.settings.slope = slope;
        this.settings.vacancy = vacancy;
        this.settings.spread = spread;
        this.slope = slope;
        this.blocked = true;
        this.adminProposedTemplate = null;


        if( this.settings && this.settings.vacancy ){

            if( userType == 'admin' || userType == 'advancedUser' ){

                width = width/2 + this.slope;
                height = height + (this.slope *2);

            }
            else {

                width = width/2 - this.slope;
                height = height + (this.slope *2);

            }

        }else {

            if( userType == 'user' ){

                width = width - (2*this.slope);

            }

        }

        this.moveVector = {

            start : null,
            stop : null

        };

        if( userType == 'admin' ){

            Layer.call( this );
            this.proposedImagePositions = [];
            var shape = new createjs.Graphics();
            shape.f("#000").r(0,0, width, height).ss(2).s("#000").mt(0,0).lt(width, 0).lt(width, height ).lt(0, height).cp();

            var object = new createjs.Shape( shape );
            var mask = new createjs.Shape( shape );
            mask.x = -width/2;
            mask.y = -height/2;
            mask.regX = width/2;
            mask.regY = height/2;
            this.mask = mask;
            this.x = 0;
            this.y = 0;
            this.regX = width/2;
            this.regY = height/2;

            this.pageType = 'onePage';
            this.user = false;

            object.alpha = 0.13;

            var scaleX = 1;
            var scaleY = 1;
            var parent = object.parent;

            while( parent ){

                scaleX *= parent.scaleX;
                scaleY *= parent.scaleY;
                parent = parent.parent;

            }

            this.usedPhotos = {};

            this.backgroundLayer = new Layer();
            this.backgroundLayer.editor = this.editor;
            this.backgroundLayer.name = 'backgroundLayer';
            this.backgroundLayer.width = width;
            this.backgroundLayer.height = height;

            this.userLayer = new Layer();
            this.userLayer.editor = this.editor;
            this.userLayer.name = 'userLayer';
            this.userLayer.width = width;
            this.userLayer.height = height;

            this.foregroundLayer = new Layer();
            this.foregroundLayer.editor = this.editor;
            this.foregroundLayer.name = 'foregroundLayer';
            this.foregroundLayer.width = width;
            this.foregroundLayer.height = height;

            this.dropLayer =  new Layer();

            this.addChild( this.backgroundLayer );
            this.addChild( this.userLayer );
            this.addChild( this.foregroundLayer );
            this.addChild( this.dropLayer );


            /**
            * Zawiera obiekty składające się na kompozycję danego obieku (np. tło, ramka itp). Podczas Podzielone jest na top i bottom, czyli to co
            * jest pod i nad obiektami wewnątrz, należy je pomijać podczas dodawania innych elementów wewnątrz.
            *
            * @property composedObjects
            * @type {Object}
            */
            this.composedObjects = {

                top: [ ],
                bottom: []

            };


            this.initHitArea = function(){

                if( !this.user ){

                    this.hitArea = new createjs.Shape();
                    this.hitArea.graphics.f('rgba(12,93,89,0.5)').r( 0,0,width,height);

                }

            };

            this.removeHitArea = function(){

                this.hitArea = null;

            };


            /**
            * Przechowuje obiekty proponowane
            *
            * @property proposedPositions
            * @type {Array}
            */
            this.proposedPositions = [];

            /**
            * Przechowuje ustawienia obiektu.
            *
            * @property settings
            * @type {Object}
            */


            shape.c().f("#fff").r( 0, 0, width, height );

            this.slopeShape = null;


            if( this.settings.slope ) {

                this.slopeShape = new createjs.Graphics();
                // trzeba tutaj przenieść ramkę
                this.slopeShape.c().ss(1*scaleX).s("#fff").mt(1,1).lt(width, 0).lt(width, height ).lt(0, height).cp();
                this.slopeShape.ss(1*scaleX).s("#F00").mt( this.settings.slope, this.settings.slope).lt(width-(this.settings.slope), this.settings.slope).lt( width-( this.settings.slope ), height-( this.settings.slope ) ).lt( this.settings.slope, height - (this.settings.slope)).cp().es();
                this.slopeShape.f("rgba(255, 0, 0, 1.0)").r(0,0, width, this.settings.slope).r(width -this.settings.slope, this.settings.slope, this.settings.slope, height - this.settings.slope).r( 0, height - this.settings.slope, width -this.settings.slope, this.settings.slope).r(0, this.settings.slope, this.settings.slope, height-(this.settings.slope*2));
                this.slopeShape = new createjs.Shape( this.slopeShape );

            }
            else {

                this.slopeShape = new createjs.Graphics();
                this.slopeShape.c().ss(2*scaleX).s("#00d1cd").mt(0,0).lt(width, 0).lt(width, height ).lt(0, height).cp();
                this.slopeShape = new createjs.Shape( this.slopeShape );

            }

            this.addTopCompoundObject( this.slopeShape );

            this.shape = shape;
            this.name = name;
            this.width = width;
            this.height = height;
            this.trueHeight = height;
            this.trueWidth = width;
            this.layers = {};
            this.objects = {};
            this.objectsOrder = [];
            this.removeAllEventListeners();
            var tmp = this;
            this.x = -width/2;
            this.y = -height/2;
            this.regX = width/2;
            this.regY = height/2;

            this.borderShape = new createjs.Shape();
            this.borderShape.graphics.s("#00d1cd").mt(0,0).lt(width, 0).lt(width, height ).lt(0, height).cp();

            this.backgroundHolder = new createjs.Shape();
            this.backgroundHolder.graphics.f('rgba(255,255,255,0.6)').r(0,0,this.width, this.height);

            /*
            // miejsce na wygenerowanie siatki
            for(var i = 0; i<10; i++ ){

                this.backgroundHolder.graphics.lt(0,)

                for( var l=0; l < 10; l++ ){


                }

            }
            */

            this.addBottomCompoundObject( this.backgroundHolder );
            //this.addBottomCompoundObject( object );

            if( this.slopeShape )
                //this.addTopCompoundObject( this.slopeShape );

            this.addTopCompoundObject( this.borderShape );
            //this.mask = mask;

            this.dbId = dbId;
            this.toolsType = 'editableArea';
            this.type = 'EditableArea';
            this.editor.stage.addObject( this );

            this.order = 0;
            this.setBounds( 0, 0, width, height);

            this.dragOverflowBackground = new createjs.Shape();
            this.dragOverflowBackground.graphics.c().f("rgba(255, 0, 0, 0.71)").r(0,0, width, height)
            this.dragOverflowBackground.visible = false;

            this.addTopCompoundObject( this.dragOverflowBackground );


        }
        else {

            if( userType == 'user'){
                height = height - (2*this.slope);
            }

            Layer.call( this );
            this.proposedImagePositions = [];
            var shape = new createjs.Graphics();
            shape.f("#000").r(0,0, width, height).ss(2).s("#000").mt(0,0).lt(width, 0).lt(width, height ).lt(0, height).cp();

            var object = new createjs.Shape( shape );
            var mask = new createjs.Shape( shape );
            mask.x = -width/2;
            mask.y = -height/2;
            mask.regX = width/2;
            mask.regY = height/2;

            this.x = 0;
            this.y = 0;
            this.regX = width/2;
            this.regY = height/2;

            this.pageType = 'onePage';
            this.user = false;

            object.alpha = 0.13;

            var scaleX = 1;
            var scaleY = 1;
            var parent = object.parent;

            while( parent ){

                scaleX *= parent.scaleX;
                scaleY *= parent.scaleY;
                parent = parent.parent;

            }

            this.usedPhotos = {};

            this.backgroundLayer = new Layer();
            this.backgroundLayer.editor = this.editor;
            this.backgroundLayer.name = 'backgroundLayer';
            this.backgroundLayer.width = width;
            this.backgroundLayer.height = height;

            this.userLayer = new Layer();
            this.userLayer.editor = this.editor;
            this.userLayer.name = 'userLayer';
            this.userLayer.width = width;
            this.userLayer.height = height;

            this.userScene = new Layer();
            this.userScene.editor = this.editor;
            this.userScene.name = 'userScene';
            this.userScene.width = width;
            this.userScene.height = height;

            this.addChild( this.userScene );

            this.foregroundLayer = new Layer();
            this.foregroundLayer.editor = this.editor;
            this.foregroundLayer.name = 'foregroundLayer';
            this.foregroundLayer.width = width;
            this.foregroundLayer.height = height;

            this.dropLayer =  new Layer();

            this.addChild( this.backgroundLayer );
            this.addChild( this.userLayer );
            this.addChild( this.foregroundLayer );
            this.addChild( this.dropLayer );


            /**
            * Zawiera obiekty składające się na kompozycję danego obieku (np. tło, ramka itp). Podczas Podzielone jest na top i bottom, czyli to co
            * jest pod i nad obiektami wewnątrz, należy je pomijać podczas dodawania innych elementów wewnątrz.
            *
            * @property composedObjects
            * @type {Object}
            */
            this.composedObjects = {

                top: [ ],
                bottom: []

            };


            this.initHitArea = function(){

                if( !this.user ){

                    this.hitArea = new createjs.Shape();
                    this.hitArea.graphics.f('rgba(12,93,89,0.5)').r( 0,0,width,height);

                }

            };

            this.removeHitArea = function(){

                this.hitArea = null;

            };


            /**
            * Przechowuje obiekty proponowane
            *
            * @property proposedPositions
            * @type {Array}
            */
            this.proposedPositions = [];

            /**
            * Przechowuje ustawienia obiektu.
            *
            * @property settings
            * @type {Object}
            */


            shape.c().f("#fff").r( 0, 0, width, height );

            this.slopeShape = null;

            this.shape = shape;
            this.name = name;
            this.width = width;
            this.height = height;
            this.trueHeight = height;
            this.trueWidth = width;
            this.layers = {};
            this.objects = {};
            this.objectsOrder = [];
            this.removeAllEventListeners();
            var tmp = this;
            this.x = -width/2;
            this.y = -height/2;
            this.regX = width/2;
            this.regY = height/2;

            this.borderShape = new createjs.Shape();
            this.borderShape.graphics.s("#00d1cd").mt(0,0).lt(width, 0).lt(width, height ).lt(0, height).cp();

            this.backgroundHolder = new createjs.Shape();
            this.backgroundHolder.graphics.f('rgba(255,255,255,0.6)').r(0,0,this.width, this.height);

            /*
            // miejsce na wygenerowanie siatki
            for(var i = 0; i<10; i++ ){

                this.backgroundHolder.graphics.lt(0,)

                for( var l=0; l < 10; l++ ){


                }

            }
            */

            if( userType =='advancedUser'){

                this.slopeShape = null;

                if( this.settings.slope ) {

                    this.slopeShape = new createjs.Graphics();
                    // trzeba tutaj przenieść ramkę
                    this.slopeShape.c().ss(1*scaleX).s("#fff").mt(1,1).lt(width, 0).lt(width, height ).lt(0, height).cp();
                    this.slopeShape.ss(1*scaleX).s("#F00").mt( this.settings.slope, this.settings.slope).lt(width-(this.settings.slope), this.settings.slope).lt( width-( this.settings.slope ), height-( this.settings.slope ) ).lt( this.settings.slope, height - (this.settings.slope)).cp().es();
                    this.slopeShape.f("rgba(0, 0, 0, 0.34)").r(0,0, width, this.settings.slope).r(width -this.settings.slope, this.settings.slope, this.settings.slope, height - this.settings.slope).r( 0, height - this.settings.slope, width -this.settings.slope, this.settings.slope).r(0, this.settings.slope, this.settings.slope, height-(this.settings.slope*2));
                    this.slopeShape = new createjs.Shape( this.slopeShape );

                }
                else {

                    this.slopeShape = new createjs.Graphics();
                    this.slopeShape.c().ss(2*scaleX).s("#00d1cd").mt(0,0).lt(width, 0).lt(width, height ).lt(0, height).cp();
                    this.slopeShape = new createjs.Shape( this.slopeShape );

                }

            }
            

            this.addBottomCompoundObject( this.backgroundHolder );
            //this.addBottomCompoundObject( object );

            if( userType =='advancedUser'){

                this.addTopCompoundObject( this.slopeShape );

            }

            this.addTopCompoundObject( this.borderShape );
            this.mask = mask;

            this.dbId = dbId;
            this.toolsType = 'editableArea';
            this.type = 'EditableArea';
            //this.editor.stage.addObject( this );

            this.order = 0;
            this.setBounds( 0, 0, width, height);

            this.dragOverflowBackground = new createjs.Shape();
            this.dragOverflowBackground.graphics.c().f("rgba(255, 0, 0, 0.71)").r(0,0, width, height)
            this.dragOverflowBackground.visible = false;

            this.addTopCompoundObject( this.dragOverflowBackground );

        }

        //this.cursor ="pointer";

	};


    var p = EditableArea.prototype = Object.create( Layer.prototype );
	p.constructor = EditableArea;


    p.addObjectToBackground = function( object ){

        this.backgroundLayer.addChild( object );

    };

    p.makeCache = function(){

        this.cache(0,0,this.width, this.height);

    };


    p.clear = function(){

        for( var i=0; i < this.backgroundLayer.children.length; i++){
            this.backgroundLayer.children[i].removeMagneticLines();
        }

        for( var i=0; i < this.foregroundLayer.children.length; i++){
            this.foregroundLayer.children[i].removeMagneticLines();
        }

        for( var i=0; i < this.userLayer.children.length; i++){
            this.userLayer.children[i].removeMagneticLines();
        }

        this.backgroundLayer.children = [];
        this.foregroundLayer.children = [];
        this.userLayer.children = [];

    };


    p.updatePositionInDB = function(){

        this.editor.webSocketControllers.page.savePosition( this.dbID, this.x, this.y );

    };


    p.updateTransformInDB = function(){

        this.editor.webSocketControllers.page.saveRotation( this.dbID, this.rotation );

    };


	/**
	* Dodaje wszystkie obiekty warstwy do sceny - nalezy przeniesc do modulu sceny
	*
	* @method addAllObjects
	*/
	p.addAllObjects = function(){

		for( var key in this.objects ){

			this.editor.stage.addObject( this.objects[ key ] );

		}

		for( var key in this.layers ){

			this.editor.stage.addObject( this.objects[ key ] );

		}

	};


	/**
	* Dodaje pozycje proponowana do elementu.
	*
	* @method addProposedPosition
	* @param {Object} object który ma zostać dodany jako pozycja proponowana
	*/
    p.addProposedPosition = function( object ){



    };


	/**
	* Dodaje tekst do warstwy
	*
	* @method addText
	* @param {Object} object Obiekt reprezentujacy tekst
	*/
	p.addText = function( object ){

		var l = this.editor.stage.getObjectById( MAIN_LAYER );
		this.editor.stage.addObject( object );

		this.objectsOrder.push({ 'type': 't', id : object.id, name: object.name });

		this.objects[object.id] = object;

		// dodajemy obiekt na sam szczyt, pomijając obiekty kompozycji

		this.addChildAt( object, this.getNumChildren() - this.composedObjects.top.length );

	};


	/**
	* Zmienia wartość atrybutu w bazie danych
	*
	* @method DB_setAttribute
	* @param {String} attribute Nazwa zmieniana atrybutu
	* @param {String} value Nowa wartość atrybutu
	* @param {Function} callback Funkcja wykonana po otrzymaniu odpowiedzi z serwera
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
	* Usuwa wsZystkie obiekty warstwy ze sceny - nalezy przeniesc do modulu sceny
	*
	* @method removeObjects
	*/
	p.removeObjects = function(){

		for( var key in this.objects ){

			this.editor.stage.removeObject( key );

		}

		for( var key in this.layers ){

			this.layers[key].removeObjects();

			this.editor.stage.removeObject( key );

		}

	};


    /**
	* Zwraca wszystkie 'prawdziwe' obiekty, pomija obiekty compozycyjne, gdyż nie są one modyfikowalne
	*
	* @method getMainChildren
	*/
    p.getMainChildren = function(){

        var children = [];

        for( var i=this.composedObjects.bottom.length; i<this.children.length-this.composedObjects.top.length; i++ ){

            children.push( this.children[i] );

        }

        return children;

    };


    p.updateWithContentFromDB = function( info ){

        this.x                = parseFloat( info.x ) || 0;
        this.y                = parseFloat( info.y ) || 0;

        this.mask.x =  this.x;
		this.mask.y =  this.y;

    };





    p.cleanTheme = function(){
        /*
        for( var i=0; i < this.backgroundLayer.children.length; i++ ){

            var object = this.backgroundLayer.children[i];
            object.magneticLines.vertical.left.parent.removeChild( object.magneticLines.vertical.left );
            object.magneticLines.vertical.right.parent.removeChild( object.magneticLines.vertical.right );
            object.magneticLines.vertical.center.parent.removeChild( object.magneticLines.vertical.center );
            object.magneticLines.horizontal.top.parent.removeChild( object.magneticLines.horizontal.top );
            object.magneticLines.horizontal.bottom.parent.removeChild( object.magneticLines.horizontal.bottom );
            object.magneticLines.horizontal.center.parent.removeChild( object.magneticLines.horizontal.center );

        }

        for( var i=0; i < this.foregroundLayer.children.length; i++ ){

            var object = this.foregroundLayer.children[i];
            object.magneticLines.vertical.left.parent.removeChild( object.magneticLines.vertical.left );
            object.magneticLines.vertical.right.parent.removeChild( object.magneticLines.vertical.right );
            object.magneticLines.vertical.center.parent.removeChild( object.magneticLines.vertical.center );
            object.magneticLines.horizontal.top.parent.removeChild( object.magneticLines.horizontal.top );
            object.magneticLines.horizontal.bottom.parent.removeChild( object.magneticLines.horizontal.bottom );
            object.magneticLines.horizontal.center.parent.removeChild( object.magneticLines.horizontal.center );

        }
        */
        this.backgroundLayer.removeAllChildren();
        this.foregroundLayer.removeAllChildren();
        this.proposedImagePositions = [];

    };




    p.destroyDropHelper = function(){

        for( var i=0; i < this.dropLayer.children.length; i++ ){

            //console.log( this.dropLayer );
            //console.log( '------------' );

            createjs.Tween.get(this.dropLayer.children[i]).to({ alpha: 0 }, 450, createjs.Ease.quadInOut ).call( function( e ){

                if( e.target.children ){
                    if( e.target.children[0].target ){

                        e.target.children[0].target.showDropingTools();
                    }
                }

                if( e.target.parent ){

                    e.target.parent.removeChild( e.target );

                }


            } );

        }

    };


    p.getGlobalTransformedBounds = function(){

        var o = this;
        var mtx = new createjs.Matrix2D();

        do  {
        // prepend each parent's transformation in turn:
            mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY);
        } while (o = o.parent && o.parent.parent );

        var a = [ 0, 0, 1 ];
        var b = [ this.width, 0, 1 ];
        var c = [ this.width, this.height, 1 ];
        var d = [ 0, this.height, 1 ];

        var aCords = [ a[0]* mtx.a + a[1]*mtx.c + a[2]*mtx.tx, a[0]*mtx.b + a[1]*mtx.d + a[2]*mtx.ty ];
        var bCords = [ b[0]* mtx.a + b[1]*mtx.c + b[2]*mtx.tx, b[0]*mtx.b + b[1]*mtx.d + b[2]*mtx.ty ];
        var cCords = [ c[0]* mtx.a + c[1]*mtx.c + c[2]*mtx.tx, c[0]*mtx.b + c[1]*mtx.d + c[2]*mtx.ty ];
        var dCords = [ d[0]* mtx.a + d[1]*mtx.c + d[2]*mtx.tx, d[0]*mtx.b + d[1]*mtx.d + d[2]*mtx.ty ];

        // pozycja boksa opisjącego ( lewy górny róg)
        var startX = Math.min( aCords[0], bCords[0], cCords[0], dCords[0] );
        var startY = Math.min( aCords[1], bCords[1], cCords[1], dCords[1] );

        // rozmiar boksa opisjącego
        var boxWidth = Math.max( aCords[0], bCords[0], cCords[0], dCords[0] ) - startX;
        var boxHeight = Math.max( aCords[1], bCords[1], cCords[1], dCords[1] ) - startY;

        var bounds = {
            x : startX,
            y : startY,
            width : boxWidth,
            height : boxHeight
        };

        return bounds;

    };


    p.loadImage = function( image, place ){

        var _this = this;
        var Editor = this.editor;

        var newBitmap = new Bitmap(

            'test',
            image.minUrl,
            false,
            true,
            {
                width  : image.width,
                height : image.height,
            }

        );

        newBitmap.img = image.imageUrl;
        newBitmap.minImg = image.miniature;
        newBitmap.collectionReference = image;
        image.addImageReferenceInScene( newBitmap );

        newBitmap.regX = newBitmap.width/2;
        newBitmap.regY = newBitmap.height/2;

        newBitmap.hitArea = new createjs.Shape();
        newBitmap.hitArea.graphics.f('rgba(12,93,89,0.5)').r(0,0, image.width, image.height );

        newBitmap.setBounds(0,0,image.width, image.height);
        //_this.background.visible = false;

        if( place == 'foreground' ){
            _this.foregroundLayer.addChild( newBitmap );
        }
        else if ( place == 'background' ){
            _this.backgroundLayer.addChild( newBitmap );
            //console.log( _this );
        }

        Editor.stage.addObject( newBitmap );

        //newBitmap.mouseEnabled = false;

        newBitmap.setCenterReg();
        newBitmap.center();
        newBitmap.initEvents();
        Editor.stage.initObjectDefaultEvents( newBitmap );
        newBitmap.center();
        newBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );
        newBitmap.setFullSize2();
        //newBitmap.setFullSize();

        /*

        */

    };





	/**
	* Usuwa wsZystkie obiekty z warstwy
	*
	* @method removeAllObjects
	*/
	p.removeAllObjects = function(){
		//console.log('usuwana warstwa');
		//console.log( this.id );

		for( var key in this.objects ){

			var parent = Editor.stage.getObjectById(this.objects[key].parent.id);
			parent.removeChild( this.objects[key]);

			if( this.objects[key].image ){

				this.objects[key].image = null;
				this.objects[key] = null;

			}

			//console.log('usuniety obiekt: ' + key);
			delete this.objects[key];

		}

		//console.log( this.objectsOrder);
		var mainLayer = Editor.stage.getMainLayer();

		for( var key in this.layers ){

			//console.log( "interesujace warstwy" );
			//console.log( this.layers[key] );

			if( this.objectsOrder ){

				for( var i=0; i<this.objectsOrder.length; i++){

					if( this.objectsOrder[i].id != 34 && this.objectsOrder[i].id != 44 ){

						//console.log('usuwam tablice ordersow');
						//console.log( this.objectsOrder);
						delete this.objectsOrder[i];

					}

				}

			}

			this.objectsOrder.length = 0;
			this.layers[key].removeAllObjects();


			if( this.layers[key].id != MAIN_LAYER && this.layers[key].id != mainLayer.id ){

				//this.layers[key].body.removeAllChildren();
				var layerParent = Editor.stage.getObjectById( this.layers[key].parent.id );

				//console.log('warstwa ktora usunelo: ' + key);

				if( layerParent instanceof createjs.Stage ){

					layerParent.removeChild( this.layers[key] );

				}
				else {

					layerParent.removeChild( this.layers[key] );
					delete this.layers[key];

				}

			}

		}

	};


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


	p.moveLayerToOther = function( layerId, destinationLayer ){

		//console.log( layerId + " " + destinationLayer );
		var layer = Editor.stage.getObjectById( layerId );
		var parentLayer = Editor.stage.getObjectById( layer.body.parent.id );
		//alert( layer.body.parent.id );
		var destinationLayer = Editor.stage.getObjectById( destinationLayer );

		//console.log("wartosci przekazane:");
		//console.log( layer );
		//console.log( parentLayer );
		//console.log( destinationLayer );
		//console.log("_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+");

		//console.log("warstwa do usuniecia:");
		Editor.stage.detachLayer( layerId );

	};


	p.detachLayer = function( layer_id ){

		//console.log( 'warstwa do usuniecia');
		//console.log( layer_id );
		var childToRemove = Editor.stage.getObjectById( layer_id );

		for( var i = 0; i < this.objectsOrder.length; i++ ){

			if( this.objectsOrder[i].id == layer_id ){

				this.body.removeChild( childToRemove.body );
				delete this.layers[ this.objectsOrder[i].id ];
				this.objectsOrder.splice(i, 1);

			}

		}

	};


	p.sortArray = function( sortedArray ){

		//console.log("========================================================");
		//console.log( sortedArray );
		//console.log( this.objectsOrder );

		for( var i=0; i < sortedArray.length; i++){

			this.swapObjects( sortedArray[i], this.objectsOrder[i].id  );

		}

	};


	p.removeObject = function( object_id ){

		var childToRemove = Editor.stage.getObjectById( object_id );
		//console.log( childToRemove );
		//console.log( this.objectsOrder );

		for( var i=0; i < this.objectsOrder.length; i++ ){

			if( this.objectsOrder[i].id == object_id  ){

				if( this.objectsOrder[i].type == 'o' ){

					delete this.objects[this.objectsOrder[i].id];

				}
				else if( this.objectsOrder[i].type =='l' ){

					delete this.layers[this.objectsOrder[i].id];

				}

				//console.log( this.objectsOrder );
				this.objectsOrder.splice(i, 1);

				//console.log( this.objectsOrder );

			}

		}

		this.body.removeChild( childToRemove.body );
		//console.log('aktualny obiekt');
		//console.log(this);

	};


	p.getObjectsOrder = function(){
		return this.objectsOrder;
	};


	p.swapObjectBetweenLayers = function( object_id, layer_id ){

		var childToMove = this.editor.stage.getObjectById( object_id );
		this.removeObject( object_id );
		//this.body.removeChild( childToMove.body );
		var layer = this.editor.stage.getLayer( layer_id );

		if( childToMove instanceof Text ){
			layer.addText( childToMove );
		}
		else {
			layer.addObject( childToMove );

		}

	};


    p.usedPhotosLength = function(){

        return this.usedPhotos.length;

    };


    p.addUsedPhoto = function( image ){

        var uid = this.Editor.generateUUID();
        this.usedPhotos[ uid ] = image;

        return uid;

    };


    p.getUsedPhotos = function(){

        return this.usedPhotos;

    };


    p.updateObject = function( width, height, settings ){

        // narazie poprostu odświeżenie widoku
        this.editor.adminProject.format.view.init( this.editor.adminProject.format.view.getId() );

        /*
        var slope = this.settings.slope;
        this.settings = settings;
        this.settings.slope = this.slope;

        if( this.settings.slope ){

            this.slopeShape = new createjs.Graphics();
            // trzeba tutaj przenieść ramkę
            this.slopeShape.c().ss(1*scaleX).s("#fff").mt(1,1).lt(width-1, 1).lt(width-1, height-1 ).lt(1, height-1).cp();
            this.slopeShape.ss(1*scaleX).s("#F00").mt( this.settings.slope, this.settings.slope).lt(width-(this.settings.slope), this.settings.slope).lt( width-( this.settings.slope ), height-( this.settings.slope ) ).lt( this.settings.slope, height - (this.settings.slope)).cp().es();
            this.slopeShape.f("rgba(0, 0, 0, 0.34)").r(0,0, width, this.settings.slope).r(width -this.settings.slope, this.settings.slope, this.settings.slope, height - this.settings.slope).r( 0, height - this.settings.slope, width -this.settings.slope, this.settings.slope).r(0, this.settings.slope, this.settings.slope, height-(this.settings.slope*2));
            this.slopeShape = new createjs.Shape( this.slopeShape );

        }
        else {

            this.slopeShape = new createjs.Graphics();
            this.slopeShape.c().ss(2*scaleX).s("#00d1cd").mt(1,1).lt(width-1, 1).lt(width-1, height-1 ).lt(1, height-1).cp();
            this.slopeShape = new createjs.Shape( this.slopeShape );

        }

        this.borderShape = new createjs.Shape();
        this.borderShape.graphics.c().s("#00d1cd").mt(1,1).lt(width-1, 1).lt(width-1, height-1 ).lt(1, height-1).cp();

        this.backgroundHolder = new createjs.Shape();
        this.backgroundHolder.graphics.c().f('rgba(255,255,255,0.6)').r(0,0,this.width, this.height);
        */

    };


	p.addObject = function( object, index ){

		this.editor.stage.addObject( object );
		this.objects[object.id] = object;
		this.objectsOrder.push({ 'type': 'o', id : object.id, name: object.name });

		//console.log("miejsce dodania obiektu");
		//console.log( index );

		if( index != undefined ){

			this.addChildAt( object, index);

		}
		else {

			this.addChildAt( object, this.getNumChildren() - this.composedObjects.top.length );

		}

		return object.id;

	};



	p.addLayer = function( layer ){

		this.layers[layer.id] = layer;
		this.objectsOrder.push( { 'type':'l', name: layer.name, id: layer.id } );

	};


	p.HTMLoutput = function(){

		var outHTML = "";
		outHTML += "<li  data-id='"+this.id+"' ><span class='li-button group-list' data-base-id='" + this.dbId + "' data-id='"+this.id+"'>";
		outHTML += "<span class='visibility"+(( this.visible)? " active" : " un-active" )+"' data-id='"+ this.id +"' data-base-id='" + this.dbId + "'></span>\
			    <span class='group'></span><span class='object-name'>"+this.name+ " " + this.id+" </span>\
			    <span data-id='"+ this.id +"' data-base-id='" + this.dbId + "' class='locker"+((this.mouseEnabled )? " active" : " un-active" )+"'></span>";
		outHTML += "<span class='remover' data-id="+ this.id +">x</span></span>";

		var num =  this.getNumChildren();

		//console.log( this.id );
		//console.log("ilosc dzieci: " + num );

		//console.log("____________________________________________");

		var compoundsCount = this.composedObjects.top.length + this.composedObjects.bottom.length;

		outHTML += '<ul class="sortArea '+(( this.getNumChildren() == compoundsCount) ? "empty": "" )+'">';

		// nie bierzemy pod uwage ostatniego dziecka ( jest to plane/background panelu edycyjnego! )
		for( var i=num-1; i > 0; i-- ){

			var object = this.getChildAt(i);
			object = Editor.stage.getObjectById( object.id );

			if( object ){

				outHTML += object.HTMLoutput();

			}

		}

		outHTML += "</ul>";
		outHTML += "</li>";

		return outHTML;

	};


	p.getSortArray = function( ){

		var array = [];

		for( var i =0; i < this.getNumChildren(); i++ ){

			array.push( this.getChildAt( i ).id );

		}

		return array;

	};


	p.updatePositions = function(){

	};


    /**
	* Zwraca budulec obiektu
	*
	* @method getObjectTimber
	*/
    p.getObjectTimber = function(){

        var _this = this;

        return {

            width            : _this.trueWidth,
            height           : _this.trueHeight,
            objectType       : _this.type,
            position         : [ _this.x, _this.y ],
            name             : _this.name,
            slope            : _this.settings.slope,
            rotation         : _this.rotation,
            type             : _this.pageType,
            order            : _this.order

        };

    };


    p.setPageOrder = function( order ){

        this.order = order;

    };


    /**
	* Generuje
	*
	* @method generateThemePagePreview
	*/
    p.generateThemePagePreview = function(){



    };


    /**
	* Powodouje update informacji w bazie danych na temat obiektu
	*
	* @method updateInDB
	*/
    p.updateInDB = function(){

        $.ajax({

			url: this.editor.currentUrl + "page/" + this.dbID,
			type: "PUT",

			crossDomain: true,

			data : this.getObjectTimber(),
			success : function( data ){



			},
			error : function( data ){


			}

		});

    };

    p.toLayerHTML = function(){

        var Editor = this.editor;

        var backgroundLayer = this.backgroundLayer.children;
        var usergroundLayer = this.userLayer.children;
        var foregroundLayer = this.foregroundLayer.children;

        var allLayersChildren = backgroundLayer.concat( usergroundLayer.concat( foregroundLayer ) );

        var _this = this;

        var html = document.createElement('li');

        this.layerElement = html;

        html.addEventListener('click', function( e ){

            e.stopPropagation();

            if ( $("#editorLayers li").hasClass("layerSelected") ){

                    $("#editorLayers li").removeClass("layerSelected");
            }

            $(this).addClass("layerSelected");

            var object = Editor.stage.getObjectById( this.getAttribute( 'data-local-id' ) );

            _this.editor.tools.setEditingObject( this.getAttribute( 'data-local-id' ) );
            _this.editor.tools.init();


        });

        var visibility = document.createElement('span');
        visibility.className = 'objectVisibility ' + ( ( _this.visible ) ? 'visible' : 'notvisible' );

        visibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(this).hasClass('visible') ){

                this.className = 'objectVisibility notvisible';
                _this.visible = false;

            }
            else {

                this.className = 'objectVisibility visible';
                _this.visible = true;

            }

        });

        var name = document.createElement('span');
        name.className = 'objectName';
        name.innerHTML = this.name;

        var miniature = document.createElement('span');
        miniature.className = 'objectMiniature';
        miniature.style.backgroundColor = 'rgba(12,93,89,0.5)';

        var group = document.createElement('ul');
        var foregroundLayer = document.createElement('li');

        var foregroundVisibility = document.createElement('span');
        foregroundVisibility.className = 'objectVisibility shown ' + ( ( _this.foregroundLayer.visible ) ? 'visible' : 'notvisible' );

        foregroundVisibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( _this.foregroundLayer.visible ){
                _this.foregroundLayer.visible = false;
                foregroundVisibility.className = 'objectVisibility ' + ( ( _this.foregroundLayer.visible ) ? 'visible' : 'notvisible' );
            }
            else {
                _this.foregroundLayer.visible = true;
                foregroundVisibility.className = 'objectVisibility ' + ( ( _this.foregroundLayer.visible ) ? 'visible' : 'notvisible' );
            }

        });

        var backgroundVisibility = document.createElement('span');
        backgroundVisibility.className = 'objectVisibility ' + ( ( _this.backgroundLayer.visible ) ? 'visible' : 'notvisible' );
        backgroundVisibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( _this.backgroundLayer.visible ){
                _this.backgroundLayer.visible = false;
                backgroundVisibility.className = 'objectVisibility ' + ( ( _this.backgroundLayer.visible ) ? 'visible' : 'notvisible' );
            }
            else {
                _this.backgroundLayer.visible = true;
                backgroundVisibility.className = 'objectVisibility ' + ( ( _this.backgroundLayer.visible ) ? 'visible' : 'notvisible' );
            }

        });

        var foregroundTitle = document.createElement('span');
        foregroundTitle.className = 'objectName';
        foregroundTitle.innerHTML = 'foreground';

        foregroundLayer.appendChild( foregroundVisibility );
        foregroundLayer.appendChild( foregroundTitle );

        var backgroundLayer = document.createElement('li');

        var backgroundTitle = document.createElement('span');
        backgroundTitle.className = 'objectName';
        backgroundTitle.innerHTML = 'background';

        backgroundLayer.appendChild( backgroundVisibility );
        backgroundLayer.appendChild( backgroundTitle );

        group.appendChild( _this.foregroundLayer.toLayerHTML() );
        group.appendChild( _this.userLayer.toLayerHTML() );
        group.appendChild( _this.backgroundLayer.toLayerHTML() );


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

        html.appendChild( visibility );
        html.appendChild( name );
        html.appendChild( miniature );
        html.appendChild( layerHideButton );
        html.appendChild( group );

        return html;

    };

	export { EditableArea };
