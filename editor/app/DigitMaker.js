export class DigitMaker {
    
    constructor( editor ) {

    	this.editor = editor;
	    this.settings = {            

				'digitwidth' : 14,
				'digitheight' : 20,
				'scale' : 1,	

		}

		this.canvas;   
	    this.generatedDigitImage = {};
	    this.digits;
	    this.generateDigits = {};   
	    this.scaleNumberPos = {};
		this.numberContainer = new createjs.Container();
		this.tens = {};
		this.hundreds = {};
		this.vertHundreds = {};
		this.vertTens = {};
		this.minusTens = {};
		this.minusHundreds = {};
		this.minusVertHundreds = {};
		this.minusVertTens = {};
    	
    }



	init( ){
               

        if ($("#digitMaker").length == 0){

	        $("body").append("<canvas id='digitMaker'></canvas>");
	        this.digits =  new createjs.Stage("digitMaker");	
	        //digitsContainer = new createjs.Container();	
        	
		}

		this.canvas = $("#digitMaker");
        this.canvas.attr( 'width', this.settings.digitwidth );
		this.canvas.attr( 'height', this.settings.digitheight );    
       	this.generateDigit( );       	
       	        
	}


	setDigitSize( sizeX, sizeY ){


		this.settings.digitwidth = sizeX;	
		this.settings.digitheight = sizeY;	
		
		this.canvas = $("#rulerMaker");
		this.canvas.attr( 'width', this.settings.digitwidth );
		this.canvas.attr( 'height', this.settings.digitheight );

	}

	
	getDigit( digit ){
		
		var singleDigit = new createjs.Bitmap( this.generatedDigitImage[digit]);			

		return singleDigit;

	}


	getAnyNumber( number ){

		var numberContainer = new createjs.Container();
		
		for ( var i=0 ; i < number.length ; i++ ){

			this.scaleNumberPos[i] = this.getDigit( number[i] );
			this.numberContainer.addChild( this.scaleNumberPos[i] );
			this.scaleNumberPos[i].x = i * 11; 			

		}	

		return this.numberContainer;
	}


	generateDigit( ){

		for ( var i=0 ; i<10 ; i++ ){
			
			this.digits.removeAllChildren();

			var digit = new createjs.Text( i,"" + 20 + "px Arial", "#b2afaf" );	

			digit.x = 0;
			digit.y = 20;

			digit.textBaseline = "alphabetic";

			this.digits.addChild( digit );
			this.digits.update();
			
			this.generatedDigitImage[i] = this.digits.toDataURL();

		}

		
		return {

			number : this.generateDigits

		}
	
	}	
		

	getHundreds( number, horVert, plusMinus ){


		if ( horVert == "hor" ){
			
			if ( !this.hundreds[ number ] ){
				this.hundreds[number] = this.getAnyNumber( number+"" );	
			}

			return this.hundreds[number];

		}


		
		if ( horVert == "vert" ){
			
			if ( !this.vertHundreds[ number ] ){

				this.vertHundreds[number] = this.getAnyNumber( number+"" );	

			}

			return this.vertHundreds[number];
			
		}

		if ( horVert == "hor" && plusMinus == "minus" ){
			
			if ( !this.minusHundreds[ number ] ){

				this.minusHundreds[number] = this.getAnyNumber( number+"" );	

			}

			return this.minusHundreds[number];

		}

		
		if ( horVert == "vert" && plusMinus == "minus" ){
			
			if ( !this.minusVertHundreds[ number ] ){

				this.minusVertHundreds[number] = this.getAnyNumber( number+"" );	

				return this.minusVertHundreds[number];

			}
				
		}

	}


	getTens( number, horVert, plusMinus ){

		
		if ( horVert == "hor"){
			
			if ( !this.tens[number] ){
				this.tens[number] = this.getAnyNumber( number+"" );	
			}

			return this.tens[number];
	
		}
		
		
		if ( horVert == "vert"){
			
			if ( !this.vertTens[number] ){
				this.vertTens[number] = this.getAnyNumber( number+"" );	
			}
	
			return this.vertTens[number];

		}

		if ( horVert == "hor" && plusMinus == "minus" ){
			
			if ( !this.minusTens[number] ){
				this.minusTens[number] = this.getAnyNumber( number+"" );	
			}

			return this.minusTens[number];
	
		}
		
		
		if ( horVert == "vert" && plusMinus == "minus" ){
			
			if ( !this.minusVertTens[number] ){
				this.minusVertTens[number] = this.minusVertTens( number+"" );	
			}
	
			return this.minusVertTens[number];

		}



	}

 }