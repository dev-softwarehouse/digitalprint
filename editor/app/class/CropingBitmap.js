(function(){

	function CropingBitmap( name, dbId, width, height, editorBitmap ){

		//console.log( width, height );

		Editor.ProposedPosition.call( this, name, dbId, width, height);

		this.objectInside = editorBitmap;
		this.addMainChild( editorBitmap );

		editorBitmap.removeAllEventListeners();

		editorBitmap.setCenterReg();

		this.uncache();

		this.objectInside.center();

		this.width = this.trueWidth = width;
		this.height = this.trueHeight = height;

		//console.log( this );

		this.hitArea = null;

		this.cache( -this.width/2, -this.height/2, this.width*2, this.height*2 );

		//this.type = "cropingBitmap";

	};


	var p = CropingBitmap.prototype = Object.create( Editor.ProposedPosition.prototype );

	p.constructor = CropingBitmap;


	p.HTMLoutput = function(){

		var HTML = "<li data-id='"+ this.id +"'><span class='li-button' data-id='" + this.id + "'><span class='visibility"+((this.visible)? " active" : " un-active" )+"' data-id='"+this.id+"' data-base-id='" + this.dbId + "'></span><span class='image-miniature'><img src='"+this.objectInside.image.src+"' crossOrigin='anonymous'/></span><span class='object-name'>" + this.dbId + " </span><span class='locker"+((this.mouseEnabled)? " active" : " un-active" )+"'></span><span class='remover' data-id="+this.id+">x</span></span>";

		return HTML;

	};



	p.saveToDB = function(){

		//console.log( this );

	};

	Editor.CropingBitmap = CropingBitmap;

})();