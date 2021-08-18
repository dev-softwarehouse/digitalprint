import ContextMenuTools from "./ContextMenuTools";
import {RANGE} from '../Editor'
var generateFlatSwitch = function( selected ){

        var flatSwitch = document.createElement('div');

        flatSwitch.className = "block-switch";
        flatSwitch.innerHTML = '<input id="custom-toggle-flat-border" class="custom-toggle custom-toggle-flat" type="checkbox" '+ ( ( selected) ? 'checked="checked"' : '' ) +' >'+
                                '<label for="custom-toggle-flat-border"></label>';
        return flatSwitch;

    }

    /**
    * Klasa reprezentująca menu kontekstowe dla pozycji proponowanej
    *
    * @class ProposedPositionContextMenu
    * @constructor
    */
    function ProposedPositionContextMenu( proposedPosition, menuType ){

        this.proposedPositionInstance = proposedPosition;
        this.editor = proposedPosition.editor;
        proposedPosition._toolBox = this;
        proposedPosition.contextMenu = this;
        this.toolsContainer = null;
        this.initAllTools( menuType );
        this._updateToolsBoxPosition();
        this.toolBoxExtend = null;

    };


    var p = ProposedPositionContextMenu.prototype;

        p.createSlider = function(){

    };


    p.scaleSlider = function(){

        var tool = document.createElement('div');
        tool.className = 'scroll-bar proposed';

        return tool;

    };


    p.reconfiguateScaleSlider = function( settings ){

        var editingObject = this.proposedPositionInstance;

        if( !editingObject.objectInside )
            return;

        if( editingObject.objectInside.rotation%180 != 90 ){

            var minScale = editingObject.width/editingObject.objectInside.trueWidth;

            if( editingObject.height > editingObject.objectInside.trueHeight*minScale ){

                minScale = editingObject.height/editingObject.objectInside.trueHeight;

            }

        }else {

            var minScale = editingObject.height/editingObject.objectInside.trueWidth;

            if( editingObject.width > editingObject.objectInside.trueHeight*minScale ){

                minScale = editingObject.width/editingObject.objectInside.trueHeight;

            }

        }

        $('.scroll-bar.proposed').slider( "option", "min", minScale );

        $('.scroll-bar.proposed').slider( "option", "max", minScale+2 );

    };

    p.createZoomTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;

        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'zoomButton';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(tool).hasClass('active') ){

                $(tool).removeClass('active');

            }else {

                $(tool).addClass( 'active' );

            }

            object.zoom();

        }.bind( this ));

        return tool;

    };


    p.layerUp = function(){

        var Editor = this.editor;
        var _this = this.proposedPositionInstance;

        var layerUp = document.createElement('div');
        layerUp.className = 'button';
        layerUp.id = 'layerUpButton';


        layerUp.appendChild( Editor.template.createToolhelper ("Warstwa w górę") );


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

            var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();

            Editor.webSocketControllers.userPage.moveObjectUp( _this.dbID, _this.getFirstImportantParent().userPage._id );

        });

        return layerUp;

    };


    p.layerDown = function(){

        var Editor = this.editor;
        var _this = this.proposedPositionInstance;


        var layerDown = document.createElement('div');
        layerDown.className = 'button';
        layerDown.id = 'layerDownButton';


        layerDown.appendChild( Editor.template.createToolhelper ("Warstwa w dół") );

        layerDown.addEventListener('click', function( e ){

            var editingObject = _this;

            var index = editingObject.parent.getChildIndex( editingObject );

            // jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
            // Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );

            // TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem


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



                }

            }

            var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();



            Editor.webSocketControllers.userPage.moveObjectDown( _this.dbID, _this.getFirstImportantParent().userPage._id );

        });

        return layerDown;

    };


    /**
    * Inicjalizuje wszystkie narzędzia i dołącza je do tool boxa
    *
    * @method initAllTools
    */
    p.initAllTools = function( menuType ){

        var _this = this;

        var editingObject = this.proposedPositionInstance;
        var Editor = editingObject.editor;

        if(editingObject.borderWidth){

            if ( editingObject.borderWidth == 0 ){

                editingObject.unDropBorder();
            }

        }

        var tools = document.createElement("div");
        tools.id = "proposedTemplate-toolsbox";
        tools.className = "tools-box";

        var userTools = document.createElement("div");
        userTools.className = "editorBitmapTools editorBitmapTools6";

        if( menuType == 'full'){

            if( userType =='user'){
                userTools.appendChild( this.createZoomTool() );
            }
            if( userType =='advancedUser' ){

                userTools.appendChild( this.layerDown() );
                userTools.appendChild( this.layerUp() );

            }

            userTools.appendChild( this.createRotationTool() );
            userTools.appendChild( this.createBorderTool() );
            userTools.appendChild( this.createBackgroundFrameTool() );
            userTools.appendChild( this.scaleSlider() );
            userTools.appendChild( this.createShadowTool() );
            userTools.appendChild( this.maskTool() );
            userTools.appendChild( this.fxTool() );
            userTools.appendChild( this.removeImageTool() );

        }else {

            userTools.appendChild( this.layerDown() );
            userTools.appendChild( this.layerUp() );
            userTools.appendChild( this.createBorderTool() );
            userTools.appendChild( this.createBackgroundFrameTool() );
            userTools.appendChild( this.createShadowTool() );
            userTools.appendChild( this.removeImageTool() );

        }

        tools.appendChild( userTools );

        this.toolsContainer = tools;

        this.proposedPositionInstance.addEventListener( 'move', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.proposedPositionInstance.addEventListener('scale', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.proposedPositionInstance.addEventListener('rotate', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.proposedPositionInstance.addEventListener('resize', function( e ){

            _this._updateToolsBoxPosition();

        });

        document.body.appendChild( tools );
        this.element = tools;


        if (  _this.proposedPositionInstance.objectInside ){

            var interialImageScale = _this.proposedPositionInstance.objectInside.scaleX;

        }else {

            return;

        }

        var proposedPositionAspect = editingObject.width/editingObject.height;
        var objectInsideAspect = editingObject.objectInside.trueWidth/editingObject.trueHeight;
        var minScale = 1;

        if( editingObject.objectInside.rotation%180 != 90 ){

            var minScale = editingObject.width/editingObject.objectInside.trueWidth;

            if( editingObject.height > editingObject.objectInside.trueHeight*minScale ){

                minScale = editingObject.height/editingObject.objectInside.trueHeight;

            }

        }else {

            var minScale = editingObject.width/editingObject.objectInside.trueHeight;

            if( editingObject.height > editingObject.objectInside.trueWidth*minScale ){

                minScale = editingObject.height/editingObject.objectInside.trueWidth;

            }

        }

        $(".scroll-bar").slider({

            min : minScale,
            max : minScale + 2,
            step : 0.01,
            animate: "slow",
            value: interialImageScale,
            stop : function( e ){

                Editor.webSocketControllers.editorBitmap.setTransform( editingObject.objectInside.x, editingObject.objectInside.y, editingObject.objectInside.rotation, editingObject.objectInside.scaleX, editingObject.objectInside.scaleY, editingObject.objectInside.dbID );

            }

        });



        $(".scroll-bar").on( 'slide', function( e ){

            // zrobie too jak zmąrdzeje - mnożenie skali sprawi płynną animację, jednak jest trudono ocenić wielkość obrazka
            // i za kazdym razem nalezy updatowac slider
            var before = $(".scroll-bar").attr('data-value');
            var after = $(".scroll-bar").slider('value');

            $(".scroll-bar").attr('data-value', $(".scroll-bar").slider('value') );

            if( before < after )
                var multiply = 1.05;
            else
                var multiply = 0.95;
            // --------------------------------------

            var currentScale = _this.proposedPositionInstance.objectInside.scaleX;

            _this.proposedPositionInstance.objectInside.setScale( $(".scroll-bar").slider('value') );

            var insideWidth = _this.proposedPositionInstance.objectInside.width;
            var width = _this.proposedPositionInstance.width;

            var insideHeight = _this.proposedPositionInstance.objectInside.height;
            var height = _this.proposedPositionInstance.height;

            var newScale = _this.proposedPositionInstance.objectInside.scaleX;

            _this.proposedPositionInstance.objectInside.x *= newScale/currentScale;
            _this.proposedPositionInstance.objectInside.y *= newScale/currentScale;
            _this.proposedPositionInstance.objectInside.y += _this.proposedPositionInstance.regY - _this.proposedPositionInstance.regY* newScale/currentScale;
            _this.proposedPositionInstance.objectInside.x += _this.proposedPositionInstance.regX -_this.proposedPositionInstance.regX* newScale/currentScale;

            if( _this.proposedPositionInstance.objectInside.rotation%180 == 0 ){

                if( _this.proposedPositionInstance.objectInside.x > _this.proposedPositionInstance.objectInside.width/2 ){

                    _this.proposedPositionInstance.objectInside.x = _this.proposedPositionInstance.objectInside.width/2;

                }else if( _this.proposedPositionInstance.objectInside.x + _this.proposedPositionInstance.objectInside.width/2 < _this.proposedPositionInstance.trueWidth ){

                    _this.proposedPositionInstance.objectInside.x = _this.proposedPositionInstance.trueWidth-_this.proposedPositionInstance.objectInside.width/2;

                }

                if( _this.proposedPositionInstance.objectInside.y > _this.proposedPositionInstance.objectInside.height/2 ){

                    _this.proposedPositionInstance.objectInside.y = _this.proposedPositionInstance.objectInside.height/2;

                }else if( _this.proposedPositionInstance.objectInside.y + _this.proposedPositionInstance.objectInside.height/2 < _this.proposedPositionInstance.trueHeight ){

                    _this.proposedPositionInstance.objectInside.y = _this.proposedPositionInstance.trueHeight-_this.proposedPositionInstance.objectInside.height/2;

                }
            }
            else {
                if( _this.proposedPositionInstance.objectInside.x > _this.proposedPositionInstance.objectInside.height/2 ){

                    _this.proposedPositionInstance.objectInside.x = _this.proposedPositionInstance.objectInside.height/2;

                }else if( _this.proposedPositionInstance.objectInside.x + _this.proposedPositionInstance.objectInside.height/2 < _this.proposedPositionInstance.trueWidth ){

                    _this.proposedPositionInstance.objectInside.x = _this.proposedPositionInstance.trueWidth-_this.proposedPositionInstance.objectInside.height/2;

                }

                if( _this.proposedPositionInstance.objectInside.y > _this.proposedPositionInstance.objectInside.width/2 ){

                    _this.proposedPositionInstance.objectInside.y = _this.proposedPositionInstance.objectInside.width/2;

                }else if( _this.proposedPositionInstance.objectInside.y + _this.proposedPositionInstance.objectInside.width/2 < _this.proposedPositionInstance.trueHeight ){

                    _this.proposedPositionInstance.objectInside.y = _this.proposedPositionInstance.trueHeight-_this.proposedPositionInstance.objectInside.width/2;

                }
            }

            _this.proposedPositionInstance.updateMask();
            _this.proposedPositionInstance.calculateObjectInsideQuality( Editor.getProductDPI() );

            if( _this.proposedPositionInstance.filterStack.length ){

                _this.proposedPositionInstance.updateFilters();

            }

        });


    };


    p.createRotationTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;
        var Editor = object.editor;
        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'rotationButton';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            Editor.webSocketControllers.proposedImage.rotateImageInside(

                Editor.userProject.getCurrentView().Pages[0]._id,
                this.proposedPositionInstance.dbID

            );

        }.bind( this ));

        return tool;

    };

    p.maskTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;
        var Editor = object.editor;

        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'maskButton';
        tool.appendChild( Editor.template.createToolhelper ("Dodaj maskę do zdjęcia", 'none', 'infoBoxBorder') );
        tool.addEventListener('click', function( e ){
            
            e.stopPropagation();

            if( _this.openSection == 'mask' || _this.openSection != null ){

                _this.toolsContainer.removeChild( _this.currentExtendedTool );

                if( _this.openSection != null ){

                    _this.toolsContainer.appendChild( _this.initMasksBoxTool( $(_this.toolsContainer).width() ) );
                    _this._updateToolsBoxPosition();

                }else {

                    _this.openSection = null;

                }

            }else {

                _this.toolsContainer.appendChild( _this.initMasksBoxTool( $(_this.toolsContainer).width() ) );
                _this._updateToolsBoxPosition();

            }

        });

        return tool;
        /*
        tool.addEventListener('click', ( e ) => {

            


            object.addImageAlphaFilter( "images/maskTest2.png" );

        });

        return tool;
        */
    };

    p.fxTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;
        var Editor = object.editor;
        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'fxButton';
        tool.appendChild( Editor.template.createToolhelper ("Dodaj efekty do zdjęcia", 'none', 'infoBoxBorder') );

        tool.addEventListener('click', function( e ){

            e.stopPropagation();
            Editor.aviary.editImage( _this.proposedPositionInstance.objectInside.projectImage );
            _this.fxToolBox();

        });

        return tool;

    };

    p.fxToolBox = function(){

        var elem = document.createElement('div');
        elem.className = 'toolBox';
        elem.id = 'fxToolBox';

        return elem;

    };

    p.initShadowBoxTool = function(){

        const object = this.proposedPositionInstance;
        const Editor = object.editor;

        const generalizedShadowChange = (property, value, save, singleElem, allElemInPage, allElemInProject) => {
            const props = {};
            props[property] = value;

            let setterName;
            if (property === 'shadowBlur')
                setterName = 'setShadowBlur';
            else if (property === 'shadowColor')
                setterName = 'setShadowColor';
            else if (property === 'shadowOffsetX')
                setterName = 'setShadowOffsetX';
            else if (property === 'shadowOffsetY')
                setterName = 'setShadowOffsetY';

            if ($(singleElem).hasClass('active')) {

                var editingObject = Editor.stage.getObjectById(Editor.tools.getEditObject());
                editingObject[setterName](value);
                editingObject.updateShadow();

                if (save) {
                    Editor.webSocketControllers.proposedImage.setAttributes(
                        editingObject.dbID,
                        props
                    );

                }

            } else if ($(allElemInPage).hasClass('active')) {
                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {
                        e[setterName](value);
                        e.updateShadow();

                        Editor.webSocketControllers.proposedImage.setAttributes(
                            e.dbID,
                            props
                        )
                    });

            } else if ($(allElemInProject).hasClass('active')) {

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {
                        e[setterName](value);
                        e.updateShadow();
                    });

                if (save) {
                    Editor.userProject.getObj().projects.forEach((p)=>{
                        Editor.webSocketControllers.userProject.setSettingsForAllProposedImages( p._id, props );
                    });
                }

            }
        }
        function setShadowColor( color, save, singleElem, allElemInPage, allElemInProject) {
            generalizedShadowChange('shadowColor',color, save, singleElem, allElemInPage, allElemInProject);
        };

        function changeShadowBlur( size, save, singleElem, allElemInPage, allElemInProject ){
            generalizedShadowChange('shadowBlur',size, save, singleElem, allElemInPage, allElemInProject);
        }

        function changeOffsetX( size, save, singleElem, allElemInPage, allElemInProject ){
            generalizedShadowChange('shadowOffsetX',size, save, singleElem, allElemInPage, allElemInProject);
        }

        function changeOffsetY( size, save, singleElem, allElemInPage, allElemInProject ){
            generalizedShadowChange('shadowOffsetY',size, save, singleElem, allElemInPage, allElemInProject);

        }
        function changeDropSettings( value, singleElem, allElemInPage, allElemInProject){

            if( $(singleElem).hasClass('active') ){

                if( value ){

                    const editingObject = Editor.stage.getObjectById( Editor.tools.getEditObject() );

                    editingObject.dropShadow();

                    Editor.webSocketControllers.proposedImage.setAttributes(

                        editingObject.dbID,
                        {
                            dropShadow: true
                        }

                    );

                }else {

                    const editingObject = Editor.stage.getObjectById( Editor.tools.getEditObject() );

                    editingObject.unDropShadow();

                    Editor.webSocketControllers.proposedImage.setAttributes(

                        editingObject.dbID,
                        {
                            dropShadow: false
                        }

                    );

                }

            }else if( $(allElemInPage).hasClass('active') ){

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {

                        if( value ){
                            e.dropShadow();
                        }else {
                            e.unDropShadow();
                        }
                        Editor.webSocketControllers.proposedImage.setAttributes(
                            e.dbID,
                            {
                                dropShadow: value
                            }

                        );
                    });

            }else if( $(allElemInProject).hasClass('active') ){
                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {

                        if( value ){
                            e.dropShadow();
                        }else {
                            e.unDropShadow();
                        }
                    });

                Editor.userProject.getObj().projects.forEach((p)=>{
                    Editor.webSocketControllers.userProject.setSettingsForAllProposedImages( p._id, { dropShadow: value } );
                });

            }

        };

        return  ContextMenuTools.initShadowBoxTool(this, setShadowColor, changeDropSettings, changeShadowBlur, changeOffsetX, changeOffsetY);
    };

    p.initMasksBoxTool = function( width ){

        var _this = this;
        var Editor = this.proposedPositionInstance.editor;

        var elem = document.createElement('div');
        elem.className = 'toolBoxExtend';
        elem.style.width = width+'px';

        var globalSettings = document.createElement('div');
        globalSettings.className = 'toolBoxExtendSection';

        var title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = 'Włącz maskę:';

        var singleElem = document.createElement('div');
        singleElem.className = 'button singleElem active';

        var singleElemImage = new Image();
        singleElemImage.src = 'images/1zdjecie-on.svg';

        singleElem.appendChild( singleElemImage );

        var allElemInPage = document.createElement('div');
        allElemInPage.className = 'button allElemInPage';

        var allElemInPageImage = new Image();
        allElemInPageImage.src = "images/1strona-on.svg";

        allElemInPage.appendChild( allElemInPageImage );

        var allElemInProject = document.createElement('div');
        allElemInProject.className = 'button allElemInProject';

        var allElemInProjectImage = new Image();
        allElemInProjectImage.src = 'images/strony-on.svg';

        allElemInProject.appendChild( allElemInProjectImage );

        var info = document.createElement('div');
        info.className = 'buttonsSettingsInfo';
        info.innerHTML = 'Dla aktualnego zdjęcia';

        var onOffLabel = document.createElement('label');
        var onOff = document.createElement('input');
        onOff.type = 'checkbox';
        onOff.className = 'switch';
        onOff.checked = ( this.proposedPositionInstance.alphaMaskFilter ) ? true : false;

        var onOffdispl = document.createElement('div');

        onOffLabel.appendChild( onOff );
        onOffLabel.appendChild( onOffdispl );

        globalSettings.appendChild( title );
        globalSettings.appendChild( onOffLabel );
        globalSettings.appendChild( singleElem );
        globalSettings.appendChild( allElemInPage );
        globalSettings.appendChild( allElemInProject );
        globalSettings.appendChild( info );

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
        this.openSection = 'masks';

        singleElem.addEventListener('click', function( e ){
            
            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(allElemInPage).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(singleElem).addClass('active');
                info.innerHTML = 'Dla aktualnego zdjęcia';

            }

        });

        allElemInPage.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(singleElem).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(allElemInPage).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć na stronie';

            }

        });

        allElemInProject.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(allElemInPage).removeClass('active');
                $(singleElem).removeClass('active');
                $(allElemInProject).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć w projekcie';

            }

        });
        
        function prepareMaskElement( frameData ){

            var elem = document.createElement('div');
            elem.className = 'backgroundFrameElem';
            elem.setAttribute('data-id', frameData._id );

            var img = document.createElement('img');
            img.src = EDITOR_ENV.staticUrl+frameData.thumbnail;
            img.className = 'backgroundFrameElem';
            img.setAttribute('data-id', frameData._id );
            elem.setAttribute('data-big-url', EDITOR_ENV.staticUrl+frameData.imageUrl);

            elem.appendChild( img );

            return elem;

        }

        var masks = Editor.userProject.getMasks();

        for( var i=0; i < masks.length; i++ ){

            var elemIm = prepareMaskElement( masks[i] );

            framesInner.appendChild( elemIm );

        }

        framesInner.style.width = ( masks.length * 110 ) + 'px';

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

                var img = mainElem.getAttribute('data-big-url');
                var id = mainElem.getAttribute('data-id');
                
                var bitmapID = _this.proposedPositionInstance.objectInside.dbID;
                var viewID = Editor.userProject.getCurrentView()._id;
                
                if( $(singleElem).hasClass('active') ){

                    Editor.webSocketControllers.proposedImage.setAttributes( _this.proposedPositionInstance.dbID, { maskFilter: id}, function( data ){
                        
                                            
                    });
                    
                    var maskAsset = Editor.userProject.findMaskById( id  );
                    
                    if( maskAsset ){
    
                        _this.proposedPositionInstance.addImageAlphaFilter( maskAsset );
    
                    }
                    onOff.checked = true;

                }else if( $(allElemInPage).hasClass('active') ){


                    var images = _this.proposedPositionInstance.parentPage.proposedImagePositions;
                    
                    var maskAsset = Editor.userProject.findMaskById( id  );
                    
                    for( var i=0; i< images.length; i++ ){
            
                        Editor.webSocketControllers.proposedImage.setAttributes(
    
                            images[i].dbID,
                            { maskFilter: id}
            
                        );

                        if( maskAsset ){
                            
                            images[i].addImageAlphaFilter( maskAsset );
        
                        }

                    }
                    onOff.checked = true;

                }else if( $(allElemInProject).hasClass('active') ){
                    
                    
                    var images = _this.proposedPositionInstance.parentPage.proposedImagePositions;
                    
                    var maskAsset = Editor.userProject.findMaskById( id  );
                    
                    for( var i=0; i< images.length; i++ ){
            
                        if( maskAsset ){
                            
                            images[i].addImageAlphaFilter( maskAsset );
        
                        }

                    }

                    Editor.webSocketControllers.userProject.setSettingsForAllProposedImages( Editor.userProject.getID(), { maskFilter: id} );

                    onOff.checked = true;
                }

            }

        });

        onOff.addEventListener('click', function( e ){

            var value = e.target.checked;

            if( $(singleElem).hasClass('active') && !value ){
                
                Editor.webSocketControllers.proposedImage.setAttributes( _this.proposedPositionInstance.dbID, { maskFilter: null }, function( data ){
                    
                                        
                });
                
                _this.proposedPositionInstance.removeAlphaMask(  );


            }else if( $(allElemInPage).hasClass('active') && !value ){


                var images = _this.proposedPositionInstance.parentPage.proposedImagePositions;

                
                for( var i=0; i< images.length; i++ ){
        
                    Editor.webSocketControllers.proposedImage.setAttributes(

                        images[i].dbID,
                        { maskFilter: null}
        
                    );

                    images[i].removeAlphaMask(  );

                }


            }else if( $(allElemInProject).hasClass('active') && !value ){
                
                
                var images = _this.proposedPositionInstance.parentPage.proposedImagePositions;
                
                for( var i=0; i< images.length; i++ ){
        
                    images[i].removeAlphaMask( );

                }

                Editor.webSocketControllers.userProject.setSettingsForAllProposedImages( Editor.userProject.getID(), { maskFilter: null} );


            }

        });

        return elem;

    }

    p.initBackframeBoxTool = function( width ){

        var _this = this;
        var Editor = this.proposedPositionInstance.editor;

        var elem = document.createElement('div');
        elem.className = 'toolBoxExtend';
        elem.style.width = width+'px';

        var globalSettings = document.createElement('div');
        globalSettings.className = 'toolBoxExtendSection';

        var title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = 'Włącz tylną ramkę:';

        var singleElem = document.createElement('div');
        singleElem.className = 'button singleElem active';

        var singleElemImage = new Image();
        singleElemImage.src = 'images/1zdjecie-on.svg';

        singleElem.appendChild( singleElemImage );

        var allElemInPage = document.createElement('div');
        allElemInPage.className = 'button allElemInPage';

        var allElemInPageImage = new Image();
        allElemInPageImage.src = "images/1strona-on.svg";

        allElemInPage.appendChild( allElemInPageImage );

        var allElemInProject = document.createElement('div');
        allElemInProject.className = 'button allElemInProject';

        var allElemInProjectImage = new Image();
        allElemInProjectImage.src = 'images/strony-on.svg';

        allElemInProject.appendChild( allElemInProjectImage );

        var info = document.createElement('div');
        info.className = 'buttonsSettingsInfo';
        info.style='clear:both'
        info.innerHTML = 'Dla aktualnego zdjęcia';

        var onOffLabel = document.createElement('label');
        var onOff = document.createElement('input');
        onOff.type = 'checkbox';
        onOff.className = 'switch';
        onOff.checked = ( this.proposedPositionInstance.backgroundFrame ) ? true : false;

        var onOffdispl = document.createElement('div');

        onOffLabel.appendChild( onOff );
        onOffLabel.appendChild( onOffdispl );

        globalSettings.appendChild( title );
        globalSettings.appendChild( onOffLabel );

        const rangeSelectorsLayer=document.createElement('div');
        rangeSelectorsLayer.style='float:left'
        globalSettings.appendChild(rangeSelectorsLayer);

        rangeSelectorsLayer.appendChild( singleElem );
        rangeSelectorsLayer.appendChild( allElemInPage );
        rangeSelectorsLayer.appendChild( allElemInProject );
        rangeSelectorsLayer.appendChild( info );

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

                framesContainer.scrollLeft -= 102;

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

        singleElem.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(allElemInPage).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(singleElem).addClass('active');
                info.innerHTML = 'Dla aktualnego zdjęcia';

            }

        });

        allElemInPage.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(singleElem).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(allElemInPage).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć na stronie';

            }

        });

        allElemInProject.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(allElemInPage).removeClass('active');
                $(singleElem).removeClass('active');
                $(allElemInProject).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć w projekcie';

            }

        });

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

                if( $(singleElem).hasClass('active') ){

                    Editor.webSocketControllers.proposedImage.setAttributes(_this.proposedPositionInstance.dbID, { 'backgroundFrameID' : newFrameID, backgroundFrame: true } );

                    Editor.webSocketControllers.frameObject.get( newFrameID, function( data ){

                        _this.proposedPositionInstance.useBackgroundFrame = true;
                        _this.proposedPositionInstance.setBackgroundFrame( data );

                    });

                } else if( $(allElemInPage).hasClass('active') ){


                    function useBackgroundFrame( proposed, frame ){

                        Editor.webSocketControllers.frameObject.get( frame, function( data ){

                            proposed.useBackgroundFrame = true;
                            proposed.setBackgroundFrame( data );

                        });

                    }

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    var images = editingObject.parentPage.proposedImagePositions;

                    Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                        .forEach((e) => {
                            useBackgroundFrame(e, newFrameID);
                            Editor.webSocketControllers.proposedImage.setAttributes(

                                e.dbID,
                                {
                                    backgroundFrame: true,
                                    backgroundFrameID: newFrameID
                                }

                            );
                        });

                }else if( $(allElemInProject).hasClass('active') ){

                    function useBackgroundFrame( proposed, frame ){

                        Editor.webSocketControllers.frameObject.get( frame, function( data ){

                            proposed.useBackgroundFrame = true;
                            proposed.setBackgroundFrame( data );

                        });

                    }

                    Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                        .forEach((e) => {
                            useBackgroundFrame(e, newFrameID);
                        });

                    Editor.userProject.getObj().projects.forEach((p) => {
                        Editor.webSocketControllers.userProject.setSettingsForAllProposedImages(p._id, {backgroundFrame: true, backgroundFrameID: newFrameID});
                    });

                }

            }

        });

        var userThemePage = null;

        if( userType == 'user'){

            userThemePage = this.proposedPositionInstance.parentPage.userPage.ThemePageFrom

        }else if( userType == 'advancedUser' ) {

            userThemePage = this.proposedPositionInstance.getFirstImportantParent().userPage.ThemePageFrom;

        }

        Editor.webSocketControllers.themePage.getThemeBackgroundFrames( userThemePage, function( data ){

            function prepareFrameElement( frameData  ){

                var elem = document.createElement('div');
                elem.className = 'backgroundFrameElem';
                elem.setAttribute('data-id', frameData._id );

                var img = document.createElement('img');
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

            }

            if( $(singleElem).hasClass('active') ){

                if( value ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    var frames = framesContainer.querySelectorAll('.backgroundFrameElem');
                    var firstElem = frames[0].getAttribute('data-id');
                    _this.proposedPositionInstance.useBackgroundFrame = true;

                    Editor.webSocketControllers.frameObject.get( firstElem, function( data ){

                        _this.proposedPositionInstance.setBackgroundFrame( data );

                    });

                    Editor.webSocketControllers.proposedImage.setAttributes(

                        editingObject.dbID,
                        {
                            backgroundFrame: true,
                            backgroundFrameID: firstElem
                        }

                    );

                }else {

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    _this.proposedPositionInstance.removeBackgroundFrame();
                    _this.proposedPositionInstance.useBackgroundFrame = false;

                    Editor.webSocketControllers.proposedImage.setAttributes(

                        editingObject.dbID,
                        {
                            backgroundFrame: false
                        }

                    );

                }

            }else if( $(allElemInPage).hasClass('active') ){

                function useBackgroundFrame( proposed, frame ){

                    Editor.webSocketControllers.frameObject.get( frame, function( data ){

                        proposed.useBackgroundFrame = true;
                        proposed.setBackgroundFrame( data );

                    });

                }

                var frames = framesContainer.querySelectorAll('.backgroundFrameElem');
                var firstElem = frames[0].getAttribute('data-id');

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {

                        if (value) {
                            useBackgroundFrame(images[i], firstElem);
                        } else {
                            images[i].removeBackgroundFrame();
                            images[i].useBackgroundFrame = false;
                        }

                        Editor.webSocketControllers.proposedImage.setAttributes(
                            e.dbID,
                            {
                                backgroundFrame: value,
                                backgroundFrameID: firstElem
                            }
                        );
                    });
            }else if( $(allElemInProject).hasClass('active') ){

                function useBackgroundFrame( proposed, frame ){

                    Editor.webSocketControllers.frameObject.get( frame, function( data ){

                        proposed.useBackgroundFrame = true;
                        proposed.setBackgroundFrame( data );

                    });

                }

                var frames = framesContainer.querySelectorAll('.backgroundFrameElem');
                var firstElem = frames[0].getAttribute('data-id');


                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {
                        if (value) {
                            useBackgroundFrame(e, firstElem);
                        } else {
                            e.removeBackgroundFrame();
                            e.useBackgroundFrame = false;
                        }
                    });

                Editor.userProject.getObj().projects.forEach((p) => {
                    Editor.webSocketControllers.userProject.setSettingsForAllProposedImages(p._id, {backgroundFrame: value, backgroundFrameID: firstElem});
                });
            }

        }


        onOff.addEventListener('change', function( e ){

            switchBackgroundFrame( e.target.checked )

        });

        return elem;

    };

    p.initBorderBoxTool = function(){

        var object = this.proposedPositionInstance;
        var Editor = object.editor;

        var _this = this;

        var elem = document.createElement('div');
        elem.className = 'toolBoxExtend';

        var globalSettings = document.createElement('div');
        globalSettings.className = 'toolBoxExtendSection';

        var title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = 'Włącz ramkę:';

        var singleElem = document.createElement('div');
        singleElem.className = 'button singleElem active';

        var singleElemImage = new Image();
        singleElemImage.src = 'images/1zdjecie-on.svg';

        singleElem.appendChild( singleElemImage );

        var allElemInPage = document.createElement('div');
        allElemInPage.className = 'button allElemInPage';

        var allElemInPageImage = new Image();
        allElemInPageImage.src = "images/1strona-on.svg";

        allElemInPage.appendChild( allElemInPageImage );

        var allElemInProject = document.createElement('div');
        allElemInProject.className = 'button allElemInProject';

        var allElemInProjectImage = new Image();
        allElemInProjectImage.src = 'images/strony-on.svg';

        allElemInProject.appendChild( allElemInProjectImage );

        var info = document.createElement('div');
        info.className = 'buttonsSettingsInfo';
        info.innerHTML = 'Dla aktualnego zdjęcia';


        globalSettings.appendChild( title );
        globalSettings.appendChild( singleElem );
        globalSettings.appendChild( allElemInPage );
        globalSettings.appendChild( allElemInProject );
        globalSettings.appendChild( info );

        var valuesSettings = document.createElement('div');
        valuesSettings.className = 'toolBoxExtendSection';

        var borderWidthPickerLabel = document.createElement('label');
        borderWidthPickerLabel.className = 'borderToolsClass inputRight';
        borderWidthPickerLabel.innerHTML = "Grubość ramki:";

        var borderWidthPickerInputUser = document.createElement("input");
        borderWidthPickerInputUser.className = 'spinner';
        borderWidthPickerInputUser.value = this.proposedPositionInstance.borderWidth;

        borderWidthPickerLabel.appendChild( borderWidthPickerInputUser );

        var borderColor = document.createElement('input');
        borderColor.id = 'borderColor';
        borderColor.className = 'spinner cp-full';

        singleElem.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(allElemInPage).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(singleElem).addClass('active');
                info.innerHTML = 'Dla aktualnego zdjęcia';
            }

        });

        allElemInPage.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(singleElem).removeClass('active');
                $(allElemInProject).removeClass('active');
                $(allElemInPage).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć na stronie';

            }

        });

        allElemInProject.addEventListener('click', function( e ){

            e.stopPropagation();

            if( !$(this).hasClass('active') ){

                $(allElemInPage).removeClass('active');
                $(singleElem).removeClass('active');
                $(allElemInProject).addClass('active');
                info.innerHTML = 'Dla wszystkich zdjęć w projekcie';

            }

        });

        function changeBorderSettings( size, save ){

            if( $(singleElem).hasClass('active') ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.setBorderWidth( size );
                editingObject.updateSimpleBorder();

                if( save ){

                    var proposedImages = Editor.userProject.getCurrentView().Pages[0].ProposedTemplate.ProposedImages;

                    for( var i=0; i < proposedImages.length; i++ ){

                        if( proposedImages[i].order == editingObject.order ){

                            var itemOrder = i;
                            break;

                        }

                    }

                    if( itemOrder != undefined ){

                        //console.log('Kolejność pozycji proponowanej: ' + itemOrder );

                    }

                    var usePageID = null;

                    if( editingObject.parentPage ){

                        var userPage = editingObject.parentPage.userPage._id;

                    }else {

                        var userPage = editingObject.getFirstImportantParent().userPage._id;

                    }

                    Editor.webSocketControllers.proposedImage.setAttributes(

                        editingObject.dbID,
                        {
                            borderWidth: size
                        },
                        userPage

                    );

                }

            }else if( $(allElemInPage).hasClass('active') ){

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {

                        e.setBorderWidth(size);
                        e.updateSimpleBorder();

                        if (save)
                            Editor.webSocketControllers.proposedImage.setAttributes(
                                e.dbID,
                                {
                                    borderWidth: size
                                }
                            );
                    });

            }else if( $(allElemInProject).hasClass('active') ){

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {
                        e.setBorderWidth(size);
                        e.updateSimpleBorder();
                    });

                if( save ){
                    Editor.userProject.getObj().projects.forEach((p)=>{
                        Editor.webSocketControllers.userProject.setSettingsForAllProposedImages( p._id, { borderWidth: size } );
                    });


                }
                /*maybee... console.log(`size ${size}`)
            for (let [k, v] of Object.entries(Editor.userProject.getPages())) {
                v.ProposedTemplate.ProposedImages.forEach((im) => {
                    im.borderWidth = size
                })
            }
            Editor.stage.getPages().forEach((page) => {
                page.proposedImagePositions.map((p) => {
                    console.log(`set to ${size} is: ${p.borderWidth}`)
                    p.setBorderWidth(size);
                    p.updateSimpleBorder();
                })
            })
            Editor.stage.getPages().forEach((page) => {
                page.proposedImagePositions.map((p) => {
                    console.log(`borderWidth ${p.borderWidth}`)
                })
            })*/

            }

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

        }).val( this.proposedPositionInstance.borderWidth );


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

            if( $(singleElem).hasClass('active') ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.setBorderColor( color );

                if( save ){

                    Editor.webSocketControllers.proposedImage.setAttributes(

                        editingObject.dbID,
                        {
                            borderColor: color
                        }

                    );

                }

            }else if( $(allElemInPage).hasClass('active') ){

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {

                        e.setBorderColor( color );

                        if (save)
                            Editor.webSocketControllers.proposedImage.setAttributes(
                                e.dbID,
                                {
                                    borderColor: color
                                }
                            );
                    });

            }else if( $(allElemInProject).hasClass('active') ){

                Editor.getEditableObjectsByType(RANGE.allElemInPage, 'ProposedPosition')
                    .forEach((e) => {
                        e.setBorderColor(color);
                    });

                if( save ){
                    Editor.userProject.getObj().projects.forEach((p)=>{
                        Editor.webSocketControllers.userProject.setSettingsForAllProposedImages( p._id,  { borderColor: color } );
                    });
                }

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

    p.createBackgroundFrameTool = function(){

        var object = this.proposedPositionInstance;
        var Editor = object.editor;

        var _this = this;
        var object = this.proposedPositionInstance;

        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'backframeButton';

        tool.appendChild( Editor.template.createToolhelper ("Dodaj ramkę do zdjęcia", 'none', 'infoBoxBorder') );
        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            if( _this.openSection == 'backframe' || _this.openSection != null ){
                //console.log( _this.currentExtendedTool );
                //console.log( _this.toolsContainer );
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

    p.createBorderTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;
        var Editor = object.editor;
        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'borderButton';
        //tool.innerHTML = 'C';

        tool.appendChild( Editor.template.createToolhelper ("Dodaj ramkę do zdjęcia", 'none', 'infoBoxBorder') );

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



    p.createShadowTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;
        var Editor = object.editor;
        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'shadowButton';
        //tool.innerHTML = 'C';

        tool.appendChild( Editor.template.createToolhelper ('Dodaj cień do zdjęcia', 'none', 'infoBoxShadow') );

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

        $('#shadowButton').addClass("shadowButton");

        var contextMenuShadowController = document.createElement('div');

        contextMenuShadowController.id = 'contextMenuShadowController';
        contextMenuShadowController.className = 'contextMenuShadowController';
        contextMenuShadowController.addEventListener('click', function( e ){

            e.stopPropagation();

        });


        tool.addEventListener('click', function( e ){
            e.stopPropagation();
            if ( menuShadowOpen == false ){

                if (  $('#contextMenuBorderController').hasClass('visibleOn') ){
                      $('#contextMenuBorderController').removeClass('visibleOn');
                      menuBorderOpen = false;

                }

                if ( document.getElementById("infoBoxBorder") ) document.getElementById("infoBoxBorder").remove();
                if ( document.getElementById("infoBoxShadow") ) document.getElementById("infoBoxShadow").remove();

                $( contextMenuShadowController ).addClass('visibleOn');
                menuShadowOpen = !menuShadowOpen;
            }else if ( menuShadowOpen == true ){
                menuShadowOpen = !menuShadowOpen;
                $( contextMenuShadowController ).removeClass('visibleOn');

                var tempTool = document.getElementById('borderButton');

                tempTool.appendChild( Editor.template.createToolhelper ("Dodaj ramkę do zdjęcia", 'none', 'infoBoxBorder') );
                tool.appendChild( Editor.template.createToolhelper ('Dodaj cień do zdjęcia', 'none', 'infoBoxShadow') );
            }
        });



        var shadowSettings = document.createElement('div');
        shadowSettings.className = 'shadowSettings';

        var shadowSettingsTitle = document.createElement('h4')
        shadowSettingsTitle.className = 'shadowSettingsTitle';
        shadowSettingsTitle.innerHTML = 'Cień';

        shadowSettings.appendChild( shadowSettingsTitle );

        var flipSwitchs2 = generateFlatSwitch( _this.proposedPositionInstance._dropShadow );

        var shadowSwitch = document.createElement('label');
        shadowSwitch.className = 'ShadowSwitchLabel';
        shadowSwitch.innerHTML = ( !_this.proposedPositionInstance._dropShadow ) ? 'Włącz cień:' : 'Wyłącz cień';

        var _this = this;

        shadowSwitch.addEventListener('change', function( e ){

            //console.log( e );
            e.stopPropagation();
            if( e.target.checked ){


                shadowSwitch.innerHTML = 'Wyłącz cień:';
                shadowSwitch.appendChild( flipSwitchs2 );
                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.dropShadow();

                Editor.webSocketControllers.editorBitmap.setAttributes(

                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        dropShadow : true

                    }

                );

                //editorBitmapID, viewID ,options,

                //console.log('dropShadow' );
            }
            else {

                shadowSwitch.innerHTML = 'Włącz cień:';
                shadowSwitch.appendChild( flipSwitchs2 );
                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.unDropShadow();

                Editor.webSocketControllers.editorBitmap.setAttributes(

                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        dropShadow : false

                    }

                );

                //console.log('editinfundropShadow' );

            }
        });


        shadowSwitch.appendChild( flipSwitchs2 );
        shadowSettings.appendChild( shadowSwitch );


        var shadowMoveXLabel = document.createElement('label');
        shadowMoveXLabel.className = 'shadowToolsClass inputRight';
        shadowMoveXLabel.innerHTML = 'Przesunięcie X:'


        var shadowMoveXInput = document.createElement('input');
        shadowMoveXInput.id = 'shadowMoveXInput';
        shadowMoveXInput.className = 'spinner';
        shadowMoveXInput.value = 1;
        shadowMoveXLabel.appendChild( shadowMoveXInput );

        shadowSettings.appendChild( shadowMoveXLabel );


        var shadowMoveYLabel = document.createElement('label');
        shadowMoveYLabel.className = 'shadowToolsClass inputRight';
        shadowMoveYLabel.innerHTML = 'Przesunięcie Y:';


        var shadowMoveYInput = document.createElement('input');
        shadowMoveYInput.id = 'shadowMoveYInput';
        shadowMoveYInput.className = 'spinner';
        shadowMoveYInput.value = 1;
        shadowMoveYLabel.appendChild( shadowMoveYInput );

        shadowSettings.appendChild( shadowMoveYLabel );

        $( shadowMoveYInput ).spinner({
            spin: function( event ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                Editor.webSocketControllers.editorBitmap.setAttributes(
                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowOffsetY : parseInt(event.target.value)

                    }
                );
                editingObject.updateShadow();

            },

            change: function( event ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );
                editingObject.setShadowOffsetY( parseInt(event.target.value) );

                Editor.webSocketControllers.editorBitmap.setAttributes(

                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowOffsetY : parseInt(event.target.value)

                    }

                );


            },

            stop: function( event ){

               var editing_id = Editor.tools.getEditObject();
               var editingObject = Editor.stage.getObjectById( editing_id );
               editingObject.setShadowOffsetY( parseInt(event.target.value) );
               //console.log(":::*** editingObject.setShadowOffsetY( parseInt(event.target.value) ) ***:::");

                Editor.webSocketControllers.editorBitmap.setAttributes(
                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowOffsetY : parseInt(event.target.value)

                    }

                );

            }

        }).val( object.shadowOffsetY );



         $( shadowMoveXInput ).spinner({
            spin: function( event ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );
                editingObject.setShadowOffsetX( parseInt(event.target.value) );

                Editor.webSocketControllers.editorBitmap.setAttributes(
                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowOffsetX : parseInt(event.target.value)

                    }
                );
                editingObject.updateShadow();

            },

            change: function( event ){

               var editing_id = Editor.tools.getEditObject();
               var editingObject = Editor.stage.getObjectById( editing_id );
               editingObject.setShadowOffsetX( parseInt(event.target.value) );

                Editor.webSocketControllers.editorBitmap.setAttributes(
                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowOffsetX : parseInt(event.target.value)

                    }
                );


            },

            stop: function( event ){

               var editing_id = Editor.tools.getEditObject();
               var editingObject = Editor.stage.getObjectById( editing_id );
               editingObject.setShadowOffsetX( parseInt(event.target.value) );
               //console.log(":::*** editingObject.setShadowOffsetX( parseInt(event.target.value) ) ***:::");

                Editor.webSocketControllers.editorBitmap.setAttributes(
                    editingObject.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowOffsetX : parseInt(event.target.value)

                    }
                );

            }

        }).val( object.shadowOffsetX );

        var shadowBlurLabel = document.createElement('label');
        shadowBlurLabel.className = 'shadowToolsClass inputRight';
        shadowBlurLabel.id = 'shadowBlurLabel';
        shadowBlurLabel.innerHTML = 'Rozmycie:';

        var shadowBlurInput = document.createElement('input');
        shadowBlurInput.id = 'shadowBlurInput';
        shadowBlurInput.value = 1;
        shadowBlurInput.className = 'spinner';

        shadowBlurLabel.appendChild( shadowBlurInput );
        shadowSettings.appendChild( shadowBlurLabel );

        $( shadowBlurInput ).spinner({
            min: 0,
            value : object.shadowBlur,
            spin: function( event ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.setShadowBlur( parseInt(event.target.value) );
                editingObject.updateShadow();

            },

            change: function( event ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.setShadowBlur( parseInt(event.target.value) );

                Editor.webSocketControllers.editorBitmap.setAttributes(

                    editingObject.objectInside.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowBlur : parseInt(event.target.value)

                    }

                );


            },

            stop: function( event ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );
                editingObject.setShadowBlur( parseInt(event.target.value) );

                Editor.webSocketControllers.editorBitmap.setAttributes(

                    editingObject.dbID,
                    Editor.adminProject.format.view.getId(),
                    {

                        shadowBlur : parseInt(event.target.value)

                    }

                );

            }

        }).val( object.shadowBlur );



        var shadowColorPickerLabel = document.createElement('label');
        shadowColorPickerLabel.className = 'shadowColorPickerLabel'
        //shadowColorPickerLabel.innerHTML = "K:";

        var shadowColor = document.createElement('input');
        shadowColor.id = 'shadowColor';
        shadowColor.className = 'spinner cp-full';

        shadowColorPickerLabel.appendChild( shadowColor );
        shadowSettings.appendChild( shadowColorPickerLabel );

          $( shadowColor ).colorpicker({
            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: true,
            alpha: true,
            select : function( e ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                var shadowColor = e.target.value;

                var alpha = shadowColor.split('(')[1].split(')')[0].split(',');
                shadowColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

                editingObject.setShadowColor( shadowColor );


                Editor.webSocketControllers.proposedImage.setAttributes(

                    editingObject.dbID,
                    {
                        shadowColor: shadowColor
                    }

                );

                editingObject.updateShadow();

            },

            colorFormat: 'RGBA'

        });

        contextMenuShadowController.appendChild( shadowSettings );

        tool.appendChild( contextMenuShadowController );

        return tool;

    };

    p.removeImageTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;

        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'removeImage';
        //tool.innerHTML = 'C';

        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            if( userType == 'user'){

                var editableArea = object.parentPage;

            }else if( userType == 'advancedUser' ){

                var editableArea = object.getFirstImportantParent();

            }

            if( object.objectInside  ){

                _this.editor.webSocketControllers.proposedImage.removeObjectInside( editableArea.userPage._id, this.proposedPositionInstance.dbID );

            }else if( userType == 'advancedUser' ){

                _this.editor.webSocketControllers.userPage.removeProposedImage(

                    editableArea.userPage._id,
                    object.dbID

                );

            }


        }.bind( this ));

        return tool;

    };


    /**
    * Aktualizuje pozycję elementu z narzędziami
    *
    * @method _updateToolsBoxPosition
    */
    p._updateToolsBoxPosition = function(){

        var tools = this.toolsContainer;
        var object = this.proposedPositionInstance;
        var Editor = object.editor;

        if( this.useType == "admin" )
            var adminTools = $('#proposed-position-tool-admin');

        var toolSize = {

            width  : $(tools).innerWidth(),
            height : $(tools).innerHeight()

        };

        var pos = this.proposedPositionInstance.getGlobalPosition();
        var stage = Editor.getStage();
        var bounds = this.proposedPositionInstance.getTransformedBounds();

        $(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 100, left: pos[0] - toolSize.width/2 });

        var size = parseInt( $( tools ).css( 'top' ) ) + $( tools ).height();

        var top = parseInt( $( tools ).css( 'top' ) );

        if( size > window.innerHeight ){

            var diff = size -window.innerHeight;
            $( tools ).css( 'top', top - diff - 10 );

        }

    };

export {ProposedPositionContextMenu};
