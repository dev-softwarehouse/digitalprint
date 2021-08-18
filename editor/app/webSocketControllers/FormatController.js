	/**
	* Klasa będąca kontrolerem AdminProject. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/adminProjectController.js
	*
	* @class AdminProjectControler
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function FormatController( webSocket, editor ){
    
        this.webSocket = webSocket;
        this.editor = editor;

    };
    
    var p = FormatController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on('Format.error', function( data ){

            console.error( data );

        });

    };
        
    p.update = function( params ){

        var _this = this;
        
        var data = params

        this.webSocket.on('Format.update', function( data ){

            alert('Dane formatu zostału zaaktualizowane');
            this.webSocket.removeListener('Format.update');

        });

        this.webSocket.emit('Format.update', data );

    }


    /**
    * Powoduje załadowanie widoków i motywów dla konkrentego formatu
    *
    * @method load
    */
    p.load = function( adminProjectID, formatName, formatID, width, height, slope, callback ){

        var _this = this;

        var data = {

            adminProjectID : adminProjectID,
            formatID : formatID,
            width: width,
            height: height,
            slope : slope

        };

        this.webSocket.on('Format.load', function( data ){

            data.name = formatName;

            callback( data );
            _this.webSocket.removeListener( 'Format.load' );

        });

        this.webSocket.emit('Format.load', data );

    };


    /**
    * Pobiera informacje o danym formacie i wykonuje funkcę na otrzymanych danych
    *
    * @method get
    * @param {String} formatID Id formatu
    * @param {Function} callback Callback
    */
    p.get = function( formatID, callback ){

        var _this = this;

        var data = {

            formatID : formatID

        };

        this.webSocket.on( 'Format.get', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'Format.get' );

        });

        this.webSocket.emit( 'Format.get', data );

    };


    /**
    * Pobiera informacje o danym formacie względem id z bazy mysql i wykonuje funkcę na otrzymanych danych
    *
    * @method load
    * @param {String} formatID Id formatu
    * @param {Function} callback Callback
    */
    p.getByIntID = function( formatID, callback ){

        var _this = this;

        var data = {

            formatID : formatID

        };

        this.webSocket.on( 'Format.getByIntID', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'Format.getByIntID' );

        });

        this.webSocket.emit( 'Format.getByIntID', data );

    };


export {FormatController};