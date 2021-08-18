import {WebSocketListener} from './WebSocketListener';
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
//
/**
 * Klasa będąca kontrolerem View. Wysyła i odbiera emity z websocket'a. <br>
 * Plik : websocketControlers/UserProjectController.js
 *
 * @class ViewControler
 * @constructor
 * @param {Object} webSocket Websocket z otworzonym połączeniem
 */
function UserProjectController( webSocket, editor ){

    this.editor = editor;
    this.webSocket = webSocket;
    this._events = this._events = {

        'UserProject.setMainTheme' : []

    };

};

var p = UserProjectController.prototype;


/**
 * Inicjalizuje podstawowe nasłuchiwacze
 *
 * @method init
 */
p.init = function(){

    this.webSocket.on('UserProject.addPhoto', function( data ){

        //console.log( data );
        //console.log('jest odpowiedź z serwera');

    });

    this.webSocket.on('UserProject.setMainTheme', function( data ){

        var findCallback = this._events['UserProject.setMainTheme'][ data.evtID ];

        findCallback.run( data );

        this._events['UserProject.setMainTheme'][ data.evtID ] = null;
        delete this._events['UserProject.setMainTheme'][ data.evtID ];

    }.bind(this));

    this.webSocket.on( 'UserProject.addNewView', function( data ){

        this.editor.userProject.addView(data.projectID, data.newView, data.oldViews );
        this.editor.services.calculatePrice();

    }.bind( this ));

    this.webSocket.on( 'UserProject.removeView', function( data ){
        this.editor.userProject.removeView(data );
        this.editor.services.calculatePrice();

    }.bind( this ));

    this.webSocket.on('UserProject.setViewsOrders', function( data ){ this.onSetViewsOrder( data ) }.bind(this));

    this.webSocket.on( 'UserProject.getProjectImagesUseNumber', function( data ){

        this.onGetProjectImagesUseNumber( data );

    }.bind( this ));

    this.webSocket.on( 'UserProject.setName', function( data ){

        this.editor.userProject.setName( data.projectName );
        $('#setName-window').remove();

    }.bind( this ));

    this.webSocket.on( 'UserProject.sortProjectImages', function( data ){

        this.onSortProjectImages( data );

    }.bind( this ) );

    this.webSocket.on('UserProject.removePhoto', function( data ){

        this.onRemovePhoto( data );

    }.bind( this ));

    this.webSocket.on('UserProject.setSettingsForAllProposedImages', function( data ){

        this.editor.userProject.regenerateViewThumb();

    }.bind( this ));

    this.webSocket.on('UserProject.setSettingsForAllProposedTexts', function( data ){

        this.editor.userProject.regenerateViewThumb();

    }.bind( this ));

    this.webSocket.on('UserProject.removeAllImages', function( data ){

        this.onRemoveAllPhotos( data );

    }.bind( this ));

};

p.setPagesPrev = function( data, callback ){

    var _this = this;

    var info = {
        token: getCookie("access-token"),
        min: data
    }

    //console.log( data );

    this.webSocket.emit( 'UserProject.updatePagesPrev', info );
    this.webSocket.on( 'UserProject.updatePagesPrev', function(){

        callback();
        _this.webSocket.removeListener( 'UserProject.updatePagesPrev', callback );

    } );

}

p.setName = function( name, userProjectID ){


    var data = {

        userProjectID : userProjectID,
        projectName: name

    };

    this.webSocket.emit( 'UserProject.setName', data );

};

p.onSetName = function( data ){

    //console.log( data );

};

p.onGetProjectImagesUseNumber = function( data ){

    this.editor.userProject.updateUsedImagesCount( data );

    document.body.querySelector('.projectNotUsedPhotosCounter').innerHTML = 'Użytych: ' + document.body.querySelectorAll('#imagesList .photo-item.used').length;

};

p.getProjectImagesUseNumber = function( userProjectID ){

    var data = {

        userProjectID : userProjectID

    };

    this.webSocket.emit( 'UserProject.getProjectImagesUseNumber', data );

};

p.addPhoto = function( uid, userProjectID, name , type, imageUrl, minUrl, thumbnail, width, height, trueWidth, trueHeight ){

    var data = {

        uid : uid,
        userProjectID : userProjectID,
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

    //console.log( data );
    //console.log('dsfjhadksjlfhdsajkdshfkl');

    this.webSocket.emit('UserProject.addPhoto', data );

};

p.setSettingsForAllBitmaps = function( userProjectID, settings ){

    var data = {

        userProjectID : userProjectID,
        settings      : settings

    };

    //console.log( data );
    //console.log('wysylam');

    this.webSocket.emit('UserProject.setSettingsForAllBitmaps', data );

};

p.setSettingsForAllProposedImages = function( userProjectID, settings ){

    var data = {

        userProjectID : userProjectID,
        settings      : settings

    };

    this.webSocket.emit('UserProject.setSettingsForAllProposedImages', data );

};

p.setSettingsForAllProposedTexts = function( userProjectID, settings ){

    var data = {

        userProjectID : userProjectID,
        settings      : settings

    };

    this.webSocket.emit('UserProject.setSettingsForAllProposedTexts', data );

};

p.removePhoto = function( projectID, photoUID ){

    var data = {

        projectID : projectID,
        photoUID  : photoUID

    };

    this.webSocket.emit('UserProject.removePhoto', data );

};

p.onRemovePhoto = function( data ){

    this.editor.userProject.removeProjectImage( data );

    for( var i=0; i<data.views.length; i++){

        this.editor.userProject.regenerateSingleViewThumb( data.views[i] );

    }

};

p.onRemoveAllPhotos = function( data ){

    if( data.response == 'ok'){

        this.editor.userProject.removeAllImages();

    }

};


p.removeAllImages = function( userProjectID ){

    var data = {
        projectID: userProjectID
    }

    this.webSocket.emit('UserProject.removeAllImages', data );

}

p.setMainTheme = function( userProjectID, themeID, callback ){
    var data = {

        userProjectID : userProjectID,
        themeID       : themeID

    };

    var evt = new WebSocketListener( callback );

    data.evtID = evt.getID();

    this._events['UserProject.setMainTheme'][data.evtID] = evt;

    this.webSocket.emit('UserProject.setMainTheme', data );

};



p.add = function( callback ){

    var _this = this;

    var data = {



    };

    this.webSocket.on( 'UserProject.add', function( data ){

        callback( data );

        _this.removeListener( 'UserProject.add' );

    });

    this.webSocket.emit( 'UserProject.add', data );

};


p.load = function( userProjectID, userID ){

    var data = {

        userProjectID : userProjectID,
        userID : userID

    };

    this.webSocket.emit( 'UserProject.load', data );

};


p.autoFill = function( userProjectID, callback ){

    var _this = this;

    var data = {

        userProjectID : userProjectID

    };

    this.webSocket.on( 'UserProject.autoFill', function( data ){

        _this.webSocket.removeListener( 'UserProject.autoFill' );

        if( callback )
            callback( data );

    });

    this.webSocket.emit( 'UserProject.autoFill', data );

};


p.addNewView = function( userProjectID,order ){

    var data = {

        userProjectID : userProjectID,
        order:order

    };

    this.webSocket.emit( 'UserProject.addNewView', data );

};

p.setViewsOrders = function( userProjectID, ordersInfo ){

    var data = {

        orders        : ordersInfo,
        userProjectID : userProjectID

    };

    this.webSocket.emit( 'UserProject.setViewsOrders', data );

};

p.onSetViewsOrder = function( data ){

    this.editor.userProject.reorderViews( data );

};

p.sortProjectImages = function( sortList, projectID ){

    var data = {

        projectID : projectID,
        sortList  : sortList

    };

    this.webSocket.emit( 'UserProject.sortProjectImages', data );

};

p.onSortProjectImages = function( data ){

    this.editor.userProject.updateProjectImagesOrders( data );

}

p.getAllViews = function( userProjectID, callback ){

    var _this = this;

    var data = {

        userProjectID : userProjectID

    };

    this.webSocket.on('UserProject.getAllViews', function( data ){

        _this.webSocket.removeListener( 'UserProject.getAllViews' );

        if( callback )
            callback( data );

    });

    this.webSocket.emit( 'UserProject.getAllViews', data );

};

p.removeView=function(mainProject,projectID , viewID){
    this.webSocket.emit( 'UserProject.removeView', {mainProject,projectID,viewID} );
}



export {UserProjectController};