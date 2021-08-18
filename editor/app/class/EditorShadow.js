import {Bitmap} from './EditorBitmap';
import {TextLetter} from './TextLetter';
import {ProposedPosition2} from './ProposedPosition2';
import {Text2} from './Text2';

    function boxesForGauss(sigma, n){
          
        var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width  
        var wl = Math.floor(wIdeal);  if(wl%2==0) wl--; 
        var wu = wl+2;
        var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
        var m = Math.round(mIdeal);
         
        // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
        var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
        return sizes;

    }

    function gaussBlur_4 (scl, tcl, w, h, r) {
        
        var bxs = boxesForGauss(r, 5);

        boxBlur_4 (scl, tcl, w, h, (bxs[0]-1)/2);
        boxBlur_4 (tcl, scl, w, h, (bxs[1]-1)/2);
        boxBlur_4 (scl, tcl, w, h, (bxs[2]-1)/2);

    }

    function boxBlur_4 (scl, tcl, w, h, r) {
       
        for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
        boxBlurH_4(tcl, scl, w, h, r);
        boxBlurT_4(scl, tcl, w, h, r);

    }


    function boxBlurH_4 (scl, tcl, w, h, r) {

        var iarr = 1 / (r+r+1);

        for(var i=0; i<h; i++) {
          
            var ti = i*w, li = ti, ri = ti+r;
            var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
            for(var j=0; j<r; j++) val += scl[ti+j];
            for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
            for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
            for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
           
        }

    }

    function boxBlurT_4 (scl, tcl, w, h, r) {
       
        var iarr = 1 / (r+r+1);
            
        for(var i=0; i<w; i++) {
               
            var ti = i, li = ti, ri = ti+r*w;
                   
            var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
                    
            for(var j=0; j<r; j++) val += scl[ti+j*w];
                 
            for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
                   
            for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
                   
            for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
          
        }

    }


	/**
	* Klasa reprezentująca obiekt cienia.
	*
	* @class EditorShadow
	* @constructor
	*/
	function EditorShadow( parent, blurValue, color, offsetX, offsetY, uglify ){

        var _this = this;
        this.uglify = uglify;
        this.blur = blurValue;
        this.parentObject = parent;
        this.color = color;
        this.offsetY = offsetY;
        this.offsetX = offsetX;

        // inicjalizacja konstruktorów
        createjs.Bitmap.call( this, this.generateShadow( parent, this.blur, this.color, this.uglify, this.offsetX, this.offsetY ) );
        // inicjalizacja obiektu
        this.type = 'EditorShadow';

	};


	var p = EditorShadow.prototype = $.extend(true,{}, new Object( createjs.Bitmap.prototype ) );

	p.constructor = EditorShadow;


    p.updateShadow = function( parent, blurValue, color, offsetX, offsetY ){

        this.blur = blurValue;
        this.color = color;
        this.offsetY = offsetY;
        this.offsetX = offsetX;
        this.image.src = this.generateShadow( parent, blurValue, color, this.uglify, offsetX, offsetY );
         
    };


    p.setOffsetX = function( offsetX ){

        if( this.parentObject instanceof TextLetter ){

            this.x = ( (-this.blur )+offsetX );

        }else if( this.parentObject instanceof ProposedPosition2 && this.parentObject.backgroundFrame ){

            this.x = ( (-blurValue*2  )+offsetY )+ this.parentObject.backgroundFrame.offsetX;

        }else {
         
            this.x = ( (-this.blur*2 )+offsetX );

        }

    };

    p.setOffsetY = function( offsetY ){

        if( this.parentObject instanceof TextLetter ){

            this.y = ( (-this.blur )+offsetY );

        }else if( this.parentObject instanceof ProposedPosition2 && this.parentObject.backgroundFrame ){

            this.y = ( (-blurValue*2  )+offsetY )+ this.parentObject.backgroundFrame.offsetY;

        } else {
         
            this.y = ( (-this.blur*2 )+offsetY );

        }

    };


    p.generateShadow = function( parent, blurValue, color, uglify, offsetX, offsetY ){

        var _this = this;

        var colorValues = color.split('(')[1].split(')')[0];
        var colorValues = colorValues.split(',');

        var colorR = parseInt(colorValues[0]);
        var colorG = parseInt(colorValues[1]);
        var colorB = parseInt(colorValues[2]);
        var colorA = parseInt(colorValues[3]);


        if( parent instanceof TextLetter ){

            var canvasHeight = (parent.height + blurValue*2)/uglify;
            var canvasWidth = (parent.width + blurValue*2)/uglify;

        }else if( parent instanceof ProposedPosition2 ){

            if( parent.backgroundFrame ){

                var canvasHeight = (parent.backgroundFrame.frameHeight + blurValue*4)/uglify;
                var canvasWidth = (parent.backgroundFrame.frameWidth + blurValue*4)/uglify;                

            }else {

                var canvasHeight = (parent.height + blurValue*4)/uglify;
                var canvasWidth = (parent.width + blurValue*4)/uglify;
                
            }

        }else {

            var canvasHeight = (parent.height + blurValue*4)/uglify;
            var canvasWidth = (parent.width + blurValue*4)/uglify;

        }


        var shadowMaker = document.createElement('canvas');
        shadowMaker.setAttribute( 'height', canvasHeight );
        shadowMaker.setAttribute( 'width', canvasWidth );
        shadowMaker.className = 'shadowMaker';
        document.body.appendChild( shadowMaker );

        var shadowMakerTarget = document.createElement('canvas');
        shadowMakerTarget.setAttribute('height', canvasHeight );
        shadowMakerTarget.setAttribute('width', canvasWidth );
        shadowMakerTarget.className = 'shadowMakerTarget';
        document.body.appendChild( shadowMakerTarget );

        //var shadowCtx = shadowMaker.getContext('2d');
        var shadowMakerTargetCtx = shadowMakerTarget.getContext('2d');
        var shadowMakerStage = new createjs.Stage( shadowMaker );
        var shadowCtx = shadowMakerStage.canvas.getContext('2d');

        if( parent instanceof Bitmap ){
            
            var object = new Bitmap( parent.name +"_clone", parent.bitmap.image.src, false, false, {

                x             : canvasWidth/2,
                y             : canvasHeight/2,
                rotation      : 0,
                width         : parent.width,
                height        : parent.height,
                scaleX        : 1/uglify,
                scaleY        : 1/uglify,
                shadowBlur    : parent.shadowBlur,
                shadowColor   : parent.shadowColor,
                shadowOffsetX : parent.shadowOffsetX,
                shadowOffsetY : parent.shadowOffsetY,
                dropShadow    : parent._dropShadow,
                droppedBorder : parent.droppedBorder,
                simpleborder  : parent.simpleborder,
                displaySimpleBorder  : parent.displaySimpleBorder,
                borderColor   : parent.borderColor,
                borderWidth   : parent.borderWidth/uglify

            }, function(){

                object.imageShape.visible = false;
                shadowMakerStage.update();

                var sourceTarget = shadowCtx.getImageData(0, 0, shadowMaker.width, shadowMaker.height);
                var target = shadowMakerTargetCtx.getImageData(0, 0, shadowMaker.width, shadowMaker.height);

                var redChannel = [];
                var newRedChannel = [];
                for( var i=0; i < sourceTarget.data.length; i+=4 ){

                    redChannel.push( colorR );

                }

                var greenChannel = [];
                var newGreenChannel = [];
                for( var i=1; i < sourceTarget.data.length; i+=4 ){

                    greenChannel.push( colorG );

                }

                var blueChannel = [];
                var newBlueChannel = [];
                for( var i=2; i < sourceTarget.data.length; i+=4 ){

                    blueChannel.push( colorB );

                }

                var alphaChannel = [];
                var newAlphaChannel = [];
                for( var i=3; i < sourceTarget.data.length; i+=4 ){

                    alphaChannel.push( sourceTarget.data[i] );

                }


                // trzeba sprawdzić czy nie da sie tego uciąć do jednego wywołania funkcji!
                gaussBlur_4( redChannel, newRedChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
                gaussBlur_4( greenChannel, newGreenChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
                gaussBlur_4( blueChannel, newBlueChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
                gaussBlur_4( alphaChannel, newAlphaChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );


                for( var i=0; i < sourceTarget.data.length; i+=4  ){

                    target.data[i] = newRedChannel[ i/4 ];
                    target.data[i+1] = newGreenChannel[ (i/4) ];
                    target.data[i+2] = newBlueChannel[ (i/4)];
                    target.data[i+3] = newAlphaChannel[ (i/4) ];

                }

                shadowMakerTargetCtx.putImageData( target, 0, 0 );

                _this.shadowBitmap = shadowMakerTarget.toDataURL();

                _this.scaleX = _this.scaleY = uglify;

                //this.setOffsetY( offsetY );
                //this.setOffsetX( offsetX );
                _this.x = ( (-blurValue*2  )+offsetX );
                _this.y = ( (-blurValue*2  )+offsetY );

                $(shadowMaker).remove();
                $(shadowMakerTarget).remove();
                _this.image.src = _this.shadowBitmap;

                shadowMakerStage.removeAllChildren();
                shadowMakerStage.clear();
                shadowMakerStage.canvas = null;
                delete shadowMakerStage.canvas;

                shadowMakerStage = null;

                shadowCtx = null;
                shadowMakerTargetCtx = null;
                
                object.bitmap.image.onload = null;
                object.img = null;
                object = null;

            });

            object.mouseEnabled = false;
            object.imageShape.visible = false;
            shadowMakerStage.enableDOMEvents(false);
            shadowMakerStage.addChild( object );
            shadowMakerStage.update();

        }else if( parent instanceof ProposedPosition2 ){

            shadowCtx.fillStyle = color;

            if( parent.backgroundFrame ){

                shadowCtx.fillRect( blurValue*2/uglify, blurValue*2/uglify, (parent.backgroundFrame.frameWidth)/uglify, (parent.backgroundFrame.frameHeight)/uglify );

            }else {

                shadowCtx.fillRect( blurValue*2/uglify, blurValue*2/uglify, (parent.width)/uglify, (parent.height)/uglify );
                
            }
            
            var sourceTarget = shadowCtx.getImageData(0, 0, shadowMaker.width, shadowMaker.height);
            var target = shadowMakerTargetCtx.getImageData(0, 0, shadowMaker.width, shadowMaker.height);

            var redChannel = [];
            var newRedChannel = [];
            for( var i=0; i < sourceTarget.data.length; i+=4 ){

                redChannel.push( colorR );

            }

            var greenChannel = [];
            var newGreenChannel = [];
            for( var i=1; i < sourceTarget.data.length; i+=4 ){

                greenChannel.push( colorG );

            }

            var blueChannel = [];
            var newBlueChannel = [];
            for( var i=2; i < sourceTarget.data.length; i+=4 ){

                blueChannel.push( colorB );

            }

            var alphaChannel = [];
            var newAlphaChannel = [];
            for( var i=3; i < sourceTarget.data.length; i+=4 ){

                alphaChannel.push( sourceTarget.data[i] );

            }

            gaussBlur_4( redChannel, newRedChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
            gaussBlur_4( greenChannel, newGreenChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
            gaussBlur_4( blueChannel, newBlueChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
            gaussBlur_4( alphaChannel, newAlphaChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );

            for( var i=0; i < sourceTarget.data.length; i+=4  ){

                target.data[i] = newRedChannel[ i/4 ];
                target.data[i+1] = newGreenChannel[ (i/4) ];
                target.data[i+2] = newBlueChannel[ (i/4)];
                target.data[i+3] = newAlphaChannel[ (i/4) ];

            }

            shadowMakerTargetCtx.putImageData( target, 0, 0 );

            this.shadowBitmap = shadowMakerTarget.toDataURL();

            this.scaleX = this.scaleY = uglify;

            //this.setOffsetY( offsetY );
            //this.setOffsetX( offsetX );
            if( parent instanceof TextLetter ){

                this.x = ( (-blurValue  )+offsetX );
                this.y = ( (-blurValue  )+offsetY );

            }else if( parent.backgroundFrame ){

                this.x = ( (-blurValue*2  )+offsetX ) + parent.backgroundFrame.offsetX;
                this.y = ( (-blurValue*2  )+offsetY ) + parent.backgroundFrame.offsetY;

            }else{

                this.x = ( (-blurValue*2  )+offsetX );
                this.y = ( (-blurValue*2  )+offsetY );

            }

            $(shadowMaker).remove();
            $(shadowMakerTarget).remove();
            shadowCtx = null;
            shadowMakerTargetCtx = null;

            return this.shadowBitmap;

        }
        else if( parent instanceof Text2 ){

            var object = parent._cloneObject();

            object.x = canvasWidth/2,
            object.y = canvasHeight/2,
            object.rotation = 0;
            object.mask = null;
            object.border.graphics.c();



            object.scaleX = 1/uglify;
            object.scaleY = 1/uglify;

            shadowMakerStage.enableDOMEvents(false);
            shadowMakerStage.addChild( object );
            shadowMakerStage.update();       


        }
        else if( parent instanceof TextLetter ){

            var object = parent._cloneObject();

            object.scaleX = 1/uglify;
            object.scaleY = 1/uglify;

            object.x += blurValue/uglify;
            object.y += blurValue/uglify;

            shadowMakerStage.enableDOMEvents(false);
            shadowMakerStage.addChild( object );
            shadowMakerStage.update();

        }


        var sourceTarget = shadowCtx.getImageData(0, 0, shadowMaker.width, shadowMaker.height);
        var target = shadowMakerTargetCtx.getImageData(0, 0, shadowMaker.width, shadowMaker.height);

        var redChannel = [];
        var newRedChannel = [];
        for( var i=0; i < sourceTarget.data.length; i+=4 ){

            redChannel.push( colorR );

        }

        var greenChannel = [];
        var newGreenChannel = [];
        for( var i=1; i < sourceTarget.data.length; i+=4 ){

            greenChannel.push( colorG );

        }

        var blueChannel = [];
        var newBlueChannel = [];
        for( var i=2; i < sourceTarget.data.length; i+=4 ){

            blueChannel.push( colorB );

        }

        var alphaChannel = [];
        var newAlphaChannel = [];
        for( var i=3; i < sourceTarget.data.length; i+=4 ){

            alphaChannel.push( sourceTarget.data[i] );

        }


        gaussBlur_4( redChannel, newRedChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
        gaussBlur_4( greenChannel, newGreenChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
        gaussBlur_4( blueChannel, newBlueChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );
        gaussBlur_4( alphaChannel, newAlphaChannel, shadowMaker.width, shadowMaker.height, blurValue/uglify, false );


        for( var i=0; i < sourceTarget.data.length; i+=4  ){

            target.data[i] = newRedChannel[ i/4 ];
            target.data[i+1] = newGreenChannel[ (i/4) ];
            target.data[i+2] = newBlueChannel[ (i/4)];
            target.data[i+3] = newAlphaChannel[ (i/4) ];

            /*
            if( newAlphaChannel[ (i/4) ] == 0 )
                target.data[i+3] = 0;//newAlphaChannel[ (i/4) ];
            else 
                target.data[i+3] = 255;// newAlphaChannel[ (i/4) ];
            */

        }

        shadowMakerTargetCtx.putImageData( target, 0, 0 );

        this.shadowBitmap = shadowMakerTarget.toDataURL();

        this.scaleX = this.scaleY = uglify;

        //this.setOffsetY( offsetY );
        //this.setOffsetX( offsetX );

        if( parent instanceof TextLetter ){

            this.x = ( (-blurValue  )+offsetX );
            this.y = ( (-blurValue  )+offsetY );

        }else if( parent instanceof ProposedPosition2 && parent.backgroundFrame ){

            //console.log( parent.backgroundFrame.offsetX );
            this.x = ( (-blurValue*2  )+offsetX ) + parent.backgroundFrame.offsetX;
            this.y = ( (-blurValue*2  )+offsetY )+ parent.backgroundFrame.offsetY;

        }else{

            this.x = ( (-blurValue*2  )+offsetX );
            this.y = ( (-blurValue*2  )+offsetY );

        }

        if( this.image )
            this.image.src = this.shadowBitmap;



            $(shadowMaker).remove();
            $(shadowMakerTarget).remove();


        
        return this.shadowBitmap;

    };

/*
 // start
    var testShadow = document.createElement('canvas');
    testShadow.setAttribute('height', 400 );
    testShadow.setAttribute('width', 400 );
    testShadow.className = 'testShadow';
    document.body.appendChild( testShadow );

    var testShadowTarget = document.createElement('canvas');
    testShadowTarget.setAttribute('height', 400 );
    testShadowTarget.setAttribute('width', 400 );
    testShadowTarget.className = 'testShadowTarget';
    document.body.appendChild( testShadowTarget );


    var testShadowTargetCtx = testShadowTarget.getContext('2d');


        var shadow   Ctx = testShadow.getContext('2d');
    shadowCtx.fillStyle = 'rgba( 34, 65, 87 )';
    shadowCtx.fillRect( 50, 50, 300, 300 );

    shadowCtx.fillStyle = 'rgba( 255, 0, 0 )';
    shadowCtx.fillRect( 100, 100, 200, 200 );

    var sourceTarget = shadowCtx.getImageData(0, 0, testShadow.width, testShadow.height);
    var target = testShadowTargetCtx.getImageData(0, 0, testShadowTarget.width, testShadowTarget.height);


    var redChannel = [];
    var newRedChannel = [];
    for( var i=0; i < sourceTarget.data.length; i+=4 ){

        redChannel.push( sourceTarget.data[i] );

    }

    var greenChannel = [];
    var newGreenChannel = [];
    for( var i=1; i < sourceTarget.data.length; i+=4 ){

        greenChannel.push( sourceTarget.data[i] );

    }

    var blueChannel = [];
    var newBlueChannel = [];
    for( var i=2; i < sourceTarget.data.length; i+=4 ){

        blueChannel.push( sourceTarget.data[i] );

    }

    var alphaChannel = [];
    var newAlphaChannel = [];
    for( var i=3; i < sourceTarget.data.length; i+=4 ){

        alphaChannel.push( sourceTarget.data[i] );

    }


    // szybki algorytm rozmycia
    function boxesForGauss(sigma, n){
          
        var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width  
        var wl = Math.floor(wIdeal);  if(wl%2==0) wl--; 
        var wu = wl+2;
        var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
        var m = Math.round(mIdeal);
         
        // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
        var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
        return sizes;

    }

    function gaussBlur_4 (scl, tcl, w, h, r) {
        
        var bxs = boxesForGauss(r, 5);

        boxBlur_4 (scl, tcl, w, h, (bxs[0]-1)/2);
        boxBlur_4 (tcl, scl, w, h, (bxs[1]-1)/2);
        boxBlur_4 (scl, tcl, w, h, (bxs[2]-1)/2);

    }

    function boxBlur_4 (scl, tcl, w, h, r) {
       
        for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
        boxBlurH_4(tcl, scl, w, h, r);
        boxBlurT_4(scl, tcl, w, h, r);

    }


    function boxBlurH_4 (scl, tcl, w, h, r) {

        var iarr = 1 / (r+r+1);

        for(var i=0; i<h; i++) {
          
            var ti = i*w, li = ti, ri = ti+r;
            var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
            for(var j=0; j<r; j++) val += scl[ti+j];
            for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
            for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
            for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
           
        }

    }

    function boxBlurT_4 (scl, tcl, w, h, r) {
       
        var iarr = 1 / (r+r+1);
            
        for(var i=0; i<w; i++) {
               
            var ti = i, li = ti, ri = ti+r*w;
                   
            var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
                    
            for(var j=0; j<r; j++) val += scl[ti+j*w];
                 
            for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
                   
            for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
                   
            for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
          
        }

    }

    var blurValue = 25;

    gaussBlur_4( redChannel, newRedChannel, 400, 400, blurValue, false );
    gaussBlur_4( greenChannel, newGreenChannel, 400, 400, blurValue, false );
    gaussBlur_4( blueChannel, newBlueChannel, 400, 400, blurValue, false );
    gaussBlur_4( alphaChannel, newAlphaChannel, 400, 400, blurValue, false );


    for( var i=0; i < sourceTarget.data.length; i+=4  ){

        target.data[i] = newRedChannel[ i/4 ];
        target.data[i+1] = newGreenChannel[ (i/4) ];
        target.data[i+2] = newBlueChannel[ (i/4)];
        target.data[i+3] = newAlphaChannel[ (i/4) ];

    }

    testShadowTargetCtx.putImageData( target, 0, 0 );
    // stop
    */

    export {EditorShadow};