import {Bitmap} from './EditorBitmap';
import {safeImage} from "../utils";

	export function BackgroundFrame( obj ){

		createjs.Bitmap.call( this );

		this.configurate( obj );

	};

	BackgroundFrame.prototype = $.extend( true, {}, Object.create( createjs.Bitmap.prototype ) );

	var p = BackgroundFrame.prototype;

	p.constructor = BackgroundFrame;

	p.setParentElement = function( parentElem ){

		this.parentObject = parentElem;
		this.updateSize();

	};

	p.configurate = function( obj ){

		var url = obj.ProjectImage.minUrl;
		//this.type = type;
		
		this.image = safeImage();

		this.width = obj.ProjectImage.width;
		this.height = obj.ProjectImage.height;

		this.imageWidth = obj.width;
		this.imageX = obj.x;

		this.imageHeight = obj.height;
		this.imageY = obj.y;

		this.image.src = EDITOR_ENV.staticUrl +url;

		this.mouseEnabled = false;

	};

	p.setWidth = function( width ){

		this.scaleX = width/this.width;

	};

	p.setHeight = function( height ){

		this.scaleY = height/this.height;

	};

	p.updateSize = function(){

		if( this.parentObject instanceof Bitmap ){

			this.frameWidth = this.parentObject.width*(100/this.imageWidth);
			this.frameHeight = this.parentObject.height*(100/this.imageHeight);

		}else {

			this.frameWidth = this.parentObject.trueWidth*(100/this.imageWidth);
			this.frameHeight = this.parentObject.trueHeight*(100/this.imageHeight);
			
		}


		this.setWidth( this.frameWidth );
		this.setHeight( this.frameHeight );

		this.x = this.offsetX = - ( this.frameWidth * this.imageX/100 );
		this.y = this.offsetY = - ( this.frameHeight * this.imageY/100 );

	};