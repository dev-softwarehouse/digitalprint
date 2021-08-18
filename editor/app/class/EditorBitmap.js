import {safeImage} from "../utils";

var EditorObject = require('./EditorObject').EditorObject;

var _ = require('lodash');

if( EDITOR_ENV.user){

    var Bitmap_extend = require('./EditorBitmap_user').Bitmap;

}else {

    var Bitmap_extend = require('./EditorBitmap_admin').Bitmap;

}

var EditorBitmapContextMenu_user = require('./EditorBitmapContextMenu_user').EditorBitmapContextMenu_user;
var EditorBitmapContextMenu = require('./EditorBitmapContextMenu').EditorBitmapContextMenu;

    /**
	* Klasa reprezentująca obiekt graficzny.
	*
	* @class EditorBitmap
	* @constructor
	*/
	function Bitmap( name, url, initEvents, cors, settings, parentDisplayer, onloadFunction ){

        var _this = this;

        settings = settings || {};

        this.parentDisplayer = parentDisplayer || null;
        // tworzenie obrazu
        this.imag = safeImage()
        this.imag.src = url.src || url;
        this.bitmap = new createjs.Bitmap( this.imag );
        this.bitmap.shadow = null;

        //Editor.templateAdministaration.updateLayers( Editor.adminProject.format.view.getLayer().children );
        // inicjalizacja konstruktorów
        EditorObject.call( this, initEvents, settings );

        this.originWidth = settings.originWidth || undefined;
        this.originHeight = settings.originHeight || undefined;

        // inicjalizacja obiektu
        this.toolsType     = 'bitmap';
        this.type          = 'EditorBitmap';
        this.used          = false;
        this.uploadedImage = false;
        this.isUploading   = false;
        this.img           = null;
        this.minImg        = null;
        this.regX          = this.width/2;
        this.regY          = this.height/2;
        this.socketController = 'editorBitmap';
        // hitArea
        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").r( 0, 0, this.width, this.height );

        this.hitArea = hit;

        this.tmp_image;
        this.setBounds( 0, 0, this.width, this.height );

        if( this.displaySimpleBorder ){

            this.updateSimpleBorder();

        }
        //var clonedObject = imag._cloneObject();

        // tworzenie backgroundu oczekującego na obraz
        this.imageShape = new createjs.Shape();
        this.imageShape.graphics.f('rgba(12,93,89,0.5)').r( 0,0, this.width, this.height );


        this.mainLayer.addChild( this.imageShape );
        this.mainLayer.addChild( this.bitmap );
        this.imag.onload = function(){

            _this.imageShape.visible = false;
            if( _this._dropShadow ){

                _this._dropShadow = false;
                _this.dropShadow();

            }

            if( _this.parentDisplayer ){

                if( _this.parentDisplayer.loadedImage ){

                    _this.parentDisplayer.loadedImage();

                }

            }

            if( onloadFunction ){

                onloadFunction();

            }

        };

        if( userType == 'advancedUser' ){

            this.addEventListener('scale', function( e ){

                this.editor.webSocketControllers.editorBitmap.setSettings( _this.dbID, { x: _this.x, y: _this.y, scaleX: _this.scaleX, scaleY: _this.scaleY } );

            }.bind( this ));

            this.addEventListener('rotate', function( e ){

                this.editor.webSocketControllers.editorBitmap.setSettings( _this.dbID, { rotation: _this.rotation } );

            }.bind( this ));

        }

        // ******************************************************************
        // Obsługa wywoływanych algorytmów po wyborze zdjęcia na obszarze UI.
        // ******************************************************************
        // Oczywiscie jest to chujnia straszna... trzeba to przzenisc w miejsce rozdzielenia plików

        if( userType == 'admin' || userType == 'advancedUser' ){

            this.addEventListener('mousedown', function( e ){

                if( !(e.currentTarget.getFirstImportantParent().typeName == 'EditableArea' ) ){

                        e.stopPropagation();

                        var editing_id = this.editor.tools.getEditObject();
                        var editingObject = this.editor.stage.getObjectById( editing_id );
                        if( !_this.toolBox ){

                            _this.toolBox = new EditorBitmapContextMenu( _this );

                        }

                }
                else {

                    if( e.nativeEvent.button == 0 ){

                        e.stopPropagation();

                        var editing_id = this.editor.tools.getEditObject();
                        var editingObject = this.editor.stage.getObjectById( editing_id );

                        if( !(e.currentTarget.getFirstImportantParent().typeName == 'EditableArea') ){

                            return;
                        }

                        if ( $('#editorLayers li').hasClass("layerSelected") ){

                                $("#editorLayers li").removeClass("layerSelected");
                        }

                        /*
                        try{
                            $('#editorLayers li[data-local-id="'+editingObject.id+'"]').addClass("layerSelected");
                        }catch(e){ console.log ('Error w linii 94 EditorBitmap :-)'); }
                        */

                        if( !_this.toolBox ){

                            if( userType == 'advancedUser' ){

                                _this.toolBox = new EditorBitmapContextMenu_user( _this );

                            }else {

                                _this.toolBox = new EditorBitmapContextMenu( _this );
                            }

                        }

                    }

                }

            }.bind( this ));

            this.addEventListener('unclick', function( e ){

                e.stopPropagation();
                _this.unclick();

            });

            this.addEventListener('stageScroll', function( e ){

                e.stopPropagation();

                if( _this.toolBox )
                    _this.toolBox._updateToolsBoxPosition();

            });


            this.addEventListener('stageMove', function( e ){

                e.stopPropagation();

                if( _this.toolBox )
                    _this.toolBox._updateToolsBoxPosition();

            });

        }

	};



	var p = Bitmap.prototype = $.extend(true,{}, new Object(createjs.Container.prototype ), Object.create(EditorObject.prototype), Object.create(Bitmap_extend.prototype) );

	p.constructor = Bitmap;


    p.isUploaded = function(){

        return this.uploadedImage;

    };


    p.unclick = function(){

        this.showMagneticLines( 0, 0, 0, 0, 0, 0 );

        if( this.toolBox )
            $( this.toolBox.toolsContainer ).remove();

        this.toolBox = null;

        if ( $('#editorLayers li').hasClass("layerSelected") ){

            $("#editorLayers li").removeClass("layerSelected");

        }

    };



    // boks opisujący obiekt, jest zapisany jak obiekt z atrybutami a, b, c, d gdzie są to kolejno odpowiednie wierzchołki

    // to musi byc tylko dla administratora


    //TODO: te elementy mozna dac do jednej klasy, sa one dziedziczone
    p.removeBackgroundFrame = function(){

        if( this.backgroundFrame ){

            this.backgroundFrame.parent.removeChild( this.backgroundFrame );
            this.backgroundFrame = null;
            this.updateShadow();

        }

    };

    p.setBackgroundFrame = function( frameObj ){

        if( !this.backgroundFrame ){

            this.backgroundFrame = new Editor.BackgroundFrame( frameObj );
            this.backgroundFrame.setParentElement( this );
            this.backgroundFrameLayer.addChildAt( this.backgroundFrame, 0 );

        }else {

            this.backgroundFrame.configurate( frameObj );
            this.backgroundFrame.updateSize();

        }

        this.updateShadow();

    };

    p._cloneObject = function( callback ){

        var test = this.bitmap.image.src;

        var object = new Bitmap( this.name +"_clone", this.bitmap.image, true, true, {

            x             : this.x,
            y             : this.y,
            rotation      : this.rotation,
            width         : this.width,
            height        : this.height,
            scaleX        : this.scaleX,
            scaleY        : this.scaleY,
            shadowBlur    : this.shadowBlur,
            shadowColor   : this.shadowColor,
            shadowOffsetX : this.shadowOffsetX,
            shadowOffsetY : this.shadowOffsetY,
            dropShadow    : this._dropShadow,
            droppedBorder : this.droppedBorder,
            simpleborder  : this.simpleborder,
            borderColor   : this.borderColor,
            borderWidth   : this.borderWidth

        }, null,

            callback

        );

        //console.log( object.bitmap.image  );

        //object.image.crossOrigin="Anonymous";

            //var index = editingObject.parent.getChildIndex( editingObject );

            // jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
            // Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );
            // TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem

       /*
            var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();

            Editor.webSocketControllers.view.moveObjects( viewLayerInfo, Editor.adminProject.format.view.getId() );
        */

        return object;

    };


    p.updateSimpleBorder = function(){

        this.simpleBorder.graphics.c().f( this.borderColor ).
            r( 0, 0, this.width - this.borderWidth/this.scaleX, this.borderWidth/this.scaleY ).
            r( this.width- this.borderWidth/this.scaleX, 0, this.borderWidth/this.scaleX, this.height - this.borderWidth/this.scaleY ).
            r( this.borderWidth/this.scaleX, this.height - this.borderWidth/this.scaleY, this.width - this.borderWidth/this.scaleX, this.borderWidth/this.scaleY ).
            r( 0, this.borderWidth/this.scaleY, this.borderWidth/this.scaleX, this.height - this.borderWidth/this.scaleY );

        if( this._dropShadow ){

            this.updateShadow();

        }

        if( this.displaySimpleBorder ){

            /*
            this.bitmap.x = this.borderWidth/this.scaleX;
            this.bitmap.y = this.borderWidth/this.scaleY;

            this.bitmap.scaleX = (this.width-(this.borderWidth/this.scaleX)*2)/this.width;
            this.bitmap.scaleY = (this.height-(this.borderWidth/this.scaleY)*2)/this.height;
            */

        }


            this.bitmap.x = 0;
            this.bitmap.y = 0;

            this.bitmap.scaleX = 1;//(this.width-(this.borderWidth/this.scaleX)*2)/this.width;
            this.bitmap.scaleY = 1;//(this.height-(this.borderWidth/this.scaleY)*2)/this.height;



    };


    p.initUserEvents = function(){

    };


    // to bedzie dobra funkcja :P ma usuwać wszystko co jest  związane z obiektem
    p.remove = function(){


    }


    /**
    * Zwraca obiekt HTML reprezentujący instancję jako warstwę
    *
    * @method toLayerHTML
    */
    p.toLayerHTML = function(){

        var _this = this;
        var html = document.createElement('li');

        this.layerElement = html;

        html.addEventListener('click', function( e ){

            e.stopPropagation();

            if ( $("#editorLayers li").hasClass("layerSelected") ){

                    $("#editorLayers li").removeClass("layerSelected");
            }

            $(this).addClass("layerSelected");

            var object = this.editor.stage.getObjectById( this.getAttribute( 'data-local-id' ) );
            if( !(object.typeName == 'EditableArea' ) ){
                _this.editor.tools.setEditingObject( this.getAttribute( 'data-local-id' ) );
                _this.editor.tools.init();
            }

        });

        var visibility = document.createElement('span');
        visibility.className = 'objectVisibility ' + ((this.visible)? 'visible' : 'notvisible' );

        visibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(this).hasClass('visible') ){

                this.className = 'objectVisibility notvisible';
                _this.visible = false;

            }
            else {

                this.className = 'objectVisibility visible';
                _this.visible = true;

            }

        });

        var name = document.createElement('span');
        name.className = 'objectName noEdit';
        name.innerHTML = this.name;
        name.setAttribute( 'data-object-id', this.dbID );

        name.addEventListener('dblclick', function( e ){

            e.stopPropagation();

        });

        name.addEventListener('blur', function( e ){


        });

        var miniature = document.createElement('span');
        miniature.className = 'objectMiniature';
        miniature.style.backgroundImage = 'url('+this.bitmap.image.src+')';

        var remover = document.createElement('span');
        remover.className = 'objectRemove';
        remover.setAttribute('object-id', this.dbID );

        remover.addEventListener('click', function( e ){

            e.stopPropagation();
            _this.editor.webSocketControllers.editorBitmap.remove( this.getAttribute('object-id'), _this.editor.adminProject.format.view.getId() );

        });

        html.appendChild( visibility );
        html.appendChild( name );
        html.appendChild( miniature );
        miniature.appendChild( remover );

        return html;

    };


	/**
	* Inicjalizuje eventy podpięte do obiektu
	*
	* @method initEvents
	*/
	p.initThemeCreatorEvents = function(){

		var _this = this;


        this.addEventListener('click', function( e ){

            e.stopPropagation();

        });

		this.addEventListener( 'mousedown', function(e){

            if( e.nativeEvent.button == 0 && Editor.stage.getMouseButton() != 1 ){
                e.stopPropagation(e);

    			_this.setCenterReg();
    			Editor.setVectorStart( e.stageX, e.stageY );

                _this.getStage().selectedObject = _this;

            }

		});

		this.addEventListener( 'pressmove', function(e){

			e.stopPropagation();

			var _this = e.currentTarget;


            if( !_this.isInEditableArea() ){

                //Editor.webSocketControllers.emitMoveObject( _this.x, _this.y, _this.dbID );

            }



			if( e.nativeEvent.button == 0 && Editor.stage.getMouseButton() != 1 ){

				Editor.setVectorStop( e.stageX, e.stageY );
				var vec = Editor.getMoveVector();
				Editor.setVectorStart( e.stageX, e.stageY );

				var scaleX = 1;
				var scaleY = 1;
				var parent = _this.parent;

				while( parent ){

					scaleX *= parent.scaleX;
					scaleY *= parent.scaleY;
					parent = parent.parent;

				}

				_this.x -= vec.x * 1/scaleX;
				_this.y -= vec.y * 1/scaleY;

				if( _this.mask ){

					_this.mask.x -= vec.x * 1/scaleX;
					_this.mask.y -= vec.y * 1/scaleY;

				}

				_this.dispatchEvent("move");
				Editor.tools.updateCompoundBox();

			}

		});

		this.addEventListener('pressup', function(e){
            /*
			e.stopPropagation();

			var o = e.currentTarget;
			var obj = Editor.stage.getObjectById( o.id );

			var transformations = {

				rotation : o.rotation,
				x : o.x,
				y : o.y,
				sX : o.scaleX,
				sY : o.scaleY,
				tw : obj.trueWidth,
				th : obj.trueHeight,
				w : obj.width,
				h : obj.height,
				rX : o.regX,
				rY : o.regY

			};

			_this.updateInDB( "matrix", JSON.stringify( transformations ) );
            */

		});

	};
	/**
	* Uplodowanie obrazu na serwer
	*
	* @method uploadImg
	* @param {Int} projectId ID projektu do którego ma zostać dodany obiekt
	* @param {Function} callback Funkcja wykonana po otrzymaniu odpowiedzi z serwera
	*/
	p.uploadImg = function( projectId, callback ){

		var that = this;

		var image = this.tmp_image;
		var image_miniature = this.bitmap.image.src;


		var fileData = new FormData();
		fileData.append("userFile", image );
		fileData.append("image_min", image_miniature);
		fileData.append("projectID", projectId);
		fileData.append("objectID", this.dbID);

		var request = new XMLHttpRequest();
		request.open("POST", config.getFrameworkUrl() + '/upload', true);
		request.send( fileData );

		request.addEventListener("progress", function(e){

			$("#progress").html( e.loaded / e.total );

		},
		false);

		request.onreadystatechange = function( aEvt ){

			if( request.readyState == 4 ){


				var resp = JSON.parse(request.responseText);

				uploadedImage = true;
				that.alpha = 1;

				var objectContent = {

					img : resp.url,
					min_img : resp.minUrl

				};



                that.img = resp.url;
                that.minImg = resp.minUrl;



                if( that.dbID ){

				    that.updateInDB();

                }

                var uploadEndEvent = new createjs.Event('uploadEnd', false, true);

                that.dispatchEvent( uploadEndEvent );
                callback( that );

			}

		};

		delete this.tmp_image;

	};



    p.addToThemePage = function( layer, pageId ){

        var _this = this;

        $.ajax({

            url : Editor.currentUrl + 'page_theme/' + pageId + "/" + layer,
            type: 'POST',
            crossDomain : true,
            data : this.getObjectTimber(),
            success : function(data){



                _this.addEventListener('uploadEnd', function(){

                    $.ajax({

                        url : Editor.currentUrl + 'project_object/' + data[layer][ data[layer].length-1 ].id,
                        type : 'PUT',
                        crossDomain : true,
                        data : _this.getObjectTimber(),
                        success : function( data ){

                            alert('obiekt został dodany');

                        },
                        error : function(){

                            alert('obraz nie został dodany');

                        }

                    });

                });

                _this.uploadImg();

            },
            error : function( data ){

                alert('nie udało się dodać projektu do motywu');

            }

        });

    };



	/**
	* HTML'owa reprezentacja obiektu
	*
	* @method HTMLoutput
	* @return {String} HTML'owa reprezentacja obiektu.
	*/
	p.HTMLoutput = function(){

		var HTML = "<li data-id='"+ this.id +"'><span class='li-button' data-id='" + this.id + "'><span class='visibility"+((this.visible)? " active" : " un-active" )+"' data-id='"+this.id+"' data-base-id='" + this.dbId + "'></span><span class='image-miniature'><img src='"+this.bitmap.image.src+"'/></span><span class='object-name'>" + this.dbId + " </span><span class='locker"+((this.mouseEnabled)? " active" : " un-active" )+"'></span><span class='remover' data-id="+this.id+">x</span></span>";

		return HTML;

	};


    p.updateWithContentFromDB = function( content ){

        this.height           = parseInt( content.height );
        this.width            = parseInt( content.width );
        this.trueWidth        = parseInt( content.trueWidth );
        this.trueHeight       = parseInt( content.trueHeight );
        this.type             = content.type;
        this.img              = content.img;
        this.minImg           = content.minImg;


        //this.hitArea.graphics.c().beginFill("#000").drawRect(0, 0, this.width, this.height );
        //this.setBounds(0, 0, this.width, this.height);

    };


	/**
	* Zapisanie obiektu do bazy danych ( używany jednorazowo )
	*
	* @method HTMLoutput
	* @return {Int} project_id ID projektu do którego zostanie dodany obiekt
	* @return {Int} layer_id ID warstwy do której jest dodany obiekt
	*/
	p.saveToDB = function( project_id, layer_id ){

		var that = this;

		$.ajax({

			url: config.getFrameworkUrl() + '/adminProjects/'+project_id+'/adminProjectLayers/'+layer_id+'/adminProjectObjects',
			crossDomain: true,
			contentType: 'application/json',
			type: "POST",
			data: "{ \"name\" : \""+String( this.name)+"\",\"typeID\" : \"1\" }",
			success: function( data ){

				that.dbId = data.item.ID;
				Editor.uploader.addItemToUpload( that );
				Editor.updateLayers();
				Editor.uploader.upload();

				Editor.stage.saveSort();

				var transformations = {

					rotation : that.rotation,
					x : that.x,
					y : that.y,
					sX : that.scaleX,
					sY : that.scaleY,
					tw : that.trueWidth,
					th : that.trueHeight,
					w : that.width,
					h : that.height,
					rX : that.regX,
					rY : that.regY

				};

				that.updateInDB( "matrix", JSON.stringify( transformations ) );

			},
			error : function(){

				alert('wystapil problem');

			}

		});

	};


	export { Bitmap };
