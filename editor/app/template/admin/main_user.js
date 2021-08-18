import UserPagePreview from "./../UserPagePreview";
import TopMenu from "./../TopMenu";
import {ProjectNameComponent} from "./../ProjectNameComponent";
import React from "react";
import ReactDOM from "react-dom";
import {store} from '../../ReactSetup'
import { Provider } from 'react-redux'
import {ProjectImage} from './../../class/ProjectImage.js';


var TemplateModule = require('./main').TemplateModule;


    var bottomBoxOpen = true;
    var stageBottomThemesBox = false;



    var topMenuHeight = 80;
    var menuDuration = 500;
    var helperDuration = 300;

    TemplateModule.prototype.stageBottomBox = function( value ){

        if ( value ) {
            bottomBoxOpen = value;
        }
        return bottomBoxOpen;
    }

    TemplateModule.prototype.stageBottomThemesBox = function( value ){

        if ( value ) {
            stageBottomThemesBox = value;
        }
        return stageBottomThemesBox;
    }

    TemplateModule.prototype.generatePages = function(){

        var tool = document.createElement('div');
        tool.id = 'pages-container-tool';
        tool.className = 'tool closed';
        //tool.style.width = '1200px';

        var innerContainer = document.createElement('div');
        innerContainer.className = 'innerContainer';

        var toolButton = document.createElement('span');
        toolButton.id = 'pages-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'pages-content');

        tool.appendChild( toolButton );

        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Podgląd stron</span>';

        tool.appendChild( toolHelper );
        // views content
        var toolContent = document.createElement('div');
        toolContent.id = 'pages-content';


        var viewsList = document.createElement('ul');
        viewsList.id = 'pages-list';

        toolContent.appendChild( viewsList );

        var toolsContainer = document.getElementById("toolsContent");
        toolsContainer.appendChild( toolContent );


        // programowanie przycisku views
        toolButton.addEventListener('click', function(){


        });

        //funkcje inicjalizujące
        return tool;

    };

    TemplateModule.prototype.updateUserThemes = function( themes ){

        var Editor = this.editor;

        var themeContent = document.getElementById('project-themes-list');

        for( var i=0 ; i < themes.length; i++){

            var themeTitle = document.createElement('span');
            themeTitle.className = 'themeName';
            themeTitle.innerHTML = themes[i].name;
            themeTitle.setAttribute('data-theme-name', themes[i].name );

            var showPages = document.createElement('span');
            showPages.className = 'EditPages';
            showPages.addEventListener('click', function(){

                //Editor.template.overlayBlock( content, 'big');

            });


            var theme = document.createElement('li');
            theme.setAttribute( 'data-theme-id', themes[i]._id );
            theme.setAttribute( 'data-main-theme-id', themes[i].MainTheme );
            theme.appendChild( themeTitle );
            theme.style.backgroundImage = 'url(' + themes[i].url + ')';

            theme.addEventListener('click', function( e ){

                e.stopPropagation();

                stageBottomThemesBox = true;


                if( $('#pagesListUser').attr('isopen') == 'true' || $('#pagesListUser').attr('isopen') == undefined ){

                    if( $('#viewsListUser').attr('isopen') == 'true' || $('#viewsListUser').attr('isopen') == undefined ){
                        $('#viewsListUser').attr('isopen', 'false' );

                        $('#viewsListUser').animate( { bottom: -110 }, function(){


                        });

                    }


                }else {

                    $('#pagesListUser').attr('isopen', 'true');
                    $( "#pagesListUser" ).animate( { bottom: 0 }, {

                        duration: 200,
                        step : function( topStep ){
                            Editor.template.resizeToUserObject();
                            Editor.stage.centerCameraYuser();

                        },
                        complete : function(){

                            Editor.template.resizeToUserObject();
                            Editor.stage.centerCameraYuser();

                        }

                    });

                    if( $('#viewsListUser').attr('isopen') == 'true' || $('#viewsListUser').attr('isopen') == undefined ){
                        $('#viewsListUser').attr('isopen', 'false' );

                        $('#viewsListUser').animate( { bottom: -110 }, function(){


                        });

                    }

                }


                Editor.webSocketControllers.theme.get( this.getAttribute('data-theme-id'), function( data ){

                    var pagesListUser = document.getElementById('pagesListUser').querySelector('.pagesListContent');
                    pagesListUser.innerHTML = '';

                    for( var i=0; i<data.ThemePages.length; i++ ){

                        var themePage = data.ThemePages[i];
                        pagesListUser.appendChild( Editor.template.elements.userThemePage( themePage ) );

                    }



                });
                //alert('teraz ma sie wyswietlic lista stron motywu');

            });

            themeContent.appendChild( theme );

        }

    };

    TemplateModule.prototype.generateViewsPagesThumb = function(){

        var tempLenght =  [];
        tempLenght = Editor.userProject.getViewsNumber();
        var numberOfViews = tempLenght.length;

        for ( var i=0 ; i <= numberOfViews - 1 ; i++ ){

            var promise = Editor.userProject.turnToNextView().done(function () {

            });

        }

       // var loadPageView =  Editor.userProject.getViewsNumber()[0];
        //Editor.userProject.initView( loadPageView );

    }

    TemplateModule.prototype.viewSnapShot = function (){

        var promise = Editor.userProject.turnToNextView().done(function () {

        });



    }


    TemplateModule.prototype.setMainThemeForUserProject = function( themes ){

        var body = document.createElement('div');
        body.className = 'all-theme-list';
        var _this = this;

        for( var i=0 ; i < themes.length; i++){

            var themeTitle = document.createElement('span');
            themeTitle.className = 'themeName';
            themeTitle.innerHTML = themes[i].name;
            themeTitle.setAttribute('data-theme-name', themes[i].name );

            var showPages = document.createElement('span');
            showPages.className = 'EditPages';
            showPages.addEventListener('click', function(){

                //Editor.template.overlayBlock( content, 'big');

            });


            var theme = document.createElement('li');
            theme.setAttribute( 'data-theme-id', themes[i]._id );
            theme.setAttribute( 'data-main-theme-id', themes[i].MainTheme );
            theme.appendChild( themeTitle );
            theme.style.backgroundImage = 'url(' + themes[i].url + ')';

            theme.addEventListener('click', function( e ){

                e.stopPropagation();

               // stageBottomThemesBox = true ;

                var mainThemeID = this.getAttribute('data-theme-id');
                
                _this.editor.webSocketControllers.userProject.setMainTheme( _this.editor.userProject.getID() ,mainThemeID, function( data ){
                    
                    _this.editor.webSocketControllers.theme.get( mainThemeID, function( data ){
                        
                        _this.updateCliparts( data.MainTheme.ProjectCliparts );
                        _this.editor.userProject.setMasks( decorateImages(data.MainTheme.ProjectMasks) );

                        var pagesListUser = document.getElementById('pagesListUser').querySelector('.pagesListContent');
                        pagesListUser.innerHTML = '';

                        for( var i=0; i<data.ThemePages.length; i++ ){

                            var themePage = data.ThemePages[i];
                            pagesListUser.appendChild( _this.editor.template.elements.userThemePage( themePage ) );

                        }

                        $('#setMainTheme-window').remove();

                    });

                    _this.editor.webSocketControllers.userView.get( _this.editor.userProject.getCurrentView()._id, function( data ){

                        _this.editor.userProject.initView( data );

                        setTimeout( function(){

                            _this.editor.userProject.regenerateViewThumb();

                        }, 1000 );

                    });
                    

                });


            });

            body.appendChild( theme );

        }

        var smallWindow = this.editor.template.displayWindow(

            'setMainTheme-window',
            {

                size : 'small',
                title : 'Wybierz motyw przewodni',
                content : body

            },
            true

        );

        $('body').append( smallWindow );


        $('#setMainTheme-window').on( 'hidden.bs.modal', function(){

            $(this).remove();

        });

        $('#setMainTheme-window').modal({

            keyboard: false,
            backdrop: 'static'

        });

    };


    TemplateModule.prototype.updateProposedTemplates = function( proposedTemplates ){

        var Editor = this.editor;

        var container =  document.getElementById('proposedTemplate-content').querySelector('.proposedTemplateContainer');
        container.innerHTML = '';

        var allVisible = document.createElement('div');
        allVisible.className = 'allVisible closed';
        allVisible.innerHTML = 'Wszystkie';

        allVisible.addEventListener('click', function( e ){

            e.stopPropagation();

            if( this.hasClass('open') ){

                var elements = document.querySelectorAll('.proposedPositionsContainer');

                for( var i=0; i < elements.length; i++ ){

                    var elem = elements[i];
                    elem.style.height = 0;

                    if( elem.parentNode.hasClass('open') ){

                        elem.parentNode.removeClass('open').addClass('closed');

                    }

                }

                this.removeClass('open').addClass('closed');

            }else {

                var elements = document.querySelectorAll('.proposedPositionsContainer');

                for( var i=0; i < elements.length; i++ ){

                    var elem = elements[i];
                    elem.style.height = elem.getAttribute('cust-height') + 'px';

                    if( elem.parentNode.hasClass('closed') ){

                        elem.parentNode.removeClass('closed').addClass('open');

                    }

                }

                this.removeClass('closed').addClass('open');

            }


        });

        container.appendChild( allVisible );

        var counts = [];

        for( var i=0; i < proposedTemplates.length; i++ ){

            if( counts.indexOf( proposedTemplates[i].imagesCount) == -1 ){

                counts.push( proposedTemplates[i].imagesCount );

            }

        }

        counts.sort();

        for( var i=0; i < counts.length; i++ ){

            var selectedTemplates = _.filter( proposedTemplates, { imagesCount : counts[i] } );

            container.appendChild( Editor.template.elements.proposedTemplateCountSelector( 'Ilość zdjęć: ' + counts[i], selectedTemplates  ) );

            container.lastChild.querySelector('.proposedPositionsContainer').setAttribute('cust-height', $( container.lastChild.querySelector('.proposedPositionsContainer') ).outerHeight() );
            container.lastChild.querySelector('.proposedPositionsContainer').style.height = 0;
            $(container.lastChild).addClass('closed');

        }

    };


    TemplateModule.prototype.updateUserViews = function( views ){

        var currentPage = 0;

        var _this = this;

        _this.userPagesPreview.removeAllViews();

        

        function createViewElement( view ){

            if( view.views ){

                var pagesValue = 0;
                
                for( var i=0; i < view.Pages.length; i++ ){
    
                    pagesValue += view.Pages[i].pageValue;
    
                }
                
                _this.userPagesPreview.addComplexView( pagesValue, view.repeatable, view._id, view.order );
                currentPage += pagesValue;

            }else {

                var pagesValue = 0;
                
                for( var i=0; i < view.Pages.length; i++ ){
    
                    pagesValue += view.Pages[i].pageValue;
    
                }
    
                _this.userPagesPreview.addView( pagesValue, view.repeatable, view._id, view.order );
                currentPage += pagesValue;

            }
            
        };

        for( var i=0; i < views.length; i++ ){

            createViewElement( views[i] );

        }

    };

    TemplateModule.prototype.updateUserComplexViews = function( projects ){
        
        var currentPage = 0;

        var _this = this;

        _this.userPagesPreview.removeAllViews();

        function createViewElement( project ){

            let productName = '';
            
            for( var key in _this.editor.productsNames ) {
                
                if( _this.editor.productsNames[key].indexOf( project.typeID ) > -1 ) {
                    productName = key;
                    break;
                }

            }

            _this.userPagesPreview.addComplexView( project.typeID, project.Views, productName, project._id );

        };

        for( var i=0; i < projects.length; i++ ){

            createViewElement( projects[i] );

        }

    };

    TemplateModule.prototype.displayUserPhotos = function( userID ){


        Editor.webSocketControllers.user.getPhotos( userID, function( data ){

            var photos = document.createElement('div');
            photos.id = 'currentUserPhotos';

        });

    };


    TemplateModule.prototype.updateUserImages = function( images ){

        for( var key in images ){

            document.getElementById('imagesList').appendChild( images[key].html );

        }

    };


    TemplateModule.prototype.generateSwapTemplate = function(){

        var elem = document.createElement('div');
        elem.id = 'swapLayout';

        elem.addEventListener('click', function( e ){

            e.stopPropagation();

        });

        return elem;

    };


    TemplateModule.prototype.nextPageAndPreviousPage = function(){

        var elem = document.createElement('div');
        elem.id = 'pageController';

        var next = document.createElement('div');
        next.className = 'nextPageButton';

        next.addEventListener('click', function( e ){

            e.stopPropagation();

        });

        var prevButtonAndLabel = document.createElement('div')
        prevButtonAndLabel.className = 'prevButtonAndLabel';

        var nextButtonAndLabel = document.createElement('div')
        nextButtonAndLabel.className = 'nextButtonAndLabel';

        var prev = document.createElement('div');
        prev.className = 'prevPageButton';

        var prevLabel = document.createElement('label');
        prevLabel.className = 'prevLabel';

        var nextLabel = document.createElement('label');
        nextLabel.className = 'nextLabel';


        prev.appendChild( prevLabel );
        next.appendChild( nextLabel );

        prev.addEventListener('click', function( e ){

            e.stopPropagation();

        });

        prevButtonAndLabel.appendChild( prev );
        nextButtonAndLabel.appendChild( next );

        elem.appendChild( prevButtonAndLabel );
        elem.appendChild( nextButtonAndLabel );

        return elem;

    };

    TemplateModule.prototype.changeViewThumb = function( viewID, thumb ){

        this.userPagesPreview.changeViewThumb( viewID, thumb );

    };

    TemplateModule.prototype.generateLayersTool = function(){

        var tool = document.createElement('div');
        tool.id = 'layers-container-tool';
        tool.className = 'tool closed';

        var innerContainer = document.createElement('div');
        innerContainer.id = 'layersContent';


        var layers = document.createElement('div');
        layers.id = 'editorLayers';

        var toolMainContent = document.createElement('div');
        toolMainContent.id = "layers-main-content"

        innerContainer.appendChild( toolMainContent );
        toolMainContent.appendChild( layers );

        var toolsContainer = document.getElementById("toolsContent");
        toolsContainer.appendChild( innerContainer );

        return tool;
    };

    TemplateModule.prototype.generateUserViewsAndThemes = function(){

        var Editor = this.editor;

        var viewsList = document.createElement( 'ul' );
        viewsList.id = 'ulviewsList';
        var viewCount = 1;

        var viewsListUser = document.createElement('div');
        viewsListUser.id = 'viewsListUser';
        viewsListUser.className = 'displayController';
        viewsListUser.setAttribute('isopen', 'true');

        var viewsListContent = document.createElement('div');
        viewsListContent.className = 'viewsListContent';

        var viewsListLabel = document.createElement('div');
        viewsListLabel.className = 'viewsListLabel';

        var viewsListHorRuler = document.createElement('div');
        viewsListHorRuler.className = 'viewsListHorRuler';

        document.body.appendChild( viewsListUser );

        var mainButtonsTool = document.createElement('div');
        mainButtonsTool.id = 'mainViewsButtons';

        var addPageButton = document.createElement( 'div' );
        addPageButton.className = 'addPageButton';
        mainButtonsTool.appendChild( addPageButton );

        var allPagesPopUpButton = document.createElement('div');
        allPagesPopUpButton.id = 'allPagesPopUpButton';
        mainButtonsTool.appendChild( allPagesPopUpButton );

        var scrollLeft = document.createElement('div');
        scrollLeft.className = 'scrollViewsLeft';

        var scrollRight = document.createElement('div');
        scrollRight.className = 'scrollViewsRight';

        viewsListUser.appendChild( mainButtonsTool );

        viewsListUser.appendChild( scrollLeft );

        addPageButton.addEventListener('click', function( e ){

            e.stopPropagation();
            const proj=this.editor.userProject.getObj().projects[this.editor.userProject.getObj().projects.length - 1];//TODO Nie zawsze ostatni
            if (this.editor.checkPagesCountConstraint({project:proj,addRemove:'ADD'})) {
                let pos=this.editor.userProject.getCurrentView().order + 1;
                if(pos===proj.Views.length){
                    pos--;
                }
                this.editor.webSocketControllers.userProject.addNewView(proj._id, pos);
            }
        }.bind( this ));

        allPagesPopUpButton.addEventListener('click', function( e ){

            e.stopPropagation();

            this.editor.template.displayAllPagesWithPhotos();

        }.bind( this ));

        viewsList.addEventListener('click', function( e ){

            e.stopPropagation();

            if( e.target && e.target.nodeName == "LI" ) {

                this.editor.webSocketControllers.userView.get( e.target.getAttribute('user-view-id'), function( data ){

                    this.editor.userProject.updateCurrentViewThumb();
                    this.editor.userProject.initView( data );

                }.bind( this ));

            }
            else if( e.target && e.target.nodeName == "DIV" && e.target.className == 'viewRemover' ){

                e.stopPropagation();
                if (this.editor.checkPagesCountConstraint({project:this.editor.userProject.getObj().projects[this.editor.userProject.getObj().projects.length - 1],addRemove:'REMOVE'})){//TODO Valid project index
                    this.editor.webSocketControllers.userProject.removeView( this.editor.userProject.getID(), e.target.getAttribute('user-view-id') );
                }

            }

        }.bind( this ));


        //viewsListContent.appendChild( viewsList );

        document.getElementById("viewsListUser").appendChild( viewsListLabel );
        document.getElementById("viewsListUser").appendChild( viewsListContent );
        viewsListUser.appendChild( scrollRight );

        var _this = this;

        viewsListLabel.addEventListener('click' , function ( e ){

            e.stopPropagation();

            //var _this = this;

            if( $( "#viewsListUser" ).attr('isopen') == 'true' || $( "#viewsListUser" ).attr('isopen') == undefined ){

                $( "#viewsListUser" ).attr('isopen', 'false');
                $( "#viewsListUser" ).animate( { bottom: -110 }, {

                    duration: 200,
                    step : function( topStep ){

                        _this.editor.template.resizeToUserObject();
                        _this.editor.stage.centerCameraYuser();

                    },
                    complete : function(){

                        _this.editor.template.resizeToUserObject();
                        _this.editor.stage.centerCameraYuser();

                    }

                });

            }else {

                if( $('#pagesListUser').attr('isopen') == 'false' ){

                    $( "#pagesListUser" ).animate( { bottom: 0 }, 200, function(){



                    });

                }

                $( "#pagesListUser" ).attr('isopen', 'true');
                $( "#viewsListUser" ).attr('isopen', 'true');

                $( "#viewsListUser" ).animate( { bottom: 0 }, {

                    duration: 200,
                    step : function( topStep ){
                        _this.editor.template.resizeToUserObject();
                        _this.editor.stage.centerCameraYuser();

                    },
                    complete : function(){

                        _this.editor.template.resizeToUserObject();
                        _this.editor.stage.centerCameraYuser();

                    }

                });

            }

        });

        viewsListContent.style.width = viewsListUser.offsetWidth-addPageButton.offsetWidth-100 + 'px';
        viewsListContent.style.height = '110px';

        if( viewsList.childNodes[0] ){

            viewsList.style.width = viewsList.childNodes.length*(viewsList.childNodes[0].offsetWidth+10) + "px";
            

        }else {

            viewsList.style.width = '200px';

        }

        window.addEventListener('resize', function( e ){

            viewsListContent.style.width = viewsListUser.offsetWidth-addPageButton.offsetWidth-100 + 'px';

        });

        Ps.initialize( viewsListContent,{

            useBothWheelAxes: true

        } );

        scrollLeft.addEventListener('click', function( e ){

            viewsListContent.scrollLeft -= 240;

            Ps.update(viewsListContent);

        });

        scrollRight.addEventListener('click', function( e ){

            viewsListContent.scrollLeft += 240;

            Ps.update(viewsListContent);

        });


        var pagesListUser = document.createElement('div');
        pagesListUser.id = 'pagesListUser';
        pagesListUser.className = 'displayController';
        pagesListUser.setAttribute('isopen', 'true');
        //pagesListUser.className = ( ( Editor.userProject.getCurrentView().Pages[0].vacancy ) ? 'vacancy' : 'noVacancy' ) + '';

        var pagesCont = document.createElement('div');
        pagesCont.className = 'currentPagesSwitcher';

        var prevPage = document.createElement('div');
        prevPage.className = 'prevPage';

        var nextPage = document.createElement('div');
        nextPage.className = 'nextPage';

        var currentPageInfo = document.createElement('div');
        currentPageInfo.className = 'currentPageInfo';

        var pagesControllers = document.createElement('div');
        pagesControllers.className = 'pagesControllers';

        var pagesInfo = document.createElement('div');
        pagesInfo.className = 'pagesInfo';

        pagesControllers.appendChild( prevPage );
        pagesControllers.appendChild( currentPageInfo );
        pagesControllers.appendChild( pagesInfo );
        pagesControllers.appendChild( nextPage );

        pagesCont.appendChild( pagesControllers );

        pagesListUser.appendChild( pagesCont );

        pagesListUser.style.width = ( window.innerWidth - 310 ) + 'px';

        var pagesListHorRuler = document.createElement('div');
        pagesListHorRuler.className = 'pagesListHorRuler';

        var pagesListHeader = document.createElement('div');
        pagesListHeader.className = 'pagesListHeader';

        pagesListUser.appendChild( pagesListHeader );
       // pagesListUser.appendChild( pagesListHorRuler );

        var pagesListContent = document.createElement('div');
        pagesListContent.className = 'pagesListContent';

        $('#pagesListUser').remove();
        document.body.appendChild( pagesListUser );

        prevPage.addEventListener('click', function( e ){

            e.stopPropagation();
            Editor.userProject.turnToPreviousView().then( function(){

                var pagesListUser = document.getElementById('pagesListUser');

                if( pagesListUser ){

                    if( Editor.userProject.getCurrentView().Pages[0].vacancy ){

                        $(pagesListUser).removeClass( 'noVacancy' );
                        $(pagesListUser).addClass( 'vacancy' );

                    }else {

                        $(pagesListUser).removeClass( 'vacancy' );
                        $(pagesListUser).addClass( 'noVacancy' );

                    }

                }

            });

        });

        nextPage.addEventListener('click', function( e ){

            e.stopPropagation();
            Editor.userProject.turnToNextView().then( function(  ){

                var pagesListUser = document.getElementById('pagesListUser');

                if( pagesListUser ){

                    if( Editor.userProject.getCurrentView().Pages[0].vacancy ){

                        $(pagesListUser).removeClass( 'noVacancy' );
                        $(pagesListUser).addClass( 'vacancy' );

                    }else {

                        $(pagesListUser).removeClass( 'vacancy' );
                        $(pagesListUser).addClass( 'noVacancy' );

                    }

                }

            });

        });


        pagesListUser.addEventListener('click', function( e ){

            e.stopPropagation();

            var Editor = this.editor;

            if( $(e.target).hasClass('userThemePage') ){

                Editor.webSocketControllers.userPage.useThemePage( Editor.stage.getPages()[0].userPage._id, e.target.getAttribute('theme-page-id'), function( data ){

                    Editor.template.updateProposedTemplates( data.themePage.proposedTemplates );
                    Editor.stage.getPages()[0].loadThemePage( data.themePage );
                    Editor.stage.getPages()[0].loadTemplate( data.proposedTemplate, data.usedImages  );

                });

            }

        }.bind( this ));

        /*
        for( var p=0; p < allPages.length; p++ ){

            var  themePageElem = document.createElement('div');
            themePageElem.className = 'themePageElem ' + ( ( allPages[p].vacancy ) ? 'vacancy' : 'noVacancy' );
            themePageElem.style.backgroundImage = 'url(' + allPages[p].url + ')';
            themePageElem.setAttribute('data-theme-page-id', allPages[p]._id );

            themePageElem.addEventListener('click', function( e ){

                Editor.webSocketControllers.userPage.useThemePage( Editor.stage.getPages()[0].userPage._id, this.getAttribute('data-theme-page-id'), function( data ){

                    Editor.stage.getPages()[0].loadThemePage( data.themePage );
                    Editor.stage.getPages()[0].loadTemplate( data.proposedTemplate, data.usedImages  );

                });


            });

            pagesListContent.appendChild( themePageElem );

        }
        */

        pagesListHeader.addEventListener('click' , function ( e ){

            e.stopPropagation();

            if( $('#pagesListUser').attr('isopen') == 'true' || $('#pagesListUser').attr('isopen') == undefined ){

                if( $('#viewsListUser').attr('isopen') == 'true' || $('#viewsListUser').attr('isopen') == undefined ){
                    $('#viewsListUser').attr('isopen', 'false' );

                    $('#viewsListUser').animate( { bottom: -110 }, function(){


                    });

                }else {

                    $('#pagesListUser').attr('isopen', 'false');
                    $( "#pagesListUser" ).animate( { bottom: -110 }, {

                        duration: 200,
                        step : function( topStep ){

                            _this.editor.template.resizeToUserObject();
                            _this.editor.stage.centerCameraYuser();

                        },
                        complete : function(){

                            _this.editor.template.resizeToUserObject();
                            _this.editor.stage.centerCameraYuser();

                        }

                    });

                }


            }else {

                $('#pagesListUser').attr('isopen', 'true');
                $( "#pagesListUser" ).animate( { bottom: 0 }, {

                    duration: 200,
                    step : function( topStep ){
                        _this.editor.template.resizeToUserObject();
                        _this.editor.stage.centerCameraYuser();

                    },
                    complete : function(){

                        _this.editor.template.resizeToUserObject();
                        _this.editor.stage.centerCameraYuser();

                    }

                });

            }

        });

        pagesListUser.appendChild( pagesListContent );
        ReactDOM.render( <Provider store={store}><UserPagePreview editor={ this.editor } container={this} /></Provider>, viewsListContent);
    }


    /**
    * Generuje box z narzędziami
    *
    * @method generateToolsBox
    * @param {String} type Typ toolsBoxa pro|ama
    */
    TemplateModule.prototype.generateToolsBox = function( type, info ){

        var tools = document.createElement('div');
        tools.id = 'toolsBox';
        tools.className = type + " displayController";
        tools.style.height = ( window.innerHeight - topMenuHeight ) + "px";
        //tools.style.width = (toolContentWidth + 60 ) + "px";

        var toolsContainer = document.createElement('div');
        toolsContainer.id = 'toolsContainer';

        var toolsContent = document.createElement('div');
        toolsContent.id = 'toolsContent';
        //toolsContent.style.width = toolContentWidth + "px";

        tools.appendChild( toolsContent );

        document.body.appendChild( tools );

        document.body.appendChild( this.generateTopMenu() );
        toolsContainer.appendChild( this.generateImagesTool( type ) );
        toolsContainer.appendChild( this.generateAttributesTool() );
        toolsContainer.appendChild( this.generateThemes() );
        toolsContainer.appendChild( this.generateProposedTemplates() );
        toolsContainer.appendChild( this.generateLayersTool() );
        toolsContainer.appendChild( this.generateCliparts() );
        this.generateUserViewsAndThemes();
        //Editor.generateAttributesOptions_Select_user();
        tools.appendChild( toolsContainer );

        var toolsContent_height = $('#toolsContent').height();

        $("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );

        this.updateProjectName();

        this.initToolBoxEvents();

    };

    TemplateModule.prototype.getTopMenuComponent = function(){

        return this.topMenuComponent;

    }

    TemplateModule.prototype.updateProjectName = function( name ){

        if( name ){
          //alert('USTAIWNIE 1: ' + name );
            ReactDOM.render( <ProjectNameComponent editor={this.editor} name={name}/>, document.getElementById('containerForName') );

        }else {

            var name = this.editor.userProject.getName();
            //alert('USTAIWNIE 2: ' + name );
            ReactDOM.render( <ProjectNameComponent editor={this.editor} name={name}/>, document.getElementById('containerForName') );

        }

    }

    TemplateModule.prototype.updateCliparts = function( cliparts ){

        

      for( var i=0; i < cliparts.length; i++ ){

        let obrazek = cliparts[i];

        var projectImage = new ProjectImage( obrazek.uid, obrazek._id );
        projectImage.editor = this.editor;
        projectImage.imageUrl = obrazek.imageUrl;
        this.editor.userProject.addClipart( projectImage );
        projectImage.initForUser( null, EDITOR_ENV.staticUrl+obrazek.minUrl, EDITOR_ENV.staticUrl+obrazek.thumbnail, obrazek.trueWidth, obrazek.trueHeight, obrazek.width, obrazek.height, this.editor.userProject.getImageCounter() );
        document.body.querySelector('.clipartsContainer').appendChild( projectImage.html );

        //Editor.webSocketControllers.userProject.addPhoto( projectImage.uid, Editor.userProject.getID(), files[actualFile].name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

      }

    }

    TemplateModule.prototype.generateCliparts = function(){

      var Editor = this.editor;

      var tool = document.createElement('div');
      tool.id = 'cliparts-container-tool';
      tool.className = 'tool closed';
      //tool.style.width = '1200px';

      var label = document.createElement('div');
      label.className = 'label cliparts';
      label.innerHTML = 'Kliparty';

      var containerButtons = document.createElement('div');
      containerButtons.className = 'containerButtons';
      containerButtons.appendChild( label );

      var proposedTemplateContainer = document.createElement('div');
      proposedTemplateContainer.className = 'clipartsContainer';

      var innerContainer = document.createElement('div');
      innerContainer.className = 'innerContainer';

      var toolButton = document.createElement('span');
      toolButton.id = 'cliparts-container-tool_button';
      toolButton.className = 'tool-button';
      toolButton.setAttribute('data-content', 'cliparts-content');

      tool.appendChild( toolButton );

      var toolContent = document.createElement('div');
      toolContent.id = 'cliparts-content';
      //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

      document.getElementById("toolsContent").appendChild( toolContent );

      toolContent.appendChild( containerButtons );
      toolContent.appendChild( proposedTemplateContainer );

      var toolHelper = document.createElement('span');
      toolHelper.className = 'toolHelper';
      toolHelper.innerHTML = '<i></i><span>Cliparty do wykorzystania</span>';

      tool.appendChild( toolHelper );

      $(proposedTemplateContainer).height(  $('#cliparts-content').height() - $(containerButtons).outerHeight() -10  );

      window.addEventListener('resize', function( e ){

          e.stopPropagation();

          $(proposedTemplateContainer).height(  $('#cliparts-content').height() - $(containerButtons).outerHeight() -10 );

      });

      proposedTemplateContainer.addEventListener('click', function( e ){

          e.stopPropagation();

          if( $(e.target).hasClass( 'proposedTemplateElement' ) ){

              Editor.webSocketControllers.userPage.setProposedTemplate(  Editor.userProject.getCurrentView().Pages[0]._id, e.target.getAttribute('id') );

          }

      });

      Ps.initialize( proposedTemplateContainer );

      return tool;

    }

    TemplateModule.prototype.generateProposedTemplates = function(){

        var Editor = this.editor;

        var tool = document.createElement('div');
        tool.id = 'proposedTemplate-container-tool';
        tool.className = 'tool closed';
        //tool.style.width = '1200px';

        var label = document.createElement('div');
        label.className = 'label proposedTemplates';
        label.innerHTML = 'Układy zdjęć';

        var containerButtons = document.createElement('div');
        containerButtons.className = 'containerButtons';
        containerButtons.appendChild( label );

        var proposedTemplateContainer = document.createElement('div');
        proposedTemplateContainer.className = 'proposedTemplateContainer';

        var innerContainer = document.createElement('div');
        innerContainer.className = 'innerContainer';

        var toolButton = document.createElement('span');
        toolButton.id = 'proposedTemplate-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'proposedTemplate-content');

        tool.appendChild( toolButton );

        var toolContent = document.createElement('div');
        toolContent.id = 'proposedTemplate-content';
        //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

        document.getElementById("toolsContent").appendChild( toolContent );

        toolContent.appendChild( containerButtons );
        toolContent.appendChild( proposedTemplateContainer );

        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Tutaj możesz zmienić układ zdjęć</span>';

        tool.appendChild( toolHelper );

        $(proposedTemplateContainer).height(  $('#proposedTemplate-content').height() - $(containerButtons).outerHeight() -10  );

        window.addEventListener('resize', function( e ){

            e.stopPropagation();

            $(proposedTemplateContainer).height(  $('#proposedTemplate-content').height() - $(containerButtons).outerHeight() -10 );

        });

        proposedTemplateContainer.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(e.target).hasClass( 'proposedTemplateElement' ) ){

                Editor.webSocketControllers.userPage.setProposedTemplate(  Editor.userProject.getCurrentView().Pages[0]._id, e.target.getAttribute('id') );

            }

        });

        Ps.initialize( proposedTemplateContainer );

        return tool;

    };

    /**
    * Generuje cały wygląd edytora
    *
    * @method generateEditor
    */
    TemplateModule.prototype.generateEditor = function( info, type ){

        if( info == 'complex' ){

            // tutaj beda ify na to czy edytor jest zaawansowany
            generateComplexToolsBox();
        }


        else if( info == 'simple' ) {

            // tutaj beda ify na to czy edytor jest zaawansowany
            this.generateToolsBox( type, info );



        }
        //generateThemes( info.themes );

    };


   /**
    * Generuje element motywów
    *
    * @method generateThemes
    * @param {Array} themes Tablica obiektów motywów
    */
    TemplateModule.prototype.generateThemes = function( themes ){

        var tool = document.createElement('div');
        tool.id = 'themes-container-tool';
        tool.className = 'tool closed';
        //tool.style.width = '1200px';

        var innerContainer = document.createElement('div');
        innerContainer.className = 'innerContainer';

        var toolButton = document.createElement('span');
        toolButton.id = 'themes-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'themes-content');

        tool.appendChild( toolButton );

        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Tutaj możesz wybrać motyw</span>';

        tool.appendChild( toolHelper );

        var toolContent = document.createElement('div');
        toolContent.id = 'themes-content';
        //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

        var themeContent =document.createElement('div');
        themeContent.id = 'themeContent';
        themeContent.className = 'themeContent';

        var themeContent_pages = document.createElement('div');
        themeContent_pages.className = 'themepages';
        themeContent_pages.id = 'themepages';

        themeContent.appendChild( themeContent_pages );

        var allThemes = document.createElement('div');
        allThemes.id = 'allProjectThemes';
        allThemes.className = 'allProjectThemes';

        var scrollAllThemes = document.createElement('div');
        scrollAllThemes.id = 'scrollAllThemes';

        scrollAllThemes.appendChild( allThemes );
        scrollAllThemes.appendChild( themeContent );

        var themesList = document.createElement('div');
        themesList.id = 'project-themes-list';
        themesList.className = 'all-theme-list';

        allThemes.appendChild( themesList );

        var themeName = document.createElement('div');
        themeName.className = 'currentThemeName';

        document.getElementById('toolsContent').appendChild( toolContent );

        toolContent.appendChild( scrollAllThemes );
        //toolContent.appendChild( themeContent );

        Ps.initialize( themesList );
        return tool;

    };



    /**
    * Generuje narzędzie dodawania zdjęć z pamięci komputera
    *
    * @method generateUploadButtons
    * @param {String} type Typ uploadButtons pro|ama
    */
    TemplateModule.prototype.generateUploadButtons = function ( uploadFunc ){

        var uploadButton = document.createElement('div');

        var projectImageVisibleUploader = document.createElement('div');
        var innerUploadContainer = document.createElement('div');


        projectImageVisibleUploader.id = 'projectImageVisibleUploader';
        projectImageVisibleUploader.className = 'button-fw absolutePos uploaderContent';
        projectImageVisibleUploader.innerHTML = 'DODAJ OBRAZY ';

        innerUploadContainer.id = 'innerUploadContainer';
        innerUploadContainer.className = 'uploadContainer';

        innerUploadContainer.appendChild( projectImageVisibleUploader );
        innerUploadContainer.appendChild( this.projectImageUploader( uploadFunc ) );

        uploadButton.appendChild( innerUploadContainer );

        return uploadButton;
    };

    TemplateModule.prototype.imageViewer = function( imageUrl ){

        var elem = document.createElement('div');
        elem.className = 'imageViewerBackground';

        var image = new Image( );

        image.onload = function(){

            elem.appendChild( image );

            elem.querySelector('img').style.top = (window.innerHeight - image.offsetHeight )/2 + 'px';
            elem.querySelector('img').style.left = (window.innerWidth - image.offsetWidth )/2 + 'px';

        }

        image.src = imageUrl;

        elem.addEventListener('click', function( e ){

            e.stopPropagation();

            elem.parentNode.removeChild( elem );

        });

        document.body.appendChild( elem );

    };

    TemplateModule.prototype.reorderImagesButton = function(){

        var Editor = this.editor;
        var elem = document.createElement('div');
        elem.className = 'reorderImagesButton';

        elem.addEventListener('click', function( e ){

            e.stopPropagation();

            var win = document.createElement('div');
            win.className = 'totalWhitePopUp';
            document.body.appendChild( win );

            var content = document.createElement('div');
            content.className = 'content';

            var header = document.createElement('h4');
            header.innerHTML = 'Ustaw zdjęcia w kolejności, potem użyj autouzupeniania';

            content.appendChild( header );

            win.appendChild( content );

            win.addEventListener('click', function( e ){

                if( $(e.target).hasClass('imageViewer') ){

                    var image = Editor.userProject.getProjectImage( ''+e.target.parentNode.getAttribute('uid') );

                    Editor.template.imageViewer( image.minUrl );

                }else if( $(e.target).hasClass('projectImage') || $(e.target).hasClass('projectImageContainer') || $(e.target).hasClass('imageMover') || $(e.target).hasClass('imageOrder') ){


                }else {

                    win.parentNode.removeChild( win );

                }

            });

            var imagesContainer = document.createElement('div');
            imagesContainer.className = 'projectImagesContainer';

            content.appendChild( imagesContainer );

            var images = Editor.userProject.getProjectImages();

            var _images = [];

            for( var key in images){

                _images.push( images[key] );

            }

            _images = _.sortBy( _images, 'imageOrder' );

            for( var i=0; i < _images.length; i++ ){

                var image = _images[i];

                imagesContainer.appendChild( image.getHTMLForSorting() );

            }

            $( imagesContainer ).sortable({

                stop : function( event ){

                    var elemArray = $( imagesContainer ).sortable("toArray", { attribute : 'uid' } );

                    Editor.webSocketControllers.userProject.sortProjectImages( elemArray, Editor.userProject.getID() );

                }

            });

            $( imagesContainer ).disableSelection();

        });

        return elem;

    };


    TemplateModule.prototype.usedNotUsedImagesSwaper = function(){

        var elem = document.createElement('div');

        elem.className = 'usedNotUsedSwaper allPhotos';

        elem.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(elem).hasClass('allPhotos') ){

                $(elem).removeClass('allPhotos');
                $(elem).addClass('displaynotUsedPhotos');
                $(document.getElementById('imagesList')).addClass('displaynotUsedPhotos');

            }else if( $(elem).hasClass('displaynotUsedPhotos') ){

                $(elem).removeClass('displaynotUsedPhotos');
                $(elem).addClass('allPhotos');
                $(document.getElementById('imagesList')).removeClass('displaynotUsedPhotos');

            }

        });

        return elem;

    };


    /**
    * Generuje narzędzie kontenera obrazków
    *
    * @method generateImagesTool
    * @param {String} type Typ toolsBoxa pro|ama
    */
    TemplateModule.prototype.generateImagesTool = function( type ){

        var tool = document.createElement('div');
        tool.id = 'image-container-tool';
        tool.className = 'tool closed';
        //tool.style.width = '1200px';

        var innerContainer = document.createElement('div');
        innerContainer.id = 'imagesContent';
        innerContainer.className = 'imagesInnerContainer';


        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać swoje zdjęcia</span>';

        tool.appendChild( toolHelper );


        var toolButton = document.createElement('span');
        toolButton.id = 'image-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'imagesContent');

        var fillImagesAutomatically = document.createElement('div');
        fillImagesAutomatically.className = 'button-fw autofill';
        fillImagesAutomatically.innerHTML = 'Auto uzupełnianie';

        var _this = this;

        fillImagesAutomatically.addEventListener('click', function( e ){

            e.stopPropagation();

            _this.editor.webSocketControllers.userProject.autoFill( _this.editor.userProject.getID(), function( data ){

                _this.editor.userProject.regenerateViewThumb();
                _this.editor.userProject.redrawView();
                //_this.editor.webSocketControllers.userProject.getProjectImagesUseNumber( _this.editor.userProject.getID() );
                /*
                _this.editor.webSocketControllers.userView.get( _this.editor.userProject.getCurrentView()._id, function( view_ ){

                    console.log( _this.editor.userProject.getCurrentView() );
                    console.log( view_ );
                    console.log('CO TO ZA WIDOK DO ZALADOWANIA???');
                    console.log('_____________+++++++++++++++++++++_____________');
                    _this.editor.userProject.initView( view_ );

                });
                */

            });

        });

        var imagesButtonsContainer = document.createElement('div');
        imagesButtonsContainer.className = 'containerButtons';

        imagesButtonsContainer.appendChild( this.generateUploadButtons( this.editor.services.userImagesUpload ) );
        imagesButtonsContainer.appendChild( this.generateColumnButtons() );
        imagesButtonsContainer.appendChild( fillImagesAutomatically );
        imagesButtonsContainer.appendChild( this.usedNotUsedImagesSwaper() );
        imagesButtonsContainer.appendChild( this.reorderImagesButton() );

        innerContainer.appendChild( imagesButtonsContainer );

        var imagesScrollContainer = document.createElement('div');
        imagesScrollContainer.id = 'imagesListScroll';


        var imagesList = document.createElement('div');
        imagesList.id = 'imagesList';
        imagesList.className = 'twoColumnsImages';

       imagesScrollContainer.appendChild(imagesList);


       innerContainer.addEventListener('dragover', function(e){

            //e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            if ( !(document.getElementById('imageDrop')) ) {
                this.createDragArea( innerContainer );
            }

        }.bind( this ), false);


        tool.appendChild( toolButton );
        tool.appendChild( innerContainer );

        var toolsContainer = document.getElementById("toolsContent");

        innerContainer.appendChild( imagesScrollContainer );

        var uploadInfos = this.miniatureAndUploadInfo();
        innerContainer.appendChild( uploadInfos );

        toolsContainer.appendChild( innerContainer );

        //Editor.template.createDragArea( innerContainer );
        Ps.initialize( imagesList );

        var imagesHeight = $('#imagesContent').height() - $(imagesButtonsContainer).outerHeight() - $(uploadInfos).outerHeight() - 20;
        $(imagesScrollContainer).height( imagesHeight );

        // wszystkie te eventy trzeba bedzie przeniesc do jednego
        window.addEventListener('resize', function( e ){

            var imagesHeight = $('#imagesContent').height() - $(imagesButtonsContainer).outerHeight() - $(uploadInfos).outerHeight() - 20;
            $(imagesScrollContainer).height( imagesHeight );

        });

        return tool;
    };

    TemplateModule.prototype.miniatureAndUploadInfo = function(){

        var Editor = this.editor;

        var elem = document.createElement('div');
        elem.id = 'imageLoaderInfo';

        var miniaturesInfo = document.createElement('div');
        miniaturesInfo.className = 'miniaturesInfo';

        var minTitle = document.createElement( 'span' );
        minTitle.className = 'title';
        minTitle.innerHTML = 'Wczytuję miniatury';

        miniaturesInfo.appendChild( minTitle );

        var minLoader = document.createElement('div');
        minLoader.className = 'uploadInfoLoader';

        var minProgress = document.createElement('div');
        minProgress.className = 'uploadInfoLoaderProgress';

        var minText = document.createElement('div');
        minText.className = 'uploadInfoLoaderText';

        minLoader.appendChild( minProgress );
        minLoader.appendChild( minText );
        miniaturesInfo.appendChild( minLoader );

        var uploadingInfo = document.createElement('div');
        uploadingInfo.className = 'uploadingInfo';

        var uplTitle = document.createElement('span');
        uplTitle.className = 'title';
        uplTitle.innerHTML = 'Zapisywanie zdjęć';

        var uplLoader = document.createElement('div');
        uplLoader.className = 'uploadInfoLoader';

        var uplProgress = document.createElement('div');
        uplProgress.className = 'uploadInfoLoaderProgress';

        var uplText = document.createElement('div');
        uplText.className = 'uploadInfoLoaderText';

        uplLoader.appendChild( uplProgress );
        uplLoader.appendChild( uplText );

        var uploadEstimation = document.createElement('div');
        uploadEstimation.className = 'estimation';

        uploadingInfo.appendChild( uplTitle );
        uploadingInfo.appendChild( uplLoader );
        uploadingInfo.appendChild( uploadEstimation );


        var projectInfos = document.createElement('div');
        projectInfos.className = 'projectPhotosInfos';

        var projectPhotosCounter = document.createElement('div');
        projectPhotosCounter.className = 'projectPhotosCounter';
        projectPhotosCounter.innerHTML = 'Zdjęć: 0';

        var projectNotUsedPhotosCounter = document.createElement('div');
        projectNotUsedPhotosCounter.className = 'projectNotUsedPhotosCounter';
        projectNotUsedPhotosCounter.innerHTML = 'Użytych: 0';

        projectInfos.appendChild( projectPhotosCounter );
        projectInfos.appendChild( projectNotUsedPhotosCounter );


        var allImagesRemover = document.createElement('div');
        allImagesRemover.innerHTML = 'Usuń wszystkie obrazy';
        allImagesRemover.className = 'button-fw allImagesRemover';

        allImagesRemover.addEventListener('click', function(){

            Editor.template.warningView(
                'Usunięcie zdjęć spowoduje wyczyszczenie projektu!',
                // ok
                function(){

                    Editor.webSocketControllers.userProject.removeAllImages( Editor.userProject.getID() );

                },
                //abort
                function(){

                }
            );

        });


        elem.appendChild( miniaturesInfo );
        elem.appendChild( uploadingInfo );
        elem.appendChild( projectInfos );
        elem.appendChild( allImagesRemover );

        return elem;

    };

    TemplateModule.prototype.projectImageUploader = function( uploadFunction ){

        var uploader = document.createElement('input');
        uploader.type = 'file';
        uploader.multiple = 'true';
        uploader.className = 'button-fw inputHidden absolutePos';

        uploader.onchange = function( e ){

            var files = this.files; // FileList object

            uploadFunction( files );

        };

        return uploader;

    };

    TemplateModule.prototype.imageLoader = function( dropBox ){
        var Editor=this.editor;
        if (dropBox){

            dropBox.addEventListener('drop', function(e){

                e.stopPropagation();
                e.preventDefault();

                Editor.services.userImagesUpload( e.dataTransfer.files  );

           });
        }
    };


    TemplateModule.prototype.createDragArea = function( element ){

        var imageDrop = document.createElement("DIV");
        imageDrop.id = 'imageDrop';
        imageDrop.dataset.type = "image";
        imageDrop.className = "imageDrop";


        if ( element ){
            element.appendChild( imageDrop );
        }

        this.editor.template.imageLoader( imageDrop  );


        imageDrop.addEventListener('drop', function( e ){

            e.stopPropagation();
            $('#imageDrop').remove();

        });

        imageDrop.addEventListener('dragleave', function( e ){

            e.stopPropagation();
            $('#imageDrop').remove();

        });



    };


     /**
    * Generuje przyciski do zmiany ilości wyświetlanych kolumn dla podglądu plików
    *
    * @method generateColumnButtons
    * @param {String} type Typ columnButton pro|ama
    */
    TemplateModule.prototype.generateColumnButtons = function( type ){

        var columnButton = document.createElement('div');

        var changePhotoColumns = document.createElement('div');
        changePhotoColumns.id = 'changePhotoColumns';
        changePhotoColumns.className = 'buttonscolumns';
        // changePhotoColumns.innerHTML = 'ILOść kolumn';

        var columnButtonsContainer = document.createElement('div');
        columnButtonsContainer.className = 'columnButtonsContainer';

        var change2PhotoColumns = document.createElement('div');
        change2PhotoColumns.className = 'button-2columns';

        change2PhotoColumns.addEventListener('click', function(){

            $("#imagesList").removeClass('photoItem');
            $("#imagesList").removeClass('twoColumnsImages');
            $("#imagesList").removeClass('threeColumnsImages');
            $("#imagesList").removeClass('sixColumnsImages');

            $("#imagesList").addClass("twoColumnsImages");

        });

        var change3PhotoColumns = document.createElement('div');
        change3PhotoColumns.className = 'button-3columns';

        change3PhotoColumns.addEventListener('click', function(){

            $("#imagesList").removeClass('photoItem');
            $("#imagesList").removeClass('twoColumnsImages');
            $("#imagesList").removeClass('threeColumnsImages');
            $("#imagesList").removeClass('sixColumnsImages');

            $("#imagesList").addClass("threeColumnsImages");

        });

        var change6PhotoColumns = document.createElement('div');
        change6PhotoColumns.className = 'button-6columns';

        change6PhotoColumns.addEventListener('click', function(){

            $("#imagesList").removeClass('photoItem');
            $("#imagesList").removeClass('twoColumnsImages');
            $("#imagesList").removeClass('threeColumnsImages');
            $("#imagesList").removeClass('sixColumnsImages');

            $("#imagesList").addClass("sixColumnsImages");

        });


        columnButtonsContainer.appendChild( change2PhotoColumns );
        columnButtonsContainer.appendChild( change3PhotoColumns );
        columnButtonsContainer.appendChild( change6PhotoColumns );


        changePhotoColumns.appendChild( columnButtonsContainer );

        columnButton.appendChild( changePhotoColumns );

        return columnButton;

    }

    /**
        * Generuje box z narzędziami
        *
        * @method generateTopMenu
        * @param {String} type Typ toolsBoxa pro|ama
        */
    TemplateModule.prototype.generateTopMenu = function(){

        var Editor = this.editor;
        var tool = document.createElement('div');
        tool.id = 'top-menu';
        tool.className = 'displayController';
        tool.style.height = topMenuHeight + "px";

        var useMagneticLines = document.createElement('div');
        useMagneticLines.id = 'useMagneticLines';
        useMagneticLines.className = 'rules_tools top_menu_icons off';

        useMagneticLines.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(this).hasClass('off') ){

                Editor.settings.magnetize = true;
                $(this).removeClass('off').addClass('on');

            }else {

                Editor.settings.magnetize = false;
                $(this).removeClass('on').addClass('off');

            }

        });


        var reactPlace = document.createElement('div');
        reactPlace.id = 'react-top-menu';
        tool.appendChild( reactPlace );

        this.topMenuComponent = ReactDOM.render( <TopMenu editor={ this.editor }/>,reactPlace);


        return tool;

    };

    /**
    * Generuje box rozszerzający narzędzia
    *
    * @method generateExtendedBoxMenu
    * @param {String} identify Typ ExtendedTopBox pro|ama
    */

    var generateExtendedBoxMenu = function( identify, editor ){

        editor.services.calculatePrice();

        var extendedBoxMenu = document.createElement('div');
        var boxContent = document.createElement('div');
        var borderFx = document.createElement('div');

        extendedBoxMenu.id = identify;
        extendedBoxMenu.className = 'extended_box_menu';
        boxContent.className = 'box_menu_content';
        borderFx.className = "border_fx2";

        boxContent.appendChild( borderFx );
        extendedBoxMenu.appendChild( boxContent );

        return extendedBoxMenu;

    }

    TemplateModule.prototype.displayAllPagesWithPhotos = function(){
        //Cleanup
        var elem = document.body.querySelector('.totalWhitePopUp');
        if(elem){
            elem.parentNode.removeChild( elem );
        }

        var Editor = this.editor;

        var _this = this;

        var win = document.createElement('div');
        win.className = 'totalWhitePopUp';
        document.body.appendChild( win );

        this.editor.webSocketControllers.userProject.getAllViews( Editor.userProject.getID(), function( project ){
        
            var currentPage = 0;
            var viewsContainer = document.createElement('div');
            viewsContainer.id = 'viewsContainerPopUp';

            for( var pro=0; pro < project.projects.length; pro++ ){

                let productTypeName = '';
                
                for( var key in _this.editor.productsNames ) {
                    
                    if( _this.editor.productsNames[key].indexOf( project.projects[pro].typeID ) > -1 ) {
                        productTypeName = key;
                        break;
                    }
    
                }

                let data = project.projects[pro];

                let projectContainer = document.createElement('div');
                projectContainer.className = 'project-container';
                projectContainer.setAttribute('project-id', data._id);

                let productName = document.createElement('div');
                productName.className = 'project-container-title';
                productName.innerHTML = productTypeName;

                projectContainer.appendChild( productName );

                data.Views = _.sortBy( data.Views, 'order' );

                for( var i=0; i < data.Views.length; i++ ){

                    var viewElem = document.createElement('div');
                    viewElem.setAttribute('data-id', data.Views[i]._id );
                    viewElem.className = 'viewElemFromPopUp' + ( ( data.Views[i].repeatable ) ? '':' notrepeatable' );

                    data.Views[i].Pages = _.sortBy( data.Views[i].Pages, 'order' );

                    var pagesValue = 0;

                    for( var pa=0; pa < data.Views[i].Pages.length; pa++ ){

                        pagesValue += data.Views[i].Pages[pa].pageValue;

                    }

                    viewElem.setAttribute('pages-value', pagesValue );

                    for( var p=0; p < data.Views[i].Pages.length; p++){

                        var pageElem = document.createElement('div');
                        pageElem.className = 'pageElemFromPopUp';
                        pageElem.setAttribute('data-id', data.Views[i].Pages[p]._id );
                        data.Views[i].Pages[p].UsedImages = _.sortBy( data.Views[i].Pages[p].UsedImages, 'order' );
                        data.Views[i].Pages[p].ProposedTemplate.ProposedImages = _.sortBy( data.Views[i].Pages[p].ProposedTemplate.ProposedImages, 'order' );

                        for( var pp=0; pp < data.Views[i].Pages[p].ProposedTemplate.ProposedImages.length; pp++ ){

                            var image = data.Views[i].Pages[p].ProposedTemplate.ProposedImages[pp].objectInside;

                            if( image ){

                                var imageElem = document.createElement('div');
                                imageElem.className = 'imageElemFromPopUp';
                                imageElem.setAttribute('proposed-id', data.Views[i].Pages[p].ProposedTemplate.ProposedImages[pp]._id );
                                imageElem.setAttribute('image-id', image._id );

                                var remover = document.createElement('div');
                                remover.className = 'imageRemover';

                                remover.addEventListener( 'click', function( e ){

                                    e.stopPropagation();

                                    var pageID = e.target.parentNode.parentNode.getAttribute('data-id');
                                    var imageID = e.target.parentNode.getAttribute('image-id');
                                    var proposedPositionID = e.target.parentNode.getAttribute('proposed-id');

                                    Editor.webSocketControllers.proposedImage.removeObjectInside( pageID, proposedPositionID );
                                    var elem = document.body.querySelector('.totalWhitePopUp');
                                    elem.parentNode.removeChild( elem );

                                    _this.displayAllPagesWithPhotos();

                                });
                                //Editor.webSocketControllers.userPage.removeUsedImage( editableArea.userPage._id, this.proposedPositionInstance.objectInside.dbID );

                                var imageInside = document.createElement('img');
                                imageInside.src = EDITOR_ENV.staticUrl+image.ProjectImage.thumbnail;
                                imageElem.appendChild( imageInside );
                                imageElem.appendChild( remover );

                                pageElem.appendChild( imageElem );

                            }else {

                                var proposedElem = document.createElement('div');
                                proposedElem.className = 'proposedElemPopUp';
                                proposedElem.addEventListener('click', function( e ){

                                    e.stopPropagation();

                                });
                                proposedElem.setAttribute( 'data-id', data.Views[i].Pages[p].ProposedTemplate.ProposedImages[pp]._id);
                                pageElem.appendChild( proposedElem );

                            }

                        }

                        var pageNumber = document.createElement('div');
                        pageNumber.className = "pageNumberPopUp";

                        pageNumber.innerHTML = ( currentPage ? (currentPage+1) + '-' + (currentPage+pagesValue) : ( ( pagesValue == 1 ) ? pagesValue : '1-'+ pagesValue ) );
                        currentPage += pagesValue;

                        pageElem.appendChild( pageNumber );

                        viewElem.appendChild( pageElem );

                        var bottomDiv = document.createElement('div');
                        bottomDiv.className = 'bottomDrag';

                        viewElem.appendChild( bottomDiv );


                        if( data.Views[i].repeatable ){

                            var turnToView = document.createElement('div');
                            turnToView.className = 'seeView';

                            turnToView.addEventListener('click', function( e ){

                                e.stopPropagation();

                                Editor.webSocketControllers.userView.get( e.target.parentNode.parentNode.getAttribute('data-id'), function( data ){

                                    win.parentNode.removeChild( win );
                                    Editor.userProject.initView( data );

                                });

                            });

                            bottomDiv.appendChild( turnToView );

                            var dragObject = document.createElement('div');
                            dragObject.className = 'dragObjectPopUp';
                            bottomDiv.appendChild( dragObject );

                            var remover = document.createElement('div');
                            remover.className = 'viewRemover';
                            bottomDiv.appendChild( remover );

                            remover.addEventListener('click', function( e ){

                                e.stopPropagation();
                                if (Editor.checkPagesCountConstraint({projectID:e.target.parentNode.parentNode.parentNode.getAttribute('project-id'),addRemove:'REMOVE'})){
                                    if( Editor.userProject.isPrevView() ){
                                        Editor.userProject.turnToPreviousView();
                                    }else if( Editor.userProject.isNextView() ){
                                        Editor.userProject.turnToNextView();
                                    }
                                    Editor.webSocketControllers.userProject.removeView( Editor.userProject.getID(), e.target.parentNode.parentNode.parentNode.getAttribute('project-id'), e.target.parentNode.parentNode.getAttribute('data-id'));
                                }
                                
                            });

                        }else {

                            var turnToView = document.createElement('div');
                            turnToView.className = 'seeView notrepeat';

                            turnToView.addEventListener('click', function( e ){

                                e.stopPropagation();

                                Editor.webSocketControllers.userView.get( e.target.parentNode.parentNode.getAttribute('data-id'), function( data ){

                                    win.parentNode.removeChild( win );
                                    Editor.userProject.initView( data );

                                });

                            });

                            bottomDiv.appendChild( turnToView );

                        }


                    }

                    projectContainer.appendChild( viewElem );

                }

                viewsContainer.appendChild( projectContainer );

            }

            var photosContainer = document.createElement('div');
            photosContainer.className = 'photosContainer';

            var photosContainerInner = document.createElement('div');
            photosContainerInner.className = 'photosContainerInner';

            var photosContainerButtons = document.createElement('div');
            photosContainerButtons.className = 'photosContainerButtons';

            var notUsedPhotos = document.createElement('div');
            notUsedPhotos.className = 'notUsedPhotos';

            var allPhotos = document.createElement('div');
            allPhotos.className = 'allPhotos active';

            var photosContent = document.createElement('div');
            photosContent.className = 'photosContent';

            photosContent.appendChild( photosContainerInner );

            photosContent.addEventListener('click', function( e ){

                e.stopPropagation();

            });

            allPhotos.addEventListener('click', function( e ){

                e.stopPropagation();

                $(photosContainerInner).removeClass('notUsed');

                $(this).addClass('active');
                $(notUsedPhotos).removeClass('active');

            });

            notUsedPhotos.addEventListener('click', function( e ){

                e.stopPropagation();

                $(photosContainerInner).addClass('notUsed');
                $(this).addClass('active');
                $(allPhotos).removeClass('active');

            });

            photosContainerButtons.appendChild( notUsedPhotos );
            photosContainerButtons.appendChild( allPhotos );

            photosContainer.appendChild( photosContainerButtons );
            photosContainer.appendChild( photosContent );

            photosContent.style.width = window.innerWidth - 110 + 'px';

            var images = Editor.userProject.getProjectImages();
            var imagesLength = 0;

            for( var key in images ){

                photosContainerInner.appendChild( images[key].getHTMLForSortingViews() );
                imagesLength++;

            }


            win.appendChild( viewsContainer );
            win.appendChild( photosContainer );

            photosContainerInner.style.width = imagesLength*104 + 'px';
            photosContainerInner.style.height =  photosContainer.offsetHeight + 'px';

            Ps.initialize( photosContainer,{

                useBothWheelAxes: true

            });

            function closeWin(e){

                e.stopPropagation();
                win.parentNode.removeChild( win );

            }

            var windowCloser = document.createElement('div');
            windowCloser.className = 'windowCloser';
            windowCloser.innerHTML = 'x';
            windowCloser.addEventListener( 'click', closeWin );

            win.appendChild( windowCloser );

            //win.addEventListener('click', closeWin );

            $('.photoElemPopUp').on('click', function( e ){

                e.stopPropagation();

            });

            $('.photoElemPopUp').draggable(
                {
                    appendTo: 'body',
                    start: function( event, ui ) {

                        event.stopPropagation();
                        //win.removeEventListener( 'click', closeWin );
                        $('.proposedElemPopUp').addClass('prepareToDrop');
                        $('.imageElemFromPopUp').append('<div class="dropLayer"></div>');

                    },
                    stop: function( event, ui ) {

                        event.stopPropagation();

                        if( $(event.originalEvent.target).hasClass('dropLayer') ){

                            var projectImageUID = event.target.getAttribute('data-uid');
                            var proposedPositionID = event.originalEvent.target.parentNode.getAttribute('proposed-id');
                            var pageID = event.originalEvent.target.parentNode.parentNode.getAttribute('data-id');

                            Editor.webSocketControllers.proposedImage.changeImage( proposedPositionID, projectImageUID, pageID );

                        }else {

                            var projectImageUID = event.target.getAttribute('data-uid');
                            var proposedPositionID = event.originalEvent.target.getAttribute('data-id');
                            var pageID = event.originalEvent.target.parentNode.getAttribute('data-id');
                            Editor.webSocketControllers.proposedImage.loadImage( proposedPositionID, projectImageUID, pageID );

                        }

                        $('.proposedElemPopUp').removeClass('prepareToDrop');
                        $('.imageElemFromPopUp').each( function(){

                            $(this).children('.dropLayer').remove();

                        }) ;
                        var elem = document.body.querySelector('.totalWhitePopUp');
                        elem.parentNode.removeChild( elem );

                        _this.displayAllPagesWithPhotos();
                    },
                    opacity: 0.7,
                    helper: "clone",
                    cursorAt: {left: -20, top: -20}
                }
            );

            $( '.project-container' ).sortable({

               items: '> div.viewElemFromPopUp:not(.notrepeatable)',

                stop : function( event ){

                   event.stopPropagation();
                   var sortedObjects = $(this).sortable( "toArray", { attribute : 'data-id' } );

                    var firstSortElemAttribute = sortedObjects[0];
                    var childs = this.childNodes;
                    var notRepeatableBefore = 0;

                    for( var i=1; i < childs.length; i++ ){

                        if( childs[i].getAttribute( 'data-id' ) == firstSortElemAttribute ){

                            break;

                        }else {

                            notRepeatableBefore++;

                        }

                    }

                    var sortTable = [];

                    for( var i=0; i < sortedObjects.length; i++ ){

                        var sortObject = {

                            viewID : sortedObjects[i],
                            order  : notRepeatableBefore+i

                        };

                        sortTable.push( sortObject );

                    }
                 
                    var _views = Editor.userProject.getViews();

                    // lokalna aktualizacja orderw, powinna byc po otrzymaniu callbackow...
                    for( var i=0; i < sortTable.length; i++ ){

                        var newViewsOrder = sortTable[i];

                        var view = _views.find((v)=>v._id === newViewsOrder.viewID);
                        if(!view){
                            console.error('Nie ma widoku')
                        }else{
                            view.order = newViewsOrder.order;
                        }
                    }

                    Editor.userProject.sortViews();
                    // sortowanie, ale w obrębie danego projektu
                    Editor.webSocketControllers.userProject.setViewsOrders( $(this).attr('project-id'), sortTable );
                    var elem = document.body.querySelector('.totalWhitePopUp');
                    elem.parentNode.removeChild( elem );

                    _this.displayAllPagesWithPhotos();
                }

            });

            /*
            $('.pageElemFromPopUp').sortable({

                connectWith: ".pageElemFromPopUp",
                items: '> *:not(.pageNumberPopUp)',

                stop : function( event, ui ){

                    if( event.target.parentNode.hasClass('notrepeatable') && event.target.children.length-1 == 2 ){

                        $(this).sortable("cancel");

                    }else {

                        event.stopPropagation();
                        console.log( event.target );
                        console.log( event.originalEvent.target.parentNode );
                        console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');

                    }


                },


            });
            */

        });

    }

    TemplateModule.prototype.resizeToUserObject = function ( obj ){

        var scaleX = 1;
        var scaleY = 1;
        var tmpX = this.editor.getStage().scaleX;
        var tmpY = this.editor.getStage().scaleY;
        var margin = 110;
        var offset = 80;
        var offsetX = 431 + 80 ; //pasek z boku (nasze menu narzędzi) + przycisk zmiany pozycji proponowanych

        if( document.getElementById('viewsListUser').getAttribute('isopen') == 'true' || document.getElementById('pagesListUser').getAttribute('isopen') == 'true' ){

            var offsetY = margin+parseInt($('#viewsListUser').height()) ; //105 rozmiar paska na dole + przyciski zmiany stron

        }else {

            if( parseInt($('#viewsListUser').css('bottom')) > parseInt($('#pagesListUser').css('bottom')) ){

                var offsetY = margin+parseInt($('#viewsListUser').height()) + parseInt($('#viewsListUser').css('bottom'))

            }else {

                var offsetY = margin+parseInt($('#pagesListUser').height()) + parseInt($('#pagesListUser').css('bottom'))

            }

        }

        var destinationMaxWidth = this.editor.getCanvas().width() - offsetX;
        var destinationMaxHeight = this.editor.getCanvas().height() - offsetY;

        var newScale = destinationMaxWidth / this.editor.getStage().getBounds().width;

        if ( destinationMaxHeight < ( this.editor.getStage().getBounds().height * newScale ) ) {

            newScale =  destinationMaxHeight  / this.editor.getStage().getBounds().height;

        }

        this.editor.getStage().scaleX = newScale;
        this.editor.getStage().scaleY = newScale;

        this.editor.stage.centerCameraXuser();
        this.editor.stage.centerCameraYuser();

    };

export { TemplateModule };

//Editor.template.alertFunction();
