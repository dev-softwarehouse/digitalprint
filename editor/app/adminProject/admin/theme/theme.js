import {ProjectImage} from '../../../class/ProjectImage';
    /**
    * Klasa odpowiadająca za motyw, trzeba to wyciągnąć do Edytor.theme, aktualnie jest w Editor.adminProject.format.theme, co jest bez sensu
    *
    * @class Theme
    */
    class Theme {


        constructor( editor ){

            this.editor = editor;
            this.currentTheme = null;
            this.id = null;
            this.parentThemeID = null;
            this.themeImages = null;
            this.themeBackgrounds = null;
            this.themeCliparts = null;
            this.usedPages = {

                copiedPages : [],
                mainPages : [],
                localPages : []

            };

        }

        updatePhotos ( place, photos ){

            if( place == 'themeImagesPhotos' )
                this.themeImages = [];
            else if( place == 'themeImagesBackgrounds' )
                this.themeBackgrounds = [];
            else if( place == 'themeCliparts' )
                this.themeCliparts = [];


            for( var i=0; i < photos.length; i++ ){

                var _data = photos[i];
                var projectImg = new ProjectImage( _data.uid, _data._id );
                projectImg.editor = this.editor;
                projectImg.minUrl = _data.minUrl;
                projectImg.thumbnail = _data.thumbnail;
                projectImg.imageUrl = _data.imageUrl;
                projectImg.initForTheme( null, _data.minUrl, _data.thumbnail, _data.trueWidth, _data.trueHeight, _data.width, _data.height );

                if( place == 'themeImagesPhotos' )
                    themeImages.push( projectImg );
                else if( place == 'themeImagesBackgrounds' )
                    themeBackgrounds.push( projectImg );
                else if( place == 'themeCliparts' )
                    themeCliparts.push( projectImg );

            }

            this.editor.templateAdministration.updateThemeImages();

        }

        init ( themeId ){

            this.editor.webSocketControllers.theme.get( themeId, function( data ){

                //console.log( data );
                //console.log(')(()()(__________________________________))');

                $('.editingInfo .themeInfo .content').html( data.name );
                // inicjalizacja motywu dla obiektu react


                this.id = data._id;
                this.parentThemeID = data.MainTheme._id;
                this.usedPages = data.usedPages;
                this.themeImages = {};
                this.themeBackgrounds = {};
                this.themeCliparts = {};

                for( var i=0; i < data.MainTheme.ProjectPhotos.length; i++ ){

                    var _data = data.MainTheme.ProjectPhotos[i];
                    var projectImg = new ProjectImage( _data.uid, _data._id );
                    projectImg.editor= this.editor;
                    projectImg.imageUrl = _data.imageUrl;
                    projectImg.initForTheme( null, _data.minUrl, _data.thumbnail, _data.trueWidth, _data.trueHeight, _data.width, _data.height );
                    this.themeImages[_data.uid ] = projectImg;

                    // adsgaskjdjkl
                }

                data.MainTheme.ProjectBackgrounds.forEach(_data=>{
                    const projectImg = new ProjectImage( _data.uid, _data._id );
                    projectImg.editor = this.editor;
                    projectImg.imageUrl = _data.imageUrl;
                    projectImg.initForTheme( null, _data.minUrl, _data.thumbnail, _data.trueWidth, _data.trueHeight, _data.width, _data.height );
                    this.themeBackgrounds[ _data.uid ] = projectImg;
                })

                for( var i=0; i < data.MainTheme.ProjectCliparts.length; i++ ){

                    var _data = data.MainTheme.ProjectCliparts[i];
                    var projectImg = new ProjectImage( _data.uid, _data._id );
                    projectImg.editor = this.editor;
                    projectImg.minUrl = _data.minUrl;
                    projectImg.thumbnail = _data.thumbnail;
                    projectImg.imageUrl = _data.imageUrl;
                    projectImg.initForTheme( null, _data.minUrl, _data.thumbnail, _data.trueWidth, _data.trueHeight, _data.width, _data.height );
                    this.themeCliparts[ _data.uid ] = projectImg;

                }

                this.editor.templateAdministration.updateThemePages( this.parentThemeID, this.id, this.usedPages );
                this.editor.templateAdministration.updateThemeImages();

            }.bind( this ));
            // tutaj trzeba zrobić pobranie informacji o motywie i go zaktualizować
            // tego jeszcze nima!!!

        }


        getThemeId (){

            return this.currentTheme.id;

        }

        getID (){

            return this.id;

        }

        updateThemePages ( themePages ){
            //console.log( themePages);
            //console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
            this.editor.templateAdministration.updateThemePages( this.themePages );

        }

        getProjectImages(){

            return this.themeImages;

        }


        getParentThemeID(){

            return this.parentThemeID;

        }

        addCopiedPage ( page ){

            this.usedPages.copiedPages.push( page );

        }

        addLocalPage ( page ){

            this.usedPages.localPages.push( page );

        }

        addMainThemePage ( page ){

            this.usedPages.mainPages.push( page );

        }

        getProjectBackgrounds (){

            return this.themeBackgrounds;

        }

        getProjectCliparts (){

            return this.themeCliparts;

        }

        addProjectPhoto ( projectImage ){

            this.themeImages[ projectImage.uid ] = projectImage;

        }


        addProjectClipart ( projectImage ){

            this.themeCliparts[ projectImage.uid ] = projectImage;

        }

        addProjectBackground ( projectImage ){

            this.themeBackgrounds[ projectImage.uid ] = projectImage;

        }


        updateProjectPhoto ( data ){



        }

    }

export {Theme};
