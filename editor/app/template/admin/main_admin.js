import React from "react";
import ReactDOM from "react-dom";
import {EditorSettings} from "./../../class/EditableAreaSettings.js";
import AssetContainer from "./../Assets.js";

var TemplateModule = require('./main').TemplateModule;

    var topMenuHeight = 80;
    var menuDuration = 500;
    var helperDuration = 300;


    var p = TemplateModule.prototype;

    p.alertFunction = function (){

    }

    p.generateFormatSettings = function(){

        var Editor = this.editor;
        var tool = document.createElement('div');
        tool.id = 'formatSettings-container-tool';
        tool.className = 'tool closed';
        //tool.style.width = '1200px';


        var innerContainer = document.createElement('div');
        innerContainer.className = 'innerContainer';

        var toolButton = document.createElement('span');
        toolButton.id = 'formatSettings-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'formatSettings-content');

        tool.appendChild( toolButton );

        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Tutaj możesz zmienić ustawienia dla formatu</span>';

        tool.appendChild( toolHelper );

        var toolContent = document.createElement('div');
        toolContent.id = 'formatSettings-content';

        var toolTitle = document.createElement('h3');
        toolTitle.className = 'toolTitle';
        toolTitle.innerHTML = 'Ustawienia'

        var attributesView = document.createElement('div');
        attributesView.id = 'attributesView';

        toolContent.appendChild( toolTitle );
        toolContent.appendChild( attributesView );
        //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

        var formatSettingsContent =document.createElement('div');
        formatSettingsContent.id = 'formatSettingsContent';
        formatSettingsContent.className = 'formatSettingsContent';

        toolContent.appendChild( formatSettingsContent );

        document.getElementById('toolsContent').appendChild( toolContent );

        var fonts = document.createElement('div');
        fonts.className = 'fontsSettings';
        fonts.id = 'fonts';

        var fontsList = document.createElement('div');
        fontsList.className = 'fontsList';
        fontsList.id = 'fontsList';

        var addFont = document.createElement('button');
        addFont.innerHTML = 'Dodaj czcionkę';
        addFont.id = 'addFont';

        addFont.addEventListener('click', function( e ){

            e.stopPropagation();

            Editor.fonts.addFontBox();

        });

        var fontColors = document.createElement('div');
        fontColors.id = 'font-colors';

        var fontColors_title = document.createElement('h3');
        fontColors_title.innerHTML = 'Kolory czciosssnek | ramek';
        fontColors_title.id = 'fontColors_title';

        var fontColorsList = document.createElement('div');
        fontColorsList.id = 'settings-font-colors-list';

        var addFontColor_button = document.createElement('button');
        addFontColor_button.className = 'button-hw';
        addFontColor_button.innerHTML = 'Dodaj nowy kolor';
        addFontColor_button.id = 'addFontColor_button';

        addFontColor_button.addEventListener('click', function( e ){

            e.stopPropagation();
            var newColor = prompt('Podaj nowy kolor w HEX');

            Editor.webSocketControllers.adminProject.addColor( "#" + newColor );

        });

        var saveColors = document.createElement('button');
        saveColors.className = 'button-hw';
        saveColors.innerHTML = 'Zapisz kolory';
        saveColors.id = 'saveColors';

        saveColors.addEventListener('click', function( e ){

            e.stopPropagation();

            var listElement = document.getElementById('settings-font-colors-list');
            var activeColors = document.querySelectorAll('#settings-font-colors-list .font-color.active');

            var arrayOfColors = [];

            for( var i=0; i<activeColors.length; i++ ){

                var activeColor = activeColors[i];
                arrayOfColors.push( Editor.rgb2hex( activeColor.style.backgroundColor ) );

            }

            //console.log( arrayOfColors );

            Editor.webSocketControllers.adminProject.setActiveColors( arrayOfColors );

        });


        fontColors.appendChild( fontColors_title );
        fontColors.appendChild( fontColorsList );
        fontColors.appendChild( addFontColor_button );
        fontColors.appendChild( saveColors );

        fonts.appendChild( fontsList );
        fonts.appendChild( addFont );
        fonts.appendChild( fontColors );

        toolContent.appendChild( fonts );




        return tool;

    };


    /**
    * Generuje box z narzędziami
    *
    * @method generateToolsBox
    * @param {String} type Typ toolsBoxa pro|ama
    */
    p.generateToolsBox = function( type, info ){
        
        var Editor = this.editor;
        var tools = document.createElement('div');
        tools.id = 'toolsBox';
        tools.className = type;
        tools.style.height = ( window.innerHeight - topMenuHeight ) + "px";
        //tools.style.width = (toolContentWidth + 60 ) + "px";

        var toolsContainer = document.createElement('div');
        toolsContainer.id = 'toolsContainer';

        var toolsContent = document.createElement('div');
        toolsContent.id = 'toolsContent';
        //toolsContent.style.width = toolContentWidth + "px";

        tools.appendChild( toolsContent );

        document.body.appendChild( tools );
        document.body.appendChild( this.editor.template.generateTopMenu() );

        this.assetsComponent = ReactDOM.render( <AssetContainer editor={ this.editor }/>, document.body.querySelector('.libraryButton'));

        toolsContainer.appendChild( this.editor.template.generateAttributesTool() );
        toolsContainer.appendChild( this.editor.template.generateThemes() );
        toolsContainer.appendChild( this.editor.template.generateThemesToCopy() );
        toolsContainer.appendChild( this.editor.template.generateViews( info.views ) );
        toolsContainer.appendChild( this.editor.template.generatePages() );
        toolsContainer.appendChild( this.editor.template.generateProposedTemplates() );
        toolsContainer.appendChild( this.editor.template.generateImagesTool( type ) );
        toolsContainer.appendChild( this.editor.template.generateLayersTool() );
        //toolsContainer.appendChild( Editor.template.generateTextTool() );
        toolsContainer.appendChild( this.editor.template.generateProposedPositionTool() );
        toolsContainer.appendChild( this.editor.template.generateObjectSettings() );
        toolsContainer.appendChild( this.editor.template.generateFramesPanel() );
        toolsContainer.appendChild( this.editor.template.generateFormatSettings() );

        tools.appendChild( toolsContainer );

        this.generateEditableAreaTools();


        var toolsContent_height = $('#toolsContent').height();
        $("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );

       // toolsContainer.style.marginTop = ( toolsContent_height - toolsContainer.offsetHeight )/2 + "px";

        this.editor.template.initToolBoxEvents();

    };

    p.createAddProposedImagePosition = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = 'createAddProposedImagePosition layer-tool tool editable-area-tool';
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

    p.createAddProposedTextPosition = function(){

        var _this = this;
        var Editor = this.editor;
        var tool = document.createElement('span');
        tool.className = 'createAddProposedTextPosition layer-tool tool editable-area-tool';
      //  tool.innerHTML = 'dodaj pozycję proponowaną dla tekstu';

        tool.addEventListener( 'click', function(){

            var object = new Text2( 'jaja', 200, 50, true, true );
            object.editor = Editor;
            object.order = _this.editableAreaInstance.userLayer.children.length;
            object.init( false );
            //object.prepareMagneticLines( Editor.getMagnetizeTolerance() );

            _this.editableAreaInstance.userLayer.addObject( object );
            object.center();

            object.displayDefaultText();
            object.updateText({

                lettersPositions : true,
                linesPosition : true,

            });

        });

        tool.appendChild( Editor.template.createToolhelper ('Dodaj pozycję proponowaną dla tekstu') );
        return tool;

    };

    p.createThemeSettingsTool = function(){

        var _this = this;

        var tool = document.createElement('span');
        tool.className = "layer-tool tool editable-area-tool";
        tool.id = 'createThemeSettingsTool';
       // tool.innerHTML = 'Ustawienia';

        tool.addEventListener('click', function(){

            _this.editor.template.themePageSettings( _this.editor.adminProject.format.view.page.themePage.getObject() );

        });

        tool.appendChild( this.editor.template.createToolhelper ("Ustawienia strony motywu") );
        return tool;

    }

    p.createSettingsTool = function(){

        var _this = this;

        var tool = document.createElement('span');
        tool.className = "layer-tool tool editable-area-tool";
        tool.id = 'createSettingsTool';
       // tool.innerHTML = 'Ustawienia';

        tool.addEventListener('click', function(){

            _this.editor.template.editableAreaConfig( _this.editableAreaInstance);

        });

        tool.appendChild( this.editor.template.createToolhelper ("Ustawienia obszaru roboczego") );
        return tool;

    };

    p.initAllEditableAreaTools = function(){

        // buttons
        var themeTools = document.createElement('div');
        themeTools.className = 'section-button';
        themeTools.setAttribute('section', 'theme-tools');

        var themeSection = document.createElement('div');
        themeSection.className = 'section theme-tools';

        var themeSectionContainer = document.createElement('div');
        themeSectionContainer.className = 'tool-cont';

        themeSection.appendChild( themeSectionContainer );

        var elem = <EditableAreaSettings/>;
        //console.log( elem );
        //console.log('sadddddddsssssssssssssssssssssssssssssssssssssssssssssss');

        ReactDOM.render( elem, themeSectionContainer );


        // themeSectionContainer.appendChild( this.createAddProposedImagePosition() );
        // themeSectionContainer.appendChild( this.createAddProposedTextPosition() );
        // themeSectionContainer.appendChild( this.createThemeSettingsTool() );


        return themeSection;
        /*
        var _this = this;
        var Editor = this.editor;
        var tools = document.createElement("div");
        tools.id = "editalbearea-toolsbox";
        tools.className = "tools-box";

        var userTools = document.createElement("div");
        userTools.className = "editableAreaTools";

        userTools.appendChild( this.createSaveProposedTemplate() );
        userTools.appendChild( this.createLoadProposedTemplate() );
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
        */

    };

    p.generateEditableAreaTools = function( editableArea ){

        var cont =  document.createElement('div');
        cont.className = 'editableTool-box-container';

        document.body.appendChild( cont );

        this.reactEditorSettings = ReactDOM.render( <EditorSettings/>, cont );
        var editableArea = this.editor.adminProject.format.view.page.get().pageObject;
        this.reactEditorSettings.setEditableArea( editableArea );

        //cont.appendChild( this.initAllEditableAreaTools() );

    }

    p.getReactEditorSettings = function(){

        return this.reactEditorSettings;

    }

    p.generatePages = function(){

        var Editor = this.editor;
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


    /**
    * Generuje cały wygląd edytora
    *
    * @method generateEditor
    */
    p.generateEditor = function( info, type ){

        if( info == 'complex' ){

            // tutaj beda ify na to czy edytor jest zaawansowany
            this.generateComplexToolsBox( type, info );

        }


        else if( info == 'simple' ) {

            // tutaj beda ify na to czy edytor jest zaawansowany
            this.editor.template.generateToolsBox( type, info );

        }
        //generateThemes( info.themes );

    };


    /**
    * Generuje narzędzie dodawania zdjęć z pamięci komputera
    *
    * @method generateUploadButtons
    * @param {String} type Typ uploadButtons pro|ama
    */
    p.generateUploadButtons = function ( uploadFunc ){

        var uploadButton = document.createElement('div');
        var Editor = this.editor;
        var projectImageVisibleUploader = document.createElement('div');
        var innerUploadContainer = document.createElement('div');

        projectImageVisibleUploader.id = 'projectImageVisibleUploader';
        projectImageVisibleUploader.className = 'button-fw absolutePos uploaderContent';
        projectImageVisibleUploader.innerHTML = 'DODAJ OBRAZY ';

        innerUploadContainer.id = 'innerUploadContainer';
        innerUploadContainer.className = 'uploadContainer';

        innerUploadContainer.appendChild( projectImageVisibleUploader );
        innerUploadContainer.appendChild( uploadFunc() );

        uploadButton.appendChild( innerUploadContainer );

        return uploadButton;
    }


    p.uploadImages = function ( files , loadedImage ){

        loadedImage.image.onload = function (){

            loadedImage.origin = loadedImage.getBounds();
            var obrazek = ThumbsMaker.generateThumb( loadedImage );

            obrazek.scale = {
                x : loadedImage.origin.width,
                y : loadedImage.origin.height
            };

            var first = true;

            var imagesContent = document.getElementById('imagesList');
            var imagesArray = [];
            var bitmap = new createjs.Bitmap( obrazek.min );

            bitmap.image.onload = function(){
                origin = bitmap.getBounds();
                bitmap.x = 900/2;
                bitmap.y = 400/2;
                var aspect = origin.width/origin.height;
                bitmap.scaleX = Editor.settings.thumbSize * aspect * 1/origin.width;
                bitmap.scaleY = Editor.settings.thumbSize * 1/origin.height;
                bitmap.regX = this.width/2;
                bitmap.regY = this.height/2;
                bitmap.name = files.name;

                bitmap.trueWidth = obrazek.width = obrazek.width;
                bitmap.trueHeight = obrazek.height = obrazek.height;

                bitmap.regX = bitmap.trueWidth/2;
                bitmap.regY = bitmap.trueHeight/2;

                var projectImage = new Editor.ProjectImage();
                projectImage.thumbnail = obrazek.minThumb;
                projectImage.minUrl = obrazek.thumb;
                projectImage.waitingForUpload = true;
                projectImage.init( files, obrazek.min, obrazek.thumb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height );

                Editor.adminProject.addProjectImage( projectImage );
                imagesContent.appendChild( projectImage.html );
                imagesArray.push( projectImage );


                Editor.uploader.addItemToUpload( projectImage );
                Editor.uploader.upload();

                Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), bitmap.name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                projectImage.addEventListener( 'uploaded', function( data ){

                    var projectImage = data.target;

                    var dataToUpload = {

                        projectImageUID : projectImage.uid,
                        minUrl : projectImage.miniatureUrl,
                        thumbnail : projectImage.thumbnail,
                        imageUrl : projectImage.imageUrl,
                        uploadID : projectImage.uploadID

                    };

                    Editor.webSocketControllers.projectImage.update( dataToUpload );

                });

           }
        }

   };


    p.imageLoader = function( dropBox ){
        var Editor = this.editor;
        if (dropBox){

            dropBox.addEventListener('drop', function(e){

                e.stopPropagation();
                var images = e.dataTransfer.files;
                var actualFile = 0;

                for (var j = 0 ; j < images.length ; j++){

                    var _this = this;

                    this.className = 'imageDrop droped';

                    e.stopPropagation();
                    e.preventDefault();
                    //Editor.handleFileSelect(e, 2);

                    var fileOnLoad = URL.createObjectURL( e.dataTransfer.files[actualFile] );
                    var files = e.dataTransfer.files[actualFile]; // FileList object
                    var loadedImage = new createjs.Bitmap( fileOnLoad );

                    var url = URL.createObjectURL( files );

                    var obrazek;

                    if( actualFile < images.length ){

                        actualFile++;
                        URL.revokeObjectURL( url );


                        Editor.template.uploadImages( files, loadedImage )

                    }

                    else {

                        fileReader = null;

                    }
                }

           });
        }
    };

    /**
    * Generuje narzędzie kontenera obrazków
    *
    * @method generateImagesTool
    * @param {String} type Typ toolsBoxa pro|ama
    */
    p.generateImagesTool = function( type ){

        var Editor = this.editor;

        var tool = document.createElement('div');
        tool.id = 'image-container-tool';
        tool.className = 'tool closed';
        //tool.style.width = '1200px';

        var innerContainer = document.createElement('div');
        innerContainer.id = 'imagesContent';

        var buttonContainer = document.createElement('div');
        buttonContainer.id = 'imageToolButtonContainer';

        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać swoje zdjęcia</span>';

        tool.appendChild( toolHelper );

        var toolButton = document.createElement('span');
        toolButton.id = 'image-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'imagesContent');

        buttonContainer.appendChild( Editor.template.generateColumnButtons() );
        buttonContainer.appendChild( Editor.template.generateUploadButtons( Editor.template.projectImageUploader.bind( this ) ) );

        // var imagesScrollContainer = document.createElement('div');
        // imagesScrollContainer.id = 'imagesListScroll';

        var imagesList = document.createElement('div');
        imagesList.id = 'imagesList';
       //imagesList.className = 'twoColumnsImages nano-content';
        imagesList.className = 'twoColumnsImages';

        //imagesScrollContainer.appendChild(imagesList);

        var imagesUploadBox = document.getElementById('imagesContent');


        innerContainer.addEventListener('dragover', function(e){

            //e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

            if ( !(document.getElementById('imageDrop')) ) {
                Editor.template.createDragArea( innerContainer );
            }

        }, false);



        innerContainer.appendChild( buttonContainer );

        tool.appendChild( toolButton );
        tool.appendChild( innerContainer );

        var toolsContainer = document.getElementById("toolsContent");
        innerContainer.appendChild( imagesList );


        Ps.initialize ( imagesList );

        toolsContainer.appendChild( innerContainer );

        return tool;

    };


    p.createDragArea = function( element ){

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

        //imageDrop.addEventListener('dragexit', function( e ){

         //   e.stopPropagation();
         //   $('#imageDrop').remove();

        //});



    };

    p.projectImageUploader = function( imageFile ){

        var Editor = this.editor;
        var uploader = document.createElement('input');
        uploader.type = 'file';
        uploader.multiple = 'true';
        uploader.className = 'button-fw inputHidden absolutePos';

        uploader.input = imageFile;

        uploader.onchange = function( e ){

            var files = this.files; // FileList object
            var first = true;

            var i=0;

            var images = files.length;

            var ima = 0;

            var imagesContent = document.getElementById('imagesList');

            var imagesArray = [];


            function addImages(){

                for( var i=0; i < images; i++ ){

                    imagesContent.appendChild( imagesArray[i].toHTML() );

                }

            };


            var actualFile = 0;


            var upload_image = function(){

                var url = URL.createObjectURL( files[actualFile] );


                var loadedImage = new createjs.Bitmap( url );


                loadedImage.image.onload = function(){

                    loadedImage.origin = loadedImage.getBounds();
                    loadedImage.scale = {
                        x : loadedImage.origin.width,
                        y : loadedImage.origin.height
                };

                var obrazek = ThumbsMaker.generateThumb( loadedImage );

                var bitmap = new createjs.Bitmap( obrazek.min );

                bitmap.image.onload = function(){
                    origin = bitmap.getBounds();
                    bitmap.x = 900/2;
                    bitmap.y = 400/2;
                    var aspect = origin.width/origin.height;
                    bitmap.scaleX = Editor.settings.thumbSize * aspect * 1/origin.width;
                    bitmap.scaleY = Editor.settings.thumbSize * 1/origin.height;
                    bitmap.regX = this.width/2;
                    bitmap.regY = this.height/2;
                    bitmap.name = files[actualFile].name;

                    bitmap.trueWidth = obrazek.width = obrazek.width;
                    bitmap.trueHeight = obrazek.height = obrazek.height;

                    bitmap.regX = bitmap.trueWidth/2;
                    bitmap.regY = bitmap.trueHeight/2;

                    var projectImage = new Editor.ProjectImage();
                    projectImage.thumbnail = obrazek.minThumb;
                    projectImage.minUrl = obrazek.thumb;
                    projectImage.waitingForUpload = true;
                    projectImage.init( files[actualFile], obrazek.min, obrazek.thumb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height );
                    projectImage.minSize = obrazek.minSize;
                    projectImage.thumbSize = obrazek.thumbSize;

                    Editor.adminProject.addProjectImage( projectImage );
                    imagesContent.appendChild( projectImage.html );
                    imagesArray.push( projectImage );

                    Editor.uploader.addItemToUpload( projectImage );
                    Editor.uploader.upload();

                    Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), files[actualFile].name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );
                    projectImage.addEventListener( 'uploaded', function( data ){

                        var projectImage = data.target;

                        var dataToUpload = {

                            projectImageUID : projectImage.uid,
                            minUrl : projectImage.miniatureUrl,
                            thumbnail : projectImage.thumbnail,
                            imageUrl : projectImage.imageUrl,
                            uploadID : projectImage.uploadID

                        };

                        Editor.webSocketControllers.projectImage.update( dataToUpload );

                    });

                    if( actualFile < images-1 ){

                        actualFile++;
                        URL.revokeObjectURL( url );
                        upload_image();
                        ima++;

                    }

                    else {

                        fileReader = null;

                    }
                };

            };

        }
            upload_image();

        };

        return uploader;

    };



     /**
    * Generuje przyciski do zmiany ilości wyświetlanych kolumn dla podglądu plików
    *
    * @method generateColumnButtons
    * @param {String} type Typ columnButton pro|ama
    */
    p.generateColumnButtons = function( type ){

        var columnButton = document.createElement('div');
        var Editor = this.editor;
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




    p.generateLayersTool = function(){

        var Editor = this.editor;
        var tool = document.createElement('div');
        tool.id = 'layers-container-tool';
        tool.className = 'tool closed';

        var innerContainer = document.createElement('div');
        innerContainer.id = 'layersContent';

        var title = document.createElement('h3');
        title.innerHTML = 'Warstwy';

        var layers = document.createElement('div');
        layers.id = 'editorLayers';

        var toolMainContent = document.createElement('div');
        toolMainContent.id = "layers-main-content"

        innerContainer.appendChild( toolMainContent );

        toolMainContent.appendChild( title );
        toolMainContent.appendChild( layers );

        var toolHelper = document.createElement('span');
        toolHelper.className = 'toolHelper';
        toolHelper.innerHTML = '<i></i><span>Tutaj możesz działać na warstwach</span>';

        tool.appendChild( toolHelper );

        var toolButton = document.createElement('span');
        toolButton.id = 'layers-container-tool_button';
        toolButton.className = 'tool-button';
        toolButton.setAttribute('data-content', 'layersContent');

        var toolsContainer = document.getElementById("toolsContent");
        toolsContainer.appendChild( innerContainer );

        tool.appendChild( toolButton );
        //tool.appendChild( innerContainer );

        //Ps.initialize(layers);

        return tool;

    };





    /**
        * Generuje box z narzędziami
        *
        * @method generateTopMenu
        * @param {String} type Typ toolsBoxa pro|ama
        */
    p.generateTopMenu = function(){

            var Editor = this.editor;

            var tool = document.createElement('div');
            tool.id = 'top-menu';
            tool.className = 'displayController';
            tool.style.height = topMenuHeight + "px";

            var addVerticalRuller = document.createElement('div');
            addVerticalRuller.className = "ruller-vertical tools-rooler";

            addVerticalRuller.innerHTML = "Vertical";

            addVerticalRuller.addEventListener('click', function(){

                var verticalRuller = new Editor.EditorRullerHelper_Vertical( "#01aeae", 'dashed' );
                Editor.stage.getIRulersLayer().addChildAt( verticalRuller, 0  );

            });

            var addHorizontalRuller = document.createElement('div');
            addHorizontalRuller.className = "ruller-horizontal tools-rooler";
            addHorizontalRuller.innerHTML = 'Horizontal';

            addHorizontalRuller.addEventListener('click', function(){

                var horizontalRuller = new Editor.EditorRullerHelper_Horizontal( "#01aeae", 'dashed' );
                Editor.stage.getIRulersLayer().addChildAt( horizontalRuller, 0 );

            });

            var libraryButton = document.createElement('div');
            libraryButton.className = 'libraryButton';



            var addHistoryButtons = document.createElement('div');
            addHistoryButtons.className = "history_buttons";

            var addHistoryBack = document.createElement('div');
            addHistoryBack.className = "history_back unactive";

            var addHistoryNext = document.createElement('div');
            addHistoryNext.className = "history_next unactive";

            addHistoryButtons.appendChild( libraryButton );
            addHistoryButtons.appendChild( addHistoryBack );
            addHistoryButtons.appendChild( addHistoryNext );


            /*addHistoryBack.addEventListener('click', function(){

                var horizontalRuller = new Editor.EditorRullerHelper_Horizontal( "#01aeae", 'dashed' );
                Editor.stage.getIRulersLayer().addChildAt( horizontalRuller, 0 );

            });*/

            var addTopToolbar = document.createElement('div');
            addTopToolbar.className = "top_toolbar";

            var addEditorConfiguration = document.createElement('div');
            addEditorConfiguration.className = "editor_configuration unactive top_menu_icons";

            var addRulesTools = document.createElement('div');
            addRulesTools.className = "rules_tools unactive top_menu_icons";

            var addTextTools = document.createElement('div');
            addTextTools.className = "text_tools unactive top_menu_icons";

            var addEditableAreaTools = document.createElement('div');
            addEditableAreaTools.className = "editable_area_tools unactive top_menu_icons";


            addTopToolbar.appendChild( addEditorConfiguration );
            addTopToolbar.appendChild( addRulesTools );
            addTopToolbar.appendChild( addTextTools );
            addTopToolbar.appendChild( addEditableAreaTools );


            var addSaveCheckButtons = document.createElement('div');
            addSaveCheckButtons.className = "savecheck_toolbar";

            var addBasketButton = document.createElement('div');
            addBasketButton.className = "basket_tool top_menu_icons";

            addBasketButton.appendChild( this.generateExtendedBoxMenu("cart_info") );

            var addSaveButton = document.createElement('div');
            addSaveButton.className = "save_tool unactive top_menu_icons";

            var addCheckoutButton = document.createElement('div');
            addCheckoutButton.className = "checkout_button unactive";



            addSaveCheckButtons.appendChild( addSaveButton );
            addSaveCheckButtons.appendChild( addBasketButton );
            addSaveCheckButtons.appendChild( addCheckoutButton );


            var pencilTopIcon = document.createElement('div');
            pencilTopIcon.className = "pencil_icon";




/*
            var lableHistoryBack = document.createElement('label');
            var objHistoryBack = document.createElement('input');
            objHistoryBack.type = 'button';
            objHistoryBack.name = "History_Back";
            objHistoryBack.value = "";
            objHistoryBack.id = 'History_Back';
            lableHistoryNext.appendChild( objHistoryBack );
*/




            /*
            var lableXPos = document.createElement('label');
            var xPos = document.createElement('input');
            xPos.type = 'text';
            xPos.name = "xPos";
            xPos.value= "";
            xPos.className = 'x_value';
            xPos.id = 'objectXPosition';
            lableXPos.className = 'x_value_label';
            lableXPos.innerHTML = 'x:';
            lableXPos.appendChild( xPos );

            xPos.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();

                if( editing_id ){

                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setPosition_leftCorner( parseInt($('#objectXPosition').val()), parseInt($('#objectYPosition').val()) );

                }

            });

            var lableYPos = document.createElement('label');
            var yPos = document.createElement('input');
            yPos.type = 'text';
            yPos.name = "yPos";
            yPos.value = "";
            yPos.className = 'y_value';
            yPos.id = 'objectYPosition';
            lableYPos.className = 'y_value_label';
            lableYPos.innerHTML = 'y:';
            lableYPos.appendChild( yPos );

            yPos.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();

                if( editing_id ){

                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setPosition_leftCorner( parseInt($('#objectXPosition').val()), parseInt($('#objectYPosition').val()) );

                }

            });

            var lableHeight = document.createElement('label');
            var objHeight = document.createElement('input');
            objHeight.type = 'text';
            objHeight.name = "objectHeight";
            objHeight.value = "";
            objHeight.id = 'objectHeight';
            lableHeight.innerHTML = 'height:';
            lableHeight.appendChild( objHeight );
            lableHeight.className = 'size_height_label';
            objHeight.className = 'size_height';


            var lableWidth = document.createElement('label');
            var objWidth = document.createElement('input');
            objWidth.type = 'text';
            objWidth.name = "objWidth";
            objWidth.value = "";
            objWidth.id = 'objectWidth';
            lableWidth.className = 'size_width_label';
            objWidth.className = 'size_width';
            lableWidth.innerHTML = 'width:';
            lableWidth.appendChild( objWidth );

            objWidth.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();

                if( editing_id ){

                    var editingObject = Editor.stage.getObjectById( editing_id );

                    if( editingObject instanceof Editor.ProposedPosition || editingObject instanceof Editor.ProposedTextPosition ){

                        //editingObject.setTrueHeight( size_Y );
                        editingObject.setTrueWidth( parseInt($('input#objectWidth').val()) );

                        if( editingObject instanceof Editor.ProposedPosition ){


                            if( editingObject.children ){

                                editingObject.updateInsideObjects();

                            }

                        }

                        editingObject._updateShape();
                        editingObject.dispatchEvent('resize');
                        Editor.tools.update();
                    }
                    //editingObject.setPosition_leftCorner( parseInt($('#objectXPosition').val()), parseInt($('#objectYPosition').val()) );

                }

            });

            var sizeContainer = document.createElement('div');
            sizeContainer.className = 'size_container';
            sizeContainer.appendChild(lableHeight);
            sizeContainer.appendChild(lableWidth);

            var positionContainer = document.createElement('div');
            positionContainer.className = 'position_container';
            positionContainer.appendChild (lableXPos);
            positionContainer.appendChild (lableYPos);






            objHeight.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();

                if( editing_id ){

                    var editingObject = Editor.stage.getObjectById( editing_id );

                    if( editingObject instanceof Editor.ProposedPosition || editingObject instanceof Editor.ProposedTextPosition ){

                        //editingObject.setTrueHeight( size_Y );
                        editingObject.setTrueHeight( parseInt($('input#objectHeight').val()) );

                        if( editingObject instanceof Editor.ProposedPosition ){


                            if( editingObject.children ){

                                editingObject.updateInsideObjects();

                            }

                        }

                        editingObject._updateShape();
                        editingObject.dispatchEvent('resize');
                        Editor.tools.update();
                    }
                    //editingObject.setPosition_leftCorner( parseInt($('#objectXPosition').val()), parseInt($('#objectYPosition').val()) );

                }

            });
            */


            var zoomButtons = document.createElement("div");
            zoomButtons.className = 'zoomButtons';
            zoomButtons.id = 'zoomButtons';


            var zoomButtonPlus = document.createElement("div");
            zoomButtonPlus.className = 'zoomButtonPlus';
            zoomButtonPlus.id = 'zoomButtonPlus';

            zoomButtonPlus.addEventListener('click', function ( e ){

                var zoomButtonPlusEvent = new createjs.Event( "stageScroll" );


                if( Editor.getStage().scaleX < 4.7 ){

                    Editor.getStage().scaleX += 0.1;
                    Editor.getStage().scaleY += 0.1;

                    var sliderValue = Editor.getStage().scaleX;
                    $( "#zoomSlider" ).slider( { value: sliderValue } );

                    Editor.stage.dispatchEventForAllObject( zoomButtonPlusEvent );

                    Editor.stage.redrawRulers();
                    Editor.stage.updateNetHelper();


                }

            });


            var zoomButtonMinus = document.createElement("div");
            zoomButtonMinus.className = 'zoomButtonMinus';
            zoomButtonMinus.id = 'zoomButtonMinus';

            zoomButtonMinus.addEventListener('click',function ( e ){

                var zoomButtonMinusEvent = new createjs.Event( "stageScroll" );

                if( Editor.getStage().scaleX > 0.3 ){

                    var sliderValue = Editor.getStage().scaleX;
                    $( "#zoomSlider" ).slider( { value: sliderValue } );

                    Editor.stage.dispatchEventForAllObject( zoomButtonMinusEvent );

                    Editor.getStage().scaleX -= 0.1;
                    Editor.getStage().scaleY -= 0.1;
                    Editor.stage.redrawRulers();
                    Editor.stage.updateNetHelper();


                }

            });


            var zoomTopSlider = document.getElementById("zoomSlider");

            /*
            zoomTopSlider.addEventListener('mousemove', function( e ){

                var zoomValue = $( "#zoomSlider" ).slider( "value" );

                Editor.getStage().scaleX = -zoomValue;
                Editor.getStage().scaleY = -zoomValue;

                Editor.stage.redrawRulers();
                Editor.stage.updateNetHelper();


                console.log("zoomTopSlider --->> SLIDER ON MOUSEMOVE");

            });*/


            $("#zoomSlider").slider({

                value: 1.0,
                step: 0.00002,
                max: 4.8,
                min: 0.3,


                slide: function( event ){

                    var zoomSlider = new createjs.Event( "stageScroll" );
                    var zoomValue = $( "#zoomSlider" ).slider( "value" );

                    Editor.getStage().scaleX = zoomValue;
                    Editor.getStage().scaleY = zoomValue;

                    Editor.stage.redrawRulers();
                    Editor.stage.updateNetHelper();

                    if( userType == 'user' ){

                        var mainLayerSize = Editor.stage.getMainLayer().getTransformedBounds();
                        var area = Editor.stage.getVisibleAreaSize();

                        if( area.width > mainLayerSize.width ){

                            Editor.stage.centerCameraX();
                        }
                        if( area.height > mainLayerSize.height ){

                            Editor.stage.centerCameraY();

                        }

                    }

                    Editor.stage.dispatchEventForAllObject( zoomSlider );


                },

                change: function( event ){

                    var zoomSlider = new createjs.Event( "stageScroll" );
                    var zoomValue = $( "#zoomSlider" ).slider( "value" );

                    Editor.getStage().scaleX = zoomValue;
                    Editor.getStage().scaleY = zoomValue;

                    if( userType == 'user' ){

                        var mainLayerSize = Editor.stage.getMainLayer().getTransformedBounds();
                        var area = Editor.stage.getVisibleAreaSize();

                        if( area.width > mainLayerSize.width ){

                            Editor.stage.centerCameraX();
                        }
                        if( area.height > mainLayerSize.height ){

                            Editor.stage.centerCameraY();

                        }

                    }

                    Editor.stage.dispatchEventForAllObject( zoomSlider );

                    Editor.stage.redrawRulers();
                    Editor.stage.updateNetHelper();

                },

                stop: function( event ){

                    var zoomSlider = new createjs.Event( "stageScroll" );
                    var zoomValue = $( "#zoomSlider" ).slider( "value" );

                    Editor.getStage().scaleX = -zoomValue;
                    Editor.getStage().scaleY = -zoomValue;

                    if( userType == 'user' ){

                        var mainLayerSize = Editor.stage.getMainLayer().getTransformedBounds();
                        var area = Editor.stage.getVisibleAreaSize();

                        if( area.width > mainLayerSize.width ){

                            Editor.stage.centerCameraX();
                        }
                        if( area.height > mainLayerSize.height ){

                            Editor.stage.centerCameraY();

                        }

                    }

                    Editor.stage.dispatchEventForAllObject( zoomSlider );

                    Editor.stage.redrawRulers();
                    Editor.stage.updateNetHelper();

                    //editingObject.alpha = alphaValue;

                }

            });



            var centerZoomAtStage = document.createElement("div");
            centerZoomAtStage.id = 'centerZoomAtStage';
            centerZoomAtStage.className = 'centerZoomAtStage';

            centerZoomAtStage.addEventListener('click',function ( e ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                var centerZoomAtStageEvent = new createjs.Event( "stageScroll" );

                var currentViewPages = Editor.stage.getPages();

                var currentEditableArea = currentViewPages[0];

                //var obj = Editor.stage.getObjectById( this.getAttribute('data-local-id') );

                Editor.stage.centerAnyObject( currentEditableArea );

                //Editor.stage.dispatchEventForAllObject( centerZoomAtStageEvent );

                //Editor.stage.redrawRulers();
                //Editor.stage.updateNetHelper();

            });


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

            zoomButtons.appendChild( zoomButtonMinus );
            zoomButtons.appendChild( zoomTopSlider );
            zoomButtons.appendChild( zoomButtonPlus );
            zoomButtons.appendChild( centerZoomAtStage );
            zoomButtons.appendChild( useMagneticLines );

            var editingInfo = document.createElement('div');
            editingInfo.className = 'editingInfo';
            editingInfo.innerHTML = '<h5>Informacje edytora:</h5>'


            var formatInfo = document.createElement('div');
            formatInfo.className = 'formatInfo';

            var formatInfoTitle = document.createElement('div');
            formatInfoTitle.className = 'title';
            formatInfoTitle.innerHTML = 'Format:';

            var formatInfoContent = document.createElement('div');
            formatInfoContent.className = 'content';


            formatInfo.appendChild( formatInfoTitle );
            formatInfo.appendChild( formatInfoContent );

            var viewInfo = document.createElement('div');
            viewInfo.className = 'viewInfo';
            viewInfo.innerHTML = '<div class="title">Widok:</div><div class="content"></div>';

            var themeInfo = document.createElement('div');
            themeInfo.className = 'themeInfo';
            themeInfo.innerHTML = '<div class="title">Motyw:</div><div class="content">---</div>';


            editingInfo.appendChild( formatInfo );
            editingInfo.appendChild( viewInfo );
            editingInfo.appendChild( themeInfo );

            tool.appendChild( pencilTopIcon );
            tool.appendChild( editingInfo );
            //tool.appendChild( positionContainer );
            //tool.appendChild( sizeContainer );
            //tool.appendChild( addVerticalRuller ); //Zakomentowane na chwilkę (r05l1npl)
            //tool.appendChild( addHorizontalRuller ); //Zakomentowane na chwilkę (r05l1npl)
            tool.appendChild( addSaveCheckButtons );
            tool.appendChild( addTopToolbar );
            tool.appendChild( zoomButtons );
            tool.appendChild( addHistoryButtons );

            return tool;

        };


        /**
        * Generuje box rozszerzający narzędzia
        *
        * @method generateExtendedBoxMenu
        * @param {String} identify Typ ExtendedTopBox pro|ama
        */

        p.generateExtendedBoxMenu = function( identify ){

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

        p.resizeToUserObject = function ( obj ){

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

            //console.log( this.editor.getStage() );
            var newScale = destinationMaxWidth / this.editor.getStage().getBounds().width;

            if ( destinationMaxHeight < ( this.editor.getStage().getBounds().height * newScale ) ) {

                newScale =  destinationMaxHeight  / this.editor.getStage().getBounds().height;

            }

            this.editor.getStage().scaleX = newScale;
            this.editor.getStage().scaleY = newScale;

            this.editor.stage.centerCameraXuser();
            this.editor.stage.centerCameraYuser();

        };


export {TemplateModule};
