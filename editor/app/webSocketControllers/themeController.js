import {WebSocketListener} from './WebSocketListener';
import {safeImage} from "../utils";

    var tempData;
	/**
	* Klasa będąca kontrolerem themeController. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/themeController.js
	*
	* @class ThemeController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ThemeController( webSocket, editor ){

        this.editor = editor;
        this.webSocket = webSocket;
        this._events = {

            'Theme.getThemeFonts' : []

        };

    };

    var p = ThemeController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;
        var Editor = this.editor;
        this.webSocket.on('Theme.getThemeFonts', function( data ){

            var findCallback = this._events['Theme.getThemeFonts'][ data.evtID ];

            findCallback.run( data );

            this._events['Theme.getThemeFonts'][ data.evtID ] = null;
            delete this._events['Theme.getThemeFonts'][ data.evtID ];

        }.bind( this ));

        this.webSocket.on('Theme.updateThemes', function( data ){

            Editor.templateAdministration.updateThemes( data );

        });

        this.webSocket.on( 'Theme.getPages', function( data ){

            _this.onGetPages( data );
            //Editor.templateAdministaration.update

        });

        this.webSocket.on('Theme.added', function( data ){

            _this.onAdded( data );

        });

        this.webSocket.on('Theme.getUsedPages', function( data ){

            //console.log('jest tu gdzie chce');

            this.editor.templateAdministration.updateThemePages( this.editor.adminProject.format.theme.getParentThemeID(), this.editor.adminProject.format.theme.getID(), data );

        }.bind( this ));

        this.webSocket.on('Theme._getUsedPages', function( data ){

            //console.log('jest tu gdzie chce');
            //console.log( this );
            this.editor.templateAdministration.updateThemePages( data.mainThemeID, data.themeID, data.pages );

            if( $('#saveThemePageWindow').length )
                $('#saveThemePageWindow').remove();

            var elementsToEmit = document.querySelectorAll('*[waiting-for="_getUsedPages"]');
            //console.log('elementy do emita');
            //console.log( elementsToEmit );

            var evt = document.createEvent("Event");
            evt.initEvent("_getUsedPages", true, false);

            for( var i=0; i< elementsToEmit.length; i++ ){

                elementsToEmit[i].dispatchEvent( evt );

            }

        }.bind( this ));

        this.webSocket.on('Theme.copiedThemes', function( data ){

            //console.log(' dostalem date');
            _this.onAdded( data );

        });

        this.webSocket.on('Theme.removed', function( data ){

            _this.onRemoved( data );
            tempData = data;
            //console.log(tempData);

        });

        this.webSocket.on('Theme.addLocalPage', function( data ){

            //console.log('Dodano strone lokalną');
            //console.log( data );

        });

        this.webSocket.on('Theme.removeLocalPage', function( data ){

            //console.log( data );

            $('.localThemePage[theme-page-id='+ data._id +']').remove();

        });

        this.webSocket.on('Theme.removeCopiedPage', function( data ){

            data.is = 'main';

            var themeElement = Editor.template.themePageElement( data );

            var currentNode = document.querySelector('.addedThemePage[data-theme-page-id="'+data.removedThemePageID+'"]');
            currentNode.parentNode.replaceChild( themeElement, currentNode );

        });

        this.webSocket.on('Theme.copyPageFromMainTheme', function( data ){

            _this.webSocket.emit( 'Theme.getUsedPages', { themeID : Editor.adminProject.format.theme.getID() } );

            //Editor.adminProject.format.theme.addCopiedPage( data );

            var themePageData = {

                is : 'copied',
                _id: data.newThemePageID,
                url: data.url,

            };


            var elementsToEmit = document.querySelectorAll('*[waiting-for="_getUsedPages"]');
            //console.log('elementy do emita');
            //console.log( elementsToEmit );

            var evt = document.createEvent("Event");
            evt.initEvent("Theme_copyPageFromMainTheme", true, false);

            for( var i=0; i< elementsToEmit.length; i++ ){

                elementsToEmit[i].dispatchEvent( evt );

            }


            var themeElement = Editor.template.themePageElement( themePageData );

            var currentNode = document.querySelector('.mainThemePage[data-theme-page-id="'+ data.mainThemePageID +'"]');
            currentNode.parentNode.replaceChild( themeElement, currentNode );

        });
        //this.webSocket.on( 'Theme.copiedPageFromMainTheme', this.onCopyPageFromMainTheme );

    };


    /**
    * Kopiuje motywy z innego formatu
    *
    * @method removeLocalPage
    * @param {String} themeID ID id motywu
    * @param {String} themePageID id themepage
    */
    p.removeLocalPage = function( themeID, themePageID ){

        var data = {

            themeID : themeID,
            themePageID : themePageID

        };

        //console.log( data );
        //console.log('poszedl emit');

        this.webSocket.emit( 'Theme.removeLocalPage', data );

    };


    p.addBackgroundsFromAssets = function( ids, theme ){
        
        this.webSocket.emit('Theme.addBackgroundsFromAssets', { ids: ids, themeID: theme });

    }

    /**
    * Kopiuje motywy z innego formatu
    *
    * @method copyThemes
    * @param {String} formatID ID formatu do krótego ma zostać skopiowane motywy
    * @param {Array} themes Tablica z ID motywów które mają zostać skopiowane
    */
    p.copyThemes = function( formatID, themes ){

        var data = {

            formatID : formatID,
            themes : themes

        };

        this.webSocket.emit('Theme.copyThemes', data );

    };


    /**
    * Listener oczekujący na widomość od serwera o dodaniu motywu do projektu, i tworzy go w edytorze
    *
    * @method onAdded
    * @param {JSON} data informacje z serwera o dodaniu motywu do projektu
    */
    p.onAdded = function( data ){

        //console.log( data );
        //console.log('=--==-=--==-=-=-=-');
        //Editor.adminProject.format.updateThemes( data );

       //Editor.adminProject.loadWS();


        //alert("TEST 1");
        //console.log(data);

        //Editor.templateAdministaration.updateThemes( data );
        this.editor.templateAdministration.updateThemes( data );
        //alert("TEST 2");

    };



    /**
    * Wysyła emita do serwera 'AdminProject.getThemes' i oczekuje odpowiedzi 'AdminProject.getThemes' w której
    * która zawiera wszystkie Motywy dołączone do tego projektu
    *
    * @method getAll
    * @param {String} projectID ID projektu
    */
    p.getAll = function( formatID ){

        function onGetThemes( data ){
            //console.log('Serwer->AdminProject.getThemes');
            this.webSocket.removeListener( 'AdminProject.getThemes', onGetThemes );
        };

        var data = {

            projectID : projectID

        };

        this.webSocket.on('AdminProject.getThemes', onGetThemes );
        this.webSocket.emit('AdminProject.getThemes', data );

    };


    /**
    * Emituje prośbę do serwera o dodanie motywu do projektu
    *
    * @method add
    * @param {String} mainThemeID ID motywu głównego, którego kopia zostanie dodana do projektu.
    * @param {String} projectID ID projectu do którego ma zostać dodany motyw
    */
    p.add = function( mainThemeID, formatID ){

        var data = {

            mainThemeID : mainThemeID,
            formatID : formatID

        };

        this.webSocket.emit('Theme.add', data );

    };


    /**
    * Pobiera informacje o stronach motywu użytych, nie użytych oraz lokalnych itp...
    *
    * @method getUsedPages
    * @param {String} themeID id motywu  z krótego chce sie wydobyć informacje
    */
    p.getUsedPages = function( themeID, callback ){

        var _this = this;

        var data = {
            themeID : themeID
        };

        this.webSocket.on('Theme.getUsedPages', function(data){
            callback( data );
            _this.webSocket.removeListener('Theme.getUsedPages');
        });

        this.webSocket.emit('Theme.getUsedPages', data );

    };


    /**
	* oczekuje inforamcji o skopiowaniu strony
	*
	* @method onCopyPageFromMainTheme
    * @param {Object} data informacje z serwera o skopiowaniu strony
	*/
    p.onCopyPageFromMainTheme = function( data ){

        //console.log('-=-=-=-=-=-=-=-=-=-=');
        //console.log( data );
        //console.log('-=-=-=-=-=-=-=-=-=-=');

    };


    p.getPages = function( themeID ){

        //console.log('czekam na strony');
        this.webSocket.emit('Theme.getPages', { themeID : themeID } );

    };


    /**
	* Listener oczekujący na informację o stronach motywqu głównego
	*
	* @method onGetPages
    * @param {Object} data Informacje przesłane z serwera o stronach motywu
	*/
    p.onGetPages = function( data ){

        $("#themeContent .themepages").html('');

        var maxWidth = $("#themeContent .themepages").innerWidth();

        for( var i=0; i < data.length; i++ ){

            var themePageTitle = document.createElement('span');
            themePageTitle.className = 'themeName';
            themePageTitle.innerHTML = data[i].name;
            themePageTitle.setAttribute('data-theme-name', data[i].name );

            var themePage = document.createElement('div');
            //themePage.setAttribute( 'data-themePage-id', data[i]._id );
            themePage.className = 'themePage';
            //themePage.style.backgroundImage = 'url(' + data[i].url + ')';
            themePage.setAttribute( 'data-main-theme-page-id', data[i]._id );
            themePage.appendChild( themePageTitle );

            var copyThemePage = document.createElement('div');
            copyThemePage.className = 'copyThemePage toolButton';
            copyThemePage.innerHTML = '+';
            copyThemePage.setAttribute( 'data-main-theme-page-id', data[i]._id );


            copyThemePage.addEventListener('click', function( e ){

                e.stopPropagation();
                var currentThemeID = '54f6f27f4d0428af608384e4';
                var mainPageID = this.getAttribute( 'data-main-theme-page-id' );
                Editor.webSocketControllers.theme.copyPageFromMainTheme( currentThemeID, mainPageID );

            });

            var themeThumbnail = safeImage();
            themeThumbnail.src = EDITOR_ENV.staticUrl+data[i].url;
            themePage.appendChild( themeThumbnail );
            themePage.appendChild( copyThemePage );
            // trzeba zrobić klase css '.waitingForThemePages' i to updejtować

            themePage.addEventListener('click', function(){

                //console.log('emit');
                Editor.webSocketControllers.productType.adminProject.mainTheme.getPage( this.getAttribute( 'data-main-theme-page-id' ) );

            });

            $("#themeContent").append( themePage );

        };

    };

    /**
	* Dołącza stronę z motywu głównego do motywu projektu
	*
	* @method copyPageFromMainTheme
    * @param {String} themeID ID motywu do którego zostanie skopiowana strona
    * @param {String} mainThemePageID ID strony zmotywu głównego, która ma zostać skopiowana
	*/
    p.copyPageFromMainTheme = function( themeID, mainThemePageID, mainThemeID ){

        var data = {

            themeID : themeID,
            mainThemePageID : mainThemePageID,
            mainThemeID : mainThemeID

        };

        //console.log( 'co wysylam' );
        //console.log( data );

        this.webSocket.emit('Theme.copyPageFromMainTheme', data );

    };


    /**
    * Usuwa skopiowaną stronę motywu z lokalnego projektu motywu.
    *
    * @method removeCopiedPage
    * @param {String} themeID ID motywu z którego zostanie usunięta strona
    * @param {String} themePageID ID strony z motywu loklnego, która ma zostać usunięta
    */
    p.removeCopiedPage = function( themePageID, themeID ){

        var data = {

            themePageID : themePageID,
            themeID : themeID

        };

        //console.log('co wysyłam zeby usunac skopiowana strone');
        //console.log( data );

        this.webSocket.emit('Theme.removeCopiedPage', data );

    };


    /**
    * Emituje prośbę o dodanie strony do motywu do lokalnej kopi z motywy głównego
    *
    * @method addPageLocally
    */
    p.addLocalPage = function( themeID, name, width, height, backgroundObjects, foregroundObjects, order, vacancy, base64  ){

        var data = {

            themeID : themeID,
            backgroundObjects : backgroundObjects,
            foregroundObjects : foregroundObjects,
            width : width,
            height : height,
            name : name,
            order : order,
            vacancy : vacancy,
            'base64' : base64

        };

        this.webSocket.emit('Theme.addLocalPage', data );

    };


    /**
    * Usuwa lokalną stronę motywu potomnego
    *
    * @method removeLocallyPage
    */
    p.removeLocallyPage = function( themeID, themePageID ){

        var data = {

            themeID : themeID,
            themePageID : themePageID

        };

        this.webSocket.emit( 'Theme.removeLocallyPage', data );

    };


    /**
    * Listener oczekujący na widomość od serwera o usunieciu motywu z projektu
    *
    * @method onRemoved
    * @param {data} data Informacje wysłane przez serwer na temat usuniecia motywu z projektu.
    */
    p.onRemoved = function( data ){

        //console.log(data);
        this.editor.templateAdministration.updateThemes( data );

    };


    /**
    * Emituje prośbę do serwera o usuniecie motywu z projektu
    *
    * @method remove
    * @param {String} themeID ID motywu który ma zostać usunięty z porjektu
    * @param {String} formatID ID projectu z którego ma zostać usunięty motyw
    */
    p.remove = function( themeID, formatID ){

        var data = {

            themeID : themeID,
            formatID : formatID

        };

        //console.log(data);

        this.webSocket.emit('Theme.remove', data );

    };


    /**
    * Klonuje stronę motywu i tworzy z niej lokalną nową stronę
    *
    * @method clonePage
    * @param {String} themeID ID motywu do którego ma zostać skopiowana strona
    * @param {String} themePageID ID strony która ma zostać skopiowana
    */
    p.clonePage = function( themeID, themePageID ){

        var data = {

            themeID : themeID,
            themePageID : themePageID

        };

        this.webSocket.emit( 'Theme.clonePage', data );

    };


    p.get = function( themeID, callback ){

        var _this = this;

        var data = {

            themeID : themeID

        };

        this.webSocket.on('Theme.get', function( data ){

            callback( data );
            _this.webSocket.removeListener('Theme.get');

        });



        this.webSocket.emit('Theme.get', data);

    };


    p.getThemeFonts = function( themeID, callback ){

        var data = {

            themeID : themeID

        };

        //console.log( data );
        //console.log('90099090090909909090099009');

        var evt = new WebSocketListener( callback );

        data.evtID = evt.getID();

        this._events['Theme.getThemeFonts'][data.evtID] = evt;

        this.webSocket.emit( 'Theme.getThemeFonts', data );

    };


    p.setThemeFonts = function( themeID, fontsNames ){

        var data = {

            themeID : themeID,
            fontsNames : fontsNames

        };

        this.webSocket.emit( 'Theme.setThemeFonts', data );

    };


    p.setBackgroundFrames = function( themeID, framesIDS ){

        var data = {

            themeID : themeID,
            framesIDS : framesIDS

        };

        this.webSocket.emit( 'Theme.setBackgroundFrames', data );

    }

    p.getFullBackgroundFrames = function( themeID, callback ){

        var data = {

            themeID : themeID

        };

        this.webSocket.emit( 'Theme.getFullBackgroundFrames', data );

        if( callback ){

            this.webSocket.on('Theme.getFullBackgroundFrames', function( data ){

                this.webSocket.removeListener( 'Theme.getFullBackgroundFrames' );
                callback( data );

            }.bind(this));

        }

    };

    p.onCloneCopiedPage = function( data ){

        //console.log( 'zostało to sklonowane :)' );

    };

    p.cloneCopiedPage = function( themeID, themePageID ){

        var data = {

            themeID : themeID,
            themePageID : themePageID

        };

        //console.log('wysylam zapytanie oklonowanie');

        this.webSocket.emit('Theme.cloneCopiedPage', data );

    };

    p.getBackgroundFrames = function( themeID, callback ){

        var data = {

            themeID : themeID

        };

        this.webSocket.emit( 'Theme.getBackgroundFrames', data );

        if( callback ){

            this.webSocket.on('Theme.getBackgroundFrames', function( data ){

                this.webSocket.removeListener( 'Theme.getBackgroundFrames' );
                callback( data );

            }.bind(this));

        }

    };

export { ThemeController };
