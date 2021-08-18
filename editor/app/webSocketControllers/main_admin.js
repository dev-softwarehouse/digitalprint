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
var ProjectImageController = require('./projectImage').ProjectImageController;
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
var AdminViewController = require('./adminViewController').AdminViewController;
var AdminAssetController = require('./adminAssets.js').AdminAssets;

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

/**
* Moduł ogarniający kontrolery ws
*
* @module webSocketControllers
*/
class WebSocketControllers {

    constructor( editor ){

        this.editor = editor;
        this.webSocket = null;
        this.user_token = null;
        this.isInited = false;

    }

    getWebSocketID(){

        return this.webSocket.id;

    }

    getWebsocket (){

        return this.webSocket;

    }


    init( url ){

        var self = this;

        $("#overlay-loader").animate({ opacity: 0.1}, 1000, function(){ $("#overlay-loader").remove(); });

        var onlogin = function( token ){

            self.user_token = token;

            self.editor.stage.centerToPoint( 0, 0 );

            self.webSocket = io( self.editor.config.getDomain() + ':' + self.editor.config.getPort() + '?token=' + token, { 'forceNew': true } );

            self.webSocket.on('connect', function(){

                self.webSocket.on('authenticate', function( data ){
                    if( !self.isInited ){

                        self.adminProject = new AdminProjectController( self.webSocket, self.editor );
                        self.adminProject.init();

                        self.adminAssets = new AdminAssetController( self.webSocket, self.editor );
                        self.adminAssets.init();

                        self.frameObject = new FrameObjectController( self.webSocket );
                        self.frameObject.init();

                        self.adminView = new AdminViewController( self.webSocket, self.editor );
                        self.adminView.init();

                        self.mainTheme = new MainThemeController( self.webSocket, self.editor );
                        self.mainTheme.init();

                        self.theme = new ThemeController( self.webSocket, self.editor );
                        self.theme.init();

                        self.view = new ViewController( self.webSocket, self.editor );
                        self.view.init();

                        self.themeCategory = new ThemeCategoryController( self.webSocket );
                        self.themeCategory.init();

                        self.themePage = new ThemePageController( self.webSocket, self.editor );
                        self.themePage.init();

                        self.editorText = new EditorTextController( self.webSocket );
                        self.editorText.init();

                        self.editorBitmap = new EditorBitmapController( self.webSocket, self.editor );
                        self.editorBitmap.init();

                        self.editorObject = new EditorObjectController( self.webSocket );
                        self.editorObject.init();

                        self.page = new PageController( self.webSocket, self.editor );
                        self.page.init();

                        self.format = new FormatController( self.webSocket, self.editor );
                        self.format.init();

                        self.projectImage = new ProjectImageController( self.webSocket, self.editor );
                        self.projectImage.init();

                        self.formatAttribute = new FormatAttributeController( self.webSocket );
                        self.formatAttribute.init();

                        self.proposedTemplate = new ProposedTemplateController( self.webSocket, self.editor );
                        self.proposedTemplate.init();

                        self.connector = new ConnectController( self.webSocket );
                        self.connector.init();

                        self.productType = new ProductTypeController( self.webSocket, self.editor );
                        self.productType.init();

                        self.complexAdminProject = new AdminComplexProjectController( self.webSocket, self.editor );
                        self.complexAdminProject.init();

                        self.complexView = new ComplexViewController( self.webSocket );
                        self.complexView.init();

                        self.font = new FontController( self.webSocket, self.editor );
                        self.font.init();

                        self.proposedTemplateCategory = new ProposedTemplateCategoryController( self.webSocket );
                        self.proposedTemplateCategory.init();

                        // user websockets

                        self.userProject = new UserProjectController( self.webSocket );
                        self.userProject.init();

                        self.user = new UserController( self.webSocket, self.user_token, self.editor );
                        self.user.init();

                        self.complexProductType = new ComplexProductTypeController( self.webSocket );
                        self.complexProductType.init();

                        self.editor.fonts.loadFonts();
                        self.editor.templateAdministration.updateFrameObjects();

                        //Editor.template.displayUserPhotos( Editor.user.getID() );
                        //Editor.webSocketControllers.productType.getActiveAdminProject( 43 );
                    if( self.editor.productContext == 'simple' ){

                        self.webSocket.emit( 'ProductType.getAdminProjects', { typeID : self.editor.getProductId() } );

                    } else {

                        self.editor.webSocketControllers.complexProductType.get( productPrompt );

                    }
                    
                        /*}*/
                        /*
                        else {

                            self.editor.webSocketControllers.complexProductType.get( productPrompt );

                        }
                        */

                        self.isInited = true;

                    }

                }).emit('authenticate', { token: token });



            });

            self.webSocket.on('error', function( data ){

            });

            self.webSocket.on( 'ProductType.getComplexAdminProjects', function( data ){


            });

            self.webSocket.on( 'ProductType.getAdminProjects', function( data ){

                if( !self.editor.isInited )
                    self.editor.template.selectProjectView( data );

            });

            self.webSocket.on( 'ProductType.newAdminProject', function( data ){

                $('#selectProject').remove();
                self.webSocket.emit( 'ProductType.getAdminProjects', { typeID : self.editor.getProductId() } );

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

                    self.webSocket.emit( 'ProductType.getAdminProjects', { typeID : self.editor.getProductId() } );
                }else {
                    console.log( 'Projekt główny został zmieniony na: ' + data.name );
                }

            });

        }

        if (this.editor.AuthController.checkSession()) {

            this.editor.AuthController.getUserData(function (token) {

                onlogin(token);

            });

        } else {
            console.error('!checkSession() - nie ma access-token')
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

        this.webSocket.emit( 'ProductType.newAdminProject', data);

    }

    setActiveAdminProject ( data ){

        this.webSocket.emit('ProductType.setActiveAdminProject', data );

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



    saveObject(){

    }


    addProposedTemplate ( data ){

        webSocket.emit('AddProposedTemplate', data );

    }


    addNewProposedTemplate ( trueWidth, trueHeight, name, objectsInfo, countText, countImages, category ){

        webSocket.emit('AddProposedTemplate', { content : objectsInfo, countTexts : countText, countImages : countImages, category : category, height : trueHeight, width : trueWidth } );

    }

}

export {WebSocketControllers};
