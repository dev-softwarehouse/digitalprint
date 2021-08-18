import {EditableArea} from './class/editablePlane';

import {Keyboard} from './class/tools/keyboard';

export var tools = function( editor ){

	var Editor = editor;

	var keyboard = new Keyboard( editor );

	var container = new createjs.Container();

	var compoundBox = new createjs.Shape();

	container.visible = false;

	var edited;

	var objectTransforms = {};

	var tmp = {};

	var hitArea = new createjs.Shape();

	var mainShape = new createjs.Shape();


	function getCompoundBox( obj ){

		var x, y, width, height;		

		var nearestVertexX = Editor.tools.getNearestVertexX(edited);
		var nearestVertexY = Editor.tools.getNearestVertexY(edited);
		var farestVertexX  = Editor.tools.getFarestVertexX(edited);
		var farestVertexY  = Editor.tools.getFarestVertexY(edited);

		return {
			x:      nearestVertexX, 
			y:      nearestVertexY,
			width:  ( farestVertexX - nearestVertexX ),
			height: ( farestVertexY - nearestVertexY )
		};

	};


	function updateCompoundBox(){

		var _edited = null;

		if( edited )
			_edited = Editor.stage.getObjectById(edited);	

		if( _edited ){
            if (userType == 'advancedUser') {
                container.visible = true;
            }
			compoundBox.visible = true;



			var loc = _edited.parent.localToLocal( _edited.x, _edited.y, Editor.getStage() );
			container.x = loc.x;
			container.y = loc.y;


			container.regX = _edited.regX;
			container.regY = _edited.regY;

			var scale = _edited.getTrueScale();

			container.scaleX = scale.x;
			container.scaleY = scale.y;

			container.rotation = _edited.getTrueRotation();
            var globalBounds = _edited.getGlobalTransformedBounds();
		}
		else {
			//container.visible = false;
			//compoundBox.visible = false;
		}

	};



	function getCompoundBoxCenterPoint(){

		return compoundBox.centerPoint;

	};



	function getCornersPosition( obj ){

		

		var obj = getEditObject();
		obj = Editor.stage.getObjectById( obj );
		var container = Editor.tools.container;

		

		var a = container.localToLocal(container.regX - (obj.width/2), container.regY - (obj.height/2), Editor.getStage());
		var b = container.localToLocal(container.regX + (obj.width/2), container.regY - (obj.height/2), Editor.getStage());
		var c = container.localToLocal(container.regX + (obj.width/2), container.regY + (obj.height/2), Editor.getStage());
		var d = container.localToLocal(container.regX - (obj.width/2), container.regY + (obj.height/2), Editor.getStage());

		return [ [a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y] ];

	};

	function getLocalCorner( count ){
		var editingObject = Editor.tools.getEditObject();
		editingObject = Editor.stage.getObjectById( editingObject );
		if( count == 0 ){
			return [editingObject.body.x - obj.trueWidth/2];
		}
	};

	function getNearestVertexY( obj ){

		var vertexes = getCornersPosition( obj );
		var nearestY = vertexes[0];
		for(var i=0; i < vertexes.length; i++ ){
			if( vertexes[i][1] < nearestY[1] ){
				nearestY = vertexes[i];
			}
		}
		return nearestY[1];

	};


	function getFarestVertexY( obj ){

		var vertexes = getCornersPosition( obj );
		var farestY = vertexes[0];
		for(var i=0; i < vertexes.length; i++ ){
			if( vertexes[i][1] > farestY[1] ){
				farestY = vertexes[i];
			}
		}
		return farestY[1];

	};


	function getFarestVertexX( obj ){

		var vertexes = getCornersPosition( obj );
		var farestX = vertexes[0];
		for(var i=0; i < vertexes.length; i++ ){
			if( vertexes[i][0] > farestX[0] ){
				farestX = vertexes[i];
			}
		}
		return farestX[0];

	};


	function getVector_nearestX_corner(){

		var x = getNearestVertexX();
		var obj = getEditObject();
		obj = Editor.stage.getObjectById( obj );

		return x + obj.body.x;

	};


	function getVector_nearestY_corner(){

		var x = getNearestVertexX();
		var obj = getEditObject();
		obj = Editor.stage.getObjectById( obj );

		return  obj.body.y + y;

	};


	function getNearestVertexX( obj ){

		var vertexes = getCornersPosition( obj );
		var nearestX = vertexes[0];
		for(var i=0; i < vertexes.length; i++ ){
			if( vertexes[i][0] < nearestX[0] ){
				nearestX = vertexes[i];
			}
		}
		return nearestX[0];

	};


	function initTools(){

		if( !edited ){
            hideCompoundBox();
            
            return false;
        }

        
		var _edited = Editor.stage.getObjectById(edited);

        
		if( /*_edited instanceof EditGroup || */_edited instanceof EditableArea ){

			_edited.updatePositions();

		}
        
		if( !_edited.toolsType ){
			
            hideCompoundBox();
            return false;
			
		}

		//console.log( _edited );
		var toolsToAttach = Editor.toolsManager.getToolsFromType( _edited.toolsType );

		if(_edited == null){

			container.visible = false;
			return false;

		}

		var loc = _edited.parent.localToLocal( _edited.x, _edited.y, Editor.getStage() );

		var trueScale = _edited.getTrueScale();
        if (userType == 'advancedUser') {
            container.visible = true;
        }
		container.regX = _edited.regX ;
		container.regY = _edited.regY ;
		container.x = loc.x;
		container.y = loc.y;
		container.scaleX = trueScale.x;
		container.scaleY = trueScale.y;
		container.removeAllChildren();

		if( _edited ){

			_edited.removeEventListener('pressmove');
			_edited.removeEventListener('pressup');

		}
		
		var editingObj = Editor.stage.getObjectById( Editor.tools.getEditObject() );
		var bounds = _edited.getBounds();

			for( var i=0; i < toolsToAttach.components.length; i++ ){
				toolsToAttach.components[i].tools = Editor.tools;
				toolsToAttach.components[i].objectReference = editingObj;
				toolsToAttach.components[i].body.scaleX = 1/Editor.getStage().scaleX * 1/trueScale.x;
				toolsToAttach.components[i].body.scaleY = 1/Editor.getStage().scaleY* 1/trueScale.y;
				switch( toolsToAttach.components[i].positionInfo ){
					case 'rb':
						toolsToAttach.components[i].setPosition( bounds.x + bounds.width, bounds.y + bounds.height);
					break;

					case 'rt':
						toolsToAttach.components[i].setPosition( bounds.x + bounds.width , bounds.y ); 
					break;

					case 'lt':
						toolsToAttach.components[i].setPosition( bounds.x, bounds.y );
					break;
					
					case 'lb':
						toolsToAttach.components[i].setPosition( bounds.x, bounds.y + bounds.height); 
					break;

					case 'rm':
						toolsToAttach.components[i].setPosition( bounds.x + bounds.width, bounds.y + bounds.height/2);
					break;

					case 'lm':
						toolsToAttach.components[i].setPosition( bounds.x, bounds.y + bounds.height/2);
					break;

					case 'tm':
						toolsToAttach.components[i].setPosition( bounds.x  + bounds.width/2, bounds.y);
					break;

					case 'bm':
						toolsToAttach.components[i].setPosition( bounds.x + bounds.width/2, bounds.y + bounds.height);
					break;

					default:

						//console.log( toolsToAttach.components[i] );
						//console.log(  );

						if( toolsToAttach.components[i].positionInfo instanceof Object ){

							toolsToAttach.components[i].setPosition( toolsToAttach.components[i].positionInfo.x * 1/_edited.scaleX, toolsToAttach.components[i].positionInfo.y * 1/_edited.scaleY );
						
						}
						else {

							toolsToAttach.components[i].setPosition( _edited.width/2,(( _edited.scaleY < 0  ) ? 40 : -40 ) * 1/Editor.getStage().scaleX );
						
						}
					
				}

				container.addChild( toolsToAttach.components[i].body );

			}

			container.addChild( toolsToAttach.components[i] );
			Editor.getStage().addChild( compoundBox );



		//_edited.body.parent.addChild( container );
		Editor.getStage().addChild(container);
		//Editor.getStage().update();

		container.rotation = _edited.rotation;

		//boundingBox

		var bounds = _edited.getTransformedBounds();

		hitArea.graphics.setStrokeStyle(2).beginStroke("#222").drawRect(0,0, bounds.width, bounds.height);

		mainShape.graphics.beginFill("#000").drawRect(0, 0, bounds.width, bounds.height);
		mainShape.alpha = 0.1;

		mainShape.on('pressmove', function(e){
			container.alpha = 0.3;
			container.cursor = 'move';
			if(!tmp.dragging){	
				tmp.offset = {
					x : edited.x - e.stageX,
					y : edited.y - e.stageY
				};
			}
			tmp.dragging = true;
			
			var localPosition = Editor.stage.getSceneContainer().globalToLocal(e.stageX, e.stageY);

			container.x = localPosition.x;
			container.y = localPosition.y;

			edited.x = localPosition.x;
			edited.y = localPosition.y;

		});

		mainShape.addEventListener('pressup', function(e){
			container.alpha = 1;
			container.cursor = 'auto';
			tmp.dragging = false;
		});

		updateCompoundBox();

	};


	function updateEditedObject(){

	};
		

	function getEditObject(){

		return edited;

	};


	function setSize( width, height ){
		
	};


	function setEditingObject( object ){

		if( object != edited ){

			if( edited ){

				var obj = Editor.stage.getObjectById( edited );

				if ( obj )
					obj.dispatchEvent("unclick");

			}

			edited = object;

		}


		/*
		$(".list li span.li-button").removeClass("active");
		$(".list li span.li-button[data-id="+object+"]").addClass("active");
		*/

	};


	function removeEditingObject(){

		edited = null;

	};


	function update(){

		var _edited = Editor.stage.getObjectById(edited);	
		var toolsToAttach = Editor.toolsManager.getToolsFromType( _edited.toolsType );
		var bounds = _edited.getBounds();
		container.x = _edited.x;
		container.y = _edited.y;
		container.regX = _edited.regX;
		container.regY = _edited.regY;
		container.scaleX = _edited.scaleX;
		container.scaleY = _edited.scaleY;
		container.rotation = _edited.rotation;


			for( var i=0; i < toolsToAttach.components.length; i++ ){

				toolsToAttach.components[i].body.scaleX = 1/Editor.getStage().scaleX *1/_edited.scaleX;
				toolsToAttach.components[i].body.scaleY = 1/Editor.getStage().scaleY *1/_edited.scaleY;

				switch( toolsToAttach.components[i].positionInfo ){
					case 'rb':
						toolsToAttach.components[i].setPosition( bounds.width, bounds.height);
					break;

					case 'rt':
						toolsToAttach.components[i].setPosition( bounds.width , 0); 
					break;

					case 'lt':
						toolsToAttach.components[i].setPosition( 0, 0 );
					break;
					
					case 'lb':
						toolsToAttach.components[i].setPosition( 0, bounds.height); 
					break;

					case 'rm':
						toolsToAttach.components[i].setPosition( bounds.width, bounds.height/2);
					break;

					case 'lm':
						toolsToAttach.components[i].setPosition( 0, bounds.height/2);
					break;

					case 'tm':
						toolsToAttach.components[i].setPosition( bounds.width/2, 0);
					break;

					case 'bm':
						toolsToAttach.components[i].setPosition(bounds.width/2, bounds.height);
					break;

					default:

						if( toolsToAttach.components[i].positionInfo instanceof Object ){

							toolsToAttach.components[i].setPosition( toolsToAttach.components[i].positionInfo.x * 1/Editor.getStage().scaleY, toolsToAttach.components[i].positionInfo.y * 1/Editor.getStage().scaleY );

						}
						else {

							toolsToAttach.components[i].setPosition( _edited.trueWidth/2,(( _edited.scaleY < 0  ) ? 40 : -40 ) * 1/Editor.getStage().scaleY );

						}	

				}

			}

		updateCompoundBox();

	};


	function hideCompoundBox(){

		container.visible = false;
		compoundBox.visible = false;

	};


	function showCompoundBox(){

		container.visible = true;
		compoundBox.visible = true;

	};


	return {

		keyboard:keyboard,
		setEditingObject : setEditingObject,
		removeEditingObject : removeEditingObject,
		init : initTools,
		getEditObject : getEditObject,
		container : container,
		updateEditedObject : updateEditedObject,
		getCornersPosition : getCornersPosition,
		update : update,
		updateCompoundBox : updateCompoundBox,
		getNearestVertexX : getNearestVertexX,
		getNearestVertexY : getNearestVertexY,
		getFarestVertexY : getFarestVertexY,
		getFarestVertexX : getFarestVertexX,
		getVector_nearestX_corner : getVector_nearestX_corner,
		getCompoundBoxCenterPoint : getCompoundBoxCenterPoint,
		hideCompoundBox : hideCompoundBox,
		showCompoundBox : showCompoundBox,
		getCompoundBox : getCompoundBox

	};

}