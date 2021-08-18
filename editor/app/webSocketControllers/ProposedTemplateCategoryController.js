	/**
	* Klasa będąca kontrolerem pozycji proponowanych. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/ProposedTemplateCategoryController.js
	*
	* @class ProposedTemplateCategoryController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ProposedTemplateCategoryController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = ProposedTemplateCategoryController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;

    };
        

    p.getAll = function( callback ){

        var _this = this;

        this.webSocket.on('ProposedTemplateCategory.getAll', function( data ){

            callback( data );
            _this.webSocket.removeListener('ProposedTemplateCategory.getAll');

        });

        this.webSocket.emit('ProposedTemplateCategory.getAll');

    };


    p.add = function( categoryName, callback ){

        var _this = this;

        var data = {

            name : categoryName

        };

        this.webSocket.on( 'ProposedTemplateCategory.add', function( data ){

            if( callback )
                callback( data );

            _this.webSocket.removeListener( 'ProposedTemplateCategory.add' );

        });

        this.webSocket.emit( 'ProposedTemplateCategory.add', data );

    };


    p.remove = function( categoryID ){

        var data = {

            categoryID : categoryID

        };

        this.webSocket.emit( 'ProposedTemplateCategory.remove', data );

    };


    export {ProposedTemplateCategoryController};