import {EditableArea} from './editablePlane';


if( EDITOR_ENV.user){

    var ProjectImageExtend = require('./ProjectImage_user.js').ProjectImage;

}else {

    var ProjectImageExtend = require('./ProjectImage_admin.js').ProjectImage;

}

    function ProjectImage( uid, dbID ){
        this.dbID = dbID;
        this.used = false;
        this.uploaded = false;
        this.imageReferencesInScene = {};
        this.minUrl = null;
        this.imageUrl = null;
        this.thumbnail = null;
        this.useCount = 0;

        if( !uid ){
            this.uid = this.generateUUID();
            //console.log( this.uid );
            //console.log('^^^^^ UID ^^^^^');
        }
        else {
            this.uid = uid;
        }

    };


    var p = ProjectImage.prototype = $.extend( {}, createjs.EventDispatcher.prototype, Object.create( ProjectImageExtend.prototype ) );

    p.constructor = ProjectImage;

    p.generateUUID = function(){

        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });

        return uuid;

    };

    p.init = function( file, miniatureImage, thumbnail, trueWidth, trueHeight, width, height ){

        this.name = 'testowanie_uploadingu';
        this.tmp_file = file;
        this.thumbnail = thumbnail;
        this.miniature = miniatureImage;
        this.width = width;
        this.height = height;
        this.trueWidth = trueWidth;
        this.trueHeight = trueHeight;
        this.toHTML();

    };


    p.initForUser = function( file, miniatureImage, thumbnail, trueWidth, trueHeight, width, height, imageOrder ){

        if( file ){

            this.fileSize = file.size;

        }

        this.name = 'testowanie_uploadingu';
        this.tmp_file = file;
        this.thumbnail = thumbnail;
        this.miniature = miniatureImage;
        this.width = width;
        this.height = height;
        this.trueWidth = trueWidth;
        this.trueHeight = trueHeight;
        this.imageOrder = imageOrder;
        this.toHTML_ForUser();

    };


    p.initForTheme = function( file, miniatureImage, thumbnail, trueWidth, trueHeight, width, height, context ){

        this.editor = editor;
        this.name = 'testowanie_uploadingu';
        this.tmp_file = file;
        this.thumbnail = thumbnail;
        this.miniature = miniatureImage;
        this.width = width;
        this.height = height;
        this.trueWidth = trueWidth;
        this.trueHeight = trueHeight;
        this.toHTML_ForTheme();

    };


    p.getObjectTimber = function(){

        var timber = {

            uid : this.uid,
            name : this.name

        };

        return timber;

    };


    p.selfDestroy = function(){

        for( var key in this.imageReferencesInScene ){

            var parent = this.imageReferencesInScene[ key ].parent;

            var destroyEvent = new createjs.Event('destroyBitmap', true );
            destroyEvent.uid = this.uid;
            parent.dispatchEvent( destroyEvent );

            parent.removeBitmap( this.imageReferencesInScene[ key ] );
            parent._updateShape();

        }

        $(this.html).remove();

    };


    p.use = function(){

        this.used = true;
        this.updateHTML();

    };


    p.addImageReferenceInScene = function( bitmap ){

        this.imageReferencesInScene[ bitmap.uid ] = bitmap;
        this.use();

    };


    p.noUse = function(){

        this.used = false;
        this.updateHTML();

    };


    p.removeImageReferenceInScene = function( bitmap ){

        delete this.imageReferencesInScene[ bitmap.uid ];

        if( this.imageReferencesInScene.keys(obj).length == 0 ){

            this.noUse();

        }

    };


    p.updateWithData = function( data ){

        for( var key in data ){

            this[key] = data[key];

        }

    };

    p.initAsset = function( file, miniatureImage, thumbnail, trueWidth, trueHeight, width, height, context ){
        
        this.editor = editor;
        this.name = 'testowanie_uploadingu';
        this.tmp_file = file;
        this.thumbnail = thumbnail;
        this.miniature = miniatureImage;
        this.width = width;
        this.height = height;
        this.trueWidth = trueWidth;
        this.trueHeight = trueHeight;
        this.toHTML_Asset();

    }


    p.toHTML_Asset = function(){
                this.html = null;
                var projectImageObject = this;
                var _this = this;
        
                var Editor = this.editor;
        
                //create object rzeba zrobic i zapisac jak argument ten obiekt
                var object = document.createElement('li');
                object.setAttribute('data-uid', this.uid );
        
                object.className = 'photo-item ' + (( (this.imageUrl == null || this.minUrl == null || this.thumbnail == null ) && !this.waitingForUpload)? 'withoutFile' : '');
                object.style.backgroundImage = 'url('+EDITOR_ENV.staticUrl+this.thumbnail+')';
                object.style.width = object.style.height = this.editor.template.userImagesSize + "px";
        
        
                var uploadStatus = 0;
        
                if( this.thumbnail != null && this.minUrl != null && this.imageUrl != null ){
        
                    uploadStatus = 1;
        
                }
        
        
        
                var status = document.createElement('span');
                status.className = ( uploadStatus )? 'uploaded' : 'uploading';
                this.statusHTML = status;
        
                if( !uploadStatus ){
        
                    var statusBar = document.createElement('div');
                    statusBar.className = 'statusBar';
        
                    var statusProgress = document.createElement('div');
                    statusProgress.className = 'statusProgress';
        
                    statusBar.appendChild( statusProgress );
        
                    statusBar.addEventListener('progress', function( e ){
        
                        e.stopPropagation();
        
                        this.childNodes[0].style.width = e.progress + '%';
        
                    });
        
                    object.appendChild( statusBar );
        
                    _this.statusBar = statusBar;
        
                }
        
                var remover = document.createElement('span');
                remover.className = 'image-remover';
                remover.setAttribute('data-id', this.dbID );
        
                remover.addEventListener('click', function(){
        
                    var place = _this.html.parentNode.parentNode.getAttribute('id');
        
                    this.editor.webSocketControllers.mainTheme.removeProjectImage( this.editor.adminProject.format.theme.getParentThemeID(), _this.uid, place );
        
                }.bind( this ));
        
                object.appendChild( status );
                object.appendChild( remover );
        
        
                $(object).draggable({
                    appendTo: "body",
                    zIndex : 1000000,
                    cursorAt: {left: -20, top: -20},
                    start : function(){
        
                        //console.log('RUSZYLO :)');
                        this.editor.stage.preparePagesToDrop();
        
                    }.bind( this ),
                    drag: function( event, ui ){
        
                        var areas = this.editor.stage.getEditableAreas();
                        for( key in areas ){
        
                            var local = areas[key].globalToLocal(event.clientX, event.clientY-80);
                            var bounds = areas[key].getBounds();
        
                        }
        
                    }.bind(this),
                    stop : function( event, ui ){
        
        
                        event.bubbles = false;
                        event.stopPropagation();
                        var overObjects = [];
                        Editor.getStage()._getObjectsUnderPoint( event.clientX, event.clientY-75, overObjects );
        
                        var overDragableObject = false;
        
                        for( var i=0; i < overObjects.length; i++ ){
                            if ( overObjects[i].target ) {
                                if( overObjects[i].target instanceof EditableArea )
                                    overDragableObject = true;
                            }
                        }
        
                        if( overObjects[0] && overDragableObject){
        
                            event.bitmapObject = projectImageObject;
        
                            overObjects[0].dispatchEvent( event );
                            Editor.stage.stopPageDroping();
        
                        }else {
        
                            Editor.stage.stopPageDroping();
        
                        }
        
                    },
                    revert : false,
                    helper : 'clone'
        
                });
                //var html = "<li data-uid='"+this.uid+"' class='photo-item "+(( this.used )?( 'used' ):( '' ))+"' style='background: "+this.image.src+";  width: " + Editor.template.userImagesSize + "px; height: " + Editor.template.userImagesSize + "px;'>"+((this.uploaded) ? ('<span class="uploaded"></span>') : ('<span class="uploading"></span>') )+"</li>";
        
                this.html = object;
        
                return this.html;
        
            };

    p.toHTML_ForTheme = function(){

        this.html = null;
        var projectImageObject = this;
        var _this = this;

        var Editor = this.editor;

        //create object rzeba zrobic i zapisac jak argument ten obiekt
        var object = document.createElement('li');
        object.setAttribute('data-uid', this.uid );

        object.className = 'photo-item ' + (( (this.imageUrl == null || this.minUrl == null || this.thumbnail == null ) && !this.waitingForUpload)? 'withoutFile' : '');
        object.style.backgroundImage = 'url('+EDITOR_ENV.staticUrl+this.thumbnail+')';
        object.style.width = object.style.height = this.editor.template.userImagesSize + "px";


        var uploadStatus = 0;

        if( this.thumbnail != null && this.minUrl != null && this.imageUrl != null ){

            uploadStatus = 1;

        }



        var status = document.createElement('span');
        status.className = ( uploadStatus )? 'uploaded' : 'uploading';
        this.statusHTML = status;

        if( !uploadStatus ){

            var statusBar = document.createElement('div');
            statusBar.className = 'statusBar';

            var statusProgress = document.createElement('div');
            statusProgress.className = 'statusProgress';

            statusBar.appendChild( statusProgress );

            statusBar.addEventListener('progress', function( e ){

                e.stopPropagation();

                this.childNodes[0].style.width = e.progress + '%';

            });

            object.appendChild( statusBar );

            _this.statusBar = statusBar;

        }

        var remover = document.createElement('span');
        remover.className = 'image-remover';
        remover.setAttribute('data-id', this.dbID );

        remover.addEventListener('click', function(){

            var place = _this.html.parentNode.parentNode.getAttribute('id');

            this.editor.webSocketControllers.mainTheme.removeProjectImage( this.editor.adminProject.format.theme.getParentThemeID(), _this.uid, place );

        }.bind( this ));

        object.appendChild( status );
        object.appendChild( remover );


        $(object).draggable({
            appendTo: "body",
            zIndex : 1000000,
            cursorAt: {left: -20, top: -20},
            start : function(){

                //console.log('RUSZYLO :)');
                this.editor.stage.preparePagesToDrop();

            }.bind( this ),
            drag: function( event, ui ){

                var areas = this.editor.stage.getEditableAreas();
                for( key in areas ){

                    var local = areas[key].globalToLocal(event.clientX, event.clientY-80);
                    var bounds = areas[key].getBounds();

                }

            }.bind(this),
            stop : function( event, ui ){


                event.bubbles = false;
                event.stopPropagation();
                var overObjects = [];
                Editor.getStage()._getObjectsUnderPoint( event.clientX, event.clientY-75, overObjects );

                var overDragableObject = false;

                for( var i=0; i < overObjects.length; i++ ){
                    if ( overObjects[i].target ) {
                        if( overObjects[i].target instanceof EditableArea )
                            overDragableObject = true;
                    }
                }

                if( overObjects[0] && overDragableObject){

                    event.bitmapObject = projectImageObject;

                    overObjects[0].dispatchEvent( event );
                    Editor.stage.stopPageDroping();

                }else {

                    Editor.stage.stopPageDroping();

                }

            },
            revert : false,
            helper : 'clone'

        });

        this.html = object;

        return this.html;

    };

    p.getHTMLForSortingViews = function(){

        var elem = document.createElement('div');
        elem.className = 'photoElemPopUp' + (( !this.useCount ) ? ' notUsed' : '');
        elem.setAttribute('data-id', this._id );
        elem.setAttribute('data-uid', this.uid );
        elem.style.backgroundImage = 'url(' + (this.thumbnail.indexOf('http')===0?this.thumbnail:EDITOR_ENV.staticUrl+this.thumbnail) + ')';

        var counter = document.createElement( 'span' );
        counter.className = 'usedCounter';
        counter.innerHTML = this.useCount;

        this.counterInViewsHTML = counter;

        elem.appendChild( counter );


        return elem;

    };

    p.getHTMLForSorting = function(){

        var imageContainer = document.createElement('div');
        imageContainer.className = 'projectImageContainer';
        imageContainer.setAttribute('uid', this.uid);

        var imageElem = document.createElement('div');
        imageElem.className = 'projectImage';
        imageElem.style.backgroundImage = 'url( ' + (this.thumbnail.indexOf('http')===0?this.thumbnail:EDITOR_ENV.staticUrl+this.thumbnail) + ' )';

        var imageOrder = document.createElement('div');
        imageOrder.className = 'imageOrder';
        imageOrder.innerHTML = this.imageOrder?this.imageOrder:'.';

        imageContainer.appendChild( imageElem );

        /*
        // zostało zastąpione eventem delegujacym
        imageElem.addEventListener('click', function( e ){

            e.stopPropagation();

        });
        */

        var imageViewer = document.createElement('div');
        imageViewer.className = 'imageViewer';

        var imageMover = document.createElement('div');
        imageMover.className = 'imageMover';

        imageContainer.appendChild( imageViewer );
        imageContainer.appendChild( imageOrder );
        imageContainer.appendChild( imageMover );

        this.elementForSorting = imageContainer;

        return imageContainer;

    };

    p.updateOrderInHTML = function(){

        if( this.elementForSorting ){

            this.elementForSorting.querySelector('.imageOrder').innerHTML = this.imageOrder;

        }

    };

    p.toHTML_ForUser = function(){

        this.html = null;
        var projectImageObject = this;
        var _this = this;
        var Editor = this.editor;
        //create object rzeba zrobic i zapisac jak argument ten obiekt
        var object = document.createElement('li');
        object.setAttribute('data-uid', this.uid );

        object.className = 'photo-item ' + (( (this.imageUrl == null || this.minUrl == null || this.thumbnail == null ) && !this.waitingForUpload)? '' : '');
        object.style.backgroundImage = 'url('+this.thumbnail+')';
        object.style.width = object.style.height = Editor.template.userImagesSize + "px";

        var uploadStatus = 0;

        if( this.thumbnail != null && this.minUrl != null && this.imageUrl != null ){

            uploadStatus = 1;

        }

        var status = document.createElement('span');
        status.className = ( uploadStatus )? 'uploaded' : '';
        this.statusHTML = status;

        if( !uploadStatus ){

            var statusBar = document.createElement('div');
            statusBar.className = 'statusBar';

            var statusProgress = document.createElement('div');
            statusProgress.className = 'statusProgress';

            statusBar.appendChild( statusProgress );

            statusBar.addEventListener('progress', function( e ){

                e.stopPropagation();

                this.childNodes[0].style.width = e.progress + '%';

            });

            object.appendChild( statusBar );

            _this.statusBar = statusBar;

        }

        var remover = document.createElement('span');
        remover.className = 'image-remover';
        remover.setAttribute('data-id', this.dbID );


        remover.addEventListener('click', function(){

            var projectID = Editor.userProject.getID();
            var uid = _this.uid;

            Editor.template.warningView('Usunięcie zdjęcia spowoduje usunięcie pliku, oraz wszystkich jego wystąpień w projekcie.', function(){

                Editor.webSocketControllers.userProject.removePhoto( projectID, uid );

            },
            function(){


            });

        });



        object.appendChild( status );
        object.appendChild( remover );

        var counter = document.createElement( 'span' );
        counter.className = 'usedCounter';
        counter.innerHTML = 0;

        this.counterHTML = counter;

        object.appendChild( counter );


        $(object).draggable({
            appendTo: "body",
            zIndex : 1000000,
            cursorAt: {left: -20, top: -20},
            start : function(){

                Editor.stage.preparePagesToDrop();

            },
            drag: function( event, ui ){

                var areas = Editor.stage.getEditableAreas();

                for( key in areas ){

                    var local = areas[key].globalToLocal(event.clientX, event.clientY-80);
                    var bounds = areas[key].getBounds();

                }

            },
            stop : function( event, ui ){

                event.bubbles = false;
                event.stopPropagation();
                var overObjects = [];

                Editor.getStage()._getObjectsUnderPoint( event.clientX, event.clientY-75, overObjects );
                //console.log('MAMY STOP DRAG');
                //console.log( overObjects );
                var overDragableObject = false;

                for( var i=0; i < overObjects.length; i++ ){
                    if ( overObjects[i].target ) {
                        if( overObjects[i].target instanceof EditableArea )
                            overDragableObject = true;
                    }
                }

                if( overObjects[0] ){

                    event.bitmapObject = projectImageObject;

                    overObjects[0].dispatchEvent( event );
                    Editor.stage.stopPageDroping();

                }else {

                    Editor.stage.stopPageDroping();

                }

            },
            revert : false,
            helper : 'clone'

        });

        this.html = object;

        return this.html;

    };


    p.updateCounter = function( count ){

        this.useCount = count;
        this.counterHTML.innerHTML = count;

        if( parseInt( count ) > 0 ){

            $(this.counterHTML.parentNode).addClass('used');

        }else {

            $(this.counterHTML.parentNode).removeClass('used');

        }

        if( this.counterInViewsHTML ){

            this.counterInViewsHTML.innerHTML = count;

        }

    }

    p.toHTML = function(){

        var _this = this;
        var Editor = this.editor;
        //create object rzeba zrobic i zapisac jak argument ten obiekt
        var object = document.createElement('li');
        object.setAttribute('data-uid', this.uid );

        object.className = 'photo-item ' + (( (this.imageUrl == null || this.minUrl == null || this.thumbnail == null ) && !this.waitingForUpload)? 'withoutFile' : '');
        object.style.backgroundImage = 'url('+this.thumbnail+')';
        object.style.width = object.style.height = Editor.template.userImagesSize + "px";


        var uploadStatus = 0;

        if( this.thumbnail != null && this.minUrl != null && this.imageUrl != null ){

            uploadStatus = 1;

        }



        var status = document.createElement('span');
        status.className = ( uploadStatus )? 'uploaded' : 'uploading';
        this.statusHTML = status;

        if( !uploadStatus ){

            var statusBar = document.createElement('div');
            statusBar.className = 'statusBar';

            var statusProgress = document.createElement('div');
            statusProgress.className = 'statusProgress';

            statusBar.appendChild( statusProgress );

            statusBar.addEventListener('progress', function( e ){

                e.stopPropagation();

                this.childNodes[0].style.width = e.progress + '%';

            });

            object.appendChild( statusBar );

            _this.statusBar = statusBar;

        }

        var remover = document.createElement('span');
        remover.className = 'image-remover';
        remover.setAttribute('data-id', this.dbID );

        remover.addEventListener('click', function(){

            Editor.webSocketControllers.projectImage.remove( _this.uid );
            //Editor.adminProject.removeProjectImage( this.getAttribute('data-uid') );

        });

        object.appendChild( status );
        object.appendChild( remover );


        $(object).draggable({
            appendTo: "body",
            zIndex : 1000000,
            cursorAt: {left: -20, top: -20},
			start : function(){



            },
			drag: function( event, ui ){

				var areas = Editor.stage.getEditableAreas();
				for( key in areas ){

					var local = areas[key].globalToLocal(event.clientX, event.clientY-80);
					var bounds = areas[key].getBounds();

				}

			},
			stop : function( event, ui ){


                event.bubbles = false;
                event.stopPropagation();

                if( ui.position.left > 300 && ui.position.top > 80 ){

                    event.bitmapObject = event.target;

                    Editor.getStage().dispatchEvent( event );
                }


			},
			revert : false,
			helper : 'clone'

		});

        this.html = object;

        return this.html;

    };


    p.addToAdminProject = function(){

        //Editor.webSocketControllers.adminProjectImage.addImageToLibrary( this.name, this.imageUrl, this.miniatureUrl, this.uid );

    };

    p.getImage = function(){

        if( this.EditedUpload ){
            if( this.EditedUpload.minUrl ){
                return this.EditedUpload.minUrl;
            }else {
                return this.minUrl;
            }
        }else {

            return this.minUrl.indexOf("http")>-1?this.minUrl:`${EDITOR_ENV.staticUrl}${this.minUrl}`;

        }

    }

    p.updateHTML = function( ){

        this.html.style.backgroundImage = 'url('+ this.getImage() +')';

        $(this.html).find('.image-remover').attr('data-id', this.uid );

        if( this.statusBar ){
            if( this.statusBar.parentNode ){
                this.statusBar.parentNode.removeChild( this.statusBar );
            }
        }

        if( this.thumbnail == null || this.minUrl == null || this.imageUrl == null ){

            if( ! $(this.statusHTML ).hasClass('uploading')){

                $( this.statusHTML ).addClass('uploading');

                if( $(this.statusHTML).hasClass('uploaded') )
                    $(this.statusHTML).removeClass('uploaded');

            }

        }
        else {

            $( this.html ).removeClass('withoutFile');

            if( ! $(this.statusHTML ).hasClass('uploaded')){

                $( this.statusHTML ).addClass('uploaded');

                if( $(this.statusHTML).hasClass('uploading') )
                    $(this.statusHTML).removeClass('uploading');

            }

        }

    };


    p.updateReferencesUrl = function(){

        for( var i=0; i < this.imageReferencesInScene.length; i++ ){

            this.imageReferencesInScene[i].image.src = this.miniature;
            this.imageReferencesInScene[i].img = this.imageUrl;
            this.imageReferencesInScene[i].minImg = this.miniature;

        }

    };


    p.addToLibrary = function(){

        // name, imageUrl, minUrl, uid
        //Editor.webSocketControllers.projectImage.addImageToLibrary( this.name, this.imageUrl, this.miniatureUrl, this.uid );

    };

    export {ProjectImage};
