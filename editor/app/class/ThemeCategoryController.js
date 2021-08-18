(function(){
    
	/**
	* Klasa będąca kontrolerem View. Wysyła i odbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/viewController.js
	*
	* @class ThemeCategoryController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ThemeCategoryController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = ThemeCategoryController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on('ThemeCategory.added', function( data ){ _this.onAdded( data); });
        this.webSocket.on('ThemeCategory.getAll', function( data ){ _this.onGetAll( data ); } );
        
    };

    
    /**
	* Emituje prosbe do serwera dodanie kategorimotywów
	*
	* @method add
    * @param {String} name Nazwa nowej kategori
	*/
    p.add = function( name ){
    
        var data = { 
        
            name : name 
            
        };
        
        this.webSocket.emit('ThemeCategory.add', data );
        
    };
    
    
    /**
	* Nasłuchuje informacji o dodaniu nwej kategori motywów
	*
	* @method onAdded
    * @param {object} data informacje z serwera o dodaniu nowej kategori
	*/
    p.onAdded = function( data ){
    
        console.log('kategoria motywu została dodana');
        
    };
    
    
    /**
	* Emituje prosbe do serwera o zwrócenie wszystkich kategori motywów
	*
	* @method getAll
    * @param {String} name Nazwa nowej kategori
	*/
    p.getAll = function(){
        
        webSocket.emit('GetThemesCategories');
        console.log('wszystkie kategorie z motywów');
        //console.log( data );
    
    };
    
    
    /**
	* Nasłuchuje informacji o kategoriach motywów
	*
	* @method onGetAll
    * @param {object} data informacje z serwera o dodaniu nowej kategori
	*/
    p.onGetAll = function( data ){
    
        //console.log('jakie są kategorie');
        //console.log( data );
        $('.themeCategorySelect').empty();

        for( var i=0; i < data.length; i++ ){

            $('.themeCategorySelect').append( '<option value="'+data[i]._id+'">'+ data[i].name +'</option>' );

        }
        //$('.themeCategorySelect').append("<option></optionn").attr('value');

    };
    
    
    Editor.ThemeCategoryController = ThemeCategoryController;

})();