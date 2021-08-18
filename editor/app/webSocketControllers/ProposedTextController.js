	/**
	* Klasa będąca kontrolerem ProposedTextController. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/productController.js
	*
	* @class ProposedTextController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ProposedTextController( webSocket ){
    
        this.webSocket = webSocket;
           
    };
    
    var p = ProposedTextController.prototype;

    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;

    };

    p.setAttributes = function( proposedTextID, attributes, pageID ){

        var data = {

            proposedTextID : proposedTextID,
            attributes : attributes,
            pageID: pageID

        };

        this.webSocket.emit( 'ProposedText.setAttributes', data );

    };

    p.setContent = function( proposedTextID, content, pageID ){

        var data = {

            proposedTextID : proposedTextID,
            content : content,
            pageID : pageID

        };

        this.webSocket.emit( 'ProposedText.setContent', data );

    };

    export {ProposedTextController};