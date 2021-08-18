import {Config} from "./config.js";
import {Text2} from "./class/Text2.js";
import {Keyboard} from './class/tools/keyboard';

var _ = require('lodash');
var authController = require('./class/AuthController').AuthController;
var mouseController = require( './Mouse' ).Mouse;
var Fonts = (( EDITOR_ENV.user )? require('./fonts_user').fonts : require('./fonts_admin').fonts );
var editComponent = require('./EditComponent').EditComponent;
var toolsManager = require('./toolsManager/ToolsManager').tools;

if( EDITOR_ENV.admin ){
	var proposedTemplateTool = require('./class/tools/ProposedTemplates').proposedTemplate;
	var themeTools = require('./class/tools/themeTools').themeTools;
	var complexAdminProject = require('./adminProject/admin/complexAdminProject').complex;
}

if( EDITOR_ENV.user ){
	var Stage = require('./stage_user').Stage;
}else {
	var Stage = require('./stage_admin').Stage;
}

var config = new Config( EDITOR_ENV.domain, EDITOR_ENV.port, EDITOR_ENV.companyID, EDITOR_ENV.frameworkUrl );
var EditTools = require('./EditTools').EditTools;


if( EDITOR_ENV.user ){
	var tools = require('./tools_user').tools;
}else {
	var tools = require('./tools_admin').tools;
}

if( EDITOR_ENV.user ){
	var TemplateModule = require('./template/admin/main_user').TemplateModule;
}else {
	var TemplateModule = require('./template/admin/main_admin').TemplateModule;
}

var services = require('./services/user_services').services;
var WebSocketControllers = (( EDITOR_ENV.user )? require('./webSocketControllers/main_user').WebSocketControllers : require('./webSocketControllers/main_admin').WebSocketControllers );
var adminProject = require('./adminProject/admin/main_admin.js').adminProject;
var EditorLayer = require('./class/EditorLayer').EditorLayer;
var UserProject = require('./userProject/userProject').UserProject;
var TemplateAdministration = require('./templateAdministration/admin/main').TemplateAdministration;
var Thumbinator = require('./Thumbinator').Thumbinator;
var ThumbsMaker = require('./ThumbsMaker').ThumbsMaker;
var Uploader = require('./uploader').Uploader;
var User = require('./user/User').User;

import {DigitMaker} from './DigitMaker';
import {RulerMaker} from './RulersMaker';
import { EditableArea } from './class/editablePlane';
import { ProposedPosition2 } from './class/ProposedPosition2';
import {TileMaker} from './TilesMaker';

export const RANGE = {singleElem: 'singleElem', allElemInPage: 'allElemInPage', allElemInProject: 'allElemInProject'}

class Editor {

	// konstruktor musi przyjmować wszystkie wymagane ustawienia, tak zeby nie bylo potrzebne uruchamianie aplikacji z dodatkowym kodem
	constructor (){

		this.settings = {

			magnetize : false,
			width : 1000,
			height : 700,
			thumbSize : 200

		};

		this.unclickEvent = new createjs.Event( 'unclick', false, true );

	    this.currentUrl = '';
	    this.editorContext = true;
	    this.useMagneticLines = false;
		this.ticker = createjs.Ticker;
		this.stage_;
		this.canvas;
		this.fonts = {};
		this.currentEditableArea = null;
		this.objectClipBoard = null;
		this.selectedEditGroup  = null;
		this.product_DPI = 100;
		this.objects = [];
		this.mode = 'admin'; // trzeba ustalic w konstruktorze typ edytora
		this.groups = {};
		this.layers = {};

		// aktualnie wybrane atrybuty opisujace edytowany obiekt
		this.selectedAttributes = {};

	    this.magnetizeTolerance = 10;
		this.editorProjects;
		this.projectId;
		this.productId;
		this.uploadQueue = [];

		this.history = {

			prev 		   : [],
			next 		   : [],
			elements	   : 0,
			working 	   : 0,
			queue   	   : [],
			hangingObjects : {}

		};

		this._historyLimit = 10;
		this.attributes = {};
		this.mouseDown = [ 0, 0, 0 ];
		this.moveVector = {
			start :{
				x:0,
				y:0
			},
			stop: {
				x:0,
				y:0
			}
		};

		this.objectsManager = (function(){

			var objects = [];
			var _getObjectByName = function( name ){

			};
			return {
				getObjectByName : _getObjectByName
			}

		})();


		this.toolsManager = (function(){

			var tools = [];
			var _init = function( type ){

			};

			return {
				tools: tools,
				initTool : _init
			}

		})();



        	this.TileMaker = new TileMaker(this);
        	this.RulerMaker = new RulerMaker( this );
        	this.DigitMaker = new DigitMaker( this );


		this.adminProject = new adminProject( this );

		if( EDITOR_ENV.admin ){
			this.complexAdminProject = complexAdminProject;
		}

		this.AuthController = new authController( this );
		this.config = config;
		this.MouseController = mouseController;
		this.EditComponent = editComponent;
		this.fonts = new Fonts( this );
		this.services = new services( this );
		this.stage = new Stage( this );
		this.template = new TemplateModule( this );
		this.templateAdministration = new TemplateAdministration( this );
		this.toolsManager = toolsManager;
		this.tools = new tools( this );
		this.uploader = new Uploader( this );
		this.user = new User();
		this.userProject = new UserProject( this );
		this.webSocketControllers = new WebSocketControllers( this );
		this.ThumbsMaker = ThumbsMaker;
		this.Thumbinator = Thumbinator;
        this.Thumbinator.init( this, 300 );
        this.ThumbsMaker.init( this, 500 );

		if( EDITOR_ENV.admin ){
			this.tools.proposedTemplate = new proposedTemplateTool( this );
			this.tools.theme = new themeTools( this );
		}

		this.importantParents = [

			createjs.Stage,
			EditableArea

		];

		this.lastCalculation=null;
	}


	tryMagnetize(){

		return this.useMagneticLines;

	}


	setMagnetize( status ){

		this.useMagneticLines = status;

	}


	getHistory(){

		return this.history;

	}


	getSelectedAttributes(){

		return this.selectedAttributes;

	}


	hangObject( object ){

		// dodaje element do tablicy elementów zawieszonych
		this.history.hangingObjects[ object.id ] = object;

	}

	fullScreenOff(){

		if (document.exitFullscreen) {
		    document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
		    document.webkitCancelFullScreen();
		}
		else if (document.msExitFullscreen) {
		    document.msExitFullscreen();
		}

	}

	fullScreen(){

		var _this = this;
		_this.fullScreenMode = false;
		return new Promise( (resolve, reject ) =>{

			var body = document.createElement('div');
			var yes = document.createElement('div');
			yes.className = 'yes button center';
			yes.innerHTML = 'Uruchom tryb pełnoekranowy'
			yes.addEventListener('click', function( e ){

				var element = document.documentElement;
				if (element.requestFullscreen) {
					element.requestFullscreen();
				} else if (element.webkitRequestFullscreen) {
					element.webkitRequestFullscreen();
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.msRequestFullscreen) {
					element.msRequestFullscreen();
				}
				_this.fullScreenMode = true;
				$('#fullScreen-request').remove();
				resolve();

			});

			body.innerHTML = '<h3>Praca w trybie pełnoekranowym ułatwi edycję, czy chesz go uruchomic?</h3>'

			body.appendChild( yes );

			var smallWindow = _this.template.displayWindow(

				'fullScreen-request',
				{

					size : 'small',
					title : 'Praca w trybie pełnoekranowy',
					content : body

				}

			);

			$('body').append( smallWindow );


			$('#fullScreen-request').on( 'hidden.bs.modal', function(){

				$(this).remove();
				reject();

			});

			$('#fullScreen-request').modal({

				keyboard: false,
				backdrop: 'static'

			});




		});

	}

	restoreObject( object_id ){

		//dodaj obiekt do sceny a nastepnie go usun z tablicy elementow zawieszonych
		delete this.history.hangingObjects[ object_id ];

	}


	deleteHangedObject( object_id ){

		//usuniecie obiektu z bazy danych i usuniecie z elementow zawieszonych
		var object = this.history.hangingObjects[ object_id ];
		object.DB_remove();

		delete this.history.hangingObjects[ object_id ];

	}


	updateHistoryTools(){

		if( this.history.next.length )
			$("#history-next").removeClass("un-active");
		else
			$("#history-next").addClass("un-active");


		if( this.history.prev.length )
			$("#history-back").removeClass("un-active");
		else
			$("#history-back").addClass("un-active");

	}


    generateUUID() {

        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });

        return uuid;

    }


	 checkHistoryQueue(){

		$("#user-simulator").html( this.generateHistoryHTML() );

		var history = history;

		if( history.queue.length != 0 ){

			var current = history.queue.shift();

			if( current == 'back' ){

				if( history.prev.length > 0 ){

					history.working = 0;
					this.restoreFromHistory( 0 );

				}
				else {

					history.queue = [];
					history.working = 0;
					this.updateHistoryTools();

				}

			}
			else if( current == 'next' ){

				if( history.next.length > 0 ){

					history.working = 0;
					this.nextStepFromHistory( 0 );

				}
				else {

					history.queue = [];
					history.working = 0;
					this.updateHistoryTools();

				}
			}

		}
		else {

			history.queue = [];
			history.working = 0;

		}

	}


	generateHistoryHTML(){

		var html = "<ul class='history'>";
		var history = this.history;

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

	}


	restoreFromHistory( backSteps ){

		var Editor = this;
		var history = this.history;

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

	}


	nextStepFromHistory(){

		var history = this.history;
		var Editor = this;

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

	}


	// Nowy moduł Editor.history ?
	addToHistory( elem ){

		var history = this.history;
		var Editor = this;

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

	}


	addBitmap(){

		var historyInfo = {

			action : 'add',
			objects : {
				"TU OBEIKT ID" : "tutaj info"
			}

		};

	}

	// trzeba wyspecyfikowac dlaadministratora
	editorEvents( e ){

		var Editor = this;

		if(e.keyCode === 8){
			e.returnValue = false;
		}

		if( e.keyCode === 67 && Keyboard.isCtrl(e) ){

			var editing_id = Editor.tools.getEditObject();
			var editingObject = Editor.stage.getObjectById( editing_id );

			objectClipBoard = editingObject;

		}

		if( e.keyCode == 86 && Keyboard.isCtrl(e) ){

			if( !objectClipBoard )
				return;

			var clonedObject = objectClipBoard._cloneObject();
			clonedObject.x += 40;
			clonedObject.y += 40;

			if( clonedObject.mask ){

		        clonedObject.mask.x += 40;
		        clonedObject.mask.y += 40;
				clonedObject.mask.rotation = clonedObject.rotation;

		    }
			//objectClipBoard.parent.addChild( clonedObject );

			var addTo = 'View';
			var importantParent = objectClipBoard.getFirstImportantParent();

			if( importantParent instanceof Editor.EditableArea ){

				addTo = 'View';

			}

			if( objectClipBoard instanceof Editor.Bitmap ){

				Editor.webSocketControllers.editorBitmap.clone( objectClipBoard.dbID, Editor.adminProject.format.view.getId(), addTo );

			}
			else if( objectClipBoard instanceof Editor.ProposedPosition2 ){

				Editor.stage.addObject( clonedObject );
				objectClipBoard.parent.addChild( clonedObject );
				objectClipBoard.parent.parent.proposedImagePositions.push( clonedObject );
				clonedObject.prepareMagneticLines( getMagnetizeTolerance() );

			}
			else if( objectClipBoard instanceof Editor.Text2 ){

				Editor.stage.addObject( clonedObject );
				objectClipBoard.parent.addChild( clonedObject );
				clonedObject.prepareMagneticLines( getMagnetizeTolerance() );

			}

			Editor.templateAdministaration.updateLayers( Editor.adminProject.format.view.getLayer().children );

		}

		var editing_id = Editor.tools.getEditObject();
		var editingObject = Editor.stage.getObjectById( editing_id );

		if( editingObject && !editingObject.blocked  ){

			if( editingObject instanceof Editor.Text2 && editingObject.editMode )
				return;

			if( e.keyCode == '37' ){

				editingObject.x--;

				if( editingObject.mask )
					editingObject.mask.x--;

				Editor.stage.updateEditingTools( editingObject );

			}else if( e.keyCode == '39' ){

				editingObject.x++;

				if( editingObject.mask )
					editingObject.mask.x++;

				Editor.stage.updateEditingTools( editingObject );

			}else if( e.keyCode == '38' ){

				editingObject.y--;

				if( editingObject.mask )
					editingObject.mask.y--;

				Editor.stage.updateEditingTools( editingObject );

			}
			else if( e.keyCode == '40' ){

				editingObject.y++;

				if( editingObject.mask )
					editingObject.mask.y++;

				Editor.stage.updateEditingTools( editingObject );

			}

			editingObject.dispatchEvent('move');
			Editor.tools.init();

		}

	}


	rgb2hex( _rgb ){

	 	var rgb = _rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	 	return (rgb ) ? "#" +
		("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';

	}


	getInfo(){

		return [ this.stage_, this.layers];

	}


	getMouseButtonState(){

		return this.mouseDown;

	}


	getCurrentEditableArea(){

		return this.currentEditableArea;

	}


	setCurrentEditableArea( object ){

	}


	setVectorStart( x, y ){

		this.moveVector.start = {
			x : x,
			y : y
		}

	}


	setVectorStop( x, y ){

		this.moveVector.stop = {
			x : x,
			y : y
		}

	}


	getMoveVector(){

		return {
			x: this.moveVector.start.x - this.moveVector.stop.x,
			y: this.moveVector.start.y - this.moveVector.stop.y
		}

	}


	generateAttributesList( formatID ){



	}


	getURLParameters(){

		var query_string = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");

		for (var i=0;i<vars.length;i++) {

			var pair = vars[i].split("=");

			if (typeof query_string[pair[0]] === "undefined") {

				query_string[pair[0]] = decodeURIComponent(pair[1]);

			} else if (typeof query_string[pair[0]] === "string") {

				var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
				query_string[pair[0]] = arr;

			} else {

				query_string[pair[0]].push(decodeURIComponent(pair[1]));

			}
		}

    	return query_string;

	}


	generateAttributesOptions_Select( ){
		return "brak";
		var Editor = this;
		var attributes = this.getAttributesOptions();

		var selectedFormat = Editor.adminProject.format.getId();
		var excludedOptions = [];
		var html = "Dostosuj produkt:<br>\
			    <label class='labelAttribute'><span>Format:</span><select id='-1' class='attribute'>";
		for( var key in attributes ){

			html += "<option value='"+key+"' " +  ( ( selectedFormat == key ) ? "selected='selected'" : ""  ) + ">" + attributes[key].name + "</option>";

		}

		html += "</select></label>";

		$("#attributesSelector").html( html );

		var id_format =  this.getURLParameters().formatID;

		// zbiera wszystkie selecty
		var selects = [];

		var selectedAttributes = this.selectedAttributes;
		selectedAttributes['-1'] = parseInt($("#-1").val());


		var key_before = null;

		for( var key in attributes[ id_format ].attributes ){

			if( key in this.selectedAttributes ){

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

			Editor.adminProject.format.view.init( Editor.adminProject.format.view.getId() );

		});

		$('select#-1').on('change', function( ){



		});


		$("#format-attr").on('change', function(){

			var id_format = parseInt($("#format-attr").val());
			selectedAttributes = { '-1' : id_format };
			//	var frameworkUrl = 'http://dev3.digitalprint.pro';
			// getFrameworkUrl : getFrameworkUrl


			$.ajax( {

				url: config.getFrameworkUrl() + "/ps_types/"+productId+"/ps_product_options/forEditor",

				success: function( data ){

					generateAttributesOptions_Select();

				},
				error: function( data ){



				}

			});

		});

		return html;

	}


	updateLayersFunctions(){

		var Editor = this;

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

			$.ajax({ url: config.getFrameworkUrl() + '/ps_types/'+productId+'/ps_product_options/attrList', success: function(data) {

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

						url : config.getFrameworkUrl() +'/adminProjects/'+Editor.getProjectId()+'/adminProjectLayers/'+mainLayer.dbId+'/adminProjectLayerAttributes/',

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


				url: config.getFrameworkUrl() +'/adminProjects/'+Editor.getProjectId()+'/adminProjectLayers/'+dbObjectId,

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


				url: config.getFrameworkUrl() + '/adminProjects/'+Editor.getProjectId()+'/adminProjectLayers/'+dbObjectId,

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

				url : config.getFrameworkUrl() +'/adminProjectLayerAttributes/'+dbId,

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

	}


    /**
	* Inicjalizuje wszystkie drop area na scenie
	*
	* @method initDropAreas
	*/

    initDropAreas(){

    	if( !$('#themeImagesDrop').hasClass('visible') )
    		$('#themeImagesDrop').addClass('visible');

    }

    getEditableObjectsByType(range, type){
    	if(range===RANGE.singleElem){
    		return [this.stage.getObjectById(this.tools.getEditObject())]
		}else if(range===RANGE.allElemInPage){
            let all=[]
			const collect=(obj)=>{
            	obj.children.forEach(c=>{
            		if(c.type && c.type===type){
            			all.push(c)
					}else if(c.children){
            			collect(c)
					}
				})
			}
            collect(this.getStage())
    		return all;
		}else if(range===RANGE.allElemInProject){
    		const col=Object.values(this.stage.objects).filter(o=>o.type===type)
            const ids=col.map(el=>el.dbID)
            const other=Object.values(this.registeredObjects).filter(o=>o.type===type).filter(e=>ids.indexOf(e.dbID)===-1)
            return [...col,...other];
		}

	}

    destroyDropAreas(){

		$('#themeImagesDrop').removeClass('visible');

    }


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
	init( canvasName ){
		// generowanie htmla edytora
        //Editor.template.generateEditor( 'ama' );
        var Editor = this;
        // stworzenie sceny głównej edytora
		this.canvas = $("#"+canvasName);
		this.canvas.removeAttr("moz-opaque");
        this.canvas.className = 'noselect';
        Editor.initEvents( canvasName );

        // to trzeba przenieść do sceny
		this.stage_ = new createjs.Stage( canvasName );
		this.stage_.snapToPixel = false;
		createjs.Touch.enable( this.stage_);
        // to musi zostac przeniesione
		//Editor.fonts.loadFonts();

		//this.stage_.canvas.getContext("2d").imageSmoothingEnabled = false;

		Editor.settings.width = $("#"+canvasName).attr('width');
		Editor.settings.height = $("#"+canvasName).attr('height');


		if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
		{
			Editor.settings.browser = 'firefox';
		}

    	Editor.stage.initScene( this.stage_ );

    	Editor.getStage().enableMouseOver( 60 );

    	Editor.loadProduct( this.getURLParameters().typeID );

	}


	generateEditorProjectsLink(){

		var HTML = "<ul class='projects'>";

		for( var i=0; i<editorProjects.length; i++ ){
			HTML += "<li class='loadAdminProject' data-product-id='"+editorProjects[i].ID+"'  data-project-id='"+editorProjects[i].adminProjectID+"'>"+editorProjects[i].name+"<span class='projectImage'></span></li>";
		}
		HTML += "</ul>";

		return HTML;

	}


	addToUploadQueue( id, dbId){

		uploadQueue.push( { 'id' : id, 'dbId' : dbId, 'uploading' : false } );

	}


	generateAttributesOptions_Select_user(){

        var Editor = this;
        var attributes = this.getAttributesOptions();
        var selectedFormat = Editor.userProject.getFormatID();
        var excludedOptions = [];
        var html = "Dostosuj produkt:<br>";

        var selectedAttributes = Editor.userProject.getSelectedAttributes();

        if( selectedFormat ){

        }

        $("#attributesSelector").html( html );

        var id_format = selectedFormat;

        // zbiera wszystkie selecty
        var selects = [];

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
            Editor.generateAttributesOptions_Select_user();

            Editor.userProject.redrawView();
            //Editor.adminProject.format.view.init( Editor.adminProject.format.view.getId() );

        });

        $('select#-1').on('change', function( ){



        });


        $("#format-attr").on('change', function(){

            var id_format = parseInt($("#format-attr").val());
            selectedAttributes = { '-1' : id_format };
            //  var frameworkUrl = 'http://dev3.digitalprint.pro';
            // getFrameworkUrl : getFrameworkUrl
            $.ajax( {

                url: config.getFrameworkUrl() + '/ps_types/'+productId+'/ps_product_options/forEditor',

                success: function( data ){

                    generateAttributesOptions_Select_user();

                },
                error: function( data ){



                }

            });

        });

        return html;

    }


    setProductDPI( dpi ){

    	this.product_DPI = dpi;

    }


    getProductDPI( argument ) {

    	return this.product_DPI;

    }


	loadProduct( product_id ){
		if(_.isEmpty(product_id)){
			console.warn(`Product id not set: product_id=${product_id}`);
			return;
		}

		var Editor = this;
		var loader = $("#loadingProgress");
		//loader.html("Wczytywanie produktu ... ");
		var project_id = null;
		this.setProductId( product_id );
		this.setProductDPI( 300 );

		$.ajax({
			dataType: 'JSON',
			withCredentials: false,
			url: this.config.getFrameworkUrl()+'/ps_types/'+Editor.getProductId()+'/ps_product_options/forEditor?companyID='+this.config.getCompanyID(),
			success: function(data) {

				if( Editor.userType != 'admin' ){

					var products = JSON.parse( Editor.getURLParameters()['products'] );
					var formatsID =JSON.parse( Editor.getURLParameters()['formats'] );
					var pages = JSON.parse( Editor.getURLParameters()['pages'] );

					var attributes = Editor.getURLParameters()['attributes'];
					Editor.productContext = 'complex';

					//Editor.complexAdminProject.load( data );
					//Editor.template.generateEditor( 'complex' );
					// podzial na tablice atrybutow
					var tables = Editor.getURLParameters()['attributes'].match( new RegExp( /\[(\d+)+([^\]])*\]/g ) );
					var attributes = [];
					for( var i=0; i < tables.length; i++){

						var splited = tables[i].replace('[', '').replace(']', '').split(',');
						var att = {};
						for( var s=0; s < splited.length; s++ ){

							var last = splited[s].split('-');
							att[ last[0] ] = last[1];

						}
						attributes.push( att );

					}

					Editor.complexProduct = [ products, formatsID, attributes, pages ];
					Editor.productData = data;
					Editor.productsNames = {

					}

					data.map( ( elem, index ) => {

						Editor.productsNames[ elem.name ] = elem.products.map( ( el, ind ) => {

							return el.typeID

						} );

					});

					Editor.template.generateEditor( 'simple' );

				}
				else {

					Editor.productFlatData = data;
					Editor.productContext = 'simple';


					var attributes = {};
					var formatID = JSON.parse( Editor.getURLParameters()['formatID'] );
					attributes = data[0].products[0].formats;
					Editor.loadAttributesOptions( attributes );

					Editor.template.generateEditor( 'simple' );

				}

				this.setProjectId( project_id );

				// event utuchamiający tickera stejdzowego, scena zaczyna pracowac
		        var cEvent = document.createEvent("Event");
		        cEvent.initEvent('editorLoaded', true, true);

		        document.dispatchEvent( cEvent );

		        //$("#overlay-loader").animate({ opacity: 0.1}, 1000, function(){ $("#overlay-loader").remove(); });

				Editor.webSocketControllers.init( io );

			}.bind( this )

		});

	}


	setProjectId( id ){

		this.projectId = id;

	}


	getProjectId(){

		return this.projectId;

	}


	getStage(){

		return this.stage_;

	}


	getCanvas(){

		return this.canvas;

	}


	createBitmap( name, url, height, width, x, y, rotation, sX, sY, order, rX, rY ){

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

	}


	handleDropedFile( e, callback ){

		var Editor = this;

		var file = e.target.files|| e.dataTransfer.files;
		file = file[0];

		var url = URL.createObjectURL( file );

		var loadedImage = new createjs.Bitmap( url );

		loadedImage.image.onload = function(){

			loadedImage.origin = loadedImage.getBounds();

			var miniature64 = Thumbinator.generateThumb( loadedImage );

            var projectImage = new Editor.ProjectImage();
            projectImage.init( file, miniature64, loadedImage.origin.width,  loadedImage.origin.height, loadedImage.origin.width, loadedImage.origin.height );
            imagesContent.appendChild( projectImage.toHTML() );

            Editor.adminProject.addProjectImage( projectImage, true );
            Editor.uploader.addItemToUpload( projectImage );
            Editor.uploader.upload();

            projectImage.addEventListener( 'uploaded', function( data ){

                var projectImage = data.target;

                Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), data.target.tmp_file.name, 'Bitmap', projectImage.imageUrl, projectImage.miniatureUrl, projectImage.miniatureUrl, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );
                callback( miniature64 );
                //Editor.webSocketControllers.adminProjectImage.uploadedImage( data.target.uid, data.target.miniatureUrl , data.target.imageUrl  );
                //Editor.adminProject.addProjectImage( data.target );

            });

		};


	}


	// uzywane do dodania projekt image dla mainTheme
	handleDropedFileToUpload( e, callback ){

		var Editor = this;
		var files = e.target.files|| e.dataTransfer.files;
		// file = file[0];

		function uploadFile( file ){

			var url = URL.createObjectURL( file );

			var loadedImage = new createjs.Bitmap( url );

			loadedImage.image.onload = function(){

				loadedImage.origin = loadedImage.getBounds();

				var miniature64 = ThumbsMaker.generateThumb( loadedImage );

				var bitmap = new createjs.Bitmap( miniature64.thumb );

				bitmap.image.onload = function(){

					origin = bitmap.getBounds();

					var projectImage = new Editor.ProjectImage();
		            projectImage.init( file, miniature64.thumb, miniature64.minThumb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height );

					if( $('#themeImagesContainer').attr('active-window') == 'photo' ){

						document.getElementById("themeImagesPhotos").appendChild( projectImage.toHTML() );

	            	}
	            	else if( $('#themeImagesContainer').attr('active-window') == 'backgrounds' ){

						document.getElementById("themeImagesBackgrounds").appendChild( projectImage.toHTML() );

	            	}
	            	else if( $('#themeImagesContainer').attr('active-window') == 'cliparts' ){

						document.getElementById("themeCliparts").appendChild( projectImage.toHTML() );

	            	}

		            Editor.uploader.addItemToUpload( projectImage );
		            Editor.uploader.upload();

		            projectImage.addEventListener( 'uploaded', function( data ){

		            	projectImage.updateHTML();

		            	if( $('#themeImagesContainer').attr('active-window') == 'photo' ){

			            	Editor.webSocketControllers.mainTheme.addProjectPhoto(

			            		projectImage.uid,
			            		Editor.adminProject.format.theme.getParentThemeID(),
			            		data.target.tmp_file.name,
			            		'Bitmap',
			            		projectImage.imageUrl,
			            		projectImage.miniatureUrl,
			            		projectImage.thumbnail,
			            		projectImage.width,
			            		projectImage.height,
			            		projectImage.trueWidth,
			            		projectImage.trueHeight

			            	);

		            	}
		            	else if( $('#themeImagesContainer').attr('active-window') == 'backgrounds' ){

							Editor.webSocketControllers.mainTheme.addProjectBackground( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), data.target.tmp_file.name, 'Bitmap', projectImage.imageUrl, projectImage.thumbnail, projectImage.miniatureUrl, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

		            	}
		            	else if( $('#themeImagesContainer').attr('active-window') == 'cliparts' ){

							Editor.webSocketControllers.mainTheme.addProjectClipart( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), data.target.tmp_file.name, 'Bitmap', projectImage.imageUrl, projectImage.thumbnail, projectImage.miniatureUrl, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

		            	}

		            });
				}

			}

		}

		for( var i=0; i < files.length; i++ ){

			uploadFile( files[i] );

		}

	}


	// uzywane do dodania projekt image dla mainTheme
	handleDropedFileToUpload_customCallback( e, callback ){

		var Editor = this;
		var files = e.target.files|| e.dataTransfer.files;
		// file = file[0];

		function uploadFile( file ){


			var url = URL.createObjectURL( file );

			var loadedImage = new createjs.Bitmap( url );

			loadedImage.image.onload = function(){

				loadedImage.origin = loadedImage.getBounds();

				var origin = loadedImage.origin;

				var miniature64 = ThumbsMaker.generateThumb( loadedImage );
				miniature64.file = file;

				var bitmap = new createjs.Bitmap( miniature64.min );

				bitmap.image.onload = function(){

					var smallBounds = bitmap.getBounds();

					callback( { image : miniature64, origin : origin, smallBounds : smallBounds } );

				};

			}

		}

		for( var i=0; i < files.length; i++ ){

			uploadFile( files[i] );

		}

	}


	handleFileSelect(evt, place) {

        var Editor = this;
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

					loadedImage.origin = loadedImage.getBounds();
					loadedImage.scale = {
						x : loadedImage.origin.width,
						y : loadedImage.origin.height
					};

					var obrazek = ThumbsMaker.generateThumb( loadedImage );

					var bitmap = new createjs.Bitmap( obrazek.thumb );
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

                            Editor.adminProject.format.view.addObject( bitmap );

                            Editor.uploader.addItemToUpload( bitmap );
                            Editor.uploader.upload();

						}

						else if(place == 2) {

                            var projectImage = new Editor.ProjectImage();
                            projectImage.thumbnail = obrazek.minThumb;
                            projectImage.minUrl = obrazek.thumb;
                            projectImage.waitingForUpload = true;
                            projectImage.init( files[actualFile], obrazek.thumb, obrazek.minThumb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height );

                            Editor.adminProject.addProjectImage( projectImage );
                            imagesContent.appendChild( projectImage.html );
                            imagesArray.push( projectImage );

                            var scrollbarImages = $('#imagesListScroll');
                            var scrollbarImages = scrollbarImages.data("plugin_tinyscrollbar");
							scrollbarImages.update();

                            //Editor.adminProject.addProjectImage( projectImage, true );
                            Editor.uploader.addItemToUpload( projectImage );
                            Editor.uploader.upload();

                            Editor.webSocketControllers.projectImage.add( projectImage.uid, Editor.adminProject.getProjectId(), files[actualFile].name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                            projectImage.addEventListener( 'uploaded', function( data ){

                                var projectImage = data.target;

                                var dataToUpload = {

                                	projectImageUID : projectImage.uid,
                                	minUrl : projectImage.miniatureUrl,
                                	thumbnail : projectImage.thumbnail,
                                	imageUrl : projectImage.imageUrl,
                                	uploadID : projectImage.uploadID

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

							fileReader=null;

						}
					};

				};

		}
		upload_image();

	}


	addEditGroup( group ){

		this.groups[group.name] = group;

	}


	uploadSingleImage( image, image_miniature, objectId ){

		var fileData = new FormData();
		fileData.append("userFile", image );
		fileData.append("image_min", image_miniature);
		fileData.append("projectID", projectId);
		fileData.append("objectID", objectId);

		var request = new XMLHttpRequest();

		request.open("POST", config.getFrameworkUrl() + '/upload', true);

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

	}


	getEditGroups(){

		return this.groups;

	}


	generateGroups(){

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

	}


	setSelectedEditGroup( groupID ){

		this.selectedEditGroup = groupID;

	}


	getSelectedEditGroup(){

		return this.selectedEditGroup;

	}


	getLayers(){

		return this.layers;

	}


	saveProject(){

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

	}


	loadHierarchy(){

	}


	loadProject2( json ){

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

	}


	loadAttributesOptions( _attributes ){

		this.attributes = _attributes;

	}


	getOptionNameByID( optionID ){



	}


	getAttributeOption( option_id ){

		return this.attributes[ option_id ];

	}


	getAttributesOptions( ){

		return this.attributes;

	}


	simulationMode(){

		mode = 'simulation';
		var stage = this.stage;

		var al = stage.getAttributeLayers();

		for( key in al ){

			if( al[key].checkActivity( selectedAttributes )){

				al[key].visibleForUser( true );
			}
			else {
				al[key].visibleForUser( false );
			}
		}

		this.updateLayers();

	}


	adminMode(){

		mode = 'admin';
		var al = this.stage.getAttributeLayers();

		for( key in al ){
				al[key].visibleForUser( true );
		}
		this.updateLayers();

	}


	// chyba do usuniecai
	updateLayers(){

		$("ul.sortArea").remove();
		var html = $("#editGroup-list span.list").html();
		$("#editGroup-list div.list").append( html + this.stage.generateLayersHTML( this.stage.decomposeMainLayer() ));
		this.updateLayersFunctions();

	}


	setProductId( id ){

		this.productId = id;

	}

	miniaturizeImage( image ){

		var promise = new Promise( function( resolve, reject ){

			var loadedImage = new createjs.Bitmap( image );

			loadedImage.image.onload = function(){

				loadedImage.origin = loadedImage.getBounds();

				var miniBase64 = ThumbsMaker.generateThumb( loadedImage );

				resolve( miniBase64 );

			};

		});

		return promise;

	}


	readFile( file ){

		var url = URL.createObjectURL( file );
		return url;

	}

	getProductId(){

		return this.productId;

	}


    getMagnetizeTolerance(){

        return this.magnetizeTolerance;

    }


    // trzeba wyspecyfikowac dlaadministratora
	editorEvents( e ){

		if(e.keyCode === 8){
			e.returnValue = false;
		}

		if( e.keyCode === 67 && Keyboard.isCtrl(e) ){

			var editing_id = this.tools.getEditObject();
			var editingObject = this.stage.getObjectById( editing_id );

			objectClipBoard = editingObject;

		}

		if( e.keyCode == 86 && Keyboard.isCtrl(e) ){

			if( !objectClipBoard )
				return;

			var clonedObject = objectClipBoard._cloneObject();
			clonedObject.x += 40;
			clonedObject.y += 40;

			if( clonedObject.mask ){

		        clonedObject.mask.x += 40;
		        clonedObject.mask.y += 40;
				clonedObject.mask.rotation = clonedObject.rotation;

		    }

			//objectClipBoard.parent.addChild( clonedObject );

			var addTo = 'View';
			var importantParent = objectClipBoard.getFirstImportantParent();

			if( importantParent instanceof EditableArea ){

				addTo = 'View';

			}

			if( objectClipBoard instanceof Bitmap ){

				this.webSocketControllers.editorBitmap.clone( objectClipBoard.dbID, this.adminProject.format.view.getId(), addTo );

			}
			else if( objectClipBoard instanceof ProposedPosition2 ){

				this.stage.addObject( clonedObject );
				objectClipBoard.parent.addChild( clonedObject );
				objectClipBoard.parent.parent.proposedImagePositions.push( clonedObject );
				clonedObject.prepareMagneticLines( getMagnetizeTolerance() );

			}
			else if( objectClipBoard instanceof Editor.Text2 ){

				this.stage.addObject( clonedObject );
				objectClipBoard.parent.addChild( clonedObject );
				clonedObject.prepareMagneticLines( getMagnetizeTolerance() );

			}

			this.templateAdministaration.updateLayers( this.adminProject.format.view.getLayer().children );

		}

		var editing_id = this.tools.getEditObject();
		var editingObject = this.stage.getObjectById( editing_id );

		if( editingObject && !editingObject.blocked  ){

			if( editingObject instanceof Text2 && editingObject.editMode )
				return;

			if( e.keyCode == '37' ){

				editingObject.x--;

				if( editingObject.mask )
					editingObject.mask.x--;

				this.stage.updateEditingTools( editingObject );

			}else if( e.keyCode == '39' ){

				editingObject.x++;

				if( editingObject.mask )
					editingObject.mask.x++;

				this.stage.updateEditingTools( editingObject );

			}else if( e.keyCode == '38' ){

				editingObject.y--;

				if( editingObject.mask )
					editingObject.mask.y--;

				this.stage.updateEditingTools( editingObject );

			}
			else if( e.keyCode == '40' ){

				editingObject.y++;

				if( editingObject.mask )
					editingObject.mask.y++;

				this.stage.updateEditingTools( editingObject );

			}

			editingObject.dispatchEvent('move');
			this.tools.init();

		}

	}


	initEvents( canvasName ){

		var Editor = this;
	    var copyBox = document.createElement("textarea");
	    copyBox.id = "copyBox";
	    document.body.appendChild( copyBox );

	    document.getElementById( canvasName ).addEventListener('mouseup', function( e ){


	    });

		$('body').on( 'mousedown', function(e){
			++this.mouseDown[e.button];

		}.bind( this ));

		$('body').on( 'mouseup', function(e){
			--this.mouseDown[e.button];

		}.bind( this ));

		window.addEventListener("resize", function( e ){

			$('#testowy').attr('width', window.innerWidth );
			$('#testowy').attr('height', window.innerHeight );

			$("#toolsBox").css('height', window.innerHeight - 80 );
			$("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );

			// update narzędnika
			this.stage.updateRulers();


			$('#testowy').attr('width', window.innerWidth );
			$('#testowy').attr('height', window.innerHeight-80 );
			$("#toolsBox").css('height', window.innerHeight - 80 );
			$("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );
	        this.template.resizeToUserObject();
	        $('#pagesListUser').width( window.innerWidth - $('#toolsBox').width() );


		}.bind( this ));

		document.addEventListener('dragleave', function( e ){

			e.stopPropagation();
			e.preventDefault();

		});


		document.addEventListener('dragenter', function( e ){

			e.stopPropagation();

			e.preventDefault();

			this.initDropAreas();

			var element = document.getElementById("imagesContent");

			if ( $('#image-container-tool_button').hasClass('tool-button active') ){


				if ( !(document.getElementById('imageDrop')) ) {
	           		Editor.template.createDragArea( element );
	      		}

			}

		}.bind( this ));

		$(document).on('dragexit', function(e) {

			e.stopPropagation();
			this.destroyDropAreas();

		}.bind( this ));


		$(document).on('dragleave', function(e) {

			e.stopPropagation();
			this.destroyDropAreas();

		}.bind( this ));

        $('body').bind("dragleave", function(e)
        {
            if (!e.originalEvent.clientX && !e.originalEvent.clientY)
            {
                $('#imageDrop').remove();
            }
        });

		$(document).on('drop', function(e) {

			e.stopPropagation();
			this.destroyDropAreas();

		}.bind( this ));


	    document.getElementById( canvasName ).addEventListener("dragexit", function(){

	    	e.stopPropagation();
	        var pages = Editor.stage.getPages();

	        for( var i=0; i<pages.length; i++){

	            pages[i].removeHitArea();

	        }

	    }, false);


	    document.getElementById( canvasName ).addEventListener('dragover', function(e){

	        e.stopPropagation();
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
	        Editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-75, obj );

	        var tryProposed = false;

	        for( var i=0; i < obj.length; i++){

	            if( obj[i] instanceof ProposedPosition2 || obj[i] instanceof EditableArea )
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

		document.addEventListener("keydown", Editor.editorEvents.bind(this));

		document.getElementById( canvasName ).addEventListener( (navigator.userAgent.indexOf('Firefox') != -1)?'DOMMouseScroll':'mousewheel', function(e){
	    //document.getElementById( canvasName ).addEventListener( (navigator.userAgent.indexOf('Mozilla') != -1)?'DOMMouseScroll':'mousewheel', function(e){
	    	if( Editor.userType != 'admin' ){
	    		return;
	    	}
	        var mainLayerSize = Editor.stage.getMainLayer().getTransformedBounds();
	        //console.log( mainLayerSize );
	        var area = Editor.stage.getVisibleAreaSize();
	        var noMoreRedraw = false;

	        var parsedScaleX = parseInt(Editor.getStage().scaleX *10 ) / 10;

	        if( mainLayerSize ){

	            var tooSmall = false;//( mainLayerSize.height*3 < area.height ) ? true : false;

				if (navigator.userAgent.indexOf('Firefox') != -1){

	                if( e.detail > 0){

	                    if( Editor.getStage().scaleX > 0.3  ){

	                        Editor.getStage().scaleX -= 0.1;
	                        Editor.getStage().scaleY -= 0.1;

	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY-80);

							var sliderValue = Editor.getStage().scaleX;

	                  		$( "#zoomSlider" ).slider( { value: sliderValue } );

	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale)/(scale+0.1)), mousePosition[1]*( scale/(scale+0.1))];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

	                        Editor.getStage().x -=  vec[0]*Editor.getStage().scaleX;
	                        Editor.getStage().y -=  vec[1]*Editor.getStage().scaleX;

	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }
	                }
	                else {

	                	if ( Editor.getStage().scaleX < 4.7 ){
	                        Editor.getStage().scaleX += 0.1;
	                        Editor.getStage().scaleY += 0.1;

	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY -80);

	                        var sliderValue = Editor.getStage().scaleX;
	                        $( "#zoomSlider" ).slider( { value: sliderValue } );

	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale-0.1)/scale), mousePosition[1]*( (scale-0.1)/scale)];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

	                        Editor.getStage().x +=  vec[0]*(Editor.getStage().scaleX+0.1);
	                        Editor.getStage().y +=  vec[1]*(Editor.getStage().scaleX+0.1);
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }
	                }
	            }
	            else {

	                if( e.wheelDelta < 0){

	                    if( Editor.getStage().scaleX > 0.3  ){
	                        Editor.getStage().scaleX -= 0.1;
	                        Editor.getStage().scaleY -= 0.1;
	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY-80);

	                        var sliderValue = Editor.getStage().scaleX;
	                        $( "#zoomSlider" ).slider( { value: sliderValue } );

	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale)/(scale+0.1)), mousePosition[1]*( scale/(scale+0.1))];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];


	                        Editor.getStage().x -=  vec[0]*Editor.getStage().scaleX;
	                        Editor.getStage().y -=  vec[1]*Editor.getStage().scaleX;
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }

	                }
	                else {

	                	if ( Editor.getStage().scaleX < 4.7 ){

	                        Editor.getStage().scaleX += 0.1;
	                        Editor.getStage().scaleY += 0.1;


							var sliderValue = Editor.getStage().scaleX;
							$( "#zoomSlider" ).slider( { value: sliderValue } );

	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY -80);

	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale-0.1)/scale), mousePosition[1]*( (scale-0.1)/scale)];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];


	                        Editor.getStage().x +=  vec[0]*(Editor.getStage().scaleX+0.1);
	                        Editor.getStage().y +=  vec[1]*(Editor.getStage().scaleX+0.1);
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }
	                }
	            }



	            if( area.width > mainLayerSize.width ){

	                Editor.stage.centerCameraX();
	            }
	            if( area.height > mainLayerSize.height ){
	                Editor.stage.centerCameraY();
	            }


	            var scrollEvent = new createjs.Event("stageScroll");
	            //scrollEvent.initEvent('stageScroll', true, true);

	            //var scrollEvent = new Event('stageScroll');

	            var stageObjects = Editor.stage.getObjects();


	            for( var key in stageObjects ){

	                stageObjects[ key ].dispatchEvent("stageScroll");

	            }


	            //Linie pomocnicze - dodanie eventu scroll
	            var IRulers = Editor.stage.getIRulersLayer().children;

	            for (var i=0 ; i < IRulers.length ; i++)
	            {
	            	IRulers[i].dispatchEvent("stageScroll");
	            }
	            //Koniec (Linie pomocnicze - dodanie eventu scroll)


	            var stagePages = Editor.stage.getPages();


	            for( var i=0; i < stagePages.length; i++){

	                stagePages[i].dispatchEvent( scrollEvent );

	            }


	            var rHelpers = Editor.stage.getIRulersLayer().children;


	    		for( var i=0; i< rHelpers.length;i++){

	    			rHelpers[i].dispatchEvent( scrollEvent );

	    		}

	            //Editor.tools.init();
	            $(".tools-box").trigger( scrollEvent );

	            //
	            Editor.stage.redrawRulers();
	            Editor.stage.updateNetHelper();

	            if( Editor.tools.getEditObject() && userType != 'user' )
	            	Editor.tools.init();

	        }
	        else {

				if (navigator.userAgent.indexOf('Firefox') != -1){

	                if( e.detail > 0){

	                	if ( Editor.getStage().scaleX > 0.3 ){

	                        Editor.getStage().scaleX -= 0.1;
	                        Editor.getStage().scaleY -= 0.1;
	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY-80);


	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale)/(scale+0.1)), mousePosition[1]*( scale/(scale+0.1))];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

	                        Editor.getStage().x -=  vec[0]*Editor.getStage().scaleX;
	                        Editor.getStage().y -=  vec[1]*Editor.getStage().scaleX;
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }
	                }
	                else {
	                	if ( Editor.getStage().scaleX < 4.7 ){

	                        Editor.getStage().scaleX += 0.1;
	                        Editor.getStage().scaleY += 0.1;

	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY -80);


	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale-0.1)/scale), mousePosition[1]*( (scale-0.1)/scale)];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

	                        Editor.getStage().x +=  vec[0]*(Editor.getStage().scaleX+0.1);
	                        Editor.getStage().y +=  vec[1]*(Editor.getStage().scaleX+0.1);
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }
	                }
	            }
	            else {
	                if( e.wheelDelta < 0){


	                    if( Editor.getStage.scaleX > 0.3 ){
	                        Editor.getStage().scaleX -= 0.1;
	                        Editor.getStage().scaleY -= 0.1;
	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY-80);


	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale)/(scale+0.1)), mousePosition[1]*( scale/(scale+0.1))];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

	                        Editor.getStage().x -=  vec[0]*Editor.getStage().scaleX;
	                        Editor.getStage().y -=  vec[1]*Editor.getStage().scaleX;
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }

	                }
	                else {
	                	if( Editor.getStage.scaleX < 4.7 ){
	                        Editor.getStage().scaleX += 0.1;
	                        Editor.getStage().scaleY += 0.1;

	                        var mousePosition = Editor.stage.getMousePosition( e.clientX, e.clientY -80);

	                        var end = Editor.stage.getMousePosition( mousePosition[0], mousePosition[1] );
	                        var scale = Editor.getStage().scaleX;

	                        end = [mousePosition[0]*( (scale-0.1)/scale), mousePosition[1]*( (scale-0.1)/scale)];

	                        var vec =  [end[0]-mousePosition[0], end[1] - mousePosition[1]];

	                        Editor.getStage().x +=  vec[0]*(Editor.getStage().scaleX+0.1);
	                        Editor.getStage().y +=  vec[1]*(Editor.getStage().scaleX+0.1);
	                    }else {

	                    	noMoreRedraw = true;
	                    	return;

	                    }
	                }
	            }

	            Editor.stage.redrawRulers();
	            Editor.stage.updateNetHelper();

	        }
		});

		// trzeba wyspecyfikowac dlaadministratora
		function editorEvents( e ){

			if(e.keyCode === 8){
				e.returnValue = false;
			}

			if( e.keyCode === 67 && Keyboard.isCtrl(e) ){

				var editing_id = Editor.tools.getEditObject();
				var editingObject = Editor.stage.getObjectById( editing_id );

				objectClipBoard = editingObject;

			}

			if( e.keyCode == 86 && Keyboard.isCtrl(e) ){

				if( !objectClipBoard )
					return;

				var clonedObject = objectClipBoard._cloneObject();
				clonedObject.x += 40;
				clonedObject.y += 40;

				if( clonedObject.mask ){

			        clonedObject.mask.x += 40;
			        clonedObject.mask.y += 40;
					clonedObject.mask.rotation = clonedObject.rotation;

			    }
				//objectClipBoard.parent.addChild( clonedObject );

				var addTo = 'View';
				var importantParent = objectClipBoard.getFirstImportantParent();

				if( importantParent instanceof Editor.EditableArea ){

					addTo = 'View';

				}

				if( objectClipBoard instanceof Editor.Bitmap ){

					Editor.webSocketControllers.editorBitmap.clone( objectClipBoard.dbID, Editor.adminProject.format.view.getId(), addTo );

				}
				else if( objectClipBoard instanceof Editor.ProposedPosition2 ){

					Editor.stage.addObject( clonedObject );
					objectClipBoard.parent.addChild( clonedObject );
					objectClipBoard.parent.parent.proposedImagePositions.push( clonedObject );
					clonedObject.prepareMagneticLines( getMagnetizeTolerance() );

				}
				else if( objectClipBoard instanceof Editor.Text2 ){

					Editor.stage.addObject( clonedObject );
					objectClipBoard.parent.addChild( clonedObject );
					clonedObject.prepareMagneticLines( getMagnetizeTolerance() );

				}

				Editor.templateAdministaration.updateLayers( Editor.adminProject.format.view.getLayer().children );

			}


			var editing_id = Editor.tools.getEditObject();
			var editingObject = Editor.stage.getObjectById( editing_id );

			if( editingObject && !editingObject.blocked  ){

				if( editingObject instanceof Editor.Text2 && editingObject.editMode )
					return;

				if( e.keyCode == '37' ){

					editingObject.x--;

					if( editingObject.mask )
						editingObject.mask.x--;

					Editor.stage.updateEditingTools( editingObject );

				}else if( e.keyCode == '39' ){

					editingObject.x++;

					if( editingObject.mask )
						editingObject.mask.x++;

					Editor.stage.updateEditingTools( editingObject );

				}else if( e.keyCode == '38' ){

					editingObject.y--;

					if( editingObject.mask )
						editingObject.mask.y--;

					Editor.stage.updateEditingTools( editingObject );

				}
				else if( e.keyCode == '40' ){

					editingObject.y++;

					if( editingObject.mask )
						editingObject.mask.y++;

					Editor.stage.updateEditingTools( editingObject );

				}

				editingObject.dispatchEvent('move');
				Editor.tools.init();

			}
		};

	}

    registeredObjects={}

	registerObject(o,context){
		this.registeredObjects[`${o.dbID}${context.constructor.name}`]=o
	}
    static debugCanvas({width = 200, height = 200, canvas,max=10000}) {
	    Editor.debugCnt=Editor.debugCnt || 1
        if(Editor.debugCnt>max)return;
        Editor.debugCnt++;
        const canva = document.createElement('canvas');
        canva.style.zIndex=1000;
        canva.style.position='absolute';
        document.body.appendChild(canva)
        canva.setAttribute('width', width);
        canva.setAttribute('height', height);
        const ctx = canva.getContext('2d');
        //ctx.fillRect(0,0,width, height)
        ctx.drawImage(canvas, width, height);
    }
}

export { Editor }
