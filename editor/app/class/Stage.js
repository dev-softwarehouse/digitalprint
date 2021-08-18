// to trzeba przerobić dość znacznie 

function Stage( canvasName ){
            
    createjs.Stage.call( this, canvasName );

    var _this = this;
    
    this.ticker = createjs.Ticker;
    this.ticker.setFPS( 25 );
    this.tick = function(){
    
        _this.update();
        
    };
        
    this.ticker.addEventListener( 'tick', _this.tick);
    
    this.mainLayer = new Editor.Layer();
    this.toolsLayer= new Editor.Layer();

    
    this.addChild( this.mainLayer );
    this.addChild( this.toolsLayer );
    this.selectedObject = null;
    
    document.getElementById(canvasName).addEventListener('dragover', function(e){
        //e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        var arr = [];

        var event = new createjs.Event('dragover');
        event.clientX = e.clientX;
        event.clientY = e.clientY;
        Editor.getStage().dispatchEvent(event);


    }, false);

    document.getElementById(canvasName).addEventListener('drop', function(e){
        
        e.stopPropagation();
        e.preventDefault();

		var fileReader = new FileReader();

		fileReader.readAsDataURL( e.dataTransfer.files[0] );

		fileReader.onload = function( freader ){
				
			var loadedImage = new Editor.Bitmap( 'test', freader.target.result, false );
            //console.log( loadedImage );
            //console.log( _this );
            _this.addChild( loadedImage );
            
            loadedImage.initThemeCreatorEvents();
            
            loadedImage.x = 0;
            loadedImage.y = 0;
            
            _this.update();
            
        }
        
        _this.update();

        
    }, false);
    
};


var p = Stage.prototype = Object.create( createjs.Stage.prototype );

p.constructor = Stage;


p.stagetest = function(){

    var sh = new createjs.Shape();
    sh.graphics.f('rgba(12,93,89,0.5)').r(0,0,100,100);
    
    this.addChild( sh );

};

export {Stage}
