	/**
	* Klasa będąca kontrolerem pozycji proponowanych. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/ProposedTemplateController.js
	*
	* @class ProposedTemplateController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ProposedTemplateController( webSocket, editor ){

        this.webSocket = webSocket;
        this.editor = editor;

    };

    var p = ProposedTemplateController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on('ProposedTemplate.add', function( data ){

            _this.editor.templateAdministration.updateProposedTemplates( data.proposedTemplates );

        });

        this.webSocket.on('ProposedTemplate.oneMoreText', function( data ){

            _this.onOneMoreText( data );

        });
        /*
        this.webSocket.on('ProposedTemplate.remove', function( data ){

            //Editor.templateAdministaration.removeProposedTemplate( data.ID );

        });
        */
    };



    p.getAllGlobal = function( callback ){

        var _this = this;

        this.webSocket.on('ProposedTemplate.getAllGlobal', function( data ){

            callback( data );
            _this.webSocket.removeListener('ProposedTemplate.getAllGlobal');

        });

        this.webSocket.emit('ProposedTemplate.getAllGlobal');

    };


    p.addOption = function( parentProposedTemplate, trueWidth, trueHeight, objectsInfo, imagesCount, textCount, image, callback ){

        var data = {

            parent : parentProposedTemplate,
            width : trueWidth,
            height : trueHeight,
            content : objectsInfo,
            imagesCount : imagesCount,
            textCount : textCount,
            image : image

        };

        var _this = this;

        this.webSocket.on( 'ProposedTemplate.addOption', function( data ){

            if( callback )
                callback( data );
            _this.webSocket.removeListener( 'ProposedTemplate.addOption' );

        } );

        this.webSocket.emit( 'ProposedTemplate.addOption', data );

    };


    /**
    * Dodaje globalnie szablon pozycji proponowanych
    *
    * @method add
    *
    */
    p.add = function( themePageID, trueWidth, trueHeight, name, objectsInfo, imagesCount, textCount, categories, image, isGlobal, callback ){

        var data = {

            themePageID : themePageID,
            width : trueWidth,
            height : trueHeight,
            name : name,
            content : objectsInfo,
            imagesCount : imagesCount,
            textCount : textCount,
            categories : categories,
            image : image,
            isGlobal : isGlobal

        };

        var _this = this;

        this.webSocket.on('ProposedTemplate.add', function( data ){

            if( callback ){

                callback( data );

            }

            _this.webSocket.removeListener('ProposedTemplate.add');

        });

        this.webSocket.emit('ProposedTemplate.add', data );

    };



    /*
    Editor.webSocketControllers.proposedTemplate.oneMoreText(

        _this.userPage._id,
        _this.userPage.ProposedTemplate._id

    );
    */

    /**
    * Usuwa globalnie szablon pozycji proponowanych
    *
    * @method remove
    * @param {String} proposedTemplateID ID szablonu pozycji proponowanych
    *
    */
    p.remove = function( proposedTemplateID, callback ){

        var _this = this;

        var data = {

            ID : proposedTemplateID

        };

        this.webSocket.on('ProposedTemplate.remove', function( data ){

            callback( data );
            _this.webSocket.removeListener('ProposedTemplate.remove');

        });

        this.webSocket.emit('ProposedTemplate.remove', data );

    };


    p.onRemove = function( data ){



    };


    p.get = function( proposedTemplateID, callback ){

        var _this = this;

        var data = {

            ID : proposedTemplateID

        };

        this.webSocket.on('ProposedTemplate.get', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'ProposedTemplate.get' );

        });

        this.webSocket.emit( 'ProposedTemplate.get', data );

    }


export {ProposedTemplateController};
