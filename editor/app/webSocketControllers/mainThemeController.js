import {safeImage} from "../utils";

/**
	* Klasa będąca kontrolerem MainThemeController. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/mainThemeController.js
	*
	* @class MainThemeController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function MainThemeController( webSocket, context ){

        this.webSocket = webSocket;
        this.editor = context;

    };

    var p = MainThemeController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        //this.webSocket.on( 'MainTheme.getPages', function( data ){ _this.onGetPages( data ); _this.getPagesCallBack( data ); });
        this.webSocket.on( 'MainTheme.added', function( data ){ _this.onAdded( data ); } );
        this.webSocket.on( 'MainTheme.getAll', function( data ){ _this.onGetAll( data ); } );
        this.webSocket.on( 'MainTheme.updated', function( data ){ _this.onUpdate( data ); } );
        this.webSocket.on( 'MainTheme.removed', data=>{console.log('removed theme, refresh editor :(')} );
        this.webSocket.on( 'MainTheme.removeProjectImage', function( data ){ _this.onRemoveProjectImage( data); } );
        this.webSocket.on( 'MainTheme.addedPage', function( data ){

            var waitingObjects = document.querySelectorAll('[waiting-for="Theme.addedPage"]');
            //console.log( waitingObjects );

            for( var i=0; i < waitingObjects.length; i++ ){

                $(waitingObjects[i]).trigger('Theme.addedPage');

            }

            //console.log('Wlazlo do callbacka');

            if( _this.addPageOnceCallback ) {
                //console.log('jebnelo');
                _this.addPageOnceCallback( data );
                _this.addPageOnceCallback = null;
            }

        });

        this.webSocket.on('MainTheme.copyPageFromLocal', function( data ){

            //console.log( data );
            //console.log( 'dobre info przyszlo' );
            data.is = 'copied';

            var themeElement = Editor.template.themePageElement( data );

            var currentNode = document.querySelector('.localThemePage[theme-page-id="'+data._id+'"]');
            currentNode.parentNode.replaceChild( themeElement, currentNode );

        });

    };

    p.onRemoveProjectImage = function( data ){

        //console.log( data );

        Editor.adminProject.format.theme.updatePhotos( data.from, data.images );

        if( data.from == 'themeImagesPhotos' ){

            Editor.template.activePhotoThemeImages();

        }
        else if( data.from == 'themeCliparts' ){

            Editor.template.activeClipartsThemeImages();

        }
        else if( data.from == 'themeImagesBackgrounds' ){

            Editor.template.activeBackgroundThemeImages();

        }

    };


   p.removeProjectImage = function( mainThemeID, projectImageUID, place ){

        var data = {

            mainThemeID     : mainThemeID,
            projectImageUID : projectImageUID,
            place           : place

        };

        this.webSocket.emit('MainTheme.removeProjectImage', data );

    };


    /**
    * Emituje prosbe do serwera o dodanie obrazu do projektu motywy
    *
    * @method addProjectImage
    * @param {String} uid unikalny identyfikator zdjęcia w obrębie projektu
    * @param {String} mainThemeID ID projektu do którego ma zostać dodane zdjęcie
    * @param {String} name Nazwa dodanego zdjęcia
    * @param {String} type Typ dodanego obietku
    * @param {String} imageUrl URL prowadzący do obrazka ( zładowanego na serwer )
    * @param {String} minUrl URL prowadzący do miniaturki obrazka ( zładowanego na serwer )
    * @param {String} thumbnail URL prowadzący do miniminiaturki obrazka ( zładowanego na serwer )
    * @param {Float}  width Szeroość obrazka
    * @param {Float}  height Wysokość obrazka
    * @param {Float}  trueWidth prawdiwa szerokość obrazka
    * @param {Float}  trueHeight prawdiwa Wysokość obrazka
    */
    p.addProjectPhoto = function( uid, mainThemeID, name , type, width, height, trueWidth, trueHeight ){

        var data = {

            uid : uid,
            mainThemeID : mainThemeID,
            name : name,
            type : type,
            width : width,
            height : height,
            trueHeight : trueHeight,
            trueWidth : trueWidth

        };

        this.webSocket.emit('MainTheme.addProjectPhoto', data );

    };


    /**
    * Emituje prosbe do serwera o dodanie obrazu do projektu motywy
    *
    * @method addProjectImage
    * @param {String} uid unikalny identyfikator zdjęcia w obrębie projektu
    * @param {String} mainThemeID ID projektu do którego ma zostać dodane zdjęcie
    * @param {String} name Nazwa dodanego zdjęcia
    * @param {String} type Typ dodanego obietku
    * @param {String} imageUrl URL prowadzący do obrazka ( zładowanego na serwer )
    * @param {String} minUrl URL prowadzący do miniaturki obrazka ( zładowanego na serwer )
    * @param {String} thumbnail URL prowadzący do miniminiaturki obrazka ( zładowanego na serwer )
    * @param {Float}  width Szeroość obrazka
    * @param {Float}  height Wysokość obrazka
    * @param {Float}  trueWidth prawdiwa szerokość obrazka
    * @param {Float}  trueHeight prawdiwa Wysokość obrazka
    */
    p.addProjectBackground = function( uid, mainThemeID, name, type,width, height, trueWidth, trueHeight ){

        //console.log('MainTheme.addProjectImage->Serwer');

        var data = {

            uid : uid,
            mainThemeID : mainThemeID,
            name : name,
            type : type,
            width : width,
            height : height,
            trueHeight : trueHeight,
            trueWidth : trueWidth

        };

        //console.log( data );

        this.webSocket.emit('MainTheme.addProjectBackground', data );

    };

    /**
    * Emituje prosbe do serwera o dodanie obrazu do projektu motywy
    *
    * @method addProjectImage
    * @param {String} uid unikalny identyfikator zdjęcia w obrębie projektu
    * @param {String} mainThemeID ID projektu do którego ma zostać dodane zdjęcie
    * @param {String} name Nazwa dodanego zdjęcia
    * @param {String} type Typ dodanego obietku
    * @param {String} imageUrl URL prowadzący do obrazka ( zładowanego na serwer )
    * @param {String} minUrl URL prowadzący do miniaturki obrazka ( zładowanego na serwer )
    * @param {String} thumbnail URL prowadzący do miniminiaturki obrazka ( zładowanego na serwer )
    * @param {Float}  width Szeroość obrazka
    * @param {Float}  height Wysokość obrazka
    * @param {Float}  trueWidth prawdiwa szerokość obrazka
    * @param {Float}  trueHeight prawdiwa Wysokość obrazka
    */
    p.addProjectClipart = function( uid, mainThemeID, name , type,  width, height, trueWidth, trueHeight ){

        //console.log('MainTheme.addProjectImage->Serwer');

        var data = {

            uid : uid,
            mainThemeID : mainThemeID,
            name : name,
            type : type,
            width : width,
            height : height,
            trueHeight : trueHeight,
            trueWidth : trueWidth

        };

        this.webSocket.emit('MainTheme.addProjectClipart', data );

    };


    /**
	* Dodaje do socketa pojedyńczy listener. Wykonany raz zostaje usunięty
	*
	* @method addSingleEventListener
    * @param {String} event Nazwa listenera
    * @param {Func} func Referencja do funkcji która ma zostać przypisana do listenera
	*/
    p.addSingleEventListener = function( event, func ){

        var _this = this;
        var func = func;

        this.webSocket.on( event, function( data ){

            func( data );
            _this.webSocket.removeListener( event );

        });

    };


    /**
	* Listener oczekujący informacji o modyfikacji motywu
	*
	* @method onUpdate
    * @param {Object}
	*/
    p.onUpdate = function( data ){

        var toUpdate = document.querySelectorAll('div[waiting-for="update"]');
        //console.log( toUpdate );

        var evt = document.createEvent("Event");
        evt.initEvent("updateTheme", true, false);

        for( var i=0; i < toUpdate.length; i++ ){

            toUpdate[i].dispatchEvent( evt );

        }

    };


    /**
	* Emituje prośbę o pobranie jednego motywu głównego
	*
	* @method get
    * @param {String} mainThemeID ID motywu głównego
	*/
    p.get = function( ID ){

        var data = {

            ID : ID

        };

        this.webSocket.emit( 'MainTheme.get', data );

    };


    p.update = function( mainThemeID, updated ){

        var data = {
            ID : mainThemeID,
        };

        for( var attribute in updated ){

            data[attribute] = updated[attribute];

        }

        //console.log( data );

        this.webSocket.emit( 'MainTheme.update', data );

    };


    /**
	* Emituje prośbę o pobranie wszystkich motywów głównych MainThema
	*
	* @method getPage
    * @param {String} name Nazwa nowego motywu
    * @param {String} categoryID ID kategori
	*/
    p.getAll = function(){

        this.webSocket.emit( 'MainTheme.getAll' );

    };

    p.addBackgroundsFromAssets = function( ids, theme ){

        this.webSocket.emit('MainTheme.addBackgroundsFromAssets', { ids: ids, themeID: theme });

    }


    p.addImagesFromAssets = function( ids, theme ){
        
        this.webSocket.emit('MainTheme.addImagesFromAssets', { ids: ids, themeID: theme });

    }

    p.addClipartsFromAssets = function( ids, theme ){
        
        this.webSocket.emit('MainTheme.addClipartsFromAssets', { ids: ids, themeID: theme });

    }

    p.addMasksFromAssets = function( ids, theme ){
        
        //console.log('LECI :)');
        this.webSocket.emit('MainTheme.addMasksFromAssets', { ids: ids, themeID: theme });

    }

    /**
	* Emituje proźbę o usunięcie motywu głównego
	*
	* @method remove
    * @param {String} mainThemeID Id motywu głównego który ma zostać usunięty
	*/
    p.remove = function( mainThemeID ){

        var data = {

            ID : mainThemeID

        };

        this.webSocket.emit( 'MainTheme.remove', data );

    };


    /**
	* Emituje proźbę o pobranie stron motywu
	*
	* @method remove
    * @param {String} mainThemeID Id motywu głównego który ma zostać usunięty
	*/
    p.getPages = function( mainThemeID, callback ){

        var _this = this;

        var data = {

            mainThemeID : mainThemeID

        };

        this.webSocket.emit('MainTheme.getPages', data );

        this.webSocket.on( 'MainTheme.getPages', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'MainTheme.getPages' );

        });

    };


    /**
	* Listener oczekujący na info o usunięciu motywu
	*
	* @method onRemove
    * @param {Object} data informacje otrzymane od serwera
	*/
    p.onRemove = function( data ){

        //console.log('------------------------');
        //console.log( data );
        //console.log('pomyśline usunięto kurwa');

    };


    /**
	* Listener oczekujący na informację o wszystkich motywach
	*
	* @method onGetAll
    * @param {Object} data Informacje przesłane z serwera o stronach motywu
	*/
    p.onGetAll = function( data ){

        this.editor.templateAdministration.displayAllThemesWindow( data );

    };


    /**
	* Emituje prośbę o dodanie MainThema
	*
	* @method getPage
    * @param {String} name Nazwa nowego motywu
    * @param {String} categoryID ID kategori
	*/
    p.add = function( name, categoryID, imageBase ){

        var data = {

            name : name,
            categoryID : categoryID,
            base64 : imageBase

        };

        this.webSocket.emit('MainTheme.add', data );

    };

    /**

	* Listener oczekujący na informację o dodaniu nowego motywu głównego
	*
	* @method onAdded
    * @param {Object} data Informacje przesłane z serwera o stronach motywu
	*/
    p.onAdded = function( data ){

        $("#newThemeWindow").remove();
        this.editor.template.infoOkView( "<h1>Motyw został dodany do bazy globalnej!</h1>",()=>{},()=>{} );

    };


    p.copyPageFromLocal = function( mainThemeID, themeID, themePageID ){

        var data = {

            mainThemeID : mainThemeID,
            themeID : themeID,
            themePageID : themePageID

        };

        this.webSocket.emit( 'MainTheme.copyPageFromLocal', data );

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
                Editor.webSocketControllers.productType.adminProject.theme.copyPageFromMainTheme(  currentThemeID, mainPageID );

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
	* Emituje prośbę o pobranie strony z motywu
	*
	* @method getPage
    * @param {String} themePageID ID strony do pobrania
	*/
    p.getPage = function( themePageID, callBack ){

        var _this = this;

        var data = {

            themePageID : themePageID

        };



        this.webSocket.emit('MainTheme.getPage', data );

    };


    p.useThemePage = function( currentPage, data ){

        var pages = Editor.stage.getPages();
        var page = pages[currentPage];
        page.loadThemePage( data );

    };


    /**
	* Emituje prośbę o pobranie stron z motywu
	*
	* @method getPages
    * @param {String} mainThemeID ID głównego motywu do którego ma zostać dodana strona
	*/
    /*
    p.getPages = function( mainThemeID, callback ){

        var data = {

            mainThemeID : mainThemeID

        };

        this.getPagesCallBack = callback;

        this.webSocket.emit('MainTheme.getPages', data );

    };
    */

    /**
	* Emituje prośbę o dodanie strony do motywu
	*
	* @method addPage
    * @param {String} mainThemeID ID głównego motywu do którego ma zostać dodana strona
	*/
    p.addPage = function( mainThemeID, name, width, height, backgroundObjects, foregroundObjects, order, vacancy, base64, callback  ){

        var data = {

            mainThemeID : mainThemeID,
            backgroundObjects : backgroundObjects,
            foregroundObjects : foregroundObjects,
            width : width,
            height : height,
            name : name,
            order : order,
            vacancy : vacancy,
            'base64' : base64

        };

        this.addPageOnceCallback = callback;
        this.webSocket.emit('MainTheme.addPage', data );

    };


export { MainThemeController }
