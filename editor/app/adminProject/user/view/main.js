(function(){

    /**
    * Klasa odpowiadająca z widoki
    *
    * @class View
    */

    var view = (function(){

        var init = function( viewId ){

            return new Promise( function( resolve, reject ){

                $.ajax({

                    url : Editor.currentUrl + "view/" + viewId,
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
        * Aktualny widok
        *
        * @property currentView
        * @type {Int}
        * @default null
        */
        var currentView = null;


        /**
        * Dodaje obiekt do widoku
        *
        * @method addObject
        * @param {Object} object obiekt do dodania
        */
         var addObject = function( object ){


             //console.log("--------------------------------------------------------------");
             //console.log( Editor.adminProject.getProject().admin_project );

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
                            //console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
                            //console.log( object.dbID );
                            object.uploadImg( Editor.adminProject.getProject().admin_project );

                        },
                        error : function( data ){



                        }

                     });

                 }

             );

         };


        /**
        * Zwraca informacje o aktualnym widoku
        *
        * @method getCurrentView
        * @return {Object} Aktualnie używany widok
        */
        var get = function(){

            return currentView;

        };


        return {

            addObject : addObject,
            get : get,
            init : init


        };

    })();

    Editor.adminProject.view = view;

})();
