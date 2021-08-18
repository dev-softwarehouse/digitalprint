var size = 14;

var moveUp = new createjs.Shape();
//tms.graphics.beginFill("black").drawRect(0,0,size,size);
moveUp.graphics.beginFill("green").drawRect(0,0,size,size);
moveUp.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
moveUp.regX = moveUp.regY = 20;
//tms.regX = tms.regY = size/2;

var moveUpTM = [

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

			
			if( index < editingObject.parent.children.length-1 ){

				editingObject.parent.setChildIndex( editingObject, index+1 );
				editingObject.order = index+1;

				var moveDownObject = editingObject.parent.getChildAt( index );
				moveDownObject.order = index;

			}
			else {

				
				if( editingObject.parent.name == 'backgroundLayer' ){

					//console.log('mogę przenieść do warstwy wyżej');
					var foreground = editingObject.parent.parent.foregroundLayer;
					editingObject.parent.removeChild( editingObject );

					foreground.addChildAt( editingObject, (( foreground.children.length>0 )? 1 : 0 ) );

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


var moveUpTool = new Editor.EditComponent('move-down', 'click', moveUp, 'tm', moveUpTM );
