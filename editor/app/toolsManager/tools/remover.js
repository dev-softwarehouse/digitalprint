var size = 14;

var rem = new createjs.Shape();
//tms.graphics.beginFill("black").drawRect(0,0,size,size);
rem.graphics.beginFill("yellow").drawRect(0,0,size,size);
rem.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
rem.regX = rem.regY = -10;
//tms.regX = tms.regY = size/2;

var removerT = [

	{

		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();	

		}
	
	},

	{
		event : 'click',
		'function' : function(e){

			e.stopPropagation();
            //console.log( e );
            //console.log('chcę usunąć obiekt');
            //console.log('=-=-=-=-=-===-=-=-=-=-');
         	
			var editing_id = Editor.tools.getEditObject();
			var editingObject = Editor.stage.getObjectById( editing_id );

            if( editingObject.isInEditableArea() ){

            	editingObject.parent.removeChild( editingObject );
            	Editor.adminProject.format.view.page.updateObjectsOrder();
            	
            }


		}
	}

];


var objectRemover = new Editor.EditComponent('remover', 'click', rem, 'bm', removerT );