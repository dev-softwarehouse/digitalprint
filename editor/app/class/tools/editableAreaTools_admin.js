import {ProposedPosition2} from './../ProposedPosition2';
import {Text2} from './../Text2';
import {Bitmap} from './../EditorBitmap';

	/**
	* Klasa odpowiadająca za boks z narzędziami do edytowalnego obiektu
	*
	* @class EditableAreaTool
	* @constructor
	*/
	function EditableAreaTool( editableAreaInstance, tools, defaultValues ){

		this.editableAreaInstance = editableAreaInstance;
		this.boxes = {};
        this.element = null;

        this.editor = editableAreaInstance.editor;

		if( tools == null )
			this.initAllTools();

	};


	var p = EditableAreaTool.prototype = new createjs.EventDispatcher();
	p.constructor = EditableAreaTool;

    p.createAddTextOption = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = "text-optionTool tool";
        //tool.innerHTML = 'B';

        tool.addEventListener('click', function(){

           // alert('proba dodania opcji tekstowej');

        });

        return tool;

    };

    p.updateFormatInfo = function(){
        var _this = this;
        var Editor = this.editor;

        var tool = document.createElement('span');
        tool.className = "update-format layer-tool tool";
        //tool.innerHTML = 'B';

        tool.addEventListener('click', function(){

            var formatInfo = Editor.productFlatData[0].products[0].formats[ "" + Editor.getURLParameters()['formatID'] ]
    
            var updateData = {
                formatID: formatInfo.ID,
                width: formatInfo.width,
                height: formatInfo.height,
                slope: formatInfo.slope
            }

            Editor.webSocketControllers.format.update( updateData );

        });

        tool.appendChild( Editor.template.createToolhelper ("Aktualizowanie formatu") );

        return tool;

    }

    p.createBackgroundController = function(){

        var _this = this;
        var Editor = this.editor;

        var tool = document.createElement('span');
        tool.className = "background-controller layer-tool tool";
        //tool.innerHTML = 'B';

        tool.addEventListener('click', function(){

            _this.editableAreaInstance.backgroundLayer.visible = ( _this.editableAreaInstance.backgroundLayer.visible ) ? false : true;

        });

        tool.appendChild( Editor.template.createToolhelper ("Warstwa tła (Ukryj/Pokaż)") );

        return tool;


    };


    p.automaticThemePageFit = function(){

        var tool = document.createElement('div');
        tool.id = 'automaticThemeFit';
        tool.className = "layer-tool tool";
        //tool.innerHTML = 'Automatyczne dopasowanie strony motywu';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();
            //alert( 'automatyczne dopasowanie strony' );

        });

        tool.appendChild( this.editor.template.createToolhelper ("Automatyczne dopasowanie strony motywu") );
        return tool;

    };


    p.pageSettings = function( data ){

        var tool = document.createElement('div');
        tool.id = 'pageSettings';
       tool.className = "layer-tool tool";

    };

    p.createSettingsTool = function(){

        var _this = this;

        var tool = document.createElement('span');
        tool.className = "layer-tool tool";
        tool.id = 'createSettingsTool';
       // tool.innerHTML = 'Ustawienia';

        tool.addEventListener('click', function(){

            _this.editor.template.editableAreaConfig( _this.editableAreaInstance);

        });

        tool.appendChild( this.editor.template.createToolhelper ("Ustawienia obszaru roboczego") );
        return tool;

    };


    p.displayPageOptions = function( themePage ){



    };


    p.createThemeSettingsTool = function(){

        var _this = this;

        var tool = document.createElement('span');
        tool.className = "layer-tool tool";
        tool.id = 'createThemeSettingsTool';
       // tool.innerHTML = 'Ustawienia';

        tool.addEventListener('click', function(){

            _this.editor.template.themePageSettings( _this.editor.adminProject.format.view.page.themePage.getObject() );

        });

        tool.appendChild( this.editor.template.createToolhelper ("Ustawienia strony motywu") );
        return tool;

    };


    p.createUpdateThemePage = function(){

        var area = this.editableAreaInstance;
        var Editor = this.editor;
        var button = document.createElement('div');
        button.className = "layer-tool tool";
        button.id = 'createUpdateThemePage';
       // button.innerHTML = 'Aktualizuj stronę motywu';

        button.addEventListener('click', function(){


        var image = Editor.tools.theme.generateThemePagePreview( area.width, area.height, area.backgroundLayer.children , area.foregroundLayer.children, false, function( image ){

            var updatedThemePage = {

                url : image

            };

            Editor.template.updateThemeTemplate( Editor.adminProject.format.view.page.themePage.getInfo(), updatedThemePage );

            });


        });

        button.appendChild( Editor.template.createToolhelper ('Aktualizacja strony motywu') );
        return button;

    };


    p.loadPageTheme = function( data ){

        var _this = this;

        var tool = document.createElement('div');
      //  tool.innerHTML = 'Załaduj Motyw';
        tool.className = 'tools-loadPage layer-tool tool';


        tool.addEventListener('click', function(){
            var themeId = _this.editor.adminProject.theme.getThemeId();

            $.ajax({

                url : _this.editor.currentUrl + 'theme/' + themeId,
                type: 'GET',
                crossDomain : true,
                success : function( data ){

                    //console.log('wczytuje widoki');
                    //console.log( data );

                    var content = document.createElement('div');
                    content.innerHTML = 'EDYCJA MOTYWU';

                    var themePages = document.createElement('ul');
                    themePages.className = 'theme-pages-list';

                    for( var i=0; i < data.page_themes.length; i++ ){

                        var themePage = document.createElement('li');
                        themePage.setAttribute('data-themePage-id', data.page_themes[i].id );

                        var themePageName = document.createElement('span');
                        themePageName.className = 'themePageName';
                        themePageName.innerHTML = data.page_themes[i].name;

                        var themePageProposedPositions = document.createElement('span');
                        themePageProposedPositions.innerHTML = 'Edytuj pozycje proponowane';
                        themePageProposedPositions.className = 'proposedPositionEdit';

                        if( data.page_themes[i].minImgUrl ){
                            themePage.innerHTML = '<img src="'+data.page_themes[i].minImgUrl+'"/>';
                        }

                        themePage.appendChild( themePageName );
                        themePage.appendChild( themePageProposedPositions );

                        themePage.addEventListener('click', function(){

                            var themePageId = this.getAttribute('data-themePage-id');
                            _this.editableAreaInstance.loadPageTheme( themePageId );

                        });

                        themePages.appendChild( themePage );

                    }

                    content.appendChild( themePages );

                    //console.log( data );
                    _this.editor.template.overlayBlock( content, 'big' );
                },
                error : function( data ){

                    console.log('error podczas wczytywania pageViews');
                    //console.log( data );

                }

            });

        });

        tool.appendChild( this.editor.template.createToolhelper () );
        return tool;

    };


    p.regenerateMiniature = function(){

        var area = this.editableAreaInstance;
        var Editor = this.editor;
        var button = document.createElement('div');
        button.id = 'regenerateMiniature';
        button.className = 'layer-tool tool';
      //  button.innerHTML = 'Regeneruj miniaturke';

        button.addEventListener('click', function(){

            var image = Editor.tools.theme.generateThemePagePreview( area.width, area.height, area.backgroundLayer.children , area.foregroundLayer.children, true );
            Editor.webSocketControllers.themePage.updateImage( Editor.adminProject.format.view.page.themePage.getID(), image );

        });
        button.appendChild( Editor.template.createToolhelper ('Załaduj Motyw') );
        return button;

    };


    p.saveThemePage = function(){

        var Editor = this.editor;
        var area = this.editableAreaInstance;
        var button = document.createElement('div');
        button.id = 'saveThemePage';
        button.className = 'layer-tool tool';
        //button.innerHTML = 'STP';

        button.addEventListener('click', function(){

            var _backgroundObjects = area.backgroundLayer.children;
            var backgroundObjects = [];

            var _foregroundObjects = area.foregroundLayer.children;
            var foregroundObjects = [];

            for( var i=0; i < _backgroundObjects.length; i++ ){

                if( _backgroundObjects[i] instanceof Bitmap || _backgroundObjects[i] instanceof Text2 ){

                    backgroundObjects.push( _backgroundObjects[i] );

                }

            }

            for( var i=0; i < _foregroundObjects.length; i++ ){

                if( _foregroundObjects[i] instanceof Bitmap || _foregroundObjects[i] instanceof Text2 ){

                    foregroundObjects.push( _foregroundObjects[i] );

                }

            }

            // width, height, backgroundObjects, foregroundObjects, dontPrepare, callback
            Editor.tools.theme.generateThemePagePreview( area.width, area.height, backgroundObjects, foregroundObjects, false, function( image ){

                Editor.template.saveThemePageWindow( image );

            });

        });

        button.appendChild( Editor.template.createToolhelper ('Zapisywanie strony motywu') );

        return button;

        /*
        var Ae = this.editableAreaInstance;
        var tool = document.createElement('div');
        tool.className = 'layer-tool';
        tool.innerHTML = 'Th';


        var currentThemeInfo = document.createElement('div');
        currentThemeInfo.innerHTML = 'Edytowany motyw <name>';

        tool.appendChild( currentThemeInfo );


        var form = document.createElement('div');
        form.className = 'form';

        var content = document.createElement('div');

        var canvas = document.createElement("canvas");
        canvas.id = 'themeImage';
        canvas.width = Ae.width;
        canvas.height = Ae.height;

        // chwilowe style
        canvas.style.position = "relative";
        canvas.style.zIndex = 1000000;
        canvas.style.border = "4px solid";
        // -- koniec
        document.body.appendChild( canvas );
        var stage = new Editor.Stage( "themeImage" );
        stage.stagetest();
        console.log( stage );
        stage.update();


        content.innerHTML = '<h3>Edytujesz motyw: </h3>';

        var backgroundElements = document.createElement('div');
        backgroundElements.className  = 'thempageLayers';
        backgroundElements.innerHTML = 'Warstwa za zdjęciami';

        var foregroundElement = document.createElement('div');
        foregroundElement.className  = 'thempageLayers';
        foregroundElement.innerHTML = 'Warstwa przed zdjęciami';

        var themePages = document.createElement('div');
        themePages.className = 'themePages-list';

        content.appendChild( backgroundElements );
        content.appendChild( canvas );
        content.appendChild( foregroundElement );
        content.appendChild( themePages );



        tool.addEventListener('click', function(){

            //var image =  Editor.tools.theme.generateThemePagePreview( Ae.width, Ae.height, Ae.backgroundLayer.children, Ae.foregroundLayer.children );
            //var content = document.createElement('div');
            //content.innerHTML = "<img class='themPage-prev' src='"+image+"'>";

            Editor.template.overlayBlock( content, 'big' );

        });

        return tool;
        */
    };


    p.createUserLayerController = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = "userLayer-controller layer-tool tool";
        //tool.innerHTML = 'U';

        tool.addEventListener('click', function(){

            _this.editableAreaInstance.userLayer.visible = ( _this.editableAreaInstance.userLayer.visible ) ? false : true;

        });

        tool.appendChild( Editor.template.createToolhelper ('Warstwa użytkownika (Ukryj/Pokaż)') );
        return tool;

    };


    p.createForegroundController = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = "foreground-controller layer-tool tool";
      //  tool.innerHTML = 'F';

        tool.addEventListener('click', function(){

            _this.editableAreaInstance.foregroundLayer.visible = ( _this.editableAreaInstance.foregroundLayer.visible ) ? false : true;

        });
        tool.appendChild( Editor.template.createToolhelper ('Warstwa pierwszego planu (Ukryj/Pokaż)') );
        return tool;

    };


    p.createUserCheckController = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
       tool.className = "foreground-controller layer-tool tool";
      //  tool.innerHTML = 'User';

        tool.addEventListener('click', function(){

            _this.editableAreaInstance.user = ( _this.editableAreaInstance.user ) ? false : true;

        });
        tool.appendChild( Editor.template.createToolhelper ('Warstwa użytkownika (Ukryj/Pokaż)') );
        return tool;

    };


	/**
	* Aktualizuje pozycję elementu z narzędziami
	*
	* @method _updateToolsBoxPosition
	*/
	p._updateToolsBoxPosition = function(){

		var tools = this.toolsContainer;
        var Editor = this.editor;
		if( this.useType == "admin" )
			var adminTools = $('#proposed-position-tool-admin');

		var toolSize = {

			width  : $(tools).innerWidth(),
			height : $(tools).innerHeight()

		};

		var pos = this.editableAreaInstance.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = this.editableAreaInstance.getTransformedBounds();

		$(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 80, left: pos[0] - toolSize.width/2 });

	};


    p.createAddProposedTextPosition = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = 'createAddProposedTextPosition layer-tool tool';
      //  tool.innerHTML = 'dodaj pozycję proponowaną dla tekstu';

        tool.addEventListener( 'click', function(){

            var object = new Text2( 'jaja', 200, 50, true, true );
			object.editor = Editor;
            object.order = _this.editableAreaInstance.userLayer.children.length;
            object.init( false );
            //object.prepareMagneticLines( Editor.getMagnetizeTolerance() );

			_this.editableAreaInstance.userLayer.addObject( object );
            object.center();

			//console.log("DOCHODZI TUTAJ");
			object.displayDefaultText();
			object.updateText({

				lettersPositions : true,
				linesPosition : true,

			});

        });
                    /*
                    var obj = new Editor.Text2( "Text", lineHeight, proposed.size.width, proposed.size.height, true, true );//, generated.size.width, generated.size.height );

                    if( usedTexts && usedTexts[currentText].content ){

                        obj.init(lineHeight, true);

                    }else {

                        obj.init(lineHeight);

                    }


                    Editor.stage.addObject( obj );
                    this.userLayer.addObject( obj );
                    obj.isProposedPosition = true;
                    */

        tool.appendChild( Editor.template.createToolhelper ('Dodaj pozycję proponowaną dla tekstu') );
        return tool;

    };

    p.deleteObject = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('div');
        tool.className = ' layer-tool tool';
        tool.id =  "deleteObject";


     //   tool.innerHTML = 'Usuń';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            Editor.webSocketControllers.page.remove( _this.editableAreaInstance.dbID, Editor.adminProject.format.view.getId() );
            Editor.tools.setEditingObject( null );
            Editor.tools.init();

        });
        tool.appendChild( Editor.template.createToolhelper ('Usuwanie obiektu edycji') );
        return tool;

    };

    p.createAddProposedImagePosition = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = 'createAddProposedImagePosition layer-tool tool';
      //  tool.innerHTML = 'dodaj pozycję proponowaną dla zdjęcia';


        tool.addEventListener( 'click', function(){

            var proposed = new ProposedPosition2( _this.editor, "Zdjęcie", null, 200, 200 );
            proposed.order = _this.editableAreaInstance.userLayer.children.length;
            _this.editor.stage.addObject( proposed );
            proposed.prepareMagneticLines( _this.editor.getMagnetizeTolerance() );
            _this.editableAreaInstance.proposedImagePositions.push( proposed );
            _this.editableAreaInstance.userLayer.addObject( proposed );
            proposed.center();
            proposed._updateShape();


        });

        tool.appendChild( Editor.template.createToolhelper ('Dodawanie pozycji proponowanej dla zdjęcia') );
        return tool;

    };


    p.createTextTool = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = 'addText  layer-tool tool';
      //  tool.innerHTML = 'T';

        tool.addEventListener( 'click', function(){

            var object = new Text2( 'text', 20, 200, 50, false, true );
            object.order = _this.editableAreaInstance.foregroundLayer.children.length;
            object.init( object._currentFontSize, false );
            object.generateCursorMap();
            object.prepareMagneticLines( Editor.getMagnetizeTolerance() );
            _this.editableAreaInstance.foregroundLayer.addObject( object );
            object.center();

        });
        tool.appendChild( Editor.template.createToolhelper ('Dodawanie tekstu do motywu') );
        return tool;

    };


    /**
	* Tworzy narzędzie wczytywania szablonów pozycji proponowanych
	*
	* @method createLoadProposedTemplate
	*/
    p.createLoadProposedTemplate = function(){

        var _this = this;
        var editableArea = this.editableAreaInstance;
        var Editor = this.editor;
        var proposedTemplate = document.createElement("div");
        proposedTemplate.id = 'load-proposed-teamplate';
        proposedTemplate.className = 'layer-tool tool';
     //   proposedTemplate.innerHTML = "Wczytaj szablon pozycji proponowanych";

        proposedTemplate.addEventListener( 'click', function(){

            Editor.webSocketControllers.proposedTemplate.getAllGlobal( function( data ){

                var _proposedTemplates = data;

                var categories = [];

                for( var i=0; i < data.length; i++ ){

                    if( data[i].ProposedTemplateCategory ){

                        if( categories.indexOf( data[i].ProposedTemplateCategory.name ) < 0 ){

                            categories.push( data[i].ProposedTemplateCategory.name );

                        }

                    }

                }

                var contentHTML = '<div id="filter_proposedPosition">'+
                                      '<label>'+
                                        'Włącz filtr ilości zdjęć'+
                                        '<input id="use_imagesCountFilter" type="checkbox">'+
                                        '<input id="imagesCount" type="text" value="0">'+
                                      '</label>'+
                                      '<label>'+
                                        'Włącz filtr ilości tekstów'+
                                        '<input id="use_textsCountFilter" type="checkbox">'+
                                        '<input id="textsCount" type="text" value="0">'+
                                      '</label>'+
                                      '<label>'+
                                        'Włącz filtr kategori'+
                                        '<input id="use_categoryFilter" type="checkbox">'+
                                      '</label>'+
                                      '<label id="categorySelector2">'+
                                        'Wybierz kategorię szablonów'+
                                        '<select id="categorySelector">'+
                                        '</select>'+
                                        '<button id="makeFiltr">Filtruj</button>'+
                                         '</label>'+
                                    '</div>';

                var windowHtml = Editor.template.displayWindow(

                    'allProposedTemplates',
                    {

                        size    : 'big',
                        title   : 'Szablony pozycji proponowanych',
                        content : contentHTML,

                    }

                );


               $('body').append( windowHtml );

               $('#allProposedTemplates').on('shown.bs.modal', function() {
                    $(this).find('.modal-dialog').css({

                        'margin-left': function () {
                            return (window.innerWidth/2-($(this).outerWidth() / 2));
                        }
                    });
                });

                document.getElementById('makeFiltr').addEventListener('click', function( e ){

                    e.stopPropagation();

                    var toNormalize = document.querySelectorAll('.proposedTemplateObject');

                    for( var i=0; i< toNormalize.length; i++ ){

                        toNormalize[i].className = 'proposedTemplateObject';

                    }

                    if( document.getElementById('use_imagesCountFilter').checked ){

                        var toHide = document.querySelectorAll('.proposedTemplateObject:not([data-images-count="'+document.getElementById('imagesCount').value+'"])');

                        for( var i=0; i< toHide.length; i++ ){

                            toHide[i].className = 'proposedTemplateObject hidden';

                        }

                    }

                    if( document.getElementById('use_textsCountFilter').checked ){

                        var toHide = document.querySelectorAll('.proposedTemplateObject:not([data-texts-count="'+document.getElementById('textsCount').value+'"])');

                        for( var i=0; i< toHide.length; i++ ){

                            toHide[i].className = 'proposedTemplateObject hidden';

                        }

                    }

                    if( document.getElementById('use_categoryFilter').checked ){

                        var selectedCategory = $("#categorySelector").val();
                        //console.log('Wybrana kategoria: ' + selectedCategory );

                        if( selectedCategory != 'all' ){

                            var toHide = document.querySelectorAll('.proposedTemplateObject:not([data-category="'+selectedCategory+'"])');

                            for( var i=0; i< toHide.length; i++ ){

                                toHide[i].className = 'proposedTemplateObject hidden';

                            }

                        }

                    }


                });


                $('#allProposedTemplates').on( 'hidden.bs.modal', function(){

                    $(this).remove();

                });

                for( var i=0; i < _proposedTemplates.length; i++ ){

                    var currentTemplate = _proposedTemplates[i];

                    var removeProposedTemplate = document.createElement('div');
                    removeProposedTemplate.className = 'remover';
                    removeProposedTemplate.setAttribute( 'data-id', currentTemplate._id );
                    removeProposedTemplate.addEventListener('click', function( e ){

                        e.stopPropagation();

                        Editor.webSocketControllers.proposedTemplate.remove(

                            this.getAttribute('data-id'),
                            function( data ){

                                $('.proposedTemplateObject[data-id="'+data.ID+'"]').remove();

                            }

                        );

                    });

                    var proposedTemplateObject = document.createElement('div');
                    proposedTemplateObject.className = 'proposedTemplateObject';
                    proposedTemplateObject.setAttribute( 'data-id', currentTemplate._id );
                    proposedTemplateObject.setAttribute( 'data-images-count', currentTemplate.ProposedImages.length );
                    proposedTemplateObject.setAttribute( 'data-texts-count', currentTemplate.ProposedTexts.length );

                    if( currentTemplate.ProposedTemplateCategory ){
                        proposedTemplateObject.setAttribute( 'data-category', currentTemplate.ProposedTemplateCategory.name );
                    }else {
                        proposedTemplateObject.setAttribute( 'data-category', 'brak' );
                    }

                    var proposedTemplateObjectImg = document.createElement('img');
                    proposedTemplateObjectImg.src = currentTemplate.url;

                    proposedTemplateObject.appendChild( proposedTemplateObjectImg );
                    proposedTemplateObject.appendChild( removeProposedTemplate );

                    document.querySelector('#allProposedTemplates .modal-body').appendChild( proposedTemplateObject );

                    proposedTemplateObject.addEventListener('click', function( e ){

                        e.stopPropagation();
                        var id = this.getAttribute('data-id');
                        Editor.webSocketControllers.proposedTemplate.get( id, function( data ){
                            var generated = Editor.tools.proposedTemplate.generateTemplateForThisArea( editableArea, data  );
                            Editor.template.loadProposedTemplate( generated );
                        });

                    });

                }

                $('#allProposedTemplates').modal({

                    keyboard: false,
                    backdrop: 'static'

                });

                $('#categorySelector').html(
                  '<option value="all">Wszystkie</option>'+
                  '<option value="brak">Brak</option>'
                );

                var categorySelector = document.getElementById('categorySelector');

                for( var c=0; c< categories.length; c++ ){

                    var option = document.createElement('option');
                    option.value = categories[c];
                    option.innerHTML = categories[c];
                    categorySelector.appendChild( option );

                }


            });

        });
        proposedTemplate.appendChild( Editor.template.createToolhelper ('Wczytanie szablonu pozycji proponowanej') );
        return proposedTemplate;

    };


    /**
	* Tworzy wiersz formularza opcją dodawania nowej kategori, po dodaniu należy użyć metody newCategoryRowInit dla wygenerowania ladnego inputa.
	*
	* @method newCategoryRow
	*/
    p.newCategoryRow = function(){

        var html = "<div class='form-row' id='newCategory_row'><i class='responsive_normal'>Nazwa :</i><input name='newCategory' id='newCategory' class='form' type='text' placeholder='nazwa nowej kategori'/><span id='newCategoryName' class='form-button small'>Dodaj</span><span id='newCategoryNameAbort' class='form-button small cancell'>Anuluj</span></div>";

        return html;

    };


    p.createHorizontalMirror = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('div');
        tool.id = 'proposedTemplateHorizontalMirror';
        tool.className = 'layer-tool tool';
        // tool.innerHTML = 'wyczysc';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();
            //console.log('horyzontalne odbicie pozycji proponowanych');
            if( _this.editableAreaInstance ){

                if( _this.editableAreaInstance.userLayer.children.length ){

                    var areaSize = {

                        width  : _this.editableAreaInstance.width,
                        height : _this.editableAreaInstance.height

                    };

                    var childrensToChange = _this.editableAreaInstance.userLayer.children;
                    //console.log( childrensToChange );
                    //console.log('przerzucamy obietky');

                    for( var i=0 ; i < childrensToChange.length; i++ ){

                        var bounds = childrensToChange[i].getTransformedBounds();
                        //console.log( bounds );

                        var newPosition = areaSize.width - bounds.x - bounds.width;
                        childrensToChange[i].setPosition_leftCorner( newPosition, bounds.y );

                        childrensToChange[i].rotation = -childrensToChange[i].rotation;

                        if( childrensToChange[i].mask ){

                            childrensToChange[i].mask.rotation = childrensToChange[i].rotation;

                        }

                    }

                }

            }

        });

        tool.appendChild( Editor.template.createToolhelper ('Odbicie lustrzane pozycji proponowanych (lewo|prawo)') );

        return tool;

    };


    p.createVerticalMirror = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('div');
        tool.id = 'proposedTemplateVerticalMirror';
        tool.className = 'layer-tool tool';
        // tool.innerHTML = 'wyczysc';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();
            //console.log('horyzontalne odbicie pozycji proponowanych');
            if( _this.editableAreaInstance ){

                if( _this.editableAreaInstance.userLayer.children.length ){

                    var areaSize = {

                        width  : _this.editableAreaInstance.width,
                        height : _this.editableAreaInstance.height

                    };

                    var childrensToChange = _this.editableAreaInstance.userLayer.children;

                    for( var i=0 ; i < childrensToChange.length; i++ ){

                        var bounds = childrensToChange[i].getTransformedBounds();
                        //console.log( bounds );

                        var newPosition = areaSize.height - bounds.y - bounds.height;
                        childrensToChange[i].setPosition_leftCorner( bounds.x, newPosition );

                        childrensToChange[i].rotation = -childrensToChange[i].rotation;

                        if( childrensToChange[i].mask ){

                            childrensToChange[i].mask.rotation = childrensToChange[i].rotation;

                        }

                    }

                }

            }

        });

        tool.appendChild( Editor.template.createToolhelper ('Odbicie lustrzane pozycji proponowanych ( góra|dół)') );

        return tool;

    };


    p.editableController = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement("div");
        tool.id = 'lockEditableArea';
        tool.className = 'layer-tool tool';

        if ( _this.editableAreaInstance.blocked == true ){

            tool.className = 'layer-tool tool blocked';

        }else {

            tool.className = 'layer-tool tool unlocked';

        }

        //tool.innerHTML = ( this.editableAreaInstance.blocked )? "Odblokuj" : "Zablokuj";

        /*
        $('.posXSetLabel').addClass("toolUnactive");
        $('.posYSetLabel').addClass("toolUnactive");
        */

         //_this.editableAreaInstance.blocked = true;

        tool.addEventListener( 'click', function( e ){

            e.stopPropagation();



            if( _this.editableAreaInstance.blocked ){

                _this.editableAreaInstance.blocked = false;
               //tool.innerHTML = 'Zablokuj';
                tool.className = 'layer-tool tool unlocked';

                $('.posXSetLabel').removeClass("toolUnactive");
                $('.posYSetLabel').removeClass("toolUnactive");
                $('.setRotationLabel').removeClass('toolUnactive');


            }
            else {

                _this.editableAreaInstance.blocked = true;
               // tool.innerHTML = 'Odblokuj';
                tool.className = 'layer-tool tool blocked';

                $('.posXSetLabel').addClass("toolUnactive");
                $('.posYSetLabel').addClass("toolUnactive");
                $('.setRotationLabel').addClass('toolUnactive');

            }

        });

        tool.appendChild( Editor.template.createToolhelper ("Blokowanie strony") );
        return tool;

    };


    /**
	* Inicjuje eventy podpiete do newCategoryRow
	*
	* @method newCategoryRowInit
	*/
    p.newCategoryRowInit = function(){

        var _this = this;
        var Editor = this.editor;
        $("#newCategoryNameAbort").on('click', function(){

            $("#newCategory_row").animate({opacity: 0}, 200, function(){

                var categoryString =  Editor.tools.proposedTemplate.generateTemplateCategorySelect();
                $(this).before( _this.categorySelectRow() );
                _this.categorySelectRowInit();
                $(this).remove();

            });

        });

        $("#newCategoryName").on('click', function(){

            var newName = $("input#newCategory").val();

            if( newName ){

                Editor.webSocketControllers.proposedTemplateCategory.add( categoryName, function( data ){

                    Editor.tools.proposedTemplate.addTemplateCategory( newName );

                    $("#newCategory_row").animate({opacity: 0}, 200, function(){

                        var categoryString = Editor.tools.proposedTemplate.generateTemplateCategorySelect();
                        $(this).before( _this.categorySelectRow() );
                        _this.categorySelectRowInit();
                        $(this).remove();

                    });

                });


            }
            else {

                alert("Podaj nazwę kategori");

            }

        });

    };


    /**
	* Tworzy wiersz formularza z przyciskiem zapisania i anulowania operacji dodawania szablonu.
	*
	* @method saveCancelFormRow
	*/
    p.saveCancelFormRow = function(){

        return '<div class="form-row"><span id="save-template" class="form-button">Zapisz</span></div>'

    };


    /**
	* Dodaje eventy do przyciskuw zapisu i anulowania
	*
	* @method saveCancelFormRowInit
	*/
    p.saveCancelFormRowInit = function(){

        var _this = this;
        var Editor = this.editor;
        $("#save-template").on('click', function(e){

            var categories = [$('#proposedTemplateCategory-select').val()];

            var themePage = $('.themePage.active').attr('data-themepage-id');

            var imagesCount = 0;
            var textCount = 0;

            var image = $('.template_preview').attr('src');
            var isGlobal = $('input#isGlobal').is(":checked") ? true : false;

            for( var i=0; i < _this.templateObjectsInfo.length; i++ ){

                if( _this.templateObjectsInfo[i].type == 'Text2' ){
                    textCount++;
                }
                else if( _this.templateObjectsInfo[i].type == 'ProposedPosition' ){
                    imagesCount++;
                }

            }

            Editor.adminProject.format.view.page.themePage.saveProposedTemplate( _this.editableAreaInstance.trueWidth, _this.editableAreaInstance.trueHeight, 'szablon', _this.templateObjectsInfo, imagesCount, textCount, categories, image, isGlobal, function( data ){

				Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){

					Editor.adminProject.format.view.page.loadThemePage( data );
					//Editor.adminProject.format.view.page.get()['pageObject'].loadThemePage( data );

				});
				/*
                Editor.adminProject.format.view.page.get().pageObject.initProposedTemplateTool( data.proposedTemplates[data.proposedTemplates.length-1]._id );
				$('#saveProposedTemplateWindow').remove();
				*/

            });

            //Editor.proposedTemplates.saveProposedTemplate( _this.editableAreaInstance.trueWidth, _this.editableAreaInstance.trueHeight, 'szablon', _this.templateObjectsInfo, 1, 1, categories   );
            //Editor.proposedTemplates.saveProposedTemplateForThemePage();
            //Editor.tools.proposedTemplate.save( _this.editableAreaInstance, _this.templateObjects, categories );

            $("#overflow-box").animate({opacity:0}, 500, function(){
                $("#overflow-box").remove();
            });

        });

    };


    /**
	* Zwraca nazwę wybranej kategori szablonu
	*
	* @method getSelectedCategories
    * @return {array} tablica wybranych kategori
	*/
    p.getSelectedCategories = function(){

        return [$('#template-category-select').val()];

    };


    /**
	* Tworzy wiersz formularza z selectem kategori, po dodaniu należy użyć metody categoryselectinit dla wygenerowania ladnego inputa.
	*
	* @method categorySelectRow
	*/
    p.categorySelectRow = function(){
        var Editor = this.editor;
        var categoryString = Editor.tools.proposedTemplate.generateTemplateCategorySelect();

        var html = '<div class="form-row"><i class="responsive_normal"> Kategoria:</i>'+categoryString+'<span id="addButton-template">+</span></div>';

        return html;

    };


    /**
	* Inituje eventy podłączone do tego konkretnego wiersza
	*
	* @method categorySelectInit
	*/
    p.categorySelectRowInit = function(){

        var _this = this;
        var Editor = this.editor;
        $("#template-category-select").selectmenu();

        $("#addButton-template").on('click', function(){

            var nextElement = $( this ).parent().next();

            $(this).parent().animate({opacity:0}, 400, function(){

                $( "#template-category-select" ).selectmenu('destroy');
                $(this).css({display : 'none'});
                $(this).after( _this.newCategoryRow() );
                _this.newCategoryRowInit();
                $(this).remove();

            });

        });

    };


    p.prepareObjectsToSave = function(){
        var Editor = this.editor;
        var childrens = this.editableAreaInstance.userLayer.children;
        //console.log( childrens );

        var proposedChildrens = [];

        for( var i=0; i < childrens.length; i++ ){

            if( childrens[i] instanceof Text2 || childrens[i] instanceof ProposedPosition2 )
                proposedChildrens.push( $.extend(true, childrens[i], {}) );

        }

        var objectsInfo = [];

        for( var i=0; i < proposedChildrens.length; i++ ){

            if( proposedChildrens[i] instanceof Text2 ){
                var _type = "Text2";
            }
            else if( proposedChildrens[i] instanceof ProposedPosition2 ){
                var _type = "ProposedPosition";
            }

            var bounds = proposedChildrens[i].getTransformedBounds();

            objectsInfo.push({

                pos : { x : proposedChildrens[i].x, y : proposedChildrens[i].y },
                bounds : { x : bounds.x, y : bounds.y, width : bounds.width, height : bounds.height },
                size : { width : proposedChildrens[i].trueWidth , height : proposedChildrens[i].trueHeight },
                rotation : proposedChildrens[i].rotation,
                type : _type,
                order : proposedChildrens[i].parent.getChildIndex( proposedChildrens[i] )

            });

        }

        this.templateObjects = proposedChildrens;

        this.templateObjectsInfo = objectsInfo;

    };


    /**
	* Tworzy narzędzie zapisywania szablonów pozycji proponowanych
	*
	* @method createSaveProposedTemplate
	*/
    p.createSaveProposedTemplate = function(){

        var _this = this;
        var Editor = this.editor;
        var proposedTemplate = document.createElement("div");
        proposedTemplate.id = 'save-proposed-teamplate';
        proposedTemplate.className = 'layer-tool tool';

        //proposedTemplate.innerHTML = "Zapisz szablon pozycji proponowanych";

        proposedTemplate.addEventListener('click', function(){

            _this.prepareObjectsToSave();

            var template_image = Editor.tools.proposedTemplate.generateTemplateImage( _this.editableAreaInstance.trueWidth, _this.editableAreaInstance.trueHeight, _this.templateObjectsInfo );

            _this.createCategorySaveWindow( template_image );

        });

        proposedTemplate.appendChild( Editor.template.createToolhelper ("Zapis szablonu pozycji proponowanych") );
        return proposedTemplate;

    };


    p.createCategorySaveWindow = function( template_image ){

        var _this = this;
        var Editor = this.editor;
        var content = '<h2>Podgląd szablonu</h2><img class="template_preview" src="'+template_image+'"/><div id="template-form" class="template-form"><label>Wybierz kategorię: <select id="proposedTemplateCategory-select"></select></label><label>Dodaj jako pozycję globalną: <input id="isGlobal" type="checkbox"></input></label><div class="button-fw" id="addProposedTemplateCategory">Dodaj nową kategorię</div></div>'+(_this.saveCancelFormRow());

        var saveProposedTemplateWindow = Editor.template.displayWindow(

            'saveProposedTemplateWindow',
            {

                size : 'small',
                title : 'Zapisywanie szablonu pozycji proponowanych',
                content : content

            }

        );

        $('body').append( saveProposedTemplateWindow );

        $('#saveProposedTemplateWindow').on( 'hidden.bs.modal', function(){

            $(this).remove();

        });

        $('#saveProposedTemplateWindow').modal({

            keyboard: false,
            backdrop: 'static'

        });

        Editor.webSocketControllers.proposedTemplateCategory.getAll( function( data ){

            var selectInput = document.getElementById('proposedTemplateCategory-select');
            selectInput.innerHTML = "";

            for( var i=0; i < data.length; i++ ){

                var option = document.createElement('option');
                option.value = data[i]._id;
                option.innerHTML = data[i].name;

                selectInput.appendChild( option );

            }

        });


        document.getElementById('addProposedTemplateCategory').addEventListener('click', function( e ){

            e.stopPropagation();

            var content = '<label>Nazwa kategori:<input id="newCategoryName" type="text"></input></label><div class="button-fw" id="addNewCategory-button">Dodaj</div>';

            var addProposedTemplateCategory = Editor.template.displayWindow(

                'addProposedTemplateCategoryWindow',
                {

                    size : 'mini',
                    title : 'Dodaj nową kategorię',
                    content : content

                }

            );

            $('body').append( addProposedTemplateCategory );

            $('#addProposedTemplateCategoryWindow').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#addProposedTemplateCategoryWindow').modal({

                keyboard: false,
                backdrop: 'static'

            });

            $("#addNewCategory-button").on('click', function( e ){

                e.stopPropagation();

                Editor.webSocketControllers.proposedTemplateCategory.add( $("#newCategoryName").val(), function( data ){

                    var selectInput = document.getElementById('proposedTemplateCategory-select');
                    selectInput.innerHTML = "";

                    for( var i=0; i < data.length; i++ ){

                        var option = document.createElement('option');
                        option.value = data[i]._id;
                        option.innerHTML = data[i].name;

                        if( data[i].name == $("#newCategoryName").val() )
                            option.selected = true;

                        selectInput.appendChild( option );

                    }

                    $("#addProposedTemplateCategoryWindow").remove();

                });

            });

        });

        _this.saveCancelFormRowInit();

    };


    p.createNewThemePageTool = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.id = 'createNewThemePageTool';
        tool.className = 'layer-tool tool';
       // tool.innerHTML = 'wyczysc';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            _this.editableAreaInstance.clear();

        });
        tool.appendChild( Editor.template.createToolhelper ('Wyczyść obszar roboczy') );
        return tool;

    };


    /**
	* Inicjalizuje wszystkie narzędzia i dołącza je do tool boxa
	*
	* @method initAllTools
	*/
	p.initAllTools = function(){


		var _this = this;
        var Editor = this.editor;
		var tools = document.createElement("div");
		tools.id = "editalbearea-toolsbox";
		tools.className = "tools-box";

        var userTools = document.createElement("div");
		userTools.className = "editableAreaTools";

        userTools.appendChild( this.createSaveProposedTemplate() );
        userTools.appendChild( this.createLoadProposedTemplate() );
        userTools.appendChild( this.createAddProposedImagePosition() );
        userTools.appendChild( this.createAddProposedTextPosition() );
        userTools.appendChild( this.createHorizontalMirror() );
        userTools.appendChild( this.createVerticalMirror() );
        userTools.appendChild( this.createBackgroundController() );
        userTools.appendChild( this.createUserLayerController() );
        userTools.appendChild( this.createForegroundController() );
        //userTools.appendChild( this.createUserCheckController() );
        userTools.appendChild( this.saveThemePage() );
        //userTools.appendChild( this.loadPageTheme() );
        userTools.appendChild( this.createTextTool() );
       // userTools.appendChild( this.regenerateMiniature() );
        userTools.appendChild( this.createUpdateThemePage() );
        userTools.appendChild( this.createSettingsTool() );
        userTools.appendChild( this.createThemeSettingsTool() );
        userTools.appendChild( this.createNewThemePageTool() );
        userTools.appendChild( this.editableController() );
        userTools.appendChild( this.deleteObject() );
        userTools.appendChild( this.updateFormatInfo() );
        //userTools.appendChild( this.automaticThemePageFit() );

		tools.appendChild( userTools );

		this.toolsContainer = tools;

		this.editableAreaInstance.addEventListener( 'move', function( e ){

			_this._updateToolsBoxPosition();

		});

		this.editableAreaInstance.addEventListener('scale', function( e ){

			_this._updateToolsBoxPosition();

		});

		this.editableAreaInstance.addEventListener('rotate', function( e ){

			_this._updateToolsBoxPosition();

		});

		this.editableAreaInstance.addEventListener('resize', function( e ){

			_this._updateToolsBoxPosition();

		});

        document.body.appendChild( tools );
        this.element = tools;

	};


    /**
	* Dodaje narzędzie do elementu.
	*
	* @method appendTools
	*/
	p.appendTools = function( elem ){

		elem.append( this.toolsContainer );

	};


    /**
	* Usuwa wszystkie nardzędzia i boks.
	*
	* @method removeTools
	*/
    p.removeTools = function(){

        $( this.element ).remove();

    };


    export {EditableAreaTool};
