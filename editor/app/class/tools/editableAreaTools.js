(function(){


	/**
	* Klasa odpowiadająca za boks z narzędziami do edytowalnego obiektu
	*
	* @class EditableAreaTool
	* @constructor
	*/
	function EditableAreaTool( editableAreaInstance, tools, defaultValues ){

	
		this.editableAreaInstance = editableAreaInstance;
		this.boxes = {};

		if( tools == null )
			this.initAllTools();

	};

	var p = EditableAreaTool.prototype = new createjs.EventDispatcher();

	p.constructor = EditableAreaTool;


	/**
	* Aktualizuje pozycję elementu z narzędziami
	*
	* @method _updateToolsBoxPosition
	*/
	p._updateToolsBoxPosition = function(){

		var tools = this.toolsContainer;

		if( this.useType =="admin" )
			var adminTools = $('#proposed-position-tool-admin');

		var toolSize = {

			width  : $(tools).innerWidth(),
			height : $(tools).innerHeight()

		};


		var pos = this.editableAreaInstance.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = this.editableAreaInstance.getTransformedBounds();

		$(tools).css({ top: pos[1] - (bounds.height/2)*stage.scaleY , left: pos[0] - toolSize.width/2 });
	
	};

    /**
	* Tworzy narzędzie zapisywania szablonów pozycji proponowanych
	*
	* @method createSaveProposedTemplate
	*/
    p.createSaveProposedTemplate = function(){
      
        var proposedTemplate = document.createElement("div");
        proposedTemplate.id = 'save-proposed-teamplate';
        
    };
    

    /**
	* Inicjalizuje wszystkie narzędzia i dołącza je do tool boxa
	*
	* @method initAllTools
	*/
	p.initAllTools = function(){

		var _this = this;

		var tools = document.createElement("DIV");
		tools.id = "editalbearea-toolsbox";
		tools.className = "tools-box";

		userTools.className = "editableAreaTools";


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
        
	};


    /**
	* Dodaje narzędzie do elementu.
	*
	* @method appendTools
	*/
	p.appendTools = function( elem ){

		elem.append( this.toolsContainer );

	};

	Editor.tools.EditableAreaTool = EditableAreaTool;

})();