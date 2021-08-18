import {WebSocketListener} from './WebSocketListener';
    /**
	* Klasa będąca kontrolerem strony motywu. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/ThemePageController.js
	*
	* @class ThemePageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ThemePageController( webSocket, editor ){

        this.editor = editor;
        this.webSocket = webSocket;
        this._events = {

            'ThemePage.getThemeBackgroundFrames' : [],
            'ThemePage.getFonts' : []

        };

    };

    var p = ThemePageController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on( 'ThemePage.getThemeBackgroundFrames', function( data ){

            var findCallback = this._events['ThemePage.getThemeBackgroundFrames'][ data.evtID ];

            findCallback.run( data );

            this._events['ThemePage.getThemeBackgroundFrames'][ data.evtID ] = null;
            delete this._events['ThemePage.getThemeBackgroundFrames'][ data.evtID ];

        }.bind(this));

        this.webSocket.on( 'ThemePage.getFonts', function( data ){

            var findCallback = this._events['ThemePage.getFonts'][ data.evtID ];

            findCallback.run( data );

            this._events['ThemePage.getFonts'][ data.evtID ] = null;
            delete this._events['ThemePage.getFonts'][ data.evtID ];

        }.bind(this));

    };


    p.getFonts = function( themePageID, callback ){

        var data = {

            themePageID: themePageID

        };

        var evt = new WebSocketListener( callback );

        data.evtID = evt.getID();

        this._events['ThemePage.getFonts'][data.evtID] = evt;

        this.webSocket.emit('ThemePage.getFonts', data );

    };

    p.getThemeBackgroundFrames = function( themePageID, callback ){

        var data = {

            themePageID: themePageID

        };

        var evt = new WebSocketListener( callback );

        data.evtID = evt.getID();

        this._events['ThemePage.getThemeBackgroundFrames'][data.evtID] = evt;

        this.webSocket.emit('ThemePage.getThemeBackgroundFrames', data );

    };

    p.setDefaultSettings = function( themePageID, settings, callback ){

        var _this = this;

        var data = {

            themePageID : themePageID,
            settings    : settings

        };

        this.webSocket.on( "ThemePage.setDefaultSettings", function( data ){

            _this.webSocket.removeListener("ThemePage.setDefaultSettings");

            if( callback ){

                callback( data );

            }

        });

        this.webSocket.emit('ThemePage.setDefaultSettings', data );

    }

    p.changeObjectsOrder = function(){

        var data = {

            themePageID : Editor.adminProject.format.view.page.themePage.getID(),

        };

        //console.log('cos wysylam');

        this.webSocket.emit( 'ThemePage.changeObjectsOrder', data );

    };

    p.update = function( themePageID, objectsInfo, miniature, callback ){

        var _this = this;

        var data = {

            themePageID : themePageID,
            objectsInfo : objectsInfo,
            miniature : miniature

        };

        this.webSocket.on( 'ThemePage.update', function( data ){

            if( callback )
                callback( data );
            _this.webSocket.removeListener( 'ThemePage.update' );

        });

        this.webSocket.emit('ThemePage.update', data );

    };


    /**
    * Pobiera informacje o stronie motywu
    *
    * @method get
    */
    p.get = function( themePageID, callback ){

        var _this = this;

        var data = {

            themePageID : themePageID

        };

        this.webSocket.on('ThemePage.get', function( data ){

            callback( data );

            _this.webSocket.removeListener( 'ThemePage.get' );

        });

        this.webSocket.emit('ThemePage.get', data );

    };

    p.getSelectedProposedTemplates = function( themePageID, imagesCount, textsCount, callback ){

        var _this = this;

        var data = {

            themePageID : themePageID,
            imagesCount : imagesCount,
            textsCount  : textsCount

        };

        this.webSocket.on( 'ThemePage.getSelectedProposedTemplates', function( data ){

            //console.log( data );

            if( callback )
                callback( data );

            _this.webSocket.removeListener( 'ThemePage.getSelectedProposedTemplates' );

        });

        this.webSocket.emit( 'ThemePage.getSelectedProposedTemplates', data );

    };

    p.updateImage = function( themePageID, image64 ){

        var data = {

            themePageID : themePageID,
            image64 : image64

        };

        this.webSocket.emit( 'ThemePage.updateImage', data );

    };

    /*
    p.update = function( data ){

        this.webSocket.emit( 'ThemePage.update', data );

    };
    */

    /**
    * Usuwa strone motywu ( na wieki wiekow )
    *
    * @method remove
    */
    p.remove = function( themePageID ){

        var data = {

            themePageID : themePageID

        };

        this.webSocket.emit( 'ThemePage.remove', data );

    };


    export { ThemePageController };
