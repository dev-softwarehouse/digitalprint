
this.Editor = this.Editor || {};

(function(){

	/**
	* Klasa reprezentująca menu kontekstowe dla pozycji proponowanej
	*
	* @class ProposedPositionContextMenu
	* @constructor
	*/
	function ProposedPositionContextMenu( proposedPosition, menuType ){

        this.proposedPositionInstance = proposedPosition;
        this.toolsContainer = null;
        this.initAllTools( menuType );
        this._updateToolsBoxPosition();

	};



    var p = ProposedPositionContextMenu.prototype;


    p.createSlider = function(){



    };


    p.createCenterTool = function(){

        var _this = this;
        var object = this.proposedPositionInstance;

        var tool = document.createElement('div');
        tool.className = 'button';
        tool.id = 'CButton';
        //tool.innerHTML = 'C';

        tool.appendChild( Editor.template.createToolhelper ("Wyśrodkuj zdjęcie") );

        $('#CButton').addClass("CButton");


        tool.addEventListener('click', function( e ){

            e.stopPropagation();

            object.center();

            Editor.tools.init();

            _this._updateToolsBoxPosition();
            
        });

        return tool;

    };


    p.layerUp = function(){

        var _this = this.proposedPositionInstance;

        var layerUp = document.createElement('div');
        layerUp.className = 'button';       
        layerUp.id = 'layerUpButton';

        layerUp.appendChild( Editor.template.createToolhelper ("Warstwa w górę") );

        layerUp.addEventListener('click', function( e ){

            e.stopPropagation();

            _this.parent.setChildIndex( _this, parseInt(_this.parent.getChildIndex( _this ))+1 );

        });

        return layerUp;  

    };


    p.layerDown = function(){

        var _this = this.proposedPositionInstance;


        var layerDown = document.createElement('div');
        layerDown.className = 'button';
        layerDown.id = 'layerDownButton';
        
        layerDown.appendChild( Editor.template.createToolhelper ("Warstwa w dół") );

        //layerDown.appendChild( this.editorBitmapInstance.Editor.template.createToolhelper ("Warstwa w dół") );

        layerDown.addEventListener('click', function( e ){
            
            e.stopPropagation();

            _this.parent.setChildIndex( _this, parseInt( _this.parent.getChildIndex( _this ))-1 );

        });

        return layerDown;  

    };



    p.deleteObject = function(){

        var _this = this.proposedPositionInstance;
        
        var deleteTool = document.createElement("div");
        deleteTool.id = "deleteBitmapTool";
        deleteTool.className = 'button delete';
        
        deleteTool.appendChild( Editor.template.createToolhelper ("Usuń obiekt") );

        deleteTool.addEventListener('click', function( e ){
            
            _this.parent.parent.proposedImagePositions.remove(_this.parent.parent.proposedImagePositions.indexOf( _this ));
           
            $("#proposedTemplate-toolsbox").remove();
            _this.parent.removeChild( _this );
            Editor.tools.setEditingObject(null);
            Editor.tools.init();

        });

        return deleteTool;

    };



    p.scaleSlider = function(){

        var tool = document.createElement('div');
        tool.className = 'scroll-bar proposed';
      
        return tool;

    };



    /**
    * Inicjalizuje wszystkie narzędzia i dołącza je do tool boxa
    *
    * @method initAllTools
    */
    p.initAllTools = function( menuType ){

        var _this = this;

        var editingObject = this.proposedPositionInstance;     

        if(editingObject.borderWidth){

                if ( editingObject.borderWidth == 0 ){

                    editingObject.unDropBorder();
                }
                    
         }
        


        var tools = document.createElement("div");
        tools.id = "proposedTemplate-toolsbox";
        tools.className = "tools-box";
        
        var userTools = document.createElement("div");
        userTools.className = "editorBitmapTools editorBitmapTools5";

        //console.log(editingObject.getFirstImportantParent());
        //console.log(this);

        if( menuType == 'full'){

            userTools.appendChild( this.layerDown() );
            userTools.appendChild( this.layerUp() );
            userTools.appendChild( this.scaleSlider() );
            userTools.appendChild( this.createCenterTool() );
            userTools.appendChild( this.deleteObject() );

        }else {


            userTools.appendChild( this.layerDown() );
            userTools.appendChild( this.layerUp() );
            userTools.appendChild( this.createCenterTool() );
            userTools.appendChild( this.deleteObject() );

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
        }
       
        $(".scroll-bar").slider({

            min : 0.3,
            max : 2,
            step : 0.01,
            animate: "slow",
            value: interialImageScale

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

            
            _this.proposedPositionInstance.objectInside.setScale( $(".scroll-bar").slider('value') );

            var insideWidth = _this.proposedPositionInstance.objectInside.width;
            var width = _this.width;

            var insideHeight = _this.proposedPositionInstance.objectInside.height;
            var height = _this.height;

            if( insideWidth > width ){

                if( _this.proposedPositionInstance.objectInside.x > insideWidth/2 )
                    _this.proposedPositionInstance.objectInside.x = insideWidth/2;
                else if( _this.proposedPositionInstance.objectInside.x + insideWidth/2 < width )
                    _this.proposedPositionInstance.objectInside.x = width - insideWidth/2;

            }
            else {

                _this.proposedPositionInstance.objectInside.centerX();

            }

            if( insideHeight > height ){

                if( _this.proposedPositionInstance.objectInside.y > insideHeight/2 )
                    _this.proposedPositionInstance.objectInside.y = insideHeight/2;
                else if( _this.proposedPositionInstance.objectInside.y + insideHeight/2 < height )
                    _this.proposedPositionInstance.objectInside.y = height - insideHeight/2;     

                
            }
            else {

                _this.proposedPositionInstance.objectInside.centerY();

            }

            //_this.updateCache();

        });


    };


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

        var pos = this.proposedPositionInstance.getGlobalPosition();
        var stage = Editor.getStage();
        var bounds = this.proposedPositionInstance.getTransformedBounds();

        $(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY + 80, left: pos[0] - toolSize.width/2 });

    };

	Editor.ProposedPositionContextMenu = ProposedPositionContextMenu;

})();