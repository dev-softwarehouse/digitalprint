
( function(){    


	/**
	* Klasa będąca kontrolerem ThemeCategory. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/ThemeCategory.js
	*
	* @class ThemeCategory
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ThemeCategory( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = ThemeCategory.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on('ThemeCategory.getAll', function( data ){ _this.onGetAll( data ); } );
        
        /*
        this.webSocket.on( 'MainTheme.getPages', function( data ){ _this.onGetPages( data ); _this.getPagesCallBack(); });
        this.webSocket.on( 'MainTheme.added', function( data ){ _this.onAdded( data ); } );
        this.webSocket.on( 'MainTheme.getAll', function( data ){ _this.onGetAll( data ); } );
        */
        
    };
    
    
    /**
	* Emituje prośbę o pobranie wszystkich kategorii motywów
	*
	* @method getPage
    * @param {String} name Nazwa nowego motywu
    * @param {String} categoryID ID kategori
	*/
    p.getAll = function(){
        
        //console.log('theme');
        this.webSocket.emit('ThemeCategory.getAll');
        
    };
    
    
    /**
	* Listener oczekujący na informację o wszystkich  kategoriach motywów
	*
	* @method onGetAll
    * @param {Object} data Informacje przesłane z serwera o stronach motywu
	*/
    p.onGetAll = function( data ){
        
        //console.log( data );
    
    };

    
    Editor.ThemeCategory = ThemeCategory;

})();