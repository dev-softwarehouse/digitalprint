	/**
	* Klasa będąca kontrolerem View. Wysyła i odbiera emity z websocket'a. <br>
    * Plik : websocketControlers/viewController.js
	*
	* @class ViewControler
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function UserController( webSocket, token, editor ){

        this.webSocket = webSocket;
        this.token = token;
        this.editor = editor;

    };

    var p = UserController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(  ){



    };


    p.loadProject = function( projectID, callback ){

        var _this = this;

        var data = {

            projectID : projectID

        };

        this.webSocket.on('User.loadProject', function( data ){

            callback( data);
            _this.webSocket.removeListener('User.loadProject');

        });

        this.webSocket.emit( 'User.loadProject', data );

    };


    p.getFullProject = function( projectID, callback ){

        var data = {

            userProject : projectID

        };

        this.webSocket.on( 'User.getFullProject', function( data ){

            if( callback )
                callback( data );

        });

        this.webSocket.emit( 'User.getFullProject', data );

    }


    p.getProjectIdForProduct = function( productID ){

        var data = {

            typeID : typeID,
            userID : userID

        };

        this.webSocket.emit( 'User.getProjectIdForProduct', data );

    };


    /*
        var displayUserPhotos = function( userID ){

            alert('podajesz userID: ' + userID );

            Editor.webSocketControllers.user.getPhotos( userID, function( data ){

                console.log( data );
                alert('zobacz');

                var photos = document.createElement('div');
                photos.id = 'currentUserPhotos';

            });

        };
    */

    
    p.addComplexProject = function( productsID, formatsID, attributes, pages, typeID, callback  ){
        
        var data = {
            products: productsID,
            formats: formatsID,
            attributes: attributes,
            pages: pages,
            typeID: typeID,
            token: this.token
        };

        this.webSocket.on( 'User.addComplexProject', ( data ) => {

            callback( data );
            this.webSocket.removeListener( 'User.addComplexProject' );

        });

        this.webSocket.emit( 'User.addComplexProject', data );

    }


    // 135 format ID
    p.addProject = function( typeID, formatID, pages, attributes, callback ){

        var _this = this;

        var data = {

            token     : this.token,
            typeID     : typeID,
            formatID   : formatID,
            pages      : pages,
            attributes : attributes

        };

        this.editor.template.creatingProject();

        this.webSocket.on( 'User.addProject', function( data ){

            $('.overflowloader .overflow-content').html('Trwa przygotowywanie projektu...');
            callback( data );
            //console.log( data );
            
            //console.log('8888888888888888888888888888888888888888888888888888');
            _this.webSocket.removeListener( 'User.addProject' );
            //Editor.user.project.init( data );

        });

        this.webSocket.emit( 'User.addProject', data );

    };


    p.getPhotos = function( userID, callback ){

        var _this = this;

        var data = {

            userID : userID,

        };

        this.webSocket.on( 'User.getPhotos', function( data ){

            if( callback )
                callback( data );

            _this.webSocket.removeListener( 'User.getPhotos' );

        });

        this.webSocket.emit( 'User.getPhotos', data );

    };

    export {UserController};
