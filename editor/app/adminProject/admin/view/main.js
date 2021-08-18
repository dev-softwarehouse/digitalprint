var Page = require('./pages/page').Page;

    /**
    * Klasa odpowiadająca z widoki
    *
    * @class View
    */

	createjs.Event.prototype.set = function(props) {
		for (var n in props) { this[n] = props[n]; }
		return this;
	};

    var View = function( editor ){

        var Editor = editor;
        var _id = null;
        var name = null;
        var EditorBitmaps = [];
        var Pages = [];
        var order = null;
        var layer = null;
        var page = new Page( editor, this );

        var currentView = null;

        var init = function( viewID ){

            var selected = Editor.getSelectedAttributes();

            var options = [];

            for( var key in selected ){

                if( key != -1 )
                    options.push( selected[ key ] );

            }

            Editor.webSocketControllers.editorBitmap.getAllBase( viewID );

            Editor.webSocketControllers.view.get( viewID, options, function( data ){

                _id = data._id;
                name = data.name;
                $('.editingInfo .viewInfo .content').html( name );
                EditorBitmaps = data.EditorBitmaps;
                Pages = data.Pages;
                order = data.order;

                Editor.stage.updateView( data );

            });

        };


        var getLayer = function(){

            return layer;

        };


        var updateObjects = function( removedInfo, objectsInfo ){

            var children = layer.children;

            if( removedInfo ){



            }

            for( var i=0; i < children.length; i++ ){

                children[i].order = objectsInfo[ children[i].dbID ].order;

            };

            sortObjectsByOrder();

            Editor.templateAdministaration.updateLayers( Editor.adminProject.format.view.getLayer().children );

        };

        var updateOrders = function(){

            var children = layer.children;

            for( var i=0; i < children.length; i++ ){

                children[i].order = i;

            };

        };


        var sortObjectsByOrder = function(){

            layer.sortChildren( function( obj1, obj2, options ){

                if( obj1.order > obj2.order ) { return 1; }
                if( obj1.order < obj2.order ) { return -1; }
                return 0;

            });

        };


        var setLayer = function( _layer ){

            layer = _layer;

        };

        var getLayer = function(){

            return layer;

        };


        var getLayerInfo = function(){

            var objectsInfo = {};

            for( var i=0; i < layer.children.length; i++ ){

                layer.children[i].order = i;

                objectsInfo[layer.children[i].dbID] = {

                    type : layer.children[i].type,
                    order : layer.children[i].order

                };

            }

            return objectsInfo;

        };

       var addEditorBitmap = function( bitmap, order ){

            //alert( "jaki jest order: " + order );
            layer.addChildAt( bitmap, order );

        };

        var removeEditorText = function( text ){

            layer.removeChild( text );

        };

        var addEditorText = function( text, order ){

            Editor.stage.addObject( text );

            if( order ){

                layer.addChildAt( text, order );

            }else {

                layer.addChild( text );

            }

        };

        var addEditorObject = function( object ){

            layer.addChild( object );

        };

        var getId = function(){

            return _id;

        };

        var addPage = function( pageObject ){

            var newPage = new Editor.EditableArea(  pageObject.name, pageObject.width, pageObject.height, pageObject._id, pageObject.slope  );
            Editor.stage.addPage( newPage );

        };


        var loadPages = function(){

            return new Promise( function( ok, not ){

                $.ajax({

                    url : Editor.currentUrl + 'view/' + currentView.id + '/pages',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        ok( data );

                    },
                    error : function( data ){

                        not( data );

                    }

                });

            });

        };


        var getObjectIndex = function( objectId ){

            for(var i=0; i<currentView.project_objects.length; i++ ){

                if( currentView.project_objects[i].id == objectId )
                    return i

            }

            return null;

        };


        var reload = function(){

            return new Promise( function( resolve, reject ){

                $.ajax({

                    url : Editor.currentUrl + "view/" + currentView.id,
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        currentView = data;

                        resolve( data );

                    },
                    error : function(){

                        alert('błąd podczas pobierania informacji o widoku');
                        reject( data );

                    }

                });

            });

        };


        /**
        * Usuwa (lokalnie) obiekt z widoku. Lokalnie oznacza że zmiany nie są zastosowane w bazie danych
        *
        * @method removeObject
        * @param {String} objectId id obiektu do usunięcia ( id z bazy danych - > object.DBid)
        */
        var _removeObject = function( objectId ){

            var objectIndex = getObjectIndex( objectId );

            if( objectIndex !== null ){

                currentView.project_objects.remove( objectIndex );
                //delete currentView.project_objects[objectIndex];
                //currentView.project_objects.length--;

            }


        };


        /**
        * Dodaje (globalnie) obiekt do widoku
        *
        * @method removeObject
        * @param {String} objectId id obiektu do usunięcia ( id z bazy danych - > object.DBid)
        */
        var addObject = function( objectToAdd ){

            /*
            return new Promise( function(ok, not){

                $.ajax({

                    url : Editor.currentUrl + 'view/' + currentView.id + '/project_objects',
                    type : 'POST',
                    crossDomain : true,
                    data : objectToAdd.getObjectTimber(),
                    success : function(data){

                        objectToAdd.dbID = data.project_objects[ data.project_objects.length -1 ].id;

                        console.log('DODAWANIE OBRAZU DO WIDOKU');

                        var addedObjectEvent = new createjs.Event('addedObject', false, true);
                        addedObjectEvent.objectId = objectToAdd.dbID;
                        addedObjectEvent.objectInfo =  data.project_objects[ data.project_objects.length -1 ];
                        addedObjectEvent.objectParent = data.id;

                        console.log('DATA ZARAZ PO DODANIU OBIEKTU');
                        console.log( data.project_objects[ data.project_objects.length -1 ] );

                        currentView = data;

                        if( objectToAdd.type == 'EditorBitmap' ){

                            var addImage = new createjs.Event('addedNotUploadedImage', false, true);
                            addImage.objectInfo = objectToAdd;


                            Editor.getStage().dispatchEvent( addImage );


                            var uploaded = new createjs.Event('imageUploaded', false, true);
                            uploaded.objectId = objectToAdd.dbID;
                            uploaded.objectInfo = data.project_objects[ data.project_objects.length -1 ];

                            objectToAdd.addEventListener('uploadEnd', function(){

                                //alert('jest');
                                Editor.getStage().dispatchEvent( uploaded );

                                ok( data );

                            });

                        }
                        else {

                            Editor.getStage().dispatchEvent( addedObjectEvent );

                            ok( data );

                        }

                    },
                    error : function( data ){

                        alert('wystąpił błąd podczas dodawania obiektu');

                        not( data );

                    }

                });

            });
            */
        };


        /**
        * Usuwa (globalnie) obiekt z widoku
        *
        * @method removeObject
        * @param {String} objectId id obiektu do usunięcia ( id z bazy danych - > object.DBid)
        */
        var removeObject = function( objectId, dispatch ){

            return new Promise( function( ok, not ){

                $.ajax({

                    url : Editor.currentUrl + 'view/' + currentView.id + /project_objects/ + objectId,
                    type: 'DELETE',
                    crossDomain : true,
                    success : function( data ){

                        if( dispatch === 0 ){

                        }
                        else {

                            var removeEvent = new createjs.Event("removedObject", true, true);
                            removeEvent.objectId = objectId;

                            Editor.getStage().dispatchEvent(removeEvent);

                        }

                        ok( data );

                    },
                    error : function( data ){

                        not( data );

                    }

                });

            });

        };


        /**
        * Dodaje obiekt do widoku
        *
        * @method addObject
        * @param {Object} object obiekt do dodania
        */

        /*
         var addObject = function( object ){

             alert('staram sie dodac obiekt');

             console.log("--------------------------------------------------------------");
             console.log( Editor.adminProject.getProject().admin_project );

             return new Promise(

                 function( resolve, reject ){

                     $.ajax({

                        url : Editor.currentUrl + 'view/' + currentView.id + '/project_objects',
                        type : 'POST',
                        data : object.getObjectTimber(),
                        crossDomain : true,
                        success : function( data ){

                            reload();
                            object.dbID = data.project_objects[ data.project_objects.length-1 ].id;
                            console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
                            console.log( object.dbID );
                            object.uploadImg( Editor.adminProject.getProject().admin_project );

                        },
                        error : function( data ){



                        }

                     });

                 }

             );

         };
                */

        /**
        * Zwraca informacje o aktualnym widoku
        *
        * @method getCurrentView
        * @return {Object} Aktualnie używany widok
        */
        var get = function(){

            return currentView;

        };


        /**
        * Zwraca wszystkie obiekty z aktualnego widoku
        *
        * @method getObjects
        * @return {Object} Wszystkie obiekty w widoku
        */
        var getObjects = function(){

            return currentView.project_objects;

        };


        return {

            addEditorObject : addEditorObject,
            addEditorText : addEditorText,
            addObject : addObject,
            get : get,
            getId : getId,
            getLayer : getLayer,
            getLayerInfo : getLayerInfo,
            removeEditorText : removeEditorText,
            updateObjects : updateObjects,
            init : init,
            getObjects : getObjects,
            removeObject : removeObject,
            _removeObject : _removeObject,
            addPage : addPage,
            loadPages : loadPages,
            addEditorBitmap : addEditorBitmap,
            setLayer : setLayer,
            sortObjectsByOrder : sortObjectsByOrder,
            updateOrders : updateOrders,
            page: page

        };

    }


    export { View };
