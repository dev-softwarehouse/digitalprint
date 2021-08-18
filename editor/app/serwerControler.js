(function(){


    var api = (function(){
    
        
        
        
        var addMainTheme = function( name, category, minImageUrl ){
        
            return new Promise( function( ok, not ){
            
                $.ajax({
                    
                    url : Editor.currentUrl + 'main_theme',
                    type : 'POST',
                    crossDomain : true,
                    data : { name : name, category : category, minImageUrl : minImageUrl },
                    success : function( data ){
                        
                        //console.log( 'dodano motyw' );
                        //console.log( data );
                        ok( data );
                        
                    },
                    error : function( data ){
                        
                        //console.log( data );
                        console.warn('nie dodano motywu');
                        not( data );
                        
                    }
                
                });
                
            });
            
        };
        
        
        var getMainTheme = function( themeId ){
        
            return new Promise( function( ok, not ){
            
                $.ajax({
                    
                    url : Editor.currentUrl + 'main_theme/'+themeId,
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        console.warn( 'pobrano motyw do skopiowania');
                        ok( data );
                        
                    },
                    error : function( data ){
                        
                        //console.log( data );
                        console.warn('nie pobrano motywu');
                        not( data );
                        
                    }
                
                });
                
            }); 
            
        };
        
        var getMainThemes = function(){
        
            return new Promise( function( ok, not ){
            
                $.ajax({
                    
                    url : Editor.currentUrl + 'main_theme',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){
                        
                        //console.log( 'pobrano wszystkie motywy' );
                        //console.log( data );
                        ok( data );
                        
                    },
                    error : function( data ){
                        
                        //console.log( data );
                        console.error('nie pobrano motywów');
                        not( data );
                        
                    }
                
                });
                
            });
        
        };
        
        
        /**
        * Zwraca wszystkie szablony
        *
        * @method getProposedTemplates
        * 
        */
        var getProposedTemplates = function(){
        
            return new Promise(function( ok, not ){
            
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
        * Dodaje nowy szablon do całej puli
        *
        * @method saveProposedTemplate
        * 
        */
        var saveProposedTemplate = function( trueWidth, trueHeight, name, objectsInfo, countText, countImages, category ){
        
            return new Promise(function( ok, not ){
        
                //console.log('co wysylam do bazy');
                //console.log ({ name : name, content : objectsInfo, countTexts : countText, countImages : countImages, category : category });
                //console.log( Editor.proposedTemplates );
                
                
                $.ajax({
                
                    url : Editor.currentUrl + 'proposed_template',
                    type : 'POST',
                    data : { trueHeight : trueHeight, trueWidth : trueWidth, name : name, content : { objects : objectsInfo}, countTexts : countText, countImages : countImages, category : category },
                    crossDomain : true,
                    success : function( data ){
                        
                        //console.log('OK');
                        ok( data );
                        
                    },
                    error : function( data ){
                        
                        //console.log('NOT OK');
                        //console.log( data );
                        not( data );
                        
                    }
                
                });
                
            });
            
        };
        
        
        /**
        * Dodaje nowy szablon do całej puli
        *
        * @method saveProposedTemplate
        * 
        */
        var saveProposedTemplateForThemePage = function( themePage, trueWidth, trueHeight, name, objectsInfo, countText, countImages, category ){
        
            return new Promise(function( ok, not ){
        
                //console.log('co wysylam do bazy');
                //console.log ({ trueHeight : trueHeight, trueWidth : trueWidth, name : name, content : { objects : objectsInfo}, countTexts : countText, countImages : countImages, category : category });
                //console.log( Editor.proposedTemplates );
                
                $.ajax({
                
                    url : Editor.currentUrl + 'page_theme/' + themePage + '/proposed_templates',
                    type : 'POST',
                    data : { trueHeight : trueHeight, trueWidth : trueWidth, name : name, content : { objects : objectsInfo}, countTexts : countText, countImages : countImages, category : category },
                    crossDomain : true,
                    success : function( data ){
                        
                        //console.log('OK');
                        ok( data );
                        
                    },
                    error : function( data ){
                        
                        //console.log('NOT OK');
                        //console.log( data );
                        not( data );
                        
                    }
                
                });
                
            });
            
        };
        
        
        var getProposedTemplatesByCategory = function(){
        
            
            
        };
        
    
        return {
            
            getProposedTemplates : getProposedTemplates,
            saveProposedTemplate : saveProposedTemplate,
            addMainTheme             : addMainTheme,
            getMainThemes            : getMainThemes,
            getMainTheme             : getMainTheme,
            saveProposedTemplateForThemePage : saveProposedTemplateForThemePage
            
        };
    
    })();
    
    Editor.serwerControler = api;

})();