var Layer = require('./Layer.js').Layer;


function EditorLayer( name, dataBaseId ){

	Layer.call(this, name, dataBaseId);

	this.type ='bitmap';

//	Editor.stage.addObject( this );
};


EditorLayer.prototype = Object.create( Layer.prototype );


EditorLayer.prototype.constructor = EditorLayer;


EditorLayer.prototype.saveToDB = function( project_id ){

	var that = this;
	$.ajax({
		url: 'http://api.digitalprint9.pro/adminProjects/'+project_id+'/adminProjectLayers/',
		crossDomain: true,
		contentType: 'application/json',
		type: "POST",
		data: "{ \"name\" : \""+String( this.name)+"\",\"typeID\" : \"1\" }",
		success: function( data ){
			that.dbId = data.item.ID;
			Editor.updateLayers();
			Editor.stage.saveSort();
		},
		error : function(){
			alert('wystapil problem');
		}
	});

};


EditorLayer.prototype.addAttributeLayer = function( layer ){

	Editor.stage.pushLayer( layer );
	this.attributes[layer.id] = layer;
	this.objectsOrder.push({ 'type': 'al', name : layer.name, id: layer.id });
	this.addChild( layer );

};


EditorLayer.prototype.addAtribute = function( id, layer){

	this.attributes[id] = {
		id : id,
		layer : layer
	};
	
};

EditorLayer.prototype.toLayerHTML = function(){

	var _this = this;
	var html = document.createElement('li');
	html.className = 'layer';

	var visibility = document.createElement('span');
	visibility.className = 'objectVisibility ' + ((this.visible)? 'visible' : 'notvisible' );

	visibility.addEventListener('click', function( e ){

	    e.stopPropagation();
	    //console.log('change');
	    if( $(this).hasClass('visible') ){

	        this.className = 'objectVisibility notvisible';
	        _this.visible = false;

	    }
	    else {

	        this.className = 'objectVisibility visible';
	        _this.visible = true;

	    }

	});

	var name = document.createElement('span');
	name.className = 'objectName noEdit';
	name.innerHTML = this.name;
	name.setAttribute( 'data-object-id', this.dbID );

	name.addEventListener('dblclick', function( e ){

	    e.stopPropagation();
	    //console.log('double');

	});

	name.addEventListener('blur', function( e ){

	    console.log( 'zmieniam nazwe na ' + this.value );

	});

	var miniature = document.createElement('span');
	miniature.className = 'objectMiniature';
	miniature.style.backgroundImage = 'url(images/layer.png)';

	var remover = document.createElement('span');
	remover.className = 'objectRemove';
	remover.setAttribute('object-id', this.dbID );

	remover.addEventListener('click', function( e ){

	 	e.stopPropagation();

	});


	html.appendChild( visibility );
	html.appendChild( name );
	html.appendChild( miniature );
	miniature.appendChild( remover );

	return html;

};

export { EditorLayer };