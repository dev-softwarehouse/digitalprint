this.Editor = this.Editor || {};

(function(){

    function CenterMagneticRuler( tolerance ){
    
        Editor.EditorRullerHelper_Vertical.call( this, 'red', 'line' );
        this.visible = false;
        this.mouseEnabled = false;
        this.tolerance = tolerance;
        
    };
    
    var p = CenterMagneticRuler.prototype = $.extend( true, {}, Object.create( Editor.EditorRullerHelper_Vertical.prototype ) );
    
    p.constructor = CenterMagneticRuler;
    
    
    p.magnetizeObject = function(){
        
        this.visible = true;
        var localPos = this.closestLine.parent.localToLocal( this.closestLine.x, 0, this.object.parent );
        this.object.x = localPos.x;
    
        if( this.object.mask ){

            this.object.mask.x = this.object.x;
            this.object.mask.y = this.object.y;
                
        }
    
    };
    
    
    p.getClosestLine = function(){
        
        var linesInRange = [];
        var currentScale = Editor.getStage().scaleX;

        for( var i=0; i < this.parent.children.length; i++ ){

            if( ( ( this.parent.children[i] instanceof Editor.EditorRullerHelper_Vertical ) || ( this.parent.children[i] instanceof Editor.CenterMagneticRuler ) || ( this.parent.children[i] instanceof Editor.LeftMagneticRuler ) || ( this.parent.children[i] instanceof Editor.RightMagneticRuler )) && this.parent.children[i] != this ){

                if( ((this.parent.children[i].x-this.x)*currentScale < this.tolerance ) && ((this.parent.children[i].x-this.x)*currentScale > -this.tolerance )){
                    linesInRange.push( this.parent.children[i] );
                }
                
            }
            
        }
        
        if( linesInRange.length ){
            
            for( var i=0; i < linesInRange.length; i++ ){
                
                if( this.closestLine ){
                    
                    if( (Math.abs( this.x - this.closestLine.x ))*currentScale > (Math.abs( this.x - linesInRange[i].x ))*currentScale ){
                        
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
    
    // powinno sie nazywać aligntoclosestLine
    p.lookForClosestVerticalLine = function( positionBefore ){
        
        var closest = [];
        var currentScale = Editor.getStage().scaleX;

        for( var i=0; i < this.parent.children.length; i++ ){
            
            if( (( this.parent.children[i] instanceof Editor.CenterMagneticRuler ) || ( this.parent.children[i] instanceof Editor.LeftMagneticRuler ) || ( this.parent.children[i] instanceof Editor.RightMagneticRuler )|| ( this.parent.children[i] instanceof Editor.EditorRullerHelper_Vertical )) && this.parent.children[i] != this ){
                
                if( ((this.parent.children[i].x-this.x < 30))*currentScale && ((this.parent.children[i].x-this.x)*currentScale > -30 )){
                    closest.push( this.parent.children[i] );
                }
                
                if( closest.length ){

                    for( var l=0; l < closest.length; l++ ){
                        
                        //closest[l].graphics.c().ss(1).s('red').mt(0,0).lt(0, this.height );
                        this.x = closest[l].x;
                        this.object.x = closest[l].x;
                        this.object.verticalAlignTo = this;
                        this.visible = true;

                    }
                    
                }
                else {
                    this.visible = false;   
                }
                
            }
            
        }
            
    };
    
    Editor.CenterMagneticRuler = CenterMagneticRuler;

})();