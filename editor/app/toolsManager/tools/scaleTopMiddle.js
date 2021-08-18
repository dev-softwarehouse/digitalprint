var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var tms = new createjs.Shape();
//tms.graphics.beginFill("black").drawRect(0,0,size,size);
tms.graphics.beginFill("black").drawRect(0,0,size,size);
tms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
tms.regX = tms.regY = size/2;
//tms.regX = tms.regY = size/2;

var scaleTM = [

	{

		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();	

			var editing_id = this.id;
			var editingObject = this.objectReference;
            
		}
	
	},

	{

		event : 'pressmove',
		'function' : function(e){


			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
			var component = e.currentTarget;

			if ( editingObject.borderWidth == 0 ){

				editingObject.unDropBorder();
				
			}
			if( userType == 'admin'){ 
				document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);				
		    	document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);
		    }
				
			var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
            
			var size_Y = (editingObject.height - localCursorPosition.y) * editingObject.scaleY;

            var centerPosition = component.parent.localToLocal( editingObject.width/2, ( editingObject.height/2 + localCursorPosition.y/2 ), editingObject.parent );
			editingObject.setHeight( size_Y );
			editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );
            
			if( editingObject.mask ){
				editingObject.mask.regX = editingObject.regX;
				editingObject.mask.regY = editingObject.regY;
			}

			this.tools.init();
			
            //Editor.webSocketControllers.productType.adminProject.view.editorObject.scale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
			//Editor.getStage().update();

		}

	},

	{
		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;

			var o = editingObject.history_tmp['info'];

			if( !editingObject.isInEditableArea() || (userType == 'user') ){

				editingObject.updateTransformInDB();

			}
			//editingObject.updateTransformInDB();
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
            
		}
	}

];


export var scaleTopMiddle = new EditComponent('right-bottom-scale', 'click', tms, 'tm', scaleTM);