import {WebSocketListener} from './WebSocketListener';
	/**
	* Klasa będąca kontrolerem View. Wysyła i odbiera emity z websocket'a. <br>
    * Plik : websocketControlers/fontController.js
	*
	* @class FontController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function FontController( webSocket, editor ){

        this.editor = editor;
        this.webSocket = webSocket;

        this._events = {

            'Font.get' : []

        };


    };

    var p = FontController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on( 'Font.add', function( data ){

            $('#overflow-box').remove();
            this.editor.fonts.loadFonts();
        }.bind( this ));


        this.webSocket.on('Font.get', function( data ){

            var findCallback = this._events['Font.get'][ data.evtID ];

            findCallback.run( data );

            this._events['Font.get'][ data.evtID ] = null;
            delete this._events['Font.get'][ data.evtID ];

        }.bind( this ));

    };

    p.add = function( fontInfo ){

        var data = fontInfo;
        this.webSocket.emit('Font.add', data );

    };


    p.getAll = function( callback ){

        var _this = this;

        this.webSocket.on( 'Font.getAll', function( data ){

            if( callback )
                callback( data );

            _this.webSocket.removeListener( 'Font.getAll' );


        });

        this.webSocket.emit( 'Font.getAll' );

    };


    p.get = function( fontFamily, callback ){

        var _this = this;

        var data = {

            fontFamily : fontFamily

        }

        var evt = new WebSocketListener( callback );

        data.evtID = evt.getID();

        this._events['Font.get'][data.evtID] = evt;

        this.webSocket.emit( 'Font.get', data );

    }

    p.onGet = function( data, callback ){



    };

    export {FontController};
