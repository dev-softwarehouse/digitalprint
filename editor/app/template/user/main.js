
    /**
    * Moduł zarządzający wyglądem edytora, odpowiada za stworzenie odpowiednich bloków, nie są one tutaj uzupełniane.
    * Tym zajmuje się templateAdministration
    *
    * @module templateModule_admin
    */
    var templateModule = (function(){


        var menuDuration = 500;
        var helperDuration = 300;

        /**
        * Generuje cały wygląd edytora
        *
        * @method generateEditor
        */
        var generateEditor = function( info, type ){

            generateToolsBox( type, info );
            generateThemes( info.themes );

        };


        /**
        * Generuje box z narzędziami
        *
        * @method generateTopMenu
        * @param {String} type Typ toolsBoxa pro|ama
        */
        var generateTopMenu = function(){


            var tool = document.createElement('div');
            tool.id = 'top-menu';

            var addVerticalRuller = document.createElement('div');
            addVerticalRuller.className = "ruller-vertical tools-rooler";

            addVerticalRuller.innerHTML = "Vertical";

            addVerticalRuller.addEventListener('click', function(){

                var verticalRuller = new Editor.EditorRullerHelper_Vertical();
                Editor.stage.getToolsLayer().addChild( verticalRuller );

            });


            var addHorizontalRuller = document.createElement('div');
            addHorizontalRuller.className = "ruller-horizontal tools-rooler";
            addHorizontalRuller.innerHTML = 'Horizontal';

            addHorizontalRuller.addEventListener('click', function(){

                var horizontalRuller = new Editor.EditorRullerHelper_Horizontal();
                Editor.stage.getToolsLayer().addChild( horizontalRuller );

            });

            tool.appendChild( addVerticalRuller );
            tool.appendChild( addHorizontalRuller );

            return tool;

        };

        var initToolBoxEvents = function(){

            $(".tool-button").on('click', function(){

                $('#toolsContent > *').removeClass('active-tool-content');

                if( $(this).hasClass('active') ){

                        $("#toolsBox").removeClass('open').animate( {'left' : -340}, menuDuration );
                        $(this).removeClass('active');

                }
                else {

                    $(".tool-button").removeClass('active');

                    var contentID = $(this).attr('data-content');

                    $("#"+ contentID).addClass('active-tool-content');

                    if( !$("#toolsBox").hasClass('open') ){

                        $("#toolsBox").addClass('open').animate( {'left' : 0}, menuDuration );

                    }

                    $(this).addClass('active');

                }

            });

        };



        /**
        * Generuje box z narzędziami
        *
        * @method generateToolsBox
        * @param {String} type Typ toolsBoxa pro|ama
        */
        var generateToolsBox = function( type, info ){

            var tools = document.createElement('div');
            tools.id = 'toolsBox';
            tools.className = type;

            var toolsContainer = document.createElement('div');
            toolsContainer.id = 'toolsContainer';

            var toolsContent = document.createElement('div');
            toolsContent.id = 'toolsContent';

            tools.appendChild( toolsContent );

            document.body.appendChild( tools );
            document.body.appendChild( generateTopMenu() );

            toolsContainer.appendChild( generateAttributesTool() );
            toolsContainer.appendChild( generateThemes() );
            toolsContainer.appendChild( generateViews( info.views ) );
            toolsContainer.appendChild( generateProposedTemplates() );
            toolsContainer.appendChild( generateImagesTool( type ) );
            toolsContainer.appendChild( generateTextTool() );
            toolsContainer.appendChild( generateProposedPositionTool() );

            tools.appendChild( toolsContainer );

            initToolBoxEvents();

        };


        /**
        * Generuje narzędzie zmiany widoków
        *
        * @method generateViewsTool
        */
        var generateViewsTool = function(){

            var tool = document.createElement('div');
            tool.id = 'views-tool';
            tool.innerHTML = "<span id='prev-view'>Poprzednia strona</span><span id='next-view'>Następna Strona</span>";

            document.body.appendChild( tool );

        };


        /**
        * Generuje narzędzie dodawania atrybutów do widoku
        *
        * @method generateAddAttributesTool
        */
        var generateAddAttributesTool = function(){

            overlayBlock();

        };



        var overlayBlock = function( content, size ){

            var tool = document.createElement('div');
            tool.className = 'overlay';

            var toolContent = document.createElement('div');
            toolContent.className = 'overlay-content-' + size ;

            toolContent.addEventListener('click', function(e){

                e.stopPropagation();

            });

            tool.appendChild( toolContent );

            if( content ){
                toolContent.appendChild( content );
            }

            document.body.appendChild( tool );

            tool.addEventListener('click', function(){

                document.body.removeChild( this );

            });

        };


        /**
        * Generuje narzędzie warstw atrybutów
        *
        * @method generateAttributesTool
        */
        var generateAttributesTool = function(){

            

            var tool = document.createElement('div');
            tool.id = 'attributes-tool';
            tool.className = 'tool closed';

            var toolButton = document.createElement('span');
            toolButton.id = 'attributes-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content','attributes-content');

            tool.appendChild( toolButton );

            var toolContent = document.createElement('div');
            toolContent.id = 'attributes-content';
            document.getElementById('toolsContent').appendChild( toolContent );

            // miejsce na atrybuty produktu
            var productAttributes = document.createElement('div');
            productAttributes.id = 'product-attributes';
            toolContent.appendChild( productAttributes );

            // miejsce na baze widoku
            var baseViewLayer = document.createElement('div');
            baseViewLayer.id = 'baseViewLayer';
            toolContent.appendChild( baseViewLayer );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować widoki produktu</span>';

            tool.appendChild( toolHelper );

            var toolContentButtons = document.createElement('div');
            toolContentButtons.className = 'function-buttons';
            toolContentButtons.innerHTML = '<span>Generuj wszystke przypadki</span>';

            var addAttributesCase = document.createElement('span');
            addAttributesCase.id = 'addAttributesCase';
            addAttributesCase.innerHTML = 'Dodaj przypadek atrybutów';
            addAttributesCase.addEventListener('click', function(){

                $.ajax( {
                    url: 'http://api.digitalprint9.pro/ps_types/'+ Editor.getProductId()+'/ps_product_options/forEditor/',
                    success: function(data){

                        //console.log('ATRYBUTY');
                        //console.log( Editor.generateAttributesOptions_Select() );
                        generateAddAttributesTool();

                    }

                });

            });

            toolContentButtons.appendChild( addAttributesCase );

            toolContent.appendChild( toolContentButtons );


            return tool;

        };


        var generateProposedPositionTool = function(){

            var tool = document.createElement('div');
            tool.id = 'proposedTemplate-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'proposedTemplate-tool_button';
            toolButton.className = 'tool-button';

            tool.appendChild( toolButton );

            toolButton.addEventListener('click', function(){

                //console.log("TEST");
                //console.log( Editor.getProjectId() );
                if( $("#editablePlane_panel").length == 0 ){
                    $('body').append("<div id='editablePlane_panel' class='ui-widget-content'><div class='draggblock ui-widget-header'>Obiekt edycji<span class='exit'>x</span></div><div class='window_content'><label>Nazwa: <input type='text' id='editable_plane_name'/></label><br><br>Rozmiar:<br><label>szer: <input type='text' id='editable_plane_width' /></label><label>wys: <input type='text' id='editable_plane_height'></label><br><label>spad: <input type='text' id='editable_plane_slope'/></label><br><span class='button' id='addPlane'>Dodaj obiekt</div></div></div>");

                    $("#editablePlane_panel .exit").on('click', function(){
                        $("#editablePlane_panel").animate({ opacity: .0},300, function(){
                            $("#editablePlane_panel").remove();
                        });
                    });
                    $("#editablePlane_panel").draggable({ handle: "div.draggblock"});
                    $('#editablePlane_panel, .draggblock').disableSelection();

                    $("#addPlane").on( 'click', function(){

                        //console.log("TUtaj tez jest");
                        var test2 = new Editor.EditableArea($("#editable_plane_name").val(), parseFloat($("#editable_plane_width").val()), parseFloat($("#editable_plane_height").val()), null,  parseFloat($("#editable_plane_slope").val()));
                        test2.init();
                        Editor.adminProject.view.addPage( test2 );

                    });
                }

            });


            return tool;

        };


        /**
        * Generuje narzędzie dodawania tekstu
        *
        * @method generateTextTool
        */
        var generateTextTool = function(){

            var tool = document.createElement('div');
            tool.id = 'text-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'text-container-tool_button';
            toolButton.className = 'tool-button';

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać tekst</span>';

            tool.appendChild( toolHelper );

             $(toolButton).on('click', function(){

                var object = new Editor.Text2( 'jaja', 50, 200, 50, false, true );
                object.init( 50, false );
                object.generateCursorMap();

                Editor.stage.getPages();
                _this.editableAreaInstance.userLayer.addObject( object );
                object.center();

            });


            return tool;

        };


        /**
        * Generuje narzędzie kontenera obrazków
        *
        * @method generateImagesTool
        * @param {String} type Typ toolsBoxa pro|ama
        */
        var generateImagesTool = function( type ){

            var tool = document.createElement('div');
            tool.id = 'image-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.id = 'imagesContent';

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać swoje zdjęcia</span>';

            tool.appendChild( toolHelper );


            var dropElement = document.createElement('div');
            dropElement.id = 'image-container-tool_dropArea';
            dropElement.innerHTML = "<img src='images/images-tool-large.png'/>PRZECIĄGNIJ I UPUŚĆ<br>lub<span class='image-loader'>wgraj z dysku</span>";


            dropElement.addEventListener('dragover', function(e){
                //e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';

            }, false);

            dropElement.addEventListener('drop', function(e){

                //e.stopPropagation();
                e.preventDefault();
                Editor.handleFileSelect(e, 2);

            }, false);



            var toolButton = document.createElement('span');
            toolButton.id = 'image-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'imagesContent');


            var imagesList = document.createElement('div');
            imagesList.id = 'imagesList';

            tool.appendChild( toolButton );
            tool.appendChild( innerContainer );

            var toolsContainer = document.getElementById("toolsContent");

            toolsContainer.appendChild( innerContainer );

            innerContainer.appendChild(dropElement);
            innerContainer.appendChild(imagesList);

            return tool;

        };


        /**
        * Generuje element widoków projektu
        *
        * @method generateViews
        * @param {Array} views Tablica obiektów widoków
        */
        var generateViews = function( views ){

            var tool = document.createElement('div');
            tool.id = 'views-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';


            var toolButton = document.createElement('span');
            toolButton.id = 'views-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'views-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować widoki produktu</span>';

            tool.appendChild( toolHelper );
            // views content
            var toolContent = document.createElement('div');
            toolContent.id = 'views-content';


            var viewsList = document.createElement('ul');
            viewsList.id = 'views-list';

            toolContent.appendChild( viewsList );

            // przyciski w kontencie
            var toolContentButtons = document.createElement('div');
            toolContentButtons.id = 'views-content-buttons';


            var addNewView_button = document.createElement('span');
            addNewView_button.id = 'addNewView';
            addNewView_button.innerHTML = "Stwórz kolejny widok";

            addNewView_button.addEventListener('click', function(){

                var viewForm = document.createElement( 'div' );

                var viewForm_Name = document.createElement( 'input' );
                viewForm_Name.className = 'default-input';
                viewForm_Name.name = 'viewName';

                var viewForm_Name_Label = document.createElement('label');
                viewForm_Name_Label.innerHTML = 'Nazwa nowego widoku:';
                viewForm_Name_Label.appendChild( viewForm_Name);

                var viewForm_Save = document.createElement( 'span' );
                viewForm_Save.innerHTML = "Dodaj nowy widok";
                viewForm_Save.className = 'default-accept';

                viewForm.appendChild( viewForm_Name_Label );
                viewForm.appendChild( viewForm_Save );

                overlayBlock( viewForm );

                viewForm_Save.addEventListener('click', function(){

                    var viewsLength = Editor.adminProject.getViews().length;

                    alert('ilosc widoków ' + viewsLength);

                    var newView  = Editor.adminProject.addView( { name : $("input[name=viewName]").val(), order : viewsLength } );

                    newView.then( function( data ){

                        alert('widok dodany pomyslnie');
                        //console.log( "informacja zwrotna o dodanym widoku" );
                        //console.log( data );

                        var promise = Editor.adminProject.loadViews();

                        promise.then( function( data ){

                            Editor.templateAdministaration.updateViews( data );

                        }, function(){});



                    }, function(){

                        alert('widok nie bedzie dodany');

                    });


                });


                Editor.stage.resetScene();


            });
            toolContentButtons.appendChild( addNewView_button );


            // dodanie przycisków
            toolContent.appendChild( toolContentButtons );

            var toolsContainer = document.getElementById("toolsContent");
            toolsContainer.appendChild( toolContent );


            // programowanie przycisku views
            toolButton.addEventListener('click', function(){



            });

            //funkcje inicjalizujące
            return tool;

        };


        /**
        * Generuje element szablonów dla danego motywu
        *
        * @method generateProposedTemplates
        * @param {int} theme_page id strony motywu
        */
        var generateProposedTemplates = function( theme_page ){

            var tool = document.createElement('div');
            tool.id = 'proposedTemplate-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'proposedTemplate-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'proposedTemplate-content');

            tool.appendChild( toolButton );

            var toolContent = document.createElement('div');
            toolContent.id = 'proposedTemplate-content';
            toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

            document.getElementById("toolsContent").appendChild( toolContent );

            // tworzenie obiektu pozwalającego dodać szablon pozycji dla danego motywu
            var addProposedTemplates = document.createElement("span");
            addProposedTemplates.id = 'addProposedTemplate';
            addProposedTemplates.className = 'add';
            addProposedTemplates.innerHTML = "Dodaj gotowy szablon";

            addProposedTemplates.addEventListener('click', function(){

                alert('musze pobrać informacje z bazy danych');

                Editor.proposedTemplates.getProposedTemplates();


            });

            toolContent.appendChild( addProposedTemplates );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz zmienić układ zdjęć</span>';

            tool.appendChild( toolHelper );


            return tool;

        };


        /**
        * Generuje element motywów
        *
        * @method generateThemes
        * @param {Array} themes Tablica obiektów motywów
        */
        var generateThemes = function( themes ){

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
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować motywy</span>';

            tool.appendChild( toolHelper );

            var toolContent = document.createElement('div');
            toolContent.id = 'themes-content';
            //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";


            var themesList = document.createElement('div');
            themesList.id = 'project-themes-list';

            toolContent.appendChild( themesList );


            var addCreatedTheme = document.createElement('span');
            addCreatedTheme.id = 'addCreatedTheme';
            addCreatedTheme.className = 'add';
            addCreatedTheme.innerHTML = 'Dodaj juz gotowy motyw';

            toolContent.appendChild( addCreatedTheme );

            // tworzenie obiektu pozwalającego dodać szablon pozycji dla danego motywu
            var addTheme = document.createElement("span");
            addTheme.id = 'addNewTheme';
            addTheme.className = 'add';
            addTheme.innerHTML = "Dodaj motyw";

            toolContent.appendChild( addTheme );


            // tworzenie obiektu pozwalającego dodać juz istniejacy motywa i go zmodyfikować
            var useTheme = document.createElement("span");
            useTheme.id = 'useTheme';
            useTheme.className = 'add';
            useTheme.innerHTML = "Użyj gotowego motywu";

            toolContent.appendChild( addTheme );


            addCreatedTheme.addEventListener('click', function(){

                allThemesWindow();

            });


            addTheme.addEventListener('click', function(){

                alert('trzeba zaprojektować okno widoku');
                newThemeWindow();

            });


            document.getElementById('toolsContent').appendChild( toolContent );


            return tool;


        };


        var allThemesWindow = function(){


            var themeLoader = Editor.serwerControler.getMainThemes();

            themeLoader.then(

                function( data ){

                    //console.log( data );


                    var content = document.createElement('ul');
                    content.className = 'all-theme-list';

                    for( var i=0; i < data.length; i++ ){

                        var themeTitle = document.createElement('span');
                        themeTitle.className = 'themeName';
                        themeTitle.innerHTML = data[i].name;

                        var li = document.createElement('li');
                        li.appendChild( themeTitle );

                        li.setAttribute( 'data-theme-id', data[i].id );

                        li.addEventListener('click', function( e ){

                            //console.log( this.getAttribute('data-theme-id') );
                            alert('kopiuje motyw do projektu');
                            Editor.adminProject.copyTheme( this.getAttribute('data-theme-id') );

                        });

                        content.appendChild(li);
                        Ps.initialize ( content );

                    }

                    overlayBlock( content, 'big');

                },

                function( data ){

                    alert('Niemozna pobrać gotowych szablonów');

                }

            );


        };




        // trzeba przniesc do modułu 'windows'
        var newThemeWindow = function(){

            alert('dodaje okno');

            var content = document.createElement('div');
            content.className = 'newThemeWindow-content';

            var dropBox = document.createElement('div');
            dropBox.className = 'image-drop';

            var form = document.createElement('div');
            form.className = 'form';

            var name = document.createElement('input');
            name.name = 'themeName';

            var category = document.createElement('select');

            var save = document.createElement('span');
            save.className = 'content-button';
            save.innerHTML = 'Zapisz';

            save.addEventListener('click', function( ){

                var saveTheme = Editor.serwerControler.addMainTheme( name.value, '', '' );
                saveTheme.then(

                    function( data ){

                        alert('zapisano');

                    },

                    function( data ){

                        alert('nie zapisano');

                    }

                );

            });

            content.appendChild( dropBox );
            content.appendChild( name );
            content.appendChild( category );
            content.appendChild( save );

            overlayBlock( content, 'normal' );

        };

        var fotoLoader = function(  ){

            var loader = document.createElement('div');
            loader.id='image-loader';

            document.body.appendChild( loader );

        };

        return {

            generateViews  : generateViews,
            generateEditor : generateEditor,
            generateThemes : generateThemes,
            overlayBlock   : overlayBlock,
            fotoLoader : fotoLoader

        };


    })();

    export var template = templateModule;
