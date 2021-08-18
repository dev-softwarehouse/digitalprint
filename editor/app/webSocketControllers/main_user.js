var AdminProjectController = require('./adminProjectController').AdminProjectController;
var FrameObjectController = require('./FrameObjectController').FrameObjectController;
var MainThemeController = require('./mainThemeController').MainThemeController;
var ThemeController = require('./themeController').ThemeController;
var ViewController = require('./viewController').ViewController;
var ThemeCategoryController = require('./ThemeCategoryController').ThemeCategoryController;
var ThemePageController = require('./ThemePageController').ThemePageController;
var EditorTextController = require('./editorTextController').EditorTextController;
var EditorBitmapController = require('./editorBitmapController').EditorBitmapController;
var EditorObjectController = require('./editorObjectController').EditorObjectController;
var PageController = require('./PageController').PageController;
var FormatController = require('./FormatController').FormatController;
var ProposedTemplateController = require('./ProposedTemplateController').ProposedTemplateController;
var ProjectImageController = require('./projectImage_user').ProjectImageController;
var FormatAttributeController = require('./FormatAttributeController').FormatAttributeController;
var ConnectController  = require('./ConnectController').ConnectController;
var ProductTypeController = require('./productController').ProductTypeController;
var AdminComplexProjectController = require('./adminComplexProjectController').AdminComplexProjectController;
var ComplexViewController  = require('./complexViewController').ComplexViewController;
var FontController = require('./fontController').FontController;
var ProposedTemplateCategoryController = require('./ProposedTemplateCategoryController').ProposedTemplateCategoryController;
var UserProjectController = require('./userProjectController').UserProjectController;
var UserController = require('./userController').UserController;
var ComplexProductTypeController = require('./ComplexProductController').ComplexProductTypeController;
var UserViewController = require('./userViewController').UserViewController;
var UserPageController = require('./UserPageController').UserPageController;
var ProposedImageController = require('./ProposedImageController').ProposedImageController;
var ProposedTextController = require('./ProposedTextController').ProposedTextController;
/**
* Moduł ogarniający kontrolery ws
*
* @module webSocketControllers
*/

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + "domain=demo.digitalprint9.pro;path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }


class WebSocketControllers {

    constructor( editor ){

        this.editor = editor;
        this.webSocket = null;
        this.user_token = null;
        this.isInited = false;

    }

    init( url ){

        var self = this;

        $("#overlay-loader").animate({ opacity: 0.1}, 1000, function(){ $("#overlay-loader").remove(); });

        var onlogin = function( token ){

            self.user_token = token;

            self.editor.stage.centerToPoint( 0, 0 );

            self.webSocket = io( self.editor.config.getDomain()+':' + self.editor.config.getPort() + '?token=' + token, { 'forceNew': true, transports: ['websocket'] } );

            self.webSocket.on('disconnect', function(){

                console.error('Nastąpiło rozłączenie z serwerem socket!');

            });

            self.webSocket.on('connect', function(){

                self.webSocket.on('authenticate', function( data ){

                    if( !self.isInited ){

                        self.adminProject = new AdminProjectController( self.webSocket, self.editor );
                        self.adminProject.init();

                        self.frameObject = new FrameObjectController( self.webSocket, self.editor );
                        self.frameObject.init();

                        self.mainTheme = new MainThemeController( self.webSocket, self.editor );
                        self.mainTheme.init();

                        self.theme = new ThemeController( self.webSocket, self.editor );
                        self.theme.init();

                        self.view = new ViewController( self.webSocket, self.editor );
                        self.view.init();

                        self.themeCategory = new ThemeCategoryController( self.webSocket, self.editor );
                        self.themeCategory.init();

                        self.themePage = new ThemePageController( self.webSocket, self.editor );
                        self.themePage.init();

                        self.editorText = new EditorTextController( self.webSocket, self.editor );
                        self.editorText.init();

                        self.editorBitmap = new EditorBitmapController( self.webSocket, self.editor );
                        self.editorBitmap.init();

                        self.editorObject = new EditorObjectController( self.webSocket, self.editor );
                        self.editorObject.init();

                        self.page = new PageController( self.webSocket, self.editor );
                        self.page.init();

                        self.format = new FormatController( self.webSocket, self.editor );
                        self.format.init();

                        self.projectImage = new ProjectImageController( self.webSocket, self.editor );
                        self.projectImage.init();

                        self.formatAttribute = new FormatAttributeController( self.webSocket, self.editor );
                        self.formatAttribute.init();

                        self.proposedTemplate = new ProposedTemplateController( self.webSocket, self.editor );
                        self.proposedTemplate.init();

                        self.connector = new ConnectController( self.webSocket, self.editor );
                        self.connector.init();

                        self.productType = new ProductTypeController( self.webSocket, self.editor );
                        self.productType.init();

                        self.complexAdminProject = new AdminComplexProjectController( self.webSocket, self.editor );
                        self.complexAdminProject.init();

                        self.complexView = new ComplexViewController( self.webSocket, self.editor );
                        self.complexView.init();

                        self.font = new FontController( self.webSocket, self.editor );
                        self.font.init();

                        self.proposedTemplateCategory = new ProposedTemplateCategoryController( self.webSocket, self.editor );
                        self.proposedTemplateCategory.init();

                        // user websockets
                        self.userProject = new UserProjectController( self.webSocket, self.editor );
                        self.userProject.init();

                        self.user = new UserController( self.webSocket, self.user_token, self.editor );
                        self.user.init();

                        self.complexProductType = new ComplexProductTypeController( self.webSocket );
                        self.complexProductType.init();

                        self.userView = new UserViewController( self.webSocket, self.editor );
                        self.userView.init();

                        self.userPage = new UserPageController( self.webSocket, null, self.editor );
                        self.userPage.init();

                        self.proposedImage = new ProposedImageController( self.webSocket, self.editor );
                        self.proposedImage.init();

                        self.proposedText = new ProposedTextController( self.webSocket, self.editor );
                        self.proposedText.init();

                        //Editor.fonts.loadFonts();

                        self.editor.template.activeMainMenuView('image-container-tool_button');

                        //Editor.webSocketControllers.productType.getActiveAdminProject( 43 );
                        if( self.editor.productContext == 'simple' ){

                            // id testowego projetu 55e868336882da2304e613f3

                            var urlParams = self.editor.getURLParameters();

                            if( urlParams['loadProject'] ){

                                //var _projectID = prompt('Podaj id projektu ( jezeli jest juz utworzony ) : ');
                                self.user.loadProject( urlParams['loadProject'], function( data ){

                                    self.editor.userProject.init( data );
                                    self.editor.generateAttributesOptions_Select_user();

                                });

                            }else{

                                var _formatID = urlParams['formatID'];
                                delete urlParams['formatID'];

                                var _pagesCount = urlParams['pages'];
                                delete urlParams['pages'];

                                

                                //Editor.generateAttributesOptions_Select_user
                                self.user.addProject(

                                    self.editor.getProductId(),
                                    _formatID,
                                    _pagesCount,
                                    urlParams,
                                    function( data ){
                                        
                                        self.editor.userProject.init( data );
                                        self.editor.generateAttributesOptions_Select_user();

                                    }

                                );


                            }

                        }
                        else {
                            const newProjectCreate=()=>{
                                var urlParams = self.editor.getURLParameters();

                                self.user.addComplexProject(

                                    self.editor.complexProduct[0],
                                    self.editor.complexProduct[1],
                                    self.editor.complexProduct[2],
                                    self.editor.complexProduct[3],
                                    self.editor.getProductId(),
                                    function( data ){
                                        localStorage.loadProject=data._id
                                        self.editor.userProject.init( data );

                                    }

                                );
                            }
                            var urlParams = self.editor.getURLParameters();

                            if (performance.navigation.type == 1) {//reloaded

                            } else {
                                localStorage.removeItem('loadProject')
                            }
                            if( urlParams['loadProject'] || localStorage.loadProject){//
                                const projectId=urlParams['loadProject'] || localStorage.loadProject
                                
                                self.user.loadProject( projectId, function( data ){
                                    if(data)
                                    self.editor.userProject.init( data );
                                    else
                                        newProjectCreate()
                                    //self.editor.generateAttributesOptions_Select_user();

                                });
                            } else {
                                newProjectCreate()

                            }
                            

                            

                            //self.editor.webSocketControllers.complexProductType.get( productPrompt );

                        }

                        self.isInited = true;

                    }

                });

                self.webSocket.emit('authenticate', { token: token });

            });

            self.webSocket.on('error', function( data ){

                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                document.cookie = "secretProof=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

                self.editor.template.initLoginWindow( onlogin );

                console.warn('Nieprawidłowy login lub hasło! [user]');

            });

            self.webSocket.on( 'ProductType.getComplexAdminProjects', function( data ){

            });

            self.webSocket.on( 'ProductType.getAdminProjects', function( data ){

                //console.log( data );

                if( !self.editor.isInited )
                    self.editor.template.selectProjectView( data );

            });

            self.webSocket.on( 'ProductType.newAdminProject', function( data ){

                $('#selectProject').remove();
                webSocket.emit( 'ProductType.getAdminProjects', { typeID : productPrompt } );

            });

            self.webSocket.on( 'ExistThemeCategory', function( data ){

                self.editor.template.warningView('Kategoria o takiej nazwie już istnieje!');

            });


            self.webSocket.on('mousePositionUpdate', function( data ){

                if( data.userId != webSocket.id ){

                    var cursor = self.editor.stage.getCursorById( data.userId );

                    if( cursor == null ){

                        var cursor = self.editor.stage.addCursor( data.userId );
                        cursor.x = data.x;
                        cursor.y = data.y;

                    }else {

                        cursor.x = data.x;
                        cursor.y = data.y;

                    }

                }

            });

            self.webSocket.on('AddedAdminProject', function( data ){


            });

            self.webSocket.on('ProductType.setActiveAdminProject', function( data ){

                if( $("#selectProject").length ){
                    $('#selectProject').remove();
                    webSocket.emit( 'ProductType.getAdminProjects', { typeID : 43 } );
                }else {

                }

            });

        }

        var cookieToken = getCookie("token");
        var secretProof = getCookie("secretProof");
        var pTime ;


        if ( this.editor.AuthController.checkSession() ) {

            //console.log('jest ciasteczko');

            this.editor.AuthController.getUserData( function( token ){

                //console.log('przeszlo tędy');
                onlogin( token );

            });

        }else {

            //console.log('źle przeszlo');
            this.editor.AuthController.getNonUserToken( onlogin );

        }

    }



    addNewThemePage ( mainThemeId, pageName, pageOrder ){

        var data = {
            'mainTheme' : mainThemeId,
            'pageName'  : pageName,
            'pageOrder' : pageOrder
        };

        webSocket.emit( 'addNewThemePage', data );

    }

    removeTheme ( data ){

        webSocket.emit('RemoveTheme', data );

    }

    addPageThemeToTheme ( data ){

        webSocket.emit('Theme.addPage', data );

    }

    removePageThemeToTheme ( data ){

        webSocket.emit('Theme.removePage', data );

    }

    addAdminProject ( data ){

        webSocket.emit( 'ProductType.newAdminProject', data);

    }


    setActiveAdminProject ( data ){

        webSocket.emit('ProductType.setActiveAdminProject', data );

    }

    getAllProposedTemplates (data){

        webSocket.emit( 'GetAllProposedTemplates', data );

    }

    loadProject ( projectId ){

        webSocket.emit('AdminProject.get', { ID : projectId });

    }

    removeAdminProjectImage ( data ){

        webSocket.emit('AdminProject.removeProjectImage', data );

    }


    setProposedTemplateToPage ( data ){

        webSocket.emit('SetProposedTemplateToPage', data );

    }


    emitMousePosition ( x, y ){

        //webSocket.emit('mousePosition', {'userId' : webSocket.id , x : x, y : y });

    }


    emitUpdateObject ( object ){

        webSocket.emit('updateObject', {

            'userId' : webSocket.id,
             objectDbID : object.dbID,
            'content' : object.content

        });

    }



    saveObject (){



    }


    addProposedTemplate( data ){

        webSocket.emit('AddProposedTemplate', data );

    }


    addNewProposedTemplate ( trueWidth, trueHeight, name, objectsInfo, countText, countImages, category ){

        webSocket.emit('AddProposedTemplate', { content : objectsInfo, countTexts : countText, countImages : countImages, category : category, height : trueHeight, width : trueWidth } );

    }

}


/*

var webSocketControllers = (function(){


    var webSocket = null;
    var user_token = null;

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

            user_token = token;
            $("#loginForm").remove();

            Editor.stage.centerToPoint( 0, 0 );


            webSocket = io( config.getDomain() + ':' + config.getPort() + '?token=' + token, { 'forceNew': true } );

            webSocket.on('disconnect', function(){

                alert('Nastapilo rozlaczenie z serwerem! Zaladuj strone ponownie');

            });

            webSocket.on('connect', function(){

                alert('połączono');

                webSocket.on('authenticate', function( data ){


                    alert('autoryzacja przeszła' + JSON.stringify( data ) );
                    if( !isInited ){

                        Editor.webSocketControllers.adminProject = new Editor.AdminProjectController( webSocket );
                        Editor.webSocketControllers.adminProject.init();

                        Editor.webSocketControllers.frameObject = new Editor.FrameObjectController( webSocket );
                        Editor.webSocketControllers.frameObject.init();

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

                        Editor.webSocketControllers.user = new Editor.UserController( webSocket, user_token );
                        Editor.webSocketControllers.user.init();

                        Editor.webSocketControllers.complexProductType = new Editor.ComplexProductTypeController( webSocket );
                        Editor.webSocketControllers.complexProductType.init();

                        Editor.webSocketControllers.userView = new Editor.UserViewController( webSocket );
                        Editor.webSocketControllers.userView.init();

                        Editor.webSocketControllers.userPage = new Editor.UserPageController( webSocket );
                        Editor.webSocketControllers.userPage.init();

                        Editor.webSocketControllers.proposedImage = new Editor.ProposedImageController( webSocket );
                        Editor.webSocketControllers.proposedImage.init();

                        Editor.webSocketControllers.proposedText = new Editor.ProposedTextController( webSocket );
                        Editor.webSocketControllers.proposedText.init();

                        //Editor.fonts.loadFonts();

                        Editor.template.activeMainMenuView('image-container-tool_button');

                        //Editor.webSocketControllers.productType.getActiveAdminProject( 43 );
                        if( Editor.productContext == 'simple' ){

                            // id testowego projetu 55e868336882da2304e613f3

                            var urlParams = Editor.getURLParameters();

                            if( urlParams['loadProject'] ){

                                var _projectID = prompt('Podaj id projektu ( jezeli jest juz utworzony ) : ');

                                Editor.webSocketControllers.user.loadProject( _projectID, function( data ){

                                    Editor.userProject.init( data );
                                    Editor.generateAttributesOptions_Select_user();

                                });

                            }else{

                                alert('idzie dobra ścieżką');

                            	var _formatID = urlParams['formatID'];
                                delete urlParams['formatID'];

                                var _pagesCount = urlParams['pages'];
                                delete urlParams['pages'];

                                Editor.generateAttributesOptions_Select_user

                                Editor.webSocketControllers.user.addProject(

                                    Editor.getProductId(),
                                    _formatID,
                                    _pagesCount,
                                    urlParams,
                                    function( data ){

                                        alert('ID utworzonego projektu: ' + data._id );
                                        Editor.userProject.init( data );
                                        Editor.generateAttributesOptions_Select_user();

                                    }

                                );


                            }

                        }
                        else {

                            Editor.webSocketControllers.complexProductType.get( productPrompt );

                        }

                        isInited = true;

                    }

                });

                webSocket.emit('authenticate', { token: token });

            });

            webSocket.on('error', function( data ){

                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                document.cookie = "secretProof=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

                Editor.template.initLoginWindow( onlogin );

                alert('Nieprawidłowy login lub hasło!');

            });

            webSocket.on( 'ProductType.getComplexAdminProjects', function( data ){


                alert( 'wlasnie dostalem info od Rafalże' );

            });

            webSocket.on( 'ProductType.getAdminProjects', function( data ){

                console.log( data );

                if( !Editor.isInited )
                    Editor.template.selectProjectView( data );

            });

            webSocket.on( 'ProductType.newAdminProject', function( data ){

                $('#selectProject').remove();
                webSocket.emit( 'ProductType.getAdminProjects', { typeID : productPrompt } );

            });

            webSocket.on( 'ExistThemeCategory', function( data ){

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


            });

            webSocket.on('ProductType.setActiveAdminProject', function( data ){

                if( $("#selectProject").length ){
                    $('#selectProject').remove();
                    webSocket.emit( 'ProductType.getAdminProjects', { typeID : 43 } );
                }else {

                }

            });

        }

        var cookieToken = getCookie("token");
        var secretProof = getCookie("secretProof");
        var pTime ;


        if ( Editor.AuthController.checkSession() ) {

            Editor.AuthController.getUserData( function( token ){

                onlogin( token );

            });

        }else {

            Editor.AuthController.getNonUserToken( onlogin );

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
*/

export { WebSocketControllers };
