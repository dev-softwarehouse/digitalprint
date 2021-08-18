(funciton(){

    function ComposedObject(){
    
        this.bottomLayer = new Editor.Layer('bottom');
        this.topLayer = new Editor.Layer('top');
    
    }
    
    p.prototype = ComposedObject.prototype;
    

    p.addBottomObject = function( object ){
    
        this.bottomLayer.addChild( object );
        
    };
    

    p.addTopObject = function( object ){
    
        this.topLayer.addChild( object );
    
    };
    

    p.removeBottomObject = function( object ){
    
        this.bottomLayer.removeChild( object );
    
    };


    p.removeTopObject = function( object ){
    
        this.topLayer.removeChild( object );
    
    };
    
})();