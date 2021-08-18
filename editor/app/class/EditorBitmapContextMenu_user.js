import {safeImage} from "../utils";

/**
* Klasa reprezentująca menu kontekstowe dla bitmapy
*
* @class EditorBitmapContextMenu
* @constructor
*/
export function EditorBitmapContextMenu_user( editorBitmap ){

    this.editorBitmapInstance = editorBitmap;
    this.editor = editorBitmap.editor;
    this.toolsContainer = null;
    this.initAllTools();

};


var p = EditorBitmapContextMenu_user.prototype;


p.deleteObject = function(){

    var _this = this.proposedPositionInstance;
    
    var deleteTool = document.createElement("div");
    deleteTool.id = "deleteBitmapTool";
    deleteTool.className = 'button';

    deleteTool.addEventListener('click', function( e ){
        
        _this.parent.parent.proposedImagePositions.remove(_this.parent.parent.proposedImagePositions.indexOf( _this ));
        Editor.tools.setEditingObject( null );
        Editor.tools.init();
        $("#proposedTemplate-toolsbox").remove();
        _this.parent.removeChild( _this );
        Editor.tools.setEditingObject(null);
        Editor.tools.init();

    });

    return deleteTool;

};

p.createShadowTool = function(){

    var _this = this;
    var object = this.proposedPositionInstance;

    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'shadowButton';
    //tool.innerHTML = 'C';

    tool.appendChild( this.editor.template.createToolhelper ('Dodaj cień do zdjęcia', 'none', 'infoBoxShadow') );

    tool.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.openSection == 'shadow' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != null ){

                _this.toolsContainer.appendChild( _this.initShadowBoxTool() );
                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;
                
            }

        }else {

            _this.toolsContainer.appendChild( _this.initShadowBoxTool() );
            _this._updateToolsBoxPosition();
        }

    });

    return tool;

}

p.createFullSizeTool = function(){

    var _this = this;
    var bitmap = this.editorBitmapInstance;

    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'FButton';
    
    tool.appendChild( this.editor.template.createToolhelper ("Dopasuj zdjęcie do strony") );

    $('#FButton').addClass("FButton");

    tool.addEventListener('click', function( e ){

        e.stopPropagation();

        bitmap.setFullSize2();

        this.editor.tools.init();

    }.bind( this ));

    return tool;

};

p.createCenterTool = function(){

    var _this = this;
    var bitmap = this.editorBitmapInstance;


    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'CButton';
    //tool.innerHTML = 'C';

    tool.appendChild( this.editor.template.createToolhelper ("Ustaw zdjęcie na środku strony") );

    $('#CButton').addClass("CButton");


    tool.addEventListener('click', function( e ){

        e.stopPropagation();

        bitmap.center();

        this.editor.tools.init();
        
    }.bind(this));

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
    
    var activeColors = this.editor.adminProject.getActiveColors();

    for( var i=0; i < activeColors.length; i++ ){

        var colorElement = document.createElement('div');
        colorElement.className = 'colorPaletteElement';
        colorElement.style.backgroundColor = activeColors[i];

        colorElement.addEventListener('click', function( e ){

            e.stopPropagation();

            _this.editorBitmapInstance.setBorderColor( Editor.rgb2hex(this.style.backgroundColor) );
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

p.createBackgroundFrameTool = function(){

    var _this = this;
    var object = this.proposedPositionInstance;

    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'backframeButton';

    tool.appendChild( this.editor.template.createToolhelper ("Dodaj ramkę do zdjęcia", 'none', 'infoBoxBorder') );
    tool.addEventListener('click', function( e ){


        e.stopPropagation();

        if( _this.openSection == 'backframe' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != null ){

                _this.toolsContainer.appendChild( _this.initBackframeBoxTool( $(_this.toolsContainer).width() ) );
                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;
                
            }

        }else {

            _this.toolsContainer.appendChild( _this.initBackframeBoxTool( $(_this.toolsContainer).width() ) );
            _this._updateToolsBoxPosition();

        }

    });

    return tool;
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
    
    var activeColors = this.editor.adminProject.getActiveColors();

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


    layerUp.appendChild( this.editor.template.createToolhelper ("Warstwa w górę") );


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

        var viewLayerInfo = this.editor.adminProject.format.view.getLayerInfo();

        this.editor.webSocketControllers.userPage.moveObjectUp( _this.dbID, _this.getFirstImportantParent().userPage._id );

    });

    return layerUp;  

};


p.layerDown = function(){

    var _this = this.editorBitmapInstance;


    var layerDown = document.createElement('div');
    layerDown.className = 'button';
    layerDown.id = 'layerDownButton';
    

    layerDown.appendChild( this.editor.template.createToolhelper ("Warstwa w dół") );

    layerDown.addEventListener('click', function( e ){

        var editingObject = _this;
        
        var index = editingObject.parent.getChildIndex( editingObject );

        if( index > 0 ){

            editingObject.parent.setChildIndex( editingObject, index-1 );

        }
        else {

            if( editingObject.parent.name == 'foregroundLayer' ){

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

        var viewLayerInfo = this.editor.adminProject.format.view.getLayerInfo();
       
        
        this.editor.webSocketControllers.userPage.moveObjectDown( _this.dbID, _this.getFirstImportantParent().userPage._id );

    });

    return layerDown;  

};


p.attributeSettings = function(){

    var _this = this;

    var tools = document.createElement("div");
    tools.id = "editroBitmapAttributes";
    tools.className = 'button';

    tools.appendChild( this.editor.template.createToolhelper ("Dodaj atrybuty") );
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


p.createBorderTool = function(){

    var _this = this;
    var object = this.proposedPositionInstance;

    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'borderButton';
    //tool.innerHTML = 'C';

    tool.appendChild( _this.editor.template.createToolhelper ("Dodaj ramkę do zdjęcia", 'none', 'infoBoxBorder') );

    tool.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.openSection == 'border' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != null ){

                _this.toolsContainer.appendChild( _this.initBorderBoxTool() );
                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;
                
            }

        }else {

            _this.toolsContainer.appendChild( _this.initBorderBoxTool() );
            _this._updateToolsBoxPosition();

        }

    });

    return tool;
};


p.initBorderBoxTool = function(){

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = 'Włącz ramkę:';

    var onOffLabel = document.createElement('label');
    var onOff = document.createElement('input');
    onOff.type = 'checkbox';
    onOff.className = 'switch';
    onOff.checked = this.editorBitmapInstance.displaySimpleBorder;
    var onOffdispl = document.createElement('div');
    onOffLabel.appendChild( onOff );
    onOffLabel.appendChild( onOffdispl );

    onOffLabel.addEventListener('change', function( e ){

        _this.editorBitmapInstance.simpleBorder.visible = onOff.checked;
        _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { displaySimpleBorder: onOff.checked } );

    });

    globalSettings.appendChild( title );
    globalSettings.appendChild( onOffLabel );


    /*
    globalSettings.appendChild( singleElem );
    globalSettings.appendChild( allElemInPage );
    globalSettings.appendChild( allElemInProject );
    globalSettings.appendChild( info );
    */

    var valuesSettings = document.createElement('div');
    valuesSettings.className = 'toolBoxExtendSection';

    var borderWidthPickerLabel = document.createElement('label');
    borderWidthPickerLabel.className = 'borderToolsClass inputRight';
    borderWidthPickerLabel.innerHTML = "Grubość ramki:";

    var borderWidthPickerInputUser = document.createElement("input");   
    borderWidthPickerInputUser.className = 'spinner';  
    borderWidthPickerInputUser.value = this.editorBitmapInstance.borderWidth;

    borderWidthPickerLabel.appendChild( borderWidthPickerInputUser );

    var borderColor = document.createElement('input');
    borderColor.id = 'borderColor';
    borderColor.className = 'spinner cp-full';

    /*
    singleElem.addEventListener('click', function( e ){

        e.stopPropagation();

        if( !this.hasClass('active') ){

            allElemInPage.removeClass('active');
            allElemInProject.removeClass('active');
            singleElem.addClass('active');
            info.innerHTML = 'Dla aktualnego zdjęcia';
        }

    });

    allElemInPage.addEventListener('click', function( e ){

        e.stopPropagation();

        if( !this.hasClass('active') ){

            singleElem.removeClass('active');
            allElemInProject.removeClass('active');
            allElemInPage.addClass('active');
            info.innerHTML = 'Dla wszystkich zdjęć na stronie';

        }

    });

    allElemInProject.addEventListener('click', function( e ){

        e.stopPropagation();

        if( !this.hasClass('active') ){

            allElemInPage.removeClass('active');
            singleElem.removeClass('active');
            allElemInProject.addClass('active');
            info.innerHTML = 'Dla wszystkich zdjęć w projekcie';

        }

    });
    */

    var _this = this;

    function changeBorderSettings( size, save ){

        _this.editorBitmapInstance.setBorderWidth( size );
        _this.editorBitmapInstance.updateSimpleBorder();
        _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { borderWidth: size } );

    }

    $( borderWidthPickerInputUser ).spinner({
       
        min: 0,

        spin: function( event ){

            changeBorderSettings( parseInt(event.target.value), false );

        },
        change: function( event ){
            
            changeBorderSettings( parseInt(event.target.value), true );

        },

        stop: function( event ){

           changeBorderSettings( parseInt(event.target.value), true );

        }
        
    }).val( this.editorBitmapInstance.borderWidth );

    
    var borderColorPicker = document.createElement('div');
    borderColorPicker.className = 'borderColorPicker';
    //borderColorPickerLabel.innerHTML = "K:";

    var borderColorPickerLabel = document.createElement('h4');
    borderColorPickerLabel.className = 'borderColorPickerLabel';
    //borderColorPickerLabel.innerHTML = "K:";

    var borderColor = document.createElement('input');
    borderColor.id = 'borderColor';
    borderColor.className = 'spinner cp-full';

    borderColorPicker.appendChild( borderColorPickerLabel );
    borderColorPickerLabel.appendChild ( borderColor );

    function setBorderColor( color, save ){

        _this.editorBitmapInstance.setBorderColor( color );

        if( save ){

            _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { borderColor: color } );

        }

    };

    $( borderColor ).colorpicker({
            
        parts: 'full',
        showOn: 'both',
        buttonColorize: true,
        showNoneButton: true,
        alpha: true,
        color: '#FF0000',
        stop : function( e ){

            setBorderColor( e.target.value, true );

        },
        select : function( e ){

            setBorderColor( e.target.value, false );
            
        },
    
        colorFormat: 'RGBA' 

    });

    valuesSettings.appendChild( borderWidthPickerLabel );
    valuesSettings.appendChild( borderColorPickerLabel );

    elem.appendChild( globalSettings );
    elem.appendChild( valuesSettings );

    this.currentExtendedTool = elem;
    this.openSection = 'border';

    return elem;

};

p.maskTool = function(){

    var _this = this;
    var object = this.proposedPositionInstance;

    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'maskButton';
    tool.appendChild( this.editor.template.createToolhelper ("Dodaj maskę do zdjęcia", 'none', 'infoBoxBorder') );

    return tool;

};

p.fxTool = function(){

    var _this = this;
    var object = this.proposedPositionInstance;

    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'fxButton';
    tool.appendChild( this.editor.template.createToolhelper ("Dodaj efekty do zdjęcia", 'none', 'infoBoxBorder') );

    tool.addEventListener('click', function( e ){

        e.stopPropagation();

        _this.fxToolBox();

    });

    return tool;

};

p.initBackframeBoxTool = function( width ){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';
    elem.style.width = width+'px';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = 'Włącz ramkę:';
   
    var onOffLabel = document.createElement('label');
    var onOff = document.createElement('input');
    onOff.type = 'checkbox';
    onOff.className = 'switch';
    onOff.checked = ( this.editorBitmapInstance.useBackgroundFrame ) ? true : false;

    var onOffdispl = document.createElement('div');

    onOffLabel.appendChild( onOff );
    onOffLabel.appendChild( onOffdispl );

    globalSettings.appendChild( title );
    globalSettings.appendChild( onOffLabel );

    var firstSection = document.createElement('div');
    firstSection.className = 'toolBoxExtendSection';
    firstSection.appendChild( globalSettings );

    var secondSection = document.createElement('div');
    secondSection.className = 'toolBoxExtendSection'

    var framesContainer = document.createElement('div');
    framesContainer.className = 'backgroundFramesContainer contentSlider';
    framesContainer.style.width = (width-25) + 'px';

    var framesInner = document.createElement('div');
    framesContainer.appendChild( framesInner );

    var framesContainerLeftArrow = document.createElement('div');
    framesContainerLeftArrow.className = 'leftArrow-cont';
    framesContainerLeftArrow.addEventListener('click', function( e ){

        e.stopPropagation();
        if( framesContainer.scrollLeft > 0 ){

            framesContainer.scrollLeft -= 102;                

            if( framesContainer.scrollLeft < 0 ){

                framesContainer.scrollLeft = 0;

            }

        }

    });

    var framesContainerRightArrow = document.createElement('div');
    framesContainerRightArrow.className = 'rightArrow-cont';
    framesContainerRightArrow.addEventListener('click', function( e ){

        e.stopPropagation();
        if( framesContainer.scrollLeft < ( parseInt($(framesInner).width())-(width-25)) ){

            framesContainer.scrollLeft += 102;                

            if( framesContainer.scrollLeft > ( parseInt($(framesInner).width())-(width-25)) ){

                framesContainer.scrollLeft = ( parseInt($(framesInner).width())-(width-25));

            }

        }

    });

    var framesContainerParent = document.createElement('div');
    framesContainerParent.style.width = (width-20) + 'px';
    framesContainerParent.style.position = 'relative';

    framesContainerParent.appendChild( framesContainerLeftArrow );
    framesContainerParent.appendChild( framesContainerRightArrow );

    framesContainerParent.appendChild( framesContainer );

    secondSection.appendChild( framesContainerParent );

    Ps.initialize( framesContainer, { useBothWheelAxes: true } );
    elem.appendChild( firstSection );
    elem.appendChild( secondSection );

    this.currentExtendedTool = elem;
    this.openSection = 'backframe';

    framesContainer.addEventListener('click', function( e ){

        e.stopPropagation();

        var mainElem = null;

        for( var i=0;i< e.path.length; i++){

            if( e.path[i].className == 'backgroundFrameElem' && e.path[i].nodeName == "DIV" ){

                mainElem = e.path[i];
                break; 

            }

        }

        if( mainElem ){

            onOff.checked = true;

            var frames = framesContainer.querySelectorAll('.backgroundFrameElem');

            for( var i=0; i < frames.length; i++ ){

                var frame = frames[i];
                frame.className = 'backgroundFrameElem';

            }

            var newFrameID = mainElem.getAttribute( 'data-id' );
            

            mainElem.className = 'backgroundFrameElem active';                    

            

            _this.editor.webSocketControllers.editorBitmap.setSettings(_this.editorBitmapInstance.dbID, { 'backgroundFrameID' : newFrameID, backgroundFrame: true } );

            _this.editor.webSocketControllers.frameObject.get( newFrameID, function( data ){

                _this.editorBitmapInstance.useBackgroundFrame = true;
                _this.editorBitmapInstance.setBackgroundFrame( data );

            });

        }

    });

    _this.editor.webSocketControllers.themePage.getThemeBackgroundFrames( this.editorBitmapInstance.getFirstImportantParent().userPage.ThemePageFrom, function( data ){

        function prepareFrameElement( frameData  ){

            var elem = document.createElement('div');
            elem.className = 'backgroundFrameElem';
            elem.setAttribute('data-id', frameData._id );

            var img = safeImage();
            img.src = frameData.ProjectImage.thumbnail;
            img.className = 'backgroundFrameElem';
            img.setAttribute('data-id', frameData._id );

            var imageHelper = document.createElement('div');
            imageHelper.className = 'backgroundFrame helper';
            imageHelper.style.left = frameData.x + "%";
            imageHelper.style.top = frameData.y + "%";
            imageHelper.style.width = frameData.width + "%";
            imageHelper.style.height = frameData.height + "%";
            imageHelper.setAttribute('data-id', frameData._id );

            elem.appendChild( img );
            elem.appendChild( imageHelper );

            return elem;

        }

        for( var i=0; i < data.backgroundFrames.length; i++ ){

            var elem = prepareFrameElement( data.backgroundFrames[i] );

            framesInner.appendChild( elem );

        }

        framesInner.style.width = ( data.backgroundFrames.length * 100 ) + 'px';

    });

    // setBackgroundFrame
    // removeBackgroundFrame
    function switchBackgroundFrame( value ){
        /*
        if( value ){

            var frames = framesContainer.querySelectorAll('.backgroundFrameElem');

            for( var i=0; i < frames.length; i++ ){

                if( i == 0){

                    var frame = frames[i];
                    frame.className = 'backgroundFrameElem active';
                    
                }else {

                    var frame = frames[i];
                    frame.className = 'backgroundFrameElem';

                }

            }



        }else {

            var frames = framesContainer.querySelectorAll('.backgroundFrameElem');

            for( var i=0; i < frames.length; i++ ){

                var frame = frames[i];
                frame.className = 'backgroundFrameElem';

            }

        }*/

        if( !value ){

            _this.editorBitmapInstance.removeBackgroundFrame();
            _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { backgroundFrame: value, backgroundFrameID: null } );

        }else {


            function useBackgroundFrame( bitmap, frame ){

                _this.editor.webSocketControllers.frameObject.get( frame, function( data ){

                    bitmap.useBackgroundFrame = true;
                    bitmap.setBackgroundFrame( data );

                }); 

            }

            var frames = framesContainer.querySelectorAll('.backgroundFrameElem');
            var firstElem = frames[0].getAttribute('data-id');
            
            useBackgroundFrame( _this.editorBitmapInstance, firstElem );
            
            _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { backgroundFrame: value, backgroundFrameID: firstElem } );

        }

    }


    onOff.addEventListener('change', function( e ){

        switchBackgroundFrame( e.target.checked )
     
    });

    return elem;

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
    userTools.className = "editorBitmapTools editorBitmapTools2";

    userTools.appendChild( this.layerDown() );
    userTools.appendChild( this.layerUp() );
    userTools.appendChild( this.createFullSizeTool() );
    userTools.appendChild( this.createCenterTool() );
    userTools.appendChild( this.createBorderTool() );
    userTools.appendChild( this.createBackgroundFrameTool() );
    userTools.appendChild( this.createShadowTool() );
    userTools.appendChild( this.maskTool() );
    userTools.appendChild( this.fxTool() );
   // userTools.appendChild( this.attributeSettings() );
    userTools.appendChild( this.deleteImage() );

    tools.appendChild( userTools );


    this.toolsContainer = tools;
    // TODO: 
    // ter eventy trzeba bedzie usunac !!!
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


p.initShadowBoxTool = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = 'Włącz cień:';
    
    var onOffLabel = document.createElement('label');
    var onOff = document.createElement('input');
    onOff.type = 'checkbox';
    onOff.className = 'switch';
    onOff.checked = this.editorBitmapInstance._dropShadow;

    var onOffdispl = document.createElement('div');

    onOffLabel.appendChild( onOff );
    onOffLabel.appendChild( onOffdispl );

    globalSettings.appendChild( title );
    globalSettings.appendChild( onOffLabel );

    var valuesSettings = document.createElement('div');
    valuesSettings.className = 'toolBoxExtendSection';


    var shadowBlurLabel = document.createElement('label');
    shadowBlurLabel.className = 'shadowToolsClass inputRight';
    shadowBlurLabel.innerHTML = "Rozmycie cienia:";

    var shadowBlurInputUser = document.createElement("input");   
    shadowBlurInputUser.className = 'spinner';  
    shadowBlurInputUser.value = this.editorBitmapInstance.shadowBlur;
    shadowBlurLabel.appendChild( shadowBlurInputUser );

    
    var shadowOffsetXLabel = document.createElement('label');
    shadowOffsetXLabel.className = 'shadowToolsClass inputRight';
    shadowOffsetXLabel.innerHTML = "Przesunięcie X:";

    var shadowOffsetXInputUser = document.createElement("input");   
    shadowOffsetXInputUser.className = 'spinner';  
    shadowOffsetXInputUser.value = this.editorBitmapInstance.shadowOffsetX;
    shadowOffsetXLabel.appendChild( shadowOffsetXInputUser );


    var shadowOffsetYLabel = document.createElement('label');
    shadowOffsetYLabel.className = 'shadowToolsClass inputRight';
    shadowOffsetYLabel.innerHTML = "Przesunięcie Y:";

    var shadowOffsetYInputUser = document.createElement("input");   
    shadowOffsetYInputUser.className = 'spinner';  
    shadowOffsetYInputUser.value = this.editorBitmapInstance.shadowOffsetY;
    shadowOffsetYLabel.appendChild( shadowOffsetYInputUser );


    var shadowColorPicker = document.createElement('div');
    shadowColorPicker.className = 'borderColorPicker';
    //borderColorPickerLabel.innerHTML = "K:";

    var shadowColorPickerLabel = document.createElement('h4');
    shadowColorPickerLabel.className = 'borderColorPickerLabel';
    //borderColorPickerLabel.innerHTML = "K:";

    var shadowColor = document.createElement('input');
    shadowColor.id = 'borderColor';
    shadowColor.className = 'spinner cp-full';

    shadowColorPicker.appendChild( shadowColorPickerLabel );
    shadowColorPickerLabel.appendChild ( shadowColor );

    function setShadowColor( color, save ){

        _this.editorBitmapInstance.setShadowColor( color );
        _this.editorBitmapInstance.updateShadow();

        if( save ){

            Editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { shadowColor: color } );

        }

    };

    $( shadowColor ).colorpicker({
            
        parts: 'full',
        showOn: 'both',
        buttonColorize: true,
        showNoneButton: true,
        alpha: true,
        color: '#FF0000',
        stop : function( e ){

            setShadowColor( e.target.value, true );

        },
        select : function( e ){

            setShadowColor( e.target.value, false );
            
        },
    
        colorFormat: 'RGBA' 

    });

    var leftCol = document.createElement('div');
    leftCol.className = 'col-2';

    var rightCol = document.createElement('div');
    rightCol.className = 'col-2';

    valuesSettings.appendChild( leftCol );
    valuesSettings.appendChild( rightCol );

    rightCol.appendChild( shadowColorPicker );
    rightCol.appendChild( shadowBlurLabel );
    leftCol.appendChild( shadowOffsetXLabel );
    leftCol.appendChild( shadowOffsetYLabel );

    elem.appendChild( globalSettings );
    elem.appendChild( valuesSettings );

    this.currentExtendedTool = elem;
    this.openSection = 'shadow';

    function changeDropSettings( value ){

        _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { dropShadow: value } );

        if( value ){

            _this.editorBitmapInstance.dropShadow();

        }else {

            _this.editorBitmapInstance.unDropShadow();

        }

    }


    onOff.addEventListener('change', function( e ){

        changeDropSettings( e.target.checked )
     
    });

    function changeShadowBlur( size, save ){

        _this.editorBitmapInstance.setShadowBlur( size );
        _this.editorBitmapInstance.updateShadow();

        _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { shadowBlur: size });

    }


    function changeOffsetX( size, save ){

        _this.editorBitmapInstance.setShadowOffsetX( size );
        _this.editorBitmapInstance.updateShadow();

        if( save ){

            _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { shadowOffsetX: size } );

        }

    }

    
    function changeOffsetY( size, save ){

        _this.editorBitmapInstance.setShadowOffsetY( size );
        _this.editorBitmapInstance.updateShadow();

        if( save ){

            _this.editor.webSocketControllers.editorBitmap.setSettings( _this.editorBitmapInstance.dbID, { shadowOffsetY: size } );

        }

    }


    $(shadowBlurInputUser).spinner({
       
        min: 0,

        spin: function( event ){

            changeShadowBlur( parseInt(event.target.value), false );

        },
        change: function( event ){
            
            changeShadowBlur( parseInt(event.target.value), true );

        },

        stop: function( event ){

           changeShadowBlur( parseInt(event.target.value), true );

        }
        
    }).val( this.editorBitmapInstance.shadowBlur );

    $(shadowOffsetXInputUser).spinner({
       
        min: 0,

        spin: function( event ){

            changeOffsetX( parseInt(event.target.value), false );

        },
        change: function( event ){
            
            changeOffsetX( parseInt(event.target.value), true );

        },

        stop: function( event ){

           changeOffsetX( parseInt(event.target.value), true );

        }
        
    }).val( this.editorBitmapInstance.shadowOffsetX );


    $(shadowOffsetYInputUser).spinner({
       
        min: 0,

        spin: function( event ){

            changeOffsetY( parseInt(event.target.value), false );

        },
        change: function( event ){
            
            changeOffsetY( parseInt(event.target.value), true );

        },

        stop: function( event ){

           changeOffsetY( parseInt(event.target.value), true );

        }
        
    }).val( this.editorBitmapInstance.shadowOffsetY );

    return elem;

};