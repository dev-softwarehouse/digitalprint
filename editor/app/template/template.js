
    /**
    * Moduł zarządzający wyglądem edytora, odpowiada za stworzenie odpowiednich bloków, nie są one tutaj uzupełniane.
    * Tym zajmuje się templateAdministration
    *
    * @module templateModule_admin
    */
    var templateModule = (function(){
        
        window.onbeforeunload=function() { return 'Uwaga - opuszczasz stronę edytora - wszystkie Twoje zmiany są zapisane.' };

        var topMenuHeight = 80;
        var menuDuration = 500;
        var helperDuration = 300;
        
        var projectThemeBlock = function( theme ){
            
            var elem = document.createElement('div');
            //elem.className = 'themeBlock';
            
            return elem;
            
        };
        

        /**
        * Generuje cały wygląd edytora
        *
        * @method generateEditor
        */
        var generateEditor = function( info, type ){
                    
            generateToolsBox( type, info );
            //generateThemes( info.themes );
            
        };


        var editableAreaSettingsForm = function( areaInstance ){

            var formBox = document.createElement('div');
            formBox.className = 'formBox';

            var label = document.createElement('label');
            label.innerHTML = 'Wakat: ';

            var vacancy = document.createElement('input');
            vacancy.id = 'pageWakatLeft';
            vacancy.type = 'checkbox';

            if( areaInstance.settings && areaInstance.settings.vacancy ){

                vacancy.checked = true;

            }
            else {

                vacancy.checked = false;

            }

            label.appendChild( vacancy );

            formBox.appendChild( label );

            return formBox;

        };

        var editableAreaConfig = function( areaInstance ){

            $.ajax({

                url : 'templates/editableAreaSettings.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    $('#editableAreaSettings .modal-body').html( editableAreaSettingsForm( areaInstance ) );  


                    //                    
                    $('#editableAreaSettings').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });   
                    
                    $('#editableAreaSettings').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });
                    
                    $('#editableAreaSettings').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });

                    $('#editableAreaSettings .modal-footer button').on('click', function(){

                        var data = {

                            settings : {

                                'vacancy' : ( ( document.getElementById('pageWakatLeft').checked)? true : false )
                                
                            }

                        };

                        Editor.webSocketControllers.page.update( data );

                    });

                }

            });

        };


        /**
        * Generuje podgląd stron motywu głównego
        *
        * @method mainThemePagesPreview
        * @param {Object} pages Tablica stron motywu
        */
        var mainThemePagesPreview = function( pages ){

            $.ajax({

                url : 'templates/themePages.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    for( var i=0; i < pages.length; i++ ){

                        var page = document.createElement('div');
                        page.className = 'themePagePreview';
                        page.style.backgroundImage = 'url(' + pages[i].url + ')';

                        var  pageTitle = document.createElement('div');
                        pageTitle.className = 'themePagePreviewName';
                        pageTitle.innerHTML = pages[i].name;

                        page.appendChild( pageTitle );

                        $('#themePagesPreview .modal-body').append( page );

                    }

                    $('#themePagesPreview').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });   
                    
                    $('#themePagesPreview').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });
                    
                    $('#themePagesPreview').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });

                }

            });

        };
        /**
        * Generuje box rozszerzający narzędzia
        *
        * @method generateExtendedBoxMenu
        * @param {String} identify Typ ExtendedTopBox pro|ama
        */ 

        var generateExtendedBoxMenu = function( identify ){

            var extendedBoxMenu = document.createElement('div');
            var boxContent = document.createElement('div');
            var borderFx = document.createElement('div');

            extendedBoxMenu.id = identify;
            extendedBoxMenu.className = 'extended_box_menu';
            boxContent.className = 'box_menu_content';
            borderFx.className = "border_fx";


            boxContent.appendChild( borderFx );
            extendedBoxMenu.appendChild( boxContent ); 
  
                
            

            return extendedBoxMenu;
        }


        /**
        * Generuje box z narzędziami
        *
        * @method generateTopMenu
        * @param {String} type Typ toolsBoxa pro|ama
        */        
        var generateTopMenu = function(){
          
            var tool = document.createElement('div');
            tool.id = 'top-menu';
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

            
            var addHistoryButtons = document.createElement('div');
            addHistoryButtons.className = "history_buttons";

            var addHistoryBack = document.createElement('div');
            addHistoryBack.className = "history_back unactive";
            
            var addHistoryNext = document.createElement('div');
            addHistoryNext.className = "history_next unactive";

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

                
            //Tu teraz ^^


            var addBasketButton = document.createElement('div');
            addBasketButton.className = "basket_tool top_menu_icons";
          
            addBasketButton.appendChild( generateExtendedBoxMenu("cart_info") );
      
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
            
            tool.appendChild( pencilTopIcon );
            tool.appendChild( positionContainer );
            tool.appendChild( sizeContainer );
            tool.appendChild( addVerticalRuller ); //Zakomentowane na chwilkę (r05l1npl)
            tool.appendChild( addHorizontalRuller ); //Zakomentowane na chwilkę (r05l1npl)
            tool.appendChild( addSaveCheckButtons );
            tool.appendChild( addTopToolbar );
            tool.appendChild( addHistoryButtons );
            
      
            return tool;

        };
        
        var initToolBoxEvents = function(){
        
            $(".tool-button").on('click', function(){
                
                $('#toolsContent > *').removeClass('active-tool-content');
                
                if( $(this).hasClass('active') ){

                        $("#toolsBox").removeClass('open').animate( {'left' : -241 }, menuDuration );
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
            tools.style.height = ( window.innerHeight - topMenuHeight ) + "px";
            //tools.style.width = (toolContentWidth + 60 ) + "px";
            
            
            var toolsContainer = document.createElement('div');
            toolsContainer.id = 'toolsContainer';
            
            var toolsContent = document.createElement('div');
            toolsContent.id = 'toolsContent';
            //toolsContent.style.width = toolContentWidth + "px";

            tools.appendChild( toolsContent );

            
            document.body.appendChild( tools );
            document.body.appendChild( generateTopMenu() );   
            

            toolsContainer.appendChild( generateAttributesTool() );
            toolsContainer.appendChild( generateThemes() );
            toolsContainer.appendChild( generateViews( info.views ) );
            toolsContainer.appendChild( generateProposedTemplates() );
            toolsContainer.appendChild( generateImagesTool( type ) );
            toolsContainer.appendChild( generateFormatSettings() );
            toolsContainer.appendChild( generateLayersTool() );
           // toolsContainer.appendChild( generateTextTool() );
           // toolsContainer.appendChild( generateProposedPositionTool() );
            
            
            tools.appendChild( toolsContainer );

            var toolsContent_height = $('#toolsContent').height();

            toolsContainer.style.marginTop = ( toolsContent_height - toolsContainer.offsetHeight )/2 + "px";
            
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
                
            var attributesSelector = document.createElement('div');
            attributesSelector.id = 'attributesSelector';

            var attributesOptionGeneration = document.createElement('div');
            attributesOptionGeneration.id = 'attributesOptionGeneration';
            attributesOptionGeneration.innerHTML = 'Dostosuj wygląd edytora względem cech:';

            toolContent.appendChild( attributesSelector );
            toolContent.appendChild( attributesOptionGeneration );

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
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz definiować wygląd edytora poprzez atrybuty produktu</span>';
            
            tool.appendChild( toolHelper );
            /*
            var toolContentButtons = document.createElement('div');
            toolContentButtons.className = 'function-buttons';
            toolContentButtons.innerHTML = '<span>Generuj wszystke przypadki</span>';
            
            var addAttributesCase = document.createElement('span');
            addAttributesCase.id = 'addAttributesCase';
            addAttributesCase.innerHTML = 'Dodaj przypadek atrybutów';
            addAttributesCase.addEventListener('click', function(){
                
                $.ajax( {
                    url: 'http://api.digitalprint.pro/ps_types/'+ Editor.getProductId()+'/ps_product_options/forEditor/',
                    success: function(data){

                        console.log('ATRYBUTY');
                        console.log( Editor.generateAttributesOptions_Select() );
                        generateAddAttributesTool();
                        
                    }
                    
                });     
                
            });
            
            toolContentButtons.appendChild( addAttributesCase );
            
            toolContent.appendChild( toolContentButtons );
            */
                        
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

                var data = {

                    width : Editor.adminProject.format.getWidth(),
                    height : Editor.adminProject.format.getHeight(),
                    slope : Editor.adminProject.format.getSlope(),
                    rotation : 0

                };

                //console.log('chce dodac strone o parametrach');
                //console.log( data );

                Editor.webSocketControllers.page.add( Editor.adminProject.format.view.getId(), 'test', data.width, data.height, data.order, data.slope, data.rotation );

                /*
                console.log("TEST");
                console.log( Editor.getProjectId() );
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
                        
                        console.log("TUtaj tez jest");
                        //var test2 = new Editor.EditableArea($("#editable_plane_name").val(), parseFloat($("#editable_plane_width").val()), parseFloat($("#editable_plane_height").val()), null,  parseFloat($("#editable_plane_slope").val()));
                        //test2.init();
                        console.log(Editor.adminProject.view.getId());
                        Editor.webSocketControllers.addPage( { viewID : Editor.adminProject.view.getId() ,name : $("#editable_plane_name").val(), width : parseFloat($("#editable_plane_width").val()), height : parseFloat($("#editable_plane_height").val()), slope : parseFloat($("#editable_plane_slope").val()), x : 0, y : 0, rotation : 0 } );
                        //Editor.adminProject.view.addPage( test2 );
                        
                    });
                }
                */
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

                var proposed = new Editor.Text2("testowy");

                var moveFunction = function( e ){

                    var position = Editor.stage.getMousePosition( e.stageX, e.stageY );
                    //console.log( [Math.abs(proposed.x - position[0]), Math.abs(proposed.y - position[1])] );
                    proposed.updateCreator( ( position[0] - proposed.x + (proposed.trueWidth/2) ), ( position[1] - proposed.y ) + (proposed.trueHeight/2) );
                    proposed.setTrueHeight( Math.abs( position[1] - proposed.y) + (proposed.trueHeight/2), true );
                    proposed.setTrueWidth( Math.abs( position[0] - proposed.x) + (proposed.trueWidth/2), true );
                    proposed.setBounds( 0,0 ,proposed.trueWidth, proposed.trueHeight );

                };

                var unclickFunction = function( e ){

                    Editor.getStage().removeEventListener('stagemousemove', moveFunction);
                    Editor.getStage().removeEventListener('stagemouseup', unclickFunction);
                    proposed.stopCreator();
                    proposed.initEvents();
                    proposed.init( 50 );
                    proposed.generateCursorMap();
                    
                    proposed.parent.removeChild( proposed );
                    
                    var saving = Editor.adminProject.view.addObject( proposed );
                    
                    //proposed.saveToDB();

                };

                var clickFunction = function( e ){

                    var stagePosition = Editor.getStage().globalToLocal( e.stageX, e.stageY);
                    var pos = Editor.stage.getMousePosition( e.stageX, e.stageY );

                    Editor.stage.getObjectById( MAIN_LAYER ).addChild( proposed );
                    Editor.stage.addObject( proposed );
                    proposed.initCreator();

                    proposed.x = pos[0];
                    proposed.y = pos[1];
                    proposed.setPosition_leftCorner( pos[0], pos[1] );

                    Editor.getStage().removeEventListener('stagemousedown', clickFunction);
                    Editor.getStage().addEventListener('stagemousemove', moveFunction);
                    Editor.getStage().addEventListener('stagemouseup', unclickFunction);

                    Editor.updateLayers();

                };

                Editor.getStage().addEventListener('stagemousedown', clickFunction);

            });
            
            return tool;
            
        };
        
        var warningView = function( content ){
        
            $.ajax({
                
                url : 'templates/warning.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){
                    
                    $('body').append( data );
                    
                    $('.warning-description').html( content );
                    
                    $('#warning').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });   
                    
                    $('#warning').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });
                    
                    $('#warning').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });
                    
                }
                
            });
            
        };


        var baseObjectAttributesLayers = function(){

            $.ajax({
                
                url : 'templates/baseObjectAttributesLayers.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){
                    
                    $('body').append( data );
                                        
                    $('#baseObjectAttributesLayers');
                    
                    $('#baseObjectAttributesLayers').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });
                    
                    $('#baseObjectAttributesLayers').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });
                    
                }
                
            });

        };

        
        var formatSelectWindow = function( content, title ){

            $.ajax({

                url : 'templates/formatSelection.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );
                    
                    //console.log( content );
                    //console.log('^^^');
                    document.querySelector("#selectFormat .modal-body").appendChild( content );
                    //$('#selectFormat .modal-body').append( content );
                    
                    $('#selectFormat').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });
                    
                    $('#selectFormat').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });
                    
                    $('#selectFormat').modal({
                        
                        keyboard: false,
                        backdrop: 'static'
                        
                    });

                }

            });

        };


        var selectProjectView = function( projectsData ){      
            
            $.ajax({
                
                url : 'templates/projectSelection.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){
                
                    //login.innerHTML = data;
                    $('body').append( data );
                    
                     var win = document.createElement('div');
                     win.className = 'projectsList';

                     for( var i=0; i < projectsData.length; i++ ){

                        var projectItem = document.createElement('div');
                        projectItem.className = ((projectsData[i].active)? 'active' : '');
                        projectItem.setAttribute('data-project-id', projectsData[i]._id );
                        var projectTitle = document.createElement('span');
                        projectTitle.className = 'projectName ';
                        var projectImage = document.createElement('img');
                        projectImage.src = projectsData[i].projectMin;
                        var remover = document.createElement('span');
                        remover.className = 'project-remover';
                        remover.setAttribute('data-project-id', projectsData[i]._id );
                        var name = document.createElement('span');
                        name.class='projectName';
                        name.innerHTML = projectsData[i].name;
                        var activate = document.createElement('span');
                        activate.className = 'activateAdminProject';
                        activate.setAttribute('data-project-id', projectsData[i]._id );
                         
                        activate.addEventListener('click', function( e ){
                            
                            e.stopPropagation();
                            Editor.webSocketControllers.setActiveAdminProject( { typeID : Editor.getProductId(), projectID : this.getAttribute('data-project-id') } );
                        
                        });
                        
                         
                        projectItem.appendChild( projectTitle );
                        projectItem.appendChild( projectImage );
                        projectItem.appendChild( remover );
                        projectItem.appendChild( name );
                        projectItem.appendChild( activate );
                        
                        remover.addEventListener('click', function( e ){
                            
                            e.stopPropagation();
                            Editor.webSocketControllers.adminProject.remove( { ID : this.getAttribute('data-project-id') });
                        
                        });
                         
                        projectItem.addEventListener('click', function( e ){
                            e.stopPropagation();
                            //console.log( e );
                            $('#selectProject').remove();                
                            Editor.webSocketControllers.adminProject.load( e.currentTarget.getAttribute('data-project-id') );
                        });

                        win.appendChild( projectItem );

                    }
                
                    $('#selectProject .modal-body').append( win );
                    
                    $('#selectProject').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });
                    
                    $('#selectProject').on( 'hidden.bs.modal', function(){
                        $(this).remove();  
                    });
                    
                    $('#selectProject').modal({
                        
                        keyboard: false,
                        backdrop: 'static'
                        
                    });
                    
                    $("button#addNewProject").on('click', function( e ){
                        
                        e.stopPropagation();

                        $.ajax({
                        
                            url : 'templates/newProject.html',
                            type : 'GET',
                            crossDomain : true,
                            success : function( data ){
                             
                                $('body').append( data );
                                
                                $("#addNewAdminProject").on('click', function(){
                                    
                                    var projectName = $('input#project-name').val();
                                    //console.log(Editor.getProductId());
                                    Editor.webSocketControllers.addAdminProject( { name : projectName, typeID : Editor.getProductId() } );
                                    $("#newProject").remove();
                                    
                                });
                                
                                $('#newProject').on('shown.bs.modal', function() {
                                    $(this).find('.modal-dialog').css({
                                        'margin-top': function () {
                                            return (window.innerHeight/2-($(this).outerHeight() / 2));
                                        },
                                        'margin-left': function () {
                                            return (window.innerWidth/2-($(this).outerWidth() / 2));
                                        }
                                    });
                                });
                                
                                $('#newProject').on( 'hidden.bs.modal', function(){
                                    $("#newProject").remove();
                                });
                                
                                $('#newProject').modal({
                                    keyboard: false,
                                    backdrop: 'static'

                                });
                                
                            }
                            
                        });
                                         
                    });
                    
                },
            
            });
            
        };
        
        var generateLayersTool = function(){

            var tool = document.createElement('div');
            tool.id = 'layers-container-tool';
            tool.className = 'tool closed';

            var innerContainer = document.createElement('div');
            innerContainer.id = 'layersContent';

            var title = document.createElement('h3');
            title.innerHTML = 'Warstwy';

            var layers = document.createElement('div');
            layers.id = 'editorLayers';

            innerContainer.appendChild( title );
            innerContainer.appendChild( layers );

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

            return tool;

        };


        var updateThemeTemplate = function( currentPage, newPage ){

            $.ajax({

                url : 'templates/updateThemePage.html',
                crossDomain : true,
                type : 'GET',
                success : function( data){

                    $('body').append( data );
                    
                    $('#updateThemePageWindow').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });
                    
                    $('#updateThemePageWindow').on( 'hidden.bs.modal', function(){
                        $(this).remove();  
                    });
                    
                    $('#updateThemePageWindow').modal({
                      keyboard: false
                    });

                    //console.log( '========================= info jakie otrzynmało okno: ' );
                    //console.log( currentPage );
                    //console.log( newPage );

                    $('#currentThemePagePreviev').append('<img src="'+ currentPage.url +'">');
                    $('#newThemePagePreview').append('<img src="'+ newPage.url +'">');

                    $('button#updateThemePage').on('click', function( e ){

                        e.stopPropagation();
                        Editor.webSocketControllers.themePage.update( Editor.adminProject.format.view.page.themePage.getID(), Editor.pageThemToSave, $('#newThemePagePreview img').attr('src') );

                    });


                },
                error :function(){

                    alert('nie udalo sie pobrać szablonu widoku');

                }

            });

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
            
            var buttonContainer = createElement('div');
            buttonContainer.id = 'imageButtonContainer';


            var toolButton = document.createElement('span');
            toolButton.id = 'image-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'imagesContent');
            
            /* Zmiana ilości kolumn dla widoku listy zdjęć*/

            var columnButtonsContainer = document.createElement('div');
            columnButtonsContainer.className = 'columnButtonsContainer';

            var changePhotoColumns = document.createElement('div');
            changePhotoColumns.id = 'changePhotoColumns';
            changePhotoColumns.className = 'buttonscolumns';
            //changePhotoColumns.innerHTML = 'ILOść kolumn';

            var change2PhotoColumns = document.createElement('div');            
            change2PhotoColumns.className = 'button-2columns';

            buttonContainer.appendChild( changePhotoColumns );
            buttonContainer.appendChild( changePhotoColumns );


            change2PhotoColumns.addEventListener('click', function(){
                
                $("#imagesList").removeClass('photoItem');
                $("#imagesList").removeClass('twoColumnsImages');
                $("#imagesList").removeClass('threeColumnsImages');
                $("#imagesList").removeClass('sixColumnsImages');
              
                $("#imagesList").addClass("twoColumnsImages");  

                var scrollbarImages = $('#imagesListScroll'); 
                var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
                scrollbarImages.update();
            
            });

            var change3PhotoColumns = document.createElement('div');            
            change3PhotoColumns.className = 'button-3columns';
            
            change3PhotoColumns.addEventListener('click', function(){
                
                $("#imagesList").removeClass('photoItem');
                $("#imagesList").removeClass('twoColumnsImages');
                $("#imagesList").removeClass('threeColumnsImages');
                $("#imagesList").removeClass('sixColumnsImages');
              
                $("#imagesList").addClass("threeColumnsImages");  

                var scrollbarImages = $('#imagesListScroll'); 
                var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
                scrollbarImages.update();
            
            });

            var change6PhotoColumns = document.createElement('div');            
            change6PhotoColumns.className = 'button-6columns';

            change6PhotoColumns.addEventListener('click', function(){
                
                $("#imagesList").removeClass('photoItem');
                $("#imagesList").removeClass('twoColumnsImages');
                $("#imagesList").removeClass('threeColumnsImages');
                $("#imagesList").removeClass('sixColumnsImages');

                //$("#imagesList").removeClass('image-remover');     
                //$("#imagesList").removeClass('uploaded');

              
                $("#imagesList").addClass("sixColumnsImages");  

                var scrollbarImages = $('#imagesListScroll'); 
                var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
                scrollbarImages.update();
            
            });


            innerContainer.appendChild( changePhotoColumns );

            columnButtonsContainer.appendChild( change2PhotoColumns );
            columnButtonsContainer.appendChild( change3PhotoColumns );
            columnButtonsContainer.appendChild( change6PhotoColumns );

            changePhotoColumns.appendChild( columnButtonsContainer );

        /* KONIEC zmiany kolumn dla widoku listy themów */
            
            
            var imagesScrollContainer = document.createElement('div');
            imagesScrollContainer.id = 'imagesListScroll';
            
            
            // --- Stworzenie scorllbara || ubranie w funkcje generowanie takiego szablonu
            var imagesScrollBar = document.createElement("DIV");
            imagesScrollBar.className = "scrollbar";
            

            var imagesScroll = document.createElement("DIV");
            imagesScroll.className = "track";

            var imagesScrollThumb = document.createElement("DIV");
            imagesScrollThumb.className = "thumb";

            var imagesScrollEnd = document.createElement("DIV");
            imagesScrollEnd.className = "end";

            var imagesScrollViewport = document.createElement("DIV");
            imagesScrollViewport.className = "viewport";

            var imagesScrollOverview = document.createElement("DIV");
            imagesScrollOverview.className = "overview";        

            imagesScrollBar.appendChild( imagesScroll );
            imagesScroll.appendChild( imagesScrollThumb );
            imagesScrollThumb.appendChild( imagesScrollEnd );

            imagesScrollViewport.appendChild( imagesScrollOverview );
            imagesScrollContainer.appendChild( imagesScrollBar );
            imagesScrollContainer.appendChild( imagesScrollViewport );
            // --- scroll zostal juz uworzony
            
            
            var imagesList = document.createElement('div');
            imagesList.id = 'imagesList';
                       
           
            imagesScrollOverview.appendChild( imagesList );
            


            imagesScrollContainer.addEventListener('dragover', function(e){
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                
            }, false);

            imagesScrollContainer.addEventListener('drop', function(e){

                e.stopPropagation();
                e.preventDefault();
                e.cancelBubble = true;
                Editor.handleFileSelect(e, 2);

            }, false);
            
            
            tool.appendChild( toolButton );
            tool.appendChild( innerContainer );
            
            var toolsContainer = document.getElementById("toolsContent");
            
            toolsContainer.appendChild( innerContainer );

            innerContainer.appendChild( imagesScrollContainer );
            
            

            
            return tool;
        


        };
        
        
        var makeWindowTitleBox = function( icon,  title, exitCallback ){
        
            var titleBar = document.createElement('div');
            titleBar.className = 'window-title-bar';
            
            var icon = document.createElement('span');
            icon.className = 'window-icon';
            icon.innerHTML = icon;
            
            var title = document.createElement('span');
            title.className = 'window-title';
            title.innerHTML = title;
            
            var closeWindow = document.createElement('span');
            closeWindow.className = 'window-close';
            
            closeWindow.addEventListener('click', function(){
            
                
                
            });
            
            titleBar.appendChild( icon );
            titleBar.appendChild( title );
            titleBar.appendChild( closeWindow );
            
            return titleBar;
            
        };
        
        
        var initLoginWindow = function(){

            var login = document.createElement('div');
            login.id = 'loginForm';
            
            $.ajax({
                
                url : 'templates/login.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){
                
                    //login.innerHTML = data;
                    
                    // alert('login window');

                    $('body').append( data );
                    
                    $('#loginForm').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });
                    
                    $('#loginForm').on( 'hidden.bs.modal', function(){
                        $(this).remove();  
                    });
                    
                    $('#loginForm').modal({
                      keyboard: false
                    });
                    
                    
                },
            
            });
            
            
        };
        
        // inicjalizacja najmniejszego okienka np dla logowania/ usuwania obiektów
        // type to rodzaj np alert, warning itp
        var initSmallWindow = function( icon, title, content, type ){
        
            var window = document.createElement('div');
            window.className = 'window small ' + type;
            
            window.appendChild( makeWindowTitleBox( icon, title ) );
            
            return window;
            
        };
        
        
        var initLoginForm = function(){
        
            var content
            
        
        };
        

         /* Zmiana ilości kolumn dla widoku listy zdjęć*/

        var changePhotoColumns = document.createElement('div');
        changePhotoColumns.id = 'changePhotoColumns';
        changePhotoColumns.className = 'buttonscolumns';
        changePhotoColumns.innerHTML = 'ILOść kolumn';

        var change2PhotoColumns = document.createElement('div');            
        change2PhotoColumns.className = 'button-2columns';

        change2PhotoColumns.addEventListener('click', function(){
            
            $("#imagesList").removeClass('photoItem');
            $("#imagesList").removeClass('twoColumnsImages');
            $("#imagesList").removeClass('threeColumnsImages');
            $("#imagesList").removeClass('sixColumnsImages');
          
            $("#imagesList").addClass("twoColumnsImages");  

            var scrollbarImages = $('#imagesListScroll'); 
            var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
            scrollbarImages.update();
        
        });

        var change3PhotoColumns = document.createElement('div');            
        change3PhotoColumns.className = 'button-3columns';
        
        change3PhotoColumns.addEventListener('click', function(){
            
            $("#imagesList").removeClass('photoItem');
            $("#imagesList").removeClass('twoColumnsImages');
            $("#imagesList").removeClass('threeColumnsImages');
            $("#imagesList").removeClass('sixColumnsImages');
          
            $("#imagesList").addClass("threeColumnsImages");  

            var scrollbarImages = $('#imagesListScroll'); 
            var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
            scrollbarImages.update();
        
        });

        var change6PhotoColumns = document.createElement('div');            
        change6PhotoColumns.className = 'button-6columns';

        change6PhotoColumns.addEventListener('click', function(){
            
            $("#imagesList").removeClass('photoItem');
            $("#imagesList").removeClass('twoColumnsImages');
            $("#imagesList").removeClass('threeColumnsImages');
            $("#imagesList").removeClass('sixColumnsImages');
          
            $("#imagesList").addClass("sixColumnsImages");  

            var scrollbarImages = $('#imagesListScroll'); 
            var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
            scrollbarImages.update();
        
        });


        //innerContainer.appendChild( changePhotoColumns );


        changePhotoColumns.appendChild( change2PhotoColumns );
        changePhotoColumns.appendChild( change3PhotoColumns );
        changePhotoColumns.appendChild( change6PhotoColumns );

        /* KONIEC zmiany kolumn dla widoku listy themów */




        var saveThemePageWindow = function( image, currentTheme ){
            
            if( Editor.adminProject.format.theme.getID() == null ){

                alert('najpierw musisz aktywować motyw!');
                return;

            }

            $.ajax({
                
                url : 'templates/savePageTheme.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){
                        

                        $('body').append( data );
                        $("#themePagePreview").append( '<img id="themeThumbnail" src="'+image+'">' );
                        
                        $('#saveThemePageWindow').on('shown.bs.modal', function() {
                            
                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });
                            
                        });  
                        
                        var projectThemes = Editor.adminProject.format.getThemes();
                        
                        for( var i=0; i < projectThemes.length; i++ ){
                                                    
                            var themeTitle = document.createElement('span');
                            themeTitle.className = 'themeName';
                            themeTitle.innerHTML = projectThemes[i].name;       
                            themeTitle.setAttribute('data-theme-name', projectThemes[i].name );

                            var showPages = document.createElement('span');
                            showPages.className = 'EditPages';
                            showPages.addEventListener('click', function(){

                                Editor.template.overlayBlock( content, 'big');

                            });

                            var theme = document.createElement('div');
                            theme.className = 'themeMiniature';
                            theme.setAttribute( 'data-theme-id', projectThemes[i]._id );
                            theme.setAttribute( 'data-main-theme-id', projectThemes[i].MainTheme );
                            theme.appendChild( themeTitle );
                          
                            theme.addEventListener('click', function(){
                                
                                if( $(this).hasClass('active') )
                                    $(this).removeClass('active');
                                else 
                                    $(this).addClass('active')
                                
                            });
                            
                            $('#saveThemePageWindow #addThemePageThemesSelection').append( theme );
                            
                        }
                    
                        //$('#saveThemePageWindow #addThemePageThemesSelection').html('miejsce na motywy');
                    
                        $('#saveThemePageWindow').on( 'hidden.bs.modal', function(){
                            $(this).remove();
                        });
                    
                        $("button#saveThemePage").on('click', function(){
                                
                                var loader = document.createElement('div');
                                loader.className = 'loader';

                                var loaderInfo = document.createElement('div');
                                loaderInfo.className = 'loaderInfo';
                                loaderInfo.innerHTML = 'Trwa zapisywanie strony do motywu';

                                //loader.appendChild( loaderInfo );



                                document.body.appendChild( loader );

                                var name = $("#themePageName").val();
                                var base64 =  $("#themeThumbnail").attr('src');
                                var themeID = $('.themeMiniature.active').attr('data-theme-id');
                                var mainThemeID = $(".themeMiniature.active").attr('data-main-theme-id');
                                var order = 0;
                                var width = Editor.pageThemToSave.width;
                                var height = Editor.pageThemToSave.height;
                                var backgroundObjects = Editor.pageThemToSave.backgroundObjects;
                                var foregroundObjects = Editor.pageThemToSave.foregroundObjects;
                                var addGlobaly = document.getElementById("addGlobaly").checked;  

                                //console.log( Editor.pageThemToSave );
                                //console.log('TO CO MA BYĆ ZAPISANE W STRONIE MOTYWU');
                                //console.log( backgroundObjects );
                                //console.log( foregroundObjects );

                                if( addGlobaly ){

                                    loader.addEventListener('Theme_copyPageFromMainTheme', function( data ){

                                        var _this = this;

                                        $(this).animate({'opacity': 0}, function(){

                                            $(_this).remove();

                                        });

                                    });

                                    loader.setAttribute( 'waiting-for', '_getUsedPages' );

                                    Editor.webSocketControllers.mainTheme.addPage( mainThemeID, name, width, height, backgroundObjects, foregroundObjects, order, base64, function( data ){
                                      
                                        Editor.webSocketControllers.theme.copyPageFromMainTheme( themeID, data.page._id, data.mainThemeID );

                                    });

                                }
                                else {
                                    loader.addEventListener('_getUsedPages', function( data ){

                                        var _this = this;

                                        $(this).animate({'opacity': 0}, function(){

                                            $(_this).remove();

                                        });

                                    });
                                    loader.setAttribute( 'waiting-for', '_getUsedPages');
                                    Editor.webSocketControllers.theme.addLocalPage( themeID, name, width, height, backgroundObjects, foregroundObjects, order, base64 )

                                }


                                

                        });
                    
                        setTimeout( function(){
                            $('#saveThemePageWindow').modal({
                                keyboard: false,
                                backdrop: 'static'
                            });      
                        }, 300 );
                },
                error : function( data ){
                    
                }
            
            });
        
        };
        
        
        // musi miec dodany atrybut is, któy mowi o tym skąd owa strona pochodzi:)
        var themePageElement = function( themePageObject ){

            var theme = Editor.adminProject.format.theme;

            var element = null;

            if( themePageObject.is == 'copied' ){

                var element = document.createElement('div');
                element.className = 'addedThemePage themePageElement';
                element.setAttribute('data-theme-page-id', themePageObject._id );
                element.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+themePageObject.url + ')';

                var removeFromProjectTheme = document.createElement('div');
                removeFromProjectTheme.className = 'removeThemePageFromProjectTheme';
                removeFromProjectTheme.setAttribute('data-theme-page-id', themePageObject._id );

                removeFromProjectTheme.innerHTML = '-';

                removeFromProjectTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.theme.removeCopiedPage( this.getAttribute( 'data-theme-page-id' ), Editor.adminProject.format.theme.getID() );

                });

                element.addEventListener('click', function( e ){

                    e.stopPropagation();
                    //console.log('następuje załadowanie strony motywu');
                    Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){

                        Editor.adminProject.format.view.page.loadThemePage( data );
                        //Editor.adminProject.format.view.page.get()['pageObject'].loadThemePage( data );

                    });

                });

                element.appendChild( removeFromProjectTheme );

            }
            else if( themePageObject.is == 'main' ){

                element = document.createElement('div');
                element.className = 'mainThemePage themePageElement';
                element.setAttribute('data-theme-page-id', themePageObject._id );
                element.style.backgroundImage = 'url(' + themePageObject.url + ')';

                var addToLocalTheme = document.createElement('div');
                addToLocalTheme.className = 'addThemePageToProjectTheme';
                addToLocalTheme.setAttribute('data-theme-page-id', themePageObject._id );
                addToLocalTheme.setAttribute('main-theme-id', theme.getParentThemeID() );
                addToLocalTheme.innerHTML = '+';

                addToLocalTheme.addEventListener( 'click', function( e ){

                    e.stopPropagation();
                    var mainThemePageId = this.getAttribute( 'data-theme-page-id' );
                    var mainThemeId = this.getAttribute('main-theme-id');
                    Editor.webSocketControllers.theme.copyPageFromMainTheme( theme.getID(), mainThemePageId, mainThemeId );

                });

                element.appendChild( addToLocalTheme );

                element.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){

                        //Editor.adminProject.format.view.page.loadThemePage( data );
                        Editor.adminProject.format.view.page.loadThemePage( data );

                    });

                });

            }
            else if( themePageObject.is == 'local' ){

                element = document.createElement('div');
                element.className = 'localThemePage themePageElement';
                element.setAttribute('theme-page-id', themePageObject._id );
                element.style.backgroundImage = 'url(' + themePageObject.url + ')';

                var removeElement = document.createElement('div');
                removeElement.className = 'removeThemePage';
                removeElement.setAttribute( 'data-theme-page-id', themePageObject._id );
                removeElement.setAttribute( 'themeID', theme.getID() );
                removeElement.innerHTML = '-';

                removeElement.addEventListener('click', function ( e ) {
                    
                    e.stopPropagation();
                    Editor.webSocketControllers.theme.removeLocalPage( this.getAttribute( 'theme-id' ), this.getAttribute( 'data-theme-page-id' ) );

                });

                var copyToMainThemeElement = document.createElement('div');
                copyToMainThemeElement.className = 'copyPageToMainTheme';
                copyToMainThemeElement.setAttribute('main-theme-id', theme.getParentThemeID() );
                copyToMainThemeElement.setAttribute('theme-id', theme.getID() );
                copyToMainThemeElement.setAttribute('theme-page-id', themePageObject._id );

                copyToMainThemeElement.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.mainTheme.copyPageFromLocal( this.getAttribute('main-theme-id'), this.getAttribute('theme-id'), this.getAttribute('theme-page-id') );

                });

                element.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('theme-page-id'), function( data ){

                        Editor.adminProject.format.view.page.loadThemePage( data );

                    });

                });

                element.appendChild( copyToMainThemeElement );
                element.appendChild( removeElement );

            }

            return element;

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
            addNewView_button.className = 'button-fw';
            addNewView_button.innerHTML = "Stwórz kolejny widok";
            
            addNewView_button.addEventListener('click', function(){
                
                $.ajax({
                    
                    url : 'templates/newThemeCategory.html',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){
                    
                        $('body').append( data );
                        
                    }
                    
                
                });
                
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
                
                    var viewsLength = Editor.adminProject.format.getViews().length;
                    
                    //alert('ilosc widoków ' + viewsLength);
                    
                    Editor.webSocketControllers.view.add( $("input[name=viewName]").val(), viewsLength, Editor.adminProject.format.getDbId() );

                    /*
                    var newView  = Editor.adminProject.addView( { name : $("input[name=viewName]").val(), order : viewsLength } );
                
                    newView.then( function( data ){
                    
                        alert('widok dodany pomyslnie');
                        console.log( "informacja zwrotna o dodanym widoku" );
                        console.log( data );
                        
                        var promise = Editor.adminProject.loadViews();
                        
                        promise.then( function( data ){
                            
                            Editor.templateAdministaration.updateViews( data );
                            
                        }, function(){});
                        
                        
                        
                    }, function(){
                    
                        alert('widok nie bedzie dodany');
                        
                    });
                    */
                    
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
            //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";
            
            document.getElementById("toolsContent").appendChild( toolContent );
            
            /*
            // tworzenie obiektu pozwalającego dodać szablon pozycji dla danego motywu
            var addProposedTemplates = document.createElement("span");
            addProposedTemplates.id = 'addProposedTemplate';
            addProposedTemplates.className = 'add';
            addProposedTemplates.innerHTML = "Dodaj gotowy szablon";
            
            addProposedTemplates.addEventListener('click', function(){
                
                ///alert('musze pobrać informacje z bazy danych');
                
                Editor.proposedTemplates.getProposedTemplates();
                
            
            });
            
            toolContent.appendChild( addProposedTemplates );
            */
            
            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz zmienić układ zdjęć</span>';
            
            tool.appendChild( toolHelper );
            
            
            return tool;
            
        };


        /**
        * Generuje element z ustawieniami formatu
        *
        * @method generateProposedTemplates
        * @param {int} theme_page id strony motywu
        */
        

        /**
        * Wyświetla okno z możliwością skopiowania motywów
        *
        * @method generateThemes
        * @param {Array} themes Tablica obiektów motywów
        */
        var copyThemesFromOtherFormatWindow = function( formatData ){

            $.ajax({

                url: 'templates/copyThemes.html',
                type: 'GET',
                crossDomain: true,
                success : function( data ){

                    $('body').append( data );

                    // trzeba zrobić szablony na wszystkie rzeczy tego typu i wywoływaće np tak: themeElement( name, id, { click : callback } )
                    var themes = document.createElement('div');

                    for( var i=0; i < formatData.Themes.length; i++ ){

                        var theme = document.createElement('div');
                        theme.className = 'themeToCopy';
                        theme.setAttribute( 'theme-id', formatData.Themes[i]._id );
                        theme.style.backgroundImage = 'url('+formatData.Themes[i].url+')';

                        var themeName = document.createElement('div');
                        themeName.className = 'themeName';
                        themeName.innerHTML = formatData.Themes[i].name;

                        theme.appendChild( themeName );

                        theme.addEventListener('click', function( e ){

                            e.stopPropagation();

                            if( $(this).hasClass('selected') )
                                $(this).removeClass('selected')
                            else 
                                $(this).addClass('selected')

                        });

                        themes.appendChild( theme );

                    }

                    document.querySelector("#copyThemesFromFormat .modal-body").appendChild( themes );
                    document.querySelector('button#copyThemes').addEventListener('click', function( e ){

                        e.stopPropagation();

                        var selected = document.querySelectorAll('.themeToCopy.selected');

                        var themesToCopy = [];

                        for( var i=0; i < selected.length; i++ ){

                            //console.log('-=-=-=-=-=-=-=-=-=-');
                            //console.log(selected[i].getAttribute('theme-id'));
                            themesToCopy.push( selected[i].getAttribute('theme-id') );

                        }

                        //console.log('co mam skopiować!');
                        //console.log( themesToCopy );
                        Editor.webSocketControllers.theme.copyThemes( Editor.adminProject.format.getDbId(), themesToCopy );

                    });

                    $('#copyThemesFromFormat').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#copyThemesFromFormat').on( 'hidden.bs.modal', function(){

                        $(this).remove();

                    });
                
                    
                    $('#copyThemesFromFormat').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });

                }

            });

        };


        var createTinyScrollElements = function(){

            // --- Stworzenie scorllbara || ubranie w funkcje generowanie takiego szablonu
            var imagesScrollBar = document.createElement("DIV");
            imagesScrollBar.className = "scrollbar";
            

            var imagesScroll = document.createElement("DIV");
            imagesScroll.className = "track";

            var imagesScrollThumb = document.createElement("DIV");
            imagesScrollThumb.className = "thumb";

            var imagesScrollEnd = document.createElement("DIV");
            imagesScrollEnd.className = "end";

            var imagesScrollViewport = document.createElement("DIV");
            imagesScrollViewport.className = "viewport";

            var imagesScrollOverview = document.createElement("DIV");
            imagesScrollOverview.className = "overview";        

            imagesScrollBar.appendChild( imagesScroll );
            imagesScroll.appendChild( imagesScrollThumb );
            imagesScrollThumb.appendChild( imagesScrollEnd );

            imagesScrollViewport.appendChild( imagesScrollOverview );
            imagesScrollContainer.appendChild( imagesScrollBar );
            imagesScrollContainer.appendChild( imagesScrollViewport );
            // --- scroll zostal juz uworzony

            return {

                scrollObject : imagesScrollContainer,
                viewport : imagesScrollViewport

            };

        };


        /**
        * Generuje element motywów
        *
        * @method generateThemes
        * @param {Array} themes Tablica obiektów motywów
        */
        var generateThemes = function( themes ){
            
            /* Zmiana ilości kolumn dla widoku listy głownych themów */

            var changeThemeColumns = document.createElement('div');
            changeThemeColumns.id = 'changeThemeColumns';
            changeThemeColumns.className = 'buttonscolumns'
            changeThemeColumns.innerHTML = 'ILOść kolumn';

            var change2ThemeColumns = document.createElement('div');            
            change2ThemeColumns.className = 'button-2columns'

            var columnButtonsContainer = document.createElement('div');
            columnButtonsContainer.className = 'columnButtonsContainer';

            change2ThemeColumns.addEventListener('click', function(){
                
                $("#project-themes-list").removeClass('all-theme-list');
                $("#project-themes-list").removeClass('twocolumnsthemelist');
                $("#project-themes-list").removeClass('threecolumnsthemelist');
                $("#project-themes-list").removeClass('sixcolumnsthemelist');
              
                $("#project-themes-list").addClass("twocolumnsthemelist");  
            
            });
            

            var change3ThemeColumns = document.createElement('div');           
            change3ThemeColumns.className = 'button-3columns'

            change3ThemeColumns.addEventListener('click', function(){
                
                $("#project-themes-list").removeClass('all-theme-list');
                $("#project-themes-list").removeClass('twocolumnsthemelist');
                $("#project-themes-list").removeClass('threecolumnsthemelist');
                $("#project-themes-list").removeClass('sixcolumnsthemelist');
              
                $("#project-themes-list").addClass("threecolumnsthemelist");                                 
            
            });


            var change6ThemeColumns = document.createElement('div');            
            change6ThemeColumns.className = 'button-6columns'

            change6ThemeColumns.addEventListener('click', function(){

                $("#project-themes-list").removeClass('all-theme-list');
                $("#project-themes-list").removeClass('twocolumnsthemelist');
                $("#project-themes-list").removeClass('threecolumnsthemelist');
                $("#project-themes-list").removeClass('sixcolumnsthemelist');
              
                $("#project-themes-list").addClass("sixcolumnsthemelist");                                 
            
            });

            columnButtonsContainer.appendChild( change2ThemeColumns );
            columnButtonsContainer.appendChild( change3ThemeColumns );
            columnButtonsContainer.appendChild( change6ThemeColumns );

            changeThemeColumns.appendChild( columnButtonsContainer );


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
            
        

            var themesList = document.createElement('div');
            themesList.id = 'project-themes-list';

            var addCreatedTheme = document.createElement('span');
            addCreatedTheme.id = 'addCreatedTheme';
            addCreatedTheme.className = 'add button-fw';
            addCreatedTheme.innerHTML = 'Dodaj juz gotowy motyw';
            
            
            allThemes.appendChild( addCreatedTheme );
            
            // tworzenie obiektu pozwalającego dodać szablon pozycji dla danego motywu
            var addTheme = document.createElement("span");
            addTheme.id = 'addNewTheme';
            addTheme.className = 'button-fw';
            addTheme.innerHTML = "Dodaj motyw";
            
                        
            
            // tworzenie obiektu pozwalającego dodać juz istniejacy motywa i go zmodyfikować
            var useTheme = document.createElement("span");
            useTheme.id = 'useTheme';
            useTheme.className = 'add';
            useTheme.innerHTML = "Użyj gotowego motywu";
            

            var copyThemesFrom = document.createElement('span');
            copyThemesFrom.id = 'copyThemesFrom';
            copyThemesFrom.className = 'button-fw';
            copyThemesFrom.innerHTML = 'Kopiuj motywy z innego formatu';

            allThemes.appendChild( addTheme );
            allThemes.appendChild( copyThemesFrom );
            allThemes.appendChild( changeThemeColumns ); 
            allThemes.appendChild( themesList );
            
            var themeName = document.createElement('div');
            themeName.className = 'currentThemeName';
                
            var backToAllThemes = document.createElement('div');
            backToAllThemes.id = 'backToAllThemes';
            backToAllThemes.className = 'button-fw';
            backToAllThemes.innerHTML = 'Powróć do wszystkich motywów';
            
            var goToThemeImages = document.createElement('div');
            goToThemeImages.id = 'goToThemeImages';
            goToThemeImages.className = 'button-fw';
            goToThemeImages.innerHTML = 'Przejdz do zdjec motywu';

            goToThemeImages.addEventListener('click', function( e ){

                e.stopPropagation();
                $("#allProjectThemes").animate({ left: '-200%'},200 );
                $("#themeContent").animate({ left: '-100%' },200 );
                $('#themeImages').animate({left:'0'}, 200 );

            });

            backToAllThemes.addEventListener('click', function(){
                
                 $("#allProjectThemes").animate({ left: '0'},200 );
                 $("#themeContent").animate({ left: '100%' },200 );
                 $('#themeImages').animate({left:'200%'}, 200 );
            
            });
            
            var backToThemePages = document.createElement('div');
            backToThemePages.id = 'backToThemePages';
            backToThemePages.className = 'button-fw'
            backToThemePages.innerHTML = 'Powróć do widoku stron motywu';

            backToThemePages.addEventListener('click', function( e ){

                e.stopPropagation();
                $("#allProjectThemes").animate({ left: -$('#themes-content').outerWidth() },200 );
                $("#themeContent").animate({ left: '0' },200 );
                $('#themeImages').animate({left:'100%'}, 200 );

            });

            var themePagesList = document.createElement('ul');
            themePagesList.class = 'themePagesList';


            themeContent.appendChild( backToAllThemes ); 
            themeContent.appendChild( goToThemeImages );
            

            /* Zmiana ilości kolumn dla widoku listy themów */

            var changeColumns = document.createElement('div');
            changeColumns.id = 'changeColumns';
            changeColumns.className = 'buttonscolumns'
            changeColumns.innerHTML = 'ILOść kolumn';

            var change2Columns = document.createElement('div');            
            change2Columns.className = 'button-2columns'

            var columnButtonsContainer = document.createElement('div');
            columnButtonsContainer.className = 'columnButtonsContainer';

            change2Columns.addEventListener('click', function(){
                
                $("#themepages").removeClass('themePageElement');
                $("#themepages").removeClass('twoColumns');
                $("#themepages").removeClass('threeColumns');
                $("#themepages").removeClass('sixColumns');
              
                $("#themepages").addClass("twoColumns");  
            
            });
            

            var change3Columns = document.createElement('div');           
            change3Columns.className = 'button-3columns'

            change3Columns.addEventListener('click', function(){
                
                $("#themepages").removeClass('themePageElement');
                $("#themepages").removeClass('twoColumns');
                $("#themepages").removeClass('threeColumns');
                $("#themepages").removeClass('sixColumns');
              
                $("#themepages").addClass("threeColumns");                                 
            
            });


            var change6Columns = document.createElement('div');            
            change6Columns.className = 'button-6columns'

            change6Columns.addEventListener('click', function(){

                $("#themepages").removeClass('themePageElement');
                $("#themepages").removeClass('twoColumns');
                $("#themepages").removeClass('threeColumns');
                $("#themepages").removeClass('sixColumns');
              
                $("#themepages").addClass("sixColumns");                                 
            
            });


            columnButtonsContainer.appendChild( change2Columns );
            columnButtonsContainer.appendChild( change3Columns );
            columnButtonsContainer.appendChild( change6Columns );

            
            changeColumns.appendChild( columnButtonsContainer );

            /* KONIEC zmiany kolumn dla widoku listy themów */



           
            toolContent.appendChild( allThemes );
            toolContent.appendChild( themeContent );


            var themePagesList = document.createElement('ul');
            themePagesList.class = 'themePagesList';
            //themeContent.appendChild( backToAllThemes );   
            themeContent.appendChild( changeColumns ); 

            themeContent.appendChild( themeName );
            themeContent.appendChild( themeContent_pages );

            
            addCreatedTheme.addEventListener('click', function(){
            
                allThemesWindow();
                
            });
            
            
            addTheme.addEventListener('click', function(){
                //console.log('wlasnie tu');
                //alert('trzeba zaprojektować okno widoku');
                newThemeWindow();
                
            });
            

            copyThemesFrom.addEventListener('click', function(){

                Editor.webSocketControllers.adminProject.getFormats( Editor.adminProject.getProjectId(), function( data ){

                    //console.log( data );

                    var content = document.createElement('div');

                    for( var i=0; i < data.formats.length; i++ ){

                        var formatElem = document.createElement('div');
                        formatElem.className = 'format';
                        formatElem.setAttribute( 'format-id', data.formats[i]._id );

                        var formatInfo = document.createElement('div');
                        formatInfo.className = 'formatInfo';
                        formatInfo.innerHTML = 'Wymiary: ' + data.formats[i].width + 'x' + data.formats[i].height;
                        formatInfo.innerHTML += '<br>Spad: ' + data.formats[i].slope;
                        formatInfo.innerHTML += '<br>Motywów: ' + data.formats[i].Themes.length;

                        formatElem.appendChild( formatInfo );

                        formatElem.addEventListener('click', function( e ){

                            e.stopPropagation();
                            //console.log('nacisniety!!!');
                            var fID = this.getAttribute('format-id');
                            Editor.webSocketControllers.format.get( fID, function( data ){

                                //console.log( data );
                                //console.log('teraz powinienem wyświetlić okienko z wyborem stron motywów');

                                copyThemesFromOtherFormatWindow( data );

                            });

                        });

                        content.appendChild( formatElem );

                    }

                    //console.log( content );

                    formatSelectWindow( content, 'Z którego formatu chcesz skopiować motywy?' );

                });
                
                //Editor.webSocketControllers.theme.copyThemes( Editor.adminProject.format.getDbId(), 'lalala' );

            });
            
            var themeImages = document.createElement('div');
            themeImages.id = 'themeImages';
            
            var themeImagesDrop = document.createElement('div');
            themeImagesDrop.id = 'themeImagesDrop';

            themeImagesDrop.addEventListener('dragover', function( e ){

                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';

            });

            themeImagesDrop.addEventListener('drop', function( e ){
                
                e.preventDefault();
                //console.log( e );

                Editor.handleDropedFileToUpload( e, function( min, thumbnail, file ){

                    

                });

            });

            var themeImagesContainer = document.createElement('div');
            themeImagesContainer.id = 'themeImagesContainer';

            var themeImagesPhotos = document.createElement('div');
            themeImagesPhotos.className = 'themeImages';
            themeImagesPhotos.id = 'themeImagesPhotos';

            var themeImagesPhotosContent = document.createElement('div');
            themeImagesPhotosContent.className = 'content';
            themeImagesPhotos.appendChild( themeImagesPhotosContent );

            var themeBackgrounds = document.createElement('div');
            themeBackgrounds.className = 'themeImages';
            themeBackgrounds.id = 'themeImagesBackgrounds';

            var themeCliparts = document.createElement('div');
            themeCliparts.className = 'themeImages';
            themeCliparts.id = 'themeCliparts';

            var imageDestinationButtons = document.createElement('div');
            imageDestinationButtons.className = 'themeImagesDestination';

            var changeDestinationToPhotos = document.createElement('div');
            changeDestinationToPhotos.innerHTML = 'Z';
            changeDestinationToPhotos.id = 'themeImagesPhotosController';
            changeDestinationToPhotos.className = 'changeImageDestination';
            

            var changeDestinationToBackgrounds = document.createElement('div');
            changeDestinationToBackgrounds.innerHTML = 'B';
            changeDestinationToBackgrounds.id = 'themeImagesBackgroundController';
            changeDestinationToBackgrounds.className = 'changeImageDestination';

        
            var changeDestinationToCliparts = document.createElement('div');
            changeDestinationToCliparts.innerHTML = 'C';
            changeDestinationToCliparts.id = 'themeImagesClipartsController';
            changeDestinationToCliparts.className = 'changeImageDestination';



            changeDestinationToCliparts.addEventListener('click', function( e ){

                e.stopPropagation();

                //console.log('powinna byc zamiana na cliparty');
                activeClipartsThemeImages();

            });

            changeDestinationToBackgrounds.addEventListener('click', function( e ){

                e.stopPropagation();
                activeBackgroundThemeImages();

            });


            changeDestinationToPhotos.addEventListener('click', function( e ){

                e.stopPropagation();
                activePhotoThemeImages();
            
            });



            imageDestinationButtons.appendChild( changeDestinationToPhotos );
            imageDestinationButtons.appendChild( changeDestinationToBackgrounds );
            imageDestinationButtons.appendChild( changeDestinationToCliparts );

            themeImagesContainer.appendChild( themeImagesPhotos );
            themeImagesContainer.appendChild( themeBackgrounds );
            themeImagesContainer.appendChild( themeCliparts );

                        Ps.initialize( themeImagesPhotos );

            themeImages.appendChild( backToThemePages );
            themeImages.appendChild( imageDestinationButtons );
            themeImages.appendChild( themeImagesDrop );
            themeImages.appendChild( themeImagesContainer );

            toolContent.appendChild( themeImages );

            document.getElementById('toolsContent').appendChild( toolContent );
            
            return tool;
            
        };
        

        var activePhotoThemeImages = function(){

            $('#themeImagesPhotosController').addClass('selected');
            $('#themeImagesBackgroundController').removeClass('selected');
            $('#themeImagesClipartsController').removeClass('selected');

            $('#themeImagesContainer').attr('active-window', 'photo');
            $('#themeImagesPhotos').addClass('active');
            
            $('#themeImagesBackgrounds').removeClass('active');
            $('#themeCliparts').removeClass('active');
            

        };

  

        var activeBackgroundThemeImages = function(){

            $('#themeImagesContainer').attr('active-window', 'backgrounds');
            $('#themeImagesBackgrounds').addClass('active');

            $('#themeImagesPhotos').removeClass('active');
            $('#themeCliparts').removeClass('active');
            
                
            $('#themeImagesPhotosController').removeClass('selected');
            $('#themeImagesBackgroundController').addClass('selected');
            $('#themeImagesClipartsController').removeClass('selected');
  

        };


        var activeClipartsThemeImages = function(){

            $('#themeImagesContainer').attr('active-window', 'cliparts');
            $('#themeCliparts').addClass('active');

            $('#themeImagesBackgrounds').removeClass('active');
            $('#themeImagesPhotos').removeClass('active');


            $('#themeImagesPhotosController').removeClass('selected');
            $('#themeImagesBackgroundController').removeClass('selected');
            $('#themeImagesClipartsController').addClass('selected');
            
        };

        var allThemesWindow = function(){
            
            Editor.webSocketControllers.mainTheme.getAll();

        };
        

        
        
        // trzeba przniesc do modułu 'windows'
        var newThemeWindow = function(){
            
            var content = document.createElement('div');
            content.className = 'newThemeWindow-content';
            
            var dropBox = document.createElement('div');
            dropBox.className = 'image-drop';
            dropBox.id = 'image-container-tool_dropArea_2';
                        
            dropBox.addEventListener('dragover', function(e){
                //e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                
            }, false);

            dropBox.addEventListener('drop', function(e){

                //e.stopPropagation();
                e.preventDefault();
                //console.log('dropnięte zdjęcie motywu');
                //console.log( e.dataTransfer );
                
                var url = URL.createObjectURL( e.dataTransfer.files[0] );
                
                var loadedImage = new createjs.Bitmap( url );
                
                loadedImage.image.onload = function(){
                
                    loadedImage.origin = loadedImage.getBounds();
                    loadedImage.scale = {
                        x : loadedImage.origin.width,
                        y : loadedImage.origin.height
                    };
                    var obrazek = Thumbinator.generateThumb( loadedImage );
                    $('#image-container-tool_dropArea_2').html('');
                    $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');
                    
                }
                
            }, false);

            
            var form = document.createElement('div');
            form.className = 'form';
            
            var name = document.createElement('input');
            name.name = 'themeName';
            
            var category = document.createElement('input');
            category.name = 'categoryName';
            
            var newCategory = document.createElement('button');
            newCategory.id = 'newCategory';
            newCategory.value = 'Dodaj kategorię';
            
            var categorySelect = document.createElement('select');
            categorySelect.id = 'newThemeCategory-Select';
            categorySelect.className = 'themeCategorySelect';
            
            newCategory.addEventListener('click', function(){
                
                $.ajax({
                
                    url : 'templates/newThemeCategory.html',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){
                        
                        $('body').append( data );

                        $('#newThemeCategory').on('shown.bs.modal', function() {
                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });
                        });   


                        
                        $('#newThemeCategory .add-theme-category').on( 'click', function(){
                            Editor.webSocketControllers.themeCategory.add( $('#category-theme-name').val() );
                            $('#newThemeCategory').remove();
                        });

                        $('#newThemeCategory').on( 'hidden.bs.modal', function(){
                            $(this).remove();
                        });
                    
                        
                        $('#newThemeCategory').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });
                        
                    }
                    
                });
            
            });
            
            var save = document.createElement('span');
            save.className = 'content-button';
            save.innerHTML = 'Zapisz';
            
            
            save.addEventListener('click', function( ){

                //console.log( 'nacisniety!!! :)' );
                Editor.webSocketControllers.mainTheme.add( name.value, $('#newThemeCategory-Select').val(), $('#image-container-tool_dropArea_2 img').attr('src') );

            });
            
    
            Editor.webSocketControllers.themeCategory.getAll();
            
            content.appendChild( dropBox );
            content.appendChild( name );
            content.appendChild( newCategory );
            content.appendChild( categorySelect );
            content.appendChild( dropBox );
            content.appendChild( save );

            overlayBlock( content, 'normal' );

        };
        
        // trzeba przniesc do modułu 'windows'
        var themeEditWindow = function( theme ){
            
            var changes = {};
            
            var content = document.createElement('div');
            content.className = 'editThemeWindow-content';
            
            var dropBox = document.createElement('div');
            dropBox.className = 'image-drop';
            dropBox.id = 'image-container-tool_dropArea_2';
            
            var currentImage = document.createElement('img');
            currentImage.setAttribute('src', theme.url );
            
            dropBox.appendChild( currentImage );
            
            dropBox.addEventListener('dragover', function(e){
                //e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                
                
            }, false);

            dropBox.addEventListener('drop', function(e){
                
                dropBox.className = 'image-drop changed';
                //e.stopPropagation();
                e.preventDefault();
                //console.log('dropnięte zdjęcie motywu');
                //console.log( e.dataTransfer );
                
                var url = URL.createObjectURL( e.dataTransfer.files[0] );
                
                var loadedImage = new createjs.Bitmap( url );
                
                loadedImage.image.onload = function(){
                
                    loadedImage.origin = loadedImage.getBounds();
                    loadedImage.scale = {
                        x : loadedImage.origin.width,
                        y : loadedImage.origin.height
                    };
                    var obrazek = Thumbinator.generateThumb( loadedImage );
                    $('#image-container-tool_dropArea_2').html('');
                    $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');
                    
                }
                
            }, false);

            
            var form = document.createElement('div');
            form.className = 'form';
            
            var name = document.createElement('input');
            name.name = 'themeName';
            name.id = 'mainThemeEdit_name';
            name.value = theme.name;
            
            name.addEventListener('change', function(){
                name.className = 'changed';
            });

            var category = document.createElement('input');
            category.name = 'categoryName';
            
            var newCategory = document.createElement('button');
            newCategory.id = 'newCategory';
            newCategory.value = 'Dodaj kategorię';
            
            var categorySelect = document.createElement('select');
            categorySelect.id = 'editThemeCategory-Select';
            categorySelect.className = 'themeCategorySelect';
            
            categorySelect.addEventListener('change', function(){
                categorySelect.className = 'themeName changed';
            });
            
            newCategory.addEventListener('click', function(){
                
                $.ajax({
                
                    url : 'templates/newThemeCategory.html',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){
                        
                        $('body').append( data );

                        $('#newThemeCategory').on('shown.bs.modal', function() {
                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });
                        });
                        
                        $('#newThemeCategory .add-theme-category').on( 'click', function(){
                            Editor.webSocketControllers.themeCategory.add( $('#category-theme-name').val() );
                            $('#newThemeCategory').remove();
                        });

                        $('#newThemeCategory').on( 'hidden.bs.modal', function(){
                            $(this).remove();
                        });
                    
                        
                        $('#newThemeCategory').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });
                        
                    }
                    
                });
            
            });
            
            var save = document.createElement('span');
            save.className = 'content-button';
            save.innerHTML = 'Zamień';
            
            
            save.addEventListener('click', function( ){
                
                var changes = {};
                
                if( $('.editThemeWindow-content #mainThemeEdit_name').hasClass('changed') )
                    changes.name = $('.editThemeWindow-content #mainThemeEdit_name').val();
                if( $('.editThemeWindow-content #editThemeCategory-Select').hasClass('changed') )
                    changes.category = $('.editThemeWindow-content #editThemeCategory-Select').val();
                if( $('#image-container-tool_dropArea_2').hasClass('changed') )
                    changes.base64 = $('#image-container-tool_dropArea_2 img').attr('src');
                
                Editor.webSocketControllers.mainTheme.update( theme._id, changes );
                
            });
            
            Editor.webSocketControllers.themeCategory.getAll();
                
            content.appendChild( dropBox );
            content.appendChild( name );
            content.appendChild( newCategory );
            content.appendChild( categorySelect );
            content.appendChild( dropBox );
            content.appendChild( save );

            overlayBlock( content, 'normal' );

        };
        

        return {

            activePhotoThemeImages : activePhotoThemeImages,
            activeBackgroundThemeImages : activeBackgroundThemeImages,
            activeClipartsThemeImages : activeClipartsThemeImages,
            editableAreaConfig : editableAreaConfig,
            formatSelectWindow : formatSelectWindow,
            generateEditor : generateEditor,
            generateThemes : generateThemes,
            generateViews  : generateViews,
            initLoginWindow : initLoginWindow,
            overlayBlock   : overlayBlock,
            newThemeWindow : newThemeWindow,
            mainThemePagesPreview : mainThemePagesPreview,
            saveThemePageWindow : saveThemePageWindow,
            selectProjectView : selectProjectView,
            themeEditWindow : themeEditWindow,
            themePageElement : themePageElement,
            warningView : warningView,
            updateThemeTemplate : updateThemeTemplate,
            baseObjectAttributesLayers : baseObjectAttributesLayers,
            generateExtendedBoxMenu  : generateExtendedBoxMenu
        };
        
    
    })();
    
    export var template = templateModule;
