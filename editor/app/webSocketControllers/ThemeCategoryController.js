	/**
	* Klasa będąca kontrolerem ThemeCategoryController. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/ThemeCategoryController.js
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
        
        this.webSocket.on('ThemeCategory.getAll', function( data ){ _this.onGetAll( data ); } );
        this.webSocket.on('ThemeCategory.added', function( data ){ _this.onAdd( data ); });
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
        
        $('.themeCategorySelect').html('');
        
        for( var i=0; i < data.length; i++ ){
        
            $('.themeCategorySelect').append('<option value="'+ data[i]._id +'">'+data[i].name+'</option>');
            
        }
        
    };
    
    
    p.add = function( name ){
        
        this.webSocket.emit('ThemeCategory.add', { name : name });
    
    };
    
    
    p.onAdd = function( data ){
    
        //console.log('dodano kategorie');
        //console.log( data );
        Editor.templateAdministaration.updateThemeCategorySelects( data );
    
    };

    
    export { ThemeCategoryController };
