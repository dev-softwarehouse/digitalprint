import {WebSocketListener} from './WebSocketListener';
    /**
	* Klasa będąca kontrolerem userView. Wysyła i odbiera emity z websocket'a. <br>
    * Plik : websocketControlers/viewController.js
	*
	* @class UserViewController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function UserViewController( webSocket, userID ){

        this.webSocket = webSocket;
        this.userID = userID;
        this._events = this._events = {
            
            'UserView.get' : []

        };
    };

    var p = UserViewController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(  ){

        this.webSocket.on( 'UserView.get', function( data ){

            var findCallback = this._events['UserView.get'][ data.evtID ];
            //console.log( data.evtID );
            //console.log('++++++++++++++++++++++++++++++++++++++++++++++');
            //console.log('++++++++++++++++++++++++++++++++++++++++++++++');//console.log('++++++++++++++++++++++++++++++++++++++++++++++');//console.log('++++++++++++++++++++++++++++++++++++++++++++++');
            
            if( findCallback ){

                findCallback.run( data.view );
                this._events['UserView.get'][ data.evtID ] = null;
                delete this._events['UserView.get'][ data.evtID ];

            }
            
        }.bind( this ) );

    };

    // 135 format ID
    p.get = function( userViewID, callback ){

        var _this = this;

        var evt = new WebSocketListener( callback );

        var data = {

            userViewID  : userViewID,
            evtID : evt.getID()

        };

        this._events['UserView.get'][data.evtID] = evt;



        try {
          this.webSocket.emit( 'UserView.get', data );
        } catch( e ){

          console.log( e );

        }

    };

    p.saveMiniature = function( userViewID ){



    }

    export {UserViewController};
