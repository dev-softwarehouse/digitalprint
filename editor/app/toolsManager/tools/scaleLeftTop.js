var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var lts = new createjs.Shape();
//lts.graphics.beginFill("pink").drawRect(0,0,size,size);

lts.graphics.beginFill("black").drawRect(0,0,size,size);
lts.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
lts.regX = lts.regY = size/2;
//lts.regX = lts.regY = size/2;

var scaleLT = [

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

            //var t = component.parent.globalToLocal( e.stageX, e.stageY );
            var size_before = {
                w : editingObject.width,
                h : editingObject.height
            };

            var bounds = editingObject.getTransformedBounds();

            var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);

            var size_X = (size_before.w - localCursorPosition.x)*editingObject.scaleX;
            var size_Y = (size_X/size_before.w * size_before.h);

            var centerPosition = component.parent.localToLocal( (editingObject.width/2 + localCursorPosition.x/2 ), (editingObject.height/2) + (((editingObject.height*editingObject.scaleY)-size_Y)/editingObject.scaleY)/2 , editingObject.parent );

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

			if( !editingObject.isInEditableArea() || (userType == 'user') ){

				editingObject.updateTransformInDB();

			}
			//editingObject.updateTransformInDB();
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );

		}
	}

];

export var scaleLeftTop = new EditComponent('right-top-scale', 'click' , lts, 'lt', scaleLT);
