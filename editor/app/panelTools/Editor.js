var Editor = (function(){			

	var unclickEvent = new createjs.Event( 'unclick', false, true );

    var currentUrl = 'http://digitalprint.pro:1337/';
    
	var ticker = createjs.Ticker;
	var stage_;
	var canvas;
	var fonts = {};
	var currentEditableArea = null;

	var selectedEditGroup  = null; 

	var mode = 'admin'; // trzeba ustalic w konstruktorze typ edytora
	var groups = {};
	var layers = {};

	// aktualnie wybrane atrybuty opisujace edytowany obiekt
	var selectedAttributes = {};
    
    var magnetizeTolerance = 10;
	var editorProjects;
	var projectId;
	var productId;
	var uploadQueue = [];

	var history = {

		prev 		   : [],
		next 		   : [],
		elements	   : 0,
		working 	   : 0,
		queue   	   : [],
		hangingObjects : {}

	};

	var _historyLimit = 10;    
	var attributes = {

		// id_cechy : id_wybranej_opcji	

	};

	var mouseDown = [ 0, 0, 0 ];

	var moveVector = {};
	

	function getHistory(){

		return history;
		
	};


	function getSelectedAttributes(){

		return selectedAttributes;

	}

	function hangObject( object ){

		// dodaje element do tablicy elementów zawieszonych
		history.hangingObjects[ object.id ] = object;

	};


	function restoreObject( object_id ){

		//dodaj obiekt do sceny a nastepnie go usun z tablicy elementow zawieszonych
		delete history.hangingObjects[ object_id ];

	};


	function deleteHangedObject( object_id ){

		//usuniecie obiektu z bazy danych i usuniecie z elementow zawieszonych
		var object = history.hangingObjects[ object_id ];
		object.DB_remove();

		delete history.hangingObjects[ object_id ];

	};


	function updateHistoryTools(){

		if( history.next.length )
			$("#history-next").removeClass("un-active");
		else
			$("#history-next").addClass("un-active");


		if( history.prev.length )
			$("#history-back").removeClass("un-active");
		else
			$("#history-back").addClass("un-active");

	};

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };
    

	function checkHistoryQueue(){

		$("#user-simulator").html( generateHistoryHTML() );

		if( history.queue.length != 0 ){

			var current = history.queue.shift();

			if( current == 'back' ){

				if( history.prev.length > 0 ){
					
					history.working = 0;
					restoreFromHistory( 0 );

				}
				else {

					history.queue = [];
					history.working = 0;
					updateHistoryTools();
				
				}

			}
			else if( current == 'next' ){

				if( history.next.length > 0 ){
				
					history.working = 0;
					nextStepFromHistory( 0 );
				
				}
				else {

					history.queue = [];
					history.working = 0;
					updateHistoryTools();
				
				}
			}

		}
		else {

			history.queue = [];
			history.working = 0;

		}

	};


	function generateHistoryHTML(){

		var html = "<ul class='history'>";

		if( history.next.length ){

			for( var i=0; i < history.next.length; i++ ){

				html += "<li><span>" + history.next[i].action + "</span></li>";

			}

		}

		html += "<li class='current-history'><span>aktualna pozycja</span></li>";

		if( history.prev.length ){

			for( var i=history.prev.length-1; i >= 0; i-- ){

				html += "<li><span>" + history.prev[i].action + "</span></li>";

			}

		}

		html += "</ul>";

		return html;

	};


	function restoreFromHistory( backSteps ){

		if( history.working ){

			history.queue.push( 'back' );

		}

		else {

			history.working = 1;

			if( history.prev.length ){

				$("#history-back").removeClass("un-active");

				var historyElem = history.prev.pop();
				history.next.push( historyElem );

				var object = Editor.stage.getObjectById( historyElem.info.id );
				
				if( historyElem.action == "translate" || historyElem.action == "t" ){

					object.x = historyElem.info.before.x;
					object.y = historyElem.info.before.y;

					if( object.mask ){

						object.mask.x = historyElem.info.before.x;
						object.mask.y = historyElem.info.before.y;

					}

				}
				else if( historyElem.action == 'addObject' ){

					Editor.stage.removeObject_ToHistory( historyElem.info.object.id , false );
					historyElem.info.object.DB_setAttribute( 'inHistory', 0 );

					Editor.updateLayers();


					updateHistoryTools();
					checkHistoryQueue();

				}
				else if( historyElem.action == "rotation" || historyElem.action == "r" ){

					object.rotation = historyElem.info.before;

				}
				else if( historyElem.action == "scale" || historyElem.action == "s" ){

					object.scaleX = historyElem.info.before.scaleX;
					object.scaleY = historyElem.info.before.scaleY;
					object.x 	   = historyElem.info.before.x;
					object.y 	   = historyElem.info.before.y;

					if( object.mask ){

						object.mask.x = historyElem.info.before.x;
						object.mask.y = historyElem.info.before.y;

					}

				}
				else if( historyElem.action == "changeOrder" ){



					if( historyElem.info.parentBefore == historyElem.info.parentAfter ){

						historyElem.info.parentBefore.removeChild( historyElem.info.object );
						historyElem.info.parentBefore.addChildAt( historyElem.info.object, historyElem.info.orderBefore );

						Editor.updateLayers();

						updateHistoryTools();
						checkHistoryQueue();

					}
					else {

						historyElem.info.parentAfter.removeChild( historyElem.info.object );
						delete historyElem.info.parentAfter.objects[ historyElem.info.object ];

						historyElem.info.parentBefore.addChildAt( historyElem.info.object, historyElem.info.orderBefore );
						historyElem.info.parentBefore.objects[ historyElem.info.object.id ] = historyElem.info.object;
				
						Editor.updateLayers();

						updateHistoryTools();
						checkHistoryQueue();

					}

				}
				else if( historyElem.action == "addLayer" || historyElem.action == "al"){
					
					//var object = Editor.stage.getObjectById( historyElem.info.id );
					Editor.stage.removeLayer( Editor.getProjectId(), historyElem.info.dbId, historyElem.info.id);
					Editor.updateLayers();

				}
				else if( historyElem.action == "addText" ){

					Editor.stage.removeObject_ToHistory( historyElem.info.object.id, false );

					historyElem.info.object.DB_setAttribute( 'inHistory', 1 );

					Editor.updateLayers();

					updateHistoryTools();
					checkHistoryQueue();

				}
				else if( historyElem.action == 'removeObject' || historyElem.action == "ro"){

					var object = history.hangingObjects[ historyElem.info.object.id ];
					Editor.stage.addObjectFromHistory( historyElem );

					object.DB_setAttribute( 'inHistory', 0 );
					Editor.updateLayers();

				}

                else if( historyElem.action == 'resize' ){
                    
                    var object = historyElem.info.object;
                    
                    object.setTrueHeight( historyElem.info.before.sizeY );
                    object.setTrueWidth( historyElem.info.before.sizeX );
                    
                    if( object instanceof Editor.ProposedPosition || object instanceof Editor.ProposedTextPosition || object instanceof Editor.Text2 ){

                        object.widthUpdate = true;
                        object._updateShape();

                    }
			
			         object.dispatchEvent('resize');
                    
                }
                
				updateHistoryTools();
				Editor.tools.updateCompoundBox();

				if( !history.prev.length )
					$("#history-back").addClass("un-active");

			}

			if( history.next.length )
				$("#history-next").removeClass("un-active");
			else
				$("#history-next").addClass("un-active");

			Editor.tools.updateCompoundBox();
			
			checkHistoryQueue();

		}

	};


	function nextStepFromHistory(){


		if( history.working ){

			history.queue.push( 'next' );
			
		}
		else {

			history.working = 1;

			if( history.next.length ){

				$("#history-next").removeClass("un-active");

				var historyElem = history.next.pop();

				var object = Editor.stage.getObjectById( historyElem.info.id );

				if( historyElem.action == "translate" || historyElem.action == "t" ){

					object.x = historyElem.info.after.x;
					object.y = historyElem.info.after.y;

					if( object.mask ){

						object.mask.x = historyElem.info.before.x;
						object.mask.y = historyElem.info.before.y;

					}

					history.prev.push( historyElem );
					updateHistoryTools();
					checkHistoryQueue();

				}
				else if( historyElem.action == 'addObject' ){

					//console.log( Editor.stage.getHighestLayerInGroup( historyElem.info.parent ) );
					var object = history.hangingObjects[ historyElem.info.object.id ];
					Editor.stage.addObjectFromHistory( historyElem );


					history.prev.push( historyElem );

					historyElem.info.object.DB_setAttribute( 'inHistory', 0 );
					updateHistoryTools();
					checkHistoryQueue();
					Editor.updateLayers();	

				}				
				else if( historyElem.action == "changeOrder" ){

					if( historyElem.info.parentBefore == historyElem.info.parentAfter ){

						historyElem.info.parentBefore.removeChild( historyElem.info.object );
						historyElem.info.parentBefore.addChildAt( historyElem.info.object, historyElem.info.orderAfter );			

						Editor.updateLayers();
						
						history.prev.push( historyElem );
						updateHistoryTools();
						checkHistoryQueue();

					}
					else {

						historyElem.info.parentBefore.removeChild( historyElem.info.object );
						delete historyElem.info.parentBefore.objects[ historyElem.info.object ];

						historyElem.info.parentAfter.addChildAt( historyElem.info.object, historyElem.info.orderAfter );
						historyElem.info.parentAfter.objects[ historyElem.info.object.id ] = historyElem.info.object;
				
						Editor.updateLayers();

						history.prev.push( historyElem );
						updateHistoryTools();
						checkHistoryQueue();

					}

				}
				else if( historyElem.action == "addText" ){

					Editor.stage.addObjectFromHistory( historyElem, false );

					history.prev.push( historyElem );

					historyElem.info.object.DB_setAttribute( 'inHistory', 0 );
					updateHistoryTools();
					checkHistoryQueue();
					Editor.updateLayers();	

				}
				else if( historyElem.action == "rotation" || historyElem.action == "r" ){

					object.rotation = historyElem.info.after;
					history.prev.push( historyElem );
					updateHistoryTools();
					checkHistoryQueue();

				}
				else if( historyElem.action == "scale" || historyElem.action == "s" ){

					object.scaleX = historyElem.info.after.scaleX;
					object.scaleY = historyElem.info.after.scaleY;
					object.x 	   = historyElem.info.after.x;
					object.y 	   = historyElem.info.after.y;

					if( object.mask ){

						object.mask.x = historyElem.info.before.x;
						object.mask.y = historyElem.info.before.y;

					}

					history.prev.push( historyElem );
					updateHistoryTools();
					checkHistoryQueue();

				}
				else if( historyElem.action == "addLayer" || historyElem.action == "al"){

					var warstwa = new EditorAttributeLayer( historyElem.info.name , 'combinations' );
					var layer = Editor.stage.getObjectById( historyElem.info.parent );
					layer.addAttributeLayer( warstwa );
					
					warstwa.saveToDB( Editor.getProjectId(), false, function(){

						historyElem = $.extend( true, {}, warstwa.history_tmp );

						history.prev.push( historyElem );

						Editor.tools.updateCompoundBox();

						updateHistoryTools();
						checkHistoryQueue();

					});

				}
				else if( historyElem.action == 'removeObject' || historyElem.action == "ro"){

					Editor.stage.removeObject_ToHistory( historyElem.info.object.id , false );
					historyElem.info.object.DB_setAttribute( 'inHistory', 1 );

					Editor.updateLayers();
					history.prev.push( historyElem );

					updateHistoryTools();
					checkHistoryQueue();

				}

			}else {

				checkHistoryQueue();

			}

		Editor.tools.updateCompoundBox();

		}

	};


	// Nowy moduł Editor.history ?
	function addToHistory( elem ){

		if( elem.action == 'removeObject' ){
			hangObject( elem.info.object );
		}

		if( history.elements < _historyLimit ){

			if( history.next.length > 0 ){

				history.elements -= history.next.length;
				history.next = [];

			}

			history.prev.push( elem );

		}
		else {

			if( history.next.length > 0 ){

				history.elements -= history.next.length;
				history.next = [];

			}

			history.prev.pop();
			history.prev.push( elem );

		}


		updateHistoryTools();
		checkHistoryQueue();

	};


	function addBitmap(){

		var historyInfo = {

			action : 'add',
			objects : {
				"TU OBEIKT ID" : "tutaj info"
			}

		};

	};


	function editorEvents( e ){

		//var selected = Editor.tools.getEditObject();
		//selected = Editor.stage.getObjectById( selected );
		//console.log('ATTTAAAK');

		if(e.keyCode === 8){
			e.returnValue = false;
		}

	};


	function initEvents(){

		document.addEventListener("keydown", editorEvents);
		/*
		stage_.addEventListener('stagemousedown', function(e){	
			Editor.tools.setEditingObject(null);
			Editor.tools.updateCompoundBox();
		});
		*/

	};



	function getInfo(){

		return [ stage_, layers];

	};


	function getMouseButtonState(){

		return mouseDown;

	};


	function getCurrentEditableArea(){

		return currentEditableArea;	

	};

	
	function setCurrentEditableArea( object ){

	};


	function setVectorStart( x, y ){

		moveVector.start = {
			x : x,
			y : y 
		}

	};


	function setVectorStop( x, y ){

		moveVector.stop = {
			x : x,
			y : y 
		}

	};


	function getMoveVector(){

		return { 
			x: moveVector.start.x - moveVector.stop.x,
			y: moveVector.start.y - moveVector.stop.y
		}

	};


	function generateAttributesList( formatID ){



	};


	function generateAttributesOptions_Select( ){

		var attributes = getAttributesOptions();

		var excludedOptions = [];
		var html = "Dostosuj produkt:<br>\
			    <label class='labelAttribute'><span>Format:</span><select id='-1' class='attribute'>";
		for( var key in attributes ){

			html += "<option value='"+key+"' " +  ( ( selectedAttributes['-1'] == key ) ? "selected='selected'" : ""  ) + ">" + attributes[key].name + "</option>";
		}
		html += "</select></label>";

		$("#attributesSelector").html( html );

		var id_format = $("#-1").val();

		// zbiera wszystkie selecty 
		var selects = [];

		selectedAttributes['-1'] = parseInt($("#-1").val());


		var key_before = null;

		for( var key in attributes[ id_format ].attributes ){

			if( key in selectedAttributes ){

				if( attributes[id_format].attributes[key].options[selectedAttributes[key]]){	
					if(attributes[id_format].attributes[key].options[ selectedAttributes[key] ].excludes != null ){

						for( var i=0; i < attributes[id_format].attributes[key].options[ selectedAttributes[key] ].excludes.length; i++ ){
							excludedOptions.push(attributes[id_format].attributes[key].options[ selectedAttributes[key] ].excludes[i]);
						}

					}
				}

				var html2 = "<label class='labelAttribute'><span>" + attributes[id_format].attributes[key].name + ":</span><select id='"+ key +"' class='attribute'>";
				for( var option in attributes[id_format].attributes[key].options ){
					option = parseInt( option );
					if( excludedOptions.indexOf( option ) == -1 ){
						html2 += "<option value='" + option + "' "+ ( ( selectedAttributes[key] == option ) ? " selected='selected'" : "" ) + ">" + attributes[id_format].attributes[key].options[option].name + "</option>";
					}
				}
				html2 += "</select></label>";
				
				var old_html = $("#attributesSelector").html();
				//dodanie kodu selecta do html 


				$("#attributesSelector").html( old_html + html2 );

				key_before = key;
				
				if( excludedOptions.indexOf( selectedAttributes[key] ) != -1){

					selectedAttributes[key] = parseInt($("#"+key).val());
				}

			}
			else {
				var html2 = "<label class='labelAttribute'><span>" +attributes[id_format].attributes[key].name + ":</span><select id='"+ key +"' class='attribute'>";
				for( var option in attributes[id_format].attributes[key].options ){
					option = parseInt(option);

					if( excludedOptions.indexOf( option ) == -1 ){
						html2 += "<option value='" + option + "' "+ ( ( selectedAttributes[key] == option ) ? " selected='selected'" : "" ) + ">" + attributes[id_format].attributes[key].options[option].name + "</option>";
					}
				}

				html2 += "</select></label>";
				
				var old_html = $("#attributesSelector").html();
				//dodanie kodu selecta do html

				$("#attributesSelector").html( old_html + html2 );

				selectedAttributes[key] = parseInt($("select#"+key).val());

				if(attributes[id_format].attributes[key].options[ selectedAttributes[key] ].excludes != null){

					for( var i=0; i < attributes[id_format].attributes[key].options[ selectedAttributes[key] ].excludes.length; i++ ){
						excludedOptions.push(attributes[id_format].attributes[key].options[ selectedAttributes[key] ].excludes[i]);

					}

				}


				key_before = key;
			}

		}


		$('select.attribute').on('change', function(){

			selectedAttributes[$(this).attr('id')] = parseInt($(this).val());
			generateAttributesOptions_Select();	

		});

		$('select#-1').on('change', function( ){

			//console.log('zaladowanie innego projektu do edytora');
			//console.log( $(this).val() );

		});


		$("#format-attr").on('change', function(){

			var id_format = parseInt($("#format-attr").val());
			selectedAttributes = { '-1' : id_format };


			$.ajax( {
				url: 'http://api.digitalprint.pro/ps_types/'+productId+'/ps_product_options/forEditor/?companyID=668',
				success: function(data){
					//console.log('zrobio sięęę');
					generateAttributesOptions_Select();	

				},
				error: function( data ){

				}
			});
            
		});

		return html;

	};


	function updateLayersFunctions(){


		$(".list li > span.li-button").on('dblclick', function(e){
			Editor.stage.cameraToObject( Editor.stage.getObjectById(e.currentTarget.dataset.id ));
		});

		$(".list li > span.li-button").on('click', function(e){
			Editor.tools.setEditingObject( e.currentTarget.dataset.id );
			$(".list li span.li-button").removeClass("active");
			$(this).addClass("active");
		});

		// grupy cech
		$(".list .attrCombinations").on('click', function(){
			var layer_id = $(this).parent().attr("data-id");
			var mainLayer = Editor.stage.getObjectById( layer_id );
			$.ajax({ url: 'http://api.digitalprint.pro/ps_types/'+productId+'/ps_product_options/attrList', success: function(data) {
				var ajaxAttrList = data;			
				//Editor.loadAttributesOptions(data);
				var attributes = "<select id='attributeSelector'>";
				var options = {};// id_opcji : nazwa_opcji
				for( var key in ajaxAttrList ){
					attributes += "<option value='"+ key +"'>";
					attributes += key;
					attributes += "</option>";
						
					options[key] = ajaxAttrList[key].options; 
				}
				attributes += "</select>";
				$("body").append("<div id='attributeLayer_panel' data-id='"+ layer_id +"' data-base-id='"+ mainLayer.dbId +"' class='ui-widget-content'>\
					<div class='draggblock ui-widget-header'>Warstwa cech<span class='exit'>x</span></div>\
					<div class='window_content'>\
					<label>Cecha: " + attributes + "</label>\
					<span class='button' id='addAttributeLayerOption-panel'>Dodaj warstwę</div></div></div>");

				$("#attributeLayer_panel .exit").on('click', function(){
					$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
						$("#attributeLayer_panel").remove();
					});
				});

				$("#attributeSelector").on('change', function(){

					var option = ajaxAttrList[$("#attributeSelector").val() ].options;
					var options = "<select id='attributeOption'>";

					for( var i=0; i < option.length; i++){
						options += "<option value='"+option[i].name+"'>"+option[i].name+"</option>";
					}
					options += "</select>";

					if( $("#attributeOption").length == 0){
						$("#attributeLayer_panel .window_content").append( options );
					}
					else {
						$("#attributeOption").remove();
						$("#attributeLayer_panel .window_content").append( options );
					}

				});

				$("#addAttributeLayerOption-panel").on('click', function(){
					var layer_id = $("#attributeLayer_panel").attr('data-id');
					var object = Editor.stage.getObjectById( layer_id );
					var attr = ajaxAttrList[ $("#attributeSelector").val() ];
				
					var optionToAdd;

					for( var i=0; i < attr.options.length; i++ ){
						if(attr.options[i].name == $("#attributeOption").val()){
							
							optionToAdd = { 
								id: attr.options[i].ID,
								name: $("#attributeOption").val()
							}

							break;
						}
					}

					$.ajax({
						url : 'http://api.digitalprint.pro/adminProjects/'+Editor.getProjectId()+'/adminProjectLayers/'+mainLayer.dbId+'/adminProjectLayerAttributes/',
						type: "POST",
						crossDomain: true,
						data: "{ \"optID\" : "+optionToAdd.id+", \"attrType\": "+((attr.ID == -1 )? 2 : ((attr == -2) ? 3 : 1 ))+" }",
						contentType: 'application/json',
						success : function( data ){
							//alert( JSON.stringify(data) );


							object.addCombinationOption({ id: attr.ID, name: $("#attributeSelector").val() },  { id: optionToAdd.id, name: optionToAdd.name }, data.item.ID );
							
							Editor.updateLayers();
						},
						error : function (data){
							//alert( JSON.stringify(data) );
						}

					});



				});


			} // koniec zapytania ajaxowego

			});

		});
		// grupy cech

		//	Editor.stage.getLayersOrderAndParent();

		$(".list span.group-list .group").on('click', function( e ){
			$(this).parent().parent().children('ul').toggle();		
		});

		$(".list .visibility").on('click', function(e){

			//	e.stopPropagation();
			var object_id = $(this).parent().attr('data-id');
			var dbObjectId = $(this).attr('data-base-id');

			var object = Editor.stage.getObjectById( object_id );
			object.toggleVisible();

			if( $(this).hasClass("active") ){

				$(this).addClass("un-active");
				$(this).removeClass("active");

				if( $(this).parent().parent().children("ul").length > 0 ){

					$(this).parent().parent().children("ul").addClass('un-active-child-v');

				}

			}
			else {

				$(this).addClass('active');
				$(this).removeClass('un-active');
				$(this).parent().parent().children("ul").removeClass('un-active-child-v');

			}
			
			$.ajax({

				url: 'http://api.digitalprint.pro/adminProjects/'+Editor.getProjectId()+'/adminProjectLayers/'+dbObjectId,
				headers: {
					'x-http-method-override' : "patch"
				},
				type: 'POST',
				crossDomain: true,
				contentType: 'application/json',
				data: "{ \"isVisible\" : "+(( Editor.stage.getObjectById(object_id).body.visible)? 1 : 0 )+"}",
				success: function( data ){
					//alert( JSON.stringify(data));
				},
				error: function( data ){
					//alert( JSON.stringify(data));
				}

			});

		});

		$(".list .locker").on('click', function(e){

			e.stopPropagation();
			var object_id = $(this).parent().attr('data-id');
			var dbObjectId = $(this).attr('data-base-id');

			var object = Editor.stage.getObjectById( object_id );
			object.toggleLock();

			if( $(this).hasClass("active") ){

				$(this).addClass("un-active");
				$(this).removeClass("active");

				if( $(this).parent().parent().children("ul").length > 0 ){

					$(this).parent().parent().children("ul").addClass('un-active-child-l');

				}

			}
			else {

				$(this).addClass('active');
				$(this).removeClass('un-active');
				$(this).parent().parent().children("ul").removeClass('un-active-child-l');

			}

			
			$.ajax({

				url: 'http://api.digitalprint.pro/adminProjects/'+Editor.getProjectId()+'/adminProjectLayers/'+dbObjectId,
				headers: {
					'x-http-method-override' : "patch"
				},
				type: 'POST',
				crossDomain: true,
				contentType: 'application/json',
				data: "{ \"isBlocked\" : "+(( Editor.stage.getObjectById(object_id).mouseEnabled)? 0 : 1 )+"}",
				success: function( data ){
					//alert( JSON.stringify(data));
				},
				error: function( data ){
					//alert( JSON.stringify(data));
				}

			});
			
		});

		$(".remover").on('click',function( e ){

			e.stopPropagation();

			var object = Editor.stage.getObjectById($(this).parent().attr('data-id'));

			if(object instanceof Editor.Bitmap || object instanceof Editor.Text){

				var parent =  Editor.stage.getObjectById( object.parent.id );


				Editor.stage.removeObject_ToHistory( $(this).parent().attr('data-id'), true );
				object.DB_setAttribute( 'inHistory', 1 );

				Editor.updateLayers();

			}
			else {

				var parent = Editor.stage.getObjectById( object.parent.id );

				Editor.stage.removeObject_ToHistory( $(this).parent().attr('data-id'), true );
				object.DB_setAttribute( 'inHistory', 1 );

				Editor.updateLayers();

				//Editor.stage.removeLayer( Editor.getProjectId(), $(this).parent().attr('data-base-id'), $(this).parent().attr('data-id'));

			}

		});


		$(".option-remover").on('click', function(){
			var attributeLayer_id = $(this).attr('data-layer-id');
			var attributeLayer = Editor.stage.getObjectById( attributeLayer_id );
			var attrID = $(this).attr("data-attr-id");
			var optID = $(this).attr("data-opt-id");
			var dbId = $(this).attr('data-base-id');

			$.ajax({
				url :'http://api.digitalprint.pro/adminProjectLayerAttributes/'+dbId,
				crossDomain: true,
				contentType: 'application/json',
				type: "DELETE",
				success : function(data){
					//alert(JSON.stringify(data));

					attributeLayer.removeCombinationOption( attrID, optID);
					Editor.updateLayers();
				}

			});

		});

		$(".list span.attributes").on('click', function(e){
			e.stopPropagation();	
			var object_id = $(this).parent().attr('data-id');
			var object = Editor.stage.getObjectById( object_id );
		
			var options = "<select id='addOptionToAttribute'>";

			for( var i=0; i < object.options[object.attributeName].length; i++){

				options += "<option val='"+ object.options[object.attributeName][i].name+"'>"+ object.options[object.attributeName][i].name +"</option>";
			}

			options += "</select>";

			$('body').append("<div id='attributeLayer_panel' class='ui-widget-content'>\
					<div class='draggblock ui-widget-header'>Warstwa cech<span class='exit'>x</span></div>\
					<div class='window_content'>\
						<label>Opcja: " + options + "</label>\
						<span class='button' id='addAttributeLayerOption-panel'>Dodaj warstwę</div></div></div>");

			$("#attributeLayer_panel .exit").on('click', function(){
				$("#attributeLayer_panel").animate({ opacity: .0},300, function(){
					$("#attributeLayer_panel").remove();
				});
			});

			$("#attributeLayer_panel").draggable({ handle: "div.draggblock"});
			$('#attributeLayer_panel, .draggblock').disableSelection();

			$("#addAttributeLayerOption-panel").on('click', function(){
				// TO DO:
				// - dodanie zależności warstwy z cechą 
				var layer = new EditorLayer( $("#addOptionToAttribute").val());
				object.addLayer( layer );
				Editor.updateLayers();
			});

			
			Editor.updateLayers();
		});
		
		$(".list  ul").sortable({
					revert : true,
					connectWith: '.sortArea',
					start : function( event, ui){

						ui.item.attr("data-start-index", ui.item.index() );

						ui.item.attr( 'data-from', ui.item.index());
						ui.item.attr( 'data-from-layer', ui.item.parent().parent().children("span").attr("data-id"));
						ui.item.attr( 'data-type', ( ui.item.children('.li-button').hasClass('group-list') ) ? "layer" : ( ( ui.item.children('.li-button').hasClass('attributes-layer')  ) ? "attributes-layer" : "object" ) );

					},
					  stop: function(event, ui){
							
					  	ui.item.attr( 'data-to-layer', ui.item.parent().parent().children("span").attr("data-id"));
						// do poprawki

					  	if( ui.item.attr('data-type') == 'layer' && ( ui.item.attr('data-to-layer') != ui.item.attr('data-from-layer')) ){

							var object = Editor.stage.getObjectById( ui.item.attr('data-id') );

							var layer = Editor.stage.getObjectById( ui.item.children("span").attr("data-id")  );	
							var layerParent = Editor.stage.getObjectById( layer.parent.id );


							var newLayerId =  ui.item.parent().parent().children("span").attr('data-id');
							newLayerId = Editor.stage.getObjectById( newLayerId );

							layerParent.removeChild( object );
							newLayerId.addMainChild( object );


							Editor.updateLayers();


						}
						else {

							if( ui.item.attr('data-to-layer') == ui.item.attr('data-from-layer') ){

								var list = [];

								for( var i =0; i < ui.item.parent().children().length; i++ ){

									list.unshift( ui.item.parent().children().eq(i).children("span").attr('data-id') );

								};


								ui.item.attr("data-stop-index", ui.item.index() );

								var layerParent = Editor.stage.getObjectById(ui.item.parent().parent().children("span").attr("data-id"));
								var layerFrom = Editor.stage.getObjectById( ui.item.attr('data-from-layer'));


								ui.item.attr( 'data-to-layer', ui.item.parent().parent().children("span").attr("data-id"));


								if( ui.item.index() == 0 ){
									
									var object = Editor.stage.getObjectById( ui.item.attr('data-id') );

									var orderBefore = layerParent.getChildIndex( object );
									var numChildren = layerParent.getRealNumChildren();
									layerParent.removeChild( object );

									layerParent.addMainChild( object );
									
									var orderAfter = layerParent.getChildIndex( object );

									if( orderAfter != orderBefore ){

										var history = {

											action : "changeOrder",

											info : {

												object       : object,
												parentBefore : layerParent,
												parentAfter  : layerParent,
												orderBefore  : orderBefore,
												orderAfter   : orderAfter

											}

										}

										addToHistory( history );

									}
									else {

									}

								}
								else {

									var object = Editor.stage.getObjectById( ui.item.attr('data-id') );
									var orderBefore = layerParent.getChildIndex( object );
									var numChild = layerParent.getRealNumChildren();
									layerParent.removeChild( object );

									layerParent.addMainChildAt( object, numChild-1 - ui.item.index() );
									var orderAfter = layerParent.getChildIndex( object );

									if( orderAfter != orderBefore ){

										var history = {

											action : "changeOrder",

											info : {

												object       : object,
												parentBefore : layerParent,
												parentAfter  : layerParent,
												orderBefore  : orderBefore,
												orderAfter   : orderAfter

											}

										}

										addToHistory( history );
									}
									else {

									}
									
								}

							}
							else {
								
								var object = Editor.stage.getObjectById( ui.item.attr('data-id') );


								var layerFrom = Editor.stage.getObjectById( ui.item.attr('data-from-layer') );
								var layerTo   = Editor.stage.getObjectById( ui.item.attr('data-to-layer') );

								delete layerFrom.objects[ object.id ];

								layerTo.objects[ object.id ] = object;

								var orderBefore = layerFrom.getChildIndex( object );
								var numChildren = layerTo.getRealNumChildren();
								layerFrom.removeChild( object );

								layerTo.addMainChildAt( object, numChildren - ui.item.index() );
								var orderAfter = layerTo.getChildIndex( object );


								var historyElem = {

									action : "changeOrder",
									info   : {

										object       : object,
										parentBefore : layerFrom,
										parentAfter  : layerTo,
										orderBefore  : orderBefore,
										orderAfter   : orderAfter

									}

								};

								addToHistory( historyElem );

							}

						}

						Editor.updateLayers();
						Editor.stage.saveSort();

					},

					change : function( event, ui){
					}
				});

	};
    
    
    /**
	* Inicjalizacja edytora, z odpowiednimi wartościami
	*
	* @method init
    * @param {String} canvasName nazwa canwasa, na którym będzie inicjowany edytor
    * @param {Int} product_id Id produktu, który będzie edytowany
    * @param {String} user_type 'admin|user' inicjalizacja w konkretnym kontekście użytkowania
    * @param {Int} view_id Id widoku, który ma zosać załadowany jakopierwszy, jeżeli view_id == null, nie zostaje załadowany żaden widok
    * @param {Int} theme_id Id mowywu, który ma zostać załadowany jako pierwszy, jeżeli theme_id == null, nie zostaje załadowany żaden motyw
	*/
	function init( canvasName, product_id, user_type, view_id, theme_id ){


        document.getElementById( canvasName ).addEventListener("dragexit", function(){

            var pages = Editor.stage.getPages();

            for( var i=0; i<pages.length; i++){

                pages[i].removeHitArea();

            }


        }, false);

        document.getElementById( canvasName ).addEventListener('dragover', function(e){

            //e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            var arr = [];

            var event = new createjs.Event('dragover');
            event.clientX = e.clientX;
            event.clientY = e.clientY;
            Editor.getStage().dispatchEvent(event);


        }, false);

        document.getElementById( canvasName ).addEventListener('drop', function(e){
            e.preventDefault();

            var obj = [];
            Editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-50, obj );

            var tryProposed = false;

            for( var i=0; i < obj.length; i++){

                if( obj[i] instanceof Editor.ProposedPosition || obj[i] instanceof Editor.EditableArea )
                    tryProposed = true;

            }


            if( !tryProposed ){

                Editor.handleFileSelect(e, 1);

            }else {
                var event = new createjs.Event('drop');
                event.clientX = e.clientX;
                event.clientY = e.clientY;
                event.dataTransfer = e.dataTransfer;

                Editor.getStage().dispatchEvent(event);
            }

        }, false);
        
        if( userType == 'user' ){
            
            Editor.template.fotoLoader();
            
        }
        
        Editor.webSocketControllers.init( io );
        //var loading = Editor.adminProject.load( 43 );
        //Editor.template.generateEditor( Editor.adminProject.getAllInfo(), 'ama' );
        /*
        loading.then( function(){ 
            Editor.templateAdministaration.updateTemplate();
            
            
            var stegeBounds = Editor.stage.getMainLayer().getTransformedBounds();
            console.log(stegeBounds);
            console.log( Editor.stage.cameraCoords( stegeBounds.width, stegeBounds.height, stegeBounds.x, stegeBounds.y ) );
            
        }, function(){
        
            alert('error');
        
        });
        */
        
		Editor.fonts.loadFonts();

		canvas = $("#"+canvasName);
		stage_ = new createjs.Stage( canvasName );
		//stage_.canvas.getContext("2d").imageSmoothingEnabled = false;

		var mainLayer = new EditorLayer('mainLayer');
        var netHelper = new EditorLayer('netHelper');
        var IRulersLayer = new EditorLayer('rulers');
        
		MAIN_LAYER = mainLayer.id;
		$("span.list").attr('data-id', MAIN_LAYER);
        
        Editor.stage.setNetHelper( netHelper );
		Editor.stage.setMainLayer( mainLayer );
        Editor.stage.setIRulersLayer( IRulersLayer );
        Editor.stage.initRulers();
        Editor.stage.setToolsLayer( new EditorLayer('tools') );
        
        Editor.stage.getToolsLayer().addChild( test );
        
        
		Editor.stage.addObject( stage_ );
		initEvents();
        

        var copyBox = document.createElement("textarea");
        copyBox.id = "copyBox";
        document.body.appendChild( copyBox );
        
		canvas.removeAttr("moz-opaque");
        /*
		document.addEventListener('mousemove', function( e ){
			$(".mouseHelper").css({ top: e.clientY+20, left: e.clientX+20 });
		});
        */

		Editor.settings.width = $("#"+canvasName).attr('width');
		Editor.settings.height = $("#"+canvasName).attr('height');

		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
		{
			Editor.settings.browser = 'firefox';
		}

		$('body').on( 'mousedown', function(e){
			++mouseDown[e.button];
		});

		$('body').on( 'mouseup', function(e){
			--mouseDown[e.button];
		});


		document.getElementById( canvasName ).addEventListener( 'DOMMouseScroll', function(e){
            
            var mainLayerSize = Editor.stage.getMainLayer().getTransformedBounds();
            //console.log( mainLayerSize );
            var area = Editor.stage.getVisibleAreaSize();
            
            //console.log('scroll');

            if( mainLayerSize ){

                var tooSmall = ( mainLayerSize.height*2 < area.height ) ? true : false;
				//console.log('wchodzi wyzej');


                	//console.log('wchodzi');

                    if( e.detail > 0){

                        if( !tooSmall ){
                            Editor.getStage().scaleX -= 0.1;
                            Editor.getStage().scaleY -= 0.1;scroll
                            var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY-80);


                            var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
                            var scale = Editor.getStage().scaleX;

                            end = [mousePosition[0]*( (scale)/(scale+0.1)), mousePosition[1]*( scale/(scale+0.1))];

                            var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

                            Editor.getStage().x -=  vec[0]*Editor.getStage().scaleX;
                            Editor.getStage().y -=  vec[1]*Editor.getStage().scaleX;
                        }
                    }
                    else {
                        Editor.getStage().scaleX += 0.1;
                        Editor.getStage().scaleY += 0.1;

                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY -80);


                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
                        var scale = Editor.getStage().scaleX;

                        end = [mousePosition[0]*( (scale-0.1)/scale), mousePosition[1]*( (scale-0.1)/scale)];

                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

                        Editor.getStage().x +=  vec[0]*(Editor.getStage().scaleX+0.1);
                        Editor.getStage().y +=  vec[1]*(Editor.getStage().scaleX+0.1);
                    }
                /*
                else {
                    if( e.wheelDelta < 0){

                        if( !tooSmall ){
                            Editor.getStage().scaleX -= 0.1;
                            Editor.getStage().scaleY -= 0.1;
                            var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY-55);


                            var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
                            var scale = Editor.getStage().scaleX;

                            end = [mousePosition[0]*( (scale)/(scale+0.1)), mousePosition[1]*( scale/(scale+0.1))];

                            var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

                            Editor.getStage().x -=  vec[0]*Editor.getStage().scaleX;
                            Editor.getStage().y -=  vec[1]*Editor.getStage().scaleX;
                        }

                    }
                    else {
                        Editor.getStage().scaleX += 0.1;
                        Editor.getStage().scaleY += 0.1;

                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY -55);

                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
                        var scale = Editor.getStage().scaleX;

                        end = [mousePosition[0]*( (scale-0.1)/scale), mousePosition[1]*( (scale-0.1)/scale)];

                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

                        Editor.getStage().x +=  vec[0]*(Editor.getStage().scaleX+0.1);
                        Editor.getStage().y +=  vec[1]*(Editor.getStage().scaleX+0.1);
                    }
                }
                */


                if( area.width > mainLayerSize.width ){

                    Editor.stage.centerCameraX();
                }
                if( area.height > mainLayerSize.height ){
                    Editor.stage.centerCameraY();

                }	

                 var scrollEvent = new createjs.Event("stageScroll");
                //scrollEvent.initEvent('stageScroll', true, true);

                //var scrollEvent = new Event('stageScroll');

                Editor.stage.redrawRulers();

                var stageObjects = Editor.stage.getObjects();

                for( var key in stageObjects ){

                    stageObjects[ key ].dispatchEvent("stageScroll");

                }

                var stagePages = Editor.stage.getPages();

                for( var i=0; i < stagePages.length; i++){

                    stagePages[i].dispatchEvent( scrollEvent );

                }
        

                //Editor.tools.init();
                $(".tools-box").trigger( scrollEvent );
                
            }

		});
        
        
        Editor.template.generateEditor( 'ama' );

	};
    

	function loadAdminProject( project_id ){

		var loader = $("#loadingProgress");
		var test = 0;
		var interval = setInterval(function(){ 
			test++;
			loader.html("Wczytywanie projektu ... (" +test/10+")");
		}, 100);


        var cEvent = document.createEvent("Event");
        cEvent.initEvent('editorLoaded', true, true);

        document.dispatchEvent( cEvent );

        loader.html("Zakończono!");
        $("#overlay-loader").animate({ opacity: 0.1}, 1000, function(){ $("#overlay-loader").remove(); });


	};
    

	function generateEditorProjectsLink(){
        
		var HTML = "<ul class='projects'>";

		for( var i=0; i<editorProjects.length; i++ ){
			HTML += "<li class='loadAdminProject' data-product-id='"+editorProjects[i].ID+"'  data-project-id='"+editorProjects[i].adminProjectID+"'>"+editorProjects[i].name+"<span class='projectImage'></span></li>";
		}
		HTML += "</ul>";

		return HTML;

	};


	function addToUploadQueue( id, dbId){

		uploadQueue.push( { 'id' : id, 'dbId' : dbId, 'uploading' : false } );

	};

/*
	function startUploadImages(){
		if(uploadQueue.length > 0 and uploadQueue[0].uploading == false){
			var object = Editor.stage.getObjectById( uploadQueue[0].id );
			object.uploadImg( Edior.getProjectId());
		}
	};
*/


	function loadProduct( product_id ){

		var loader = $("#loadingProgress");
		loader.html("Wczytywanie produktu ... ");
		$.ajax({
			url : "http://api.digitalprint.pro/loadProducts/"+product_id + "?companyID=688",

			success : function( data ){
				//console.log(this);
			     //console.log( data );
				var project_id = data.childs[0].adminProjectID;
				setProductId( product_id );	
				//console.log( 'ID PROJEKTU' );
				//console.log( project_id );
				$.ajax({ url: 'http://api.digitalprint.pro/ps_types/'+Editor.getProductId()+'/ps_product_options/forEditor?companyID=668',

						success: function(data) { 
							//console.log('============ tutaj =========');
							//console.log( Editor.getProductId() );
							//console.log('ok jets wszystko dobrze');
							Editor.loadAttributesOptions(data);
							//Editor.generateAttributesList();
						//Editor.generateAttributesOptions_Select();

				},
				error : function( data ){

					//console.log( data );
					console.error('wystapił błąd');

				} });

				$('.list li span').on('click', function(){
				Editor.tools.setEditingObject(($(this).attr('data-id')));
						});

				$("#simulator:checkbox").on('change', function(){
					if( $(this).is(":checked")){
						Editor.simulationMode();
					}
					else {
						Editor.adminMode();
					}
				});

				if( project_id == null ){
					alert('ten produkt nie ma jeszcze edytora, zostanie on teraz utworzony');
					$.ajax({
						url : 'http://api.digitalprint.pro/adminProjects/?companyID=668',
						//async: false,
						crossDomain: true,
						contentType: 'application/json',
						//dataType : 'jsonp',
						type: 'POST',
						data: "{ \"name\" : \"test\", \"typeID\" : "+productId+" }",
						success : function( data ){

							//alert( JSON.stringify(data));
						},
						error : function(data){
							//alert( data );
						}

					});
				}
				else {
					//alert("ładowanie projektu o id: " + project_id);	
				//	loadAdminProject( project_id );

				}


				setProjectId( project_id );
				loadAdminProject( project_id );
		
				editorProjects = [];

				for( var i=0; i < data.childs.length; i++ ){
					editorProjects.push( data.childs[i] );
				}
                /*
				$(".projectsList").html(generateEditorProjectsLink());
				$(".loadAdminProject").on('click', function(){
					if( $(this).attr('data-project-id') == "null" ){
						var productId = $(this).attr('data-product-id');
						alert('ten produkt nie ma jeszcze edytora, zostanie on teraz utworzony');
						$.ajax({
							url : 'http://api.digitalprint.pro/adminProjects',
							//async: false,
							crossDomain: true,
							contentType: 'application/json',
							//dataType : 'jsonp',
							type: 'POST',
							data: "{ \"name\" : \"test\", \"typeID\" : "+productId+" }",
							success : function( data ){

								//alert( JSON.stringify(data));
							},
							error : function(data){
								//alert( data );
							}

						});
					}
					else {
						//alert("ładowanie projektu o id: " + $(this).attr('data-project-id'));	
						loadAdminProject( $(this).attr('data-project-id') );

					}
					//console.log(Editor.scene.objects);
				});
                */

			}
		});

	};


	function setProjectId( id ){

		projectId = id;

	};


	function getProjectId(){

		return projectId;

	};


	var ObjectsManager = (function(){

		objects = [];
		var _getObjectByName = function( name ){
			
		};
		return {
			getObjectByName : _getObjectByName
		}

	})();
	

	var ToolsManager = (function(){

		var tools = [];
		var _init = function( type ){

		};

		return {
			tools: tools,
			initTool : _init
		}

	})();


	function getStage(){

		return stage_;

	};


	function getCanvas(){

		return canvas;

	};


	function createBitmap( name, url, height, width, x, y, rotation, sX, sY, order, rX, rY ){

		var bitmap = new createjs.Bitmap( url );

		var obj = new EditorBitmap( name, bitmap );

		obj.height = height;
		obj.width = width;
		obj.trueWidth = bitmap.image.width;
		obj.trueHeight = Math.floor(bitmap.image.height);
		obj.body.x = x;
		obj.body.y = y;
		obj.body.scaleX = sX;
		obj.body.scaleY = sY;
		obj.body.regX = rX;
		obj.body.regY = rY;

		return obj;

	};


	function handleDropedFile( e, callback ){

		var file = e.target.files|| e.dataTransfer.files;
		file = file[0];
		//console.log( file );
		//console.log('jaki plik został dropnięty');

		var url = URL.createObjectURL( file );

		//console.log( url );

		var loadedImage = new createjs.Bitmap( url );

		//console.log( createjs.Bitmap );

		loadedImage.image.onload = function(){

			//console.log( loadedImage );
			loadedImage.origin = loadedImage.getBounds();


			var miniature64 = Thumbinator.generateThumb( loadedImage );	

			//console.log( miniature64 );
			//console.log( loadedImage );
            var projectImage = new Editor.ProjectImage();
            projectImage.init( file, miniature64, loadedImage.origin.width,  loadedImage.origin.height, loadedImage.origin.width, loadedImage.origin.height );
            imagesContent.appendChild( projectImage.toHTML() );
            
            Editor.adminProject.addProjectImage( projectImage, true );
            Editor.uploader.addItemToUpload( projectImage );
            Editor.uploader.upload();
            
            projectImage.addEventListener( 'uploaded', function( data ){

                var projectImage = data.target;

                Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), data.target.tmp_file.name, 'Bitmap', projectImage.imageUrl, projectImage.miniatureUrl, projectImage.miniatureUrl, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );
                //console.log('UPLODEDDDDDD');
                callback( miniature64 );
                //Editor.webSocketControllers.adminProjectImage.uploadedImage( data.target.uid, data.target.miniatureUrl , data.target.imageUrl  );
                //Editor.adminProject.addProjectImage( data.target );
            
            });

		};


	};


	function handleFileSelect(evt, place) {
        
		var files = evt.target.files || evt.dataTransfer.files; // FileList object
		var first = true;
        
        var i=0;
        
        var images = files.length;
                
        var ima = 0;
        
        var imagesContent = document.getElementById('imagesList');
        
        var imagesArray = [];
        
        function addImages(){
            
            for( var i=0; i < images; i++ ){
                
                imagesContent.appendChild( imagesArray[i].toHTML() );
                
            }
        
        };

		var actualFile = 0;
        
		var upload_image = function(){
            
            var url = URL.createObjectURL( files[actualFile] );
            
            var loadedImage = new createjs.Bitmap( url );
                    
            loadedImage.image.onload = function(){
                	
                	//console.log( loadedImage );
					loadedImage.origin = loadedImage.getBounds();
					loadedImage.scale = {
						x : loadedImage.origin.width,
						y : loadedImage.origin.height
					};
                
					var obrazek = Thumbinator.generateThumb( loadedImage );
					var bitmap = new createjs.Bitmap( obrazek );
					bitmap.image.onload = function(){
						origin = bitmap.getBounds();
						bitmap.x = 900/2;
						bitmap.y = 400/2;
						var aspect = origin.width/origin.height;
						bitmap.scaleX = Editor.settings.thumbSize * aspect * 1/origin.width;
						bitmap.scaleY = Editor.settings.thumbSize * 1/origin.height;
						bitmap.regX = this.width/2;
						bitmap.regY = this.height/2;
						bitmap.name = files[actualFile].name;

						//thumbinator.update();

						//var obj = new Editor.Bitmap( files[actualFile].name, obrazek, true );

                        
						bitmap.trueWidth = obrazek.width = obrazek.width;
						bitmap.trueHeight = obrazek.height = obrazek.height;

                        bitmap.regX = bitmap.trueWidth/2;
                        bitmap.regY = bitmap.trueHeight/2;
                        
						// obj = new Editor.CropingBitmap("testowaczka", null, obj.width, obj.height, obj );

						if( place ==1 ){
                            
                            //obj.tmp_image = files[actualFile];
                            bitmap.tmp_image = files[actualFile];
                            
                            Editor.adminProject.view.addObject( bitmap );
                            
                            Editor.uploader.addItemToUpload( bitmap );
                            Editor.uploader.upload();

						}

						else if(place == 2) {
                            
                            var projectImage = new Editor.ProjectImage();
                            projectImage.thumbnail = obrazek;
                            projectImage.minUrl = obrazek;
                            projectImage.waitingForUpload = true;
                            projectImage.init( files[actualFile], obrazek, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height );

                            Editor.adminProject.addProjectImage( projectImage );
                            imagesContent.appendChild( projectImage.html );
                            imagesArray.push( projectImage );
                            	
                            //Editor.adminProject.addProjectImage( projectImage, true );
                            Editor.uploader.addItemToUpload( projectImage );
                            Editor.uploader.upload();
                           	
                            Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), files[actualFile].name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                            projectImage.addEventListener( 'uploaded', function( data ){

                                var projectImage = data.target;
                                //console.log(data);
                                //console.log('tutaj sprawdz');
                                //console.log(Editor.adminProject.getProjectId());
                                //console.log( projectImage );

                                var dataToUpload = {

                                	projectImageUID : projectImage.uid,
                                	minUrl : projectImage.miniature,
                                	thumbnail : projectImage.miniature,
                                	imageUrl : projectImage.imageUrl

                                };

                                Editor.webSocketControllers.projectImage.update( dataToUpload );

                                //Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), data.target.tmp_file.name, 'Bitmap', projectImage.imageUrl, projectImage.miniatureUrl, projectImage.miniatureUrl, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );
                                //Editor.webSocketControllers.adminProjectImage.uploadedImage( data.target.uid, data.target.miniatureUrl , data.target.imageUrl  );
                                //Editor.adminProject.addProjectImage( data.target );
                            
                            });
                                                        
						}
						
						if( actualFile < images-1 ){

							actualFile++;
                            URL.revokeObjectURL( url );
							upload_image();
                            ima++;
                            
						}

						else {
                            
							delete fileReader;
                            
						}
					};

				};
            
            /*
			fileReader.readAsDataURL(files[actualFile]);
			fileReader.onload = function( freader){
				var img = new Image();
				img.src = freader.target.result;
				
				if( img.width > thumbSize || img.height > thumbSize){
					scale = img.width/thumbSize;
					var height = img.height/scale;
					thumbGenerator.attr('width','300px');
					thumbGenerator.attr('height', height );
				}

				//var loadedImage = new GraphicsBody('image', [0,0], 300, 300, img.src);
				var loadedImage = new createjs.Bitmap( img.src );

				loadedImage.image.onload = function(){
					loadedImage.origin = loadedImage.getBounds();
					loadedImage.scale = {
						x : loadedImage.origin.width,
						y : loadedImage.origin.height
					};
					var obrazek = Thumbinator.generateThumb( loadedImage );
					var bitmap = new createjs.Bitmap( obrazek );
					bitmap.image.onload = function(){
						origin = bitmap.getBounds();
						bitmap.x = 900/2;
						bitmap.y = 400/2;
						var aspect = origin.width/origin.height;
						bitmap.scaleX = Editor.settings.thumbSize * aspect * 1/origin.width;
						bitmap.scaleY = Editor.settings.thumbSize * 1/origin.height;
						bitmap.regX = this.width/2;
						bitmap.regY = this.height/2;
						bitmap.name = files[actualFile].name;

						thumbinator.update();

						var obj = new Editor.Bitmap( files[actualFile].name, obrazek, true );

                        var bitmapObj = obj;
                        
                        console.log("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-");
                        console.log( obj.image.width );
                        console.log( obj.image.width );
                        
						bitmapObj.trueWidth = obj.trueWidth = obj.width = obj.image.width;
						bitmapObj.trueHeight = obj.trueHeight = obj.height = obj.image.height;

                        bitmapObj.regX = bitmapObj.trueWidth/2;
                        bitmapObj.regY = bitmapObj.trueHeight/2;
                        
						// obj = new Editor.CropingBitmap("testowaczka", null, obj.width, obj.height, obj );

						if( place ==1 ){
                            
                            obj.tmp_image = files[actualFile];
                            bitmapObj.tmp_image = files[actualFile];
                            
                            Editor.adminProject.view.addObject( bitmapObj );
                            
                            Editor.uploader.addItemToUpload( bitmapObj );
                            Editor.uploader.upload();

						}

						else if(place == 2) {
                            
                            var projectImage = new Editor.ProjectImage();
                            projectImage.init( files[actualFile], obrazek, origin.width, origin.height );
                            Editor.adminProject.addProjectImage( projectImage, true );
                            Editor.uploader.addItemToUpload( projectImage );
                            Editor.uploader.upload();
                                                        
						}
						
						if( actualFile < images-1 ){
							actualFile++;
							delete fileReader;
							upload_image();
						}

						else {
							delete fileReader;
						}
					};

				};
			};
            */
		}
		upload_image();

	};


	function addEditGroup( group ){

		groups[group.name] = group;

	};


	function uploadSingleImage( image, image_miniature, objectId ){

		var fileData = new FormData();
		fileData.append("userFile", image );
		fileData.append("image_min", image_miniature);
		fileData.append("projectID", projectId);
		fileData.append("objectID", objectId);

		var request = new XMLHttpRequest();
		request.open("POST", 'http://api.digitalprint.pro/upload', true);
		request.send( fileData );

		request.addEventListener("progress", function(e){

			$("#progress").html( e.loaded / e.total );
		},
		false);
		
		request.onreadystatechange = function( aEvt ){
			if( request.readyState == 4 ){
				var resp = JSON.parse( request.responseText );
			}
		};

	};


	function getEditGroups(){

		return groups;

	};


	function generateGroups(){

		var list = "";
		for( var group in groups ){
			list += "<li><span class='li-button' data-id='" + groups[group].body.id  + "'>";
			list += group;
			list += "</span>";
			for( var l=0; l < groups[group].layers.length; l++ ){
				var list_2 = "<ul>";
				
				if( groups[group].layers[l].layers ){
					list_2 += "<li class='editableArea'><span class='li-button' data-id='"+groups[group].layers[l].body.id+"'>" + groups[group].layers[l].name  + "</span>";
					var list_3 = "<ul>";
					for( var k=0; k < groups[group].layers[l].layers.length; k++){
						list_3 += "<li><span class='li-button' data-id='"+groups[group].layers[l].layers[k].body.id+"'>" +  groups[group].layers[l].layers[k].name + "</span></li>";
					}
					list_3 += "</ul></li>";
					list_2 += list_3;
				}
				else {
					list_2 += "<li><span class='li-button' data-id='"+groups[group].layers[l].body.id+"'>" + groups[group].layers[l].name  + "</span></li>";
				}
				list_2 += "</ul>";
				list += list_2;
			}
			list += "</li>";
		}

		return list;

	};


	function setSelectedEditGroup( groupID ){

		selectedEditGroup = groupID;

	};


	function getSelectedEditGroup(){

		return selectedEditGroup;

	};


	function getLayers(){

		return layers;

	};


	function saveProject(){

		var scene = {};
		
		for( var group in groups ){
			scene[ groups[group].name ] = {
				'transformations' : { 
					'x' : groups[group].body.x,
					'y' : groups[group].body.y,
					'scX' : groups[group].body.scaleX,
					'scY' : groups[group].body.scaleY,
					'r' : groups[group].body.rotation,
					'skX' : groups[group].body.skewX,
					'skY' : groups[group].body.skewY,
					'rX' : groups[group].body.regX,
					'rY' : groups[group].body.regY
				},
				'layers' : (function(){
					var l = [];
					for( var i = 0; i < groups[group].layers.length; i++ ){ 
					
						var current = groups[group].layers[i];

						var obj = { 
							'type'   : current.constructor.name,
							'w'      : current.width,
							'h'      : current.height,
							'tw'     : current.trueWidth,
							'th'     : current.trueHeight,
							'name'   : current.name,
							'src'    : (( current.body.image ) ? current.body.image.src : null),
							'transformations' : {
								'x' : current.body.x,
								'y' : current.body.y,
								'scX' : current.body.scaleX,
								'scY' : current.body.scaleY,
								'r' : current.body.rotation,
								'skX' : current.body.skewX,
								'skY' : current.body.skewY,
								'rX' : current.body.regX,
								'rY' : current.body.regY
							},
							'layers' : ( function( current ){
								// drugi opiziom warstw
								if( current.layers ){
									var l_2 = [];
									for( var k = 0; k < current.layers.length; k++ ){

										var current2 = current.layers[k];
										var obj = {
											'type'   : current2.constructor.name,
											'w'      : current2.width,
											'h'      : current2.height,
											'tw'     : current2.trueWidth,
											'th'     : current2.trueHeight,
											'name'   : current2.name,
											'src'    : (( current2.body.image ) ? current2.body.image.src : null),
											'transformations' : {
												'x' : current2.body.x,
												'y' : current2.body.y,
												'scX' : current2.body.scaleX,
												'scY' : current2.body.scaleY,
												'r' : current2.body.rotation,
												'skX' : current2.body.skewX,
												'skY' : current2.body.skewY,
												'rX' : current2.body.regX,
												'rY' : current2.body.regY
											},
										};
										l_2.push( obj );
									}
									return l_2;
								}
								else {
									return null;
								}

							})( current )
						};
						l.push( obj );
					}

					return l;
				})(),
			};

		}


		var sceneJSON = JSON.stringify( scene );
			
		return sceneJSON;

	};


	function loadHierarchy(){
		
	};


	function loadProject2( json ){

		var data = JSON.parse( json );
		for( var editGroup in data ){
			var obj = new EditGroup( editGroup + "_2" );
			Editor.addEditGroup( obj );
			var t = data[editGroup]['transformations'];
			obj.body.setTransform( t.x, t.y, t.scX, t.scY, t.r, t.skX, t.skY, t.rX, t.rY );

			for( var i=0; i < data[editGroup].layers.length; i++ ){
				var current = data[editGroup].layers[i];


				if( current.type == 'EditorBitmap' ){
					var bitmap = new createjs.Bitmap( current.src);
					var t = current.transformations;
					var eBitmap = new EditorBitmap( current.name, bitmap );
					eBitmap.width = current.w;
					eBitmap.height = current.h;
					eBitmap.trueWidth = current.tw;
					eBitmap.trueHeight = current.th;
					bitmap.setTransform( t.x, t.y, t.scX, t.scY, t.r, t.skX, t.skY, t.rX, t.rY  );
					obj.addLayer( eBitmap );
				}
				if( current.type == "EditableArea" ){
					editableArea = new EditableArea( current.name, 1000, 500 );
					editableArea.init();
					var t = current.transformations;
					editableArea.body.setTransform( t.x, t.y, t.scX, t.scY, t.r, t.skX, t.skY, t.rX, t.rY  );
					obj.setEditableArea( editableArea );

					for( var k = 0; k < current.layers.length; k++ ){

						if( current.layers[k].type == "EditorBitmap" ){  
							var bitmap = new createjs.Bitmap( current.layers[k].src);
							var eBitmap = new EditorBitmap( current.layers[k].name, bitmap );

							eBitmap.width = current.layers[k].w;
							eBitmap.height = current.layers[k].h;
							eBitmap.trueWidth = current.layers[k].tw;
							eBitmap.trueHeight = current.layers[k].th;

							var t = current.layers[k].transformations;
							bitmap.setTransform( t.x, t.y, t.scX, t.scY, t.r, t.skX, t.skY, t.rX, t.rY );

							
							editableArea.addObject( eBitmap );	
						}
					}
				}
			}

			Editor.getStage().addChild( obj.body );
		}

		$("#editGroup-list .list").html( Editor.generateGroups());
		$('.list li span').on('click', function(){
			Editor.tools.setEditingObject(($(this).attr('data-id')));	
		});

	};


	function loadAttributesOptions( _attributes ){

		attributes = _attributes;
		//console.log( _attributes );

	};


	function getAttributeOption( option_id ){

		return attributes[ option_id ];

	};


	function getAttributesOptions( ){

		return attributes;

	};


	function simulationMode(){

		mode = 'simulation';
		var stage = Editor.stage;

		var al = stage.getAttributeLayers();

		for( key in al ){

			if( al[key].checkActivity( selectedAttributes )){

				al[key].visibleForUser( true );
			}
			else {
				al[key].visibleForUser( false );
			}
		}

		Editor.updateLayers();

	};


	function adminMode(){

		mode = 'admin';
		var al = Editor.stage.getAttributeLayers();
		
		for( key in al ){
				al[key].visibleForUser( true );
		}
		Editor.updateLayers();

	};


	function updateLayers(){

		$("ul.sortArea").remove();
		var html = $("#editGroup-list span.list").html();
		$("#editGroup-list div.list").append( html + Editor.stage.generateLayersHTML( Editor.stage.decomposeMainLayer() ));
		Editor.updateLayersFunctions();
		Editor.stage.saveSort();

	};


	function setProductId( id ){

		productId = id;	

	};


	function getProductId(){

		return productId;

	};

    
    function getMagnetizeTolerance(){
        
        return magnetizeTolerance;
    
    };
    
    
	return {

		init : init,
		loadProduct : loadProduct,
		getLayers : getLayers,
		toolsManager : ToolsManager,
		objectsManager : ObjectsManager,
		handleFileSelect : handleFileSelect,
		getStage : getStage,
		getCanvas : getCanvas,
		setVectorStart : setVectorStart,
		setVectorStop : setVectorStop,
		getMoveVector : getMoveVector,
		getCurrentEditableArea : getCurrentEditableArea,
		setCurrentEditableArea : setCurrentEditableArea,
		getMouseButtonState : getMouseButtonState,
		generateAttributesList : generateAttributesList,
		addEditGroup : addEditGroup,
		handleDropedFile : handleDropedFile,
		getEditGroups : getEditGroups,
		generateGroups : generateGroups,
		setSelectedEditGroup : setSelectedEditGroup,
		getSelectedEditGroup : getSelectedEditGroup,
		saveProject : saveProject,
		loadAttributesOptions : loadAttributesOptions,
		getAttributeOption : getAttributeOption,
		getAttributesOptions : getAttributesOptions,
		updateLayersFunctions : updateLayersFunctions,
		generateAttributesOptions_Select : generateAttributesOptions_Select,
		simulationMode : simulationMode,
		adminMode : adminMode,
		updateLayers : updateLayers,
		loadProduct : loadProduct,
		getInfo : getInfo,
		getProjectId : getProjectId,
		getProductId : getProductId,
		uploadSingleImage : uploadSingleImage,
		addToUploadQueue : addToUploadQueue,
		unclickEvent : unclickEvent,
		initEvents : initEvents,
		ticker : ticker,
		addToHistory : addToHistory,
		restoreFromHistory  : restoreFromHistory,
		nextStepFromHistory : nextStepFromHistory,
		updateHistoryTools : updateHistoryTools,
		getHistory : getHistory,
        currentUrl : currentUrl,
        generateUUID : generateUUID,
        getMagnetizeTolerance : getMagnetizeTolerance,
        getSelectedAttributes :getSelectedAttributes
        

	}

})();

Editor.settings = {
	width : 1000,
	height : 700,
	thumbSize : 200
};


// początek gry
/*
var tab = ['artur', 'marcin', 'jarek', 'piotrek', 'rafal'];

var wynik = tab[ Math.floor((Math.random() * tab.length) ) ];

alert("ZWYCIĘZCĄ JEST: " + wynik);

*/