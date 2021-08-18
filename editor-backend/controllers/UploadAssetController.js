var path = require('path');
var fs = require('fs');
var dateFormat = require('dateformat');
var sharp = require('sharp');
var ProjectImage = require('../models/ProjectImage.js').model;
var mainConf = require('../libs/mainConf.js');
var Upload = require('../models/Upload.js').model;
var Q = require('q');
var jwt = require('jsonwebtoken');
var jwt_secret = mainConf.jwt_secret;
var adminAssetsPath = '/admin-assets/';

class UploadHelper {

  constructor (){

    this.baseAdminAssetDirectory = GLOBAL.conf.staticDir + 'adminAssets/';
    this.staticPath = GLOBAL.conf.staticPath;
    this.maxFolderSize = 600;

  }

  createThumbFromImage( imagePath ){
    
  }

  createDirectory( path ){

    if( fs.existsSync( path ) ){


    }else {

      var pathPices = path.split('/');
      var currentPath = pathPices[0];

      for( var i=1; i<= pathPices.length ;i++){

        console.log( "Aktualna ścieżka: " + currentPath );
        if( !fs.existsSync( currentPath )  && currentPath.length > 0 ){

          console.log( "budowanie foldera ścieżka: " + currentPath );
          fs.mkdirSync( currentPath );

        }

        currentPath += '/' + pathPices[i];

      }


    }


  }

  getFolderToUpload( dateFolder ){

    var dateFolderSize = this.checkFolderSize( this.baseAdminAssetDirectory + dateFolder );

    if( dateFolderSize == 0 ){

      fs.mkdirSync( this.baseAdminAssetDirectory + dateFolder + '/0' );
      
      return {
        localPath: this.baseAdminAssetDirectory + dateFolder + '/0',
        urlPath: this.staticPath + '/adminAssets/' +  dateFolder + '/0'
      }

    }else {

      var assetFolderSize = this.checkFolderSize( this.baseAdminAssetDirectory + dateFolder + '/' + (dateFolderSize -1) );

      if( assetFolderSize > this.maxFolderSize ){

        fs.mkdirSync( dateFolder + '/' + dateFolderSize );

        return {
          localPath: this.baseAdminAssetDirectory + dateFolder + '/' + dateFolderSize,
          urlPath: this.staticPath + '/adminAssets/' +  dateFolder + '/' + dateFolderSize
        }

      }else {

        return {
          localPath: this.baseAdminAssetDirectory+ dateFolder + '/' + (dateFolderSize-1),
          urlPath: this.staticPath + '/adminAssets/' +  dateFolder + '/' + (dateFolderSize-1)
        }

      }

    }

  }

  checkFolderSize( folderPath ){

    return fs.readdirSync( folderPath ).length;

  }

  prepareAdminAssetPath(){

    var date = new Date( Date.now() );
    var day =date.getDay();
    var month =date.getMonth();
    var year =date.getFullYear();

    var assetDateDir = this.baseAdminAssetDirectory + day + '-' + month + '-' + year;

    if( !fs.existsSync( assetDateDir ) ){

      this.createDirectory( assetDateDir );

    }

    var uploadFolderPath = this.getFolderToUpload( day + '-' + month + '-' + year );
    return uploadFolderPath;

  }

}

var fsHelper = new UploadHelper();

class UploadAssetController {

  constructor( app ){

    this.app = app;

    this.initRouting();

  }

  initRouting(){

    this.uploadAdminImageAsset();

  }

  uploadAdminImageAsset(){

    var _this = this;

    this.app.post('/uploadAdminImageAsset/', (req, res) => {
    	 /**
    	 * Upload zdjęcia do projektu (admin)
    	 */
      this.saveAdminImageAsset( req ).then(
        ( uploadDataObject ) => {

          res.send( uploadDataObject );
        },
        ( error ) => {
          res.status(500).send();
        }
      );

    });


  }

  
  copyAndResize( width, height, path, mainFilePath ){
    
    var def = Q.defer();

    sharp( mainFilePath )
    .resize(  width, height )
    .toFile( path, function( err){

      if( err ){
        console.log( err );
        def.reject( err );
      }else {
        def.resolve();
      }

    });

    return def.promise;

  }

  saveAdminImageAsset( request ){

    var def = Q.defer();

    var assetPaths = fsHelper.prepareAdminAssetPath();

    console.log( request.files );
    var filePath = request.files.userFile.path;
    var fileFullName = request.files.userFile.name;
    var minCreated, thumbCreated;
    minCreated = thumbCreated = false;
    var randomName = Math.floor( Math.random()*100000 );

    fs.rename(
      filePath,
      assetPaths.localPath + '/' +randomName + fileFullName,
      ( err ) => {

        if( err ){
          console.log( err );
        }else {

          var mainFilePath = assetPaths.localPath + '/' +randomName + "" + fileFullName;
          var mainFileURL = assetPaths.urlPath + '/' +randomName + "" + fileFullName;
          var minFilePath, minFileURL, thumbFilePath, thumbFileURL;

          if( fileFullName.indexOf('.svg') > -1 ){

            var newUpload = new Upload({
              url: mainFileURL,
              minUrl: mainFileURL,
              thumbUrl: mainFileURL,
              type: 'admin',
              files: [
                mainFilePath
              ]
            });

            newUpload.save( function( err, saved ){
  
              if( err ){
                console.log( err );
                def.reject( err );
              }else {

                def.resolve( saved.toJSON() );
              }
  
            });

          }else {

            var thumbSize = JSON.parse( request.body.thumbSize );
            var minSize = JSON.parse( request.body.minSize );

            thumbFileURL = assetPaths.urlPath + '/thumb_' +randomName + "" + fileFullName;
            var thumb_destination = assetPaths.localPath + '/thumb_' +randomName + "" + fileFullName;
            this.copyAndResize( thumbSize.width, thumbSize.height, thumb_destination, mainFilePath )
            .then(
              function(){
                thumbCreated= true;
                checkDone();
              },
              function( err  ){
                console.log( err );
              }
            )
            
            minFileURL = assetPaths.urlPath + '/min_' +randomName + "" + fileFullName;
            var min_destination = assetPaths.localPath + '/min_' +randomName + "" + fileFullName;
            this.copyAndResize( minSize.width, minSize.height, min_destination, mainFilePath )
            .then(
              function(){
                minCreated= true;
                checkDone();
              },
              function( err  ){
                console.log( err );
              }
            )

            function checkDone(){

              if( thumbCreated && minCreated ){
                
                var newUpload = new Upload({
                  url: mainFileURL,
                  minUrl: minFileURL,
                  thumbUrl: thumbFileURL,
                  type: 'admin',
                  files: [
                    mainFilePath,
                    min_destination,
                    thumb_destination
                  ]
                });

                newUpload.save( function( err, saved ){
      
                  if( err ){
                    console.log( err );
                    def.reject( err );
                  }else {

                    def.resolve( saved.toJSON() );
                  }
      
                });

        
              }
            }
            

          }

        }

      }
    )

    return def.promise;

  }

}

module.exports = UploadAssetController;