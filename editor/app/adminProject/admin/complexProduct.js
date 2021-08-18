(function(){

    /**
     * Moduł zarządzający produktem
     *
     * @module complexProduct
     */
    var complexProduct = function(){
        

        var productID = null;
        var productName = null;
        var products = [];


        var load = function( productID ){


        };
        // 



        // wszystko ponizej jest stare
        var proposedTemplates = null;
        
        /**
        * Informacje o projekcie
        *
        * @property project
        * @type {Object}
        */
        var project = null;
        
        var formats = null;
        var colors = null;
        var activeColors = [];
        var DbId = null;

        var name = '';
        
        var projectImages = {};
        
        
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
        
            return DbId;
            
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
                'project_id' : project._id
            
            };
            
        };
        
        var addAdminProject = function( product ){
            
            $.ajax({
            
                url : Editor.currentUrl + 'admin_project',
                type : 'POST',
                data : { "name" : "testowanie" },
                crossDomain: true,
                success : function( data ){

                    
                    $.ajax({
                    
                        url : Editor.currentUrl + 'product_type/' + project.id,
                        type : 'PUT',
                        data : { 'admin_project' : data.id },
                        crossDomain: true,
                        success : function(){
                            
                            //alert("projekt został dodany");
                            //alert("dodaje widok");
                            
                            $.ajax({
                        
                                url : Editor.currentUrl + 'admin_project/' + data.id + '/views',
                                type : 'POST',
                                crossDomain: true,
                                success : function(){ 
                                
                                    //alert(' vidok dodany pomyślnie ');
                                    
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
            
            /*
            return new Promise(function( ok, not){

                // pobranie informacji o projekcie
                project = getProductProject( product_id );


                project.then(function(data) {

                    console.log("resolved");
                    console.log(data);
                    project = data[0];

                    if( !project.admin_project || project.admin_project == 'null' ){

                        //alert('cos to kurwa zrobil - nima projektu!');
                        console.log("=============================");
                        console.log( project );
                        addAdminProject();

                    }
                    else {

                        views = loadViews();

                        views.then( function( data ){

                            if( data.length == 0){

                                //alert('Brak widoków, utwórz teraz piwerwszy widok');

                                var newView = addView( {name : 'pierwszy widok', order : 0} );
                                newView.then( function(data){

                                    // ponowne pobranie informacji o widokach
                                    loadViews();

                                    // update templatki z widokami
                                    Editor.templateAdministaration.updateViews( data );

                                    // uzyj widoku
                                    var viewLoader = useView( data[0].id );

                                    //alert('zostal utworzony nowy widok');
                                    console.log('informacje o nowym widoku');
                                    console.log(data);

                                    
                                    viewLoader.then(function(){
                                    
                                        ok();
                                        
                                    }, function(){
                                    
                                        not();
                                        
                                    });

                                }, function(data){


                                    //alert('nie udało się dodać widoku');
                                    console.log('błąd resource widoku');
                                    console.log( data );

                                });

                            }
                            else {

                                //alert('widoki są ok');

                                Editor.templateAdministaration.updateViews( data );
                                console.log("=-=-=-=-=-=-=Widoki trallala-=-=-=-=-=-==-=");
                                console.log( data );
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

                            console.log('ERROR KURWA');

                        });

                        var loadingThemes = loadThemes();
                        
                        loadingThemes.then( 
                        
                            function( data ){

                                themes = data.themes;
                                console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-==--");
                                console.log( data );
                                console.log( themes );
                                //alert('JEST KURWA');
                                Editor.templateAdministaration.updateThemes( themes );
                                Editor.adminProject.useTheme( themes[0].id );
                                
                            },
                            
                            function( data ){

                                //alert('wdarł sę błąd');

                            }
                        
                        );

                    }


                }, function(data) {

                    console.log("Error", data);

                    not( data );
                    
                });
                
            });
            */
        };

        /**
        * Pobiera cały projekt
        *
        * @method load
        * @param {Int} product_id Id wybranego produktu
        */
        var loadWS = function( projectData, adminProjectID ){

            DbId = adminProjectID;
            Editor.templateAdministaration.updateThemes( themes );
            Editor.templateAdministaration.updateViews( views );
            Editor.templateAdministaration.updateAttributes();
            formats = [];
            colors = projectData.colors || [];

            activeColors = projectData.activeColors || [];

            var _formats = Editor.getAttributesOptions();
            //console.log( _formats );

            var formatSelection = document.createElement('div');

            for( var key in _formats ){

                var format = document.createElement('div');
                format.className = 'formatSelector';
                format.setAttribute( 'format-id', key );
                format.setAttribute( 'admin-project-id', adminProjectID  );
                format.setAttribute( 'format-width', _formats[ key ].width );
                format.setAttribute( 'format-height', _formats[ key ].height );
                format.setAttribute( 'format-slope', _formats[ key ].slope  );
                format.style.width = _formats[key].width/5 + "px";
                format.style.height = _formats[key].height/5 + "px";
                //format.style.transform="scale(" + (200/formats[key].width) + ")";
                formatSelection.appendChild( format );

                format.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.format.load( this.getAttribute( 'admin-project-id' ), this.getAttribute( 'format-id' ), this.getAttribute( 'format-width' ), this.getAttribute( 'format-height' ), this.getAttribute( 'format-slope' ),function( data ){

                        Editor.adminProject.format.init( data );

                    });

                });

            }

            for( var i=0; i < projectData.ProjectImages.length; i++ ){
                
                var data = projectData.ProjectImages[i];
                var projectImg = new Editor.ProjectImage( data.uid, data._id );
                projectImg.minUrl = data.minUrl;
                projectImg.thumbnail = data.thumbnail;
                projectImg.imageUrl = data.imageUrl;
                projectImg.init( null, data.minUrl, data.thumbnail, data.trueWidth, data.trueHeight, data.width, data.height );
                Editor.adminProject.addProjectImage( projectImg );
                
            }

            Editor.templateAdministaration.updateProjectImages();
            Editor.templateAdministaration.updateProjectColors();
            Editor.template.formatSelectWindow( formatSelection );

            Editor.templateAdministaration.updateProjectImages();
            
        };


        var getColors = function(){

            return colors;

        };
        

        var setColors = function( colorsArray ){

            colors = colorsArray;

        };
        

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
                            
                            resolve(data);

                        },
                        error : function( err){
                            reject(err);
                            
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
                    
                        

                        //alert('mam them do skopiowania');
                        
                        
                        $.ajax({
                        
                            url : Editor.currentUrl + 'admin_project/' + project.admin_project + '/themes',
                            type : "POST",
                            crossDomain : true,
                            data : { name : data.name, category : '', minImageUrl : '' },
                            success : function( data ){
                                
                                ok( data);
                                //alert('Motyw skopiowany pomyślnie');
                                
                            },
                            error : function( data ){

                                not( data );
                                //alert('Błąd podczas kopiowania motywu');
                                
                            }
                        
                        });
                        
                        
                    },
                    
                    function( data ){
                        
                    }
                    
                );
            
            });
        
        };
        
        
        var loadAllProposedTemplates = function(){
        
            return new Promise( function( ok, not ){
            
                $.ajax({
                
                    url : Editor.currentUrl + 'proposed_template',
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

                        views = data;
                        resolve( data );
                        

                    },
                    error : function(){

                        //alert('Views Error');
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
            
            views.push( data );
            Editor.templateAdministaration.updateViews( views );
            
            //console.log('addView');
            
            /*
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
            */
            
        };    
        

        /**
        * Usuwa widok o podanym id
        *
        * @method removeView
        * @param {string} viewId Id widoku
        */
        var removeView = function( viewId){
            
            var index = null;
            
            for( var i=0; i < views.length; i++){
                
                if( views[i]._id == viewId ){
                    
                    index = i;
                    break;
                    
                }
                
            }
            
            var first_views = views.slice(0, index);
            var second_views = views.slice(index+1, views.length);
            
            views = first_views.concat(second_views);
            
            Editor.templateAdministaration.updateViews( views );
            
            /*
            return new Promise( 
                
                function(resolve, reject){
                
                    $.ajax({
                    
                        url : Editor.currentUrl + 'admin_project/'+project.adminProjectID+"/views/" + viewId,
                        type : 'DELETE',
                        crossDomain : true,
                        success : function( data ){
                        
                            console.log("USUWANIE WIDOKU");
                            console.log( data );
                            resolve( data );
                            
                        },
                        error: function( data ){
                        
                            reject( data );
                            
                        }
                        
                    });
                    
                }
                
            );
            */
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
                    
                        //alert('motywy pobrane pomyślnie');
                        ok( data );
                        
                    },
                    error : function( data ){
                    
                        //alert('motywy błąd podzas pobierania');
                        not( data );
                    
                    }
                    
                });
            
            });
            
        };
        
        
        var useTheme = function( themeId ){
            
            
            
            if( themeId == null || themeId == '' ){
                
                
                
            } else {
                
                Editor.adminProject.theme.init( themeId );
                
                
            }
            
        };
        
        
        /**
        * Wczytuje do edytora widok o podanym id
        *
        * @method useView
        * @param {string} viewId id widoku do załadowania
        */  
        var changeView = function( viewID ){

            Editor.webSocketControllers.productType.adminProject.changeView( viewID );
            
            //Editor.adminProject.view.init( view );
            
            /*
            return new Promise(function(ok, not){
            
                currentView = viewId;

                var init = Editor.adminProject.view.init( viewId );

                init.then( 

                    function( data ){
                        
                        console.log('ok - idzie do updateViews');
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
            */
            
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
        
        var getProposedTemplates = function(){
        
            return proposedTemplates;
            
        };
        
        var addProjectImage = function( image, emit ){
        
            projectImages[ image.uid ] = image;
            //image.toHTML();
            
        };
        
        
        var uploadProjectImage = function( image ){
        
            Editor.webSocketControllers.adminProjectImage.uploadingImage( image );
            
        };
        
        
        var removeProjectImage = function( uid ){
        
            projectImages[ uid ].selfDestroy();
            delete projectImages[ uid ];
        
        };
        
        
        var getProjectImages = function(){
        
            return projectImages;
            
        };
        
        var getProjectImage = function( uid ){
        
            return projectImages[ uid ];
            
        };
        
        var getActiveColors = function(){

            return activeColors;

        };

        var setActiveColors = function( colorsArray ){

            activeColors = colorsArray;

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
            changeView : changeView,
            getCurrentView : getCurrentView,
            getCurrentViewId : getCurrentViewId,
            getProject : getProject,
            copyTheme : copyTheme,
            useTheme : useTheme,
            getProposedTemplates : getProposedTemplates,
            loadAllProposedTemplates : loadAllProposedTemplates,
            addProjectImage : addProjectImage,
            getProjectImages : getProjectImages,
            getProjectImage : getProjectImage,
            removeProjectImage : removeProjectImage,
            uploadProjectImage : uploadProjectImage,
            loadWS : loadWS,
            getProjectId : getProjectId,
            getColors : getColors,
            getActiveColors : getActiveColors,
            setActiveColors : setActiveColors,
            setColors : setColors
        };
        
    };
    
    Editor.complexProduct = complexProduct();

})();