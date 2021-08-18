var size = 14;

var moveDown = new createjs.Shape();
//tms.graphics.beginFill("black").drawRect(0,0,size,size);
moveDown.graphics.beginFill("red").drawRect(0,0,size,size);
moveDown.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
moveDown.regX = moveDown.regY = -10;
//tms.regX = tms.regY = size/2;

var moveDownTM = [

	{

		event : 'click',
		'function' : function(e){

			e.stopPropagation();	

			var editing_id = Editor.tools.getEditObject();
			var editingObject = Editor.stage.getObjectById( editing_id );
            
			var index = editingObject.parent.getChildIndex( editingObject );

			//console.log('aktualny indeks');
			//console.log( index );

			// jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
			// Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );

			// TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem


			if( index > 0 ){

				editingObject.parent.setChildIndex( editingObject, index-1 );

			}
			else {

				if( editingObject.parent.name == 'foregroundLayer' ){

					//console.log( editingObject.parent.name );
					//console.log( editingObject.parent );
					//console.log('mogę przenieść do warstwy niżej');
					var background = editingObject.parent.parent.backgroundLayer;
					editingObject.parent.removeChild( editingObject );

					if( background.children.length > 0 )
						background.addChildAt( editingObject, background.children.length-1 );
					else 
						background.addChildAt( editingObject, background.children.length );

				}else {
					
					//console.log('jest na samym dole warstwy');
					//console.log( editingObject.parent );

				}

			}

			var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();
			//console.log( viewLayerInfo );
			
			Editor.webSocketControllers.view.moveObjects( viewLayerInfo, Editor.adminProject.format.view.getId() );
			
		}
	
	},




];


var moveDownTool = new Editor.EditComponent('move-down', 'click', moveDown, 'tm', moveDownTM );
