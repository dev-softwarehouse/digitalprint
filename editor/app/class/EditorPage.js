function EditorPage( name, isRanged, numStart, numStop ){

	Layer.call( this, name );
	this.type = 'bitmap';
	this.isRanged = isRanged;
	this.numStart = numStart;
	this.numStop = numStop;

};

EditorPage.prototype = Object.create( Layer.prototype );

EditorPage.prototype.constructor = EditorPage;
