export class RulerMaker  {
    	
    constructor( editor ){

    	this.editor = editor;
    	this.settings = {
			'rulersize' : 100,
			'rulerVertSize' : 100,
			'rulerHorSize' : 100,
			'rulerLineWidth' : 1,	
			'scale' : 1,	
    	};

		this.rulerGenerator;
		this.canvas;
	    this.rulerImage = null;
	    this.generatedRulersVert = null
	    this.generatedRulersHor = null;

    }
    


	init( max ){
        
        if ($("#rulerMaker").length == 0){

	        $("body").append("<canvas id='rulerMaker'></canvas>");
	        this.rulerGenerator =  new createjs.Stage("rulerMaker");		

		}
				//rulerGeneratorHor =  new createjs.Stage("rulerMaker");

		
		this.canvas = $("#rulerMaker");
        this.canvas.attr( 'width', this.settings.rulersize );
		this.canvas.attr( 'height', this.settings.rulersize );

	}


	setRulerSize( size ){

		this.settings.rulersize = size;	
		
		this.canvas = $("#rulerMaker");
		this.canvas.attr( 'width', this.settings.rulersize );
		this.canvas.attr( 'height', this.settings.rulersize );

	}


	updateVertSize(){

		var editorScale = this.editor.getStage().scaleX;
		
		if (editorScale >= 1){
			this.settings.rulerVertSize = this.settings.rulersize / editorScale;
			
		}else if (editorScale < 1){
			this.settings.rulerVertSize = this.settings.rulersize * editorScale +5;
			
		}	
		

		this.settings.rulersize = this.settings.rulerVertSize;

	}


	updateHorSize(){

		var editorScale = this.editor.getStage().scaleY;

		if (editorScale >= 1){
			this.settings.rulerHorSize = this.settings.rulersize * editorScale;
			
		}else if (editorScale < 1){
			this.settings.rulerHorSize = this.settings.rulersize * editorScale;
			
		}
		
		
		this.settings.rulersize = this.settings.rulerHorSize;	

	}


	getRulerImageVert( ){

		return this.generatedRulersVert;

	}

	getRulerImageHor( ){

		return this.generatedRulersHor;

	}
	
	generateRuler( ){

		var editorScaleY = this.editor.getStage().scaleY;
		var editorScaleX = this.editor.getStage().scaleX;
		var currentScale = this.editor.getStage().scaleX;
		

		var rulerPartVert = new createjs.Shape();
		//lerPartVert.id = "rulerPartVert";
		var rulerPartHor = new createjs.Shape();
		//lerPartHor.id = "rulerPartHor";

        var shapeLineVert= new createjs.Shape();
        //shapeLineVert.id = "rulerPartHor";
		var shapeLineVertSmall = new createjs.Shape();
		//shapeLineVertSmall.id = "shapeLineVertSmall";

		var shapeLineHor = new createjs.Shape();
		var shapeLineHorSmall = new createjs.Shape();
		//s/hapeLineHor.id = "shapeLineHor";
		//shapeLineHorSmall.id = "shapeLineHorSmall";

		this.rulerGenerator.removeAllChildren();
  

		//updateVertSize();
		$('#rulerMaker').attr('width', 50 );
		$('#rulerMaker').attr('height', 50 * editorScaleY );

        //rulerPartVert.graphics.f('rgba(12,93,89,1)').r(0,0, 50, 50*editorScaleY );           
        shapeLineVert.graphics.setStrokeStyle(1).beginStroke("#03968c").moveTo(0,0).lineTo(20, 0);
            //shape.snapToPixel=true;

        for( var a = 1; a <5; a++){
        	shapeLineVertSmall.graphics.setStrokeStyle(1).beginStroke("#03968c").moveTo(0, 10 *a*editorScaleX,35/editorScaleX).lineTo(10, 10*a*editorScaleX);
        }
        
        //rulerGenerator.addChild( rulerPartVert );
		this.rulerGenerator.addChild( shapeLineVert );
		this.rulerGenerator.addChild( shapeLineVertSmall );
		this.rulerGenerator.update();
		this.generatedRulersVert = this.rulerGenerator.toDataURL();
		this.rulerGenerator.removeAllChildren();

		//updateHorSize();

		$('#rulerMaker').attr('width', 50 * editorScaleX );
		$('#rulerMaker').attr('height', 50 );

        //rulerPartHor.graphics.f('rgba(12,93,89,1)').r(0,0, 50*editorScaleX, 50 );
  	    shapeLineHor.graphics.setStrokeStyle(1).beginStroke("#03968c").moveTo(-25,25).lineTo(0, 30 );

            //shape.snapToPixel=true;

        for( var a = 1; a <5; a++){
        	shapeLineHorSmall.graphics.setStrokeStyle(1).beginStroke("#03968c").moveTo(10 *a*editorScaleX,50).lineTo(10*a*editorScaleX, 40);
        }


        shapeLineHor.addEventListener('mousemove', function( e ){
               

                console.log("EVENT LISTENER --->> RANGE SLIDER ON MOUSEMOVE");

               
        });


	    //rulerGenerator.addChild( rulerPartHor );
		this.rulerGenerator.addChild( shapeLineHor );
		this.rulerGenerator.addChild( shapeLineHorSmall );
		this.rulerGenerator.update();
		
		this.generatedRulersHor = this.rulerGenerator.toDataURL();
		this.rulerGenerator.removeAllChildren();

        
        this.rulerImageHor = this.generatedRulersHor;
        this.rulerImageVert  = this.generatedRulersVert;

        return {

        	ruler : this.generatedRulersHor,
        	ruler : this.generatedRulersVert
        }

    }

}