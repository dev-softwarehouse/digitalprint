import {ProposedPosition2} from './../../class/ProposedPosition2';
import {ProposedTextPosition} from './../../class/ProposedTextPosition';
import {Text2} from './../../class/Text2';

var EditComponent = require('./../../EditComponent').EditComponent;


var size = 10;

var rms = new createjs.Shape();
//rms.graphics.beginFill("black").drawRect(0,0,size,size);

rms.graphics.beginFill("black").drawRect(0,0,size,size);
rms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
rms.regX = rms.regY = size/2;
//rms.regX = rms.regY = size/2;
rms.cursor = 'e-resize';

var resizeRightM = [

	{
		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;

			var hist = editingObject.history_tmp;

            hist['action'] = 'resize';
			hist['info'] = {};
			hist['info']['before'] = {};
			hist['info']['before']['sizeX'] = editingObject.trueWidth;
			hist['info']['before']['sizeY'] = editingObject.trueHeight;
			hist['info']['before']['x'] = editingObject.x;
			hist['info']['before']['y'] = editingObject.y;
			hist['info']['object'] = editingObject;

		}

	},

	{

		event : 'pressmove',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;
			var component = e.currentTarget;
			var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);

			var size_X = localCursorPosition.x * editingObject.scaleX;
			var centerPosition = component.parent.localToLocal( (editingObject.trueWidth + (  localCursorPosition.x - editingObject.trueWidth ))/2, editingObject.trueHeight/2, editingObject.parent );

            if( editingObject.minWidth < size_X || !editingObject.minWidth ){

                editingObject.setTrueWidth( size_X );
                editingObject.setPosition( centerPosition.x , centerPosition.y );

                if( userType == 'admin' ){

	                document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);
		    		document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);

                }


                if( editingObject.mask ){

                    editingObject.mask.regX = editingObject.regX;
                    editingObject.mask.regY = editingObject.regY;

                }

                /*
                //jezeli beda wszystkie obiekty cachowane, prawdopodobnie ten warunek trzeba bedzie usunac
                if( editingObject instanceof ProposedPosition || editingObject instanceof ProposedTextPosition || editingObject instanceof Text2 ){

                    editingObject.widthUpdate = true;
                    editingObject._updateShape();

                }*/

                editingObject.dispatchEvent('resize');

                // dzieki temu ze jest event bedziemy mogli to wykonac tylko raz w updace
                var resizeEvent = new createjs.Event("resize");

                resizeEvent.resizeMod = 'widthRight';
				resizeEvent.objectSettings = {

					size_X : size_X,
					pos : centerPosition

				};
				editingObject.dispatchEvent( "stageScroll" );
                editingObject.needRedraw=true
			    this.tools.update();

            }

		}

	},

	{

		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;

			hist['info']['after'] = {};
			hist['info']['after']['sizeX'] = editingObject.scaleX;
			hist['info']['after']['sizeY'] = editingObject.scaleY;
			hist['info']['after']['x'] = editingObject.x;
			hist['info']['after']['y'] = editingObject.y;

			var o = editingObject.history_tmp['info'];

			/*
			if( o['after']['sizeY'] != o['before']['sizeY'] || o['after']['sizeX'] != o['before']['sizeX'] );
				Editor.addToHistory( $.extend(true, {},editingObject.getHistoryElem()) );
			*/

			//editingObject.saveTransformation();
            editingObject.dispatchEvent('resizeEnd');


		}

	}

];


export var resizeRight = new EditComponent( 'right-middle-resize', 'click', rms, 'rm', resizeRightM );
