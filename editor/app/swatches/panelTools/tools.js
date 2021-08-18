/*

**Szablon PanelTool'sów

new PanelTool (
	'',
	function(){}, //
	function(){},
	function(){},
	'' 		// element HTML

)

*/


var addText = new PanelTool (

	'Nowy tekst',
	function(){

		$("#proposed-text-position-2").on('click', function(){

			var proposed = new Editor.Text2("testowy");
			

            var moveFunction = function( e ){
            
                var position = Editor.stage.getMousePosition( e.stageX, e.stageY );
                //console.log( [Math.abs(proposed.x - position[0]), Math.abs(proposed.y - position[1])] );
                proposed.updateCreator( ( position[0] - proposed.x + (proposed.trueWidth/2) ), ( position[1] - proposed.y ) + (proposed.trueHeight/2) );
                proposed.setTrueHeight( Math.abs( position[1] - proposed.y) + (proposed.trueHeight/2), true );
                proposed.setTrueWidth( Math.abs( position[0] - proposed.x) + (proposed.trueWidth/2), true );
                proposed.setBounds( 0,0 ,proposed.trueWidth, proposed.trueHeight );
                
            };
            
            var unclickFunction = function( e ){
                
                Editor.getStage().removeEventListener('stagemousemove', moveFunction);
                Editor.getStage().removeEventListener('stagemouseup', unclickFunction);
                proposed.stopCreator();
                proposed.initEvents();
                proposed.init( 50 );
                proposed.generateCursorMap();
                
            };
            
			var clickFunction = function( e ){

				var stagePosition = Editor.getStage().globalToLocal( e.stageX, e.stageY);
				var pos = Editor.stage.getMousePosition( e.stageX, e.stageY );
                
                Editor.stage.getObjectById( MAIN_LAYER ).addChild( proposed );
                Editor.stage.addObject( proposed );
                proposed.initCreator();
                
				proposed.x = pos[0];
				proposed.y = pos[1];
                proposed.setPosition_leftCorner( pos[0], pos[1] );
				
				Editor.getStage().removeEventListener('stagemousedown', clickFunction);
                Editor.getStage().addEventListener('stagemousemove', moveFunction);
                Editor.getStage().addEventListener('stagemouseup', unclickFunction);

				Editor.updateLayers();
                
			};
            
			Editor.getStage().addEventListener('stagemousedown', clickFunction);
            
		});

	}, //
	function(){},
	function(){},
	'<div id="proposed-text-position-2">nowy TEKST</div>' 		// element HTML

);

var addProposedTextPosition = new PanelTool (

	'Pozycja proponowana-tekst',
	function(){

		$("#proposed-text-position").on('click', function(){

			//console.log( Editor );
			var proposed = new Editor.ProposedTextPosition( "test", null, 300, 40 );
			Editor.stage.addObject( proposed );
			Editor.stage.getObjectById(MAIN_LAYER).addChild( proposed );
			//Editor.getStage().addChild( proposed );		

		});

	}, //
	function(){},
	function(){},
	'<div id="proposed-text-position"></div>' 		// element HTML

);

var addProposedPosition = new PanelTool(

	'Pozycja proponowana',
	function(){

		$("#proposedPosition").on("click", function(){
			
			var proposed = new Editor.ProposedPosition( "test", null, 300, 300 );
			Editor.stage.addObject( proposed );
			Editor.stage.getObjectById(MAIN_LAYER).addChild( proposed );
			//Editor.getStage().addChild( proposed );
            Editor.updateLayers();
		});

	},
	function(){},
	function(){},
	'<div id="proposedPosition"></div>'

);

var historyBack = new PanelTool (

	'historyBack',
	function(){

		$("#history-back").on('click', function(){

			Editor.restoreFromHistory( 0 );

		});
		

		$("#history-next").on('click', function(){

			Editor.nextStepFromHistory();

		});

	},
	function(){},
	function(){},
	'<div id="history-back"></div><div id="history-next"></div>' 		// element HTML

);


var loopIn = new PanelTool(

	'loopIn',
	function(){

	},
	function(){},
	function(){},
	'<div id="loopIn"></div>' // element HTML	

);


var objectFullscreen = new PanelTool(
	'resize',
	function(){
		$("#objectFullscreen").on('click', function(){
			var selected = Editor.tools.getEditObject();
			selected = Editor.stage.getObjectById( selected );
			//console.log( selected );
			//console.log( selected.getRealScale() );
		});
	},
	function(){},
	function(){},
	'<div id="objectFullscreen"></div>' // element HTML	
);


var textMaker = new PanelTool(
	'text',
	function(){

		$("#textMaker").on('click', function(){

			var obj = new createjs.Container();
			var text = new Editor.Text( "");
			var main = Editor.stage.getLayer(MAIN_LAYER);

			text.name = "text_test_layer";
			$('body').append("<div id='dodajTekst' class='mouseHelper'><img src='textIcon.png' style='width:30px;'/>Kliknij, aby dodać tekst.</div>");
			Editor.tools.setEditingObject(null);
			Editor.tools.updateCompoundBox();



			var clickFunction = function( e ){

				var stagePosition = Editor.getStage().globalToLocal( e.stageX, e.stageY);
				var pos = Editor.stage.getMousePosition( e.stageX, e.stageY );
				text.x = pos[0];
				text.y = pos[1];
				main.addText( text );
				Editor.getStage().removeEventListener('stagemousedown', clickFunction);
				text.getGlobalPosition();
				$("#dodajTekst").remove();
				//console.log( Editor.getProjectId() );
				text.saveToDB( Editor.getProjectId(), 0);

				var historyObject = {

					action : 'addText',
					info   : {

						object : text,
						parent : text.parent,
						order  : text.parent.getChildIndex( text )

					}

				};

				Editor.addToHistory( historyObject );
				Editor.updateLayers();
			};

			Editor.getStage().addEventListener('stagemousedown', clickFunction);

			text.drawDefaultText();
			//text.addFullEditableLetter("T", "50px Arial", "#FFF");
			//Editor.tools.setEditingObject( text.body.id );

		});

	}, 
	function(){},
	function(){},
	'<div id="textMaker"></div>' // element HTML	
);


var addProduct = new PanelTool(
		
	'addProduct',
	function(){

	}, //
	function(){},
	function(){},
	'<div id="addProduct-button"></div>' 		// element HTML
);


var addPages = new PanelTool(
	'addPage',
	function(){
		$("#addPage-button").on('click', function(){
			$('body').append("<div id='attributeLayer_panel' class='ui-widget-content'>\
				<div class='draggblock ui-widget-header'>Warstwa cech<span class='exit'>x</span></div>\
				<div class='window_content'>\
				<label>Nazwa strony<input type='text' id='pageName'/></label><span class='button' id='addPageLayer'>Dodaj nową stronę</span></div></div>");

			$("#addPageLayer").on('click', function(){
				var page = new EditorPage( $("#pageName").val(), false, 1, null); 	

				var layer = Editor.stage.getLayer( MAIN_LAYER );

				layer.addPage( page );
				Editor.updateLayers();
							$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
						$("#attributeLayer_panel").remove();
				});

			});
			
			$("#attributeLayer_panel .exit").on('click', function(){
				$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
					$("#attributeLayer_panel").remove();
				});
			});
		});
	},  
	function(){

	},
	function(){

	},
	"<div id='addPage-button'></div>"	
);

var saveProject = new PanelTool(
	'save',
	function(){
		$("#saveProject").on('click', function(){
			var data =  Editor.saveProject();
			Editor.loadProject( data );
		});
	},
	function(){
	
	},
	function(){},
	"<div id='saveProject'></div>"
);

var addAttributeLayer = new PanelTool(
	'attribute',
	function(){
		$("#addAttributeLayer").on('click', function(){
			var ajaxAttrList;
			$.ajax({ url: 'http://api.digitalprint9.pro/ps_types/'+ Editor.getProductId() +'/ps_product_options/attrList',
				
			success: function(data) { //Editor.loadAttributesOptions(data);

				ajaxAttrList = data;
				var attributes = "<select id='attributeSelector'>";
				var options = {};// id_opcji : nazwa_opcji
				for( var key in ajaxAttrList ){
					attributes += "<option value='"+ key +"'>";
					attributes += key;
					attributes += "</option>";
				

					options[key] = ajaxAttrList[key].options; 

				}

				attributes += "</select>"; 

				$('body').append("<div id='attributeLayer_panel' class='ui-widget-content'>\
					<div class='draggblock ui-widget-header'>Warstwa cech<span class='exit'>x</span></div>\
					<div class='window_content'>\
						<label>Cecha: " + attributes + "</label><span class='button' id='addAttributeLayer-panel'>Dodaj warstwę</span>\
						<br><input type='text' id='combinationLayerName'/><span class='button' id='addCombinationLayer'>Dodaj warstwię kombinacji cech</span></div></div>");

				$("#attributeLayer_panel .exit").on('click', function(){
					$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
						$("#attributeLayer_panel").remove();
					});
				});


				$("#addCombinationLayer").on('click', function(){

					var warstwa = new Editor.AttributeLayer( $("#combinationLayerName").val() , 'combinations' );
					//warstwa.attributeName = $("#combinationLayerName").val();
					var layer = Editor.stage.getLayer( MAIN_LAYER );
					layer.addAttributeLayer( warstwa );
					warstwa.saveToDB( Editor.getProjectId(), true );

					Editor.updateLayers();

					//Editor.updateLayers();
					$(".list  ul").sortable({
							revert : true,
							helper: "clone",
							connectWith: '.sortArea',
							placeholder: 'placeHolder',
							start : function( event, ui){
								ui.item.attr( 'data-from', ui.item.index());
								ui.item.attr( 'data-from-layer', ui.item.parent().parent().children("span").attr("data-id"));
							},
							  stop: function(event, ui){
								var list = [];
								for( var i =0; i < ui.item.parent().children().length; i++ ){
									list.unshift( ui.item.parent().children().eq(i).children("span").attr('data-id') );
								};

								var layerParent = Editor.stage.getLayer(ui.item.parent().parent().children("span").attr("data-id"));
								var layerFrom = Editor.stage.getLayer( ui.item.attr('data-from-layer'));
		//						var layerParent = Editor.stage.getLayer( 53 );
								ui.item.attr( 'data-to-layer', ui.item.parent().parent().children("span").attr("data-id"));
								if( ui.item.attr('data-to-layer') == ui.item.attr('data-from-layer') ){
									layerParent.sortArray( list );
								}
								else {
									layerFrom.swapObjectBetweenLayers( ui.item.children('span').attr('data-id'), layerParent.id);
								}

							},

							change : function( event, ui){
							}
						});
					Editor.updateLayers();

					$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
						$("#attributeLayer_panel").remove();
					});
						
				});					


				$("#attributeLayer_panel").draggable({ handle: "div.draggblock"});
				$('#attributeLayer_panel, .draggblock').disableSelection();
		
				$("#addAttributeLayer-panel").on('click', function(){
					var warstwa = new Editor.AttributeLayer( $("#attributeSelector").val(), 'relations'  );
					var layer = Editor.stage.getLayer( MAIN_LAYER );
					warstwa.options = options;
					warstwa.attributeName = $("#attributeSelector").val();

					warstwa.saveToDB( Editor.getProjectId() );
					layer.addAttributeLayer( warstwa );

					Editor.updateLayers();
					$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
						$("#attributeLayer_panel").remove();
					});

						
				});		

			} });	





		});
	},
	function(){
	
	},
	function(){},
	"<div id='addAttributeLayer'></div>"
);

var addEditGroup = new PanelTool(
	'dodaj nowa grupe edycji',
	function(){
		$("#addLayer").on('click', function(){
			if( $("#newLayer").length == 0 ){
				$('body').append("<div id='newLayer' class='ui-widget-content'><div class='draggblock ui-widget-header'>Nowa grupa<span class='exit'>x</span></div><div class='window_content'><label>Nazwa <input type='text' id='newLayer_name'/></label><span id='addNewEditGroup' class='button'>Dodaj nową grupę</span></div></div>");
				$("#newLayer .exit").on('click', function(){
					$("#newLayer").animate({ opacity: .0},300, function(){
						$("#newLayer").remove();
					});
				});
				$("#newLayer").draggable({ handle: "div.draggblock"});
				$('#newLayer, .draggblock').disableSelection();

				$("#addNewEditGroup").on('click', function(){
					var newGroup = new EditorLayer( $("#newLayer_name").val() );

					var response = newGroup.saveToDB( Editor.getProjectId() );

					Editor.stage.addLayer( newGroup );
					Editor.updateLayers();
				});
			}
		});

	},
	function(){},
	function(){},
	"<div id='addLayer'></div>"
);

var createEditablePlane = new PanelTool(
	'Dodaj Plane'		,
	function(){
		$("#editablePlane").on('click', function(){
			//console.log("TEST");
			//console.log( Editor.getProjectId() );
			if( $("#editablePlane_panel").length == 0 ){	
				$('body').append("<div id='editablePlane_panel' class='ui-widget-content'><div class='draggblock ui-widget-header'>Obiekt edycji<span class='exit'>x</span></div><div class='window_content'><label>Nazwa: <input type='text' id='editable_plane_name'/></label><br><br>Rozmiar:<br><label>szer: <input type='text' id='editable_plane_width' /></label><label>wys: <input type='text' id='editable_plane_height'></label><br><label>spad: <input type='text' id='editable_plane_slope'/></label><br><span class='button' id='addPlane'>Dodaj obiekt</div></div></div>");

				$("#editablePlane_panel .exit").on('click', function(){
					$("#editablePlane_panel").animate({ opacity: .0},300, function(){
						$("#editablePlane_panel").remove();
					});
				});
				$("#editablePlane_panel").draggable({ handle: "div.draggblock"});
				$('#editablePlane_panel, .draggblock').disableSelection();

				$("#addPlane").on( 'click', function(){
//console.log("TUtaj tez jest");
					var test2 = new Editor.EditableArea($("#editable_plane_name").val(), parseFloat($("#editable_plane_width").val()), parseFloat($("#editable_plane_height").val()), null,  parseFloat($("#editable_plane_slope").val()));
					var t_layer = Editor.stage.getObjectById( MAIN_LAYER );
//console.log("TUtaj tez jest");

					t_layer.addChild( test2 );
					test2.init();
					//console.log("TUtaj tez jest");
					//console.log( t_layer );
					Editor.stage.addObject( test2 );

					//console.log( Editor.getProjectId());
					test2.saveToDB( Editor.getProjectId() );
					Editor.updateLayers();
				});
			}
		});
	},
	function(){},
	function(){},
	"<div id='editablePlane'></div>"
);


var rotatePanel = new PanelTool(
						'Rotacja',
						function(){
							var that = this;
							$("#rotate_object").on('change', function(){
								that.change();
								Editor.stage.updateTools = true;
							});
							$("#lrotate_90").on('click', function(){
								var editingObject = Editor.tools.getEditObject();
								editingObject = Editor.stage.getObjectById( editingObject );
								editingObject.rotation -= 90;
								Editor.stage.updateTools = true;
							});
							$("#rrotate_90").on('click', function(){
								var editingObject = Editor.tools.getEditObject();
								editingObject = Editor.stage.getObjectById( editingObject );
								editingObject.rotation += 90;
								Editor.stage.updateTools = true;
							});

							$("#flip_horizontal").on('click', function(){
								var editingObject = Editor.tools.getEditObject();
								editingObject = Editor.stage.getObjectById( editingObject );
								editingObject.scaleX *= -1;
								editingObject.width *= -1;
								editingObject.rotation = -editingObject.rotation;
								Editor.stage.updateTools = true;
								Editor.tools.update();
							});
							
							$("#flip_vertical").on('click', function(){
								var editingObject = Editor.tools.getEditObject();
								editingObject = Editor.stage.getObjectById( editingObject );
								editingObject.scaleY *= -1;
								editingObject.height *=  -1;
								editingObject.rotation = - editingObject.rotation;
								Editor.stage.updateTools = true;
								Editor.tools.update();
							});
						},
						function(){
							var editingObject = Editor.tools.getEditObject();
							editingObject = Editor.stage.getObjectById( editingObject );
							$("#rotate_object").val( editingObject.rotation );
						},
						function(){
							var editingObject = Editor.tools.getEditObject();
							editingObject = Editor.stage.getObjectById( editingObject );			
							editingObject.rotation = parseInt($("#rotate_object").val());
						},
						"<label class='top'>Rotacja<input type='text' id='rotate_object'></label><br><span class='button' id='lrotate_90'></span><span class='button' id='rrotate_90'></span><span class='button' id='flip_horizontal'></span><span class='button' id='flip_vertical'></span>"
					);

			var sizePanel = new PanelTool(
						'Rozmiar',
						function(){
							var that = this;
							$("#object_width").on('change', function(){
								var editingObject = Editor.tools.getEditObject();
								editingObject = Editor.stage.getObjectById( editingObject );
								editingObject.setWidth( parseFloat( $("#object_width").val()));
								Editor.stage.updateTools = true;
							});
							$("#object_height").on('change', function(){
								var editingObject = Editor.tools.getEditObject();
								editingObject = Editor.stage.getObjectById( editingObject );
								editingObject.setHeight( parseFloat( $("#object_height").val()));
								Editor.stage.updateTools = true;
							});
						},
						function(){
							var editingObject = Editor.tools.getEditObject();
							editingObject = Editor.stage.getObjectById( editingObject );
							$("#object_height").val( editingObject.height );
							$("#object_width").val( editingObject.width );
						},
						function(){
						},
						"<label class='top'>Szerokosc<input type='text' id='object_width'></label><label class='top'>Wysokosc<input type='text' id='object_height'></label>"
					);

			var positionPanel = new PanelTool(
						'Pozycja',
						function(){

							$("#object_posY").change(function(){		
								var edited = Editor.tools.getEditObject();
								var obj = Editor.stage.getObjectById( edited );
								var y = Editor.tools.getNearestVertexY();
								obj.setPosition(parseInt( obj.x), obj.y - y  + parseFloat($("#object_posY").val()));	
							});					

							$("#object_posX").change(function(){		
								var edited = Editor.tools.getEditObject();
								var obj = Editor.stage.getObjectById( edited );
								var x = Editor.tools.getNearestVertexX();
								obj.setPosition(parseInt( obj.x - x  + parseFloat($("#object_posX").val()) ) , obj.y);	
							});

						},
						function(){
							var editingObject = Editor.tools.getEditObject();
							editingObject = Editor.stage.getObjectById( editingObject );
							var y = Editor.tools.getNearestVertexY();
							var x = Editor.tools.getNearestVertexX();
							$("#object_posY").val( y );
							$("#object_posX").val( x );
						},
						function(){
							//deprecated
						},
						'<label>X:<input type="text" name="object_x" id="object_posX" /></label><label>Y:<input type="text" name="object_y" id="object_posY" /></label>'
					);

			
