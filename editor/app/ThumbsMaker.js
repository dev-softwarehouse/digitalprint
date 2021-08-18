

export var ThumbsMaker = (function( ){
    
	var Editor = null;

	function b64toBlob(b64Data, contentType, sliceSize) {
	    contentType = contentType || '';
	    sliceSize = sliceSize || 258;

	    var byteCharacters = atob(b64Data);
	    var byteArrays = [];

	    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	        var slice = byteCharacters.slice(offset, offset + sliceSize);

	        var byteNumbers = new Array(slice.length);
	        for (var i = 0; i < slice.length; i++) {
	            byteNumbers[i] = slice.charCodeAt(i);
	        }

	        var byteArray = new Uint8Array(byteNumbers);

	        byteArrays.push(byteArray);
	    }

	    var blob = new Blob(byteArrays, {type: contentType});
	    return blob;
	}


	var settings = {
		'maxsize' : 500,
        'minMaxSize' : 130
	};
    
    // rozmiary canvasów aby sie dobrze dostosowały
	var thumbWidth, thumbHeight;
    var minThumbWidth, minThumbHeight;
    
    // generuje miniaturki zdjęć dla edytora
	var thumbGenerator;
    
    // generuje miniaturki dla obrazków z biblioteczki
    var minThumbGenerator;
    
 	var thumbinator;
	var canvas;
    var minCanvas;
    var thumbCanvas;
    var minCanvas;

	function init( editor, max ){
        
        Editor = editor;

		$("body").append("<canvas id='thumbMaker'></canvas>");
        
        $("body").append("<canvas id='minMaker'></canvas>");

		settings = {
            
			'maxsize' : max,
            'minMaxSize' : 100
            
		};
        
        thumbCanvas = document.getElementById('thumbMaker');
        minCanvas = document.getElementById('minMaker');


	};

	function mainBase64( img ){

		var c = document.createElement('canvas');
		c.width = img.origin.width;
		c.height = img.origin.height;
		var ctx = c.getContext("2d");
		ctx.drawImage( img.image, 0, 0, img.origin.width, img.origin.height );

		return c.toDataURL();
		
	}

	function resizeImage( img ){

		var thumbImage = null;
		var minImage = null;

		var minContext = minCanvas.getContext('2d');
		var thumbContext = thumbCanvas.getContext('2d');

		minCanvas.width = 0;
		minCanvas.height = 0;

		thumbCanvas.width = 0;
		thumbCanvas.height = 0;

		if( img.origin.width > img.origin.height )
			var steps = Math.ceil( Math.log( img.origin.width / 650) / Math.log(2) );
		else 
			var steps = Math.ceil( Math.log( img.origin.height / 650 ) / Math.log(2) );

		if( steps > 0 ){

			var currentWidth  = img.origin.width*0.5;
			var currentHeight = img.origin.height*0.5;

			minCanvas.width = currentWidth;
			minCanvas.height = currentHeight;

			//sctx.drawImage( img.image, 0, 0, sc.width, sc.height );
			
			for( var i=1; i < steps; i++ ){

				if( currentWidth > 700 || currentHeight > 700){

					currentWidth = currentWidth*0.5;
					currentHeight = currentHeight*0.5;

				}

			}

			minCanvas.width = currentWidth;
			minCanvas.height = currentHeight;

			minContext.drawImage( img.image, 0, 0, minCanvas.width, minCanvas.height );
			
			minImage = minCanvas.toDataURL();

			var blobImage = b64toBlob(minImage.split('data:image/png;base64,')[1], 'image/png' );

			var urlCreator = window.URL || window.webkitURL;
		    var imageUrl = urlCreator.createObjectURL( blobImage );

		    minImage = imageUrl;

		}
		else {

			var currentWidth  = img.origin.width;
			var currentHeight = img.origin.height;

			minCanvas.width = currentWidth;
			minCanvas.height = currentHeight;

			minContext.drawImage( img.image, 0, 0, minCanvas.width, minCanvas.height );
			minImage = minCanvas.toDataURL();

			var blobImage = b64toBlob(minImage.split('data:image/png;base64,')[1], 'image/png' );

			var urlCreator = window.URL || window.webkitURL;
		    var imageUrl = urlCreator.createObjectURL( blobImage );

		    minImage = imageUrl;

		}


		if( img.origin.width > img.origin.height )
			var smallSteps = Math.ceil( Math.log( img.origin.width / 150) / Math.log(2) );
		else 
			var smallSteps = Math.ceil( Math.log( img.origin.height / 150 ) / Math.log(2) );


		if( smallSteps ){

			var currentSmallWidth  = img.origin.width*0.5;
			var currentSmallHeight = img.origin.height*0.5;

			thumbCanvas.width = currentSmallWidth;
			thumbCanvas.height = currentSmallHeight;

			//ssctx.drawImage( img.image, 0, 0, ssc.width, ssc.height );
			
			for( var i=1; i < smallSteps; i++ ){

				if( currentSmallWidth > 250 || currentSmallHeight > 250){

					currentSmallWidth = currentSmallWidth*0.5;
					currentSmallHeight = currentSmallHeight*0.5;


				}

			}

			thumbCanvas.width = currentSmallWidth;
			thumbCanvas.height = currentSmallHeight;

			thumbContext.drawImage( img.image, 0, 0, thumbCanvas.width, thumbCanvas.height );
			
			thumbImage = thumbCanvas.toDataURL();

			var blobImage = b64toBlob(thumbImage.split('data:image/png;base64,')[1], 'image/png' );

			var urlCreator = window.URL || window.webkitURL;
		    var imageUrl = urlCreator.createObjectURL( blobImage );

		    thumbImage = imageUrl;

		}
		else {

			var currentWidth  = img.origin.width;
			var currentHeight = img.origin.height;

			thumbCanvas.width = currentWidth;
			thumbCanvas.height = currentHeight;

			thumbContext.drawImage( img.image, 0, 0, thumbCanvas.width, thumbCanvas.height );
			thumbImage = thumbCanvas.toDataURL();
			
			var blobImage = b64toBlob(thumbImage.split('data:image/png;base64,')[1], 'image/png' );

			var urlCreator = window.URL || window.webkitURL;
		    var imageUrl = urlCreator.createObjectURL( blobImage );

		    thumbImage = imageUrl;

		}

		thumbContext.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
		minContext.clearRect(0, 0, minCanvas.width, minCanvas.height);

		var main = mainBase64( img );

		return { mainImage: main, mainSize: { width: img.origin.width, height: img.origin.height }, min : minImage, thumb : thumbImage, thumbSize : { width : thumbCanvas.width, height : thumbCanvas.height }, minSize : { width : minCanvas.width, height : minCanvas.height } };

	};


	function removeImg(){
		


	};


	function generateThumb( loadedImage ){
		
		var img;
		//var img = new Image( arguments[0] );

		loadedImage.origin = loadedImage.getBounds();

		//console.log( loadedImage );
		//console.log( '**********((((((((((((((((****************(((((((((((((((((**************' );

		return resizeImage( loadedImage );

		/*
		if( loadedImage.image.width > loadedImage.image.height){
			thumbHeight = settings['maxsize'] * ( loadedImage.image.height/loadedImage.image.width );
			thumbWidth = settings['maxsize'];
			minThumbHeight = settings['minMaxSize'] * ( loadedImage.image.height/loadedImage.image.width );
			minThumbWidth = settings['minMaxSize'];
		}
		else {
			thumbHeight = settings['maxsize'];
			thumbWidth = settings['maxsize'] * ( loadedImage.image.width/loadedImage.image.height );
			minThumbHeight = settings['minMaxSize'];
			minThumbWidth = settings['minMaxSize'] * ( loadedImage.image.width/loadedImage.image.height );
		}


		var minImage = resizeImage( loadedImage );

		canvas.attr( 'width', thumbWidth );
		canvas.attr( 'height', thumbHeight );
        minCanvas.attr( 'width', minThumbWidth );
        minCanvas.attr( 'height', minThumbHeight );

		loadedImage.scaleX = thumbWidth * 1/loadedImage.origin.width;
		loadedImage.scaleY = thumbHeight * 1/loadedImage.origin.height;
		loadedImage.x = 0;
		loadedImage.y = 0;

		thumbGenerator.removeAllChildren();
		thumbGenerator.clear();
		thumbGenerator.addChild( loadedImage );
		thumbGenerator.update();

        
		var generatedThumbImage = thumbGenerator.toDataURL();
        
		loadedImage.scaleX = minThumbWidth * 1/loadedImage.origin.width;
		loadedImage.scaleY = minThumbHeight * 1/loadedImage.origin.height;
		loadedImage.x = 0;
		loadedImage.y = 0;
        
		minThumbGenerator.removeAllChildren();
		minThumbGenerator.clear();
		minThumbGenerator.addChild( loadedImage );
		minThumbGenerator.update();
        
        
		var generatedMiniatureThumbImage = minThumbGenerator.toDataURL();
        
		loadedImage.image = null;
		loadedImage = null;

		return {
        
            thumb : generatedThumbImage,
            minThumb : generatedMiniatureThumbImage
            
        };
		*/
        

	};


	return {
		init : init,
		generateThumb : generateThumb
	}

 })();
