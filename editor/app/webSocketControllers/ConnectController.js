	/**
	* Klasa będąca kontrolerem strony motywu. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/PageController.js
	*
	* @class PageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ConnectController( webSocket ){
    
        this.adminRoom = null;
        this.webSocket = webSocket;
    
    };
    
    var p = ConnectController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;

        this.webSocket.on( 'Connect.requestCooperate', function( data ){

            //console.log( data );

            var respond = prompt('Pozwolic na wejscie? (yes/no)');

            _this.respondCooperate( respond, data.socketID, data.roomType );

        });

        this.webSocket.on( 'Connect.respondCooperate', function( data ){

            if( data.status == 'exist' ){

                //alert( 'nie powinno sie to wydarzyc' );

            }
            else if( data.status == 'joined' ){

                //console.log( data );
                //alert('zostales polaczony');

            }
            else if( data.status == 'rejected' ){

                //alert('nikt cie tu nie chce');

            }

        });

    };
        


    p.respondCooperate = function( respondText, socketID, roomType ){

        var data = {

            respond : respondText,
            socketID : socketID,
            roomType : roomType,
            objectID : Editor.getProjectId()

        };

        this.webSocket.emit( 'Connect.respondCooperate', data );

    };


    p.createAdminRoom = function( objectID, roomType, callback ){

        var _this = this;

        var data = {

            objectID : objectID,
            roomType : roomType

        };

        //console.log( data );

        this.webSocket.on('Connect.createAdminRoom', function( data ){

            //console.log( data );

            if( data.status == 'room_not_empty'){

                _this.requestCooperate( data.socketID, roomType );

            }
            else {

                callback( data );

            }


            _this.webSocket.removeListener( 'Connect.createAdminRoom' );

        });

        //console.log('co wysylam');
        //console.log( data );

        this.webSocket.emit( 'Connect.createAdminRoom', data );

    };


    p.requestCooperate = function( socketID, roomType, callback ){

        var data = {

            socketID : socketID,
            roomType : roomType

        };
        
        this.webSocket.emit( 'Connect.requestCooperate', data );

    };


    p.joinToViewRoom = function( connectID, adminProjectID, viewID ){



    };


    export {ConnectController};