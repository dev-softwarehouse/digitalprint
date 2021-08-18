var _ = require('lodash');

var EditorObject_extend = EDITOR_ENV.user ? require('./EditorObject_user').EditorObject_user : require('./EditorObject_admin').EditorObject_admin;

import EditorShadow2 from './EditorShadow2';

//import {LeftMagneticRuler} from './LeftMagneticRuler';

/**
* Klasa reprezentująca obiekt w Edytorze.
*
* @class EditorObject
* @constructor
*/

function EditorObject( initEvents, settings, container ){

    var that = this;
	var settings = settings || {};

    createjs.Container.call( this );
    //this.editor = null;
	this.tools;
	this.isBlocked = false;
	this.type = null;
	this.rotation      = settings.rotation || 0;
    this.trueWidth     = this.width  = settings.width || 10;
    this.trueHeight    = this.height = settings.height || 10;
    this.scaleX        = settings.scaleX || 1;
    this.scaleY        = settings.scaleY || 1;
    this.dbID          = settings.dbID;
    this.dbId          = settings.dbID;
    this.shadowBlur    = settings.shadowBlur || 5;
    this.shadowColor   = settings.shadowColor || 'rgba(0,0,0,255)';
    this.shadowOffsetX = settings.shadowOffsetX || 0;
    this.shadowOffsetY = settings.shadowOffsetY || 0;
    this._dropShadow   = settings.dropShadow || false;
    this.displaySimpleBorder  = settings.displaySimpleBorder || false;
    this.borderColor   = settings.borderColor || '#000';
    this.borderWidth   = settings.borderWidth || 0;
    this.name          = name;
    this.snapToPixel   = true;
    this.uid           = null;
    this.toolsBox      = null;
    this.x             = settings.x || 0;
    this.y             = settings.y || 0;
    this.layerElement  = null;

    this.moveVector = {

        start : null,
        stop : null

    };

    if( !container){
    	this.addChild( this.customShadow );
    }

    this.borderLayer = new createjs.Container();
    this.mainLayer = new createjs.Container();
    this.shadowLayer = new createjs.Container();
    this.backgroundFrameLayer = new createjs.Container();
    this.addChild( this.shadowLayer );
    this.addChild( this.backgroundFrameLayer );
    this.addChild( this.mainLayer );
    // simpleborder
    this.simpleBorder = new createjs.Shape();
    this.simpleBorder.graphics.f( this.borderColor ).
        r( -this.borderWidth/this.scaleX, -this.borderWidth/this.scaleY, this.width + this.borderWidth/this.scaleX, this.borderWidth/this.scaleY ).
        r( this.width, -this.borderWidth/this.scaleY, this.borderWidth/this.scaleX, this.height + this.borderWidth/this.scaleY ).
        r( 0, this.height, this.width + this.borderWidth/this.scaleX, this.borderWidth/this.scaleY ).
        r( -this.borderWidth/this.scaleX, 0, this.borderWidth/this.scaleX, this.height + this.borderWidth/this.scaleY );


    if( !this.displaySimpleBorder )
        this.simpleBorder.visible = false;

    this.history_tmp;

    if( initEvents ){

      this.initEvents();

    }

    this.addEventListener('destroyBitmap', function( e ){

        //alert('destroyBitmap: ' + e.uid );

    });


    if( this.simpleBorder && !container ){

        this.addChild( this.simpleBorder );

    }
    this.addChild( this.borderLayer );

};


var p = EditorObject.prototype = $.extend( true, {}, new Object( createjs.Container.prototype ), new Object( EditorObject_extend.prototype ) );

p.constructor = EditorObject;


p.defaultSettings = function(){

    // Editor.getDefaultImagesSettings
    if( this._dropShadow ){

        this.unDropShadow();

    }

    if( this.displaySimpleBorder ){

        this.unDropBorder();

    }

};

p.setBorderWidth = function( width, save ){

    this.borderWidth = width;

    if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                borderWidth: width
            }

        );

	}

};


p.updateTransformInDB = function(){

    this.editor.webSocketControllers[ this.socketController ].setTransform( this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.dbID );

};


p.setRotation = function( rotation ){

	this.rotation = rotation;

	if( this.mask ){
		this.mask.rotation = parseInt(rotation);
	}

};


p.setRotationValue = function( rotation, save ){

    this.tempRotation = rotation;

	if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                rotation: rotation
            }

        );

	}

};


p.unDropShadow = function( save ){

	this.shadowLayer.removeChild( this.customShadow );
	this.customShadow = null;
	this._dropShadow = false;

    /*
	if( save ){

    	Editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            Editor.adminProject.format.view.getId(),
            {
                dropShadow: false
            }

        );

	}
    */

};


p.dropBorder = function( save ){

    if(this.simpleBorder)
        this.simpleBorder.visible = true;
    this.displaySimpleBorder = true;
    /*
    if( save ){

    	Editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            Editor.adminProject.format.view.getId(),
            {
                displaySimpleBorder: true
            }

        );

    }
    */

};


p.unDropBorder = function( save ){

	this.displaySimpleBorder = false;
    if(this.simpleBorder)
        this.simpleBorder.visible = false;

    /*
    if( save ){

    	Editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            Editor.adminProject.format.view.getId(),
            {
                displaySimpleBorder: false
            }

        );

    }
    */
};


p.setShadowBlur = function( blur, save ){

    this.shadowBlur = blur;
	//this.customShadow.updateShadow( this, this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY );

    if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                shadowBlur: blur
            }

        );

	}

};

p.setShadowColor = function( color, save ){

	this.shadowColor = color;
    //this.updateShadow();

    if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                shadowColor: color
            }

        );

	}

};


p.setShadowOffsetX = function( posX, save ){

	this.shadowOffsetX = posX;
	//this.customShadow.setOffsetX( posX );

    if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                shadowOffsetX: posX
            }

        );

	}

};


p.setShadowOffsetY = function( posY, save ){

	this.shadowOffsetY = posY;
	//this.customShadow.setOffsetY( posY );

    if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                shadowOffsetY: posY
            }

        );

	}

};


p.updateShadow = function( ){

	if( this.customShadow ){

		this.customShadow.updateShadow( this, this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY );

    }

};


p.setBorderColor = function( color, save ){

    this.borderColor = color;
    this.updateSimpleBorder();

    if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                borderColor: color
            }

        );

	}

};


p.dropShadow = function( save ){

    var Editor = this.editor;

	if ( this._dropShadow == false ){

    	this.customShadow = new EditorShadow2( this, this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY, 4 );
    	this.shadowLayer.addChildAt( this.customShadow, 0 );
        this._dropShadow = true;

	}

	if( save ){

    	this.editor.webSocketControllers[ this.socketController ].setAttributes(

            this.dbID,
            this.editor.adminProject.format.view.getId(),
            {
                dropShadow: true
            }

        );

	}

};


p.updateSimpleBorder = function(){

    this.simpleBorder.graphics.c().f( this.borderColor ).
        r( 0, 0, this.width - this.borderWidth/this.scaleX, this.borderWidth/this.scaleY ).
        r( this.width- this.borderWidth/this.scaleX, 0, this.borderWidth/this.scaleX, this.height - this.borderWidth/this.scaleY ).
        r( this.borderWidth/this.scaleX, this.height - this.borderWidth/this.scaleY, this.width - this.borderWidth/this.scaleX, this.borderWidth/this.scaleY ).
        r( 0, this.borderWidth/this.scaleY, this.borderWidth/this.scaleX, this.height - this.borderWidth/this.scaleY );

    if( this._dropShadow ){

    	this.updateShadow();

    }

};


/**
* Zwraca prawdziwy wymiar skali, biorąc pod uwagę skalę rodziców
*
* @method getTrueScale
* @return {Object}
*/
p.getTrueScale = function(){

	var scaleX = 1;
	var scaleY = 1;

	var parent = this;

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


/**
* Zwraca prawdziwą wartość rotacji
*
* @method getTrueRotation
* @return {Float}
*/
p.getTrueRotation = function(){

	var rotation = 0;

	var parent = this;

	while( parent ){

		rotation += parent.rotation;

		parent = parent.parent;

	}

	return rotation;

};


p.updateMagneticLines = function(){
    return;
    if( this.magneticLines ){

        var bounds = this.getGlobalTransformedBounds();

        this.magneticLines.vertical.left.x = bounds.x;
        this.magneticLines.vertical.right.x = bounds.x +bounds.width;
        this.magneticLines.vertical.center.x = bounds.x +(bounds.width/2);
        this.magneticLines.horizontal.top.y = bounds.y;
        this.magneticLines.horizontal.bottom.y = bounds.y + bounds.height;
        this.magneticLines.horizontal.center.y = bounds.y + bounds.height/2;

    }

};



p.checkMagneticLines = function( left, centerVertical, right, top, bottom, centerHorizontal ){

   	if( this.magneticLines ){

        if( centerHorizontal ){
            this.magneticLines.horizontal.center.getClosestLine();
        } else {
            this.magneticLines.horizontal.center.visible = false;
            this.magneticLines.horizontal.center.closestLine = null;
        }

        if( left ){
            this.magneticLines.vertical.left.getClosestLine();
        } else {
            this.magneticLines.vertical.left.visible = false;
            this.magneticLines.vertical.left.closestLine = null;
        }

        if( centerVertical ){
            this.magneticLines.vertical.center.getClosestLine();
        } else {
            this.magneticLines.vertical.center.visible = false;
            this.magneticLines.vertical.center.closestLine = null;
        }

        if( right ){
            this.magneticLines.vertical.right.getClosestLine();
        } else {
            this.magneticLines.vertical.right.visible = false;
            this.magneticLines.vertical.right.closestLine = null;
        }

        if( top ){
            this.magneticLines.horizontal.top.getClosestLine();
        } else {
            this.magneticLines.horizontal.top.visible = false;
            this.magneticLines.horizontal.top.closestLine = null;
        }

        if( bottom ){
            this.magneticLines.horizontal.bottom.getClosestLine();
        } else {
            this.magneticLines.horizontal.bottom.visible = false;
            this.magneticLines.horizontal.bottom.closestLine = null;
        }


        var closestVerticalAlign = null;
        var closestHorizontalAlign = null;

        for( var line in this.magneticLines.vertical ){

            var line = this.magneticLines.vertical[line];

            if( closestVerticalAlign && line.closestLine ){

                if( Math.abs( closestVerticalAlign.x - closestVerticalAlign.closestLine.x ) > Math.abs( line.x - line.closestLine.x )){
                    closestVerticalAlign = line;
                }

            }
            else if( line.closestLine ){

                closestVerticalAlign = line;

            }

        }

        if( closestVerticalAlign )
            closestVerticalAlign.magnetizeObject();



        for( var line in this.magneticLines.horizontal ){

            var line = this.magneticLines.horizontal[line];

            if( closestHorizontalAlign && line.closestLine ){

                if( Math.abs( closestHorizontalAlign.y - closestHorizontalAlign.closestLine.y ) > Math.abs( line.y - line.closestLine.y )){
                    closestHorizontalAlign.visible = closestHorizontalAlign.closestLine.visible = false;
                    closestHorizontalAlign = line;
                }

            }
            else if( line.closestLine ){

                closestHorizontalAlign = line;

            }

        }

        if( closestHorizontalAlign )
            closestHorizontalAlign.magnetizeObject();

    }

};


p.getWindowsBounds = function(){

	var bounds = this.getGlobalTransformedBounds();
	bounds.width = bounds.width * this.editor.getStage().scaleX;
	bounds.height = bounds.height * this.editor.getStage().scaleY;

	return bounds;

};


/**
* Mnoży aktualną skalę przez podaną wartość
*
* @method multiplyScaleBy
* @return {Float} multiplyValue Wartość przez którą zostanie pomnożona skala
*/
p.multiplyScaleBy = function( multiplyValue ){

	this.scaleX *= multiplyValue;
	this.scaleY *= multiplyValue;

	this.width  = this.trueWidth*this.scaleX;
	this.height = this.trueHeight*this.scaleY;

};


/**
* Przybiliza obiekt dopasowujac go do ekranu.
*
* @method getRealScale
* @return {Object}
*/
p.getRealScale = function(){

	var scaleX = 1;
	var scaleY = 1;

	var tmpX = this.editor.getStage().scaleX;
	var tmpY = this.editor.getStage().scaleY;

	var parent = this;

	while( parent ){

		scaleX *= parent.scaleX;
		scaleY *= parent.scaleY;
		parent = parent.parent;

		if( !parent.parent )
			parent = parent.parent;

	}

	var offset = 80;
	var destinationMaxWidth = this.editor.getCanvas().width() - offset;
	var destinationMaxHeight = this.editor.getCanvas().height() - offset;
	var maxSize = 0;

		maxSize = destinationMaxHeight;

	var maxHeight = destinationMaxHeight;
	var maxWidth  = destinationMaxWidth;

	var windowPosition = {
		x : (( this.editor.getCanvas().width() - maxSize )/2),
		y : (( this.editor.getCanvas().height() -maxSize )/2)
	};

	var that = this;

	var test = maxSize/(that.trueHeight * scaleX)/50 + tmpX;

	var posG = this.localToLocal( this.regX, this.regY, this.editor.getStage() );

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

	if( this.trueWidth < this.trueHeight ){

		if( test > maxSize/(that.trueHeight * scaleX)){

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

	return { sx: scaleX, sy: scaleY };

};


p.showMagneticLines = function( top, bottom, left, right, center, centerHorizontal ){
    return;
   	if( this.magneticLines ) {

        if( right ){
            this.magneticLines.vertical.right.visible = true;
        }
        else {
            this.magneticLines.vertical.right.visible = false;
        }

        if( left ){
            this.magneticLines.vertical.left.visible = true;
        }
        else {
           this.magneticLines.vertical.left.visible = false;
        }

        if( bottom ){
            this.magneticLines.horizontal.bottom.visible = true;
        }
        else {
           this.magneticLines.horizontal.bottom.visible = false;
        }

        if( top ){
            this.magneticLines.horizontal.top.visible = true;
        }
        else {
            this.magneticLines.horizontal.top.visible = false;
        }

        if( center ){
            this.magneticLines.vertical.center.visible = true;
        }
        else {
            this.magneticLines.vertical.center.visible = false;
        }

        if( centerHorizontal ){
            this.magneticLines.horizontal.center.visible = true;
        }
        else {
            this.magneticLines.horizontal.center.visible = false;
        }

	}

};


/**
* Wektor przesuniecia obiektu
*
* @method moveByVector
* @param {Array} vector [x,y]
*/
p.moveByVector = function( vector ){

	this.x += vector[0];
	this.y += vector[1];

	if( this.mask ){

		this.mask.x += vector[0];
		this.mask.y += vector[1];

	}

};


/**
* Ustala nową szerokość obiektu - przedstawianą jako skala
*
* @method setWidth
* @param {Int} Wysokość obiektu
*/
p.setWidth = function( w ){

	//this.width = w;
	this.scaleX = 1/this.width * w;

	if( this.mask ){

		this.mask.scaleX = 1/this.width *w;

	}

	if( this.updateSimpleBorder ){

		this.updateSimpleBorder();

	}

};


/**
* Ustala wysokość obiektu
*
* @method setHeight
* @param {Int} h Nowa wysokość
*/
p.setHeight = function( h ){

	//this.height = h;

	this.scaleY = 1/this.height * h;

	if( this.mask ){

		this.mask.scaleY = 1/this.height *h;

	}

	if( this.updateSimpleBorder ){

		this.updateSimpleBorder();

	}

};


/**
* Ustala nową szerokość przedstawianą jako trueWidth ( skala pozostaje nie naruszona )
*
* @method setTrueWidth
* @param {Int} w Szerokość obiektu
* @param {Bool} blockLeftCornerPosition zatrzzymuje pozycje obiektu względem lewego górnego rogu
*/
p.setTrueWidth = function( w, blockLeftCornerPosition ){

    var widthBefore = this.width;

	this.trueWidth = w;
	this.width = w * this.scaleX;
	this.regX = w/2;

	if( this.mask ){

		this.mask.regX = this.regX;

	}

    if( blockLeftCornerPosition ){
        var vector = (this.width - widthBefore)/2;
        this.x += vector;
    }

};


p.getEditableSiblings = function(){

	var allSiblings = this.getFirstImportantParent().children;

	var siblingsArray = [];

	for( var i=0; i < allSiblings.length; i++ ){

		if( allSiblings[i] instanceof Layer || allSiblings[i] instanceof EditableArea ){

		}
		else {

			siblingsArray.push( allSiblings[i]);

		}

	};

};


p.getFirstImportantParent = function(){

	let parent = this.parent;
    while (parent) {
        if (this.editor.importantParents) {
            for (var i = 0; i < this.editor.importantParents.length; i++) {
                if (parent instanceof this.editor.importantParents[i])
                    return parent;
            }
        }
        parent = parent.parent;
    }

};


/**
* Ustala nową wysokość przedstawianą jako trueWidth ( skala posostaje nie narszona )
*
* @method setTrueHeight
* @param {Int} h Wysokość obiektu
* @param {Bool} blockLeftCornerPosition zatrzzymuje pozycje obiektu względem lewego górnego rogu
*/
p.setTrueHeight = function( h, blockLeftCornerPosition ){

    var heightBefore = this.height;

	this.trueHeight = h;
	this.height = h * this.scaleX;
	this.regY = h/2;

	if( this.mask ){

		this.mask.regY = this.regY;

	}

    if( blockLeftCornerPosition ){

        var vector = (this.height - heightBefore)/2;
        this.y -= vector;

    }

};

p.moveToToolsLayer = function( callback ){

    this.xBefore = this.x;
    this.yBefore = this.y;
    this.orderBefore = this.parent.getChildIndex( this );
    this.parentBefore = this.parent;
    this.parentPage = this.getFirstImportantParent();


    var loc = this.parent.localToLocal( this.x, this.y, this.editor.getStage() );
    this.x = loc.x;
    this.y = loc.y;

    if( this.mask ){

        this.mask.x = loc.x;
        this.mask.y = loc.y;

    }

    this.editor.stage.getToolsLayer().addChild( this );

};

p.backFromToolsLayer = function( position ){

    if( position ){

        this.x = this.xBefore;
        this.y = this.yBefore;

        if( this.mask ){

            this.mask.x = this.xBefore;
            this.mask.y = this.yBefore;

        }

    }

    this.parentBefore.addChildAt( this, this.orderBefore );
    this.parentBefore = null;

};

/**
* Ustala skalę obiektu.
*
* @method setScale
* @param {Float} scaleValue skala obiektu
*/
p.setScale = function( scaleValue ){

	this.scaleX = this.scaleY = scaleValue;
	this.width  = this.trueWidth*scaleValue;
	this.height = this.trueHeight*scaleValue;

};


/**
* Ustawiamaksymallny rozmiar obiektu względem parenta.<br>
* <b>UWAGA! Rodzic musi mieć ustaone wymiary!</b>
* <br>Obiekt zostaje równomiernie przeskalowany.
*
* @method setFullSize
*/
p.setFullSize = function(){

	var widthTo = this.parent.trueWidth;
	var heightTo = this.parent.trueHeight;

	if( this.rotation%180 != 90 ){

		if( this.width <  this.parent.width ){

			var scaleValue = widthTo/this.trueWidth;

			this.scaleX = scaleValue;
			this.scaleY = scaleValue;
			this.width  = this.trueWidth*scaleValue;
			this.height = this.trueHeight*scaleValue;

		}
		else if( this.height < this.parent.height ){

			var scaleValue = heightTo/this.trueHeight;
			this.scaleX = scaleValue;
			this.scaleY = scaleValue;
			this.width  = this.trueWidth*scaleValue;
			this.height = this.trueHeight*scaleValue;

		}

	}else {

		if( this.width < this.parent.height ){

			var scaleValue = heightTo/this.trueWidth;

			this.scaleX = scaleValue;
			this.scaleY = scaleValue;
			this.width  = this.trueWidth*scaleValue;
			this.height = this.trueHeight*scaleValue;

		}
		else if( this.height < this.parent.width ){

			var scaleValue = widthTo/this.trueHeight;

			this.scaleX = scaleValue;
			this.scaleY = scaleValue;
			this.width  = this.trueWidth*scaleValue;
			this.height = this.trueHeight*scaleValue;

		}

	}

};


p.setFullSize2 = function(){

	var widthTo = this.parent.width;
	var heightTo = this.parent.height;

	if( this.width > this.height )
		var scaleValue = widthTo/this.width;
	else
		var scaleValue = heightTo/this.height;

	this.scaleX = scaleValue;
	this.scaleY = scaleValue;

	if( this.width*this.scaleX <  this.parent.width ){

		var scaleValue = widthTo/this.width;

		this.scaleX = scaleValue;
		this.scaleY = scaleValue;

	}
	else if( this.height*this.scaleY < this.parent.height ){

		var scaleValue = heightTo/this.height;
		this.scaleX = scaleValue;
		this.scaleY = scaleValue;

	}

};


/**
* Zwraca lokalny obiekt informujacy o histori transformacji
*
* @method getHistoryElem
* @param {Object} Wysokość obiektu
*/
p.getHistoryElem = function( elem ){

	return this.history_tmp;

};


/**
* Wykonuje rotacje na oobiekcie
*
* @method rotate
* @param {Int} rotation
*/
p.rotate = function( rotation ){

	var editing_id = this.editor.tools.getEditObject();
    var editingObject = this.editor.stage.getObjectById( editing_id );


	this.rotation += rotation || 0;

	try{
		document.getElementById('setRotationInput').value = parseInt((editingObject.rotation % 360)).toFixed(0);
	}catch(e){}


	if( this.mask ){

		this.mask.rotation += rotation;

	}

    if( this.reactChange ){

        this.reactChange();

    }

};


/**
* Ustala nową pozycję obiektu
*
* @method setPosition
* @param {Int} x Pozycja x
* @param {Int} y Pozycja y
*/
p.setPosition = function( x, y ){

		this.x = x;
		this.y = y;

		if( this.mask ){

			this.mask.x = x;
			this.mask.y = y;

		}

        if( this.contextMenu ){

            this.contextMenu._updateToolsBoxPosition();

        }

};


/**
* Ustala nową pozycję obiektu, podane wartości wskazuja na lewy górny róg
*
* @method setPosition_leftCorner
* @param {Int} x Pozycja x
* @param {Int} y Pozycja y
*/
p.setPosition_leftCorner = function( x, y ){

	var bounds = this.getTransformedBounds();

	bounds = bounds || { width:0, height:0 };

    this.x = x + ( bounds.width )/2;
    this.y = y + ( bounds.height )/2;

    if( this.mask ){

        this.mask.x = x + ( bounds.width  ) / 2;
        this.mask.y = y + ( bounds.height  ) / 2;

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
* Zmienia blokowanie eventów obiektu
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
* Ustawia punkt rotacji w centrum obiektu
*
* @method setCenterReg
*/
p.setCenterReg = function(){

	if( this.regX == 0 || !this.regX ){

		this.regX = this.trueWidth/2;
		this.regY = this.trueHeight/2;
		var pos = this.localToLocal( this.trueWidth, this.trueHeight, this.parent);
		this.x = pos.x;
		this.y = pos.y;

        if( this.mask ){

            this.mask.x = pos.x;
            this.mask.y = pos.y;
            this.mask.regX = this.trueWidth/2;
            this.mask.regY = this.trueHeight/2;

        }

	}

};


/**
* Centruje obiekt względem jego rodzica
*
* @method center
*/
p.center = function(){

	var parent = this.parent;



	this.x = parent.width/2;
	this.y = parent.height/2;

    if( this.mask ){

        this.mask.x = this.x;//* 1/scaleX;
        this.mask.y = this.y;// * 1/scaleY;

    }

};


/**
* Centruje obiekt względem jego rodzica, tylko na osi X
*
* @method centerX
*/
p.centerX = function(){

	var parent = this.parent;
	this.x = parent.width/2;

};


/**
* Centruje obiekt względem jego rodzica, tylko na osi Y
*
* @method centerX
*/
p.centerY = function(){

	var parent = this.parent;
	this.y = parent.height/2;

};


p.customHitTest = function( stageX, stageY ){

	this.globalToLocal( stageX, stageY );

};


p.toLayerHTML = function(){

	var _this = this;

	var layerElem = document.createElement('li');
	layerElem.addEventListener('click', function( e ){

		e.stopPropagation();

	});

    var layerVisibility = document.createElement('span');
    layerVisibility.className = 'objectVisibility ' + ( ( this.visible ) ? 'visible' : 'notvisible' );

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
    layerElem.appendChild( layerVisibility );
    layerElem.appendChild( layerElemTitle );

    return layerElem;

};


p.setGlobalPosition = function( x, y ){

    var pos = this.globalToLocal( x, y,  this.parent );
    this.x = pos.x;
    this.y = pos.y;

};


/**
* Zwraca globalną pozycję obiektu.
*
* @method getGlobalPosition
* @return {Array}
*/
p.getGlobalPosition = function(){

	var x,y = 0;
	var main = this.editor.stage.getObjectById( MAIN_LAYER );

	var pos = this.localToGlobal( this.regX, this.regY );

	x = pos.x;
	y = pos.y;

	return [x,y];

};


/**
* Zwraca lokalną pozycję lewego górnego rogu obiektu
*
* @method getLeftTopCornerPosition
* @return {Array}
*/
p.getLeftTopCornerPosition = function(){

    return [ this.x - this.trueWidth/2, this.y - this.trueHeight/2 ];

};


/**
* Zapisuje transformację obiektu w bazie danych
*
* @method saveTransformation
*/
p.saveTransformation = function(){

	var o = this;
	var obj = this;

	var transformations = {

		rotation : o.rotation,
		x : o.x,
		y : o.y,
		sX : o.scaleX,
		sY : o.scaleY,
		tw : obj.trueWidth,
		th : obj.trueHeight,
		w : obj.width,
		h : obj.height,
		rX : o.regX,
		rY : o.regY

	};

	obj.updateInDB( "matrix", JSON.stringify( transformations ) );

};


/**
* Aktualizuje rozmiar biorąc pod uwagę skalę wszystkich rodziców.
*
* @method _updateSize
* @protected
*/
p._updateSize = function(){

	var ts = this.getTrueScale();

	this.height = this.trueHeight * ts.y;
	this.width = this.trueWidth * ts.x;

};


/**
* Zapisuje transformację obiektu w bazie danych
*
* @method updateInDB
*/
p.updateInDB = function( key, value){

	var project_id  = this.editor.getProjectId();

	var layer_id = this.editor.stage.getObjectById( this.id ).dbId;

	$.ajax({

		url: 'https://api.digitalprint9.pro/adminProjects/'+project_id+'/adminProjectLayers/'+layer_id+'/adminProjectObjects/'+this.dbId,
		type: "POST",
		headers: {
			'x-http-method-override' : "patch"
		},
		crossDomain: true,
		contentType: 'application/json',
		data :"{ \"" +key+ "\" : " +value+ "}",
		success : function( data ){

		},
		error : function( data ){

		}

	});

};


// to musi byc tylko dla administratora
p.isInEditableArea = function(){

    var parent = this.parent;

    while( parent ){

        if( parent instanceof EditableArea )
            return true;



        parent = parent.parent;

    }

    return false;

};

p.removeMagneticLines = function(){

    /*
    this.magneticLines.vertical.left.parent.removeChild( this.magneticLines.vertical.left );
    this.magneticLines.vertical.right.parent.removeChild( this.magneticLines.vertical.right );
    this.magneticLines.vertical.center.parent.removeChild( this.magneticLines.vertical.center );
    this.magneticLines.horizontal.top.parent.removeChild( this.magneticLines.horizontal.top );
    this.magneticLines.horizontal.bottom.parent.removeChild( this.magneticLines.horizontal.bottom );
    this.magneticLines.horizontal.center.parent.removeChild( this.magneticLines.horizontal.center );
    */

};

p.prepareMagneticLines = function( tolerance ){

    var tb = this.getTransformedBounds();
    var globalBounds = this.getGlobalTransformedBounds();

    this.magneticLines = {
        vertical : {},
        horizontal : {}
    };

    /*
    var topLine = new Editor.EditorRullerHelper_Horizontal();
    topLine.y = globalBounds.y;

    var bottomLine = new Editor.EditorRullerHelper_Horizontal();
    bottomLine.y = globalBounds.y + globalBounds.height;
    */

    /* to będzie trzeba od komentować
    var leftLine = new LeftMagneticRuler( tolerance );
    leftLine.x = globalBounds.x;
    leftLine.object = this;

    var rightLine = new RightMagneticRuler( tolerance );
    rightLine.x = globalBounds.x + globalBounds.width;
    rightLine.object = this;

    var centerLine = new CenterMagneticRuler( tolerance );
    centerLine.x = globalBounds.x + globalBounds.width/2;
    centerLine.object = this;

    var topLine = new TopMagneticRuler( tolerance );
    topLine.y = globalBounds.y;
    topLine.object = this;

    var bottomLine = new BottomMagneticRuler( tolerance );
    bottomLine.y = globalBounds.y+globalBounds.height;
    bottomLine.object = this;

    var centerHorizontalLine = new CenterHorizontalMagneticRuler( tolerance );
    centerHorizontalLine.y = globalBounds.y + globalBounds.height/2;
    centerHorizontalLine.object = this;



    //this.magneticLines.top = ( topLine );
    //this.magneticLines.bottom = ( bottomLine );
    this.magneticLines.vertical.left = leftLine;
    this.magneticLines.vertical.right = rightLine;
    this.magneticLines.vertical.center = centerLine;
    this.magneticLines.horizontal.top = topLine;
    this.magneticLines.horizontal.bottom = bottomLine;
    this.magneticLines.horizontal.center = centerHorizontalLine;

    Editor.stage.getIRulersLayer().addChild( leftLine, rightLine, centerLine, topLine, bottomLine, centerHorizontalLine );
    aż dotąd */

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

p.getX = function(){

	return this.x;

};

/**
* Sprawdza czy objekt jest w obszarze edycyjnym
*
* @method isInEditableArea
* @return {bool}
*/
p.isInEditableArea = function(){

    var parent = this.parent;

    while( parent ){

        if( parent.slope )
            return true;

        parent = parent.parent;

    }

    return false;

};


export { EditorObject };
