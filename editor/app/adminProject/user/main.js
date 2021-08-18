(function(){

    /**
     * Moduł zarządzający projektami administratora
     *
     * @module adminProject
     */
    var adminProject = function(){
        
        
        /**
        * Informacje o projekcie
        *
        * @property project
        * @type {Object}
        */
        var project = null;
        
        
        /**
        * Aktualny widok
        *
        * @property currentView
        * @type {Int}
        * @default null
        */
        var currentView = null;
        
        
        /**
        * Widoki projectu ( jezeli projekt jest stworzony i został wczytany, w przeciwnym wypadku zawiera pustą tablicę )
        *
        * @property views
        * @type {Array}
        * @default []
        */
        var views  = [];
        
        
        /**
        * Motywy projectu ( jezeli projekt jest stworzony i został wczytany, w przeciwnym wypadku zawiera pustą tablicę )
        *
        * @property themes
        * @type {Array}
        * @default []
        */
        var themes = [];
        
        
        /**
        * Zwraca id użytego projektu
        *
        * @method getProjectId
        * @return {Int} id projektu
        */
        var getProjectId = function(){
        
            return project_id;
            
        };
        
        
        /**
        * Zwraca obiekt widoków
        *
        * @method getViews
        * @return {Array} tablica widoków
        */
        var getViews = function(){
        
            return views;
        
        };
        
        
        /**
        * Zwraca obiekt widoków
        *
        * @method getThemes
        * @return {Array} tablica motywów
        */
        var getThemes = function(){
        
            return themes;
        
        };
        
        
        /**
        * Zwraca wszystkie informacje o projekcie
        *
        * @method load
        * @param {Int} product_id Id wybranego produktu
        */
        var getAllInfo = function(){
        
            return {
            
                'views' : views,
                'themes' : themes,
                'project_id' : project.adminProjectID
            
            };
            
        };
        
        var addAdminProject = function( product ){
            
            $.ajax({
            
                url : Editor.currentUrl + 'admin_project',
                type : 'POST',
                data : { "name" : "testowanie" },
                crossDomain: true,
                success : function( data ){
                    
                    //console.log("====================================================");
                    //console.log(data);
                    //console.log('projekt');
                    //console.log( project );
                    
                    $.ajax({
                    
                        url : Editor.currentUrl + 'product_type/' + project.id,
                        type : 'PUT',
                        data : { 'admin_project' : data.id },
                        crossDomain: true,
                        success : function(){
                            
                            alert("projekt został dodany");
                            alert("dodaje widok");
                            
                            $.ajax({
                        
                                url : Editor.currentUrl + 'admin_project/' + data.id + '/views',
                                type : 'POST',
                                crossDomain: true,
                                success : function(){ 
                                
                                    alert(' vidok dodany pomyślnie ');
                                    
                                }
                            
                            });
                            
                        }

                    });
                    
                    
                },
                error : function( err){

                }
            
            });
        
        };
        
        
        
        /**
        * Pobiera cały projekt
        *
        * @method load
        * @param {Int} product_id Id wybranego produktu
        */
        var load = function( product_id ){
            
            return new Promise(function( ok, not){

                // pobranie informacji o projekcie
                project = getProductProject( product_id );


                project.then(function(data) {

                    //console.log("resolved");
                    //console.log(data);
                    project = data[0];

                    if( !project.admin_project || project.admin_project == 'null' ){

                        //console.log("=============================");
                        //console.log( project );
                        addAdminProject();

                    }
                    else {

                        views = loadViews();



                        views.then( function( data ){

                            if( data.length == 0){

                                alert('Brak widoków, utwórz teraz piwerwszy widok');

                                var newView = addView( {name : 'pierwszy widok', order : 0} );
                                newView.then( function(data){

                                    // ponowne pobranie informacji o widokach
                                    loadViews();

                                    // update templatki z widokami
                                    Editor.templateAdministaration.updateViews( data );

                                    // uzyj widoku
                                    var viewLoader = useView( data[0].id );

                                    alert('zostal utworzony nowy widok');
                                    //console.log('informacje o nowym widoku');
                                    //console.log(data);

                                    
                                    viewLoader.then(function(){
                                    
                                        ok();
                                        
                                    }, function(){
                                    
                                        not();
                                        
                                    });

                                }, function(data){


                                    alert('nie udało się dodać widoku');
                                    //console.log('błąd resource widoku');
                                    //console.log( data );

                                });

                            }
                            else {

                                alert('widoki są ok');

                                Editor.templateAdministaration.updateViews( data );
                                //console.log("=-=-=-=-=-=-=Widoki trallala-=-=-=-=-=-==-=");
                                //console.log( data );
                                views = data;

                                // uzyj widoku
                                var viewLoader = useView( data[0].id );
                                viewLoader.then( function(){
                                
                                    ok();
                                    
                                }, function(){
                                
                                    not();
                                    
                                });
                                
                            }

                            
                            
                        }, function( data ){

                            //console.log('ERROR',data);

                        });

                        var loadingThemes = loadThemes( );
                        
                        loadingThemes.then( 
                        
                            function( data ){
                            
                                themes = data.themes;
                                
                                //console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-==--");    
                                //console.log( data );
                                Editor.templateAdministaration.updateThemes( themes );
                                
                            },
                            
                            function( data ){
                            
                            }
                        
                        );

                    }


                }, function(data) {

                    //console.log("Error", data);

                    not( data );
                    
                });
                
            });

        };

        
        /**
        * Zwraca id projectu dla produktu
        *
        * @method getProductProjectId
        * @param {Int} product_id Id wybranego produktu
        */

        
        

        /**
        * Zwraca id projectu dla produktu
        *
        * @method getProductProjectId
        * @param {Int} product_id Id wybranego produktu
        */
        var getProductProject = function( product_id ){
        // mock
            
            return new Promise(
                
                function( resolve, reject ) {
            
                    $.ajax({    

                        url : Editor.currentUrl + 'product_type/getByType/?typeID=' + product_id,
                        type : 'GET',
                        crossDomain: true,
                        success : function( data ){

                            // alert('kurwa');
                            //console.log('wszystkie inne informacje o product type');
                            //console.log( data );
                            
                            resolve(data);

                        },
                        error : function( err){
                            
                            reject(err);
                            //console.log( err);
                            
                        }

                    });
                    
                }
            );
            
        };
        
        
        var copyTheme = function( themeId ){
        
            new Promise( function( ok, not ){
            
                var loadTheme = Editor.serwerControler.getMainTheme( themeId );
                
                loadTheme.then(
                    
                    function( data ){
                    
                        
                        //console.log( data );
                        alert('mam them do skopiowania');
                        
                        
                        $.ajax({
                        
                            url : Editor.currentUrl + 'admin_project/' + project.admin_project + '/themes',
                            type : "POST",
                            crossDomain : true,
                            data : { name : data.name, category : '', minImageUrl : '' },
                            success : function( data ){
                                
                                //console.log( data );
                                ok( data);
                                alert('Motyw skopiowany pomyślnie');
                                
                            },
                            error : function( data ){
                            
                                //console.log( data );
                                not( data );
                                alert('Błąd podczas kopiowania motywu');
                                
                            }
                        
                        });
                        
                        
                    },
                    
                    function( data ){
                        
                    }
                    
                );
            
            });
        
        };
        
        
        /**
        * Pobiera cały projekt
        *
        * @method loadViews
        * @param {Int} project_id Id projektu
        */
        var loadViews = function(){
            
            return new Promise( function( resolve, reject ){
                
                $.ajax({

                    url : Editor.currentUrl + 'admin_project/' + project.admin_project + "/views",
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        //console.log('views resource');
                        //console.log( data );
                        views = data;
                        resolve( data );
                        

                    },
                    error : function(){

                        alert('Views Error');
                        reject( data );
                        
                    }

                });
                
            });

        };
        
        
        /**
        * Dodaje nowy widok do projektu
        *
        * @method addView
        */
        var addView = function( data ){
            
            return new Promise( function( resolve, reject ){
                
                $.ajax({
                
                    url : Editor.currentUrl + 'admin_project/'+project.admin_project+"/views",
                    type : 'POST',
                    data : data,
                    crossDomain : true,
                    success : function( data ){
                    
                        resolve(data);
                        
                    },
                    error : function( data ){
                    
                        reject( data );
                        
                    }
                
                });
            
            });
            
        };    
        

        /**
        * Usuwa widok o podanym id
        *
        * @method removeView
        * @param {string} viewId Id widoku
        */
        var removeView = function( viewId){
        
            return new Promise( 
                
                function(resolve, reject){
                
                    $.ajax({
                    
                        url : Editor.currentUrl + 'admin_project/'+project.adminProjectID+"/views/" + viewId,
                        type : 'DELETE',
                        crossDomain : true,
                        success : function( data ){
                        
                            //console.log("USUWANIE WIDOKU");
                            //console.log( data );
                            resolve( data );
                            
                        },
                        error: function( data ){
                        
                            reject( data );
                            
                        }
                        
                    });
                    
                }
                
            );
        
        };
        
        
        /**
        * Pobiera cały projekt
        *
        * @method loadThemes
        * @param {Int} project_id Id projektu
        */
        var loadThemes = function( project_id ){

            return new Promise( function( ok, not ){
            
                $.ajax({
                
                    url : Editor.currentUrl + 'admin_project/' + project.admin_project,
                    type: 'GET',
                    crossDomain : true,
                    success : function( data ){
                    
                        //console.log( data );
                        alert('motywy pobrane pomyślnie');
                        ok( data );
                        
                    },
                    error : function( data ){
                    
                        //console.log( data );
                        alert('motywy błąd podzas pobierania');
                        not( data );
                    
                    }
                    
                });
            
            });
            
        };
        
        
    
        
        
        /**
        * Wczytuje do edytora widok o podanym id
        *
        * @method useView
        * @param {string} viewId id widoku do załadowania
        */  
        var useView = function( viewId ){

            return new Promise(function(ok, not){
            
                currentView = viewId;

                var init = Editor.adminProject.view.init( viewId );

                init.then( 

                    function( data ){
                        
                        //console.log('ok - idzie do updateViews');
                        Editor.stage.updateView();
                        //Editor.adminProject.view.loadObjects();
                        //Editor.templateAdministaration.setUsedView( viewId );
                        
                        ok();
                        
                    }, 

                    function(data){

                        not();

                    }

                );
            });

            
        };

        
        /**
        * Powoduje załadowanie obiektu
        *
        * @method getCurrentView
        * @return {Object} Aktualnie używany widok
        */
        var loadObject = function( objectId ){
        
            return new Promise( function(resolve, reject){
            
            
                $.ajax({
                
                    url : Editor.currentUrl + 'project_object/' + objectId,
                    type : 'GET',
                    crossDomain : true,

                    success : function( data ){
                     
                        //console.log( 'informacje o obiekcie, który ma zostać wczytany');
                        //console.log( data );
                        
                    },
                    error : function( data ){
                    
                    }
                    
                });
                
            
            });
            
        };
        
        
        /**
        * Zwraca informacje o aktualnym widoku
        *
        * @method getCurrentView
        * @return {Object} Aktualnie używany widok
        */  
        var getCurrentView = function(){
            
            return currentView;
            
        };
        
        var getCurrentViewId = function(){
        
            return currentView.id;
        
        };
        
        
        var getProject = function(){
        
            return project;
            
        };
        
        return {
            
            load : load,
            addView : addView,
            getThemes : getThemes,
            getViews : getViews,
            getProductProject : getProductProject,
            getAllInfo : getAllInfo,
            loadViews : loadViews,
            removeView : removeView,
            useView : useView,
            getCurrentView : getCurrentView,
            getCurrentViewId : getCurrentViewId,
            getProject : getProject,
            copyTheme : copyTheme
            
        };
        
    };
    
    Editor.adminProject = adminProject();

})();