export function tools( stage ){

	this.container = new createjs.Container();

	this.compoundBox = new createjs.Shape();

	this.container.visible = false;

    this.container.addChild( this.compoundBox );
    
	this.edited = null;
    
    stage.toolsLayer.addChild( this.container );

};
