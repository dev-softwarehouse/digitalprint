var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var lbs = new createjs.Shape();
//lbs.graphics.beginFill("blue").drawRect(0,0,size,size);

lbs.graphics.beginFill("black").drawRect(0,0,size,size);
lbs.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
lbs.regX = lbs.regY = size/2;
//lbs.regX = lbs.regY = size/2;



var scaleLB = [

	{

		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;

		}
	
	},

	{

		event : 'pressmove',
		'function' : function(e){

				e.stopPropagation();
				var editing_id = this.id;
				var editingObject = this.objectReference;

				if ( editingObject.borderWidth == 0 ){

					editingObject.unDropBorder();
				
				}


				var component = e.currentTarget;
				var parent = e.target.parent;

				var offset = {
					x : component.x + parent.x - e.stageX,
					y : component.y + parent.y - e.stageY
				};

				if( userType == 'admin'){
					document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);				
		    		document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);
		    	}



				var size_before = {
					w : editingObject.width,
					h : editingObject.height
				};

				var bounds = editingObject.getBounds();
				var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
				var size_X = (size_before.w - localCursorPosition.x)*editingObject.scaleX;
				var size_Y = (size_X/size_before.w * size_before.h);
				var centerPosition = component.parent.localToLocal( (editingObject.width/2 + localCursorPosition.x/2 ), (editingObject.height/2) - (((editingObject.height*editingObject.scaleY)-size_Y)/editingObject.scaleY)/2, editingObject.parent );
				editingObject.setHeight( size_Y );
				editingObject.setWidth( size_X );
				var size_after = {
					w : editingObject.width,
					h : editingObject.height
				};
				var bounds2 = editingObject.getBounds();
				editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );
				if( editingObject.mask ){
					editingObject.mask.regX = editingObject.regX;
					editingObject.mask.regY = editingObject.regY;
				}
				//Editor.webSocketControllers.productType.adminProject.view.editorObject.scale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
				this.tools.init();

		}

	},

	{

		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;
			editingObject.dispatchEvent('scale');
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
			
			if( !editingObject.isInEditableArea() || (userType == 'user') ){

				editingObject.updateTransformInDB();

			}

		}

	}

];


export var scaleLeftBottom = new EditComponent('right-bottom-scale', 'click', lbs, 'lb', scaleLB);



