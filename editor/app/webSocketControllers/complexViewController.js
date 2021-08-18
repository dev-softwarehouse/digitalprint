	/**
	* Klasa będąca kontrolerem ComplexView. Wysyła i odbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/ComplexViewController.js
	*
	* @class ComplexViewController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ComplexViewController( webSocket ){
    
        this.webSocket = webSocket;
    
    };
    
    var p = ComplexViewController.prototype;

    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;

        this.webSocket.on( 'ComplexView.setViewObject', function( data ){

            //console.log( data );
            //Editor.complexAdminProject.complexView.addViewObject();

            var viewObject = new Editor.EditorComplexViewObject( true, data.item.View );
            var groupLayer = Editor.complexAdminProject.complexView.getGroupLayer( data.groupLayer.complexGroupID );

            Editor.stage.addObject( viewObject );
            groupLayer.addChild( viewObject  );

        });

    };


    /**
    * Pobiera informacje o complexView
    *
    * @method get
    * @param {String} complexViewID Id widoku kompleksowego
    * @param {Function} callback Funkcja zwrotna
    */
    p.get = function( complexViewID, options, callback ){

        var _this = this;

        var data = {

            complexViewID : complexViewID,
            options : options

        };

        this.webSocket.on( 'ComplexView.get', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'ComplexView.get' );

        });

        this.webSocket.emit( 'ComplexView.get', data  );

    };


    p.addViewObject = function( complexViewID, viewID, layerGroupID, formatID, typeID ){

        var data = {

            complexViewID : complexViewID,
            viewID : viewID,
            layerGroupID : layerGroupID,
            formatID : formatID,
            typeID : typeID

        };

        this.webSocket.emit( 'ComplexView.addViewObject', data );

    };


    /**
    * Pobiera informacje o complexView
    *
    * @method get
    * @param {String} complexViewID Id widoku kompleksowego
    * @param {Function} callback Funkcja zwrotna
    */
    /*
    p.add = function( complexViewID, callback ){

        var data = {

            complexViewID : complexViewID

        };

        this.webSocket.on( 'ComplexView.get', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'ComplexView.get' );

        });

        this.webSocket.emit( 'ComplexView.get', data  );

    };
    */
    
    export {ComplexViewController};