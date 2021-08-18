import {ProposedPosition2} from './ProposedPosition2';
import {Text2} from './Text2';

function ProposedTemplate( editor, proposedTemplate, parentPage ){
    
    this.editor = editor;
    this.parentPage = parentPage;
    if( proposedTemplate )
    	this.init( proposedTemplate );
    
};

var p = ProposedTemplate.prototype;

p.init = function( proposedTemplate ){

	this.ProposedImages = [];
	this.ProposedTexts = [];
	//proposedTemplate.ProposedImages;
	for( var i=0 ; i<proposedTemplate.ProposedImages.length; i++ ){

		var proposedImage = new ProposedPosition2( this.editor, 'test', proposedTemplate.ProposedImages[i]._id, proposedTemplate.ProposedImages[i].size.width, proposedTemplate.ProposedImages[i].size.height, {} );
		proposedImage.order = proposedTemplate.ProposedImages[i].order;
        proposedImage.dbID = proposedTemplate.ProposedImages[i].dbId;
        proposedImage.setPosition( proposedTemplate.ProposedImages[i].pos.x, proposedTemplate.ProposedImages[i].pos.y );
        proposedImage.rotate( proposedTemplate.ProposedImages[i].rotation );
        this.editor.registerObject(proposedImage,this)
		this.ProposedImages.push( proposedImage );

	}
	
	for( var i=0; i < proposedTemplate.ProposedTexts.length; i++ ){
			
		var current = proposedTemplate.ProposedTexts[i];

		
		var text = new Text2( "Text", 40, current.size.width, current.size.height, true, true );//, generated.size.width, generated.size.height );
		text.order = proposedTemplate.ProposedTexts[i].order;
		text.dbID = proposedTemplate.ProposedTexts[i]._id;
		text.x = current.pos.x;
		text.y = current.pos.y;
		text.width = current.size.width;
		text.height = current.size.height;
        this.editor.registerObject(text,this)
        this.ProposedTexts.push( text );

	}

	//this.ProposedTexts  = [];
	//proposedTemplate.ProposedTexts;

	this.allObjects = this.ProposedImages.concat( this.ProposedTexts );
	this.allObjects = _.sortBy( this.allObjects, 'order' );

}

export { ProposedTemplate };