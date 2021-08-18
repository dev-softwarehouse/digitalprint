(function(){

    
    var ProposedTemplate_module = (function(){
    
        var getProposedTemplates = function(){
        
            var templates = Editor.serwerControler.getProposedTemplates();
            
            templates.then( 
            
                function( data ){
                    
                    //console.log("============= nowe rzeczy ============");
                    //console.log( data );
                    
                    for( var i=0; i < data.length; i++ ){
                     
                        if( data[i].content.objectsInfo ){
                            
                        }
                        else {
                         
                            alert('Wystąpił bład: błędnie zapisany szablon!');
                            
                        }
                        
                    }
                    
                },
                
                function( data ){
                
                    alert( 'błąd podczas pobierania : Brak połączenia z serwerem' );
                    
                }
                
            );
        
        };
        
        
        var saveProposedTemplate = function( trueWidth, trueHeight, name, objectsInfo, countText, countImages, category  ){
            
            Editor.webSocketControllers.addNewProposedTemplate( trueWidth, trueHeight, name, objectsInfo, countText, countImages, 'testowa' );

        };
    
        
        
        var saveProposedTemplateForThemePage = function( themePage, trueWidth, trueHeight, name, objectsInfo, countText, countImages, category  ){
            

            //console.log( 'jakie informacje do mnie przysły' );

            //console.log({

                themePage : themePage,
                trueHeight : trueHeight,
                trueWidth : trueWidth,
                name : name,
                objectsInfo : objectsInfo,
                countText : countText,
                countImages : countImages,
                category : category

            });

            //console.log('==================================');

            /*
            var saveingTemplate = Editor.serwerControler.saveProposedTemplateForThemePage( themePage, trueWidth, trueHeight, name, objectsInfo, countText, countImages, 'testowa' );
            
            saveingTemplate.then( 
            
                function( data ){
                
                    console.log( data );
                    alert('pomyślnie dodano obiekt');
                    
                },
                
                function( data ){
                
                    console.log( data );
                    alert('obiekt źle dodany');
                    
                }
                
            );
            */
        };
        
        
        var updateProposedTemplateForThemePage = function( themePage, data  ){
            
            var saveingTemplate = Editor.serwerControler.saveProposedTemplateForThemePage( themePage, data );
            
            saveingTemplate.then( 
            
                function( data ){
                
                    //console.log( data );
                    alert('pomyślnie dodano obiekt');
                    
                },
                
                function( data ){
                
                    //console.log( data );
                    alert('obiekt źle dodany');
                    
                }
                
            );
            
        };
        
        
        return {
        
            getProposedTemplates : getProposedTemplates,
            saveProposedTemplate : saveProposedTemplate,
            saveProposedTemplateForThemePage : saveProposedTemplateForThemePage,
            updateProposedTemplateForThemePage : updateProposedTemplateForThemePage
        
        };
    
    })();
    

    Editor.proposedTemplates = ProposedTemplate_module;

})();