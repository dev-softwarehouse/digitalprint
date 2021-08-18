this.Editor = this.Editor || {};

(function(){

    function RightMagneticRuler( tolerance ){
    
        Editor.EditorRullerHelper_Vertical.call( this, 'red', 'line' );
        this.tolerance = tolerance;
        this.visible = false;
        this.mouseEnabled = false;
    };
    
    var p = RightMagneticRuler.prototype = $.extend( true, {}, Object.create( Editor.EditorRullerHelper_Vertical.prototype ) );
    
    p.constructor = RightMagneticRuler;
    
    p.magnetizeObject = function(){
        
        this.visible = true;
        var localPos = this.closestLine.parent.localToLocal( this.closestLine.x, 0, this.object.parent );

        var globalBounds = this.object.getGlobalTransformedBounds();

        this.object.x = localPos.x - globalBounds.width/2;//this.object.regX*this.object.scaleX;
    
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

                if( ((this.parent.children[i].x-this.x)*currentScale < this.tolerance) && ((this.parent.children[i].x-this.x)*currentScale > -this.tolerance )){
                    linesInRange.push( this.parent.children[i] );
                }
                
            }
            
        }
        
        if( linesInRange.length ){
            
            for( var i=0; i < linesInRange.length; i++ ){
                
                if( this.closestLine ){
                    
                    if( Math.abs( this.x - this.closestLine.x ) > Math.abs( this.x - linesInRange[i].x ) ){
                        
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
    
    
    p.lookForClosestVerticalLine = function(){
        
        var closest = [];
        var currentScale = Editor.getStage().scaleX;

        for( var i=0; i < this.parent.children.length; i++ ){
            
            if( (( this.parent.children[i] instanceof Editor.CenterMagneticRuler ) || ( this.parent.children[i] instanceof Editor.LeftMagneticRuler ) || ( this.parent.children[i] instanceof Editor.RightMagneticRuler )) && this.parent.children[i] != this ){
                
                if( ((this.parent.children[i].x-this.x)*currentScale < 30) && ((this.parent.children[i].x-this.x)*currentScale > -30 )){
                    closest.push( this.parent.children[i] );
                    this.color='red';
                    this.parent.children[i].color = 'red';
                    this.graphics.c().ss(1).s('red').mt(0,0).lt(0, this.height );
                    //this.parent.children[i].visible = true;
                    this.parent.children[i].graphics.c().ss(1).s('red').mt(0,0).lt(0, this.height );
                    this.x = this.parent.children[i].x;
                    this.object.x = this.parent.children[i].x - this.object.regX*this.object.scaleX;
                }
                else {
                    this.parent.children[i].visible = false;
                    
                    this.color='#01aeae';
                    this.parent.children[i].color = '#01aeae';
                    this.graphics.c().ss(1).s(this.color).mt(0,0).lt(0, this.height );
                    this.parent.children[i].graphics.c().ss(1).s(this.parent.children[i].color).mt(0,0).lt(0, this.height );
                    
                }
                
            }
            
        }
            
    };
    
    Editor.RightMagneticRuler = RightMagneticRuler;

})();