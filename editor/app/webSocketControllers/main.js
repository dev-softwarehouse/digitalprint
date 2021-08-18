(function(){

/**
* Moduł ogarniający kontrolery ws
*
* @module webSocketControllers
*/


var webSocketControllers = (function(){

    
    var webSocket = null;
    var userID = null;

    var getWebSocketID = function(){
        
        return webSocket.id;
    
    };

    var getWebsocket = function(){
    
        return webSocket;
    
    };
    
    var isInited = false;

    var init = function( url ){

        $("#overlay-loader").animate({ opacity: 0.1}, 1000, function(){ $("#overlay-loader").remove(); });
        
        var onlogin = function( token ){

            userID = _userID;
            $("#loginForm").remove();

            Editor.stage.centerToPoint( 0, 0 );

            webSocket = io( config.getDomain() + ':' + config.getPort() + '?token=' + token, { 'forceNew': true } );

            webSocket.on('connect', function(){
                
                //console.log('Połączony');

                webSocket.on('authenticated', function( test ){

                    console.log('autoryzacja przeszła' + JSON.stringify( data ) );


                }).emit('authenticate', { token: token });

                if( !isInited ){

                    Editor.webSocketControllers.adminProject = new Editor.AdminProjectController( webSocket );
                    Editor.webSocketControllers.adminProject.init();
    
                    Editor.webSocketControllers.frameObject = new Editor.FrameObjectController( webSocket );
                    Editor.webSocketControllers.frameObject.init();

                    Editor.webSocketControllers.adminView = new Editor.AdminViewController( webSocket );
                    Editor.webSocketControllers.adminView.init();

                    Editor.webSocketControllers.mainTheme = new Editor.MainThemeController( webSocket );
                    Editor.webSocketControllers.mainTheme.init();
                    
                    Editor.webSocketControllers.theme = new Editor.ThemeController( webSocket );
                    Editor.webSocketControllers.theme.init();

                    Editor.webSocketControllers.view = new Editor.ViewController( webSocket );
                    Editor.webSocketControllers.view.init();

                    Editor.webSocketControllers.themeCategory = new Editor.ThemeCategoryController( webSocket );
                    Editor.webSocketControllers.themeCategory.init();
                    
                    Editor.webSocketControllers.themePage = new Editor.ThemePageController( webSocket );
                    Editor.webSocketControllers.themePage.init();

                    Editor.webSocketControllers.editorText = new Editor.EditorTextController( webSocket );
                    Editor.webSocketControllers.editorText.init();

                    Editor.webSocketControllers.editorBitmap = new Editor.EditorBitmapController( webSocket );
                    Editor.webSocketControllers.editorBitmap.init();
                    
                    Editor.webSocketControllers.editorObject = new Editor.EditorObjectController( webSocket );
                    Editor.webSocketControllers.editorObject.init();

                    Editor.webSocketControllers.page = new Editor.PageController( webSocket );
                    Editor.webSocketControllers.page.init();

                    Editor.webSocketControllers.format = new Editor.FormatController( webSocket );
                    Editor.webSocketControllers.format.init();

                    Editor.webSocketControllers.projectImage = new Editor.ProjectImageController( webSocket );
                    Editor.webSocketControllers.projectImage.init();

                    Editor.webSocketControllers.formatAttribute = new Editor.FormatAttributeController( webSocket );
                    Editor.webSocketControllers.formatAttribute.init();

                    Editor.webSocketControllers.proposedTemplate = new Editor.ProposedTemplateController( webSocket );
                    Editor.webSocketControllers.proposedTemplate.init();

                    Editor.webSocketControllers.connector = new Editor.ConnectController( webSocket );
                    Editor.webSocketControllers.connector.init();

                    Editor.webSocketControllers.productType = new Editor.ProductTypeController( webSocket );
                    Editor.webSocketControllers.productType.init();

                    Editor.webSocketControllers.complexAdminProject = new Editor.AdminComplexProjectController( webSocket );
                    Editor.webSocketControllers.complexAdminProject.init();

                    Editor.webSocketControllers.complexView = new Editor.ComplexViewController( webSocket );
                    Editor.webSocketControllers.complexView.init();

                    Editor.webSocketControllers.font = new Editor.FontController( webSocket );
                    Editor.webSocketControllers.font.init();

                    Editor.webSocketControllers.proposedTemplateCategory = new Editor.ProposedTemplateCategoryController( webSocket );
                    Editor.webSocketControllers.proposedTemplateCategory.init();

                    // user websockets

                    Editor.webSocketControllers.userProject = new Editor.UserProjectController( webSocket );
                    Editor.webSocketControllers.userProject.init();

                    Editor.webSocketControllers.user = new Editor.UserController( webSocket );
                    Editor.webSocketControllers.user.init();

                    Editor.webSocketControllers.complexProductType = new Editor.ComplexProductTypeController( webSocket );
                    Editor.webSocketControllers.complexProductType.init();

                    Editor.fonts.loadFonts();
                    Editor.templateAdministaration.updateFrameObjects();
                    

                    //Editor.template.displayUserPhotos( Editor.user.getID() );
                    //Editor.webSocketControllers.productType.getActiveAdminProject( 43 );
                    if( Editor.productContext == 'simple' ){

                        if( userType == 'admin' ){

                            webSocket.emit( 'ProductType.getAdminProjects', { typeID : productPrompt } );

                        }
                        else {

                            if( userMockProjectID == null ){

                                Editor.webSocketControllers.userProject.add( userMock_productID, userMockPages, {}, 135 ,138 );

                            }
                            else {



                            }

                        }

                    }
                    else {

                        Editor.webSocketControllers.complexProductType.get( productPrompt );

                    }
                    
                    isInited = true;

                }
                

            });
        
            webSocket.on('error', function( data ){

                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                document.cookie = "secretProof=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                //console.log("*** USUWAM DANE Z CIASTECZKA i PRZEŁĄCZAM NA EKRAN LOGOWANIA ***");
                Editor.template.initLoginWindow( onlogin );
                //console.log( data );
                console.warn('Nieprawidłowy login lub hasło!');

            });

            webSocket.on( 'ProductType.getComplexAdminProjects', function( data ){

                //console.log( data );

            });

            webSocket.on( 'ProductType.getAdminProjects', function( data ){

                //console.log( data );
               

                if( !Editor.isInited )
                    Editor.template.selectProjectView( data );

            });

            webSocket.on( 'ProductType.newAdminProject', function( data ){

                //console.log('-------------------------- WS --------------------------------');
                //console.log( data );
                //console.log('==============================================================');
                
                $('#selectProject').remove();  
                webSocket.emit( 'ProductType.getAdminProjects', { typeID : productPrompt } );

            });
        
            webSocket.on( 'ExistThemeCategory', function( data ){
                
                //console.log('categoria motywu juz istnieje');
                //console.log( data );
                Editor.template.warningView('Kategoria o takiej nazwie już istnieje!');
                
            });
        
    
            webSocket.on('mousePositionUpdate', function( data ){
            
                if( data.userId != webSocket.id ){
                
                    var cursor = Editor.stage.getCursorById( data.userId );
                    
                    if( cursor == null ){
                        
                        var cursor = Editor.stage.addCursor( data.userId );
                        cursor.x = data.x;
                        cursor.y = data.y;
                        
                    }else {
                        
                        cursor.x = data.x;
                        cursor.y = data.y;
                        
                    }
                    
                }
            
            });
                
            webSocket.on('AddedAdminProject', function( data ){
            
                //console.log('dodano projekt');
                //console.log( data );
            
            });

            webSocket.on('ProductType.setActiveAdminProject', function( data ){

                //console.log( data );

                if( $("#selectProject").length ){
                    $('#selectProject').remove();  
                    //console.log( { typeID : Editor.getProductId() } );
                    //console.log('co wysym : ) ' );

                    webSocket.emit( 'ProductType.getAdminProjects', { typeID : Editor.getProductId() } );   
                }else {
                    //console.log( 'Projekt główny został zmieniony na: ' + data.name );
                }
                
            });

        }

        var cookieToken = getCookie("token");       
        var secretProof = getCookie("secretProof");
        var pTime ;

        if ( cookieToken!="" && secretProof!=""  ) {            
           // alert("Ponowne logowanie - Rozpoznawanie użytkownika - ");

            $.ajax({

                url : config.getDomain() + ':' + config.getPort() + '/verify',

                type: 'POST',
                crossOrigin: true,
                data : { token : cookieToken, secretProof : '' },
              
                success : function( data ){

                    pTime = data.pTime;

                    if ( pTime != "" )
                    {   

                        //LMB[sFyasE]y[hakTPOM
                        //1433857015
                        //
                        var newHash = hash( secretProof, pTime );

                        $.ajax({

                            url : config.getDomain() + ':' + config.getPort() + '/verify',

                            type: 'POST',
                            crossOrigin: true,
                            data : { token : cookieToken, secretProof : newHash  },
                
                            success : function( data ){
                                
                                Editor.user.setID( data.userID );
                                userID = data.userID;
                                document.cookie="token="+data.token;
                                document.cookie="secretProof="+data.secretProof;  
                                
                                //console.log("*** WYSYŁAM SECRET PROOF : ");
                                //console.log(data);
                                //console.log(data.secretProof);

                                onlogin(data);

                                //console.log(" DATA.STATUS ");
                                //console.log(data);

                            },

                            error : function ( data ){

                                //console.log(" DATA.STATUS ");
                                //console.log(data);

                                if ( data.status == "401" || data.status == "200" ){

                                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                                    document.cookie = "secretProof=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

                                    //console.log("*** USUWAM DANE Z CIASTECZKA i PRZEŁĄCZAM NA EKRAN LOGOWANIA ***");
                                    Editor.template.initLoginWindow( onlogin );

                                }
                            }
                            

                        });

            
                    }

                },

                error : function ( data ){

                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    document.cookie = "secretProof=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    Editor.template.initLoginWindow( onlogin );
                }
        
            });


        }else {

            Editor.template.initLoginWindow( onlogin );

        }
            
        

    }


    
    var addNewThemePage = function( mainThemeId, pageName, pageOrder ){
    
        var data = {
            'mainTheme' : mainThemeId,
            'pageName'  : pageName,
            'pageOrder' : pageOrder
        };
        
        webSocket.emit( 'addNewThemePage', data );
        
    };
    
    var removeTheme = function( data ){
    
        webSocket.emit('RemoveTheme', data );
        
    };
    
    var addPageThemeToTheme = function( data ){
    
        webSocket.emit('Theme.addPage', data );
        
    };
    
    var removePageThemeToTheme = function( data ){
    
        webSocket.emit('Theme.removePage', data );
        
    };
    
    var addAdminProject = function( data ){
        
        webSocket.emit( 'ProductType.newAdminProject', data);

    };





    var setActiveAdminProject = function( data ){

        webSocket.emit('ProductType.setActiveAdminProject', data );    
    
    };
    
    var getAllProposedTemplates = function(data){
    
        webSocket.emit( 'GetAllProposedTemplates', data );
    
    };
    
    var loadProject = function( projectId ){
    
        webSocket.emit('AdminProject.get', { ID : projectId });
    
    };
    
    var removeAdminProjectImage = function( data ){
    
        webSocket.emit('AdminProject.removeProjectImage', data );
        
    };
    
    
    var setProposedTemplateToPage = function( data ){
    
        webSocket.emit('SetProposedTemplateToPage', data );
    
    };
        
    
    var emitMousePosition = function( x, y ){
    
        //webSocket.emit('mousePosition', {'userId' : webSocket.id , x : x, y : y });
        
    };
    
    
    var emitUpdateObject = function( object ){
    
        webSocket.emit('updateObject', {
            
            'userId' : webSocket.id,
             objectDbID : object.dbID,
            'content' : object.content
        
        });
        
    };
    
    
    
    var saveObject = function(){



    };

    
    var addProposedTemplate = function( data ){
    
        webSocket.emit('AddProposedTemplate', data );
        
    };
    

    var addNewProposedTemplate = function( trueWidth, trueHeight, name, objectsInfo, countText, countImages, category ){
        
        webSocket.emit('AddProposedTemplate', { content : objectsInfo, countTexts : countText, countImages : countImages, category : category, height : trueHeight, width : trueWidth } );

    };

      

    return {
        init       : init,
        saveObject : saveObject,
        emitMousePosition : emitMousePosition,
        getWebsocket : getWebsocket,
        emitUpdateObject : emitUpdateObject,       
        loadProject : loadProject,
        getAllProposedTemplates : getAllProposedTemplates,
        addNewProposedTemplate : addNewProposedTemplate,
        addAdminProject : addAdminProject,
        removeTheme : removeTheme,
        setActiveAdminProject : setActiveAdminProject,
        getWebSocketID : getWebSocketID,

    }

})();

    Editor.webSocketControllers = webSocketControllers;

})();

