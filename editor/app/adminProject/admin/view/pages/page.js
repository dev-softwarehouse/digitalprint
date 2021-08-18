var ThemePage = require('./themePage').ThemePage;

    var Page = function( editor, view ){
        var theme = new ThemePage( editor )
        var Editor = editor;
        var currentPage = null;
        var pageObject = null;
        var themePage = theme;
        var proposedTemplate = null;
        var adminProject = Editor.adminProject;
        var view = view;
        var pageLayer = null;
        var id = null;
        var width, height;
        var _themePage = theme;


        var useThemePage = function( themePageID ){

            Editor.webSocketControllers.productType.adminProject.view.page.useThemePage( themePageID, function(){} );

        };

        var init = function( pageData ){

            currentPage = pageData;
            pageObject = Editor.stage.getObjectByDbId( pageData._id );
            id = pageData._id;
            width = pageData.width;
            height = pageData.height;

            var area = Editor.adminProject.format.view.page.get().pageObject;
            //console.log( area );
            Editor.adminProject.format.view.page.get();
            Editor.template.getReactEditorSettings().setEditableArea( area );

        };

        var get = function(){

            return {

                currentPageInfo : currentPage,
                pageObject : pageObject

            };

        };

        var setPageLayer = function( layer ){

            pageLayer = layer;

        };


        var getPageLayer = function(){

            return pageLayer;

        };

        var updateObjectsOrder = function(){

            var foregroundLayer = pageObject.foregroundLayer;
            var fChildren = foregroundLayer.children;

            for( var i=0; i < fChildren.length; i++){

                fChildren[i].order = i;

            }

            var backgroundLayer = pageObject.backgroundLayer;
            var bChildren = backgroundLayer.children;

            for( var i=0; i < bChildren.length; i++){

                bChildren[i].order = i;

            }

        };


        var loadTemplate = function( data ){

            Editor.templateAdministration.setUsedProposedTemplate( data._id );
            pageObject.loadTemplate( data );

        };


        var loadThemePage = function( data ){

            _themePage.init( data );
            themePage = data._id;
            pageObject.loadThemePage( data );
            Editor.templateAdministration.setUsedThemePage( data._id );

            if( data.proposedTemplates.length ){

                proposedTemplate = data.proposedTemplates[0];
                Editor.webSocketControllers.proposedTemplate.get( data.proposedTemplates[0]._id, function( data ){

                    pageObject.loadTemplate( data );
                    Editor.templateAdministration.setUsedProposedTemplate( data._id );

                });

            }
            else {

                pageObject.loadTemplate( null );

            }

        };


        var changePage = function( pageID ){

            Editor.webSocketControllers.page.get( pageID, function( data ){

                init( data );

            });

        };


        var getProposedTemplateID = function(){

            return proposedTemplate;

        };

        var getID = function(){

            return id;

        };

        var getSize = function(){

            return {

                width : width,
                height : height

            };

        };

        return {

            changePage : changePage,
            get : get,
            getID : getID,
            getPageLayer : getPageLayer,
            getProposedTemplateID : getProposedTemplateID,
            getSize : getSize,
            setPageLayer : setPageLayer,
            init : init,
            loadTemplate : loadTemplate,
            loadThemePage : loadThemePage,
            useThemePage : useThemePage,
            updateObjectsOrder : updateObjectsOrder,
            themePage : _themePage,
            ThemePage : _themePage,

        };

    }

    export { Page };
