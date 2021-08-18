import {EditableArea} from './editablePlane';

	/**
	* Klasa reprezentująca menu kontekstowe dla bitmapy
	*
	* @class EditorBitmapContextMenu
	* @constructor
	*/
	function EditorBitmapContextMenu( editorBitmap ){

        this.editorBitmapInstance = editorBitmap;
        this.editor = editorBitmap.editor;
        this.toolsContainer = null;
        this.initAllTools();

	};


    var p = EditorBitmapContextMenu.prototype;


    p.deleteObject = function(){

        var _this = this.proposedPositionInstance;
        
        var deleteTool = document.createElement("div");
        deleteTool.id = "deleteBitmapTool";
        deleteTool.className = 'button';

        deleteTool.addEventListener('click', function( e ){
            
            _this.parent.parent.proposedImagePositions.remove(_this.parent.parent.proposedImagePositions.indexOf( _this ));
            _this.editor.tools.setEditingObject( null );
            _this.editor.tools.init();
            $("#proposedTemplate-toolsbox").remove();
            _this.parent.removeChild( _this );
            _this.editor.tools.setEditingObject(null);
            _this.editor.tools.init();

        });

        return deleteTool;

    };


    p.createFullSizeTool = function(){

        var _this = this;
        var bitmap = this.editorBitmapInstance;

        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'FButton';
        
        tool.appendChild( _this.editor.template.createToolhelper ("Dopasuj zdjęcie do strony") );

        $('#FButton').addClass("FButton");

        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            bitmap.setFullSize2();

            _this.editor.tools.init();

        });

        return tool;

    };

    p.createCenterTool = function(){

        var _this = this;
        var bitmap = this.editorBitmapInstance;


        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'CButton';
        //tool.innerHTML = 'C';

        tool.appendChild( _this.editor.template.createToolhelper ("Ustaw zdjęcie na środku strony") );

        $('#CButton').addClass("CButton");


        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            bitmap.center();

            _this.editor.tools.init();
            
        });

        return tool;

    };

    p.createBorderColorTool = function(){

        var _this = this;

        var colorInput = document.createElement('div');
        colorInput.id = "colorBorder";

        var currentColor = document.createElement('span');
        currentColor.id = 'current-text-color';
        
        colorInput.appendChild( currentColor );
        
        var colorPalette = document.createElement('div');
        colorPalette.id = 'colorPaletteBorder';
        
        colorInput.appendChild( colorPalette );
        
        var activeColors = _this.editor.adminProject.getActiveColors();

        for( var i=0; i < activeColors.length; i++ ){

            var colorElement = document.createElement('div');
            colorElement.className = 'colorPaletteElement';
            colorElement.style.backgroundColor = activeColors[i];

            colorElement.addEventListener('click', function( e ){

                e.stopPropagation();

                _this.editorBitmapInstance.setBorderColor( _this.editor.rgb2hex(this.style.backgroundColor) );
                _this.editorBitmapInstance.updateSimpleBorder();

            });

            colorPalette.appendChild( colorElement );

        }
        
        colorInput.addEventListener('click', function(){
        
            if( $("#colorPaletteBorder").hasClass('open') ){
             
                $("#colorPaletteBorder").removeClass('open');
                
            }else {
            
                $("#colorPaletteBorder").addClass('open');
                
            }
            
        });

        return colorInput; 

    };


    p.createShadowColorTool = function( ){

        var _this = this;

        var colorInput = document.createElement('div');
        colorInput.id = "colorPicker";

        var currentColor = document.createElement('span');
        currentColor.id = 'current-text-color';
        
        colorInput.appendChild( currentColor );
        
        var colorPalette = document.createElement('div');
        colorPalette.id = 'colorPalette';
        
        colorInput.appendChild( colorPalette );
        
        var activeColors = _this.editor.adminProject.getActiveColors();

        for( var i=0; i < activeColors.length; i++ ){

            var colorElement = document.createElement('div');
            colorElement.className = 'colorPaletteElement';
            colorElement.style.backgroundColor = activeColors[i];

            colorElement.addEventListener('click', function( e ){

                e.stopPropagation();

                _this.editorBitmapInstance.setShadowColor( _this.editor.rgb2hex(this.style.backgroundColor) );
                _this._updateToolBox();

            });

            colorPalette.appendChild( colorElement );

        }
        
        colorInput.addEventListener('click', function(){
        
            if( $("#colorPalette").hasClass('open') ){
             
                $("#colorPalette").removeClass('open');
                
            }else {
            
                $("#colorPalette").addClass('open');
                
            }
            
        });

        return colorInput;

    };


    p.layerUp = function(){

        var _this = this.editorBitmapInstance;

        var layerUp = document.createElement('div');
        layerUp.className = 'button';       
        layerUp.id = 'layerUpButton';


        layerUp.appendChild( _this.editor.template.createToolhelper ("Warstwa w górę") );


        layerUp.addEventListener('click', function( e ){

            e.stopPropagation();

            var editingObject = _this;
            
            var index = editingObject.parent.getChildIndex( editingObject );

            // jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
            // Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );

            // TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem
            if( index < editingObject.parent.children.length-1 ){

                editingObject.parent.setChildIndex( editingObject, index+1 );
                editingObject.order = index+1;

                var moveDownObject = editingObject.parent.getChildAt( index );
                moveDownObject.order = index;

            }
            else {

                
                if( editingObject.parent.name == 'backgroundLayer' ){

                    //console.log('mogę przenieść do warstwy wyżej');
                    var foreground = editingObject.parent.parent.foregroundLayer;
                    editingObject.parent.removeChild( editingObject );

                    foreground.addChildAt( editingObject, (( foreground.children.length>0 )? 1 : 0 ) );

                }else {
                    
                    //console.log('jest na samym dole warstwy');
                    //console.log( editingObject.parent );

                }   
                

            }

            var viewLayerInfo = _this.editor.adminProject.format.view.getLayerInfo();
            //console.log( viewLayerInfo );
            
            _this.editor.webSocketControllers.view.moveObjects( viewLayerInfo, _this.editor.adminProject.format.view.getId() );

        });

        return layerUp;  

    };


    p.layerDown = function(){

        var _this = this.editorBitmapInstance;


        var layerDown = document.createElement('div');
        layerDown.className = 'button';
        layerDown.id = 'layerDownButton';
        

        layerDown.appendChild( _this.editor.template.createToolhelper ("Warstwa w dół") );

        layerDown.addEventListener('click', function( e ){

            var editingObject = _this;
            
            var index = editingObject.parent.getChildIndex( editingObject );

            //console.log('aktualny indeks');
            //console.log( index );

            // jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
            // Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );

            // TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem


            if( index > 0 ){

                editingObject.parent.setChildIndex( editingObject, index-1 );

            }
            else {

                if( editingObject.parent.name == 'foregroundLayer' ){

                    //console.log( editingObject.parent.name );
                    //console.log( editingObject.parent );
                    //console.log('mogę przenieść do warstwy niżej');
                    var background = editingObject.parent.parent.backgroundLayer;
                    editingObject.parent.removeChild( editingObject );

                    if( background.children.length > 0 )
                        background.addChildAt( editingObject, background.children.length-1 );
                    else 
                        background.addChildAt( editingObject, background.children.length );

                }else {
                    
                    //console.log('jest na samym dole warstwy');
                    //console.log( editingObject.parent );

                }

            }

            var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();
            //console.log( viewLayerInfo );
            
            _this.editor.webSocketControllers.view.moveObjects( viewLayerInfo, Editor.adminProject.format.view.getId() );

        });

        return layerDown;  

    };


    p.attributeSettings = function(){

        var _this = this;

        var tools = document.createElement("div");
        tools.id = "editroBitmapAttributes";
        tools.className = 'button';

        tools.appendChild( _this.editor.template.createToolhelper ("Dodaj atrybuty") );
       // tools.innerHTML = 'Attr';

        tools.addEventListener('click', function( e ){

            e.stopPropagation();
            var selectedObject = _this.editor.stage.getObjectById( _this.editor.tools.getEditObject());

            _this.editor.webSocketControllers.editorBitmap.setBase( selectedObject.dbID, _this.editor.adminProject.format.view.getId() );

        });

        return tools;

    };


    p.deleteImage = function(){

        var _this = this.editorBitmapInstance;
        
        var deleteTool = document.createElement("div");
        deleteTool.id = "deleteBitmapTool";
        deleteTool.className = 'button';

        deleteTool.appendChild( _this.editor.template.createToolhelper ("Usuń zdjęcie z obszaru edycji") );
        
        deleteTool.addEventListener('click', function( e ){

            if( _this.getFirstImportantParent() instanceof EditableArea && userType == 'admin' ){

                _this.toolBox.element.parentNode.removeChild( _this.toolBox.element );
                _this.parent.removeChild( _this );
                _this.editor.tools.setEditingObject( null );
                _this.editor.tools.init();

            }else {

                _this.editor.webSocketControllers.editorBitmap.remove( _this.dbID , _this.editor.adminProject.format.view.getId() );    
                _this.editor.tools.setEditingObject( null );
                _this.editor.tools.init();

            }

        });

        return deleteTool;


    };





    /**
    * Inicjalizuje wszystkie narzędzia i dołącza je do tool boxa
    *
    * @method initAllTools
    */
    p.initAllTools = function(){

        var _this = this;

        var editingObject = this.editorBitmapInstance;     

        try{
            if ( editingObject.borderWidth == 0 ){

                editingObject.unDropBorder();
                    
            }
        }catch(e){}


        var tools = document.createElement("div");
        tools.id = "editorbitmap-toolsbox";
        tools.className = "tools-box";
        
        var userTools = document.createElement("div");
        userTools.className = "editorBitmapTools editorBitmapTools1";

        //console.log(editingObject.getFirstImportantParent());
        //console.log(this);

        if (  !( editingObject.getFirstImportantParent() instanceof EditableArea ) ){

            userTools.appendChild( this.layerDown() );
            userTools.appendChild( this.layerUp() );
            userTools.appendChild( this.attributeSettings() );
            userTools.appendChild( this.deleteImage() );


        }else if ( editingObject.getFirstImportantParent() instanceof EditableArea ){

           

            userTools.appendChild( this.layerDown() );
            userTools.appendChild( this.layerUp() );
            userTools.appendChild( this.createFullSizeTool() );
            userTools.appendChild( this.createCenterTool() );
           // userTools.appendChild( this.attributeSettings() );
            userTools.appendChild( this.deleteImage() );

        }
        
        //userTools.appendChild( this.createBorderColorTool() );
        //userTools.appendChild( this.dropShadow() );
        //userTools.appendChild( this.shadowOffset() );
        //userTools.appendChild( this.shadowBlur() );
        //userTools.appendChild( this.createShadowColorTool() );

        tools.appendChild( userTools );


        this.toolsContainer = tools;

        this.editorBitmapInstance.addEventListener( 'move', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.editorBitmapInstance.addEventListener('scale', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.editorBitmapInstance.addEventListener('rotate', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.editorBitmapInstance.addEventListener('resize', function( e ){

            _this._updateToolsBoxPosition();

        });

        document.body.appendChild( tools );
        this.element = tools;
        
        $('#borderWidth').spinner({
        
            spin: function( event ){

                _this.editorBitmapInstance.setBorderWidth( parseInt(event.target.value) );
                _this.editorBitmapInstance.updateSimpleBorder();

            },
            
            change: function( event ){

                _this.editorBitmapInstance.setBorderWidth( parseInt(event.target.value) );
                _this.editorBitmapInstance.updateSimpleBorder();
                
            }
            
        });

        $('#shadowBlur').spinner({
        
            spin: function( event ){

                _this.editorBitmapInstance.setShadowBlur( parseInt(event.target.value) );

            },
            
            change: function( event ){

                _this.editorBitmapInstance.setShadowBlur( parseInt(event.target.value) );
                
            }
            
        });


        $('#shadowOffsetX').spinner({
        
            spin: function( event ){

                _this.editorBitmapInstance.setShadowOffsetX( parseInt(event.target.value) );

            },
            
            change: function( event ){

                _this.editorBitmapInstance.setShadowOffsetX( parseInt(event.target.value) );
                
            }
            
        });


        $('#shadowOffsetY').spinner({
        
            spin: function( event ){

                _this.editorBitmapInstance.setShadowOffsetY( parseInt(event.target.value) );

            },
            
            change: function( event ){

                _this.editorBitmapInstance.setShadowOffsetY( parseInt(event.target.value) );
                
            }
           
        });

    };


    p.shadowOffset = function(){

        var _this = this;

        var shadowOffsetX = document.createElement('input');
        shadowOffsetX.id = 'shadowOffsetX';

        var shadowOffsetY = document.createElement('input');
        shadowOffsetY.id = 'shadowOffsetY';
    

        var offsetTools = document.createElement('div'); 

        offsetTools.appendChild( shadowOffsetX );
        offsetTools.appendChild( shadowOffsetY );

        return offsetTools;

    };


    p.shadowBlur = function(){

        var _this = this;

        var shadowBlur = document.createElement('input');
        shadowBlur.id = 'shadowBlur';

        return shadowBlur;

    };



    p.dropShadow = function(){

        var _this = this;

        var dropShadow = document.createElement('input');
        dropShadow.type = 'checkbox';

        dropShadow.addEventListener('change', function( e ){

            //console.log( e );

            if( e.target.checked ){

                _this.editorBitmapInstance.dropShadow();
                //console.log('dropShadow' );

            }
            else {

                _this.editorBitmapInstance.unDropShadow();
                //console.log('undropShadow' );

            }

        });

        return dropShadow;

    };


    p.borderSpinner = function(){

        var borderWidth = document.createElement('input');
        borderWidth.id = 'borderWidth';

        return borderWidth;

    }


    /**
    * Aktualizuje pozycję elementu z narzędziami
    *
    * @method _updateToolsBoxPosition
    */
    p._updateToolsBoxPosition = function(){

        var tools = this.toolsContainer;

        if( this.useType == "admin" )
            var adminTools = $('#proposed-position-tool-admin');

        var toolSize = {

            width  : $(tools).innerWidth(),
            height : $(tools).innerHeight()

        };

        var pos = this.editorBitmapInstance.getGlobalPosition();
        var stage = this.editor.getStage();
        var bounds = this.editorBitmapInstance.getTransformedBounds();

        $(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 80, left: pos[0] - toolSize.width/2 });

    };

	export {EditorBitmapContextMenu};