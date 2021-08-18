	
	function Bitmap(){

	};

	var p = Bitmap.prototype;

    p.updatePositionInDB = function(){

        if( !this.isInEditableArea() )
            this.editor.webSocketControllers.editorBitmap.savePosition( this.dbID, this.x, this.y );

    };

export {Bitmap};