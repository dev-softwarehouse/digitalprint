(function(){
    
	/**
	* Klasa będąca kontrolerem viewObject. Wysyła i odbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/viewObjectController.js
	*
	* @class viewObjectController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ViewObjectController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = viewObjectController.prototype;

    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;

        this.webSocket.on( 'ViewObject.setPosition', function( data ){



        });

    };


    p.setPosition = function( x, y ){

        var data = {

            x : x,
            y : y

        };

        this.webSocket.emit( 'ViewObject.setPosition', data );

    };


    p.setRotation = function( rotation ){

        var data = {

            rotation : rotation

        };

        this.webSocket.emit( 'viewObject.setRotation', data );

    };


    Editor.ViewObjectController = ViewObjectController;

})();