   
    function EditorObjectController( webSocket ){
        
        this.webSocket = webSocket;
        
    };
    
    
    var p = EditorObjectController.prototype;
    
    
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on( 'EditorObject.move', this.onMove );
        this.webSocket.on( 'EditorObject.scale', this.onScale );
        this.webSocket.on( 'EditorObject.rotate', function( data ){ _this.onRotate( data ) });
        
    };

    
	/**
    * Oczekuje emita od serwera na temat poruszeni się obiektu
	*
	* @method onMove
    * @param {data} informacje od serwera
	*/
    p.onMove = function( data ){
        
        if( data.userID != Editor.webSocketControllers.getWebSocketID() ){
            var object = Editor.stage.getObjectByDbId( data.ID );

            object.x = data.x;
            object.y = data.y;

            if(object.mask){

                object.mask.x = data.x;
                object.mask.y = data.y;

            }

        }
        
        
    };
    
    
	/**
    * Wysyła emita do serwera 'EditorObject.move'.
	*
	* @method move
    * @param {Float} x pozycja x
    * @param {Float} y pozycja y
    * @param {String} objectId ID obiektu który został przesunięty
	*/
    p.move = function( x, y, objectId ){
    
        var data = { 
            ID : objectId,
            x : x, 
            y : y, 
            userID : this.webSocket.id
        };
        
        this.webSocket.emit( 'EditorObject.move', data );
        
    };
    
    
	/**
    * Oczekuje emita od serwera na temat skalowania obiektu
	*
	* @method onScale
    * @param {data} informacje od serwera
	*/
    p.onScale = function( data ){
    
        if( data.userID != Editor.webSocketControllers.getWebSocketID() ){

            var object = Editor.stage.getObjectByDbId( data.ID );

            object.scaleX = data.sX;
            object.scaleY = data.sY;

            object.x = data.x;
            object.y = data.y;

            if(object.mask){

                object.mask.x = data.x;
                object.mask.y = data.y;

            }

        } 
        
    };
    
    
	/**
    * Wysyła emita do serwera 'EditorObject.scale'.
	*
	* @method scale
    * @param {Float} x pozycja x
    * @param {Float} y pozycja y
    * @param {Float} scaleX Scala x
    * @param {Float} scaleY Scala y
    * @param {String} objectId ID obiektu który został zeskalowany
	*/
    p.scale = function( x, y, scaleX, scaleY, objectId ){
    
        var data = { 
            ID : objectId, 
            x : x, 
            y : y, 
            userID : this.webSocket.id, 
            sX : scaleX, 
            sY:scaleY 
        };
        
        this.webSocket.emit( 'EditorObject.scale', data );
    
    };
    
    
	/**
    * Oczekuje emita od serwera na temat rotowania się obiektu
	*
	* @method onRotate
    * @param {data} informacje od serwera
	*/
    p.onRotate = function( data ){

        if( data.userID != this.webSocket.id ){
            var object = Editor.stage.getObjectByDbId( data.ID );

            object.rotation = data.rotation;

            if(object.mask){

                object.mask.rotation = data.rotation;

            }

        }
        
    };

    
	/**
    * Wysyła emita do serwera z prośbą o rotację obiektu
	*
	* @method rotate
    * @param {Float} rotation Rotacja obiektu
    * @param {String} objectDbID Id obiektu w bazie danych
	*/
    p.rotate = function( rotation, objectDbID){
    
        var data = { 
            
            ID : objectDbID, 
            userID : this.webSocket.id, 
            rotation : rotation 
            
        };
        
        this.webSocket.emit( 'EditorObject.rotate', data);
        
    };
    
    
export {EditorObjectController};