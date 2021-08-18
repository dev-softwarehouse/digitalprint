this.Editor = this.Editor || {};

(function(){

    function TopMagneticRuler( tolerance ){
    
        Editor.EditorRullerHelper_Horizontal.call( this, 'red', 'line' );
        this.visible = false;
        this.mouseEnabled = false;
        this.closestLine = null;
        this.tolerance = tolerance;
        
    };
    
    var p = TopMagneticRuler.prototype = $.extend( true, {}, Object.create( Editor.EditorRullerHelper_Horizontal.prototype ) );
    
    p.constructor = TopMagneticRuler;
    
    
    p.magnetizeObject = function(){
        
        this.visible = true;
        var localPos = this.closestLine.parent.localToLocal( 0, this.closestLine.y, this.object.parent );

        var globalBounds = this.object.getGlobalTransformedBounds();

        this.object.y = localPos.y + globalBounds.height/2 ;//this.object.regY*this.object.scaleY;
    
        if( this.object.mask ){

            this.object.mask.x = this.object.x;
            this.object.mask.y = this.object.y;
                
        }
    
    };
    
    
    p.getClosestLine = function(){
        
        var linesInRange = [];
        var currentScale = Editor.getStage().scaleX;

        for( var i=0; i < this.parent.children.length; i++ ){

            if( ( ( this.parent.children[i] instanceof Editor.CenterHorizontalMagneticRuler ) || ( this.parent.children[i] instanceof Editor.EditorRullerHelper_Horizontal ) || ( this.parent.children[i] instanceof Editor.TopMagneticRuler ) || ( this.parent.children[i] instanceof Editor.BottomMagneticRuler ) ) && this.parent.children[i] != this ){

                if( ((this.parent.children[i].y-this.y)*currentScale < this.tolerance ) && ((this.parent.children[i].y-this.y)*currentScale > -this.tolerance )){
                    linesInRange.push( this.parent.children[i] );
                }
                
            }
            
        }
        
        if( linesInRange.length ){
            
            for( var i=0; i < linesInRange.length; i++ ){
                
                if( this.closestLine ){
                    
                    if( Math.abs( this.y - this.closestLine.y ) > Math.abs( this.y - linesInRange[i].y ) ){
                        
                        this.closestLine = linesInRange[i];
                        
                    }
                    
                }
                else {
                    
                    this.closestLine = linesInRange[i];
                    
                }

            }
                
        }
        else {
            
            this.visible = false;
            this.closestLine = null;
            
        }
        
        return this.closestLine;
        
    };
    
    
    Editor.TopMagneticRuler = TopMagneticRuler;

})();