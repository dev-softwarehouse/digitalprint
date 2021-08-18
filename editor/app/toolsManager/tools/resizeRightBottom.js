import {ProposedPosition2} from './../../class/ProposedPosition2';
import {ProposedTextPosition} from './../../class/ProposedTextPosition';

var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var rbs = new createjs.Shape();
//rbs.graphics.beginFill("blue").drawRect(0,0,size,size);
rbs.graphics.beginFill("black").drawRect(0,0,size,size);
rbs.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
rbs.regX = rbs.regY = size/2;
//rbs.regX = rbs.regY = size/2;
rbs.cursor = 'se-resize';

var resizeRB = [

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
				var parent = e.target.parent;

				if( userType == 'admin' ){

					document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);
		    		document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);

				}


				var offset = {

					x : component.x + parent.x - e.stageX,
					y : component.y + parent.y - e.stageY

				};

				var size_before = {

					w : editingObject.width,
					h : editingObject.height

				};

				var bounds = editingObject.getTransformedBounds();
				var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
				var size_X = localCursorPosition.x * editingObject.scaleX;
				var size_Y = (size_X/size_before.w * size_before.h);
				var centerPosition = component.parent.localToLocal( (editingObject.trueWidth + (  localCursorPosition.x - editingObject.trueWidth ))/2  , (((editingObject.trueHeight/2)*editingObject.scaleY - ((size_before.h-size_Y)/2))/editingObject.scaleY) , editingObject.parent);

				editingObject.setTrueHeight( size_Y );
				editingObject.setTrueWidth( size_X );

				var size_after = {

					w : editingObject.width,
					h : editingObject.height

				};

				var bounds2 = editingObject.getTransformedBounds();
				//var globalPosition = component.parent.localToLocal( (editingObject.trueWidth + (  localCursorPosition.x - editingObject.trueWidth ))/2 , localCursorPosition.y , Editor.stage.getSceneContainer() );
				var height_delta = size_before.h-size_after.h;
				editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );

				if( editingObject.mask ){

					editingObject.mask.regX = editingObject.regX;
					editingObject.mask.regY = editingObject.regY;

				}

				var scaleValue = size_after.h/size_before.h;


				//jezeli beda wszystkie obiekty cachowane, prawdopodobnie ten warunek trzeba bedzie usunac
				if( editingObject instanceof ProposedPosition2 || editingObject instanceof ProposedTextPosition ){

					if( editingObject instanceof ProposedPosition2 ){

						if( editingObject.objectInside ){

							editingObject.objectInside.scaleX = editingObject.objectInside.scaleX*scaleValue;
							editingObject.objectInside.scaleY = editingObject.objectInside.scaleY*scaleValue;
							editingObject.objectInside.width  = editingObject.objectInside.trueWidth*editingObject.objectInside.scaleX;
							editingObject.objectInside.height  = editingObject.objectInside.trueHeight*editingObject.objectInside.scaleY;
							editingObject.objectInside.x = editingObject.objectInside.x * scaleValue;
							editingObject.objectInside.y = editingObject.objectInside.y * scaleValue;

						}

					}

				}

				//editingObject.dispatchEvent( "stageScroll" );
				editingObject.dispatchEvent('resizeCorner');
				//editingObject.dispatchEvent('resize');
				this.tools.update();

		}

	},

	{
		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
            editingObject.dispatchEvent('resizeEnd');

		}
	}

];

export var resizeRightBottom = new EditComponent('right-bottom-resize', 'click', rbs, 'rb', resizeRB);
