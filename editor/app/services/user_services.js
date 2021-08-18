import {ProjectImage} from './../class/ProjectImage';
import {safeImage} from "../utils";

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var services = function( editor ){

    var Editor = editor;

    function calculatePrice(){

        var obj =  Editor.userProject.getObj();

        if( !obj )
            return null;

        if( Editor.userProject.isComplex() ){

            var products = [];

            for( var i=0; i < obj.projects.length; i++ ){

                var product = {
                    typeID: obj.projects[i].typeID,
                    formatID: obj.projects[i].Format.formatID,
                    width: obj.projects[i].Format.width,
                    height: obj.projects[i].Format.height,
                    pages: Editor.userProject.getPagesCountForProduct( i )
                }

                var attributes = [];

                var selectedAttributes = Editor.template.productAttributes.getSelected()[i];

                for( var key in selectedAttributes ){
                    
                    if( key != 'typeID' ){
        
                        attributes.push(
        
                            {
                                'attrID' : key,
                                'optID' : selectedAttributes[ key ]
                            }
        
                        );
        
                    }
        
                }

                product['options'] = attributes;

                products.push( product );

            }
                        
            $.ajax({
    
                url: `${EDITOR_ENV.frameworkUrl}/ps_groups/` + Editor.productData[0].products[0].groupID + "/ps_types/" + Editor.productData[0].products[0].baseID + "/ps_calculate/calculatePublic",
                type: "POST",
                headers: {
                    "access-token": getCookie('access-token'),
                },
                data : {
    
                    amount: 1,
                    typeID: Editor.getProductId(),
                    products: products,
                    volume:1,
                    currency:"PLN"
    
                },
                success: function( resp ){
                    Editor.lastCalculation=resp;
                    var thickness = 0;
    
                    resp.products.map( ( elem ) => {
    
                        thickness += elem.thickness;
    
                    } );
                    
                    Editor.userProject.updateCoverHeight( thickness );
                    Editor.template.getTopMenuComponent().updatePrice( resp.calculation.price + "zł netto " );
                    //$('.price_val').html( resp.calculation.price + "zł netto " );
    
                }
    
    
            });

        } else {

            var attributes = [];
            
            for( var key in obj.selectedAttributes ){
    
                if( key != 'typeID' ){
    
                    attributes.push(
    
                        {
                            'attrID' : key,
                            'optID' : obj.selectedAttributes[ key ]
                        }
    
                    );
    
                }
    
            }
    //[{"complexID":null,"ID":null,"productID":60,"name":"Fotoalbum","names":{"pl":{"name":"Fotoalbum"},"en":{"name":"photoalbum"},"ru":{"name":"\u0444\u043e\u0442\u043e\u0430\u043b\u044c\u0431\u043e\u043c"}},"type":"single","products":[{"ID":60,"groupID":42,"parentID":null,"name":"Fotoalbum","description":null,"active":1,"order":4,"sizePageActive":0,"fotoliaDPI":null,"minDPI":50,"goodDPI":100,"skipUpload":0,"adminProjectID":null,"maxVolume":null,"complex":null,"taxID":9,"cardGuide":null,"isEditor":1,"iconID":null,"typeName":"Fotoalbum","groupName":"Fotoalbum","typeID":60,"langs":{"pl":{"name":"Fotoalbum"},"en":{"name":"photoalbum"},"ru":{"name":"\u0444\u043e\u0442\u043e\u0430\u043b\u044c\u0431\u043e\u043c"}},"formats":{"144":{"name":"14x14 cm","width":300,"height":150,"slope":5,"ID":144,"attributes":{"1":{"name":"Druk","sort":1,"options":{"34":{"name":"4+4","excludes":[],"opis":null}}},"9":{"name":"Uszlachetnienie","sort":13,"options":{"119":{"name":"brak","excludes":[],"opis":null},"120":{"name":"folia b\u0142ysk dwustronnie","excludes":[234,351,352],"opis":null},"121":{"name":"folia mat dwustronnie","excludes":[],"opis":null},"122":{"name":"folia soft dwustronnie","excludes":[],"opis":null}}},"2":{"name":"Papier","sort":4,"options":{"20":{"name":"170g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"21":{"name":"170g kreda matowa","excludes":[97,98,99,100,101],"opis":null},"22":{"name":"250g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"23":{"name":"250g kreda matowa","excludes":[97,98,99,100,101],"opis":null},"26":{"name":"350g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"27":{"name":"350g kreda matowa","excludes":[97,98,99,100,101],"opis":null}}}}},"145":{"name":"21x21 cm","width":430,"height":220,"slope":5,"ID":145,"attributes":{"1":{"name":"Druk","sort":1,"options":{"34":{"name":"4+4","excludes":[],"opis":null}}},"9":{"name":"Uszlachetnienie","sort":13,"options":{"119":{"name":"brak","excludes":[],"opis":null},"120":{"name":"folia b\u0142ysk dwustronnie","excludes":[234,351,352],"opis":null},"121":{"name":"folia mat dwustronnie","excludes":[],"opis":null},"122":{"name":"folia soft dwustronnie","excludes":[],"opis":null}}},"2":{"name":"Papier","sort":4,"options":{"20":{"name":"170g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"21":{"name":"170g kreda matowa","excludes":[97,98,99,100,101],"opis":null},"22":{"name":"250g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"23":{"name":"250g kreda matowa","excludes":[97,98,99,100,101],"opis":null},"26":{"name":"350g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"27":{"name":"350g kreda matowa","excludes":[97,98,99,100,101],"opis":null}}}}},"146":{"name":"21x28 cm","width":430,"height":290,"slope":5,"ID":146,"attributes":{"1":{"name":"Druk","sort":1,"options":{"34":{"name":"4+4","excludes":[],"opis":null}}},"9":{"name":"Uszlachetnienie","sort":13,"options":{"119":{"name":"brak","excludes":[],"opis":null},"120":{"name":"folia b\u0142ysk dwustronnie","excludes":[234,351,352],"opis":null},"121":{"name":"folia mat dwustronnie","excludes":[],"opis":null},"122":{"name":"folia soft dwustronnie","excludes":[],"opis":null}}},"2":{"name":"Papier","sort":4,"options":{"20":{"name":"170g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"21":{"name":"170g kreda matowa","excludes":[97,98,99,100,101],"opis":null},"22":{"name":"250g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"23":{"name":"250g kreda matowa","excludes":[97,98,99,100,101],"opis":null},"26":{"name":"350g kreda b\u0142yszcz\u0105ca","excludes":[97,98,99,100,101],"opis":null},"27":{"name":"350g kreda matowa","excludes":[97,98,99,100,101],"opis":null}}}}}}}]}]
            $.ajax({
    
                url: `${EDITOR_ENV.frameworkUrl}/ps_groups/` + Editor.productData[0].products[0].groupID + "/ps_types/" + Editor.productData[0].products[0].baseID + "/ps_calculate/calculatePublic",
                type: "POST",
                headers: {
                    "access-token": getCookie('access-token'),
                },
                data : {
    
                    amount: 1,
                    typeID: obj.typeID,
                    products:[{
    
                        typeID: obj.typeID,
                        formatID: obj.Format.formatID,
                        width: obj.Format.width,
                        height: obj.Format.height,
                        options: attributes,
                        pages: Editor.userProject.getAllPagesCount()
    
                    }],
                    volume:1,
                    currency:"PLN"
    
                },
                success: function( resp ){
    
                    var thickness = 0;
    
                    resp.products.map( ( elem ) => {
    
                        thickness += elem.thickness;
    
                    } );
    
                    window.testPages[0].coverHeight = thickness;
                    Editor.template.getTopMenuComponent().updatePrice( resp.calculation.price + "zł netto " );
                    //$('.price_val').html( resp.calculation.price + "zł netto " );
    
                }
    
    
            });

        }

    }

    function addToCart(){

        var obj =  Editor.userProject.getObj();

        if( !obj )
            return null;

        var products = [];
        
            for( var i=0; i < obj.projects.length; i++ ){

            var product = {
                typeID: obj.projects[i].typeID,
                formatID: obj.projects[i].Format.formatID,
                width: obj.projects[i].Format.width,
                height: obj.projects[i].Format.height,
                pages: Editor.userProject.getPagesCountForProduct( i )
            }

            var attributes = [];

            var selectedAttributes = Editor.template.productAttributes.getSelected()[i];

            for( var key in selectedAttributes ){
                
                if( key != 'typeID' ){
    
                    attributes.push(
    
                        {
                            'attrID' : key,
                            'optID' : selectedAttributes[ key ]
                        }
    
                    );
    
                }
    
            }

            product['options'] = attributes;

            products.push( product );

        }

        $.ajax({

            url: `${EDITOR_ENV.frameworkUrl}/ps_groups/` + Editor.productData[0].products[0].groupID + "/ps_types/" + Editor.productData[0].products[0].baseID + "/ps_calculate/saveCalculationPublic",
            type: "POST",
            headers: {
                "access-token": getCookie('access-token'),
            },
            data : {
                
                amount: 1,
                typeID: Editor.getProductId(),
                products: products,
                volume:1,
                currency:"PLN",
                projectID: Editor.userProject.getID(),

            },
            
            success: function( resp ){

                var cart_url = resp.cartUrl;

                if( resp.response ){

                    $.ajax({
                       type: 'POST',
                       url: `${EDITOR_ENV.authUrl}/cart/add?domainName=` + window.location.hostname.replace('edytor.', ''),
                       data: {
                           calcID: resp.calcID,
                           orderID: resp.orderID,
                           productID: resp.productID
                       },
                       headers: {
                           "access-token": getCookie('access-token'),
                       },
                       success: function( response  ){

                           window.location = 'https://' + window.location.hostname.replace('edytor.', '') + cart_url;

                       }

                   });


                }else {

                    alert('Nie udało się dodać do koszyka, skontaktuj się z administratorem.');

                }

            }


        });

    }

	function userImagesUpload( files ){

        var first = true;

        var i=0;

        var images = files.length;

        var ima = 0;

        var toUpload = 0;

       	for( var i=0; i < images; i++ ){

       		toUpload += files[i].size;

       	}

        var imagesContent = document.getElementById('imagesList');

        var actualFile = 0;

        var generatedMin = 0;

        if( $('.projectPhotosCounter').attr('count') ){

            var current = $('.projectPhotosCounter').attr('count');
            $('.projectPhotosCounter').attr('count', parseInt( parseInt(current) + parseInt( images ) ) );
            $('.projectPhotosCounter').html( 'Zdjęć: ' + (parseInt(current) + images) );

        }else {

            $('.projectPhotosCounter').attr('count', images );
            $('.projectPhotosCounter').html( 'Zdjęć: ' + parseInt(images) );

        }

        if( $('.miniaturesInfo .uploadInfoLoaderText').html() == "" ){

            $('.miniaturesInfo .uploadInfoLoaderText').html( generatedMin +"/" + images ).attr('allImages', images);
            $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', toUpload );

        }
        else {

            var inner = $('.miniaturesInfo .uploadInfoLoaderText').html( ).split('/');
            $('.miniaturesInfo .uploadInfoLoaderText').html( inner[0] + '/' + (inner[1] + images) );

            var beforeToUpload = $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload');
            $('.uploadingInfo .uploadInfoLoaderText').attr('to-upload', ( parseInt(beforeToUpload)+parseInt(toUpload)) );

        }

        var url = null;

        var _image = safeImage();

        var upload_image = function(){

            url = URL.createObjectURL( files[actualFile] );
            _image.src = url;

            var isSVG = false;

            if( files[actualFile].name.indexOf('.svg') > -1 ){
              isSVG = true;
            }

            var loadedImage = new createjs.Bitmap( _image );

            loadedImage.image.onload = function(){

      				URL.revokeObjectURL( url );
      				url = null;

              if( isSVG ){

                loadedImage.origin = loadedImage.getBounds();

                var bitmap = new createjs.Bitmap( loadedImage );

                bitmap.x = 900/2;
                bitmap.y = 400/2;
                var aspect = loadedImage.origin.width/loadedImage.origin.height;
                bitmap.scaleX = Editor.settings.thumbSize * aspect * 1/loadedImage.origin.width;
                bitmap.scaleY = Editor.settings.thumbSize * 1/loadedImage.origin.height;
                bitmap.regX = loadedImage.origin.width/2;
                bitmap.regY = loadedImage.origin.height/2;
                bitmap.name = files[actualFile].name;

                bitmap.trueWidth = loadedImage.origin.width;
                bitmap.trueHeight = loadedImage.origin.height;

                bitmap.regX = bitmap.trueWidth/2;
                bitmap.regY = bitmap.trueHeight/2;

                var projectImage = new ProjectImage();
                projectImage.editor = Editor;
                projectImage.thumbnail = loadedImage;
                projectImage.minUrl = loadedImage;
                projectImage.waitingForUpload = true;
                Editor.userProject.increaseImageCounter();

                projectImage.initForUser( files[actualFile], loadedImage, loadedImage, loadedImage.origin.width,  loadedImage.origin.height, loadedImage.origin.width, loadedImage.origin.height, Editor.userProject.getImageCounter() );

                projectImage.minSize = { width: loadedImage.origin.width, height: loadedImage.origin.height };
                projectImage.thumbSize = { width: loadedImage.origin.width, height: loadedImage.origin.height };
                Editor.userProject.addProjectImage( projectImage );
                imagesContent.appendChild( projectImage.html );

                Editor.webSocketControllers.userProject.addPhoto( projectImage.uid, Editor.userProject.getID(), files[actualFile].name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                Editor.uploader.addItemToUpload( projectImage );
                Editor.uploader.upload();
                generatedMin++;
                $('.miniaturesInfo .uploadInfoLoaderText').html( generatedMin +"/" + images ).attr('allImages', images);
                $('.miniaturesInfo .uploadInfoLoaderProgress').width( (generatedMin/images)*100 + "%" );


                if( generatedMin == images ){

                  $('.miniaturesInfo').addClass('hidden');

                  var imagesHeight = $('#imagesContent').height() - $("#imagesContent .containerButtons").outerHeight() - $("#imageLoaderInfo").outerHeight() - 20;
                  $("#imagesListScroll").height( imagesHeight );

                }else {

                  var imagesHeight = $('#imagesContent').height() - $("#imagesContent .containerButtons").outerHeight() - $("#imageLoaderInfo").outerHeight() - 20;
                  $("#imagesListScroll").height( imagesHeight );
                  $('.miniaturesInfo').removeClass('hidden');

                }

                projectImage.addEventListener( 'uploaded', function( data ){


                  var projectImage = data.target;

                  var dataToUpload = {

                    projectImageUID : projectImage.uid,
                    minUrl : projectImage.miniatureUrl,
                    thumbnail : projectImage.thumbnail,
                    imageUrl : projectImage.imageUrl,
                    uploadID : projectImage.uploadID

                  };

                  Editor.webSocketControllers.projectImage.update( dataToUpload );

                });

                if( actualFile < images-1 ){

                  actualFile++;
                  upload_image();
                  ima++;

                }

              }else {

                loadedImage.origin = loadedImage.getBounds();
                loadedImage.scale = {
                  x : loadedImage.origin.width,
                  y : loadedImage.origin.height
                };

                var obrazek = Editor.ThumbsMaker.generateThumb( loadedImage );
                var bitmap = new createjs.Bitmap( obrazek.min );

                bitmap.image.onload = function(){

                  var origin = bitmap.getBounds();
                  bitmap.x = 900/2;
                  bitmap.y = 400/2;
                  var aspect = origin.width/origin.height;
                  bitmap.scaleX = Editor.settings.thumbSize * aspect * 1/origin.width;
                  bitmap.scaleY = Editor.settings.thumbSize * 1/origin.height;
                  bitmap.regX = this.width/2;
                  bitmap.regY = this.height/2;
                  bitmap.name = files[actualFile].name;

                  bitmap.trueWidth = obrazek.width = obrazek.width;
                  bitmap.trueHeight = obrazek.height = obrazek.height;

                  bitmap.regX = bitmap.trueWidth/2;
                  bitmap.regY = bitmap.trueHeight/2;

                  var projectImage = new ProjectImage();
                  projectImage.editor = Editor;
                  projectImage.thumbnail = obrazek.thumb;
                  projectImage.minUrl = obrazek.min;
                  projectImage.waitingForUpload = true;
                  Editor.userProject.increaseImageCounter();

                  projectImage.initForUser( files[actualFile], obrazek.min, obrazek.thumb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height, Editor.userProject.getImageCounter() );

                  projectImage.minSize = obrazek.minSize;
                  projectImage.thumbSize = obrazek.thumbSize;
                  Editor.userProject.addProjectImage( projectImage );
                  imagesContent.appendChild( projectImage.html );

                  Editor.webSocketControllers.userProject.addPhoto( projectImage.uid, Editor.userProject.getID(), files[actualFile].name, 'Bitmap', null, null, null, projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                  Editor.uploader.addItemToUpload( projectImage );
                  Editor.uploader.upload();
                  generatedMin++;
                  $('.miniaturesInfo .uploadInfoLoaderText').html( generatedMin +"/" + images ).attr('allImages', images);
                  $('.miniaturesInfo .uploadInfoLoaderProgress').width( (generatedMin/images)*100 + "%" );


                  if( generatedMin == images ){

                    $('.miniaturesInfo').addClass('hidden');

                    var imagesHeight = $('#imagesContent').height() - $("#imagesContent .containerButtons").outerHeight() - $("#imageLoaderInfo").outerHeight() - 20;
                    $("#imagesListScroll").height( imagesHeight );

                  }else {

                    var imagesHeight = $('#imagesContent').height() - $("#imagesContent .containerButtons").outerHeight() - $("#imageLoaderInfo").outerHeight() - 20;
                    $("#imagesListScroll").height( imagesHeight );
                    $('.miniaturesInfo').removeClass('hidden');

                  }

                  projectImage.addEventListener( 'uploaded', function( data ){

                    var projectImage = data.target;

                    var dataToUpload = {

                      projectImageUID : projectImage.uid,
                      minUrl : projectImage.miniatureUrl,
                      thumbnail : projectImage.thumbnail,
                      imageUrl : projectImage.imageUrl,
                      uploadID : projectImage.uploadID

                    };

                    Editor.webSocketControllers.projectImage.update( dataToUpload );

                  });

                  if( actualFile < images-1 ){

                    actualFile++;
                    upload_image();
                    ima++;

                  }

                  else {

                    //fileReader = null;

                  }
                };

              }


            };

        }

        upload_image();

	};



	return {

    calculatePrice : calculatePrice,
    userImagesUpload : userImagesUpload,
    addToCart : addToCart

	}

}

export {services};
