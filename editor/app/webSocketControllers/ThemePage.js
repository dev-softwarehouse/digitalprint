
this.Editor = this.Editor || {};

( function(){    


	/**
	* Klasa będąca kontrolerem strony motywu. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/ThemePageController.js
	*
	* @class ThemePageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ThemePageController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = ProposedTemplateController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
    };
        
    
    p.getSelectedProposedTemplates = function( themePageID, imagesCount, textsCount ){

        var data = {

            themePageID : themePageID,
            imagesCount : imagesCount,
            textsCount  : textsCount

        };

        //console.log( data );
        

        this.webSocket.emit( 'ThemePage.getSelectedProposedTemplates', data );

    };


    /**
    * Pobiera informacje o stronie motywu 
    *
    * @method get
    */
    p.get = function( themePageID, callback ){

        var _this = this;

        var data = {

            themePageID : themePageID

        };

        this.webSocket.on('ThemePage.get', function( data ){

            callback( data );

            _this.webSocket.removeListener( 'ThemePage.get' );

        });

        this.webSocket.emit('ThemePage.get', data );

    };


    Editor.ThemePageController = ThemePageController;

})();