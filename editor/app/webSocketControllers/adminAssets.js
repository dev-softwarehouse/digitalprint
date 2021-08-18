import {WebSocketListener} from './WebSocketListener';
  /**
  * Klasa będąca kontrolerem AdminProject. Wysyła iodbiera emity z websocket'a. <br>
  * Plik : websocketControlers/adminProjectController.js
  *
  * @class AdminAssets
  * @constructor
  * @param {Object} webSocket Websocket z otworzonym połączeniem
*/

class AdminAssets {

  constructor ( webSocket, editor ){

    this.websocket = webSocket;
    this.editor = editor;
    this.adminProject = editor.adminProject;

    this._events = {
      'AdminAsset.getFolder' : [],
      'AdminAsset.uploadImageAsset': [],
      'AdminAsset.removeAsset' : [],
      'AdminAsset.removeFolder' : []
    };

  }

  init (){

    var _this = this;
    this.websocket.on('AdminAsset.addFolder', function( data ){

      //console.log( data );
      console.log('DODANO COS');

    });

  
    this.websocket.on('AdminAsset.getFolder', function( data ){
      
      var findCallback = this._events['AdminAsset.getFolder'][ data.evtID ];
      
      findCallback.run( data );

      this._events['AdminAsset.getFolder'][ data.evtID ] = null;
      delete this._events['AdminAsset.getFolder'][ data.evtID ];

    }.bind( this ));
    

    this.websocket.on('AdminAsset.uploadImageAsset', function( data ){
      
      var findCallback = this._events['AdminAsset.uploadImageAsset'][ data.evtID ];
      
      findCallback.run( data );

      this._events['AdminAsset.uploadImageAsset'][ data.evtID ] = null;
      delete this._events['AdminAsset.uploadImageAsset'][ data.evtID ];

    }.bind( this ));

    this.websocket.on('AdminAsset.removeAsset', function( data ){
      
      var findCallback = this._events['AdminAsset.removeAsset'][ data.evtID ];
      
      findCallback.run( data );

      this._events['AdminAsset.removeAsset'][ data.evtID ] = null;
      delete this._events['AdminAsset.removeAsset'][ data.evtID ];

    }.bind( this ));

    this.websocket.on('AdminAsset.removeFolder', function( data ){
      
      var findCallback = this._events['AdminAsset.removeFolder'][ data.evtID ];
      
      findCallback.run( data );

      this._events['AdminAsset.removeFolder'][ data.evtID ] = null;
      delete this._events['AdminAsset.removeFolder'][ data.evtID ];

    }.bind( this ));


  }

  removeAsset( data, callback ){

    var evt = new WebSocketListener( callback );
    
    data.evtID = evt.getID();

    this._events['AdminAsset.removeAsset'][data.evtID] = evt;

    this.websocket.emit('AdminAsset.removeAsset', data );

  }

  uploadImageAsset( uid, name , type, width, height, trueWidth, trueHeight, parent, callback ){

    var data = {
      
        uid : uid,
        name : name,
        type : type,
        width : width,
        height : height,
        trueHeight : trueHeight,
        trueWidth : trueWidth

    };

    if( parent ){
      data.parent = parent;
    }

    var evt = new WebSocketListener( callback );
    
    data.evtID = evt.getID();

    this._events['AdminAsset.uploadImageAsset'][data.evtID] = evt;

    this.websocket.emit('AdminAsset.uploadImageAsset', data );

  }

  getFolder( data, callback ){

    var evt = new WebSocketListener( callback );

    data.evtID = evt.getID();

    this._events['AdminAsset.getFolder'][data.evtID] = evt;

    //console.log( data );
    //console.log('CO WYSYLAM :)');

    this.websocket.emit('AdminAsset.getFolder', data );

  }  

  addFolder( data ){

    this.websocket.emit('AdminAsset.addFolder', data );

  }

  removeFolder( data, callback ){
    
    var evt = new WebSocketListener( callback );
    
    data.evtID = evt.getID();

    this._events['AdminAsset.removeFolder'][data.evtID] = evt;

    this.websocket.emit('AdminAsset.removeFolder', data );

  }

  addAssetCategory ( categoryName ) {

    this.websocket.emit('AdminAsset.addCategoryName', { categoryName });

  }

  getAssetCategories(){

    this.websocket.emit('AdminAssets.getCategories' );

  }

  addImageAsset( imageData ){

    this.websocket.emit('AdminAssets.addImageAsset', imageData);

  }

  getImageAssets( type ){

    this.websocket.emit('AdminAssets.getImageAssets', { type: type });

  }

  addFontAsset( fontID ){

    this.websocket.emit('AdminAssets.addFontAsset', { id: fontID });

  }

  getFontAssets(){

    this.websocket.emit('AdminAssets.addFontAsset', { id: fontID });

  }

  addClipartAsset( projectImageUID ){

    var data = {
      projectImageUID: projectName
    }

    this.websocket.emit('addClipartAsset',data );

  }

  addBackgroundAsset( projectImageUID ){

    var data = {
      projectImageUID: projectName
    }

    this.websocket.emit('addBackgroundAsset',data );

  }

  addPhotoAsset( projectImageUID ){

    var data = {
      projectImageUID: projectName
    }

    this.websocket.emit('addPhotoAsset',data );

  }

  addFrameAsset( projectImageUID ){

    var data = {
      projectImageUID: projectName
    }

    this.websocket.emit('addPhotoAsset',data );

  }

  addPhotoAsset( projectImageUID ){

    var data = {
      projectImageUID: projectName
    }

    this.websocket.emit('addPhotoAsset',data );

  }

  addBackgroundAsset( projectImageUID ){

    var data = {
      projectImageUID: projectName
    }

    this.websocket.emit('addBackgroundAsset',data );

  }

}


export { AdminAssets };
