import {WebSocketListener} from './WebSocketListener';

	/**
	* Klasa będąca kontrolerem View. Wysyła i odbiera emity z websocket'a. <br>
    * Plik : websocketControlers/viewController.js
	*
	* @class ViewControler
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ViewController( webSocket, context ){

        this.webSocket = webSocket;
        this.editor = context;
        this._events = this._events = {
            
            'View.get' : []

        };
    };

    var p = ViewController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on( 'View.get', function( data ){

            var findCallback = this._events['View.get'][ data.evtID ];

            if( findCallback ){

                findCallback.run( data.view );
                this._events['View.get'][ data.evtID ] = null;
                delete this._events['View.get'][ data.evtID ];

            }
            
        }.bind( this ) );

        this.webSocket.on( 'View.removeText', function( data ) { _this.onRemoveText( data ); } );
        this.webSocket.on( 'View.addedEditorBitmap', this.onAddedEditorBitmap );
        this.webSocket.on( 'View.addedPage', this.onAddedPage );
        this.webSocket.on( 'View.changeView', this.onChange );
        this.webSocket.on( 'View.removed', this.onRemoved );
        this.webSocket.on( 'View.added', function( data ){

            _this.onAdded(data);

        });
        this.webSocket.on( 'View.moveObjects', function( data ){

            Editor.adminProject.format.view.updateObjects( false, data.objectsInfo );

        });

        this.webSocket.on( 'View.update', function( data ){

            //console.log( data );

        });

        this.webSocket.on( 'View.addNewText', function( data ){ _this.onAddNewText( data ); } );

    };

    p.removeObject = function( removedInfo, objectsInfo, viewID ){

        var data = {

            removedInfo : removedInfo,
            objectsInfo : objectsInfo,
            viewID : viewID

        };

        this.webSocket.emit( 'View.removeObject', data );

    };


    /**
    * Listener oczekujący na widomość od serwera o zmianie widoku. Odświeża scene i wyświetla widok
    *
    * @method change
    * @param {String} viewID ID widoku który chcemy wyświetlić
    */
    p.change = function( viewID ){

        var data = {

            viewID : viewID

        };

        this.webSocket.emit( 'View.change', data );

    };


    p.moveObjects = function( objectsInfo, viewID ){

        var data = {

            objectsInfo : objectsInfo,
            viewID : viewID

        };

        this.webSocket.emit( 'View.moveObjects', data );

    };


    p.changeObjectsOrders = function( objects ){

        var data = {

            objects : objects,
            viewID : Editor.adminProject.format.view.getID()

        };

        this.webSocket.emit('View.changeObjectsOrders', data);

    };

    /**
    * Pobiera informacje o widoku
    *
    * @method get
    * @param {String} viewID ID widoku który chcemy wyświetlić
    */
    p.get = function( viewID, options, callback ){

        var _this = this;
        var evt = new WebSocketListener( callback );
        var data = {

            viewID : viewID,
            options : options,
            evtID: evt.getID()

        };

        this._events['View.get'][data.evtID] = evt;

        this.webSocket.emit('View.get', data);

    };


    p.onRemoveText = function( data ){

        var view = Editor.adminProject.format.view;
        var object = Editor.stage.getObjectByDbId( data.editorTextID );
        //console.log( object );

        var editing_id = Editor.tools.getEditObject();

        if( editing_id == object.id ){

            Editor.tools.setEditingObject( null );
            Editor.tools.init();

        }

        view.removeEditorText( object );


    };


    p.removeText = function( viewID, editorTextID ){

        var data = {

            viewID : viewID,
            editorTextID : editorTextID

        };

        this.webSocket.emit('View.removeText', data );

    };


    /**
    * Listener oczekujący na widomość od serwera o zmianie widoku. Odświeża scene i wyświetla widok
    *
    * @method onChange
    * @param {JSON} data informacje z serwera o dodaniu motywu do projektu
    */
    p.onChange = function( data ){

        Editor.adminProject.view.init( data );
        Editor.stage.updateView();

    };


    p.update = function( toUpdate ){

        var data = {

            viewID : this.editor.adminProject.format.view.getId(),
            toUpdate : toUpdate

        };

        this.webSocket.emit( 'View.update', data );

    };


    /**
    * Wysyła emita do serwera z prośbą o dodanie widoku
    *
    * @method addView
    * @param {String} name Nazwa widoku
    * @param {Int} order kolejność widoku
    * @param {String} projectID ID projektu
    */
    p.add = function( name, order, formatID ){

        var data = {
            name : name,
            order : order,
            formatID : formatID
        };

        this.webSocket.emit('View.add', data );

    };


    /**
    * Listener oczekujący na widomość od serwera o dodaniu widoku do projektu, i tworzy go w edytorze
    *
    * @method onAdded
    * @param {JSON} data Informacje o nowo utworzonym widoku
    */
    p.onAdded = function( data ){

        this.editor.adminProject.format.setViews( data );
        this.editor.templateAdministration.updateViews( data );
        //this.change( data );

    };


    /**
    * Wysyła emita do serwera z prośbą o usuniecie widoku
    *
    * @method removeView
    * @param {String} viewID ID widoku
    */
    p.remove = function( viewID ){

        this.webSocket.emit('View.remove', viewID );

    };


    /**
    * Listener oczekujący na informację o usunięciu widoku
    *
    * @method onRemoved
    * @param {JSON} data Inforamajce od serwera w sprawie usunięcia obiektu
    */
    p.onRemoved = function( data ){

        Editor.adminProject.removeView( data );

    };


    /**
    * Emituje prosbe o usuniecie obiektu ze sceny
    *
    * @method removeObject
    * @param {String} objectDBID ID obiektu, ktory ma zostac usuniety
    */
    p.removeObject = function( objectDBID){

        //console.log('emituje usuniecie obiektu: ' + objectDBID );

    };


    /**
	* Listener oczekujący na widomość od serwera o dodaniu strony do widoku. Dodaje stronę do sceny
	*
	* @method onAddedPage
    * @param {JSON} data informacje z serwera o dodaniu strony do widoku
	*/
    p.onAddedPage = function( data ){

        Editor.adminProject.view.addPage( data );

    };


    /**
	* Wysyła emita z prośbą o dodanie strony do widoku
	*
	* @method addPage
    * @param {String} viewID ID widoku do którego ma zostać dodana bitmapa
    * @param {String} name Nazwa nowo dodanej strony
    * @param {Float} width Szerokość dodanej bitmapy ( miniatura)
    * @param {Float} height Wyokość dodanej bitmapy ( miniatura)
    * @param {Float} slope Spad na stronie
    * @param {Float} x Pozycja x
    * @param {Float} y Pozycja y
    * @param {Float} rotation Rotacja
	*/
    p.addPage = function( viewID, name, width, height, slope, x, y, rotation ){

        var data = {
            viewID : viewID,
            name : name,
            width : width,
            height : height,
            slope : slope,
            x : x,
            y : y,
            rotation : rotation
        };

        this.webSocket.emit('View.addPage', data );

    };


    p.addNewText = function( viewID, name, x, y, width, height, rotation, order ){

        var data = {

            viewID : viewID,
            text : {

                name : name,
                width : width,
                height : height,
                x : x,
                y : y,
                rotation : rotation,
                order : order

            }

        };

        this.webSocket.emit('View.addNewText', data );

    };


    p.onAddNewText = function( data ){

        var text = data.text;

        var object = new Editor.Text2( text.name, 20, text.width, text.height, false, true );
        //object.order =
        object.init( object._currentFontSize, false );
        object.generateCursorMap();
        object.prepareMagneticLines( Editor.getMagnetizeTolerance() );
        object.dbID = text._id;
        object.setTrueHeight( text.height );
        object.setTrueWidth( text.width );
        object._updateShape();

        object.setPosition_leftCorner( text.x, text.y );

        Editor.stage.addObject( object );
        Editor.adminProject.format.view.getLayer().addChildAt( object, text.order );

    };


    /**
	* Listener oczekujący na widomość od serwera o dodaniu obrazu do widoku. Odświeża scene i wyświetla bitmape
	*
	* @method onAddEditorBitmap
    * @param {JSON} data informacje z serwera o dodaniu bitmpay do widoku
	*/
    p.onAddedEditorBitmap = function( data ){

        var newEditorBitmap = new Editor.Bitmap( data.ProjectImage.name, data.ProjectImage.minUrl, true );
        newEditorBitmap.uid = data.uid;
        newEditorBitmap.dbID = data._id;
        newEditorBitmap.x = data.x;
        newEditorBitmap.y = data.y;
        newEditorBitmap.dbID = data._id;
        newEditorBitmap.setBounds( 0, 0, data.ProjectImage.width, data.ProjectImage.height  );
        newEditorBitmap.width = data.ProjectImage.width;
        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").drawRect(0, 0, data.ProjectImage.width, data.ProjectImage.height );
        newEditorBitmap.hitArea = hit;
        newEditorBitmap.height = data.ProjectImage.height;
        newEditorBitmap.regX = data.ProjectImage.width/2;
        newEditorBitmap.regY = data.ProjectImage.height/2;
        newEditorBitmap.trueHeight = data.ProjectImage.trueHeight;
        newEditorBitmap.trueWidth = data.ProjectImage.trueWidth;
        var projectImage = Editor.adminProject.getProjectImage(data.ProjectImage.uid);
        Editor.stage.addObject( newEditorBitmap );
        Editor.stage.initObjectDefaultEvents( newEditorBitmap );
        newEditorBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );
        Editor.adminProject.view.addEditorBitmap( newEditorBitmap, data.order );

    };


    /**
	* Wysyła emita z prośbą o dodanie bitmapy do projektu
	*
	* @method addEditorBitmap
    * @param {String} projectImageUID Unikalny Id
    * @param {String} viewID ID widoku do którego ma zostać dodana bitmapa
    * @param {Object} pos Obiekt { x, y} opisujący pozycję dodawanej bitmapy
    * @param {Float} width Szerokość dodanej bitmapy ( miniatura )
    * @param {Float} height Wyokość dodanej bitmapy ( miniatura )
    * @param {Int} order Kolejność dodanej bitmapy
	*/
    p.addEditorBitmap = function( projectImageUID, viewID, pos, width, height, order ){

        var data = {
            projectImageUID : projectImageUID,
            viewID : viewID,
            pos : pos,
            width : width,
            height : height,
            order : order
        };

        this.webSocket.emit( 'View.addEditorBitmap', data );

    };


    export {ViewController};
