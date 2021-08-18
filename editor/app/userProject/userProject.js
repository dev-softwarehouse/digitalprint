import {UserView} from './../class/UserView';
import {ProjectImage} from './../class/ProjectImage';

    var tempViews;
    var tempData;



    var UserProject = function( editor ){

        var Editor = editor;
        var id = null;
        var projectImages = {};
        var views = [];
        var themes = [];
        var usedImages = [];
        var usedView = null;
        var adminView = null;
        var pages = [];
        var formatData = null;
        var imageCounter = 0;
        var format_id = null;
        var attributes = {};
        var name;
        var originalData;
        var allPages = {};
        var cliparts = {}
        var masksAssets = [];

        // tutaaj musi byc trzymana cała struktura projektu, a jej zmiany musza byc reprezentowane prze reacta
        var projectData= [];
        // multiple
        var complex = false;
        var projects = [];
        var formats = [];
        var complexViews = [];
        var complexThemes = [];
        var thick = 0;

        var updateViews_2 = function( projectID, views ){

            
            for( var i=0; i < projects.length; i++){

                if( projects[i]._id == projectID )
                    projects[i].Views = views;

            }

            Editor.template.userPagesPreview.updateViews( projectID, views );

        }

        var getMasks = function(){

            return masksAssets;

        }

        var updateCoverHeight = function( thickness ){

            thick = thickness;
            this.redrawView();

        }

        var getCoverHeight = function(){

            return thick;

        }

        var initComplex = function ( data ){

            complex = true;
            projects = data.projects;
            id = data._id;
  
            data.projects.map( ( project ) => {

                formats.push( project.Format );
                project.Views = _.orderBy( project.Views, 'order');
                complexViews.push( { typeID: project.typeID, views: project.Views } );
                complexThemes = project.Format.Themes;        
                views = views.concat( _.orderBy( project.Views, 'order' ) );
                
            });
            if( Editor.getURLParameters()['themeID'] ){

                for( var i=0; i < complexThemes.length; i++ ){
                
                    if( complexThemes[i].MainTheme._id === Editor.getURLParameters()['themeID'] || complexThemes[i].MainTheme === Editor.getURLParameters()['themeID']){
                        Editor.webSocketControllers.userProject.setMainTheme( getID(), complexThemes[i]._id, ()=>{
                            Editor.webSocketControllers.theme.get( complexThemes[i]._id, function( data ){
                        
                                Editor.template.updateCliparts( data.MainTheme.ProjectCliparts );
                                Editor.userProject.setMasks( data.MainTheme.ProjectMasks );
        
                                var pagesListUser = document.getElementById('pagesListUser').querySelector('.pagesListContent');
                                pagesListUser.innerHTML = '';
        
                                for( var i=0; i<data.ThemePages.length; i++ ){
        
                                    var themePage = data.ThemePages[i];
                                    pagesListUser.appendChild( Editor.template.elements.userThemePage( themePage ) );
        
                                }
        
                                $('#setMainTheme-window').remove();
        
                            });
                            const userView=Editor.userProject.getCurrentView();
                            if(!_.isEmpty(userView)) {
                                Editor.webSocketControllers.userView.get(userView._id, function (data) {

                                    Editor.userProject.initView(data);

                                    setTimeout(function () {

                                        Editor.userProject.regenerateViewThumb();

                                    }, 1000);

                                });
                            }else{
                                console.warn(`Empty UserView ${userView}`);
                            }
                        } );
                        break;
                    }
                    
                }

            } else if( !data.mainTheme ){

                Editor.template.setMainThemeForUserProject( complexThemes );
                
            }else {

                Editor.template.updateCliparts( data.mainTheme.MainTheme.ProjectCliparts );
                Editor.userProject.setMasks( data.mainTheme.MainTheme.ProjectMasks );
                
                var pagesListUser = document.getElementById('pagesListUser').querySelector('.pagesListContent');
                pagesListUser.innerHTML = '';

                for( var i=0; i<data.mainTheme.ThemePages.length; i++ ){

                    var themePage = data.mainTheme.ThemePages[i];
                    pagesListUser.appendChild( Editor.template.elements.userThemePage( themePage ) );

                }
                

            }

            loadComplexViews( complexViews );
            loadProjectImages( data.projectImages );
            Editor.services.calculatePrice();

            setTimeout( function(){
                regenerateViewThumb();
            });


        }


        var init = function( data ){

            if( data.projects ){

                originalData = data;
                initComplex( data );

            }else {

                originalData = data;
                id = data._id;
                views = _.sortBy( data.Views, 'order' );
                //console.log( views );
                //console.log('------------------------');
                themes = data.Format.Themes;
                format_id = data.formatID;
                attributes = data.selectedAttributes;
                formatData = {
                    pagesWidth: data.Format.width,
                    pagesHeight: data.Format.height
                }
    
                if( !data.mainTheme ){
    
                    Editor.template.setMainThemeForUserProject( themes );
    
                }else {
    
                    Editor.webSocketControllers.theme.get( data.mainTheme, function( data ){
    
                        var pagesListUser = document.getElementById('pagesListUser').querySelector('.pagesListContent');
                        pagesListUser.innerHTML = '';
    
                        for( var i=0; i<data.ThemePages.length; i++ ){
    
                            var themePage = data.ThemePages[i];
                            pagesListUser.appendChild( Editor.template.elements.userThemePage( themePage ) );
    
                        }
    
                    });
    
                }
    
                loadThemes( themes );
                loadViews( views );
                loadProjectImages( data.projectImages );
    
                $('.overflowloader').animate({ opacity: 0}, 1500, function( e ){
    
                    $(this).remove();
    
                });
    
                tempViews = views;
                tempData = data;
    
                setTimeout( function(){
                    regenerateViewThumb();
                });
    
                Editor.services.calculatePrice();

            }
            setName( data.projectName );

        };

        var setMasks = function( masks ){

            masksAssets = masks;

        }

        var getObj = function(){

            return originalData;

        }

        var getCurrentPage = function(){



        };

        var getSelectedAttributes = function(){

            return attributes;

        };

        var getFormatID = function(){

            return format_id;

        }

        var loadThemes = function( themes ){

            Editor.template.updateUserThemes( themes );

        };

        var updateTexts = function(){

            var pages = Editor.stage.getPages();

            for( var i=0; i<pages.length; i++ ){

                pages[i].updateUserTexts();

            }

        };


        var loadProjectImages = function( images ){

            for( var i=0; i < images.length; i++ ){

                var data = images[i];
                var projectImg = new ProjectImage( data.uid, data._id );
                projectImg.minUrl = data.minUrl;
                projectImg.thumbnail = data.thumbnail;
                projectImg.imageUrl = data.imageUrl;
                projectImg.editor = Editor;
                projectImg.initForUser( null, EDITOR_ENV.staticUrl+data.minUrl, EDITOR_ENV.staticUrl+data.thumbnail, data.trueWidth, data.trueHeight, data.width, data.height );
                addProjectImage( projectImg );

            }

            imageCounter = images.length;

            Editor.template.updateUserImages( projectImages );

        };

        var setName = function( projectName, saveInDb ){

            name = projectName;
            //alert('USTAWIENIE NAME : ' + projectName );
            Editor.template.updateProjectName( name );

            if( saveInDb ){
                
                Editor.webSocketControllers.userProject.setName( name, id );

            }

        }

        var getID = function(){

            return id;

        };

        var loadComplexViews = function( _views ){

            Editor.template.updateUserComplexViews( projects );
            //console.log( _views[0].views );
            //console.log('blabla');
            Editor.webSocketControllers.userView.get( _views[0].views[0]._id, function( data){

                initView( data );
                Editor.webSocketControllers.userProject.getProjectImagesUseNumber( getID() );

            });

        }

        var loadViews = function( views ){

            // tutaj bedzie stworzenie nowych instancji klasy UserView
            Editor.template.updateUserViews( views );

            Editor.webSocketControllers.userView.get( views[0]._id, function( data ){

                initView( data );

            });

        };

        var getBookFormat = function(){

            for( var p=0; p < projects.length; p++){

                let _project = projects[p];

                for( var v=0; v < _project.Views.length; v++ ){

                    let _view = _project.Views[v];

                    if ( _view.adminView.Pages[0].type != 2 ){
                        return { width: _view.adminView.Pages[0].width, height: _view.adminView.Pages[0].height }
                    }

                }

            }

        }

        var getFormatInfo = function(){

            return formatData;

        }

        var getUserPageByID = function( userPageID ){

            let pages = Editor.stage.getPages();
            
            var userPage = null;

            for( var i=0; i < pages.length; i++ ){

                if( pages[i].userPage._id == userPageID ){

                    userPage = pages[i];

                }

            }

            return userPage;

        };

        var getViewWithPage = function ( pageID ){
            
            for( var i=0; i < projects.length;i++){

                for( var v=0; v < projects[i].Views.length; v++) {

                    let _view = projects[i].Views[v];

                    for( var p=0; p < _view.Pages.length; p++){
                        if( _view.Pages[p]._id == pageID )
                            return _view; 
                    }

                }
                
                
            }          

            return null;

        }

        var renderHTMLUserView = function( view ){


        }

        var regenerateViewThumb = function(){

            function updateView( index ){

                let allViews = [];
            
                for( var i=0; i < projects.length;i++){
    
                    allViews = allViews.concat( _.sortBy(projects[i].Views, 'order') );
    
                }

                var view = allViews[index];

                Editor.webSocketControllers.userView.get( view._id, function( data){

                    view = data;

                    Editor.webSocketControllers.view.get( view.adminView, {}, function( data ){

                        view.adminView = data;

                        var userView = new UserView( Editor, view );

                        index++;
                        
                        if( allViews[index] ){

                            updateView( index );

                        }

                    });


                });

            }

            updateView( 0 );

        }


        var regenerateSingleViewThumb = function( viewID, callback ){
    
                Editor.webSocketControllers.userView.get( viewID, function( data){
    
                    var view = data;
    
                    Editor.webSocketControllers.view.get( view.adminView, {}, function( data ){
    
                        view.adminView = data;
    
                        var userView = new UserView( Editor, view );
    
                        if( callback )
                            callback();
    
                    });
    
                });

        };

        var redrawView = function(){
            if(usedView)
                Editor.webSocketControllers.userView.get( usedView._id, function( data){

                    initView( data );

                });

        };

        var initView = function( view ){

            Editor.tools.setEditingObject( null );
            Editor.tools.init();

            //console.trace();
            //console.log('-------------------');
            //console.log( usedView );
            //console.log( getCurrentView() );
            //console.log('sprawdzamy dlaczego to tak dziwnie sie aktualizuje :)');

            if( usedView ){
                Editor.userProject.regenerateSingleViewThumb (  usedView._id );
            }

            usedView = view;
            pages = _.sortBy( view.Pages, 'order' );

            Editor.fonts.setCurrentFonts( view.Pages[0].fonts );

            $('.photoAlbumPageMulti').removeClass('current');
            $('.photoAlbumPageMulti[data-user-view-id="'+view._id +'"]').addClass('current');

            var selected = Editor.userProject.getSelectedAttributes();
            var options = [];

            for( var key in selected ){

                if( key != -1 )
                    options.push( selected[ key ] );

            }

            //console.log( view.adminView );
            //console.log('PYTAM O WIDOK ADMINA');

            Editor.webSocketControllers.view.get( view.adminView, options, function( data ){

                //console.log( data );
                //console.log('MAM odpowiedz');
                view.adminView = data;
                adminView = data;
                Editor.stage.updateView( data, pages );

                if( pages[0].vacancy ){

                    $(pagesListUser).removeClass( 'noVacancy' );
                    $(pagesListUser).addClass( 'vacancy' );

                }else {

                    $(pagesListUser).removeClass( 'vacancy' );
                    $(pagesListUser).addClass( 'noVacancy' );

                }

                if( pages[0].ThemePage ){
                    Editor.template.updateProposedTemplates( pages[0].ThemePage.proposedTemplates );
                }
                //Editor.template.updateProposedTemplates( view.Pages[0].ThemePage.proposedTemplates );

            });

            updatePagesInfo( view._id );

        };

        var getPagesCountForProduct = function( index ){

            var pagesValue = 0;

            if( projects.length == 0 )
                return 0;

            let allViews = [];
            
            allViews = allViews.concat( _.sortBy(projects[index].Views, 'order') );

            for( var i=0; i < allViews.length; i++ ){

                var view = allViews[i];

                for( var p=0; p < view.Pages.length; p++ ){

                    var page = view.Pages[p];
                    pagesValue += page.pageValue;

                }

            }

            return pagesValue;

        };

        var getAllPagesCount = function(){

            if( projects.length == 0 )
                return 0;

            var pagesValue = 0;

            let allViews = [];
            
            for( var i=0; i < projects.length;i++){

                allViews = allViews.concat( _.sortBy(projects[i].Views, 'order') );

            }

            for( var i=0; i < allViews.length; i++ ){

                var view = allViews[i];


                for( var p=0; p < view.Pages.length; p++ ){

                    var page = view.Pages[p];
                    pagesValue += page.pageValue;

                }

            }

            return pagesValue;

        };

        var getViewPagesRange = function( viewID ){

            /*
            if( isComplex() ){
                return {
                    
                    from: 0,
                    to: 0
    
                }
            }
            */
            var currentPage = 0;
            var pagesValue = 0;
            var pagesFrom = 0;
            var pagesTo = 0;

            let project = _.find( projects, function( elem ){

                for( var i=0; i< elem.Views.length; i++ ){
                    if( viewID == elem.Views[i]._id ){                       
                        return true

                    }
                }

            } );
            if(!project){
                console.error(`Nie znaleziono projectu z view ${viewID}`);
                return {

                    from: pagesFrom,
                    to: pagesTo

                }
            }
            let _views = _.orderBy( project.Views, 'order' );

            for( var i=0; i < _views.length; i++ ){

                var view = _views[i];

                if( view._id == viewID ){

                    pagesFrom = pagesValue + 1;

                }

                for( var p=0; p < view.Pages.length; p++ ){

                    var page = view.Pages[p];
                    pagesValue += page.pageValue;

                }

                if( view._id == viewID ){

                    pagesTo = pagesValue;

                }

            }

            return {

                from: pagesFrom,
                to: pagesTo

            }

        };

        var updateUsedImagesCount = function( data ){

            for( var key in data ){

                if( projectImages[key] ){

                    projectImages[key].updateCounter( data[key] );

                }

            }

        };


        /**
        * Dodaje project image
        *
        * @method addNewProjectImage
        * @param {ProjectImage} projectImage Project Image który ma zostać doany do projektu użytkownia
        */
        var addNewProjectImage = function( projectImage ){

            var dataProjectImage = {

            };

            Editor.webSocketController.userProject.addProjectImage( dataProjectImage );
            Editor.webSocketController.user.addProjectImage( dataProjectImage );

        };


        var addProjectImage = function( projectImage ){

            projectImages[ projectImage.uid ] = projectImage;

        };


        var removeAllImages = function( ){

            for( var key in projectImages ) {

                var projectImage = projectImages[ key ];

                projectImage.stopUploading();

                projectImage.html.parentNode.removeChild( projectImage.html );

                $('.projectPhotosCounter').attr('count', parseInt($('.projectPhotosCounter').attr('count'))-1 ).html( 'Zdjęć: '+$('.projectPhotosCounter').attr('count') );
                document.body.querySelector('.projectNotUsedPhotosCounter').innerHTML = 'Użytych: ' + document.body.querySelectorAll('#imagesList .photo-item.used').length;

                delete projectImages[key];

            }

            regenerateViewThumb();

            Editor.webSocketControllers.userView.get( usedView._id, function( data ){

                Editor.userProject.initView( data );

            });

            $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', 0 );
            $('.uploadingInfo .uploadInfoLoaderText').attr('loaded', 0 );
            $('.uploadingInfo .uploadInfoLoaderText').html( '100%' );
            $('.uploadingInfo').addClass('hidden');

        };


        var removeProjectImage = function( info ){

            var projectImage = projectImages[ info.imageUID ];

            projectImage.stopUploading();

            delete projectImages[ info.imageUID ];

            var used = $(projectImage.html).hasClass('used');

            projectImage.html.parentNode.removeChild( projectImage.html );

            var viewsToRegenerate = info.views.length;
            var regenerated = 0;

            if( info.views.indexOf( getCurrentView()._id ) > -1 ){

                Editor.webSocketControllers.userView.get( getCurrentView()._id, function( data){

                    initView( data );

                });

            }

            $('.projectPhotosCounter').attr('count', parseInt($('.projectPhotosCounter').attr('count'))-1 ).html( 'Zdjęć: '+$('.projectPhotosCounter').attr('count') );

            document.body.querySelector('.projectNotUsedPhotosCounter').innerHTML = 'Użytych: ' + document.body.querySelectorAll('#imagesList .photo-item.used').length;

            function regenerate(){

                if( viewsToRegenerate != regenerated ){

                    regenerateSingleViewThumb( info.views[regenerated],function(){

                        regenerated++;
                        regenerate();

                    });

                }

            }

            regenerate();

        };

        /**
        * Zwraca wszystkie obrazy
        *
        * @method getProjectImages
        * @return {Array} projectImage
        */
        var getProjectImages = function(){

            return projectImages;

        };

        var getProjectImage = function( uid ){
            
            if( projectImages[uid] ){
                return projectImages[uid];
            }else if( cliparts[uid] ) {
                return cliparts[uid];
            }else {
                return null;
            }

        };

        var addClipart = function( clipart ){

            cliparts[clipart.uid] = clipart;

        }

        var getCurrentView = function() {

            return usedView;

        };

        var getViewsNumber = function() {

            return views;

        }

        var isNextView = function (){
            var currentViewIndex;

            let allViews = [];

            for( var i=0; i < projects.length;i++){

                allViews = allViews.concat( _.sortBy(projects[i].Views, 'order') );

            }

            _.find( allViews, function( el, index ){
                
                if( el._id ==  Editor.userProject.getCurrentView()._id )
                    currentViewIndex = index;

            } );

            if( currentViewIndex != undefined ){
                if( allViews[currentViewIndex+1])
                    return true;
                else 
                    return false;
            }

        }

        var isPrevView = function (){
            var currentViewIndex;

            let allViews = [];

            for( var i=0; i < projects.length;i++){

                allViews = allViews.concat( _.sortBy(projects[i].Views, 'order') );

            }

            _.find( allViews, function( el, index ){
                
                if( el._id ==  Editor.userProject.getCurrentView()._id )
                    currentViewIndex = index;

            } );

            if( currentViewIndex != undefined ){
                if( allViews[currentViewIndex-1])
                    return true;
                else 
                    return false;
            }
            
        }

        var turnToNextView = function (){

            var def = $.Deferred();

            var currentViewIndex;

            let allViews = [];

            for( var i=0; i < projects.length;i++){

                allViews = allViews.concat( _.sortBy(projects[i].Views, 'order') );

            }

            _.find( allViews, function( el, index ){
                
                if( el._id ==  Editor.userProject.getCurrentView()._id )
                    currentViewIndex = index;

            } );

            if( currentViewIndex != undefined ){

                if( allViews[currentViewIndex+1]){

                    var image = getCurrentPageImage();
                    
                    var query = document.body.querySelectorAll('.photoAlbumPageMulti[data-user-view-id="'+Editor.userProject.getCurrentView()._id+'"]');
        
                    query[0].style.backgroundImage = "url("+ image +")";

                    Editor.webSocketControllers.userView.get( allViews[currentViewIndex+1]._id, function( data ){
                        
                        Editor.userProject.initView( data );
                        def.resolve( data );
        
                    });
                        
                                
                }

            }

            return def.promise();
            


            

           
        }

        var turnToPreviousView = function (){

            var def = $.Deferred();
            
            var currentViewIndex;
            
            let allViews = [];

            for( var i=0; i < projects.length;i++){

                allViews = allViews.concat( _.sortBy(projects[i].Views, 'order') );

            }

            _.find( allViews, function( el, index ){
                
                if( el._id ==  Editor.userProject.getCurrentView()._id )
                    currentViewIndex = index;

            } );

            if( currentViewIndex != undefined ){

                if( allViews[currentViewIndex-1]){

                    var image = getCurrentPageImage();
                    
                    var query = document.body.querySelectorAll('.photoAlbumPageMulti[data-user-view-id="'+Editor.userProject.getCurrentView()._id+'"]');
        
                    query[0].style.backgroundImage = "url("+ image +")";

                    Editor.webSocketControllers.userView.get( allViews[currentViewIndex-1]._id, function( data ){
                        
                        Editor.userProject.initView( data );
                        def.resolve( data );
        
                    });
                        
                                
                }

            }

            return def.promise();

        }

        var updateViews = function( _views ){

            views = _views;
            views = _.sortBy( views, 'order' );

            Editor.template.updateUserViews( views );

        }

        var getViews = function(){

            return views;

        }

        var removeView = function( data ){
            projects.find((e)=>e._id==data.projectID).Views=data.views;
            Editor.template.userPagesPreview.updateViews( data.projectID, data.views );
            if(document.body.querySelector('.totalWhitePopUp'))
                Editor.template.displayAllPagesWithPhotos();
            /*views = _.sortBy( views, 'order' );

            for( var i=0; i < views.length; i++){

                if( views[i]._id == data ){

                    for( var v=i+1; v < views.length; v++){

                        views[v].order--;

                    }
                    views.splice( i,1 );
                    break;

                }

            }*/

            /*// UWAGA!!! tutaj nie jest zachowana cągłość orderów!
            var toRemove = document.querySelector('.photoAlbumPageMulti[user-view-id="'+data+'"]');
            if (toRemove) {
                toRemove.parentNode.removeChild(toRemove);
            }

            if( document.body.querySelectorAll('.viewElemFromPopUp').length ){

                var elemToRemove = document.body.querySelector('.viewElemFromPopUp[data-id="'+data+'"]');
                elemToRemove.parentNode.removeChild( elemToRemove );

            }*/

        }

        var sortViews = function(){

            views = _.sortBy( views, 'order' );

        }

        var reorderViews = function( data ){
            for( var i=0; i< projects.length; i++ ){

                if( projects[i]._id == data.project ){
                    projects[i].Views = _.sortBy( data.views, 'order' );
                    Editor.template.userPagesPreview.reorderViews( data.project, projects[i].Views );

                }

            }

            

            return; //TODO

            for( var i=0; i < views.length; i++ ){

                var newViewInfo = _.find( data, function( viewInfo ){

                    return ( viewInfo.viewID == views[i]._id );

                });

                if( newViewInfo ){

                    views[i].order = newViewInfo.order;

                }

            }

            views = _.sortBy( views, 'order' );

            //console.log( views );
            //console.log('))))))))))))))))))))))))))))))))))))))))))))))))))))))))jhfdskhjdfkslh djfkshflk dsjkf hlsakdjfjds fjklshd fjksdhkl');

            Editor.template.userPagesPreview.reorderViews( views );

            return;//TODO
            var viewsElemArray = [];

            for( var i=0; i < views.length; i++ ){

                var elem = document.getElementById('ulviewsList').querySelector('.photoAlbumPageMulti[user-view-id="'+ views[i]._id +'"]');
                viewsElemArray.push( elem );
                //alert( Array.prototype.indexOf.call( elem.parentNode.childNodes, elem) + " : " + views[i].order );

            }

            var container = document.getElementById('ulviewsList');

            for( var i=0; i < viewsElemArray.length; i++ ){

                container.appendChild( viewsElemArray[i] );

            }


            if( document.body.querySelectorAll('.viewElemFromPopUp').length ){

                var parent = document.getElementById('viewsContainerPopUp');

                var viewsElemArray = [];

                for( var i=0; i < views.length; i++ ){

                    var elem = parent.querySelector('.viewElemFromPopUp[data-id="'+ views[i]._id +'"]');
                    viewsElemArray.push( elem );
                    //alert( Array.prototype.indexOf.call( elem.parentNode.childNodes, elem) + " : " + views[i].order );

                }

                for( var i=0; i < viewsElemArray.length; i++ ){

                    parent.appendChild( viewsElemArray[i] );

                }

            }

            rewriteViewsPages();
            updatePagesInfo( usedView._id );

        };

        var addView = function( projectID, added, _views ){


            for( var i=0; i< projects.length; i++ ){

                if( projects[i]._id == projectID )
                    projects[i].Views = _.sortBy( _views, 'order' );

            }

            Editor.template.userPagesPreview.addView( projectID, added, _views );
            
            /*
            views = _views;
            views = _.sortBy( views, 'order' );
            originalData.pages += view.Pages[0].pageValue;
            Editor.template.userPagesPreview.reorderViews( _views );
            */

        };

        var updatePagesInfo = function( viewID ){

            var elem = document.querySelectorAll('.currentPageInfo');
            var pagesInfoElems = document.querySelectorAll('.pagesInfo');

            if ( usedView ){
            	viewID = usedView._id
            }

            var pagesRange = getViewPagesRange( viewID );
            var allPages = getAllPagesCount();

            for( var i=0; i < elem.length; i++ ){

                if( pagesRange.from == pagesRange.to ){

                    var el = elem[i];
                    el.innerHTML = pagesRange.from;

                }else {

                    var el = elem[i];
                    el.innerHTML = pagesRange.from + '-' + pagesRange.to;

                }

            }

            for( var i=0; i < pagesInfoElems.length; i++ ){

                pagesInfoElems[i].innerHTML = "Stron: " + allPages;

            }

            var elems = $( '#viewsListUser .complexView' );

            var width = 0;

            for( var i=0; i < elems.length;i++){
                width += $(elems[i]).outerWidth( true );
            }

            width+=100;

            $('ul#viewsListUser').width( width );

        };

        var rewriteViewsPages = function(){

            var viewsElements = document.querySelectorAll('.photoAlbumPageMulti');

            var currentPage = 0;

            for( var i=0; i < viewsElements.length; i++ ){

                var pagesValue = parseInt( viewsElements[i].getAttribute('pagesVal') );
                viewsElements[i].querySelector('.pagesCounter').innerHTML = ( currentPage ? (currentPage+1) + '-' + (currentPage+pagesValue) : ( ( pagesValue == 1 ) ? pagesValue : '1-'+ pagesValue ) );
                currentPage += pagesValue;

            }

            var currentPage = 0;

            if( document.getElementById('viewsContainerPopUp') ){

                var elements = document.querySelectorAll('.viewElemFromPopUp');

                for( var i=0; i < elements.length; i++ ){

                    var pagesValue = parseInt( elements[i].getAttribute('pages-value') );
                    elements[i].querySelector('.pageNumberPopUp').innerHTML = ( currentPage ? (currentPage+1) + '-' + (currentPage+pagesValue) : ( ( pagesValue == 1 ) ? pagesValue : '1-'+ pagesValue ) );
                    currentPage += pagesValue;

                }

            }

            /*

            */

        };

        function increaseImageCounter(){

            imageCounter++;

        };


        function decreaseImageCounter(){

            imageCounter--;

        };

        function getImageCounter(){

            return imageCounter;

        };

        function updateProjectImagesOrders( sortedList ){

            for( var key in sortedList ){

                projectImages[ key ].imageOrder = sortedList[key];
                projectImages[ key ].updateOrderInHTML();

            }

            sortProjectImages();

        };

        // wykonuje się po wyjściu z danego widoku
        function updateCurrentViewThumb(){

            Editor.userProject.regenerateSingleViewThumb ( editor.userProject.getCurrentView()._id );

        };
//TODO nadmiarowe przerysowanie wszsytkich
        function updateChangedViews(ids){
            editor.userProject.getViews().forEach(v=>{
                Editor.userProject.regenerateSingleViewThumb ( v._id);
            })


        };

        function getCurrentPageImage(){

            var page = Editor.userProject.getUserPageByID( getCurrentView().Pages[0]._id );
            page.cache( 0,0, page.width, page.height,3 );

            var imageURI = page.cacheCanvas.toDataURL();

            allPages[getCurrentView().Pages[0]._id].prev = imageURI;
            page.uncache();


            return imageURI;

        };

        function sortProjectImages(){

            var images = [];

            for( var key in projectImages ){

                images.push( projectImages[key] );

            }

            images = _.sortBy( images, 'imageOrder' );

            var imagesElem = [];

            for( var i=0; i < images.length; i++ ){

                var elem = document.getElementById('imagesList').querySelector('.photo-item[data-uid="'+ images[i].uid +'"]');
                imagesElem.push( elem );
                //alert( Array.prototype.indexOf.call( elem.parentNode.childNodes, elem) + " : " + views[i].order );

            }

            var container = document.getElementById('imagesList');

            for( var i=0; i < imagesElem.length; i++ ){

                container.appendChild( imagesElem[i] );

            }

        };

        var getName = function(){
            return name;
        }

        var getPages = function(){

            return allPages;

        }

        var getCoverPage = function(){

            const pages = [];
            let views = [];

           try{
               for( let i=0; i < projects.length;i++){
                   if( projects[i].Views[0].adminView.Pages[0].type == 2 ){
                       projects[i].Views = _.sortBy( projects[i].Views, 'order' );
                       views = views.concat( projects[i].Views );
                   }
               }

               for( let v=0; v < views.length; v++ ){

                   pages.push( views[v].Pages[0] );

               }
           }catch(e){
               console.error('Problem z modelem okładki dla pokazania flipbooka',e)
           }

            const orderedPages = [];

            for( let i=0; i < pages.length; i++){

                orderedPages.push( allPages[ pages[i]._id ] );

            }

            return orderedPages;

        }

        var getOrderedPages = function(){

            var pages = [];
            var views = [];

            for( var i=0; i < projects.length;i++){
                if(  projects[i].Views[0].adminView.Pages && projects[i].Views[0].adminView.Pages[0].type != 2 ){
                    projects[i].Views = _.sortBy( projects[i].Views, 'order' );
                    views = views.concat( projects[i].Views );
                }
                /*for( var v=0; v < projects[i].Views.length; v++) {

                    let _view = projects[i].Views[v];
                    
                    for( var p=0; p < _view.Pages.length; p++){

                        let page = _view.Pages[p];
                        page.width = projects[i].Format.width;
                        page.height = projects[i].Format.height;

                    }

                    if( _view.Pages[0].type != 2 ){
                        pages = pages.concat( _view.Pages );
                    }

                }
                */
            }      

            for( var v=0; v < views.length; v++ ){

                pages.push( views[v].Pages[0] );

            }

            var orderedPages = [];

            for( var i=0; i < pages.length; i++){

                orderedPages.push( allPages[ pages[i]._id ] );

            }

            return orderedPages;

        }

        var pushPage = function( id, page ){
            //alert( id );
            allPages[ id ] = page;

        }

        var isComplex = function(){

            return complex;

        }

        var findMaskById = function( id ){

            for ( var i=0; i < masksAssets.length; i++  ){

                if( masksAssets[i]._id == id ){
                    return masksAssets[i];
                }

            }

            return null;

        }

        return {
            isComplex              : isComplex,
            findMaskById           : findMaskById,
            addClipart             : addClipart,
            setName                : setName,
            getName                : getName,
            addView                : addView,
            updateViews            : updateViews,
            addProjectImage        : addProjectImage,
            getProjectImage        : getProjectImage,
            getProjectImages       : getProjectImages,
            getFormatID            : getFormatID,
            getFormatInfo          : getFormatInfo,
            getImageCounter        : getImageCounter,
            increaseImageCounter   : increaseImageCounter,
            decreaseImageCounter   : decreaseImageCounter,
            init                   : init,
            initView               : initView,
            getID                  : getID,
            getObj                 : getObj,
            turnToNextView         : turnToNextView,
            turnToPreviousView     : turnToPreviousView,
            getCurrentPageImage    : getCurrentPageImage,
            getSelectedAttributes  : getSelectedAttributes,
            getPages               : getPages,
            getOrderedPages        : getOrderedPages,
            getCurrentView         : getCurrentView,
            getViewsNumber         : getViewsNumber,
            getViews               : getViews,
            getUserPageByID        : getUserPageByID,
            pushPage               : pushPage,
            redrawView             : redrawView,
            setMasks               : setMasks,
            getAllPagesCount       : getAllPagesCount,
            getMasks               : getMasks,
            regenerateSingleViewThumb : regenerateSingleViewThumb,
            regenerateViewThumb : regenerateViewThumb,
            renderHTMLUserView : renderHTMLUserView,
            reorderViews : reorderViews,
            removeProjectImage : removeProjectImage,
            removeAllImages : removeAllImages,
            removeView : removeView,
            rewriteViewsPages : rewriteViewsPages,
            sortViews  : sortViews,
            updateProjectImagesOrders : updateProjectImagesOrders,
            updateTexts : updateTexts,
            updateUsedImagesCount : updateUsedImagesCount,
            updateCurrentViewThumb : updateCurrentViewThumb,
            updateChangedViews : updateChangedViews,
            updatePagesInfo: updatePagesInfo,
            updateViews_2: updateViews_2,
            getPagesCountForProduct : getPagesCountForProduct,
            updateCoverHeight : updateCoverHeight,
            getCoverHeight : getCoverHeight,
            isPrevView : isPrevView,
            isNextView : isNextView,
            getViewWithPage : getViewWithPage,
            getBookFormat : getBookFormat,
            getCoverPage : getCoverPage
        };


    }

    export { UserProject }
