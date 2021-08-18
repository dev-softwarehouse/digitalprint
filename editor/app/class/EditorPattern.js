import {safeImage} from "../utils";

(function(){
    
	/**
	* Edytor pattern, powiela daną grafiką w zależności od skali oraz rozmiaru obitktu w którym się znajduje
	*
	* @class EditorPattern
	* @constructor
	*/
    function EditorPattern( imageUrl, width, height, scaleX, scaleY ){
        
		Editor.Object.call( this, true );
		createjs.Shape.call( this );
        
        this.patternImage = safeImage()
        this.patternImage.src = imageUrl;
        
        this.patternMatrix = new createjs.Matrix2D();
        this.patternMatrix.scale( scaleX, scaleY );
        this.graphics.beginBitmapFill( this.patternImage, 'repeat', this.patternMatrix ).r( 0, 0, width, height );
        
        this.hitArea = new createjs.Shape();
        this.hitArea.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, width, height );
        this.width = width;
        this.height = height;
        this.regX = width/2;
        this.regY = height/2;
        this.toolsType = 'bitmap';
        this.setBounds( 0, 0, width, height );
        
    };

    var p = EditorPattern.prototype = $.extend( true, Object.create( createjs.Shape.prototype ) , Object.create(Editor.Object.prototype) );
    
    p.constructor = EditorPattern;
    
    
    /**
	* W całości wypełania element rodzica ( musi mieć width oraz height )
	*
	* @method fillParent
	*/
    p.fillParent = function(){
        
        this.width = this.parent.width;
        this.height = this.parent.height;
        this.x = this.parent.width/2;
        this.y = this.parent.height/2;
        
        this.redrawPattern();
            
    };
    
    
    /**
	* Przerenderowuje cały obiekt (trzeba wykonać po każdej zmianie parametrów )
	*
	* @method redrawPattern
	*/
    p.redrawPattern = function(){
        
        this.graphics.c().beginBitmapFill( this.patternImage, 'repeat', this.patternMatrix ).r( 0, 0, this.width, this.height );    
        
    };
    
    
    /**
	* Zmienia szerokość obiektu pattern
	*
	* @method setWidth
    * @param {Float} width Nowa szerokość obiektu pattern
	*/
    p.setWidth = function( width ){
    
        this.width = width;
        this.regX = width/2;
        this.setBounds( 0, 0, this.width, this.height ); 
        this.hitArea.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, this.width, this.height );
        this.redrawPattern(); // to trzeba usunąć z tego miejsca
    };
    
    
    /**
	* Zmienia wysokość obiektu pattern
	*
	* @method setHeight
    * @param {Float} height Nowa wysokość obiektu pattern
	*/
    p.setHeight = function( height ){
        
        this.height = height;
        this.regY = height/2;
        this.setBounds( 0, 0, this.width, this.height ); 
        this.hitArea.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, this.width, this.height );
        this.redrawPattern(); // to trzeba usunąć z tego miejsca
        
    };
    
    
    /**
	* Zmienia wysokość obiektu pattern
	*
	* @method patternAngle
    * @pattern {Float} angle kąt paterna
	*/
    p.patternAngle = function( angle ){
    
        // jeszcze nie działa, dziwna jest easelowaska macierz
        
    };
    
    Editor.EditorPattern = EditorPattern;

})();