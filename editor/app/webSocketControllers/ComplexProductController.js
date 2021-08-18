	/**
	* Klasa będąca kontrolerem ProductTypeController. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/productController.js
	*
	* @class ProductTypeController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ComplexProductTypeController( webSocket ){
    
        this.webSocket = webSocket;
           
    };
    
    var p = ComplexProductTypeController.prototype;

    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on( 'ComplexProductType.get', function( data ){

            if( data.status == 'empty' ){

                Editor.webSocketControllers.complexProductType.add( Editor.getProductId(), Editor.complexAdminProject.getProductGroups() );

            }
            else if( data.status == 'ok' ){

                Editor.webSocketControllers.complexAdminProject.getAll( Editor.getProductId(), function( data ){

                    //console.log('wlazlo');
                    //console.log( data );
                    
                    $("#overlay-loader").animate({ opacity: 0.1}, 1000, function(){ $("#overlay-loader").remove(); });
                    Editor.template.selectComplexProjectView( data.items );

                });

            }

        });

        this.webSocket.on( 'ComplexProductType.add', function( data ){

            if( data.status == 'ok' ){

                Editor.template.selectComplexProjectView( data );

            }
            else if( data.status == 'error' ) {

                console.error( 'ComplexProductType.add' );
                console.error( data.error );

            }

        });

    };


    p.addView = function( name, order ){

        var data = {

            complexAdminProject : Editor.getProductId(),
            name : name,
            order : order

        };

    };


    p.add = function( complexProductID, groups ){

        var data = {

            typeID : complexProductID,
            groups : groups

        };

        //console.log( data );

        this.webSocket.emit( 'ComplexProductType.add', data );


    }


    p.get = function( typeID ){


        var data = {

            typeID : typeID

        };

        this.webSocket.emit(  'ComplexProductType.get', data );        

    }

    
    export {ComplexProductTypeController};