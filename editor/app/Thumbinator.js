export var Thumbinator = (function( ){

	var Editor = null;

	var settings = {
		'maxsize' : 300
	};

	var thumbWidth, thumbHeight;
	var thumbGenerator;
 	var thumbinator;
	var canvas;

	function init( editor, max ){

		Editor = editor;
		$("body").append("<canvas id='thumbGenerator'></canvas>");
		thumbGenerator =  new createjs.Stage("thumbGenerator");
		canvas = $("#thumbGenerator");
		settings = {
			'maxsize' : max
		};
	};

	function removeImg(){
		
	};

	function generateThumb( loadedImage ){
		
		var img;
		//var img = new Image( arguments[0] );

		loadedImage.origin = loadedImage.getBounds();

		if( loadedImage.image.width > loadedImage.image.height){
			thumbHeight = settings['maxsize'] * ( loadedImage.image.height/loadedImage.image.width );
			thumbWidth = settings['maxsize'];
		}
		else {
			thumbHeight = settings['maxsize'];
			thumbWidth = settings['maxsize'] * ( loadedImage.image.width/loadedImage.image.height );
		}

		canvas.attr( 'width', thumbWidth );
		canvas.attr( 'height', thumbHeight );
		
		loadedImage.scaleX = thumbWidth * 1/loadedImage.origin.width;
		loadedImage.scaleY = thumbHeight * 1/loadedImage.origin.height;
		loadedImage.x = 0;
		loadedImage.y = 0;

		thumbGenerator.removeAllChildren();

		thumbGenerator.addChild( loadedImage );
		thumbGenerator.update();
		loadedImage.image = null;
		loadedImage = null;
		var generatedImage = thumbGenerator.toDataURL();

		return generatedImage;

	};


	return {
		init : init,
		generateThumb : generateThumb
	}

 })();
