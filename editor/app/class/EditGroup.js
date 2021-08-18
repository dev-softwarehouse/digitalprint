var clone = (function(){ 
		  return function (obj) { Clone.prototype=obj; return new Clone() };
		    function Clone(){}
}());

function EditGroup( name ){
	this.name = name;
	this.layers = {};
	this.objects = {};
	this.attributes = {};
	this.body = new createjs.Container();
	this.editableArea = null;
	this.objectsOrder = [];

	EditorObject.call( this, this.body );
	this.body.removeAllEventListeners();
	this.body.regX = this.body.regY = 0;
	this.type = 'bitmap';

	//console.log( "Sprawdzenie ");
	//console.log( this.body );
	Editor.stage.addObject( this );
};

EditGroup.prototype.addObject = function( object ){
	this.objects[object.body.id] = object;

	this.objectsOrder.push( { 'type' : 'o', id : object.body.id } );
	this.body.addChild( object.body );
};


EditGroup.prototype.addLayer = function( object ){
	this.body.addChild( object.body );
	this.layers.push( object );
};

EditGroup.prototype.setEditableArea = function( object ){
	this.body.addChild( object.body );

	/*
	for( var i=0; i < this.layers.length; i++  ){
		this.layers[i].setPosition(   );
	}
	*/

	this.editableArea = object;
	this.layers.push( object );
};

EditGroup.prototype.updateBounds = function(){
	var bounds = this.body.getBounds();
	this.body.regX = bounds.x;
	this.body.regY = bounds.y;
	this.body.x = this.body.y = bounds.width/2;
};

EditGroup.prototype.getBounds = function( ){
	return this.body.getBounds();
};

EditGroup.prototype.setEditTools = function(){
	Editor.tools.setEditingObject( this.body.id );
	Editor.tools.init();
};

EditGroup.prototype.updatePositions = function( x, y, width, height ){

	var old_reg = [ this.body.regX, this.body.regY ];
	var old_position = [ this.body.x, this.body.y ];

	//console.log("_____________________________________________________________");

	//console.log( "old_reg");
	//console.log( old_reg );

	//console.log( "old_position");
	//console.log( old_position );

	var rotation = this.body.rotation;
	this.body.rotation = 0;

	var bounds = this.body.getTransformedBounds();

	var x = bounds.x;
	var y = bounds.y;


	var position_start_2 =  this.body.localToGlobal( 0, 0);
	var position_start_3 =  this.body.localToGlobal( this.body.regX, this.body.regY);
	var position_vector = [ position_start_2.x-position_start_3.x, position_start_2.y-position_start_3.y]; 


	//console.log("vector srodka ");
	//console.log( position_start_2.x);
	//console.log( position_start_3.x);

	//console.log(  position_vector );
	var position_start = [ old_position[0] - (this.body.regX * this.body.scaleX) , old_position[1] - ( this.body.regY * this.body.scaleY ) ];

	//console.log( "position_start" );
	//console.log( position_start );

	var bounds = this.body.getTransformedBounds();
	var poz = this.body.localToLocal( 0,0, Editor.getStage() );
	var width = bounds.width;
	var height = bounds.height;

	this.body.x = x;
	this.body.y = y;

	//console.log( "width" );
	//console.log( bounds.width );

	//console.log("wylicznie:" + x + " - " + this.body.x + " - " + " - " + this.body.regX + " * " + this.body.scaleX );
	//console.log( "height" );
	//console.log( bounds.height );

	var regVector = [ x-position_start[0], y-position_start[1] ];

	//console.log( "regVector" );
	//console.log( regVector );

	this.body.rotation = rotation;

	this.width = width;
	this.height = height;

	this.trueWidth = width * 1/this.body.scaleX;
	this.trueHeight = height * 1/this.body.scaleY;

	var position_start_2 =  this.body.localToGlobal( 0, 0);
	var position_start_3 =  this.body.localToGlobal( this.trueWidth/2, this.trueHeight/2);
	var position_vector = [ position_start_2.x-position_start_3.x, position_start_2.y-position_start_3.y]; 

	//console.log( "nowy wektor do srodka" );
	//console.log( position_vector );

	//console.log("roznica wektorow");
//	var v = 
	//console.log(   );


	for( var i=0; i < this.layers.length; i++ ){

		//console.log( "iteracja objectu" );
		this.body.regX = old_reg[0];
		this.body.regY = old_reg[1];
		this.body.x = old_position[0];
		this.body.y = old_position[1];	
		this.body.rotation = 0;
		//console.log( this );

		var object = this.layers[i].body;
		var matrix = object.getMatrix();
		var tmp = clone(object);
		var regX_ = object.regX;
		var regY_ = object.regY;
		object.regX = 0;
		object.regY = 0;

		while( tmp.parent ){
			tmp = tmp.parent;
			if(tmp.parent){
				matrix.prependMatrix( tmp.getMatrix());
			}
		}

		this.body.regX = old_reg[0] - regVector[0];//this.trueWidth/2;
		this.body.regY = old_reg[1] - regVector[1];//this.trueHeight/2;

		//console.log( "pierwsza zmiana punktu rotacjia" );
		//console.log( [ this.body.regX, this.body.regY ] );
		//console.log( "aktualna pozycja obiektu ( winna być taka sama jak ówcześniej wypisany log)"  );
		//console.log( [ this.body.x, this.body.y ] );

		this.body.x = x + (this.body.regX * this.body.scaleX);//-old_reg[0] - regVector[0];//this.trueWidth/2;
		this.body.y = y + (this.body.regY * this.body.scaleY);//-old_reg[1] - regVector[1];
		//console.log( "nowa pozycja obiektu ");
		//console.log( [ this.body.x,this.body.y ] );

		var point = this.body.localToGlobal( this.body.regX, this.body.regY );

		point = this.body.parent.globalToLocal( point.x, point.y);

		var poz = this.body.localToLocal( this.body.regX, this.body.regY, Editor.getStage() );
		var test = Editor.getStage().localToLocal( matrix.tx, matrix.ty, this.body );

		object.x = test.x; //+ regX_ * object.scaleX;	
		object.y = test.y; //+ regY_ * object.scaleY;
		
		object.regY = 0; //regY_;
		object.regX = 0;//regX_;

		if( object.mask ){
			object.mask.x =  test.x;
			object.mask.y =  test.y;
			object.mask.regX = object.regX;
			object.mask.regY = object.regY;
		}
	}

	var n_point = this.body.localToLocal( this.trueWidth/2, this.trueHeight/2, this.body.parent);
	//console.log( "pozycja ostateczna" );
	//console.log( n_point );
	this.body.regX = this.trueWidth/2;
	this.body.regY = this.trueHeight/2;
	//console.log("pozycja punktu rotacji ( koncowa ):");

	//console.log( [ this.body.regX, this.body.regY ] );

	this.body.x = n_point.x;
	this.body.y = n_point.y;

	this.body.rotation = rotation;
};
