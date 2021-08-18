import {safeImage} from "../utils";

var Editor = Editor || {};

(function(){
	
	function FrameObject( type, url ){

		createjs.Bitmap.call( this );

		url = 'images/ramka_5.png';
		this.type = type;
		
		this.image = safeImage();

		this.image.onload = function(){

			this.width = this.image.width;
			this.height = this.image.height;

		}.bind(this);

		this.width = 510;
		this.height = 338;
		this.image.src = url;
		
	};

	FrameObject.prototype = $.extend( true, {}, Object.create( createjs.Bitmap.prototype ) );

	var p = FrameObject.prototype;

	p.constructor = FrameObject;

	p.setParentObject = function( obj ){

		this.parentObject = obj;
		this.updateSize();

	};

	p.setWidth = function( width ){

		this.scaleX = width/this.width;

	};

	p.setHeight = function(height){

		this.scaleY = height/this.height;

	};

	p.setType = function( type ){

		this.type = type;

	};

	p.setImage = function( imageURL ){

		//this.frameBitmap.image

	};

	p.updateSize = function(){

		this.setWidth( this.parentObject.trueWidth );
		this.setHeight( this.parentObject.trueHeight );

	};

	Editor.FrameObject = FrameObject;

})();