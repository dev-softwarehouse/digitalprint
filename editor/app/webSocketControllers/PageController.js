	/**
	* Klasa będąca kontrolerem strony motywu. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/PageController.js
	*
	* @class PageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function PageController( webSocket, context ){

        this.webSocket = webSocket;
        this.editor = context;

    };

    var p = PageController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on('Page.added', function( data ){ _this.onAdd( data ); });

        this.webSocket.on('Page.update', function( data ){

            _this.editor.adminProject.format.view.page.get().pageObject.updateObject();

        });

        this.webSocket.on('Page.remove', function( data ){

            _this.editor.adminProject.format.view.init( _this.editor.adminProject.format.view.getId() );

        });


    };


    p.saveRotation = function( pageID, rotation ){

        var data = {

            rotation : rotation,
            pageID : pageID

        };

        this.webSocket.emit( 'Page.saveRotation', data );

    };


    p.savePosition = function( pageID, x, y ){

        var data = {

            pageID : pageID,
            x : x,
            y : y

        };

        this.webSocket.emit( 'Page.savePosition', data );

    };


    p.onAdd = function( data  ){

        this.editor.adminProject.format.view.init( this.editor.adminProject.format.view.getId() );

    };

    p.update = function( toUpdate ){

        var data = {

            pageID : this.editor.adminProject.format.view.page.getID(),
            toUpdate : toUpdate

        };

        this.webSocket.emit('Page.update', data );

    };


    p.add = function( viewID, name, width, height, order, slope, type, rotation ){

        var data = {

            viewID : viewID,
            name : name,
            width : width,
            height : height,
            order : order,
            slope : slope,
            rotation : rotation,
            type: type

        };

        this.webSocket.emit('Page.add', data );

    };


    /**
    * Pobiera informacje o stronie projektu
    *
    * @method get
    */
    p.get = function( pageID, callback ){

        var _this = this;

        var data = {

            pageID : pageID

        };

        //console.log('wlazi');

        this.webSocket.on( 'Page.get', function( data ){

            //console.log('dostałem odpowiedz');
            //console.log( data );
            callback( data );

            _this.webSocket.removeListener( 'Page.get' );

        });

        this.webSocket.emit( 'Page.get', data );

    };


    p.remove = function( pageID ){

        var _this = this;

        var data = {

            pageID : pageID,
            viewID : this.editor.adminProject.format.view.getId()

        };

        this.webSocket.emit( 'Page.remove', data );

    }

export { PageController };
