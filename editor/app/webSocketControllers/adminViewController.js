
    
	/**
	* Klasa będąca kontrolerem AdminView. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/adminProjectController.js
	*
	* @class AdminViewController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function AdminViewController( webSocket, editor ){
        
        //console.log( editor );

        this.webSocket = webSocket;
        this.adminProject = editor.adminProject;
        this.editor = editor;
    
    };
    
    var p = AdminViewController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on( 'AdminView.get', this.onGet );
        this.webSocket.on( 'AdminView.removeText', this.onRemoveText );

    };

    
    /**
    * Inicjalizuje podstawowe nasłuchiwacze
    *
    * @method get
    */
    p.get = function( adminViewID, callback ){

        var data = {

            adminViewID : adminViewID

        };

        this.webSocket.emit( 'AdminView.get', data );

    };


    p.removeText = function( viewID, textID ){

        var data = {

            viewID : viewID,
            textID : textID

        };

        this.webSocket.emit('AdminView.removeText', data );

    };


    /**
    * Usuwa tekst z widoku, o podanym id
    *
    * @method onRemoveText
    */
    p.onRemoveText = function( data ){

        //console.log( data );
        console.log('TODO info o');

    };


    export {AdminViewController};