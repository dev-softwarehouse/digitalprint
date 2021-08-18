export class TileMaker {

	constructor ( editor ){

		this.editor = editor;
		this.settings = {            

				'tilesize' : 50,	
				'tileLineWidth' : 1,	
				'scale' : 1,	

		};

		this.tileGenerator;    
		this.canvas;
	    this.tileImage = null;

	}

	init( max ){
   

		$("body").append("<canvas id='tileMaker'></canvas>");
		this.tileGenerator =  new createjs.Stage("tileMaker");

		this.canvas = $("#tileMaker");
        this.canvas.attr( 'width', this.settings.tilesize );
		this.canvas.attr( 'height', this.settings.tilesize );    


        
	};


	setTileSize( size, lineWidth, scale ){

		this.settings.tilesize = size;	
		this.settings.tileLineWidth = lineWidth;
		this.settings.scale = scale;

		if ( this.canvas){
			this.canvas.attr( 'width', this.settings.tilesize*this.settings.scale );
			this.canvas.attr( 'height', this.settings.tilesize*this.settings.scale );
		}
	}


	getTileImage( ){

		return this.tileImage;

	}
	
	generateTile( ){
		
		var lineVert = new createjs.Shape();
        var lineHor = new createjs.Shape();
		

		if( this.tileGenerator){
			this.tileGenerator.removeAllChildren();
			
			lineVert.graphics.ss(this.settings.tileLineWidth*this.settings.scale).s("#b2afaf").mt( 0, 0 ).lt( this.settings.tilesize*this.settings.scale, 0 );        
	        lineHor.graphics.ss(this.settings.tileLineWidth*this.settings.scale).s("#b2afaf").mt( 0,0 ).lt( 0, this.settings.tilesize*this.settings.scale );   

			this.tileGenerator.addChild( lineVert );
	        this.tileGenerator.addChild( lineHor );

	        this.tileGenerator.update();

     	    var generatedTiles = this.tileGenerator.toDataURL();

        }


        this.tileImage = generatedTiles;

        return {

        	tile : generatedTiles

        }

    }

 };