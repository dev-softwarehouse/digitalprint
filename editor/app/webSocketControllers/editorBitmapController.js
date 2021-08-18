
	/**
	* Klasa będąca kontrolerem EdytorBitmap. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/edytorBitmapController.js
	*
	* @class EditorBitmapController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function EditorBitmapController( webSocket, editor ){

        this.editor = editor;
        this.webSocket = webSocket;

    };


    var p = EditorBitmapController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on('EditorBitmap.savedPosition', this.savedPosition );
        this.webSocket.on('EditorBitmap.savedScale', this.onSaveScale );
        this.webSocket.on('EditorBitmap.added', function( data ){ _this.onAdded( data ); });
        this.webSocket.on('EditorBitmap.remove', function( data ){ _this.onRemove( data ); });
        this.webSocket.on('EditorBitmap.setBase', function( data ){ _this.onSetBase( data );});
        this.webSocket.on('EditorBitmap.unsetBase', function( data ){ _this.onSetBase( data );});
        this.webSocket.on('EditorBitmap.getAllBase', function( data ){ _this.onGetAllBase( data ); });
        //this.webSocket.on('EditorBitmap.setOptions', function( data ){ _this.onSetOptions( data ); });

    };


    p.addOptionalBitmap = function( ){


    };


    p.get = function( editorBitmapID, callback ){

        var _this = this;

        var data = {

            editorBitmapID : editorBitmapID

        };

        this.webSocket.on('EditorBitmap.get', function(data){

            callback( data );

            _this.webSocket.removeListener('EditorBitmap.get');

        });

        this.webSocket.emit('EditorBitmap.get', data );

    }


    /**
    * Pobiera wsztstkie base objecy z konkretnego widoku
    *
    * @method getAllBase
    * @param {String} viewID ID widoku
    */
    p.getAllBase = function( viewID ){

        var data = {

            viewID : viewID

        };

        this.webSocket.emit('EditorBitmap.getAllBase', data );

    };


    /**
    * Listener oczekujacy na informacje z serwera o wszystkich obiektach głównych z aktualnego widoku
    *
    * @method onGetAllBase
    * @param {JSON} data informacje przysłane z serwera
    */
    p.onGetAllBase = function( data ){

        this.editor.templateAdministration.updateAttributesBase( data );

    };


    /**
    * Listener oczekujacy na informacje z serwera o zmiania obiektów głównych
    *
    * @method setBase
    * @param {JSON} data informacje przysłane z serwera
    */
    p.onSetBase = function( data ){

        this.editor.templateAdministration.updateAttributesBase( data );

    };




    /**
    * Ustawia editorbitmpe jako base object (mozemy wtedy dostosować go cechami)
    *
    * @method setBase
    * @param {String} editorBitmapID id edytorBitmap, który ma zostać base objectem
    */
    p.setBase = function( editorBitmapID , viewID ){

        var data = {

            editorBitmapID : editorBitmapID,
            viewID : viewID

        };

        this.webSocket.emit('EditorBitmap.setBase', data );

    };


    /**
    * Ustawia editorbitmpe jako base object (mozemy wtedy dostosować go cechami)
    *
    * @method setBase
    * @param {String} editorBitmapID id edytorBitmap, który ma zostać base objectem
    */
    p.unsetBase = function( editorBitmapID , viewID ){

        var data = {

            editorBitmapID : editorBitmapID,
            viewID : viewID

        };

        this.webSocket.emit( 'EditorBitmap.unsetBase', data );

    };


    p.addAsOption = function( adminProjectID, projectImageUID, parentID, options, pos, width, height, rotation, scaleX, scaleY, callback ){

        var _this = this;

        var data = {

            adminProjectID : adminProjectID,
            projectImageUID : projectImageUID,
            parentID : parentID,
            options : options,
            pos : pos,
            width : width,
            height : height,
            rotation : rotation,
            scaleX : scaleX,
            scaleY : scaleY

        };

        this.webSocket.on('EditorBitmap.addAsOption', function( data ){

            //Editor.templateAdministaration.updateBaseOptions( data );
            callback( data );
            _this.webSocket.removeListener( 'EditorBitmap.addAsOption' );

        });

        this.webSocket.emit( 'EditorBitmap.addAsOption', data );

    };


    p.clone = function( editorBitmapID, viewID, addTo ){

        var data = {

            editorBitmapID : editorBitmapID,
            viewID : viewID,
            addTo : addTo

        };

        this.webSocket.emit( 'EditorBitmap.clone', data );

    };


    /**
    * Dodaje EditorBitmap
    *
    * @method add
    */
    p.add = function( projectImageUID, viewID, x, y, width, height, order, addTo, addToId, settings ){

        settings = settings || {};
        var data = {

            projectImageUID : projectImageUID,
            viewID : viewID,
            x : x,
            y : y,
            width : width,
            height : height,
            order : order,
            addTo : addTo,
            addToId : addToId

        };
        var _data = $.extend( data, settings );
        //console.log( _data );
        //console.log( '+++++++++++++++++++++++++++++++++++++++++' );
        this.webSocket.emit( 'EditorBitmap.add', _data );

    };


    p.setTransform = function( x, y, rotation, scaleX, scaleY, dbID ){

        var data = {

            editorBitmapID : dbID,
            x : x,
            y : y,
            rotation : rotation,
            scaleX : scaleX,
            scaleY : scaleY

        };

        this.webSocket.emit( 'EditorBitmap.setTransform', data );

    };


    p.onAdded = function( data ){

        if( data.viewID == Editor.adminProject.format.view.getId() ){

            var projectImage = Editor.adminProject.getProjectImage( data.ProjectImage.uid ) || data.ProjectImage;

            data.dbID = data._id;
            //console.log( data );

            var newEditorBitmap = new Editor.Bitmap( projectImage.name, projectImage.minUrl, true, true, data );

            Editor.stage.initObjectDefaultEvents( newEditorBitmap );
            newEditorBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );

            if( data.addTo == 'View' ){

                Editor.stage.addObject( newEditorBitmap );
                Editor.adminProject.format.view.addEditorBitmap( newEditorBitmap, data.order );

                Editor.tools.setEditingObject( newEditorBitmap.id);
                Editor.tools.init();

            }

            Editor.templateAdministration.updateLayers( Editor.adminProject.format.view.getLayer().children );

        }

    };


    p.onRemove = function( data ){

        if( data.viewID == Editor.adminProject.format.view.getId() ){

            //console.log('informacje o usunietym obrazie');
            //console.log( data );

            Editor.stage.getObjectByDbId( data.editorBitmapID ).parent.removeChild(Editor.stage.getObjectByDbId( data.editorBitmapID ));
            Editor.templateAdministration.updateLayers( Editor.adminProject.format.view.getLayer().children );

        }

    };


    p.remove = function( editorBitmapID, viewID, addTo, addToId ){

        var data = {

            editorBitmapID : editorBitmapID,
            viewID : viewID,
            addTo : 'view',
            addToId : addToId

        };

        this.webSocket.emit('EditorBitmap.remove', data );

    };


    /**
    * Listener nasłuchujący zmiany pozycji bitmapy w bazie danych
	*
	* @method savedPosition
    * @param {Object} data Informacje o  zmianie pozycji obiektu
	*/
    p.savedPosition = function( data ){

    };


	/**
    * Wysyła emita do serwera 'EditorBitmap.savePosition'. Z prośbą o zapisanie pozycji obiektu
	*
	* @method savePosition
    * @param {String} editorBitmapID ID bitmapy do przesuniecia
    * @param {Float} x Pozycja x
    * @param {Float} y Pozycja y
	*/
    p.savePosition = function( editorBitmapID, x, y ){

        var data = {

            editorBitmapID : editorBitmapID,
            x : x,
            y : y

        };

        this.webSocket.emit('EditorBitmap.savePosition', data );

    };


    /**
    * Zwraca opcje obiektu głównego.
    *
    * @method getOptions
    * @param {Object} editorBitmapID Id bitmapy której opcje chcemy dostać
    */
    p.getOptions = function( editorBitmapID, callback ){

        var _this = this;

        var data = {

            editorBitmapID : editorBitmapID

        };

        this.webSocket.on('EditorBitmap.getOptions', function( data ){

            callback( data );

            _this.webSocket.removeListener( 'EditorBitmap.getOptions' );

        });

        this.webSocket.emit('EditorBitmap.getOptions', data );

    };


    /**
    * Zwraca opcje obiektu głównego.
    *
    * @method getOptions
    * @param {Object} editorBitmapID Id bitmapy której opcje chcemy dostać
    */
    p.setOptions = function( editorBitmapID, viewID ,options, callback ){

        var _this = this;

        var data = {

            editorBitmapID : editorBitmapID,
            viewID : viewID,
            options : options

        };

        this.webSocket.on('EditorBitmap.setOptions', function( data ){

            callback( data );

            _this.webSocket.removeListener('EditorBitmap.setOptions');

        });

        this.webSocket.emit('EditorBitmap.setOptions', data );

    };


    p.setAttributes = function( editorBitmapID, viewID ,options, callback ){

        var _this = this;

        var data = {

            editorBitmapID : editorBitmapID,
            viewID : viewID,
            options : options

        };

        //console.log('leci zapisywanie ');

        this.webSocket.on('EditorBitmap.setAttributes', function( data ){

            if( callback )
                callback( data );

            _this.webSocket.removeListener('EditorBitmap.setAttributes');

        });

        this.webSocket.emit('EditorBitmap.setAttributes', data );

    };


    p.onSetOptions = function( data ){

        //console.log( data );
        //alert('jest odpowiedz');

    };



    /**
    * Listener nasłuchujący zmiany skali bitmapy w bazie danych
	*
	* @method savedPosition
    * @param {Object} data Informacje o  zmianie pozycji obiektu
	*/
    p.onSaveScale = function( data ){



    };


	/**
    * Wysyła emita do serwera 'EditorBitmap.saveScale'. Z prośbą o zapisanie skali obiektu
	*
	* @method saveScale
    * @param {String} editorBitmapID ID bitmapy do przesuniecia
    * @param {Float} x Pozycja x
    * @param {Float} y Pozycja y
	*/
    p.saveScale = function( x, y, scaleX, scaleY, editorBitmapID ){

        var data = {

            editorBitmapID : editorBitmapID,
            x : x,
            y : y,
            scaleX : scaleX,
            scaleY : scaleY

        };

        this.webSocket.emit('EditorBitmap.saveScale', data );

    };

    p.setSettings = function( editorBitmapID, settings ){

        var data = {

            editorBitmapID : editorBitmapID,
            settings       : settings
        }

        this.webSocket.emit('EditorBitmap.setSettings', data );

    };

    export {EditorBitmapController}
