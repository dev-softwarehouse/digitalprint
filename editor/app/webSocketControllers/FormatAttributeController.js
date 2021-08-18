   
	/**
	* Klasa będąca kontrolerem AdminProject. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/FormatAttributeController.js
	*
	* @class FormatAttributeController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function FormatAttributeController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = FormatAttributeController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        this.webSocket.on('Attribute.getAll', function( data ){ console.log( data ); });

    };
        
    
    p.add = function( formatID, attributeID, attributeName, attributeOptions ){

        var data = {

            formatID : formatID,
            attributeID : attributeID,
            attributeName : attributeName,
            attributeOptions : attributeOptions

        };

        //console.log( data );

        this.webSocket.emit( 'Attribute.add', data );

    };
    

    p.getAll = function( formatID ){

        var data = {

            formatID : formatID

        };

        this.webSocket.emit( 'Attribute.getAll', data );

    };


export { FormatAttributeController};