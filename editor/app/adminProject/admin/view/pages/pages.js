(function(){

    var page = (function(){
        
        var currentPage = null;
        var pageObject = null;
        var themePage = null;

        var adminProject = Editor.adminProject;
        var view = Editor.adminProject.view;
        
        var useThemePage = function( themePageID ){

            Editor.webSocketControllers.productType.adminProject.view.page.useThemePage( themePageID, function(){} );

        };
    
        var init = function( pageData ){

            this.currentPage = pageData;

        };

        var get = function(){

            return {

                currentPageInfo : currentPage,
                pageObject : pageObject

            };

        };


        var changePage = function( pageID ){

            Editor.webSocketControllers.productType.adminProject.view.page.get( pageID, function( data ){

                init( data );

            });

        };

        return {
            
            changePage : changePage,
            init : init,
            useThemePage : useThemePage

        };
    
    })();
    
    Editor.adminProject.format.view.page = page;

})();