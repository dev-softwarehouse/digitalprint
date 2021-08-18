    
	/**
	* Klasa będąca kontrolerem EdytorText. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/EditorTextController.js
	*
	* @class EditorTextController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function EditorTextController( webSocket ){
        
        this.webSocket = webSocket;
        
    };
    
    
    var p = EditorTextController.prototype;
    
    


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;

    };

    p.setContent = function( dbID, content ){

        var data = {

            editorTextID : dbID,
            content : content

        };

        this.webSocket.emit( 'EditorText.setContent', data );

    };

    p.setAlphaBackground = function( dbID, value ){

        var data = {

            dbID : dbID,
            backgroundOpacity : value,

        };

        this.webSocket.emit( 'EditorText.setAlphaBackground', data );

    };
    

    p.setShadow = function( dbID, value ){

        var data = {

            editorTextID : dbID,
            value : value

        };

        this.webSocket.emit('EditorText.setShadow', data );

    };


    p.setHorizontalPadding = function( dbID, value ){

        var data = {

            dbID : dbID,
            value : value

        };

        this.webSocket.emit( 'EditorText.setHorizontalPadding', data );

    };

    p.setVerticalPadding = function( dbID, value ){

        var data = {

            dbID : dbID,
            value : value

        };

        this.webSocket.emit( 'EditorText.setVerticalPadding', data );

    };


    p.setBackgroundColor = function( dbID, color ){

        var data = {

            dbID  : dbID,
            color : color

        };


        this.webSocket.emit( 'EditorText.setBackgroundColor', data );

    };


    p.remove = function(  ){



    };


    p.setTransform = function( x, y, rotation, trueWidth, trueHeight, dbID ){

        var data = {

            editorTextID : dbID,
            x : x,
            y : y,
            rotation : rotation,
            width : trueWidth,
            height : trueHeight

        };

        this.webSocket.emit( 'EditorText.setTransform', data );

    };

export { EditorTextController };