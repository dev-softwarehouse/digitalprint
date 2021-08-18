   
	/**
	* Klasa będąca kontrolerem AdminProject. Wysyła iodbiera emity z websocket'a. <br> 
    * Plik : websocketControlers/adminProjectController.js
	*
	* @class AdminProjectControler
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function AdminProjectController( webSocket, editor ){
    
        this.webSocket = webSocket;
        this.editor = editor;
        this.adminProject = editor.adminProject;
    
    };
    
    var p = AdminProjectController.prototype;
    
    
    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){
        
        var _this = this;
        
        this.webSocket.on( 'AdminProject.addedProjectImage', this.onAddedProjectImage );
        this.webSocket.on( 'AdminProject.addedTheme', this.onAddedTheme );
        this.webSocket.on( 'AdminProject.removedTheme', this.onRemovedTheme );
        this.webSocket.on( 'AdminProject.remove', function( data ){ _this.onRemoved( data ) } );
        this.webSocket.on( 'AdminProject.removedProjectImage', function( data ){ _this.onRemovedProjectImage( data ); });
        this.webSocket.on( 'AdminProject.setFontColors', function( data ){ _this.onSetFontColors( data ); } );
        this.webSocket.on( 'AdminProject.addColor', function( data ){ _this.onAddColor( data ); } );
        this.webSocket.on( 'AdminProject.setActiveColors', function( data ){ _this.onSetActiveColors( data ); } );
        this.webSocket.on( 'AdminProject.addFont', function( data ){ _this.onAddFont( data ); } );
        this.webSocket.on( 'AdminProject.removeFont', function( data ){ _this.onRemoveFont( data ); } );

    };
    

    /**
    * Ustala aktywne kolory dla edycji tekstu oraz ramek.
    *
    * @method setActiveColors
    */  
    p.setActiveColors = function( colorArray ){

        var data = {

            adminProjectID : Editor.adminProject.getProjectId(),
            colors : colorArray

        };

        this.webSocket.emit( 'AdminProject.setActiveColors', data );

    };



    p.setProjectAvatar = function( data,callback  ){
        
        var _this = this;

        var data = {

            URL : URL,
            adminProjectID : adminProjectID

        }


        this.webSocket.on('AdminProject.setProjectAvatar', function(data){

            callback( data );
            _this.webSocket.removeListener('AdminProject.setProjectAvatar');

        });

        this.webSocket.emit( 'AdminProject.setProjectAvatar', data);


      

    };

    /*
    p.getFormats = function( adminProjectID,callback ){

        var _this = this;

        var data = {

            adminProjectID : adminProjectID

        };

        this.webSocket.on('AdminProject.getFormats', function(data){

            callback( data );
            _this.webSocket.removeListener('AdminProject.getFormats');

        });

        this.webSocket.emit('AdminProject.getFormats', data );

    };
    */


    p.onRemoveFont = function( data ){

        //console.log( data );
        console.log('TODO dostalem informacje o usunieciu fonta');

    };


    p.removeFont = function( adminProjectID, fontID ){

        var data = {

            adminProjectID : adminProjectID,
            fontID         : fontID

        };

        this.webSocket.emit('AdminProject.removeFont', data);

    };


    p.onAddFont = function( data ){

        //console.log( data );
        console.log('TODO przyszła informacja o dodaniu czcionki');

    };



    p.addNewFont = function(adminProjectID, fontID ){

        var data = {

            adminProjectID : adminProjectID,
            fontID         : fontID

        };

        this.webSocket.emit('AdminProject.addFont', data);

    };


    /**
    * Nasłuchiwacz zmiany aktywności kolorów czcionek
    *
    * @method onSetActiveColors
    */  
    p.onSetActiveColors = function( data ){

        //console.log( data );

        Editor.adminProject.setActiveColors( data );
        Editor.templateAdministaration.updateProjectColors();

    };


    /**
    * Ustala dostępne kolory tektus dla projektu.
    *
    * @method setFontColors
    */          
    p.setFontColors = function( colorArray ){

        var data = {

            colors : colorArray

        };

        this.webSocket.emit( 'AdminProject.setColors', data );

    };


    p.addColor = function( color ){

        var data = {

            adminProjectID : Editor.adminProject.getProjectId(),
            color : color

        };

        this.webSocket.emit( 'AdminProject.addColor', data );

    };


    p.onAddColor = function( data ){

        Editor.adminProject.setColors( data );
        Editor.templateAdministaration.updateProjectColors();

    };


    p.onSetFontColors = function( data ){

        //console.log( data );
        //console.log( '===============' );

    };


    /**
    * dodaje project do formatu
    *
    * @method add
    */  
    p.addForFormat = function( formatID ){



    };


    /**
    * Pobiera wszystkie formaty dla danego specyficznego projektu
    *
    * @method getFormats
    * @param {String} adminProjectID ID projektu
    */
    p.getFormats = function( adminProjectID,callback ){

        var _this = this;

        var data = {

            adminProjectID : adminProjectID

        };

        this.webSocket.on('AdminProject.getFormats', function(data){

            callback( data );
            _this.webSocket.removeListener('AdminProject.getFormats');

        });

        this.webSocket.emit('AdminProject.getFormats', data );

    };


    /**
    * Pobiera wszystkie formaty dla danego specyficznego projektu
    *
    * @method getAllForFormat
    * @param {String} adminProjectID ID projektu
    * @param {Func} callback Callback
    */
    p.getAllFormats = function( adminProjectID, callback ){

        var _this = this;

        var data = {

            adminProjectID : adminProjectID

        };

        this.webSocket.on( 'AdminProject.getAllFormats', function( data ){

            callback( data );

            _this.webSocket.removeListener('AdminProject.getAllFormats');

        });

        this.webSocket.emit( 'AdminProject.getAllFormats', data );

    };


    /**
    * Pobiera wszystkie projekty dla danego specyficznego formatu
    *
    * @method getAllForFormat
    * @param {JSON} data informacje z serwera o dodaniu motywu do projektu
    */
    p.getAllForFormat = function( formatID ){

        var data = {

            formatID : formatID

        };

        this.webSocket.emit('AdminProject.getAllForFormat', data );

    };


    /**
	* Listener oczekujący na widomość od serwera o dodaniu obrazu do projektu, i tworzy go w edytorze
	*
	* @method onAddedProjectImage
    * @param {JSON} data informacje z serwera o dodaniu motywu do projektu
	*/
    p.onAddedProjectImage = function( data ){
    
        //console.log('Serwer->AdminProject.addedProjectImage');
        var projectImg = new Editor.ProjectImage( data.uid, data._id );
        projectImg.init( null, data.minUrl, data.trueWidth, data.trueHeight, data.width, data.height );
        Editor.adminProject.addProjectImage( projectImg );
        Editor.templateAdministaration.updateProjectImages();
        
    };
    
    
    /**
	* Emituje prosbe do serwera o dodanie obrazu do projektu
	*
	* @method addProjectImage
    * @param {String} uid unikalny identyfikator zdjęcia w obrębie projektu
    * @param {String} projectID ID projektu do którego ma zostać dodane zdjęcie
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
    p.addProjectImage = function( uid, projectID, name , type, imageUrl, minUrl, thumbnail, width, height, trueWidth, trueHeight ){
        
        //console.log('AdminProject.addProjectImage->Serwer');
        
        var data = {
            
            uid : uid,
            projectID : projectID,
            name : name,
            type : type,
            imageUrl : imageUrl,
            minUrl : minUrl,
            thumbnail : thumbnail,
            width : width,
            height : height,
            trueHeight : trueHeight,
            trueWidth : trueWidth
            
        };
        
        this.webSocket.emit('AdminProject.addProjectImage', data );
        
    };
    
    
    /**
	* Emituje prosbe do serwera o usunięcie obrazu z projektu
	*
	* @method removeProjectImage
    * @param {String} projectImageID ID obrazu do usuniecia
	*/
    p.removeProjectImage = function( projectImageID ){
        
        webSocket.emit('AdminProject.removeProjectImage', projectImageID );
        
    };
    
    
    p.onRemovedProjectImage = function( data ){
    
        this.adminProject.removeProjectImage( data.uid );
        // to chyba powinno sie wykonac w admin projekcie
        Editor.templateAdministaration.updateProjectImages();
    
    };

    
    /**
	* Listener oczekujący na widomość od serwera o dodaniu motywu do projektu, i tworzy go w edytorze
	*
	* @method onAddedTheme
    * @param {JSON} data informacje z serwera o dodaniu motywu do projektu
	*/
    p.onRemoved = function( data ){
    
        $('#selectProject').remove();  
        webSocket.emit( 'ProductType.getAdminProjects', { typeID : 43 } );
        
    };
    
    
    /**
	* Emituje prośbę do serwera o usuniecie projektu
	*
	* @method remove
    * @param {String} projectID ID projektu który ma zostać usunięty
	*/
    p.remove = function( projectID ){
        
        var _this = this;        
        /*
        var data = { 

            ID : projectID,            
        };
        */

        var idString = projectID.ID.toString();

        //console.log("ID usunanego projektu: "+idString);

        if (confirm('Usuwasz projekt - Czy na pewno chcesz usunąć projekt?')) {

            $("[data-project-id="+idString+"]").remove();
            _this.webSocket.emit('AdminProject.remove', projectID );
            

        } else {

            //console.log("Rezygnacja z usunięcia projektu");

        }

    };
    

	/**
    * Wysyła emita do serwera 'AdminProject.get' i oczekuje odpowiedzi 
	*
	* @method load
    * @param {String} projectID Id Projectu który ma zostać wczytant
	*/
    p.load = function( projectID ){
        
        var _this = this;
        
        function onLoad( data ){

            var apID = data._id;
            var _data = data;

            _this.editor.webSocketControllers.connector.createAdminRoom( apID, 'AdminProject', function( data ){

                if( !_this.editor.isInited )
                    _this.editor.adminProject.loadWS( _data, projectID );

                _this.editor.isInited = true;

                _this.webSocket.removeListener('AdminProject.load', onLoad );
                
            });

        };
        
        this.webSocket.on('AdminProject.load', onLoad );
        this.webSocket.emit('AdminProject.load', { ID : projectID });

    };
    
export { AdminProjectController };