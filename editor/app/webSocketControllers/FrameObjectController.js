import {WebSocketListener} from './WebSocketListener';

	/**
	* Klasa będąca kontrolerem strony motywu. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/PageController.js
	*
	* @class PageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function FrameObjectController( webSocket, editor ){
        
        this.editor = editor;
        this.webSocket = webSocket;
        this._events = {

            'FrameObject.get' : []

        };
    
    };
    
    var p = FrameObjectController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
    
        this.webSocket.on('FrameObject.add', function( data ){

            _this.onAdd( data );

        });

        this.webSocket.on('FrameObject.remove', function( data ){

            _this.onRemove( data );

        });

        this.webSocket.on('FrameObject.get', function( data ){

            var findCallback = this._events['FrameObject.get'][ data.evtID ];
            
            findCallback.run( data );

            this._events['FrameObject.get'][ data.evtID ] = null;
            delete this._events['FrameObject.get'][ data.evtID ];

        }.bind(this));

    };
      
    p.get = function( id, callback ){

        var data = {

            id: id

        };

        var evt = new WebSocketListener( callback );

        data.evtID = evt.getID();

        this._events['FrameObject.get'][data.evtID] = evt;

        this.webSocket.emit('FrameObject.get', data );

    }

    p.getAll = function( callback ){

        this.webSocket.emit('FrameObject.getAll', {} );
        this.webSocket.on( 'FrameObject.getAll', function( data ){

            this.webSocket.removeListener( 'FrameObject.getAll' );

            if( callback )
                callback( data );

        }.bind( this ));

    };

    p.add = function( x, y, width, height, projectImageID, uploadID ){

        //console.log( {x:x, y:y, width:width, height:height, projectImageID:projectImageID, uploadID:uploadID} );
        var data = {

            x: x,
            y: y,
            width: width,
            height: height,
            ProjectImage : projectImageID,
            Upload : uploadID

        };

        this.webSocket.emit('FrameObject.add', data );

    };


    p.onAdd = function( data  ){

        this.editor.templateAdministaration.addFrameObject( data );

    };

    p.remove = function( frameObjectID ){

        var data = {

            frameObjectID : frameObjectID

        };

        this.webSocket.emit( 'FrameObject.remove', data );

    };

    p.onRemove = function( data ){

        //console.log( data );
        //console.log('object ramki zostal usuniety :)');
        this.editor.templateAdministaration.removeFrameObject( data );

    };

export { FrameObjectController };