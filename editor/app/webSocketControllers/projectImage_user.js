    function ProjectImageController( webSocket, editor ){

        this.webSocket = webSocket;
        this.editor = editor;

    };


    var p = ProjectImageController.prototype;





    p.init = function(){

        var _this = this;

        /*
        this.webSocket.on('uploadedImage', function( data ){

                var projectImage = Editor.adminProject.getProjectImage( data.uid );
                projectImage.miniature = projectImage.minUrl = data.minUrl;
                projectImage.imageUrl = data.url;
                projectImage.updateHTML();
                projectImage.updateReferencesUrl();

                console.log( data );
                alert('doszlo');
                
        });
        
        this.webSocket.on('uploadingImage', function( data ){

                if( data.user != webSocket.id ){
                    
                    var addedImage = new Editor.ProjectImage( data.uid );
                    addedImage.init( null, data.min, data.width, data.height );
                    Editor.adminProject.addProjectImage( addedImage, false );
                    
                }
                
        });
    */
        this.webSocket.on( 'ProjectImage.remove', function( data ){

            _this.onRemove( data );

        });

     
        this.webSocket.on( 'ProjectImage.update', function( data ){

            var projectImage = this.editor.userProject.getProjectImage( data.uid );
            delete data.uid;

            projectImage.updateWithData( data );
            projectImage.updateHTML();

        }.bind( this ));


        this.webSocket.on('ProjectImage.add', function( data ){

            var scrollbarImages = $('#imagesListScroll'); 
            var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
            scrollbarImages.update();

        });


    };


    p.onRemove = function( data ){

        //alert('jaka jest data');

    };

    
    p.remove = function( projectImageUID ){

        var data = {

            projectImageUID : projectImageUID

        };

        this.webSocket.emit('ProjectImage.remove', data );

    };


    p.update = function( data ){
        //console.log('AKTUALIZACJA LECI NA SERWER');
        this.webSocket.emit( 'ProjectImage.update', data );
     
    };


    p.add = function( uid, adminProjectID, name, type, imageUrl, minUrl, thumbnail, width, height, trueWidth, trueHeight ){

        var data = {

            uid : uid,
            adminProjectID : adminProjectID,
            name : name,
            type : type,
            imageUrl : imageUrl,
            minUrl : minUrl,
            thumbnail : thumbnail,
            width : width,
            height : height,
            trueWidth : trueWidth,
            trueHeight : trueHeight

        };

        this.webSocket.emit('ProjectImage.add', data );

    };


    p.addNoRef = function( uid, adminProjectID, name, type, imageUrl, minUrl, thumbnail, width, height, trueWidth, trueHeight, callback ){

        var _this = this;

        var data = {

            uid : uid,
            adminProjectID : adminProjectID,
            name : name,
            type : type,
            imageUrl : imageUrl,
            minUrl : minUrl,
            thumbnail : thumbnail,
            width : width,
            height : height,
            trueWidth : trueWidth,
            trueHeight : trueHeight

        };

        this.webSocket.on('ProjectImage.addNoRef', function( data ){

            callback( data );

            _this.webSocket.removeListener( 'ProjectImage.addNoRef' );

        });

        this.webSocket.emit('ProjectImage.addNoRef', data );

    };


    
    p.uploadedImage = function( uid, minUrl, url ){
    
        webSocket.emit('uploadedImage', { minUrl: minUrl, uid : uid, url : url });
    
    };

    p.addImageToLibrary = function( name, imageUrl, minUrl, uid ){
    
        webSocket.emit( 'addImageToLibrary', { 
        
            name : name,
            url : imageUrl,
            minUrl : minUrl,
            user : webSocket.id,
            uid : uid
        
        });
    
    };

    p.uploadingImage = function( image ){

        webSocket.emit('uploadingImage', { user : webSocket.id, uid : image.uid, name : image.name, width : image.width, height : image.height } );

    };


export {ProjectImageController};