var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var rts = new createjs.Shape();
//rts.graphics.beginFill("pink").drawRect(0,0,size,size);
rts.graphics.beginFill("black").drawRect(0,0,size,size);
rts.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
rts.regX = rts.regY = size/2;
//rts.regX = rts.regY = size/2;

var scaleRT = [

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

            var bounds = editingObject.getBounds();

            var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);

            var size_X = localCursorPosition.x * editingObject.scaleX;
            var size_Y = (size_X/editingObject.width * editingObject.height);

            var centerPosition = component.parent.localToLocal( (editingObject.width + (  localCursorPosition.x - editingObject.width ))/2  , (editingObject.height/2) + (((editingObject.height*editingObject.scaleY)-size_Y)/editingObject.scaleY)/2 , editingObject.parent );

            editingObject.setHeight( size_Y );
            editingObject.setWidth( size_X );

            var bounds2 = editingObject.getBounds();

            editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );
            if( editingObject.mask ){
                editingObject.mask.regX = editingObject.regX;
                editingObject.mask.regY = editingObject.regY;
            }

            /*
            if( editingObject.children ){

                console.log("dzieci");
                editingObject.updateInsideObjects();

            }
            */
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
            editingObject.dispatchEvent('scale');
            
            if( !editingObject.isInEditableArea() || (userType == 'user') ){

                editingObject.updateTransformInDB();

            }
            //editingObject.updateTransformInDB();
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
            
		}

	}

];

var scaleRightTop = new EditComponent('right-top-scale', 'click' , rts, 'rt', scaleRT);


export { scaleRightTop };