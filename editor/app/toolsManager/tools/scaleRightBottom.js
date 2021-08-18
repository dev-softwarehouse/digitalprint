var EditComponent = require('./../../EditComponent').EditComponent;



var size = 14;

var rbs = new createjs.Shape();
//rbs.graphics.beginFill("blue").drawRect(0,0,size,size);
rbs.graphics.beginFill("black").drawRect(0,0,size,size);
rbs.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
rbs.regX = rbs.regY = size/2;
//rbs.regX = rbs.regY = size/2;

var scaleRB = [

	{
		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;

			hist['action'] = 'scale';
			hist['info'] = {};
			hist['info']['before'] = {};
			hist['info']['before']['scaleX'] = editingObject.scaleX;
			hist['info']['before']['scaleY'] = editingObject.scaleY;
			hist['info']['before']['x'] = editingObject.x;
			hist['info']['before']['y'] = editingObject.y;
			hist['info']['id'] = editingObject.id;

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

				if( userType == 'admin'){

					document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);				
		    		document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);
		    	}

				var component = e.currentTarget;
				var parent = e.target.parent;
				var offset = {
					x : component.x + parent.x - e.stageX,
					y : component.y + parent.y - e.stageY
				}
				var size_before = {
					w : editingObject.width,
					h : editingObject.height
				};
				var bounds = editingObject.getTransformedBounds();
				var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
				var size_X = localCursorPosition.x * editingObject.scaleX;
				var size_Y = (size_X/size_before.w * size_before.h);
				var centerPosition = component.parent.localToLocal( (editingObject.width + (  localCursorPosition.x - editingObject.width ))/2  , (editingObject.height/2) - (((editingObject.height*editingObject.scaleY)-size_Y)/editingObject.scaleY)/2  , editingObject.parent);
				editingObject.setHeight( size_Y );
				editingObject.setWidth( size_X );
				
				
				
				editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );
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

			//if( o['after']['scaleY'] != o['before']['scaleY'] || o['after']['scaleX'] != o['before']['scaleX'] );
				//Editor.addToHistory( $.extend(true, {},editingObject.getHistoryElem()) );
	
			//editingObject.saveTransformation();		
			if( !editingObject.isInEditableArea() || (userType == 'user') ){

				editingObject.updateTransformInDB();

			}
			//editingObject.updateTransformInDB();
		}
	}

];

export var scaleRightBottom = new EditComponent('right-bottom-scale', 'click', rbs, 'rb', scaleRB);

// jak ma wygladac 
// var scale RightBottom = (function(){ ... return new EditComponent(...)})();
