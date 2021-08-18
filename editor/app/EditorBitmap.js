function EditorBitmap( name, object ){

	EditorObject.call( this, object );
	this.name = name;
//	this.body.scaleX = 0.2;
//	this.body.scaleY = 0.2;
	this.type = 'bitmap';
	this.tmp_image;
	this.body.alpha = 0.5;


	this.body.addEventListener('pressup', function(e){

	});

	var that = this;
	this.uploadedImage = false;
	this.isUploading = false;
//	Editor.stage.addObject( this );
//	var uploadProgress = new createjs.Bitmap('uploading.png');

};

EditorBitmap.prototype = Object.create( EditorObject.prototype );

EditorBitmap.prototype.constructor = EditorBitmap;

EditorBitmap.prototype.uploadImg = function( projectId, callback ){
	var that = this;

	var image = this.tmp_image;
	var image_miniature = this.body.image.src;

	var fileData = new FormData();
	fileData.append("userFile", image );
	fileData.append("image_min", image_miniature);
	fileData.append("projectID", projectId);
	fileData.append("objectID", this.dbId);
	
	var request = new XMLHttpRequest();
	request.open("POST", `${EDITOR_ENV.frameworkUrl}/upload`, true);
	request.send( fileData );

	request.addEventListener("progress", function(e){

		$("#progress").html( e.loaded / e.total );
	},
	false);
	
	request.onreadystatechange = function( aEvt ){
		if( request.readyState == 4 ){
			var resp = JSON.parse(request.responseText);

			uploadedImage = true;
			that.body.alpha = 1;

			var objectContent = {
				img : resp.url,
				min_img : resp.minUrl
			};

			that.updateInDB("content", JSON.stringify( objectContent ) );

			callback( that );
		}
	};

	delete this.tmp_image;
};

EditorBitmap.prototype.saveToDB = function( project_id, layer_id ){
	var that = this;
	$.ajax({
		url: `${EDITOR_ENV.frameworkUrl}/adminProjects/`+project_id+'/adminProjectLayers/'+layer_id+'/adminProjectObjects',
		crossDomain: true,
		contentType: 'application/json',
		type: "POST",
		data: "{ \"name\" : \""+String( this.name)+"\",\"typeID\" : \"1\" }",
		success: function( data ){
			that.dbId = data.item.ID;
			Editor.uploader.addItemToUpload( that );
			Editor.updateLayers();
			Editor.uploader.upload();
			
			Editor.stage.saveSort();	

			var transformations = {
				rotation : that.body.rotation,
				x : that.body.x,
				y : that.body.y,
				sX : that.body.scaleX,
				sY : that.body.scaleY,
				tw : that.trueWidth,
				th : that.trueHeight,
				w : that.width,
				h : that.height,
				rX : that.body.regX,
				rY : that.body.regY
			};

			that.updateInDB( "matrix", JSON.stringify( transformations ) );	
		},
		error : function(){
			console.error('wystapil problem');
		}

	});
};



