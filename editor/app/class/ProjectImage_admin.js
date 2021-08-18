    function ProjectImage(){

    }

    var p = ProjectImage.prototype;


    p.uploadForTheme = function(  ){


    };

    p.uploadImg = function( project_id, callback ){

        var that = this;
        var image = this.tmp_file;
        var image_miniature = this.miniature;
        var imageThumbnail = this.thumbnail;

        var fileData = new FormData();

        fileData.append("userFile", image );
        fileData.append("userProjectID", this.editor.userProject.getID() );
        fileData.append("objectID", this.dbID );
        //fileData.append( "userID", Editor.user.getID() );
        fileData.append('companyID', this.editor.config.getCompanyID() );
        fileData.append('minSize', JSON.stringify( this.minSize ) );
        fileData.append('thumbSize', JSON.stringify( this.thumbSize ) );

        var request = new XMLHttpRequest();

        request.upload.addEventListener('progress', function( data ){

            var evt = document.createEvent("Event");
            evt.initEvent("progress", true, false);
            evt.progress = parseInt( data.loaded/data.total*100 );
            that.statusBar.dispatchEvent(evt);

        });

        /*
        request.open("POST", this.editor.config.getDomain() +':'+ this.editor.config.getPort()+'/uploadAsset/', true);
        */
        request.open("POST", this.editor.config.getDomain() +':'+ this.editor.config.getPort()+'/uploadAdminImageAsset/', true);

        request.send( fileData );

        request.onreadystatechange = function( aEvt ){

            if( request.readyState == 4 ){

                var resp = JSON.parse(request.responseText);

                that.uploaded = true;
                that.alpha = 1;

                var objectContent = {

                    img : resp.url,
                    min_img : resp.minUrl

                };

                that.imageUrl = resp.url;
                that.miniatureUrl = that.miniature = that.minUrl = resp.minUrl;
                that.thumbnail = resp.thumbUrl;
                that.uploadID = resp._id;
                that.dispatchEvent('uploaded');

                callback( that );

            }

        };

        delete this.tmp_image;

    };

export {ProjectImage};
