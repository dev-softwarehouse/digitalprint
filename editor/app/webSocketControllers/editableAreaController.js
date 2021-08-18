
( function(){    

	/**
	* Klasa będąca kontrolerem EditableAreaController. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/EditableAreaController.js
	*
	* @class EditableAreaController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function EditableAreaController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = EditableAreaController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        //this.webSocket.on( 'MainTheme.getPages', function( data ){ _this.onGetPages( data ); _this.getPagesCallBack( data ); });
        this.webSocket.on( 'MainTheme.added', function( data ){ _this.onAdded( data ); } );
        this.webSocket.on( 'MainTheme.getAll', function( data ){ _this.onGetAll( data ); } );
        this.webSocket.on( 'MainTheme.updated', function( data ){ _this.onUpdate( data ); } );
        
    }; 
    
    Editor.EditableAreaController = EditableAreaController;

})();