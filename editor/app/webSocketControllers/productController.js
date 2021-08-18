    
	/**
	* Klasa będąca kontrolerem ProductTypeController. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/productController.js
	*
	* @class ProductTypeController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ProductTypeController( webSocket, editor ){
    
        this.webSocket = webSocket;
        this.editor = editor;
           
    };
    
    var p = ProductTypeController.prototype;

    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on( 'ProductType.getAttributesForGroups', function( data ){

            Editor.product.setAttributes( data );

        });

        /*this.webSocket.on( 'AdminProject.addedProjectImage', this.onAddedProjectImage );
        this.webSocket.on( 'AdminProject.addedTheme', this.onAddedTheme );
        this.webSocket.on( 'AdminProject.removedTheme', this.onRemovedTheme );
        this.webSocket.on( 'AdminProject.remove', function( data ){ _this.onRemoved( data ) } );
        this.webSocket.on( 'AdminProject.removedProjectImage', function( data ){ _this.onRemovedProjectImage( data ); });
        this.webSocket.on( 'AdminProject.setFontColors', function( data ){ _this.onSetFontColors( data ); } );
        this.webSocket.on( 'AdminProject.addColor', function( data ){ _this.onAddColor( data ); } );
        this.webSocket.on( 'AdminProject.setActiveColors', function( data ){ _this.onSetActiveColors( data ); } );*/

    };

    


    p.getAttributesForGroups = function(){

        var _this = this;

        var data = {};

        for( var i=0; i < arguments.length; i++ ){

            // typeID to id produktu
            data[ arguments[i].groupName ] = arguments[i].typeID;

        }

        this.webSocket.emit('ProductType.getAttributesForGroups', data );

    };


    /**
    * Zwraca ID aktywnego produktu
    *
    * @method getActiveProject
    */
    p.getActiveAdminProject = function( typeID ){

        var _this = this;

        var data = {

            typeID : typeID
        };

        this.webSocket.on('ProductType.getActiveAdminProject', function( data ){
            
            //console.log("::: Czytam ID aktywnego produktu :::");
            //console.log(data);
            _this.webSocket.removeListener( 'ProductType.getActiveAdminProject' );

        });


        this.webSocket.emit('ProductType.getActiveAdminProject', data);
         
    }
    
    export {ProductTypeController};
