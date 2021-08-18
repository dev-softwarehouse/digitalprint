var Mouse = (function(){

    function Mouse(){
        
        this.x = 0;
        this.y = 0;
    
    };
    
    Mouse.prototype.changePosition = function( x, y ){
    
        this.x = x;
        this.y = y;
    
    };
    
    
    Mouse.prototype.getPos = function(){
        
        return {
            x : this.x,
            y : this.y
        };
    
    };

    return new Mouse();

})();

export { Mouse };