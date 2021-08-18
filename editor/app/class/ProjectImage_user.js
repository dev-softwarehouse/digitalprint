    function ProjectImage(){

    }

    var p = ProjectImage.prototype;

    p.stopUploading = function(){

        this.editor.uploader.removeObjectFromQueue( this );

        if( this.requestUpload ){

            this.requestUpload.abort();
            this.requestUpload = null;

        }

    };


    p.uploadImg = function( project_id, callback ){

        //Editor.adminProject.uploadingImage( this, true );
        var that = this;
        var image = this.tmp_file;
        var image_miniature = this.miniature;
        var imageThumbnail = this.thumbnail;

        this.loadedInfo = 0;

        var fileData = new FormData();
        fileData.append("userFile", image );
        fileData.append("userProjectID", this.editor.userProject.getID() );
        fileData.append("objectID", this.dbID );
        fileData.append( "userID", this.editor.user.getID() );
        fileData.append('companyID', this.editor.config.getCompanyID() );
        fileData.append('minSize', JSON.stringify( this.minSize ) );
        fileData.append('thumbSize', JSON.stringify( this.thumbSize ) );

        this.requestUpload = new XMLHttpRequest();


        this.addEventListener('uploaded', function( e ){

            e.stopPropagation();

            that.tmp_file = null;

        });

        var _this = this;

        this.requestUpload.onerror = function( e ){

            //console.log( e );
            //console.log('Wystąpił bąd podczas pobierania pliku!');

        };

        this.requestUpload.upload.addEventListener('progress', function( data ){

            //console.log('upload leci');
            var evt = document.createEvent("Event");
            evt.initEvent("progress", true, false);
            evt.progress = parseInt( data.loaded/data.total*100 );
            that.statusBar.dispatchEvent(evt);

            var allLoaded = parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('loaded') ) || 0;
            allLoaded += data.loaded - that.loadedInfo;

            var total = parseInt( $('.uploadingInfo .uploadInfoLoaderText').attr('total') ) || 0;

            $('.uploadingInfo .uploadInfoLoaderText').attr('loaded', allLoaded );
            var toUpload = $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload' );

            if( !_this.headerSize ){

                _this.headerSize = data.total - _this.fileSize;

                $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', parseInt(toUpload) + _this.headerSize  );

            }

            $('.uploadingInfo .uploadInfoLoaderText').html( parseInt( allLoaded/toUpload*100 ) + "%" );

            var estimatorCounter = parseInt($('.uploadingInfo').attr('c-estimator') )||0 ;
            estimatorCounter++;

            $('.uploadingInfo').attr('c-estimator', estimatorCounter );

            var estimatorValue = parseInt( $('.uploadingInfo').attr('v-estimator') ) || 0;
            estimatorValue += data.loaded - that.loadedInfo;

            $('.uploadingInfo').attr('v-estimator', estimatorValue );

            if( estimatorCounter == 1 ){

                $('.uploadingInfo').attr('tstart-estimator', parseInt( Date.now()) );
                $('.uploadingInfo').attr('v-estimator', 0);

            }

            if( estimatorCounter == 50 ){

                $('.uploadingInfo').attr('tstop-estimator', parseInt( Date.now()) );
                $('.uploadingInfo').attr('c-estimator', 0);
                $('.uploadingInfo .estimation').html( "Szacowany czas: " +parseInt( Math.ceil(( parseInt($('.uploadingInfo .uploadInfoLoaderText').attr('to-upload' ))-parseInt($('.uploadingInfo .uploadInfoLoaderText').attr('loaded' ))  )/parseInt($('.uploadingInfo').attr('v-estimator')) * (parseInt($('.uploadingInfo').attr('tstop-estimator'))-parseInt($('.uploadingInfo').attr('tstart-estimator'))) / 1000.0 /60.0) ) + ' minut' );

            }

            $('.uploadingInfo .uploadInfoLoaderProgress').width( parseInt( allLoaded/toUpload*100 ) + "%" );


            if( allLoaded/toUpload*100 >= 100 ){

                $('.uploadingInfo').addClass('hidden');

                //imagesListScroll
                var imagesHeight = $('#imagesContent').height() - $("#imagesContent .containerButtons").outerHeight() - $("#imageLoaderInfo").outerHeight() - 20;
                $("#imagesListScroll").height( imagesHeight );

            }else {

                $('.uploadingInfo').removeClass('hidden');

            }

            that.loadedInfo = data.loaded;

        });

        this.requestUpload.open("POST", this.editor.config.getDomain() +':'+ this.editor.config.getPort()+'/userUpload/projectImage', true);

        this.requestUpload.onreadystatechange = function( aEvt ){

            if( _this.requestUpload.readyState == 4 ){

                var resp = JSON.parse( _this.requestUpload.responseText);

                that.uploaded = true;
                that.alpha = 1;

                var objectContent = {

                    img : resp.url,
                    min_img : resp.minUrl

                };

                var urlCreator = window.URL || window.webkitURL;
                urlCreator.revokeObjectURL( that.imageUrl );

                var urlCreator = window.URL || window.webkitURL;
                urlCreator.revokeObjectURL( that.miniatureUrl );

                var urlCreator = window.URL || window.webkitURL;
                urlCreator.revokeObjectURL( that.thumbnail );

                that.imageUrl = resp.url;
                that.miniatureUrl = that.miniature = that.minUrl = resp.minUrl;
                that.thumbnail = resp.thumbUrl;
                that.uploadID = resp._id;

                that.dispatchEvent('uploaded');
                //that.addToAdminProject();

                _this.requestUpload = null;
                callback( that );

            }

        };

        this.requestUpload.send( fileData );
        //console.log('^^^--------------------------------');

        delete this.tmp_image;

    };

export {ProjectImage};
