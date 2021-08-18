/*
TO DO : brakuje usuwania juz wgranych plików! Zostaja w pamięci
*/

export var Uploader = function( editor ){

		var Editor = editor;
		var uploadQueue = [];
		var uploadingItem = 0;
		var currentItem = 0;
		var currentItemObject = null;
		var uploadingInProgress = false;
		var uploadingIsDone = true;
		var uploadedItems = 0;
		var allItemsToUpload = 0;

		function addItemToUpload( item ){

			uploadQueue.push( item );
			allItemsToUpload++;
			//uploadStart();

		};

		function getItemsCount(){

			return allItemsToUpload;

		};

		function stopUploading(){

			currentItemObject.stopUploading();

		};

		function resetUploading(){



		};

		function endUpload( object, removed ){


			if( !removed ){

				uploadedItems++;
				uploadQueue = _.reject( uploadQueue, { 'uid' : object.uid } );

				object.uploadedImage = true;

			}

			uploadingInProgress = false;

			if( uploadedItems != allItemsToUpload ){

				uploadStart();

			}
			else {

				uploadingIsDone = true;

			}

		};


		function removeObjectFromQueue( object ){

			uploadQueue = _.reject( uploadQueue, { uid : object.uid } );
			allItemsToUpload--;

			if( object.requestUpload ){

				$('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload') )-(parseInt(object.tmp_file.size)+parseInt(object.headerSize)) );
				$('.uploadingInfo .uploadInfoLoaderText').attr('loaded', parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('loaded') )-object.loadedInfo );
				endUpload( object, true );

			}else if( object.tmp_file ){

				$('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload') )-object.tmp_file.size );

			}else {

				uploadedItems--;
				$('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload') )-object.loadedInfo );
				$('.uploadingInfo .uploadInfoLoaderText').attr('loaded', parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('loaded') )-object.loadedInfo );

			}

		};

		function uploadStart( ){

			uploadInfo();
			var object = uploadQueue[0];
			currentItemObject = object;
			object.uploadImg( Editor.getProjectId(), endUpload.bind(this) );


		};

		function upload(){

			if( uploadedItems != allItemsToUpload && uploadingIsDone){

				uploadingIsDone = false;
				uploadStart();

			}

		};

		function isUploading(){

			if( uploadQueue[item].done ) {

				return false;

			}
			else {

				return true;

			}

		};

		function getQueue(){

			return uploadQueue;

		}

		function clearQueue(){

			uploadQueue = [];

		}

		function uploadInfo(){

			$("#uploadInfo").html( "Upload zdjęć: " + uploadedItems + " z " +allItemsToUpload );

		};

		return {

			clearQueue : clearQueue,
			uploadStart : uploadStart,
			isUploading : isUploading,
			addItemToUpload : addItemToUpload,
			getItemsCount : getItemsCount,
			upload : upload,
			uploadingIsDone : uploadingIsDone,
			getQueue : getQueue,
			stopUploading : stopUploading,
			resetUploading : resetUploading,
			removeObjectFromQueue : removeObjectFromQueue

		}

	}
