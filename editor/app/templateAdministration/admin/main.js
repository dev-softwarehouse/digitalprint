import _ from 'lodash';
    // templateControler
    var TemplateAdministration = function( editor ){

        var Editor = editor;

        var updateAttributes = function( options, baseObjects ){



        };


        var updateAttributesBase = function( baseObjects ){

            //console.log( baseObjects );

            var baseObjectsLayers = document.createElement('div');

            //console.log( Editor.adminProject.format.getId() );

            var _options = Editor.getAttributeOption( Editor.adminProject.format.getId() ).attributes;

            //console.log( Editor.adminProject.format.getId() );
            //console.log( _options );

            for( var i=0; i < baseObjects.length; i++ ){

                var baseElem = document.createElement('div');
                baseElem.className = 'baseObjectAttribute';
                baseElem.setAttribute( 'base-object-id', baseObjects[i]._id );
                baseElem.setAttribute( 'view-id', Editor.adminProject.format.view.getId() );

                var basePicture = document.createElement('div');
                basePicture.className = 'baseObjectAttributeImage';
                basePicture.style.backgroundImage = 'url('+baseObjects[i].ProjectImage.minUrl+')';

                var baseUnset = document.createElement('div');
                baseUnset.className = 'baseObjectUnset';
                baseUnset.setAttribute( 'base-object-id', baseObjects[i]._id );
                baseUnset.setAttribute( 'view-id', Editor.adminProject.format.view.getId() );
                baseUnset.innerHTML = '&times;';
                baseUnset.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.editorBitmap.unsetBase( this.getAttribute('base-object-id'), this.getAttribute('view-id') );

                });


                baseElem.appendChild( basePicture );
                baseElem.appendChild( baseUnset );

                baseElem.addEventListener('click', function( e ){

                    // to trzeba skonczyc później!!!
                    e.stopPropagation();

                    var _this = this;

                    var baseObjectID = this.getAttribute('base-object-id');

                    var formatAttributes = document.createElement('div');
                    formatAttributes.id = 'formatAttributes';

                    for( var key in _options ){

                        var attribute = document.createElement('div');
                        attribute.className = 'formatAttribute';
                        attribute.setAttribute( 'id', key );
                        attribute.setAttribute( 'name', _options[key].name );
                        attribute.innerHTML = _options[key].name;

                        attribute.addEventListener('click', function( e ){

                            e.stopPropagation();
                            //console.log('powinno sie aktywowac');

                            if( this.className == 'formatAttribute active' )
                                this.className = 'formatAttribute';
                            else
                                this.className = 'formatAttribute active';

                        });

                        formatAttributes.appendChild( attribute );

                    }

                    var options = document.createElement('div');
                    options.id = 'viewAttributeOptions';

                    var generator = document.createElement('div');
                    generator.setAttribute('view-id', this.getAttribute('view-id'));
                    generator.setAttribute('base-object-id', this.getAttribute('base-object-id'));

                    generator.className = 'generator';

                    generator.addEventListener('click', function( e ){

                        e.stopPropagation();

                        var selectedAttributes = [];

                        $('.formatAttribute.active').each( function(){

                            selectedAttributes.push({

                                id : $(this).attr('id'),
                                name : $(this).attr('name'),
                                options : _options[ $(this).attr('id') ].options

                            });

                        });

                        //console.log('z czego mam wygenerować przypadki');
                        //console.log( selectedAttributes );

                        var attributeList = [];

                        var combinations = [];

                        var combo = 0;

                        for( var i=0; i < selectedAttributes.length; i++ ){

                            if( combo )
                                combo = combo * selectedAttributes[i].options.length;
                            else
                                combo = selectedAttributes[i].options.length;

                        }

                        var options = [];

                        for( var i=0; i < selectedAttributes.length; i++ ){

                            var optionArray = [];

                            for( var key in selectedAttributes[i].options ){

                                optionArray.push( { id : key, name : selectedAttributes[i].options[key].name } );

                            }

                            options.push(optionArray);

                        }


                        //console.log( options );
                        var max = options.length;
                        var arrayOfCombinations = [];

                        function collectCombination( arrOfComb, i){

                            var a = arrOfComb.slice(0);

                            for( var k=0; k < options[i].length; k++ ){

                                var t = a.slice(0);
                                t.push( options[i][k] );

                                if( i+1 < options.length ){
                                    collectCombination( t, i+1 );
                                }
                                else{
                                    arrayOfCombinations.push( t );
                                }

                            }

                        };

                        collectCombination([],0);

                        //console.log( arrayOfCombinations );

                        var arrayOfCombinationsOnlyID = [];

                        for( var i=0; i < arrayOfCombinations.length;i++ ){

                            var ids = [];

                            for( var l=0; l < arrayOfCombinations[i].length; l++ ){

                                ids.push( parseInt( arrayOfCombinations[i][l].id ) );

                            }

                            arrayOfCombinationsOnlyID.push( ids );

                        }

                        //console.log( arrayOfCombinationsOnlyID );


                        Editor.webSocketControllers.editorBitmap.setOptions( this.getAttribute('base-object-id'), this.getAttribute('view-id'), arrayOfCombinationsOnlyID, function( data ){

                            var attributesLayers = document.getElementById('viewAttributeOptions');

                            attributesLayers.innerHTML = '';

                            for( var i=0; i < arrayOfCombinations.length; i++ ){

                                var attributesLayer = document.createElement('div');
                                attributesLayer.className = 'objectOption';


                                var attributeTitle = document.createElement('div');
                                attributeTitle.className = 'objectOptionTitle';

                                var optionsIds = [];

                                for( var k=0; k < arrayOfCombinations[i].length; k++ ){

                                    var optionInfo = Editor.adminProject.format.getAllOptionInfoByOptionID( arrayOfCombinations[i][k].id );
                                    attributeTitle.innerHTML += "<span class='attributeOptionInfo'><span class='attributeOptionInfo_name'>"+ optionInfo.attributeName + ":</span>" + optionInfo.optionName + " </span>";
                                    optionsIds.push( arrayOfCombinations[i][k].id );

                                }

                                attributesLayer.setAttribute('options-id', optionsIds );

                                attributesLayer.appendChild( attributeTitle );

                                var attributesLayerImage = document.createElement('div');
                                attributesLayerImage.className = 'attributeLayerImage';

                                attributesLayer.appendChild( attributesLayerImage );

                                attributesLayer.addEventListener("dragleave", function(e){

                                    e.stopPropagation();
                                    this.className = 'objectOption';


                                }, false);

                                attributesLayer.addEventListener('dragover', function(e){

                                    //e.stopPropagation();
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'copy';

                                    alert('tak');

                                    this.className = 'objectOption dragover';

                                }, false);


                                attributesLayer.addEventListener('drop', function(e){

                                    e.preventDefault();

                                    var dropElement = e.target;




                                    this.className = 'objectOption droped';

                                    Editor.handleDropedFileToUpload_customCallback( e, function( data ){

                                        var min = data.image.min;
                                        var thumb = data.image.thumb;
                                        var image = data.image.file;

                                        var fileData = new FormData();
                                        fileData.append("userFile", image );
                                        fileData.append("imageMin", min );
                                        fileData.append('thumbnail', thumb );

                                        var request = new XMLHttpRequest();

                                        request.upload.addEventListener('progress', function( data ){

                                            //console.log( data );
                                            //var evt = document.createEvent("Event");
                                            //evt.initEvent("progress", true, false);
                                            //evt.progress = parseInt( data.loaded/data.total*100 );
                                            //that.statusBar.dispatchEvent(evt);

                                        });

                                        request.open("POST", config.getDomain() +':'+config.getPort()+'/upload/projectImage/', true);

                                        request.send( fileData );

                                        request.onreadystatechange = function( aEvt ){

                                            if( request.readyState == 4 ){

                                                //console.log('JEST OK :)');

                                                var resp = JSON.parse(request.responseText);

                                                var objectContent = {

                                                    img : resp.url,
                                                    min_img : resp.minUrl

                                                };


                                                var callbackFunc = function( data ){

                                                    var objB = Editor.stage.getObjectByDbId( baseObjectID );

                                                    Editor.webSocketControllers.editorBitmap.addAsOption(

                                                        Editor.adminProject.getProjectId(),
                                                        data.uid,
                                                        objB.dbID,
                                                        dropElement.getAttribute('options-id').split(','),//options
                                                        { x : objB.x, y : objB.y },
                                                        data.width,
                                                        data.height,
                                                        objB.rotation,
                                                        objB.scaleX,
                                                        objB.scaleY,
                                                        function( data ){

                                                            //console.log( data );
                                                            alert('wykonalo się');

                                                        }

                                                    );

                                                };

                                                //console.log( resp );
                                                //console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

                                                Editor.webSocketControllers.projectImage.addNoRef(

                                                    Editor.generateUUID(),
                                                    Editor.adminProject.getProjectId(),
                                                    image.name,
                                                    'bitmap',
                                                    resp.url,
                                                    resp.minUrl,
                                                    resp.thumbUrl,
                                                    data.smallBounds.width,
                                                    data.smallBounds.height,
                                                    data.origin.width,
                                                    data.origin.height,
                                                    callbackFunc

                                                );

                                            }

                                        };


                                    });

                                }, false);


                                attributesLayers.appendChild( attributesLayer );

                            }
                        } );




                    });

                    // to powinno sie wykonac jako callback do wyemitowanego geta
                    $.ajax({

                        url : 'templates/baseObjectAttributesLayers.html',
                        type : 'GET',
                        crossDomain: true,
                        success : function( html ){

                            Editor.webSocketControllers.editorBitmap.getOptions( _this.getAttribute( 'base-object-id' ), function( data ){

                                //console.log( data );
                               // alert('sprawdzanko');

                                var attributesLayers = document.getElementById('viewAttributeOptions');

                                if( !attributesLayers ){

                                    var attributesLayers = document.createElement('div');
                                    attributesLayers.id = 'viewAttributeOptions';

                                }

                                for( var a=0; a < data.length; a++ ){

                                    var attributesLayer = document.createElement('div');
                                    attributesLayer.className = 'objectOption';

                                    var attributeTitle = document.createElement('div');
                                    attributeTitle.className = 'objectOptionTitle';

                                    for( var o=0; o < data[a].ids.length; o++ ){

                                        var optionInfo = Editor.adminProject.format.getAllOptionInfoByOptionID( data[a].ids[o] );
                                        attributeTitle.innerHTML +=  "<span class='attributeOptionInfo'><span class='attributeOptionInfo_name'>"+ optionInfo.attributeName + ":</span>" + optionInfo.optionName + " </span>";

                                    }

                                    attributesLayer.setAttribute('options-id', data[a].ids );

                                    attributesLayer.appendChild( attributeTitle );


                                    var attributesLayerImage = document.createElement('div');
                                    attributesLayerImage.className = 'attributeLayerImage';

                                    if( data[a].EditorBitmap ){
                                        attributesLayerImage.innerHTML = '<img src="' + data[a].EditorBitmap.ProjectImage.thumbnail + '" class="none">';
                                    }
                                    else {
                                        attributesLayerImage.innerHTML = '<img src="images/nophoto.jpg" class="none">';
                                    }


                                    attributesLayer.appendChild( attributesLayerImage );

                                    attributesLayer.addEventListener("dragleave", function(e){

                                        e.stopPropagation();
                                        this.className = 'objectOption';


                                    }, false);

                                    attributesLayer.addEventListener('dragover', function(e){

                                        //e.stopPropagation();
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'copy';

                                        this.className = 'objectOption dragover';

                                    }, false);


                                    attributesLayer.addEventListener('drop', function(e){

                                        e.preventDefault();

                                        var dropElement = e.target;
                                        var file = e.dataTransfer.files[0];
                                        this.className = 'objectOption droped';

                                        var _image = new Image();

                                        url = URL.createObjectURL( file );
                                        _image.src = url;

                                        var loadedImage = new createjs.Bitmap( _image );

                                        loadedImage.image.onload = function(){

                                            URL.revokeObjectURL( url );
                                            url = null;

                                            loadedImage.origin = loadedImage.getBounds();
                                            loadedImage.scale = {
                                                x : loadedImage.origin.width,
                                                y : loadedImage.origin.height
                                            };

                                            var obrazek = ThumbsMaker.generateThumb( loadedImage );

                                            //console.log( obrazek );

                                            var fileData = new FormData();
                                            fileData.append('userFile', file );
                                            fileData.append('minSize', JSON.stringify(obrazek.minSize) );
                                            fileData.append('thumbSize', JSON.stringify(obrazek.thumbSize) );

                                            var request = new XMLHttpRequest();
                                            request.open("POST", config.getDomain() +':'+config.getPort()+'/upload/projectImage/', true);

                                            request.send( fileData );

                                            request.onreadystatechange = function( aEvt ){

                                                if( request.readyState == 4 ){

                                                    var resp = JSON.parse( request.responseText );

                                                    var objectContent = {

                                                        img : resp.url,
                                                        min_img : resp.minUrl

                                                    };

                                                    var callbackFunc = function( data ){

                                                        var projectImageData = data;

                                                        Editor.webSocketControllers.editorBitmap.get( baseObjectID, function( data ){

                                                            var objB = data;

                                                            var baseOptions = dropElement.getAttribute('options-id').split(',');

                                                            for( var l=0; l < baseOptions.length; l++ ){

                                                                baseOptions[l] = parseInt(baseOptions[l]);

                                                            }

                                                            Editor.webSocketControllers.editorBitmap.addAsOption(

                                                                Editor.adminProject.getProjectId(),
                                                                projectImageData.uid,
                                                                objB._id,
                                                                baseOptions,//options
                                                                { x : objB.x, y : objB.y },
                                                                objB.width,
                                                                objB.height,
                                                                objB.rotation,
                                                                objB.scaleX,
                                                                objB.scaleY,
                                                                function( data ){

                                                                    //console.log( data );
                                                                    alert('wykonalo się');

                                                                }

                                                            );

                                                        });

                                                    };

                                                    Editor.webSocketControllers.projectImage.addNoRef(

                                                        Editor.generateUUID(),
                                                        Editor.adminProject.getProjectId(),
                                                        file.name,
                                                        'bitmap',
                                                        resp.url,
                                                        resp.minUrl,
                                                        resp.thumbUrl,
                                                        obrazek.minSize.width,
                                                        obrazek.minSize.width,
                                                        loadedImage.origin.width,
                                                        loadedImage.origin.height,
                                                        callbackFunc

                                                    );

                                                }

                                            };

                                        };

                                    }, false);


                                    attributesLayers.appendChild( attributesLayer );

                                }

                                $('body').append( html );

                                $('#baseObjectAttributesLayers .modal-body').append( formatAttributes );
                                $('#baseObjectAttributesLayers .modal-body').append( generator );
                                $('#baseObjectAttributesLayers .modal-body').append( attributesLayers );

                                $('#baseObjectAttributesLayers').on( 'hidden.bs.modal', function(){
                                    $(this).remove();
                                });

                                $('#baseObjectAttributesLayers').modal({
                                    keyboard: false,
                                    backdrop: 'static'
                                });

                            });



                            //Editor.template.baseObjectAttributesLayers( {} );

                        }

                    });


                });

                baseObjectsLayers.appendChild( baseElem );

            }

            $('#baseViewLayer').html( baseObjectsLayers );

        };


        var updateSettings = function( formatID ){

            var attributes = Editor.getAttributesOptions();

            var viewAttributes = document.getElementById( 'attributesView' );

        };


        var updatePages = function(){



        };


        var updateProductsViews = function( productGroups ){

            var productsViewsList = document.getElementById( 'productsViewsList' );
            productsViewsList.innerHTML = '';

            var selectedProducts = Editor.complexAdminProject.getSelectedProducts();

            for( var i=0; i < selectedProducts.length; i++ ){

                var productElement = document.createElement('div');
                productElement.className = 'productViewsElement';
                productElement.innerHTML = selectedProducts[ i ].product.typeName;
                productElement.setAttribute( 'format-id', selectedProducts[ i ].formatID );
                productElement.setAttribute( 'product-id', selectedProducts[ i ].product.typeID );
                productElement.setAttribute( 'product-group-id', selectedProducts[ i ].groupID );
                productElement.setAttribute( 'complex-view-id', Editor.complexAdminProject.complexView.getID() );

                productElement.addEventListener('click', function( e ){

                    e.stopPropagation();

                    var typeID = this.getAttribute('product-id');
                    var groupID = this.getAttribute('product-group-id');

                    document.getElementById('productViewsListContent').innerHTML = '';

                    //console.log( 'pobieram widoki dla obiektu productID: ' + this.getAttribute( 'product-id' ) + ', formatID: ' + this.getAttribute( 'format-id' ) );

                    Editor.webSocketControllers.format.getByIntID( this.getAttribute( 'format-id' ), function( data ){

                        $( '#productsViewsList' ).animate( { 'left' : '-100%' }, 100 );
                        $( '#productViewsList' ).animate( { 'left' : '0%' }, 100 );

                        for( var i=0; i < data.Views.length; i++ ){

                            var viewElement = document.createElement('div');
                            viewElement.className = 'productViewElement';
                            viewElement.setAttribute( 'product-group-id', groupID );
                            viewElement.setAttribute( 'view-id', data.Views[i]._id );
                            viewElement.setAttribute( 'format-id', data.formatID );
                            viewElement.setAttribute( 'type-id', typeID );
                            viewElement.innerHTML = data.Views[i].name;

                            document.getElementById('productViewsListContent').appendChild( viewElement );

                        }

                        $( '.productViewElement' ).draggable({

                            appendTo: "body",
                            zIndex : 1000000,
                            cursorAt: {left: -20, top: -20},
                            start : function(){


                            },
                            drag: function( event, ui ){



                            },
                            stop : function( event, ui ){

                                // powinno być set view object
                                Editor.webSocketControllers.complexView.setViewObject(

                                    Editor.complexAdminProject.complexView.getID(),
                                    event.target.getAttribute( 'view-id' ),
                                    event.target.getAttribute( 'product-group-id' ),
                                    event.target.getAttribute( 'format-id' ),
                                    event.target.getAttribute( 'type-id' )

                                );

                                /*
                                var viewObject = new Editor.EditorComplexViewObject( true, event.target.getAttribute( 'view-id' ) );
                                //viewObject.loadView( event.target.getAttribute( 'view-id' ) );

                                var groupLayer = Editor.complexAdminProject.complexView.getGroupLayer( event.target.getAttribute( 'product-group-id' ));

                                Editor.stage.addObject( viewObject );
                                groupLayer.addChild( viewObject  );

                                console.log( event );
                                console.log( ui );
                                */

                            },

                            revert : false,
                            helper : 'clone'

                        });

                    });

                });

                productsViewsList.appendChild( productElement );

            }

        };


        /**
        * Pobiera cały projekt
        *
        * @method updateViews
        * @param {Array} views tablica widoków
        */
        var updateViews = function( views ){

            var viewsContent = $("#views-content  ul#views-list");
            viewsContent.html("");

            for( var i=0; i < views.length; i++ ){

                var view = document.createElement('li');
                // view.className = '';
                view.dataset.id = views[i]._id;
                view.innerHTML = '<img src="' + (( views[i].image )? views[i].image : "images/images-tool-large.png"  ) + '">';

                var viewTitle = document.createElement('span');
                viewTitle.className = 'view_title';
                viewTitle.innerHTML = views[i].name;

                view.appendChild(viewTitle);



                var setRepeatAble = document.createElement('div');
                setRepeatAble.setAttribute( 'view-id', views[i]._id );
                setRepeatAble.className = 'repeatable ' + ( ( views[i].repeatable ) ? 'yes' : 'no' );

                setRepeatAble.addEventListener( 'click', function( e ){

                    e.stopPropagation();

                    if( $(this).hasClass('yes') )
                        Editor.webSocketControllers.view.update( { 'repeatable' : false } );
                    else
                        Editor.webSocketControllers.view.update( { 'repeatable' : true } );


                });

                view.appendChild( setRepeatAble );

                view.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.adminProject.format.view.init( this.getAttribute('data-id') );

                });


                viewsContent.append(view);

            }

        };


        /**
        * Updejtuje kompleksowe widoki
        *
        * @method updateComplexViews
        * @param {Array} views tablica widoków
        */
        var updateComplexViews = function( views ){

            var viewsContent = $("#views-content  ul#views-list");
            viewsContent.html( "" );

            //console.log( 'updateWidoków --------------------------------------------' );
            //console.log( views );

            for( var i=0; i < views.length; i++ ){

                var view = document.createElement('li');
                // view.className = '';
                view.dataset.id = views[i]._id;
                view.innerHTML = '<img src="' + (( views[i].image )? views[i].image : "images/images-tool-large.png"  ) + '">';

                var viewTitle = document.createElement('span');
                viewTitle.className = 'view_title';
                viewTitle.innerHTML = views[i].name;

                view.appendChild(viewTitle);

                var setRepeatAble = document.createElement('div');
                setRepeatAble.setAttribute( 'view-id', views[i]._id );
                setRepeatAble.className = 'repeatable ' + ( ( views[i].repeatable ) ? 'yes' : 'no' );

                setRepeatAble.addEventListener( 'click', function( e ){

                    e.stopPropagation();

                    if( $(this).hasClass('yes') )
                        Editor.webSocketControllers.view.update( { 'repeatable' : false } );
                    else
                        Editor.webSocketControllers.view.update( { 'repeatable' : true } );


                });

                view.appendChild( setRepeatAble );

                view.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.complexAdminProject.complexView.init( this.getAttribute('data-id') );
                    //Editor.adminProject.format.view.init( this.getAttribute('data-id') );

                });

                viewsContent.append( view );

            }

        };


        var generateComplexLayers = function( children ){

            //console.log('generowanie warstw dla widoku produktów złożonych');

        };

        // to trzeba dalej rozdzielić na moduły
        var generateViewLayers = function( objects ){

            var viewsLayers = document.createElement('ul');

            for( var i=0; i < objects.length; i++){

                viewsLayers.appendChild( generateViewLayerForObject( objects[i] ) );

            }

            return viewsLayers;

        };


        /**
        * Generuje
        *
        * @method generateToolsBox
        * @param {String} type Typ toolsBoxa pro|ama
        */
        var generateViewLayerForObject = function( object ){

            //console.log('generateViewLayerForObject');
            //console.log( object );

            var layer = document.createElement('li');
            layer.className = 'viewLayer';
            layer.innerHTML = object.name;
            layer.setAttribute('data-object-id', object.id );

            //console.log('podczas tworzenia warstwy: ' + object.id );

            // przycisk do usuwania
            layer.appendChild( removeViewObjectButton( object ) );

            layer.addEventListener('click', function(){

                var objectId = this.getAttribute('data-object-id');
                var object = Editor.stage.getObjectByDbId( objectId );

                object.dispatchEvent('mousedown');

                //console.log( object );

                Editor.tools.setEditingObject( object.id );

                Editor.tools.init();


            });

            return layer;

        };


        var removeViewObjectButton = function( object ){

            var button = document.createElement('span');
            button.className = 'removeViewObject';
            button.setAttribute('data-object-id', object.id );
            button.innerHTML = "x";

            button.addEventListener('click', function(){

                var confirmRemove = confirm('Czy napewno chcesz usunąć obiekt?');

                if( confirmRemove == true ){

                    var objectId = this.getAttribute('data-object-id');
                    var object = Editor.stage.getObjectByDbId( objectId );

                    var removing = Editor.adminProject.view.removeObject( object.dbID );

                    removing.then(
                        function( data ){

                            alert('obiekt usunięty pomyślnie');

                        },
                        function( data ){

                            alert('kłopot przy usuwaniu');

                        });

                }
                else {



                }


            });

            return button;

        }

        var updateThemeCategorySelects = function( data ){

            $('.themeCategorySelect').html('');

            for( var i=0; i < data.length; i++ ){

                $('.themeCategorySelect').append('<option value="'+ data[i]._id +'">'+data[i].name+'</option>');

            }

        };



        /**
        * Generuje|odświeża warstwy
        *
        * @method updateLayers
        * @param {Object} children Obiekt reprezentując y dzieci obiektu dla którego chcemy wygenerować warstwy
        */
        var updateComplexLayers = function( children ){

            var scrollbar = document.createElement('div');
            scrollbar.className = 'scrollbar';

            var track = document.createElement('div');
            track.className = 'track';

            scrollbar.appendChild( track );

            var thumb = document.createElement('div');
            thumb.className = 'thumb';

            track.appendChild( thumb );

            var end = document.createElement('div');
            end.className = 'end';

            thumb.appendChild( end );

            var layers = document.createElement('ul');


            for( var i=0; i <= children.length; i++ ){

                if( children[ children.length-i] instanceof Editor.Bitmap || children[ children.length-i] instanceof Editor.EditableArea || children[ children.length-i] instanceof EditorLayer ){

                    var layer = children[children.length-i].toLayerHTML();
                    layer.setAttribute('data-local-id', children[children.length-i].id );

                    layer.addEventListener('click', function( e ){

                        e.stopPropagation();

                        var object = Editor.stage.getObjectById( this.getAttribute( 'data-local-id' ) );

                        if( !(object instanceof Editor.EditableArea ) ){

                            Editor.tools.setEditingObject( this.getAttribute( 'data-local-id' ) );
                            Editor.tools.init();
                        }
                    });

                    layer.addEventListener('dblclick', function( e ){
                        e.stopPropagation();
                        var obj = Editor.stage.getObjectById( this.getAttribute('data-local-id') );
                        Editor.stage.centerToPoint( obj.x, obj.y );
                        Editor.stage.updateRulers();
                    });
                    layers.appendChild( layer );
                }

            }

            overview.appendChild( layers );

            document.getElementById('editorLayers').innerHTML = '';


        };


        /**
        * Generuje|odświeża warstwy
        *
        * @method updateLayers
        * @param {Object} children Obiekt reprezentując y dzieci obiektu dla którego chcemy wygenerować warstwy
        */
        var updateLayers = function(){

            if( userType == 'user' )
                return;

            //var children = Editor.stage.getMainLayer().children;

            var projectObjects = Editor.adminProject.format.view.getLayer().children;
            var pages = Editor.adminProject.format.view.page.getPageLayer().children;

            var children = projectObjects.concat( pages );

            var scrollbar = document.createElement('div');
            scrollbar.className = 'scrollbar';

            var track = document.createElement('div');
            track.className = 'track';
            scrollbar.appendChild( track );

            var thumb = document.createElement('div');
            thumb.className = 'thumb';

            track.appendChild( thumb );

            var end = document.createElement('div');
            end.className = 'end';

            thumb.appendChild( end );

            var viewport = document.createElement('div');
            viewport.className = 'viewport';
            var overview = document.createElement('div');
            overview.className = 'overview';

            viewport.appendChild( overview );

            var layers = document.createElement('ul');
            for( var i=1; i <= children.length; i++ ){

                //if( children[ children.length-i] instanceof Editor.Bitmap || children[ children.length-i] instanceof Editor.EditableArea ){

                var layer = children[children.length-i].toLayerHTML();
                layer.setAttribute('data-local-id', children[children.length-i].id );

                /*
                layer.addEventListener('click', function( e ){

                    e.stopPropagation();

                    if ( $("#editorLayers li").hasClass("layerSelected") ){

                            $("#editorLayers li").removeClass("layerSelected");
                    }

                    $(this).addClass("layerSelected");


                    var object = Editor.stage.getObjectById( this.getAttribute( 'data-local-id' ) );
                    if( !(object instanceof Editor.EditableArea ) ){
                        Editor.tools.setEditingObject( this.getAttribute( 'data-local-id' ) );
                        Editor.tools.init();
                    }

                });

                layer.addEventListener('dblclick', function( e ){


                    e.stopPropagation();
                    var obj = Editor.stage.getObjectById( this.getAttribute('data-local-id') );
                    Editor.stage.centerToPoint( obj.x, obj.y );
                    Editor.stage.updateRulers();

                });
                */

                layers.appendChild( layer );

                //

            }

            overview.appendChild( layers );

            document.getElementById('editorLayers').innerHTML = '';

            document.getElementById('editorLayers').appendChild( viewport );

            Ps.initialize( viewport );

        };


        /**
        * Funkcja odpowiadająca za wygenerowanie treści w zakładce atrybutów
        *
        * @method updateAttributesContent
        */
        var updateAttributesContent = function(){

            //console.log('Editor.templateAdministration.updateAttributesContent');

            // selecty atrybutów
            var productAttributes = '';

            // warstwy widoku
            var viewLayers = document.createElement('ul');

            // pobranie wszystkich obiektów z aktualnego widoku
            var viewObjects = Editor.adminProject.view.getObjects();


            var viewLayerContainer = document.getElementById( "baseViewLayer" );
            viewLayerContainer.innerHTML = '';

            viewLayerContainer.appendChild( generateViewLayers( viewObjects ) );

            //console.log('END - Editor.templateAdministration.updateAttributesContent');

        };


        var setUsedView = function( viewId ){

            $("#views-list li").removeClass('current');

            $("#views-list li[data-id="+viewId+"]").addClass('current');

        };


        var getThemes = function(){

            //console.log( 'callback działa trzeba go ubrać ładnie');

        };

        var updateAttributes = function(){

            Editor.generateAttributesOptions_Select();

        };


        var updateThemePages = function( mainThemeID, themeID, pagesData ){

            $("#themeContent .themepages").html('');

            var themePagesToSort = [];

            for( var i=0; i < pagesData.copiedPages.length; i++ ){

                pagesData.copiedPages[i].is = 'copied';
                themePagesToSort.push( pagesData.copiedPages[i] );

            }

            for( var i=0; i <pagesData.mainPages.length; i++ ){

                pagesData.mainPages[i].is = 'main';
                themePagesToSort.push( pagesData.mainPages[i] );

            }

            for( var i=0; i <pagesData.localPages.length; i++ ){

                pagesData.localPages[i].is = 'local';
                themePagesToSort.push( pagesData.localPages[i] );

            }

            var sorted = _.sortBy(themePagesToSort, [ 'order', 'name']);

            //console.log( sorted );
            //console.log('(((((((((((((((((((((((((((())))))))))))))))))))))))))))');

            var vacancies = [];
            var fullpages = [];
            var localPages = [];
            var notAddedPages = [];

            var copiedVacancy = [];
            var copiedFull = [];
            var notAddedVacancy = [];
            var notAddedFull = [];
            var localyAddedVacancy = [];
            var localyAddedFull = [];

            for( var i=0; i < sorted.length;i++){

                if( sorted[i].vacancy && sorted[i].is == 'copied' ){
                    copiedVacancy.push( sorted[i] );
                }


                if( !sorted[i].vacancy && sorted[i].is == 'copied' ){
                    copiedFull.push( sorted[i] );
                }

                if( sorted[i].vacancy && sorted[i].is == 'main' ){
                    notAddedVacancy.push( sorted[i] );
                }

                if( !sorted[i].vacancy && sorted[i].is == 'main' ){
                    notAddedFull.push( sorted[i] );
                }

                if( sorted[i].vacancy && sorted[i].is == 'local' ){
                    localyAddedVacancy.push( sorted[i] );
                }

                if( !sorted[i].vacancy && sorted[i].is == 'local' ){
                    localyAddedFull.push( sorted[i] );
                }

            }


            var label = document.createElement('div');
            label.className = 'theme-pages-section-group';
            label.innerHTML = '<h4 class="theme-pages-section-group-title">Strony utworzone lokalnie</h4>';

            var localyAddedVacancyLabel = document.createElement('h5');
            localyAddedVacancyLabel.innerHTML = 'Strony wakatowe';

            label.appendChild( localyAddedVacancyLabel );

            for( var i=0; i < localyAddedVacancy.length; i++ ){

                var elem = Editor.template.themePageElement( localyAddedVacancy[i] );
                label.appendChild( elem );

            }

            var localyAddedFullLabel = document.createElement('h5');
            localyAddedFullLabel.innerHTML = 'Strony rozkładówkowe';

            label.appendChild( localyAddedFullLabel );

            for( var i=0; i < localyAddedFull.length; i++ ){

                var elem = Editor.template.themePageElement( localyAddedFull[i] );
                label.appendChild( elem );

            }

            var labelAdded = document.createElement('h4');
            labelAdded.className = "theme-pages-section-group-title";
            labelAdded.innerHTML = 'Strony skopiowanie z globalnego motywu';

            var label2 = document.createElement('h5');
            label2.innerHTML = 'Strony wakatowe';
            var label3 = document.createElement('h5');
            label3.innerHTML = 'Strony rozkładówkowe';

            label.appendChild( labelAdded );
            label.appendChild( label2 );

            for( var i=0; i < copiedVacancy.length; i++ ){

                var elem = Editor.template.themePageElement( copiedVacancy[i] );
                label.appendChild( elem );

            }


            label.appendChild( label3 );
            for( var i=0; i < copiedFull.length; i++ ){

                var elem = Editor.template.themePageElement( copiedFull[i] );
                label.appendChild( elem );

            }

            var notAddedLabel = document.createElement('h4');
            notAddedLabel.className = 'theme-pages-section-group-title';
            notAddedLabel.innerHTML = 'Strony nie dodane';
            var notAddedVacancyLabel = document.createElement('h5');
            notAddedVacancyLabel.innerHTML = 'Strony wakatowe';
            var notAddedFullLabel = document.createElement('h5');
            notAddedFullLabel.innerHTML = 'Strony rozkładówkowe';

            label.appendChild( notAddedLabel );
            label.appendChild( notAddedVacancyLabel );

            for( var i=0; i < notAddedVacancy.length; i++ ){


                var elem = Editor.template.themePageElement( notAddedVacancy[i] );
                label.appendChild( elem );

            }

            label.appendChild( notAddedFullLabel );

            for( var i=0; i < notAddedFull.length; i++ ){

                var elem = Editor.template.themePageElement( notAddedFull[i] );
                label.appendChild( elem );

            }
            /*
            for( var i=0; i < sorted.length; i++ ){

                var elem = Editor.template.themePageElement( sorted[i] );

                document.getElementById('themepages').appendChild( elem );

            };
            */

            document.getElementById('themepages').appendChild( label );

            document.querySelector('#themeContent .themepages').style.height = ($('#toolsBox').outerHeight() - $('#backToAllThemes').outerHeight() - $('#goToThemeImages').outerHeight() - $('#goToThemeFrames').outerHeight() - $('#changeColumns').outerHeight() - 95) + 'px';

            return;

            $("#themeContent .themepages").html('');

            for( var i=0; i < pagesData.localPages.length; i++){

                var page = pagesData.localPages[i];

                var usedThemePage = document.createElement('div');
                usedThemePage.className = 'localThemePage';
                usedThemePage.setAttribute('data-theme-page-id', page._id );
                usedThemePage.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+page.url + ')';

                var removeFromProjectTheme = document.createElement('div');
                removeFromProjectTheme.className = 'removeThemePage';
                removeFromProjectTheme.setAttribute( 'data-theme-page-id', page._id );
                removeFromProjectTheme.setAttribute( 'theme-id', themeID );

                removeFromProjectTheme.innerHTML = '-';

                removeFromProjectTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.theme.removeLocalPage( this.getAttribute( 'theme-id' ), this.getAttribute( 'data-theme-page-id' ) );

                });

                var copyPageToMainTheme = document.createElement('div');
                copyPageToMainTheme.className = 'copyPageToMainTheme';
                copyPageToMainTheme.setAttribute('main-theme-id', mainThemeID);
                copyPageToMainTheme.setAttribute('theme-id', themeID );
                copyPageToMainTheme.setAttribute('theme-page-id', page._id );

                copyPageToMainTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.mainTheme.copyPageFromLocal( this.getAttribute('main-theme-id'), this.getAttribute('theme-id'), this.getAttribute('theme-page-id') );

                });


                usedThemePage.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('theme-page-id'), function( data ){

                        //console.log( data );
                        alert('sprawdzany');
                        Editor.adminProject.format.view.page.loadThemePage( data );
                        //Editor.adminProject.format.view.page.get()['pageObject'].loadThemePage( data );

                    });

                });

                usedThemePage.appendChild( copyPageToMainTheme );

                usedThemePage.appendChild( removeFromProjectTheme );

                document.getElementById('themepages').appendChild( usedThemePage );

            }


            for( var i=0; i < pagesData.copiedPages.length; i++){

                var page = pagesData.copiedPages[i];

                var usedThemePage = document.createElement('div');
                usedThemePage.className = 'addedThemePage';
                usedThemePage.setAttribute('data-theme-page-id', page._id );
                usedThemePage.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+page.url + ')';

                var removeFromProjectTheme = document.createElement('div');
                removeFromProjectTheme.className = 'removeThemePageFromProjectTheme';
                removeFromProjectTheme.setAttribute('data-theme-page-id', page._id );

                removeFromProjectTheme.innerHTML = '-';

                removeFromProjectTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.theme.removeCopiedPage( this.getAttribute( 'data-theme-page-id' ), Editor.adminProject.format.theme.getID() );

                });

                usedThemePage.addEventListener('click', function( e ){

                    e.stopPropagation();
                    //console.log('następuje załadowanie strony motywu');
                    Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){
                        //console.log( data );
                        alert('sprawdzany');
                        Editor.adminProject.format.view.page.loadThemePage( data );
                        //Editor.adminProject.format.view.page.get()['pageObject'].loadThemePage( data );

                    });

                });

                usedThemePage.appendChild( removeFromProjectTheme );

                document.getElementById('themepages').appendChild( usedThemePage );

            }


            for( var i=0; i < pagesData.mainPages.length; i++ ){

                var themePageNotUsed = document.createElement('div');
                themePageNotUsed.className = 'mainThemePage';
                themePageNotUsed.setAttribute('data-theme-page-id', pagesData.mainPages[i]._id );

                themePageNotUsed.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+pagesData.mainPages[i].url + ')';

                var addToProjectTheme = document.createElement('div');
                addToProjectTheme.className = 'addThemePageToProjectTheme';
                addToProjectTheme.setAttribute('data-theme-page-id', pagesData.mainPages[i]._id );
                addToProjectTheme.setAttribute('main-theme-id', pagesData.mainPages[i].mainThemeID );
                addToProjectTheme.innerHTML = '+';
                addToProjectTheme.addEventListener( 'click', function( e ){

                    e.stopPropagation();
                    var mainThemePageId = this.getAttribute( 'data-theme-page-id' );
                    var mainThemeId = this.getAttribute('main-theme-id');
                    Editor.webSocketControllers.theme.copyPageFromMainTheme( themeID, mainThemePageId, mainThemeId, function( data ){


                    } );
                    //console.log('poszło');

                });
                themePageNotUsed.appendChild( addToProjectTheme );

                themePageNotUsed.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){
                        //console.log( data );
                        alert('sprawdzany');
                        //Editor.adminProject.format.view.page.loadThemePage( data );
                        Editor.adminProject.format.view.page.loadThemePage( data );

                    });

                });

                document.getElementById('themepages').appendChild( themePageNotUsed );

            }

        };


        var setUsedThemePage = function( themePageID ){

            $("#themepages > div").removeClass('used');
            $("#themepages > div[theme-page-id='"+themePageID+"']").addClass('used');

        };


        var setUsedProposedTemplate = function( proposedTemplateID ){

            $(".proposedTemplateElement img").removeClass('used');
            $(".proposedTemplateElement img[proposed-template-id='"+proposedTemplateID+"']").addClass('used');

        };


        var updateThemeImages = function(){

            var themeImages = Editor.adminProject.format.theme.getProjectImages();
            var themeBackgrounds = Editor.adminProject.format.theme.getProjectBackgrounds();
            var themeCliparts = Editor.adminProject.format.theme.getProjectCliparts();


            var themeImagesPhotos = document.getElementById('themeImagesPhotos').firstChild;
            themeImagesPhotos.innerHTML = '';

            var themeImagesBackgrounds = document.getElementById('themeImagesBackgrounds').firstChild;
            themeImagesBackgrounds.innerHTML = '';

            var themeImagesCliparts = document.getElementById('themeCliparts').firstChild;
            themeImagesCliparts.innerHTML = '';

            if( themeImages ){

                for( var key in themeImages ){

                    themeImagesPhotos.appendChild( themeImages[key].toHTML_ForTheme() );

                }

            }

            if( themeBackgrounds ){


                for( var key in themeBackgrounds ){

                    themeImagesBackgrounds.appendChild( themeBackgrounds[key].toHTML_ForTheme() );

                }

            }

            if( themeCliparts ){

                for( var key in themeCliparts ){

                    themeImagesCliparts.appendChild( themeCliparts[key].toHTML_ForTheme() );

                }

            }

            Editor.template.activePhotoThemeImages();

        };


        var updateThemes = function( themes ){

            var themesList = document.createElement('ul');
            themesList.className = 'all-theme-list';
            var listLenght = themesList.length;

            for( var i=0 ; i < themes.length; i++){

                var themeTitle = document.createElement('span');
                themeTitle.className = 'themeName';
                themeTitle.innerHTML = themes[i].name;
                themeTitle.setAttribute('data-theme-name', themes[i].name );

                var showPages = document.createElement('span');
                showPages.className = 'EditPages';
                showPages.addEventListener('click', function(){

                    //Editor.template.overlayBlock( content, 'big');

                });

                var themeEditor = document.createElement('div');
                themeEditor.className = 'themeEdit';
                themeEditor.setAttribute('data-theme-id', themes[i]._id );

                themeEditor.addEventListener('click', function( e ){
                    e.stopPropagation();
                    var id = this.getAttribute('data-theme-id');
                    var mainThemeID = this.getAttribute('data-main-theme-id');
                    Editor.webSocketControllers.theme.remove( id, Editor.adminProject.format.getDbId() );
                });

                var theme = document.createElement('li');
                theme.setAttribute( 'data-theme-id', themes[i]._id );
                theme.setAttribute( 'data-main-theme-id', themes[i].MainTheme );
                theme.appendChild( themeTitle );
                theme.appendChild( themeEditor );
                theme.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+themes[i].url + ')';

                theme.addEventListener('click', function( e ){

                    var _this = this;

                    var themeID = this.getAttribute('data-theme-id');
                    var mainThemeID = this.getAttribute('data-main-theme-id');
                    Editor.adminProject.format.theme.init( _this.getAttribute( 'data-theme-id' ) );
                    //Editor.webSocketControllers.productType.adminProject.mainTheme.getPages( this.getAttribute('data-main-theme-id'), getThemes );
                    $("#allProjectThemes").animate({ left: -$('#themes-content').outerWidth()}, 200 );
                    $("#themeContent").animate({ left: 0 }, 200 );
                    $('#themeImages').animate({left:'100%'}, 200 );
                    $(".currentThemeName").html( this.getAttribute('data-theme-name') );

                });

                themesList.appendChild( theme );

            }

            document.getElementById('project-themes-list').innerHTML = "";
            document.getElementById('project-themes-list').appendChild( themesList );

            Ps.initialize ( themesList );
        };


        /**
        * Funkcja odpowiadająca za wygenerowanie treści w całym szablonie, powinna byc uzywana tylko w przypdaku większego przeładowania.
        *
        * @method updateTemplate
        */
        var updateTemplate = function(){

            updateAttributesContent();

        };


        var selectTemplateToProject = function( data ){

            var content = document.createElement('div');
            content.innerHTML = 'Zaznacz pozycje proponowane które chcesz dodać do projektu';

            for( var i=0; i < data.length; i++ ){

                data[i].objects = data[i].ProposedImages.concat( data[i].ProposedTexts);

                var img = Editor.tools.proposedTemplate.generateTemplateForThisArea( Editor.stage.getPages()[i] ,data[i] );
                var li = document.createElement('li');
                li.style.backgroundImage = 'url('+EDITOR_ENV.staticUrl+img+')';
                constent.appendChild( li );

            };

            Editor.template.overlayBlock( content, 'big');

        };


        var updateProposedTemplates = function( data ){

            //console.log('wlazlo do szabolu pozycji proponowanych');

            var templateList = document.createElement('ul');

            for( var i=0; i< data.length; i++ ){

                var template = document.createElement('li');
                template.className = 'proposedTemplateElement';

                var templateImage = document.createElement('img');
                templateImage.src = EDITOR_ENV.staticUrl+data[i].url;
                templateImage.setAttribute( 'proposed-template-id', data[i]._id );


                templateImage.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.proposedTemplate.get( this.getAttribute('proposed-template-id'), function( data ){

                        Editor.adminProject.format.view.page.loadTemplate( data );

                    });

                });

                var templateRemover = document.createElement('div');
                templateRemover.setAttribute( 'proposed-template-id', data[i]._id );
                templateRemover.className = 'template-remover';

                templateRemover.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.proposedTemplate.remove( this.getAttribute( 'proposed-template-id' ) );
                    //console.log('usuwanie szablonu pozycji proponowanych: ' + this.getAttribute( 'proposed-template-id' ) );

                });

                template.appendChild( templateImage );
                template.appendChild( templateRemover );
                templateList.appendChild( template );

            }

            // proposedTemplateContent
            var ptc = document.getElementById('proposedTemplate-content');
            ptc.innerHTML = '';
            ptc.appendChild( templateList );

            setUsedProposedTemplate( Editor.adminProject.format.view.page.getProposedTemplateID() );

            /*
            // to co było tutaj jest to automatycznego generowania pozycji proponowanych
            var addTemplate = document.createElement('div');
            addTemplate.className = 'button';
            addTemplate.innerHTML = 'Dodaj pozycje proponowane';

            addTemplate.addEventListener('click', function(){
                Editor.webSocketControllers.getAllProposedTemplates();
            });

            var page = Editor.stage.getPages()[0];

            var images = document.createElement('div');

            for( var i=0; i < data.length; i++){

                var obj = {};
                obj.objects = data[i].content.objects;

                for( var k=0; k < obj.objects.length; k++ ){

                    obj.objects[k].bounds.x = parseFloat( obj.objects[k].bounds.x );
                    obj.objects[k].bounds.y = parseFloat( obj.objects[k].bounds.y );
                    obj.objects[k].bounds.width = parseFloat( obj.objects[k].bounds.width );
                    obj.objects[k].bounds.height = parseFloat( obj.objects[k].bounds.height );
                    obj.objects[k].pos[0] = parseFloat( obj.objects[k].pos[0]);
                    obj.objects[k].pos[1] = parseFloat( obj.objects[k].pos[1]);
                    obj.objects[k].rotation = parseFloat( obj.objects[k].rotation );
                    obj.objects[k].size.width = parseFloat( obj.objects[k].size.width );
                    obj.objects[k].size.height = parseFloat( obj.objects[k].size.height );

                }

                //alert('winno byc ok');

                obj.width = parseFloat( data[i].trueWidth );
                obj.height = parseFloat( data[i].trueHeight );
                obj.id = data[i].id;

                var id = obj.id;

                var obj = Editor.tools.proposedTemplate.generateTemplateForThisArea( page , obj );

                var image = document.createElement('div');
                image.className = 'proposedImage';
                image.innerHTML = obj.img;

                image.addEventListener('click', function(){

                    var id = $(this).children('img').attr('data-id');
                    var object = window.proposedTemplate_tmp[ id ];

                    Editor.stage.getPages()[0].loadTemplate( object );

                });

                images.appendChild( image );

            }

            $("#proposedTemplate-content").append( addTemplate );
            $("#proposedTemplate-content").append( images );
            */

        };

        var updateAllThemesView = function( data ){



        };


        var updateProjectColors = function(){

            var colors = Editor.adminProject.getColors();

            var fontColorsList = document.getElementById('settings-font-colors-list');
            fontColorsList.innerHTML = '';

            for( var i=0; i < colors.length ; i++){

                var color = document.createElement('div');
                color.className = 'font-color deactive';
                color.setAttribute('color', colors[i] );
                color.style.backgroundColor = colors[i];
                fontColorsList.appendChild( color );

                $( color ).on('click', function( e ){

                    e.stopPropagation();

                    if( $(this).hasClass('active') ){

                        $( this ).removeClass('active').addClass('deactive');

                    }else {

                        $( this ).removeClass('deactive').addClass('active');

                    }

                });

            }


            var activeColors = Editor.adminProject.getActiveColors();
            //console.log( 'aktywne klory' );
            //console.log( activeColors );

            for( var i=0; i < activeColors.length; i++ ){

                var colorObject = document.querySelector( '.font-color[color="'+activeColors[i]+'"]' );

                //console.log('co znalazlem');
                //console.log( colorObject );
                //console.log('=================================================');

                if( colorObject ){

                    colorObject.className = 'font-color active';

                }

            };



        };

        var updateProjectImages = function(){

            var projectImages = Editor.adminProject.getProjectImages();

            for( var key in projectImages ){

                if( $('li[data-uid='+projectImages[key].uid+']').length == 0 ){

                    //projectImages[key].toHTML();
                    document.getElementById('imagesList').appendChild( projectImages[key].html );

                }
                else {

                    $('li[data-uid='+projectImages[key].uid+']').replaceWith( projectImages[key].html );

                }

            }



        };


        var removeProposedTemplate = function( proposedTemplateID ){

            $('.proposedTemplateElement > img[proposed-template-id="'+proposedTemplateID+'"]').parent().remove();

            //console.log( '---' );
            //console.log( Editor.adminProject.format.view.page.getProposedTemplateID() );
            //console.log( proposedTemplateID );

            if( Editor.adminProject.format.view.page.getProposedTemplateID()._id == proposedTemplateID ){

                Editor.adminProject.format.view.page.get()['pageObject'].loadTemplate( null );

            }

        };


        var displayAllThemesWindow = function( themesData ){

            var themesContainer = document.createElement('div');
            themesContainer.className = 'allThemesList';
            themesContainer.setAttribute('waiting-for', 'update');

            themesContainer.addEventListener('updateTheme', function( e ){

                //console.log( e );
                //console.log('zadzialal event zajmujacy sie pupdate');

            });

            for( var i=0; i < themesData.length; i++ ){

                var theme = document.createElement('div');
                theme.className = 'themeElement';
                theme.setAttribute( 'data-theme-id', themesData[i]._id );
                theme.style.backgroundImage = 'url('+EDITOR_ENV.staticUrl+themesData[i].url+')';

                var themeButtons = document.createElement('div');
                themeButtons.className = 'themeButtons';

                var editTheme = document.createElement('div');
                editTheme.className = 'editMainTheme';
                editTheme.setAttribute( 'data-theme-id', themesData[i]._id );

                var removeTheme = document.createElement('div');
                removeTheme.className = 'removeMainTheme';
                removeTheme.setAttribute( 'data-theme-id', themesData[i]._id );

                var addThemeToProject = document.createElement('div');
                addThemeToProject.className = 'addThemeToProject';
                addThemeToProject.setAttribute( 'data-theme-id', themesData[i]._id );

                var themeName = document.createElement('div');
                themeName.className = 'themeName';
                themeName.innerHTML = themesData[i].name;

                var themePagesPreview = document.createElement('div');
                themePagesPreview.className = 'mainThemePagesPreview';
                themePagesPreview.setAttribute( 'data-theme-id', themesData[i]._id );
               // themePagesPreview.innerHTML = 'P';

                themeButtons.appendChild(addThemeToProject);
                themeButtons.appendChild(editTheme);

                themeButtons.appendChild(themePagesPreview);
                themeButtons.appendChild(removeTheme);

                theme.appendChild( themeButtons );
                //theme.appendChild( editTheme );
                theme.appendChild( themeName );
                //theme.appendChild( removeTheme );
                //theme.appendChild( themePagesPreview );

                editTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.mainTheme.addSingleEventListener('MainTheme.get', function( data ){
                        //console.log( data );
                        Editor.template.themeEditWindow( data );
                    });
                    Editor.webSocketControllers.mainTheme.get( $(this).attr('data-theme-id') );
                });


                addThemeToProject.addEventListener('click', function(){

                    var mainThemeID = this.getAttribute('data-theme-id');
                    //console.log( mainThemeID );
                    //console.log( Editor.adminProject.format.getDbId() );
                    //console.log( '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-' );
                    Editor.webSocketControllers.theme.add( mainThemeID, Editor.adminProject.format.getDbId() );


                });

                themePagesPreview.addEventListener( 'click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.mainTheme.getPages( this.getAttribute('data-theme-id') ,function( data ){
                        //console.log('wyświetlam okno z podglądem stron');
                        //console.log( data );
                        Editor.template.mainThemePagesPreview( data );
                    });

                });

                removeTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    //console.log( e );
                    //console.log( this );
                    //console.log( this.getAttribute('data-theme-id') );
                    //console.log('_+_+_+__+_');
                    Editor.webSocketControllers.mainTheme.remove( this.getAttribute('data-theme-id') );

                });

                themesContainer.appendChild( theme );

            }


            var themesWindow = Editor.template.displayWindow(

                'allThemesList',
                {

                    size  : 'big',
                    title : 'Motywy główne',
                    content : themesContainer

                }

            );

            $('body').append( themesWindow );


            $('#allThemesList').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#allThemesList').modal({

                keyboard: false,
                backdrop: 'static'

            });
            //Editor.template.overlayBlock( themesContainer, 'big');

        };


        var setVisibleAreaThemesToCopy = function( area ){

            $("#themeToCopyContentMain").animate({left: '-'+((area)*100)+'%'}, 200 );
            $("#toolContentPages").animate({left: (((area)*100)+100)+'%'}, 200 );
            $("#toolContentProposedTemplates").animate({left: (((area)*100)+200)+'%'}, 200 );

        };


        var updateThemesToCopy = function(){

            var themesList = document.getElementById('ThemesToCopy_list');

            if( !themesList )
                return;

            themesList.innerHTML = '';

            var themesToCopy = Editor.adminProject.format.getThemesToCopy();

            for( var i=0; i <themesToCopy.length; i++ ){

                var theme = themesToCopy[i];
                themesList.appendChild( Editor.template.element_themeToCopy( theme._id,  theme.name, theme.url ) );

            }

        };


        var updateFrameObjects = function(){

            Editor.webSocketControllers.frameObject.getAll( function( data ){

                Editor.adminProject.setBackgroundFrames( data );

                var container = document.getElementById('frames-list');

                for( var i=0; i < data.length; i++ ){

                    var elemInfo = data[i];

                    var newElem = document.createElement('li');
                    newElem.className = 'backgroundFrameObject';
                    newElem.setAttribute('frame-id', elemInfo._id);
                    if( elemInfo.ProjectImage && elemInfo.ProjectImage.thumbnail ){

                        newElem.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+elemInfo.ProjectImage.thumbnail + ')';

                    }

                    var remover = document.createElement('span');
                    remover.className = 'image-remover';
                    remover.setAttribute('data-id', elemInfo._id );

                    newElem.appendChild( remover );

                    container.appendChild( newElem );

                }

            });

        };


        var addFrameObject = function( elemInfo ){

            var container = document.getElementById('frames-list');

            var newElem = document.createElement('li');
            newElem.className = 'backgroundFrameObject';
            newElem.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+elemInfo.ProjectImage.thumbnail + ')';
            newElem.setAttribute('frame-id', elemInfo._id);

            var remover = document.createElement('span');
            remover.className = 'image-remover';
            remover.setAttribute('data-id', elemInfo._id );

            newElem.appendChild( remover );

            container.appendChild( newElem );

        };

        var removeFrameObject = function( objectID ){

            var elem = document.body.querySelector('.backgroundFrameObject[frame-id="'+objectID+'"]');

            if( elem ){

                elem.parentNode.removeChild( elem );

            }

        };

        return {

            removeFrameObject : removeFrameObject,
            addFrameObject : addFrameObject,
            updateFrameObjects : updateFrameObjects,
            updateComplexLayers : updateComplexLayers,
            removeProposedTemplate : removeProposedTemplate,
            updateAttributesBase : updateAttributesBase,
            updateThemes : updateThemes,
            updateViews  : updateViews,
            setUsedView  : setUsedView,
            updateTemplate : updateTemplate,
            updateAttributes : updateAttributes,
            updateAttributesContent : updateAttributesContent,
            updateLayers : updateLayers,
            updateProposedTemplates : updateProposedTemplates,
            updateProjectImages : updateProjectImages,
            updateSettings : updateSettings,
            selectTemplateToProject : selectTemplateToProject,
            setUsedThemePage : setUsedThemePage,
            setUsedProposedTemplate : setUsedProposedTemplate,
            displayAllThemesWindow : displayAllThemesWindow,
            updateComplexLayers : updateComplexLayers,
            updateComplexViews : updateComplexViews,
            updateProjectColors : updateProjectColors,
            updateProductsViews : updateProductsViews,
            updateThemeImages : updateThemeImages,
            updateThemePages : updateThemePages,
            updateThemeCategorySelects : updateThemeCategorySelects,
            updateThemesToCopy : updateThemesToCopy,
            setVisibleAreaThemesToCopy : setVisibleAreaThemesToCopy

        };

    };

    export {TemplateAdministration};
