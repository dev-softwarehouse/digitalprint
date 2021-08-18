
	function Bitmap(){

	}

	var p = Bitmap.prototype;

    p.updatePositionInDB = function(){

        this.editor.webSocketControllers.editorBitmap.setSettings( this.dbID, { x: this.x, y: this.y} );

    };

export {Bitmap};