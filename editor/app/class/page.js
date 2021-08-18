function Page( id, size, margin, padding ){

	this.id = id;
	this.size = size;
	this.margin = margin;
	this.padding = padding;

	this.container = new createjs.Container;

	this.helper = new createjs.Shape();

	this.helper.graphics.mt( 0, 0).ss(1).s("#F00").
		lt(this.size.width, 0).
		lt(this.size.width, this.size.height).
		lt(0, this.size.height).cp().es();

	this.helper.graphics.mt( this.margin[3] , this.margin[0]  ).ss(1).s("#FF0").
		lt(this.size.width - this.margin[1], this.margin[0]).
		lt( this.size.width - this.margin[1], this.size.height - this.margin[2] ).
		lt( this.margin[3], this.size.height - this.margin[2]).cp().es();

	this.helper.graphics.mt( margin[3] + padding[3], margin[0] + this.padding[0]).ss(1).s("#0F0").
		lt( this.size.width - ( this.margin[1] + this.padding[1] ), this.margin[0] + this.padding[0]).
		lt( this.size.width - (this.margin[1] + this.padding[1]), this.size.height - (this.margin[2] + this.padding[2])  ).
		lt( margin[3] + padding[3], this.size.height - (this.margin[2] + this.padding[2])).cp().es();
	
	this.container.addChild( this.helper);
};

Page.prototype.addChild = function( obj ){
	this.container.addChild( obj );
};

Page.prototype.drawHelpers = function(){
	// drawing margin
};
