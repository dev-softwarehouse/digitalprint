var EditComponent = require('./../../EditComponent').EditComponent;


var size = 28;


var fullSize = new createjs.Shape();
fullSize.graphics.beginFill("black").drawRect(0,0,size,size);
fullSize.graphics.ss(1).s("#a8a8a8").mt(0,0).lt( size,0).lt( size, size).lt(0, size).cp();
fullSize.regX = fullSize.regY = size/2;


/*
var img = new Image("fullsize.png");

var fullSize = new createjs.Bitmap( "../fullsize.png" );
fullSize.scaleX = fullSize.scaleY = 0.1;
*/





var fullSizeComponent = [

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
			var selectedObject = Editor.stage.getObjectById( Editor.tools.getEditObject());

			Editor.stage.cameraToObject( Editor.stage.getObjectById( Editor.tools.getEditObject()) );
			Editor.stage.resizeToObject( Editor.stage.getObjectById( Editor.tools.getEditObject()) );

		}
	},

	{
		
		event : 'pressmove',
		'function' : function(e){
			
			editingObject.dispatchEvent( "stageScroll" );
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

export var resizer = new EditComponent( "resizer", 'click', fullSize, { x: 20, y: 20 }, fullSizeComponent );