	/**
	* Klasa będąca kontrolerem AdminProject. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/adminProjectController.js
	*
	* @class AdminComplexProjectController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function AdminComplexProjectController( webSocket, editor ){
    
        this.webSocket = webSocket;
        this.editor = editor;
        this.adminProject = editor.adminProject;
    
    };
    
    var p = AdminComplexProjectController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on( 'ComplexAdminProject.add', function( data ){

            if( data.status == 'ok' ){

                Editor.template.selectComplexProjectView( data.items );

            }
            else {

                console.log( data.error );

            }

        });


        this.webSocket.on( 'ComplexAdminProject.addComplexView', function( data ){

            //console.log( data );
            //alert( 'rafalze powiedział' );
            

        });

    };
    

    p.addComplexView = function( name, order, complexAdminProjectID, productsLayers ){

        var data = {

            name : name,
            order : order,
            complexAdminProjectID : complexAdminProjectID,
            groupLayers : productsLayers

        };

        this.webSocket.emit( 'ComplexAdminProject.addComplexView', data );

    };


    p.add = function( typeID, name ){

        var data = {

            typeID : typeID,
            name   : name

        };

        //console.log( data );

        this.webSocket.emit( 'ComplexAdminProject.add', data );

    };


    p.getAll = function( typeID, callback  ){

        var _this = this;

        var data = {

            typeID : typeID

        };

        this.webSocket.on('ComplexAdminProject.getAll', function( data ){

            //console.log( data );

            _this.webSocket.removeListener('ComplexAdminProject.getAll');

            if( data.status == 'ok' ){

                callback( data );

            }
            else {

                alert('wystąpił błąd na serwerze');

            }

        });

        //console.log( data );

        this.webSocket.emit( 'ComplexAdminProject.getAll', data );

    };


    p.get = function( complexAdminProjectID, callback ){

        var data = {

            complexAdminProjectID : complexAdminProjectID

        };

        this.webSocket.on( 'ComplexAdminProject.get', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'ComplexAdminProject.get' );

        });

        this.webSocket.emit( 'ComplexAdminProject.get', data );

    };    


	/**
    * Wysyła emita do serwera 'AdminProject.get' i oczekuje odpowiedzi 
	*
	* @method load
    * @param {String} projectID Id Projectu który ma zostać wczytant
	*/
    p.load = function( complexAdminProjectID ){
        
        var _this = this;
        
        Editor.webSocketControllers.connector.createAdminRoom( complexAdminProjectID, 'ComplexAdminProject', function( data ){

            $('#selectProject').remove();

            function onLoad( data ){

                var acpID = data.item._id;
                var _data = data.item;

                $('#selectProject').remove();

                if( !Editor.isInited )
                    Editor.complexAdminProject.loadWS( _data, complexAdminProjectID );

                Editor.isInited = true;

                _this.webSocket.removeListener('AdminComplexProjectController.load', onLoad );

            };


            _this.webSocket.removeListener('AdminComplexProjectController.load', onLoad );
            
            _this.webSocket.on('ComplexAdminProject.load', onLoad );
            _this.webSocket.emit('ComplexAdminProject.load', { complexAdminProjectID : complexAdminProjectID });

        });



    };
    
    
    export {AdminComplexProjectController};
