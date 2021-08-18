	/**
	* Klasa będąca kontrolerem ProposedImageController. Wysyła iodbiera emity z websocket'a. <br>
    * Plik : websocketControlers/productController.js
	*
	* @class ProposedImageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function ProposedImageController( webSocket, editor ){

        this.webSocket = webSocket;
        this.editor = editor;

    };

    var p = ProposedImageController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(){

        var _this = this;

        this.webSocket.on('ProposedImage.loadImage', function( data ){

            _this.onLoadImage( data );

        });

        this.webSocket.on('ProposedImage.changeImage', function( data ){

            _this.onChangeImage( data );

        });

        this.webSocket.on('ProposedImage.replacePhoto', function( data ){

            _this._onReplacePhoto( data );

        });

        this.webSocket.on('ProposedImage.removeObjectInside', function( data ){

            _this._onRemoveObjectInside( data );

        });

        this.webSocket.on('ProposedImage.rotateImageInside', function( data ){

            _this.onRotateImageInside( data );

        });

    };

    p.onRotateImageInside = function( data ){
        var Editor = this.editor;
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var position = userPage.findProposedImage( data.proposedPositionID );
            position.objectInside.setScale( data.imageInfo.scaleX );
            position.objectInside.rotation = data.imageInfo.rotation;
            position.objectInside.x = data.imageInfo.x;
            position.objectInside.y = data.imageInfo.y;

            if( position.objectInside.rotation%180 != 90 ){

                var minScale = position.width/position.objectInside.trueWidth;

                if( position.height > position.objectInside.trueHeight*minScale ){

                    minScale = position.height/position.objectInside.trueHeight;

                }

            }else {

                var minScale = position.height/position.objectInside.trueWidth;

                if( position.width > position.objectInside.trueHeight*minScale ){

                    minScale = position.width/position.objectInside.trueHeight;

                }

            }
                //console.log();
            if( position._toolBox ){
                $(".scroll-bar").slider("option", {"min": minScale} ); // left handle should be at the left end, but it doesn't move
                $(".scroll-bar").slider("value", position.objectInside.scaleX );
                //console.log( position.objectInside.scaleX );
                //console.log('sdjhfsddfsjhkdfshjkdfsahkjlfdsakhjafkdjlsh');

            }

            position.updateMask();
            position.redraw()
        }


    };

    p.setAttributes = function( positionID, attributes, userPageID ){

        var data = {

            proposedImageID : positionID,
            attributes : attributes,
            userPageID : userPageID

        };

        this.webSocket.emit( 'ProposedImage.setAttributes', data );

    };

    p.rotateImageInside = function( userPageID, positionID ){

        var data = {

            userPageID: userPageID,
            proposedPositionID: positionID

        };

        this.webSocket.emit('ProposedImage.rotateImageInside', data );

    };

    p.removeObjectInside = function( userPageID, proposedPositionID ){
        var Editor = this.editor;
        var data = {

            userPageID: userPageID,
            proposedPositionID: proposedPositionID,
            projectID : Editor.userProject.getID()

        };

        this.webSocket.emit('ProposedImage.removeObjectInside', data );

    };

    p._onRemoveObjectInside = function( data ){

        var Editor = this.editor;
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            for( var i=0; i < userPage.proposedImagePositions.length; i++ ){

                if( userPage.proposedImagePositions[i].dbID == data.proposedPositionID ){

                    var proposedPosition = userPage.proposedImagePositions[i];
                    proposedPosition.removeObjectInside();

                    var eve =  new createjs.Event('removed');
                    proposedPosition.dispatchEvent( eve );

                    break;

                }

            }

            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );

        }else {

            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );

        }

    };

    p._onReplacePhoto = function( data ){

        var Editor = this.editor;
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            for( var i=0; i < userPage.proposedImagePositions.length; i++ ){

                if( userPage.proposedImagePositions[i].dbID == data.p1._id ){

                    if( data.p1.objectInside ){

                        userPage.proposedImagePositions[i].loadImage( data.p1.objectInside );

                    }else {

                        userPage.proposedImagePositions[i].removeObjectInside();

                    }

                }

                if( userPage.proposedImagePositions[i].dbID == data.p2._id ){

                    if( data.p2.objectInside ){

                        userPage.proposedImagePositions[i].loadImage( data.p2.objectInside );

                    }else {

                        userPage.proposedImagePositions[i].removeObjectInside();

                    }

                }

            }

            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );

        }else {
            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );
        }

    };

    p.replacePhoto = function( fromProposedPoition, toProposedPosition, pageID ){

        var data = {

            from: fromProposedPoition,
            to : toProposedPosition,
            page: pageID

        };

        this.webSocket.emit( 'ProposedImage.replacePhoto', data );

    };

    p.loadImage = function( proposedImagePositionID, projectImageUID, pageID ){

        var Editor = this.editor;
        var data = {

            proposedImagePositionID : proposedImagePositionID,
            projectImageUID : projectImageUID,
            userPageID : pageID,
            projectID : Editor.userProject.getID()

        };
  
        this.webSocket.emit( 'ProposedImage.loadImage', data );

    };

    p.changeImage = function( proposedImagePositionID, projectImageUID, pageID ){
        
        var Editor = this.editor;
        var data = {

            proposedImagePositionID : proposedImagePositionID,
            projectImageUID : projectImageUID,
            userPageID : pageID,
            projectID: Editor.userProject.getID()

        };

        this.webSocket.emit( 'ProposedImage.changeImage', data );

    };

    p.onLoadImage = function( data ){

        var Editor = this.editor;
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var pp = userPage.findProposedImage( data.proposedImage._id );

            var projectImage = Editor.userProject.getProjectImage( data.proposedImage.objectInside.ProjectImage.uid );

            data.proposedImage.objectInside.ProjectImage = projectImage;

            pp.loadImage( data.proposedImage.objectInside );

            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );
            //userPage.userPage.UsedImages.push( data.image );

        }else {
            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );
        }

    };

    p.onChangeImage = function( data ){

        var Editor = this.editor;
        
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var pp = userPage.findProposedImage( data.proposedImage._id );

            var projectImage = Editor.userProject.getProjectImage( data.proposedImage.objectInside.ProjectImage.uid );

            data.proposedImage.objectInside.ProjectImage = projectImage;

            pp.loadImage( data.proposedImage.objectInside );

            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );

        }else {

            var view = Editor.userProject.getViewWithPage( data.userPageID );
            Editor.userProject.regenerateSingleViewThumb( view._id );

        }



    };

    export {ProposedImageController};
