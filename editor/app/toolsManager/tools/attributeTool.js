
var size = 28;
/*

var fullSize = new createjs.Shape();
fullSize.graphics.beginFill("black").drawRect(0,0,size,size);
fullSize.graphics.ss(1).s("#a8a8a8").mt(0,0).lt( size,0).lt( size, size).lt(0, size).cp();
fullSize.regX = fullSize.regY = size/2;
*/
var img = new Image("fullsize.png");

var fullSize = new createjs.Bitmap( "images/attributeTool.png" );
fullSize.scaleX = fullSize.scaleY = 0.1;

var _attributeTool = new createjs.Bitmap("images//attributeTool.png");


var _attributeToolComponent = [

	{
		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();

		}
	
	},

	{
		event : 'click',
		function : function(e){

			e.stopPropagation();
			//console.log('attribute');

			var selectedObject = Editor.stage.getObjectById( Editor.tools.getEditObject());

			//console.log( 'base object atrybutów' );
			//console.log( selectedObject );

			Editor.webSocketControllers.editorBitmap.setBase( selectedObject.dbID, Editor.adminProject.format.view.getId() );
			//Editor.template.ObjectAttributeSelection( selectedObject );
			//var selectedObject = Editor.stage.getObjectById( Editor.tools.getEditObject());

			//Editor.stage.cameraToObject( Editor.stage.getObjectById( Editor.tools.getEditObject()) );
			//Editor.stage.resizeToObject( Editor.stage.getObjectById( Editor.tools.getEditObject()) );

		}
	},

	{
		event : 'pressmove',
		'function' : function(e){

			e.stopPropagation();

		}
	
	},

	{
		event : 'pressmove',
		'function' : function(e){

			e.stopPropagation();
			
		}
	
	}

];

var attributeTool = new Editor.EditComponent( "attributeTool", 'click', _attributeTool, { x: 20, y: 45 }, _attributeToolComponent );