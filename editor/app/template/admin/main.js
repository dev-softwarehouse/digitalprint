import UserPagePreview from "./../UserPagePreview";
import ProductAttributes from "./../ProductAttributes";
import React from "react";
import ReactDOM from "react-dom";
import _ from 'lodash';
import {ProjectImage} from './../../class/ProjectImage';
import {EditorSettings} from "./../../class/EditableAreaSettings.js";
import AssetContainer from "./../Assets.js";
    /**
    * Moduł zarządzający wyglądem edytora, odpowiada za stworzenie odpowiednich bloków, nie są one tutaj uzupełniane.
    * Tym zajmuje się templateAdministration
    *
    * @module templateModule_admin
    */

    class TemplateModule {

        constructor( editor ){

            this.editor = editor;
            this.topMenuHeight = 80;
            this.menuDuration = 500;
            this.helperDuration = 300;
            this.elements = ( function() {

                    var Editor = editor;

                    var proposedTemplate = function( data ){

                        var elem = document.createElement('li');

                        elem.className = 'proposedTemplateElement';
                        elem.style.backgroundImage = 'url('+ (EDITOR_ENV.staticUrl+data.url) +')';
                        elem.setAttribute('id', data._id);

                        return elem;

                    };

                    var proposedTemplateCountSelector = function( title, proposedPositions ){

                        var Editor = this.editor;
                        var elem = document.createElement('div');
                        elem.className = 'proposedPositionsImagesCountContainer';

                        var label = document.createElement('div');
                        label.className = 'title';
                        label.innerHTML = title;

                        var arrow = document.createElement('span');

                        label.appendChild( arrow );

                        var container = document.createElement('div');
                        container.className = 'proposedPositionsContainer';

                        for( var i=0; i< proposedPositions.length; i++ ){

                            container.appendChild( Editor.template.elements.proposedTemplate( proposedPositions[i] ) );

                        }

                        label.addEventListener('click', function( e ){

                            e.stopPropagation();

                            var parent = label.parentNode;

                            if( $(parent).hasClass('closed') ){

                                $(parent).removeClass('closed').addClass('open');
                                container.style.height = container.getAttribute('cust-height') + 'px';

                            }else {

                                $(parent).removeClass('open').addClass('closed');
                                container.style.height = 0;

                            }

                        });

                        elem.appendChild( label );
                        elem.appendChild( container );


                        return elem;

                    };

                    var userThemePage = function( data ){

                        var elem = document.createElement('div');
                        elem.className = 'userThemePage' + ( ( data.vacancy ) ? ' vacancy':' noVacancy' ) ;
                        elem.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+data.url + ')';
                        elem.setAttribute( 'theme-page-id', data._id );

                        var elemName = document.createElement('div');
                        elemName.className = 'title';
                        elemName.innerHTML = data.name;

                        elem.appendChild( elemName );

                        return elem;

                    };

                    return {

                        editor : Editor,
                        proposedTemplate : proposedTemplate,
                        userThemePage : userThemePage,
                        proposedTemplateCountSelector : proposedTemplateCountSelector

                    }

            })();


        }


        projectThemeBlock ( theme ){

            var elem = document.createElement('div');
            //elem.className = 'themeBlock';

            return elem;

        }


        displayWindow ( id, settings, withoutClose ){

            var Editor = this.editor;
            // funkcja inicjalizująca obiekty w oknie
            var windowElement = document.createElement('div');
            windowElement.id = id;
            windowElement.className = 'modal bs-example-modal-sm '+settings.size;
            windowElement.setAttribute( 'role', 'dialog' );
            windowElement.setAttribute( 'aria-labelledby', 'mySmallModalLabel' );
            windowElement.setAttribute( 'aria-hidden', 'true' );

            var windowModal = document.createElement('div');
            windowModal.className = 'modal-dialog modal-lg';

            var windowModalContent = document.createElement('div');
            windowModalContent.className = 'modal-content';

            var header = document.createElement('div');
            header.className = 'modal-header';

            if( withoutClose == true ){

              header.innerHTML = '<h4 class="modal-title" id="exampleModalLabel">'+settings.title+'</h4>';

            }else {

              header.innerHTML = '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="exampleModalLabel">'+settings.title+'</h4>';

            }

            var body = document.createElement('div');
            body.className = 'modal-body';

            var footer = document.createElement('div');
            footer.className = 'modal-footer';

            windowElement.appendChild( windowModal );
            windowModal.appendChild( windowModalContent );
            windowModalContent.appendChild( header );
            windowModalContent.appendChild( body );

                if( settings.content && typeof settings.content !== 'string' ){

                    body.appendChild( settings.content );

                }
                else {

                    body.innerHTML = settings.content;

                }

            windowModalContent.appendChild( footer );

            if( settings.footer ){
                if( settings.footer && typeof settings.footer !== 'string' ){

                    footer.appendChild( settings.footer );

                }
                else {

                    footer.innerHTML += settings.footer;

                }
            }


            return windowElement;

        }


        createNewProject(){

            var Editor = this.editor;
            var body = ' <form>\
                            <div class="form-group">\
                                <input type="text" class="form-control" id="project-name" placeholder="Nazwa projektu">\
                            </div>\
                        </form>';

            var footer = '<div id="avatarPreview"><img src="" id="filePreview-adminAvatar" /></div>\
                            <div id="avatarIconLabel">Wybierz miniaturkę projektu: (*zalecany rozmiar to 155x135 pikseli)</div>\
                            <div id="avatarLoaderInput"><input type="file" multiple class="button-fw inputHidden absolutePos" id="addMiniatureToAdminProject"></input></div>\
                             <div class="modal-footer">\
                                <button type="button" id="addNewAdminProject" class="btn btn-primary" data-dismiss="modal">Dodaj</button>\
                            </div>';



            var smallWindow = this.displayWindow(

                'createNewProject-window',
                {
                    size : 'small',
                    title : 'Dodaj nowy projekt',
                    content : body,
                    footer : footer
                }
            );

            $('body').append( smallWindow );
            $( "#zoomSlider" ).slider( { value: "1.0"} );

            $('input#addMiniatureToAdminProject').on('change', function(e){

                var file = e.target.files[0];
                var url = URL.createObjectURL( file );
                var loadedImage = new createjs.Bitmap( url );

                loadedImage.image.onload = function(){
                    loadedImage.origin = loadedImage.getBounds();
                    var obrazek = Editor.ThumbsMaker.generateThumb( loadedImage );

                    $("#filePreview-adminAvatar").attr( 'src', obrazek.min );

                }

            });



            $('#createNewProject-window').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#createNewProject-window').modal({

                keyboard: false,
                backdrop: 'static'

            });

        }


        loadProposedTemplate ( generatedObject ){

            var Editor = this.editor;
            var body = '<div class="proposed-template-preview">\
                            <div class="col-xs-6">\
                                <h3>Oryginalny:</h3>\
                                '+ generatedObject.orginalImg +'\
                            </div>\
                            <div class="col-xs-6">\
                                <h3>Dopasowany:</h3>\
                                '+ generatedObject.img +'\
                            </div>\
                        </div>';

            var footer = '<button id="manualSet">Wczytaj szablon do obszaru roboczego</button>';

            var smallWindow = this.displayWindow(

                'loadProposedTemplate-preview',
                {

                    size    : 'small',
                    title   : 'Podgląd dopasowanego szablonu',
                    content : body,
                    footer  : footer

                }

            );

            var templateObject = {

                ProposedImages : [],
                ProposedTexts  : []

            };

            for( var i=0; i < generatedObject.objects.length; i++ ){

                if( generatedObject.objects[i].type == 'Image' ){

                    templateObject.ProposedImages.push( generatedObject.objects[i] );

                }
                else if( generatedObject.objects[i].type == 'Text' ) {

                    templateObject.ProposedTexts.push( generatedObject.objects[i] );

                }

            }


            $('body').append( smallWindow );

            $('#manualSet').on('click', function( e ){

                e.stopPropagation();

                generatedObject.editableArea.loadTemplate( templateObject );
                $('#loadProposedTemplate-preview').remove();
                $('#allProposedTemplates').remove();

            });

            $('#loadProposedTemplate-preview').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#loadProposedTemplate-preview').modal({

                keyboard: false,
                backdrop: 'static'

            });

        }


        selectComplexProductAttibutes (){

            var Editor = this.editor;
            var div = document.createElement('div');
            div.id = 'complexProductList';
            div.innerHTML = '<div id="productsGroup"></div><div id="confirm">Wybierz</div>';

            $("#attributesSelector").append( div );

            for( var i=0; i< Editor.complexAdminProject.getProductGroups().length; i++ ){

                document.getElementById('productsGroup').appendChild(
                    Editor.complexAdminProject.getSelectsForProductGroup( i )
                );

            };

            document.getElementById('confirm').addEventListener('click', function( e ){

                var complexProductSettings = {

                    id : Editor.getProductId(),
                    groups : {}

                }

                var productsGroupsElements = $('.productGroup');

                for( var i=0; i < productsGroupsElements.length; i++ ){

                    var groupID = productsGroupsElements[i].getAttribute('group-id');

                    var productID = $( productsGroupsElements[i] ).children('.product').children('select').val();

                    var formatID = $( productsGroupsElements[i] ).children('.productSelects').children('.formatLabel').children('select').val();

                    complexProductSettings.groups[ groupID ] = { productID : productID };

                    complexProductSettings.groups[ groupID ].formatID =  formatID;

                    // trzeba jeszcze dodać attrybuty

                }

            });

        }


        selectComplexProducts (){

            var Editor = this.editor;
            var div = document.createElement('div');
            div.id = 'complexProductList';
            div.innerHTML = '<div id="productsGroup"></div><div id="confirm">Wybierz</div>';

            $('body').append( div );

            for( var i=0; i< Editor.complexAdminProject.getProductGroups().length; i++ ){

                document.getElementById('productsGroup').appendChild(
                    Editor.complexAdminProject.getSelectsForProductGroup( i )
                );

            };

            document.getElementById('confirm').addEventListener('click', function( e ){

                var complexProductSettings = {

                    id : Editor.getProductId(),
                    groups : {}

                }

                var productsGroupsElements = $('.productGroup');

                for( var i=0; i < productsGroupsElements.length; i++ ){

                    var groupID = productsGroupsElements[i].getAttribute('group-id');

                    var productID = $( productsGroupsElements[i] ).children('.product').children('select').val();

                    var formatID = $( productsGroupsElements[i] ).children('.productSelects').children('.formatLabel').children('select').val();

                    complexProductSettings.groups[ groupID ] = { productID : productID };

                    complexProductSettings.groups[ groupID ].formatID =  formatID;

                    // trzeba jeszcze dodać attrybuty

                }

            });

        }


        editableAreaSettingsForm ( areaInstance ){

            if( areaInstance.settings && areaInstance.settings.vacancy ){

                vacancy.checked = true;

            }
            else {


            }

            if( areaInstance.settings && areaInstance.settings.spread ){

                spread.checked = true;

            }else{

                spread.checked = false;

            }

            return formBox;

        }


        loadingOverflow ( contentText ){

            var overflow = document.createElement('div');
            overflow.className = 'overflowloader';

            var content = document.createElement('div');
            content.className = 'overflow-content';
            content.innerHTML = contentText || '';

            overflow.appendChild( content );

            return overflow;

        }


        creatingProject (){

            document.body.appendChild( this.loadingOverflow( 'tworzenie projektu ...' ) );

        }


        themePageSettings ( themePage ){

            var Editor = this.editor;
            themePage.defaultSettings = themePage.defaultSettings || {};

            function createSettingsTools( order, options ){

                var row = document.createElement('div');
                row.className = 'row positionOption';
                row.setAttribute('order', order );

                var title = document.createElement('h4');
                title.innerHTML = 'Pozycja proponowana numer ' + order;

                // włączenie ramki tła
                var titleBackgroundFrameOnOff = document.createElement('div');
                titleBackgroundFrameOnOff.innerHTML = 'Włącz ramkę w tle';

                var onOffLabel = document.createElement('label');
                onOffLabel.setAttribute( 'order', order );

                var onOff = document.createElement('input');
                onOff.type = 'checkbox';
                onOff.className = 'switch';
                onOff.id = 'frameSwitch';
                onOff.setAttribute( 'order', order );

                if( options ){

                    onOff.checked = (( options.backgroundFrame ) ? "checked" : "");

                }else {

                    onOff.checked = "";

                }

                onOffdispl = document.createElement('div');
                onOffLabel.appendChild( onOff );
                onOffLabel.appendChild( onOffdispl );
                titleBackgroundFrameOnOff.appendChild( onOffLabel );

                var defaultBackgroundFrame = document.createElement('div');
                defaultBackgroundFrame.className = 'framePreview';
                defaultBackgroundFrame.setAttribute('data-type', 'background');
                defaultBackgroundFrame.setAttribute( 'order', order );

                if( options && options.backgroundFrameID ){

                    Editor.webSocketControllers.frameObject.get( options.backgroundFrameID, function( data ){

                        defaultBackgroundFrame.style.backgroundImage = "url("+ EDITOR_ENV.staticUrl+data.ProjectImage.thumbnail +")";

                    });

                    defaultBackgroundFrame.setAttribute('data-id', options.backgroundFrameID );

                }

                defaultBackgroundFrame.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.theme.getFullBackgroundFrames( Editor.adminProject.format.theme.getID(), function( data ){

                        var frameContent = document.createElement('div');
                        var footer = document.createElement('div');

                        var acceptButton = document.createElement('div');
                        acceptButton.innerHTML = 'Użyj';
                        acceptButton.className = 'button-fw';

                        acceptButton.addEventListener('click', function( e ){

                            e.stopPropagation();

                            var selected = frameContent.querySelector('.frameObj.selected');

                            var selectedInfo = {

                                id : selected.getAttribute('bf-ID'),
                                background : selected.style.backgroundImage

                            };

                            this.style.backgroundImage = selectedInfo.background;
                            this.setAttribute('data-id', selectedInfo.id );

                        }.bind( this ));

                        footer.appendChild( acceptButton );

                        var setFrameWindow = this.displayWindow(

                            'setBackgroundFrames',
                            {
                                title   : 'Wybierz ramkę',
                                content : frameContent,
                                footer  : footer
                            }

                        );

                        $('body').append( setFrameWindow );


                        $('#setBackgroundFrames').on( 'hidden.bs.modal', function(){

                            $(this).remove();

                        });

                        $('#setBackgroundFrames').modal({

                            keyboard: false,
                            backdrop: 'static'

                        });

                        for( var i=0; i<data.length; i++){

                            var elem = document.createElement('li');
                            elem.className = "frameObj";
                            elem.setAttribute( 'bf-ID', data[i]._id );

                            if( data[i].ProjectImage ){

                                elem.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+data[i].ProjectImage.thumbnail + ')';

                            }

                            frameContent.appendChild( elem );

                        }

                        frameContent.addEventListener('click', function( e ){

                            e.stopPropagation();

                            if( e.target.nodeName == 'LI' ){

                                var elems = frameContent.querySelectorAll('.frameObj');

                                for( var i=0; i < elems.length; i++ ){

                                    elems[i].removeClass('selected');

                                }

                                e.target.addClass('selected');

                            }

                        });

                    }.bind(this));

                });

                //----------- KONIEC włączenie ramki tła

                row.appendChild( title );
                row.appendChild( titleBackgroundFrameOnOff );
                row.appendChild( defaultBackgroundFrame );

                return row;

            }

            var body = document.createElement('div');

            var label = document.createElement('div');
            label.innerHTML = '<h3>Ustawienia domyślne</h3>';

            var settings = document.createElement( 'div' );

            var borderLabel = document.createElement('div');
            borderLabel.innerHTML = 'Szerokość ramki: ';

            var borderSpinner = document.createElement('input');
            borderSpinner.className = 'spinner';
            borderSpinner.value = themePage.defaultSettings.borderWidth || 0;
            borderLabel.appendChild( borderSpinner );


            var borderColorPickerLabel = document.createElement('label');
            borderColorPickerLabel.className = 'borderColorPickerLabel'
            borderColorPickerLabel.innerHTML = "Kolor ramki";

            var borderColor = document.createElement('input');
            borderColor.id = 'borderColor';
            borderColor.className = 'spinner cp-full';
            borderColor.value = themePage.defaultSettings.borderColor  || 'rgba(0,0,0,255)';

            borderColorPickerLabel.appendChild( borderColor );


            var titleShadowOnOff = document.createElement('div');
            titleShadowOnOff.innerHTML = 'Włącz cień';
            var onOffLabel = document.createElement('label');
            var onOff = document.createElement('input');
            onOff.type = 'checkbox';
            onOff.className = 'switch';
            onOff.checked = (( themePage.defaultSettings.dropShadow ) ? "checked" : "");
            var onOffdispl = document.createElement('div');
            onOffLabel.appendChild( onOff );
            onOffLabel.appendChild( onOffdispl );
            titleShadowOnOff.appendChild( onOffLabel );


            var shadowColorPickerLabel = document.createElement('label');
            shadowColorPickerLabel.className = 'shadowColorPickerLabel'
            shadowColorPickerLabel.innerHTML = "Kolor cienia";

            var shadowColor = document.createElement('input');
            shadowColor.id = 'shadowColor';
            shadowColor.className = 'spinner cp-full';
            shadowColor.value = themePage.defaultSettings.shadowColor || 'rgba(0,0,0,255)';

            shadowColorPickerLabel.appendChild( shadowColor );


            var shadowBlurLabel = document.createElement('div');
            shadowBlurLabel.innerHTML = 'Rozmycie cienia: ';

            var shadowBlurSpinner = document.createElement('input');
            shadowBlurSpinner.className = 'spinner';
            shadowBlurSpinner.value = themePage.defaultSettings.shadowBlur || 0;
            shadowBlurLabel.appendChild( shadowBlurSpinner );


            var shadowOffsetXLabel = document.createElement('div');
            shadowOffsetXLabel.innerHTML = 'Przesunięcie cienia X: ';

            var shadowOffsetXSpinner = document.createElement('input');
            shadowOffsetXSpinner.className = 'spinner';
            shadowOffsetXSpinner.value = themePage.defaultSettings.shadowOffsetX || 0;
            shadowOffsetXLabel.appendChild( shadowOffsetXSpinner );


            var shadowOffsetYLabel = document.createElement('div');
            shadowOffsetYLabel.innerHTML = 'Przesunięcie cienia Y: ';

            var shadowOffsetYSpinner = document.createElement('input');
            shadowOffsetYSpinner.className = 'spinner';
            shadowOffsetYSpinner.value = themePage.defaultSettings.shadowOffsetY || 0;
            shadowOffsetYLabel.appendChild( shadowOffsetYSpinner );

            var titleBackgroundFrameOnOff = document.createElement('div');
            titleBackgroundFrameOnOff.innerHTML = 'Włącz ramkę w tle';
            var onOffLabel2 = document.createElement('label');
            var onOff2 = document.createElement('input');
            onOff2.type = 'checkbox';
            onOff2.className = 'switch';
            onOff2.checked = (( themePage.defaultSettings.backgroundFrame ) ? "checked" : "");
            var onOffdispl2 = document.createElement('div');
            onOffLabel2.appendChild( onOff2 );
            onOffLabel2.appendChild( onOffdispl2 );
            titleBackgroundFrameOnOff.appendChild( onOffLabel2 );


            var defaultBackgroundFrame = document.createElement('div');
            defaultBackgroundFrame.className = 'framePreview';
            defaultBackgroundFrame.setAttribute('data-type', 'background');

            if( themePage.defaultSettings.backgroundFrameID ){

                Editor.webSocketControllers.frameObject.get( themePage.defaultSettings.backgroundFrameID, function( data ){

                    defaultBackgroundFrame.style.backgroundImage = "url("+ EDITOR_ENV.staticUrl+data.ProjectImage.thumbnail +")";

                });

                defaultBackgroundFrame.setAttribute('data-id', themePage.defaultSettings.backgroundFrameID );

            }

            defaultBackgroundFrame.addEventListener('click', function( e ){

                e.stopPropagation();

                Editor.webSocketControllers.theme.getFullBackgroundFrames( Editor.adminProject.format.theme.getID(), function( data ){

                    var frameContent = document.createElement('div');
                    var footer = document.createElement('div');

                    var acceptButton = document.createElement('div');
                    acceptButton.innerHTML = 'Użyj';
                    acceptButton.className = 'button-fw';

                    acceptButton.addEventListener('click', function( e ){

                        e.stopPropagation();

                        var selected = frameContent.querySelector('.frameObj.selected');

                        var selectedInfo = {

                            id : selected.getAttribute('bf-ID'),
                            background : selected.style.backgroundImage

                        };

                        this.style.backgroundImage = selectedInfo.background;
                        this.setAttribute('data-id', selectedInfo.id );

                    }.bind( this ));

                    footer.appendChild( acceptButton );

                    var setFrameWindow = this.displayWindow(

                        'setBackgroundFrames',
                        {
                            title   : 'Wybierz ramkę',
                            content : frameContent,
                            footer  : footer
                        }

                    );

                    $('body').append( setFrameWindow );


                    $('#setBackgroundFrames').on( 'hidden.bs.modal', function(){

                        $(this).remove();

                    });

                    $('#setBackgroundFrames').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });

                    for( var i=0; i<data.length; i++){

                        var elem = document.createElement('li');
                        elem.className = "frameObj";
                        elem.setAttribute( 'bf-ID', data[i]._id );

                        if( data[i].ProjectImage ){

                            elem.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+data[i].ProjectImage.thumbnail + ')';

                        }

                        frameContent.appendChild( elem );

                    }

                    frameContent.addEventListener('click', function( e ){

                        e.stopPropagation();

                        if( e.target.nodeName == 'LI' ){

                            var elems = frameContent.querySelectorAll('.frameObj');

                            for( var i=0; i < elems.length; i++ ){

                                elems[i].removeClass('selected');

                            }

                            e.target.addClass('selected');

                        }

                    });

                }.bind(this));

            });


            body.appendChild( label );
            body.appendChild( borderLabel );
            body.appendChild( borderColorPickerLabel );
            body.appendChild( titleShadowOnOff );
            body.appendChild( shadowColorPickerLabel );
            body.appendChild( shadowBlurLabel );
            body.appendChild( shadowOffsetXLabel );
            body.appendChild( shadowOffsetYLabel );
            body.appendChild( titleBackgroundFrameOnOff );
            body.appendChild( defaultBackgroundFrame );


            // Ustawienia czcionek
            var fontsSettings = document.createElement('div');
            fontsSettings.id = 'fontsSettings';

            var labelFonts = document.createElement('div');
            labelFonts.innerHTML = '<h3>Ustawienia czcionek</h3>';

            var currentFonts = document.createElement('div');
            currentFonts.className = 'col-2';
            var currentFontsLabel = document.createElement('h4');
            currentFontsLabel.innerHTML = 'Udostępnione czcionki';
            var cf_list = document.createElement('ul');
            cf_list.id = 'currentFontsList';
            currentFonts.appendChild( currentFontsLabel );
            currentFonts.appendChild( cf_list );

            var avaibleFonts = document.createElement('div');
            avaibleFonts.className = 'col-2';
            var avaibleFontsLabel = document.createElement('h4');
            avaibleFontsLabel.innerHTML = 'Wszystkie czcionki';
            var af_list = document.createElement('ul');
            af_list.id = 'avaibleFontsList';

            avaibleFonts.appendChild( avaibleFontsLabel );
            avaibleFonts.appendChild( af_list );

            fontsSettings.appendChild( labelFonts );
            fontsSettings.appendChild( currentFonts );
            fontsSettings.appendChild( avaibleFonts );

            body.appendChild( fontsSettings );


            var allFonts = this.editor.fonts.getFonts();
            //console.log( allFonts );
            //console.log('czy mam wszystkie czcionki ?');

            // Ustawienia pozycji proponowanych
            var proposedPositionSettings = document.createElement('div');
            proposedPositionSettings.id = 'proposedPositionSettings';


            var label2 = document.createElement('div');
            label2.innerHTML = '<h3>Ustawienia Pozycji proponowanych</h3>';

            var addReg = document.createElement('div');
            addReg.className = 'button-fw';
            addReg.innerHTML = 'Dodaj ustawienia pozycji proponowanych';

            addReg.addEventListener('click', function( e ){

                e.stopPropagation();

                body.appendChild( createSettingsTools( body.querySelectorAll('.positionOption').length ) );

            });

            proposedPositionSettings.appendChild( label2 );
            proposedPositionSettings.appendChild( addReg );

            body.appendChild( proposedPositionSettings );

            var footer = '<div id="themePageConfigSaveButton">\
                             <button type="button" class="btn btn-primary" data-dismiss="modal">Zapisz zmiany</button>\
                         </div>';

            var smallWindow = this.displayWindow(

                'themePageSettings-window',
                {
                    size : 'small',
                    title : 'Ustawienia strony motywu',
                    content : body,
                    footer : footer
                }

            );

            $('body').append( smallWindow );

            $( borderColor ).colorpicker({

                parts: 'full',
                showOn: 'both',
                buttonColorize: true,
                showNoneButton: true,
                alpha: true,
                select : function( e ){


                },

                colorFormat: 'RGBA'

            });

            $( shadowColor ).colorpicker({

                parts: 'full',
                showOn: 'both',
                buttonColorize: true,
                showNoneButton: true,
                alpha: true,
                select : function( e ){


                },

                colorFormat: 'RGBA'

            });

            $( borderSpinner ).spinner({

                min: 0,
                max: 1000,
                step: 1,

                spin: function( event ){



                },

                change: function( event ){



                }

            }).val(themePage.defaultSettings.borderWidth || 0);

            $( shadowBlurSpinner ).spinner({

                min: 0,
                max: 1000,
                step: 1,

                spin: function( event ){



                },

                change: function( event ){



                }

            }).val(themePage.defaultSettings.shadowBlur || 0);


            $( shadowOffsetXSpinner ).spinner({

                min: 0,
                max: 1000,
                step: 1,

                spin: function( event ){



                },

                change: function( event ){



                }

            }).val(themePage.defaultSettings.shadowOffsetX || 0);


            $( shadowOffsetYSpinner ).spinner({

                min: 0,
                max: 1000,
                step: 1,

                spin: function( event ){



                },

                change: function( event ){



                }

            }).val(themePage.defaultSettings.shadowOffsetY || 0);

            if( themePage.defaultSettings.proposedImagesOpt ){


                for( var i=0; i<themePage.defaultSettings.proposedImagesOpt.length; i++ ){

                    body.appendChild( createSettingsTools( i, themePage.defaultSettings.proposedImagesOpt[i] ) );

                }

            }


            $('#themePageSettings-window').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#themePageSettings-window').modal({

                keyboard: false,
                backdrop: 'static'

            });

            $('#themePageConfigSaveButton').on('click', function( e ){

                    e.stopPropagation();

                    var themePageID = themePage._id;

                    var settings = {

                        'borderWidth'       : borderSpinner.value,
                        'borderColor'       : borderColor.value,
                        'dropShadow'        : onOff.checked,
                        'shadowColor'       : shadowColor.value,
                        'shadowBlur'        : shadowBlurSpinner.value,
                        'shadowOffsetX'     : shadowOffsetXSpinner.value,
                        'shadowOffsetY'     : shadowOffsetYSpinner.value,
                        'backgroundFrame'   : onOff2.checked,
                        'backgroundFrameID' : defaultBackgroundFrame.getAttribute('data-id'),
                        'proposedImagesOpt' : []
                        //'backgroundFrameID' :

                    };

                    var options = document.body.querySelectorAll('.positionOption');

                    for( var i=0; i < options.length; i++ ){

                        var option = _.find( options, function( elem ){

                            if( elem.getAttribute('order') == i ){

                                return true;

                            }else {

                                return false;

                            }

                        });

                        var currentOptions = {

                            'backgroundFrame'   : option.querySelector('#frameSwitch').checked,
                            'backgroundFrameID' : option.querySelector('.framePreview').getAttribute('data-id'),

                        };



                        settings.proposedImagesOpt.push( currentOptions );

                    }

                    function callback( data ){

                        themePage.defaultSettings = data.defaultSettings;

                    }

                    Editor.webSocketControllers.themePage.setDefaultSettings( themePageID, settings, callback );

            });


        }


        editableAreaConfig ( areaInstance ){

            var Editor = this.editor;
            var body = document.createElement('div');

            var vacancyLabel = document.createElement('label');
            vacancyLabel.className = 'vacancyLabel';

            var vacancy = document.createElement('input');
            vacancy.id = 'pageWakatLeft';
            vacancy.type = 'checkbox';


            var siteBySiteLabel = document.createElement( 'label' );
            siteBySiteLabel.className = 'siteBySiteLabel';

            var siteBySite = document.createElement('input');
            siteBySite.id = 'siteBySite';
            siteBySite.type = 'radio';
            siteBySite.name = 'editableAreaConfigRadio';

            var centerfoldLabel = document.createElement('label');
            centerfoldLabel.className = 'centerfoldLabel';

            var pagesAmount = document.createElement('div');
            pagesAmount.className = 'pagesAmount';

            var pagesAmountLabel = document.createElement('label');
            pagesAmountLabel.className = 'pagesAmountLabel';

            var pagesAmountSpinner = document.createElement("input");
            pagesAmountSpinner.className = 'spinner';
            pagesAmountSpinner.value = 1;


            var centerfold  = document.createElement('input');
            centerfold.id = 'centerfoldIsOn';
            centerfold.type = 'radio';
            centerfold.name = 'editableAreaConfigRadio';

            vacancyLabel.appendChild( vacancy );
            siteBySiteLabel.appendChild( siteBySite );
            centerfoldLabel.appendChild( centerfold );
            pagesAmount.appendChild( pagesAmountSpinner );
            pagesAmount.appendChild( pagesAmountLabel );


            body.appendChild( centerfoldLabel );
            body.appendChild( siteBySiteLabel );
            body.appendChild( vacancyLabel );
            body.appendChild( pagesAmount );

            var footer = '<div id="editableAreaConfigSaveButton">\
                             <button type="button" class="btn btn-primary" data-dismiss="modal">Zapisz zmiany</button>\
                         </div>';

            var smallWindow =this.displayWindow(

                'editableAreaConfig-window',
                {
                    size : 'small',
                    title : 'Ustawienia strony w widoku',
                    content : body,
                    footer : footer
                }
            );


            $( pagesAmountSpinner ).spinner({


                min: 0,
                max: 1000,
                step: 1,

                spin: function( event ){



                },

                change: function( event ){



                }

            });




            $('body').append( smallWindow );


            $('#editableAreaConfig-window').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#editableAreaConfig-window').modal({

                keyboard: false,
                backdrop: 'static'

            });

            siteBySite.addEventListener("change", function() {

                if ( document.getElementById('siteBySite').checked == true ){

                    document.getElementById('pageWakatLeft').checked = false;

                    pagesAmountSpinner.value = 1;
                }

            });

            pageWakatLeft.addEventListener("change", function() {

                if ( document.getElementById('pageWakatLeft').checked == true ){

                    document.getElementById('siteBySite').checked = false;
                    document.getElementById('centerfoldIsOn').checked = true;

                     pagesAmountSpinner.value = 1;
                }

            });

            centerfold.addEventListener("change", function(){

                if ( document.getElementById('centerfoldIsOn').checked == true ){



                    pagesAmountSpinner.value = 2;
                }

            });

            $('#editableAreaConfigSaveButton').on('click', function(){

                    var data = {

                        'vacancy' : ( ( document.getElementById('pageWakatLeft').checked)? true : false ),
                        'spread' : ( ( document.getElementById('centerfoldIsOn').checked)? true : false ),
                        'pageValue' : ( ( parseInt(pagesAmountSpinner.value) ) )

                    };

                    Editor.webSocketControllers.page.update( data );

            });


            if( areaInstance.settings && areaInstance.settings.vacancy ){

                document.getElementById('pageWakatLeft').checked = true;
                document.getElementById('centerfoldIsOn').checked = true;

            }else if( areaInstance.settings && !areaInstance.settings.spread ){

                document.getElementById('siteBySite').checked = true;
                document.getElementById('pageWakatLeft').checked = false;
            }else if( areaInstance.settings && areaInstance.settings.spread ){

                document.getElementById('centerfoldIsOn').checked = true;

            }

        }


        /**
        * Generuje podgląd stron motywu głównego
        *
        * @method mainThemePagesPreview
        * @param {Object} pages Tablica stron motywu
        */
        mainThemePagesPreview ( pages ){

            var Editor = this.editor;
            $.ajax({

                url : 'templates/themePages.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    for( var i=0; i < pages.length; i++ ){

                        var page = document.createElement('div');
                        page.className = 'themePagePreview';
                        page.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+pages[i].url + ')';

                        var  pageTitle = document.createElement('div');
                        pageTitle.className = 'themePagePreviewName';
                        pageTitle.innerHTML = pages[i].name;

                        page.appendChild( pageTitle );

                        $('#themePagesPreview .modal-body').append( page );

                    }

                    $('#themePagesPreview').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#themePagesPreview').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#themePagesPreview').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });

                }

            });

        }



        initToolBoxEvents (){

            var Editor = this.editor;
            $(".tool-button").on('click', function( e ){
                
                e.stopPropagation();
                $('#toolsContent > *').removeClass('active-tool-content');

                if( $(this).hasClass('active') ){

                    $("#toolsBox").removeClass('open').animate( {'left' : -300 },
                    {
                        duration: this.menuDuration,
                        step: function( currentLeft ){

                            Editor.stage.centerCameraXuser();
                            $('#viewsListUser').css({ left : 310 + currentLeft });
                            $('#pagesListUser').css({ left : 310 + currentLeft });

                            document.body.querySelector('#pagesListUser').style.width = ( window.innerWidth - (310 + currentLeft) ) + 'px';
                            document.body.querySelector('.viewsListContent').style.width = $( document.getElementById('viewsListUser') ).outerWidth( true ) - $(document.body.querySelector('.addPageButton')).outerWidth( true ) - 100 + "px";

                        }

                    });

                    $(this).removeClass('active');

                }
                else {

                    $(".tool-button").removeClass('active');

                    var contentID = $(this).attr('data-content');

                    $("#"+ contentID).addClass('active-tool-content');

                    if( !$("#toolsBox").hasClass('open') ){

                        $("#toolsBox").addClass('open').animate( {'left' : 0},
                        {
                            duration: this.menuDuration,
                            step: function( currentLeft ){

                                if(Editor.stage.centerCameraXuser){
                                    Editor.stage.centerCameraXuser();
                                }
                                $('#viewsListUser').css({ left : 310 + currentLeft });
                                $('#pagesListUser').css({ left : 310 + currentLeft });

                                document.body.querySelector('#pagesListUser').style.width = ( window.innerWidth - (310 + currentLeft) ) + 'px';
                                document.body.querySelector('.viewsListContent').style.width = (document.getElementById('viewsListUser').offsetWidth - document.body.querySelector('.addPageButton').offsetWidth - 100) + "px";

                            }

                        });

                    }

                    $(this).addClass('active');

                }

            });

        }



        activeMainMenuView ( elemID ){

            var Editor = this.editor;
            $('#toolsContent > *').removeClass('active-tool-content');

            var tool = document.body.querySelector('#'+elemID);

            if( $(tool).hasClass('active') ){

                    $("#toolsBox").removeClass('open').animate( {'left' : -241 }, this.menuDuration );
                    $(tool).removeClass('active');

            }
            else {

                $(".tool-button").removeClass('active');

                var contentID = $(tool).attr('data-content');

                $("#"+ contentID).addClass('active-tool-content');

                if( !$("#toolsBox").hasClass('open') ){

                    $("#toolsBox").addClass('open').animate( {'left' : 0}, this.menuDuration );
                }

                $(tool).addClass('active');

            }

        }


        /**
        * Generuje box z narzędziami
        *
        * @method generateComplexToolsBox
        * @param {String} type Typ toolsBoxa pro|ama
        */
        generateComplexToolsBox ( type, info ){
            /*
            var Editor = this.editor;
            var tools = document.createElement('div');
            tools.id = 'toolsBox';
            tools.className = type;
            tools.style.height = ( window.innerHeight - topMenuHeight ) + "px";
            //tools.style.width = (toolContentWidth + 60 ) + "px";

            var toolsContainer = document.createElement('div');
            toolsContainer.id = 'toolsContainer';

            var toolsContent = document.createElement('div');
            toolsContent.id = 'toolsContent';
            //toolsContent.style.width = toolContentWidth + "px";

            tools.appendChild( toolsContent );

            document.body.appendChild( tools );

            document.body.appendChild( generateTopMenu() );

            toolsContainer.appendChild( generateComplexAttributesTool() );
            toolsContainer.appendChild( generateThemes() );
            //toolsContainer.appendChild( generateThemesToCopy() );
            toolsContainer.appendChild( generateComplexViews() );
            toolsContainer.appendChild( generatePages() );
            toolsContainer.appendChild( generateProposedTemplates() );
            toolsContainer.appendChild( generateImagesTool( type ) );
            toolsContainer.appendChild( generateLayersTool() );
            toolsContainer.appendChild( generateProductsViewsLayer() );
            //toolsContainer.appendChild( generateTextTool() );
            //toolsContainer.appendChild( generateProposedPositionTool() );
            //toolsContainer.appendChild( generateFormatSettings() );
            toolsContainer.appendChild( generateObjectSettings() );


            tools.appendChild( toolsContainer );

            var toolsContent_height = $('#toolsContent').height();

            toolsContainer.style.marginTop = ( toolsContent_height - toolsContainer.offsetHeight )/2 + "px";

            this.initToolBoxEvents();
            */
            // ---------------------------------------------
            var Editor = this.editor;
            var tools = document.createElement('div');
            tools.id = 'toolsBox';
            tools.className = type;
            tools.style.height = ( window.innerHeight ) + "px";
            //tools.style.width = (toolContentWidth + 60 ) + "px";
    
            var toolsContainer = document.createElement('div');
            toolsContainer.id = 'toolsContainer';
    
            var toolsContent = document.createElement('div');
            toolsContent.id = 'toolsContent';
            //toolsContent.style.width = toolContentWidth + "px";
    
            tools.appendChild( toolsContent );
    
            document.body.appendChild( tools );
            document.body.appendChild( this.editor.template.generateTopMenu() );
    
            this.assetsComponent = ReactDOM.render( <AssetContainer editor={ this.editor }/>, document.body.querySelector('.libraryButton'));
    
            toolsContainer.appendChild( this.editor.template.generateAttributesTool() );
            toolsContainer.appendChild( this.editor.template.generateThemes() );
            //toolsContainer.appendChild( this.editor.template.generateThemesToCopy() );
            toolsContainer.appendChild( this.editor.template.generateComplexViews( info.views ) );
            toolsContainer.appendChild( this.editor.template.generatePages() );
            toolsContainer.appendChild( this.editor.template.generateProposedTemplates() );
            toolsContainer.appendChild( this.editor.template.generateImagesTool( type ) );
            toolsContainer.appendChild( this.editor.template.generateLayersTool() );
            //toolsContainer.appendChild( Editor.template.generateTextTool() );
            //toolsContainer.appendChild( this.editor.template.generateProposedPositionTool() );
            //toolsContainer.appendChild( this.editor.template.generateObjectSettings() );
            //toolsContainer.appendChild( this.editor.template.generateFramesPanel() );
            //toolsContainer.appendChild( this.editor.template.generateFormatSettings() );
    
            tools.appendChild( toolsContainer );
    
            this.generateEditableAreaTools();
    
    
            var toolsContent_height = $('#toolsContent').height();
            $("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );
    
           // toolsContainer.style.marginTop = ( toolsContent_height - toolsContainer.offsetHeight )/2 + "px";
    
            this.editor.template.initToolBoxEvents();

        }


        /**
        * Generuje narzędzie zmiany widoków
        *
        * @method generateViewsTool
        */
        generateViewsTool (){

            var tool = document.createElement('div');
            tool.id = 'views-tool';
            tool.innerHTML = "<span id='prev-view'>Poprzednia strona</span><span id='next-view'>Następna Strona</span>";

            document.body.appendChild( tool );

        }


        /**
        * Generuje narzędzie dodawania atrybutów do widoku
        *
        * @method generateAddAttributesTool
        */
        generateAddAttributesTool (){

            overlayBlock();

        }


        overlayBlock ( content, size ){

            var tool = document.createElement('div');
            tool.className = 'overlay';

            var toolContent = document.createElement('div');
            toolContent.className = 'overlay-content-' + size ;

            toolContent.addEventListener('click', function(e){

                e.stopPropagation();

            });

            tool.appendChild( toolContent );

            if( content ){
                toolContent.appendChild( content );
            }

            document.body.appendChild( tool );

            tool.addEventListener('click', function(){

                document.body.removeChild( this );

            });

        }


        themePhotosUploader (){

            var Editor = this.editor;
            var uploader = document.createElement('input');
            uploader.type = 'file';
            uploader.multiple = 'true';
            uploader.className = 'button-fw inputHidden absolutePos';

            uploader.onchange = function( e ){

                var files = this.files;

                function uploadFile( file ){

                    var url = URL.createObjectURL( file );

                    var isSVG = false;

                    if( file.name.indexOf('.svg') > -1 ){
                      isSVG = true;
                    }

                    var loadedImage = new createjs.Bitmap( url );

                    loadedImage.image.onload = function(){

                      loadedImage.origin = loadedImage.getBounds();

                      var assetData = {};

                      if( isSVG ){

                          var bitmap = new createjs.Bitmap( loadedImage );

                          var projectImage = new ProjectImage();

                          projectImage.editor = Editor;
                          projectImage.initForTheme( file, loadedImage, loadedImage, loadedImage.origin.width,  loadedImage.origin.height, loadedImage.origin.width, loadedImage.origin.height, Editor );
                          projectImage.minSize = { width: loadedImage.origin.width, height: loadedImage.origin.height };
                          projectImage.thumbSize = { width: loadedImage.origin.width, height: loadedImage.origin.height };
                          projectImage.name = file.name;

                          if( $('#themeImagesContainer').attr('active-window') == 'photo' ){

                            document.getElementById("themeImagesPhotos").appendChild( projectImage.toHTML_ForTheme() );

                          }
                          else if( $('#themeImagesContainer').attr('active-window') == 'backgrounds' ){

                            document.getElementById("themeImagesBackgrounds").appendChild( projectImage.toHTML_ForTheme() );

                          }
                          else if( $('#themeImagesContainer').attr('active-window') == 'cliparts' ){


                            document.getElementById("themeCliparts").appendChild( projectImage.toHTML_ForTheme() );

                          }

                          if( $('#themeImagesContainer').attr('active-window') == 'photo' ){

                            assetData.type = 'image';
                            Editor.adminProject.format.theme.addProjectPhoto( projectImage );
                            Editor.webSocketControllers.mainTheme.addProjectPhoto( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), projectImage.name, 'Bitmap', projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                          }
                          else if( $('#themeImagesContainer').attr('active-window') == 'backgrounds' ){

                            assetData.type = 'background';
                            Editor.adminProject.format.theme.addProjectBackground( projectImage );
                            Editor.webSocketControllers.mainTheme.addProjectBackground( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), projectImage.name, 'Bitmap', projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                          }
                          else if( $('#themeImagesContainer').attr('active-window') == 'cliparts' ){

                            assetData.type = 'clipart';
                            Editor.adminProject.format.theme.addProjectBackground( projectImage );
                            Editor.webSocketControllers.mainTheme.addProjectClipart( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), projectImage.name, 'Bitmap', projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                          }

                          Editor.uploader.addItemToUpload( projectImage );
                          Editor.uploader.upload();

                          projectImage.addEventListener( 'uploaded', function( data ){


                              projectImage.updateHTML();

                              var dataToUpload = {

                                projectImageUID : projectImage.uid,
                                minUrl : projectImage.miniatureUrl,
                                thumbnail : projectImage.thumbnail,
                                imageUrl : projectImage.imageUrl,
                                uploadID : projectImage.uploadID

                              };

                              assetData.projectImageUID = projectImage.uid;
                              Editor.webSocketControllers.adminAssets.addImageAsset( assetData );
                              Editor.webSocketControllers.projectImage.update( dataToUpload );

                          });


                        }else {

                          var miniature64 = Editor.ThumbsMaker.generateThumb( loadedImage )

                          var bitmap = new createjs.Bitmap( miniature64.min );

                          bitmap.image.onload = function(){

                            var origin = bitmap.getBounds();

                            var projectImage = new ProjectImage();
                            projectImage.editor = Editor;
                            projectImage.initForTheme( file, miniature64.min, miniature64.thumb, loadedImage.origin.width,  loadedImage.origin.height, origin.width, origin.height, Editor );
                            projectImage.minSize = miniature64.minSize;
                            projectImage.thumbSize = miniature64.thumbSize;
                            projectImage.name = file.name;

                            if( $('#themeImagesContainer').attr('active-window') == 'photo' ){

                              document.getElementById("themeImagesPhotos").appendChild( projectImage.toHTML_ForTheme() );

                            }
                            else if( $('#themeImagesContainer').attr('active-window') == 'backgrounds' ){

                              document.getElementById("themeImagesBackgrounds").appendChild( projectImage.toHTML_ForTheme() );

                            }
                            else if( $('#themeImagesContainer').attr('active-window') == 'cliparts' ){

                              document.getElementById("themeCliparts").appendChild( projectImage.toHTML_ForTheme() );

                            }

                            if( $('#themeImagesContainer').attr('active-window') == 'photo' ){

                              assetData.type = 'image';
                              Editor.adminProject.format.theme.addProjectPhoto( projectImage );
                              Editor.webSocketControllers.mainTheme.addProjectPhoto( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), projectImage.name, 'Bitmap', projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                            }
                            else if( $('#themeImagesContainer').attr('active-window') == 'backgrounds' ){

                              assetData.type = 'background';
                              Editor.adminProject.format.theme.addProjectBackground( projectImage );
                              Editor.webSocketControllers.mainTheme.addProjectBackground( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), projectImage.name, 'Bitmap', projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                            }
                            else if( $('#themeImagesContainer').attr('active-window') == 'cliparts' ){

                              assetData.type = 'clipart';
                              Editor.adminProject.format.theme.addProjectBackground( projectImage );
                              Editor.webSocketControllers.mainTheme.addProjectClipart( projectImage.uid, Editor.adminProject.format.theme.getParentThemeID(), projectImage.name, 'Bitmap', projectImage.width, projectImage.height, projectImage.trueWidth, projectImage.trueHeight );

                            }

                            Editor.uploader.addItemToUpload( projectImage );
                            Editor.uploader.upload();

                            projectImage.addEventListener( 'uploaded', function( data ){

                              projectImage.updateHTML();

                              var dataToUpload = {

                                projectImageUID : projectImage.uid,
                                minUrl : projectImage.miniatureUrl,
                                thumbnail : projectImage.thumbnail,
                                imageUrl : projectImage.imageUrl,
                                uploadID : projectImage.uploadID

                              };

                              assetData.projectImageUID = projectImage.uid;

                              Editor.webSocketControllers.adminAssets.addImageAsset( assetData );
                              Editor.webSocketControllers.projectImage.update( dataToUpload );


                            });



                          }
                        }

                    }

                }

                for( var i=0; i < files.length; i++ ){

                    uploadFile( files[i] );

                }

            };

            return uploader;

        }




        generateProductsViewsLayer ( products ){

            var Editor = this.editor;
            var tool = document.createElement('div');
            tool.id = 'productsViews-tool';
            tool.className = 'tool closed';

            var toolButton = document.createElement('span');
            toolButton.id = 'productsViews-container-tool_button';
            toolButton.className = 'tool-button';

            toolButton.setAttribute('data-content','productsViews-content');

            tool.appendChild( toolButton );

            var toolContent = document.createElement('div');
            toolContent.id = 'productsViews-content';
            document.getElementById('toolsContent').appendChild( toolContent );

            //var toolMainContent = document.createElement('div');
            //toolMainContent.id =

            var productsList = document.createElement('div');
            productsList.id = 'productsViewsList';

            var productViewsList = document.createElement('div');
            productViewsList.id = 'productViewsList';

            var backToMainList = document.createElement('div');
            backToMainList.className = 'button';
            backToMainList.innerHTML = 'Powróć';

            backToMainList.addEventListener('click', function( e ){

                e.stopPropagation();

                $( '#productsViewsList' ).animate( { 'left' : '0' }, 100 );
                $( '#productViewsList' ).animate( { 'left' : '100%' }, 100 );

            });

            var productViewsListContent = document.createElement('div');
            productViewsListContent.id = 'productViewsListContent';

            productViewsList.appendChild( backToMainList );
            productViewsList.appendChild( productViewsListContent );

            toolContent.appendChild( productsList );
            toolContent.appendChild( productViewsList );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';

             var borderFx = document.createElement('div');
            borderFx.className = "border_fx";
            toolHelper.appendChild( borderFx );


            toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać widoki z innych produktów</span>';




            tool.appendChild( toolHelper );
            /*
            var toolContentButtons = document.createElement('div');
            toolContentButtons.className = 'function-buttons';
            toolContentButtons.innerHTML = '<span>Generuj wszystke przypadki</span>';

            var addAttributesCase = document.createElement('span');
            addAttributesCase.id = 'addAttributesCase';
            addAttributesCase.innerHTML = 'Dodaj przypadek atrybutów';
            addAttributesCase.addEventListener('click', function(){

                $.ajax( {
                    url: 'http://api.digitalprint.pro/ps_types/'+ Editor.getProductId()+'/ps_product_options/forEditor/',
                    success: function(data){

                        console.log('ATRYBUTY');
                        console.log( Editor.generateAttributesOptions_Select() );
                        generateAddAttributesTool();

                    }

                });

            });

            toolContentButtons.appendChild( addAttributesCase );

            toolContent.appendChild( toolContentButtons );
            */

            return tool;

        }


        /**
        * Generuje narzędzie warstw atrybutów
        *
        * @method generateAttributesTool
        */
        generateComplexAttributesTool (){

            var Editor = this.editor;
            var tool = document.createElement('div');
            tool.id = 'attributes-tool';
            tool.className = 'tool closed';

            var toolButton = document.createElement('span');
            toolButton.id = 'attributes-container-tool_button';
            toolButton.className = 'tool-button';

            toolButton.setAttribute('data-content','attributes-content');

            tool.appendChild( toolButton );

            var toolContent = document.createElement('div');
            toolContent.id = 'attributes-content';



            var attributesSelector = document.createElement('div');
            attributesSelector.id = 'attributesSelector';

            toolContent.appendChild( attributesSelector );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz definiować wygląd edytora poprzez atrybuty produktu</span>';




            tool.appendChild( toolHelper );
            /*
            var toolContentButtons = document.createElement('div');
            toolContentButtons.className = 'function-buttons';
            toolContentButtons.innerHTML = '<span>Generuj wszystke przypadki</span>';

            var addAttributesCase = document.createElement('span');
            addAttributesCase.id = 'addAttributesCase';
            addAttributesCase.innerHTML = 'Dodaj przypadek atrybutów';
            addAttributesCase.addEventListener('click', function(){

                $.ajax( {
                    url: 'http://api.digitalprint.pro/ps_types/'+ Editor.getProductId()+'/ps_product_options/forEditor/',
                    success: function(data){

                        console.log('ATRYBUTY');
                        console.log( Editor.generateAttributesOptions_Select() );
                        generateAddAttributesTool();

                    }

                });

            });

            toolContentButtons.appendChild( addAttributesCase );

            toolContent.appendChild( toolContentButtons );
            */


            document.getElementById('toolsContent').appendChild( toolContent );



            return tool;

        }


        /**
        * Generuje narzędzie warstw atrybutów
        *
        * @method generateAttributesTool
        */
        generateAttributesTool (){
            
            if( userType == 'admin'){

                var Editor = this.editor;
                var tool = document.createElement('div');
                tool.id = 'attributes-tool';
                tool.className = 'tool closed';
    
                var toolButton = document.createElement('span');
                toolButton.id = 'attributes-container-tool_button';
                toolButton.className = 'tool-button';
    
                toolButton.setAttribute('data-content','attributes-content');
    
                tool.appendChild( toolButton );
    
                var toolContent = document.createElement('div');
                toolContent.id = 'attributes-content';
    
    
    
                var attributesSelector = document.createElement('div');
                attributesSelector.id = 'attributesSelector';
    
                toolContent.appendChild( attributesSelector );
    
                var toolHelper = document.createElement('span');
                toolHelper.className = 'toolHelper';
                toolHelper.innerHTML = '<i></i><span>Tutaj możesz definiować wygląd edytora poprzez atrybuty produktu</span>';
        
                tool.appendChild( toolHelper );

            }else {

                var Editor = this.editor;
                var tool = document.createElement('div');
                tool.id = 'attributes-tool';
                tool.className = 'tool closed';

                var toolButton = document.createElement('span');
                toolButton.id = 'attributes-container-tool_button';
                toolButton.className = 'tool-button';

                toolButton.setAttribute('data-content','attributes-content');

                tool.appendChild( toolButton );

                var toolContent = document.createElement('div');
                toolContent.id = 'attributes-content';
                document.getElementById('toolsContent').appendChild( toolContent );

                var attributesSelector = document.createElement('div');
                attributesSelector.id = 'attributesSelector';

                if( userType != 'user') {

                    var attributesOptionGeneration = document.createElement('div');
                    attributesOptionGeneration.id = 'attributesOptionGeneration';
                    attributesOptionGeneration.innerHTML = 'Dostosuj wygląd edytora względem cech:';

                }

                toolContent.appendChild( attributesSelector );

                if( userType != 'user' )
                    toolContent.appendChild( attributesOptionGeneration );

                document.getElementById('toolsContent').appendChild( toolContent );

                // miejsce na atrybuty produktu
                var productAttributes = document.createElement('div');
                productAttributes.id = 'product-attributes';
                toolContent.appendChild( productAttributes );

                // miejsce na baze widoku
                var baseViewLayer = document.createElement('div');
                baseViewLayer.id = 'baseViewLayer';
                toolContent.appendChild( baseViewLayer );

                var toolHelper = document.createElement('span');
                toolHelper.className = 'toolHelper';
                toolHelper.innerHTML = '<i></i><span>Tutaj możesz definiować wygląd edytora poprzez atrybuty produktu</span>';

                tool.appendChild( toolHelper );

                var attrConfigViewport = $('#attributes-content');

                $(attrConfigViewport).children('.viewport').css( 'height', $('#toolsContent').height() - 60 );
                
                this.productAttributes = ReactDOM.render( <ProductAttributes editor={ this.editor } selectedAttributes={ this.editor.complexProduct[2]}/>, toolContent );

            }

            Ps.initialize( toolContent );

            return tool;

        }


        element_themeToCopy ( themeID, themeName, minImage ){

            var Editor = this.editor;
            var element = document.createElement('div');
            element.className = 'themeToCopy themeElement';
            element.style.backgroundImage = 'url(' +minImage+ ')';
            element.setAttribute( 'theme-id', themeID );

            element.addEventListener('click', function( e ){

                e.stopPropagation();

                var themeID = this.getAttribute('theme-id');


                Editor.webSocketControllers.theme.get( themeID, function( data ){

                    var themePages = document.createElement('div');

                    for( var key in data.usedPages ){

                        for( var i=0; i< data.usedPages[key].length; i++ ){

                            var pageInfo = data.usedPages[key][i];
                            // trzeba z tego zrobic element_themetocopypage
                            var elem = document.createElement('div');
                            elem.className = 'themeToCopyPage';
                            elem.setAttribute('themePage-id', pageInfo._id );
                            elem.style.backgroundImage = 'url("'+ EDITOR_ENV.staticUrl+pageInfo.url +'")';
                            elem.addEventListener('click', function( e ){



                            });

                            var editButton = document.createElement('div');
                            editButton.className = 'editThemePage';
                            editButton.setAttribute( 'theme-page-id', pageInfo._id );

                            editButton.addEventListener('click', function( e ){

                                e.stopPropagation();

                                var themePageId = this.getAttribute('theme-page-id');

                                Editor.webSocketControllers.themePage.get( themePageId, function( data ){

                                    Editor.adminProject.format.view.page.loadThemePage( data );

                                });

                            });

                            var dispatchButton = document.createElement('div');
                            dispatchButton.className = 'dispatchThemePage';
                            dispatchButton.setAttribute( 'theme-id', pageInfo._id );
                            dispatchButton.setAttribute( 'theme-page-id', pageInfo._id );

                            dispatchButton.addEventListener('click', function( e ){

                                e.stopPropagation();

                            });

                            elem.appendChild( editButton );
                            elem.appendChild( dispatchButton );

                            themePages.appendChild( elem );

                        }

                    }

                    var body = document.createElement('div');

                    var themePreview = document.createElement('img');
                    themePreview.src = data.url;

                    body.appendChild( themePreview );
                    body.appendChild( themePages );

                    var footer = document.createElement('div');

                    var themeToCopyWindow = this.displayWindow(

                        'themeToCopy-review',
                        {
                            size    : 'small',
                            title   : 'Motyw oczekujący na skopiowanie: ' + data.name,
                            content : body,
                            footer  : footer
                        }

                    );

                    document.body.appendChild( themeToCopyWindow );

                    $('#themeToCopy-review').on( 'hidden.bs.modal', function(){

                        $(this).remove();

                    });

                    $('#themeToCopy-review').modal({

                        keyboard: false,
                        backdrop: 'static'
                    });

                });

            });

            return element;

        }



        generateProposedPositionTool (){

            var Editor = this.editor;

            var tool = document.createElement('div');
            tool.id = 'proposedTemplate-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';


            var toolButton = document.createElement('span');
            toolButton.id = 'proposedTemplate-tool_button';
            toolButton.className = 'tool-button';

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Dodaj obszar roboczy</span>';

            tool.appendChild( toolHelper );

            toolButton.addEventListener('click', function(){

                var type = prompt('Podaj typ obszaru: 1 - srodek ksiazki, 2 - okladka ksiazki');                

                var data = {

                    width : Editor.adminProject.format.getWidth(),
                    height : Editor.adminProject.format.getHeight(),
                    slope : Editor.adminProject.format.getSlope(),
                    rotation : 0,
                    type: type

                };

                Editor.webSocketControllers.page.add( Editor.adminProject.format.view.getId(), 'test', data.width, data.height, data.order, data.slope, data.type, data.rotation );



                /*
                console.log("TEST");
                console.log( Editor.getProjectId() );
                if( $("#editablePlane_panel").length == 0 ){
                    $('body').append("<div id='editablePlane_panel' class='ui-widget-content'><div class='draggblock ui-widget-header'>Obiekt edycji<span class='exit'>x</span></div><div class='window_content'><label>Nazwa: <input type='text' id='editable_plane_name'/></label><br><br>Rozmiar:<br><label>szer: <input type='text' id='editable_plane_width' /></label><label>wys: <input type='text' id='editable_plane_height'></label><br><label>spad: <input type='text' id='editable_plane_slope'/></label><br><span class='button' id='addPlane'>Dodaj obiekt</div></div></div>");

                    $("#editablePlane_panel .exit").on('click', function(){
                        $("#editablePlane_panel").animate({ opacity: .0},300, function(){
                            $("#editablePlane_panel").remove();
                        });
                    });
                    $("#editablePlane_panel").draggable({ handle: "div.draggblock"});
                    $('#editablePlane_panel, .draggblock').disableSelection();

                    $("#addPlane").on( 'click', function(){

                        console.log("TUtaj tez jest");
                        //var test2 = new Editor.EditableArea($("#editable_plane_name").val(), parseFloat($("#editable_plane_width").val()), parseFloat($("#editable_plane_height").val()), null,  parseFloat($("#editable_plane_slope").val()));
                        //test2.init();
                        console.log(Editor.adminProject.view.getId());
                        Editor.webSocketControllers.addPage( { viewID : Editor.adminProject.view.getId() ,name : $("#editable_plane_name").val(), width : parseFloat($("#editable_plane_width").val()), height : parseFloat($("#editable_plane_height").val()), slope : parseFloat($("#editable_plane_slope").val()), x : 0, y : 0, rotation : 0 } );
                        //Editor.adminProject.view.addPage( test2 );

                    });
                }
                */
            });


            return tool;

        }



        /**
        * Generuje narzędzie dodawania tekstu
        *
        * @method generateTextTool
        */
        generateTextTool (){

            var tool = document.createElement('div');
            tool.id = 'text-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'text-container-tool_button';
            toolButton.className = 'tool-button';

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać tekst</span>';

            tool.appendChild( toolHelper );

            $(toolButton).on('click', function(){

               var proposed = new createjs.Shape();

                var moveFunction = function( e ){

                    var _stage = Editor.getStage();
                    var position = Editor.stage.getMousePosition( _stage.mouseX, _stage.mouseY );
                    //console.log( [Math.abs(proposed.x - position[0]), Math.abs(proposed.y - position[1])] );
                    proposed.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, position[0] - proposed.x, position[1] - proposed.y );
                    proposed.width  = position[0] - proposed.x;
                    proposed.height = position[1] - proposed.y;

                };

                var unclickFunction = function( e ){

                    Editor.getStage().removeEventListener('stagemousemove', moveFunction);
                    Editor.getStage().removeEventListener('stagemouseup', unclickFunction);

                    var width  = Math.abs( proposed.width );
                    var height = Math.abs( proposed.height );

                    var x = (( proposed.width < 0 ) ? ( proposed.x+proposed.width ) : proposed.x );
                    var y = (( proposed.height < 0 ) ? ( proposed.y+proposed.height ) : proposed.y );

                    Editor.stage.getObjectById( MAIN_LAYER ).removeChild( proposed );

                    Editor.webSocketControllers.view.addNewText(

                        Editor.adminProject.format.view.getId(),
                        '',
                        x,
                        y,
                        width,
                        height,
                        0,
                        Editor.adminProject.format.view.getLayer().children.length

                    );

                };

                var clickFunction = function( e ){

                    var _stage = Editor.getStage();
                    var pos = Editor.stage.getMousePosition( _stage.mouseX, _stage.mouseY );

                    Editor.stage.getObjectById( MAIN_LAYER ).addChild( proposed );

                    proposed.x = pos[0];
                    proposed.y = pos[1];

                    Editor.getStage().removeEventListener('stagemousedown', clickFunction);
                    Editor.getStage().addEventListener('stagemousemove', moveFunction);
                    Editor.getStage().addEventListener('stagemouseup', unclickFunction);


                };

                /*
                var proposed = new Editor.Text2("testowy");

                var moveFunction = function( e ){

                    var position = Editor.stage.getMousePosition( e.stageX, e.stageY );
                    //console.log( [Math.abs(proposed.x - position[0]), Math.abs(proposed.y - position[1])] );
                    proposed.updateCreator( ( position[0] - proposed.x + (proposed.trueWidth/2) ), ( position[1] - proposed.y ) + (proposed.trueHeight/2) );
                    proposed.setTrueHeight( Math.abs( position[1] - proposed.y) + (proposed.trueHeight/2), true );
                    proposed.setTrueWidth( Math.abs( position[0] - proposed.x) + (proposed.trueWidth/2), true );
                    proposed.setBounds( 0,0 ,proposed.trueWidth, proposed.trueHeight );

                    console.log('no i działa ta funkcja');
                    console.log(  );

                };

                var unclickFunction = function( e ){

                    Editor.getStage().removeEventListener('stagemousemove', moveFunction);
                    Editor.getStage().removeEventListener('stagemouseup', unclickFunction);
                    proposed.stopCreator();
                    proposed.initEvents();
                    proposed.init( 50 );
                    proposed.generateCursorMap();

                    proposed.parent.removeChild( proposed );

                    var saving = Editor.adminProject.view.addObject( proposed );

                    //proposed.saveToDB();

                };

                var clickFunction = function( e ){

                    var stagePosition = Editor.getStage().globalToLocal( e.stageX, e.stageY);
                    var pos = Editor.stage.getMousePosition( e.stageX, e.stageY );

                    Editor.stage.getObjectById( MAIN_LAYER ).addChild( proposed );
                    Editor.stage.addObject( proposed );
                    proposed.initCreator();

                    proposed.x = pos[0];
                    proposed.y = pos[1];

                    console.log('wlazlo tutaj');
                    proposed.setPosition_leftCorner( pos[0], pos[1] );
                    console.log('wlazlo tutaj2');

                    Editor.getStage().removeEventListener('stagemousedown', clickFunction);
                    Editor.getStage().addEventListener('stagemousemove', moveFunction);
                    Editor.getStage().addEventListener('stagemouseup', unclickFunction);

                    Editor.updateLayers();

                };
                */

                Editor.getStage().addEventListener('stagemousedown', clickFunction);

            });

            return tool;

        }



        warningView ( content, callbackConfirm, callbackAbort ){

            $.ajax({

                url : 'templates/warning.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    $('.warning-description').html( content );

                    $('#warning').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#warning').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#warning').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });


                    $( "#warning .modal-footer button" ).on('click', function( e ){

                        if(callbackConfirm){
                            callbackConfirm();
                        }

                    });


                }

            });

        }

        infoOkView ( content, callbackConfirm, callbackAbort ){

            $.ajax({

                url : 'templates/warning.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    $('.warning-description').html( content );

                    $('#warning').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#warning').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#warning').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });


                    $( "#warning .modal-footer button" ).on('click', function( e ){

                        callbackConfirm();

                    });


                }

            });

        }


        baseObjectAttributesLayers (){

            $.ajax({

                url : 'templates/baseObjectAttributesLayers.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    $('#baseObjectAttributesLayers');

                    $('#baseObjectAttributesLayers').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#baseObjectAttributesLayers').modal({
                        keyboard: false,
                        backdrop: 'static'
                    });

                }

            });

        }



        formatSelectWindow ( content, title ){

            $.ajax({

                url : 'app/templates/formatSelection.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('body').append( data );

                    document.querySelector("#selectFormat .modal-body").appendChild( content );
                    //$('#selectFormat .modal-body').append( content );

                    $('#selectFormat').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#selectFormat').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#selectFormat').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });

                }

            });

        }



        selectProjectView ( projectsData ){

            var Editor = this.editor;
            var _this = this;

            $.ajax({

                url : 'app/templates/projectSelection.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    //login.innerHTML = data;
                    $('body').append( data );

                     var win = document.createElement('div');
                     win.className = 'projectsList';

                     for( var i=0; i < projectsData.length; i++ ){

                        var projectItem = document.createElement('div');
                        projectItem.className = ((projectsData[i].active)? 'active' : '');
                        projectItem.setAttribute('data-project-id', projectsData[i]._id );
                        var projectTitle = document.createElement('span');
                        projectTitle.className = 'projectName ';
                        var projectImage = document.createElement('img');
                        projectImage.className = 'projectAvatar';
                        projectImage.src = projectsData[i].url;

                        if ( projectsData[i].url == null ){

                             projectImage.src = "/images/defaultmini.png";
                        }

                        var projectListButtons = document.createElement('div');
                        projectListButtons.className = 'projectListButtons'


                        var remover = document.createElement('span');
                        remover.className = 'project-remover projectListIcons';
                        remover.setAttribute('data-project-id', projectsData[i]._id );
                        var name = document.createElement('span');
                        name.class='projectName';
                        name.innerHTML = projectsData[i].name;
                        var activate = document.createElement('span');
                        activate.className = 'activateAdminProject projectListIcons';
                        activate.setAttribute('data-project-id', projectsData[i]._id );

                        activate.addEventListener('click', function( e ){

                            e.stopPropagation();
                            Editor.webSocketControllers.setActiveAdminProject( { typeID : Editor.getProductId(), projectID : this.getAttribute('data-project-id') } );

                        });

                        projectListButtons.appendChild( remover );
                        projectListButtons.appendChild( activate );

                        projectItem.appendChild( projectTitle );
                        projectItem.appendChild( projectImage );
                        projectItem.appendChild( projectListButtons );

                        var nameBox = document.createElement('div');
                        nameBox.className = 'nameBox';
                        nameBox.appendChild( name );

                        projectItem.appendChild( nameBox );


                        remover.addEventListener('click', function( e ){

                            e.stopPropagation();
                            Editor.webSocketControllers.adminProject.remove( { ID : this.getAttribute('data-project-id') });

                        });

                        projectItem.addEventListener('click', function( e ){
                            e.stopPropagation();

                            $('#selectProject').remove();
                            Editor.webSocketControllers.adminProject.load( e.currentTarget.getAttribute('data-project-id') );
                        });

                        win.appendChild( projectItem );

                    }

                    $('#selectProject .modal-body').append( win );

                    $('#selectProject').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#selectProject').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#selectProject').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });

                    $("button#addNewProject").on('click', function( e ){

                        e.stopPropagation();

                        _this.createNewProject();

                         $("#addNewAdminProject").on('click', function(){

                            var projectName = $('input#project-name').val();
                            var projectAvatarURL =  $("#filePreview-adminAvatar").attr( 'src' );

                            Editor.webSocketControllers.addAdminProject( {  URL : projectAvatarURL, name : projectName, typeID : Editor.getProductId() } );

                            $("#newProject").remove();

                        });

                    });

                },

            });

            /*
            var window = document.createElement('div');
            window.id = 'projectWindow';
            window.className = 'overflow-window';

            for( var i=0; i < projectsData.length; i++ ){

                var projectItem = document.createElement('div');
                projectItem.className = ((projectsData[i].active)? 'active' : '');
                projectItem.setAttribute('data-project-id', projectsData[i]._id );
                var projectTitle = document.createElement('span');
                projectTitle.className = 'projectName ';
                var projectImage = document.createElement('img');
                projectImage.src = projectsData[i].projectMin;

                projectItem.appendChild( projectTitle );
                projectItem.appendChild( projectImage );

                projectItem.addEventListener('click', function( e ){

                    console.log( e.target.getAttribute('data-project-id') );
                    Editor.webSocketControllers.getProject( e.target.getAttribute('data-project-id') );

                });

                window.appendChild( projectItem );

            }

            document.body.appendChild( window );
            */
        }



        selectComplexProjectView ( projectsData ){

            $.ajax({

                url : 'app/templates/projectSelection.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    $('#selectProject').remove();
                    //login.innerHTML = data;
                    $('body').append( data );

                     var win = document.createElement('div');
                     win.className = 'projectsList';

                     for( var i=0; i < projectsData.length; i++ ){

                        var projectItem = document.createElement('div');
                        projectItem.className = ((projectsData[i].active)? 'active' : '');
                        projectItem.setAttribute('data-project-id', projectsData[i]._id );
                        var projectTitle = document.createElement('span');
                        projectTitle.className = 'projectName ';
                        var projectImage = document.createElement('img');
                        projectImage.src = projectsData[i].projectMin;
                        var remover = document.createElement('span');
                        remover.className = 'project-remover';
                        remover.setAttribute('data-project-id', projectsData[i]._id );
                        var name = document.createElement('span');
                        name.class='projectName';
                        name.innerHTML = projectsData[i].name;
                        var activate = document.createElement('span');
                        activate.className = 'activateAdminProject';
                        activate.setAttribute('data-project-id', projectsData[i]._id );

                        activate.addEventListener('click', function( e ){

                            e.stopPropagation();
                            Editor.webSocketControllers.setActiveComplexAdminProject( { typeID : Editor.getProductId(), projectID : this.getAttribute('data-project-id') } );

                        });

                        projectItem.appendChild( projectTitle );
                        projectItem.appendChild( projectImage );
                        projectItem.appendChild( remover );
                        projectItem.appendChild( name );
                        projectItem.appendChild( activate );

                        remover.addEventListener('click', function( e ){

                            e.stopPropagation();
                            Editor.webSocketControllers.adminProject.remove( { ID : this.getAttribute('data-project-id') });

                        });

                        projectItem.addEventListener('click', function( e ){

                            e.stopPropagation();
                            Editor.setProjectId( e.currentTarget.getAttribute('data-project-id') );

                            Editor.webSocketControllers.complexAdminProject.load( e.currentTarget.getAttribute('data-project-id') );

                        });

                        win.appendChild( projectItem );

                    }

                    $('#selectProject .modal-body').append( win );

                    $('#selectProject').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#selectProject').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#selectProject').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });

                    $("button#addNewProject").on('click', function( e ){

                        e.stopPropagation();

                        $.ajax({

                            url : 'app/templates/newProject.html',
                            type : 'GET',
                            crossDomain : true,
                            success : function( data ){

                                $('body').append( data );

                                $("#addNewAdminProject").on('click', function(){

                                    var projectName = $('input#project-name').val();

                                    Editor.webSocketControllers.complexAdminProject.add( Editor.getProductId(), projectName );
                                    $("#newProject").remove();

                                });

                                $('#newProject').on('shown.bs.modal', function() {
                                    $(this).find('.modal-dialog').css({
                                        'margin-top': function () {
                                            return (window.innerHeight/2-($(this).outerHeight() / 2));
                                        },
                                        'margin-left': function () {
                                            return (window.innerWidth/2-($(this).outerWidth() / 2));
                                        }
                                    });
                                });

                                $('#newProject').on( 'hidden.bs.modal', function(){
                                    $("#newProject").remove();
                                });

                                $('#newProject').modal({
                                    keyboard: false,
                                    backdrop: 'static'

                                });

                            }

                        });

                    });

                },

            });

        }



        updateThemeTemplate ( currentPage, newPage, editor ){

            var _this = this;
            $.ajax({

                url : 'templates/updateThemePage.html',
                crossDomain : true,
                type : 'GET',
                success : function( data){

                    $('body').append( data );

                    $('#updateThemePageWindow').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#updateThemePageWindow').on( 'hidden.bs.modal', function(){
                        $(this).remove();
                    });

                    $('#updateThemePageWindow').modal({
                      keyboard: false
                    });

                    $('#currentThemePagePreviev').append('<img src="'+ currentPage.url +'">');
                    $('#newThemePagePreview').append('<img src="'+ newPage.url +'">');

                    $('button#updateThemePage').on('click', function( e ){

                        e.stopPropagation();
                        _this.editor.webSocketControllers.themePage.update( _this.editor.adminProject.format.view.page.themePage.getID(), _this.editor.pageThemToSave, $('#newThemePagePreview img').attr('src'), function( data ){

                            $('#updateThemePageWindow').remove();

                        } );

                    });


                },
                error :function(){

                    alert('nie udalo sie pobrać szablonu widoku');

                }

            });

        }





        makeWindowTitleBox ( icon,  title, exitCallback ){

            var titleBar = document.createElement('div');
            titleBar.className = 'window-title-bar';

            var icon = document.createElement('span');
            icon.className = 'window-icon';
            icon.innerHTML = icon;

            var title = document.createElement('span');
            title.className = 'window-title';
            title.innerHTML = title;

            var closeWindow = document.createElement('span');
            closeWindow.className = 'window-close';

            closeWindow.addEventListener('click', function(){



            });

            titleBar.appendChild( icon );
            titleBar.appendChild( title );
            titleBar.appendChild( closeWindow );

            return titleBar;

        }



        initLoginWindow ( action ){

            var login = document.createElement('div');
            login.id = 'loginForm';

            $.ajax({

                url : 'templates/login.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                    //login.innerHTML = data;

                    $('body').append( data );

                    $('#loginForm').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });


                    $("#loginButton").on('click', function( e ){

                        e.stopPropagation();

                        var email = document.getElementById( 'user-name' ).value;
                        var password = document.getElementById( 'user-pass' ).value;

                        if( email == '' || email == null ){

                            email = document.getElementById('userCheck').value;

                        }

                        $.ajax({

                            url : config.getDomain() + ':' + config.getPort() + '/login',
                            type: 'POST',
                            crossOrigin: true,
                            data : { email : email , password : password },
                            success : function( data ){

                                userID = data.userID;
                                Editor.user.setID( data.userID );
                                document.cookie="token="+data.token;
                                document.cookie="secretProof="+data.secretProof;

                                action( data );

                            },

                            error : function ( data ){

                                document.cookie="token="+data.token;
                                document.cookie="secretProof="+data.secretProof;
                                initLoginWindow( onlogin );

                            }

                        });

                    });

                    $('#userCheck').on('change', function( e ){

                        var email = this.value;

                        $.ajax({

                            url : config.getDomain() + ':' + config.getPort() + '/login',
                            type: 'POST',
                            crossOrigin: true,
                            data : { email : email },
                            success : function( data ){

                                Editor.user.setID( data.userID );
                                userID = data.userID;

                            },
                            error : function ( data ){

                                document.cookie="token="+data.token;
                                document.cookie="secretProof="+data.secretProof;
                                initLoginWindow( onlogin );

                            }
                        });

                    });


                    $('#loginForm').on( 'hidden.bs.modal', function(){

                        $(this).remove();

                    });

                    $('#loginForm').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });


                },

            });

        }



        // inicjalizacja najmniejszego okienka np dla logowania/ usuwania obiektów
        // type to rodzaj np alert, warning itp
        initSmallWindow ( icon, title, content, type ){

            var window = document.createElement('div');
            window.className = 'window small ' + type;

            window.appendChild( makeWindowTitleBox( icon, title ) );

            return window;

        }



        initLoginForm (){

            var content


        }



        saveThemePageWindow ( image, currentTheme ){
            let self = this;
            if( this.editor.adminProject.format.theme.getID() == null ){

                alert('najpierw musisz aktywować motyw!');
                return;

            }

            $.ajax({

                url : 'templates/savePageTheme.html',
                type : 'GET',
                crossDomain : true,
                success : function( data ){

                        //alert('tutaj włazi');
                        $('body').append( data );
                        $("#themePagePreview").append( '<img id="themeThumbnail" src="'+image+'">' );

                        $('#saveThemePageWindow').on('shown.bs.modal', function() {

                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });

                        });

                        var projectThemes = self.editor.adminProject.format.getThemes();

                        /*
                        for( var i=0; i < projectThemes.length; i++ ){

                            var themeTitle = document.createElement('span');
                            themeTitle.className = 'themeName';
                            themeTitle.innerHTML = projectThemes[i].name;
                            themeTitle.setAttribute('data-theme-name', projectThemes[i].name );

                            var showPages = document.createElement('span');
                            showPages.className = 'EditPages';
                            showPages.addEventListener('click', function(){

                                Editor.template.overlayBlock( content, 'big');

                            });

                            var theme = document.createElement('div');
                            theme.className = 'themeMiniature';
                            theme.setAttribute( 'data-theme-id', projectThemes[i]._id );
                            theme.setAttribute( 'data-main-theme-id', projectThemes[i].MainTheme );
                            theme.appendChild( themeTitle );

                            theme.addEventListener('click', function(){

                                if( $(this).hasClass('active') )
                                    $(this).removeClass('active');
                                else
                                    $(this).addClass('active')

                            });

                            $('#saveThemePageWindow #addThemePageThemesSelection').append( theme );

                        }
                        */

                        //$('#saveThemePageWindow #addThemePageThemesSelection').html('miejsce na motywy');

                        $('#saveThemePageWindow').on( 'hidden.bs.modal', function(){
                            $(this).remove();
                        });

                        $("button#saveThemePage").on('click', function(){

                                var loader = document.createElement('div');
                                loader.className = 'loader';

                                var loaderInfo = document.createElement('div');
                                loaderInfo.className = 'loaderInfo';
                                loaderInfo.innerHTML = 'Trwa zapisywanie strony do motywu';

                                document.body.appendChild( loader );

                                var name = $("#themePageName").val();
                                var base64 =  $("#themeThumbnail").attr('src');
                                var themeID = self.editor.adminProject.format.theme.getID();
                                var mainThemeID = self.editor.adminProject.format.theme.getParentThemeID();
                                var order = 0;
                                var width = self.editor.pageThemToSave.width;
                                var height = self.editor.pageThemToSave.height;
                                var backgroundObjects = self.editor.pageThemToSave.backgroundObjects;
                                var foregroundObjects = self.editor.pageThemToSave.foregroundObjects;
                                var addGlobaly = document.getElementById("addGlobaly").checked;

                                if( addGlobaly ){

                                    loader.addEventListener('Theme_copyPageFromMainTheme', function( data ){

                                        var _this = this;

                                        $(this).animate({'opacity': 0}, function(){

                                            $(_this).remove();

                                        });

                                    });

                                    loader.setAttribute( 'waiting-for', '_getUsedPages' );

                                    //console.log( self.editor.adminProject.format.view.page.get().currentPageInfo.vacancy );
                                    //console.log('<<<<<<<<<<<>>>>>>>>>>>>>>!!!!!!!!!!!!!!!@@@@@@@@@@@@@@@@###################');

                                    self.editor.webSocketControllers.mainTheme.addPage( mainThemeID, name, width, height, backgroundObjects, foregroundObjects, order, self.editor.adminProject.format.view.page.get().currentPageInfo.vacancy, base64, function( data ){

                                        self.editor.webSocketControllers.theme.copyPageFromMainTheme( themeID, data.page._id, data.mainThemeID );

                                    });

                                }
                                else {

                                    loader.addEventListener('_getUsedPages', function( data ){

                                        var _this = this;

                                        $(this).animate({'opacity': 0}, function(){

                                            $(_this).remove();

                                        });

                                    });
                                    loader.setAttribute( 'waiting-for', '_getUsedPages');
                                    self.editor.webSocketControllers.theme.addLocalPage( themeID, name, width, height, backgroundObjects, foregroundObjects, order, self.editor.adminProject.format.view.page.get().currentPageInfo.vacancy, base64 )

                                }

                        });

                        setTimeout( function(){
                            $('#saveThemePageWindow').modal({
                                keyboard: false,
                                backdrop: 'static'
                            });
                        }, 300 );
                },
                error : function( data ){

                }

            });

        }



        // musi miec dodany atrybut is, któy mowi o tym skąd owa strona pochodzi:)
        themePageElement ( themePageObject ){

            //console.log( themePageObject );
            //console.log('hjdsahjdsflhjkfadshjlk dfsahjkldfsa hkljadfs hjklfds akhjlfads hjkl adfs ');

            var theme = this.editor.adminProject.format.theme;
            var Editor = this.editor;
            var element = null;

            if( themePageObject.is == 'copied' ){

                var element = document.createElement('div');
                element.className = 'addedThemePage themePageElement';

                if( themePageObject.vacancy ){

                    element.className += ' vacancy';

                }

                element.setAttribute('data-theme-page-id', themePageObject._id );
                element.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+themePageObject.url + ')';

                var removeFromProjectTheme = document.createElement('div');
                removeFromProjectTheme.className = 'removeThemePageFromProjectTheme';
                removeFromProjectTheme.setAttribute('data-theme-page-id', themePageObject._id );

                removeFromProjectTheme.innerHTML = '-';

                removeFromProjectTheme.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.theme.removeCopiedPage( this.getAttribute( 'data-theme-page-id' ), Editor.adminProject.format.theme.getID() );

                });

                element.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){

                        Editor.adminProject.format.view.page.loadThemePage( data );
                        //Editor.adminProject.format.view.page.get()['pageObject'].loadThemePage( data );

                    });

                });

                element.appendChild( removeFromProjectTheme );

                var clone = document.createElement('div');
                clone.className = 'cloneElem';

                element.appendChild( clone );

                clone.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.theme.cloneCopiedPage( Editor.adminProject.format.theme.getID(), this.parentNode.getAttribute('data-theme-page-id') );

                });

            }
            else if( themePageObject.is == 'main' ){

                element = document.createElement('div');
                element.className = 'mainThemePage themePageElement';
                element.setAttribute('data-theme-page-id', themePageObject._id );
                element.style.backgroundImage = 'url(' + themePageObject.url + ')';

                var addToLocalTheme = document.createElement('div');
                addToLocalTheme.className = 'addThemePageToProjectTheme';
                addToLocalTheme.setAttribute('data-theme-page-id', themePageObject._id );
                addToLocalTheme.setAttribute('main-theme-id', theme.getParentThemeID() );
                addToLocalTheme.innerHTML = '+';

                addToLocalTheme.addEventListener( 'click', function( e ){

                    e.stopPropagation();
                    var mainThemePageId = this.getAttribute( 'data-theme-page-id' );
                    var mainThemeId = this.getAttribute('main-theme-id');
                    Editor.webSocketControllers.theme.copyPageFromMainTheme( theme.getID(), mainThemePageId, mainThemeId );

                });

                element.appendChild( addToLocalTheme );

                element.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('data-theme-page-id'), function( data ){

                        //Editor.adminProject.format.view.page.loadThemePage( data );
                        Editor.adminProject.format.view.page.loadThemePage( data );

                    });

                });

            }

            else if( themePageObject.is == 'local' ){

                element = document.createElement('div');
                element.className = 'localThemePage themePageElement';
                element.setAttribute('theme-page-id', themePageObject._id );
                element.style.backgroundImage = 'url(' + themePageObject.url + ')';

                var removeElement = document.createElement('div');
                removeElement.className = 'removeThemePage';
                removeElement.setAttribute( 'data-theme-page-id', themePageObject._id );
                removeElement.setAttribute( 'theme-id', theme.getID() );
                removeElement.innerHTML = '-';

                removeElement.addEventListener('click', function ( e ) {

                    e.stopPropagation();
                    Editor.webSocketControllers.theme.removeLocalPage( this.getAttribute( 'theme-id' ), this.getAttribute( 'data-theme-page-id' ) );

                });


                var copyToMainThemeElement = document.createElement('div');
                copyToMainThemeElement.className = 'copyPageToMainTheme';
                copyToMainThemeElement.setAttribute('main-theme-id', theme.getParentThemeID() );
                copyToMainThemeElement.setAttribute('theme-id', theme.getID() );
                copyToMainThemeElement.setAttribute('theme-page-id', themePageObject._id );

                copyToMainThemeElement.addEventListener('click', function( e ){

                    e.stopPropagation();
                    Editor.webSocketControllers.mainTheme.copyPageFromLocal( this.getAttribute('main-theme-id'), this.getAttribute('theme-id'), this.getAttribute('theme-page-id') );

                });

                element.addEventListener('click', function( e ){

                    e.stopPropagation();

                    Editor.webSocketControllers.themePage.get( this.getAttribute('theme-page-id'), function( data ){

                        Editor.adminProject.format.view.page.loadThemePage( data );

                    });

                });

                element.appendChild( copyToMainThemeElement );
                element.appendChild( removeElement );

            }

            if( themePageObject.proposedTemplates.length == 0 && themePageObject.is != "main"){

                var info_cont = document.createElement('div');
                info_cont.className = 'error-box-info';

                var info = document.createElement('div');
                info.className = 'theme-page-error';
                info.innerHTML = 'Brak dodanych szablonów pozycji proponowanych!';

                info_cont.appendChild( info );
                element.appendChild( info_cont );

            }

            return element;

        }



        newFrameWindow (){

            var cropper = document.createElement('div');
            cropper.className = 'imageCropper';

            var cropperHelper = document.createElement('div');
            cropperHelper.className = 'cropperHelper';

            cropper.appendChild( cropperHelper );

            cropper.style.left = 0;
            cropper.style.top = 0;

            var frameContent = document.createElement('div');
            frameContent.className = 'frameContent';

            var fileContainer = document.createElement('div');
            fileContainer.className = 'imageToCrop';
            fileContainer.translate = false;
            fileContainer.scale = false;

            fileContainer.addEventListener('mousedown', function( e ){

                e.stopPropagation();

                if( e.target.className == 'imageCropper' ){

                    this.translate = true;
                    this.scale = false;

                }else if( e.target.className == 'cropperHelper' ){

                    this.scale = true;
                    this.translate = false;

                }

            }.bind( fileContainer ));

            fileContainer.addEventListener('mouseup', function( e ){

                this.translate = false;
                this.scale = false;

            }.bind( fileContainer ));


            fileContainer.addEventListener('mousemove', function( e ){

                if( this.translate ){

                    var currentPosX = parseInt(cropper.style.left);
                    var currentPosY = parseInt(cropper.style.top);

                    cropper.style.left = (currentPosX + e.movementX) + 'px';
                    cropper.style.top = (currentPosY + e.movementY) + 'px';


                }else if( this.scale ){

                    var currentWidth = parseInt(cropper.offsetWidth);
                    var currentHeight = parseInt(cropper.offsetHeight);

                    cropper.style.width = (currentWidth + e.movementX) + 'px';
                    cropper.style.height = (currentHeight + e.movementY) + 'px';

                }

                //console.log( cropper.parentNode );
                //console.log( cropper );

                inputTop.value = ( ( cropper.getBoundingClientRect().top - cropper.parentNode.getBoundingClientRect().top )/cropper.parentNode.getBoundingClientRect().height )*100;
                inputLeft.value = ( ( cropper.getBoundingClientRect().left - cropper.parentNode.getBoundingClientRect().left )/cropper.parentNode.getBoundingClientRect().width )*100;
                inputWidth.value = ( (cropper.getBoundingClientRect().width/cropper.parentNode.getBoundingClientRect().width)*100 );
                inputHeight.value = ( (cropper.getBoundingClientRect().height/cropper.parentNode.getBoundingClientRect().height)*100 );

            }.bind( fileContainer ));

            fileContainer.addEventListener('dragover', function( e ){

                e.preventDefault();
                e.stopPropagation();

            });

            fileContainer.addEventListener('drop', function( e ){

                e.stopPropagation();
                e.preventDefault();

                fileContainer.file = e.dataTransfer.files[0];
                fileContainer.image = URL.createObjectURL( fileContainer.file );

                var img = new Image();

                img.onload = function( e ){

                    if( img.width > 600 ){

                        var aspect = img.width/600;

                        fileContainer.trueWidth = img.width;
                        fileContainer.trueHeight = img.height;
                        fileContainer.style.width = 600 + 'px';
                        fileContainer.style.height = (img.height/aspect) + 'px';

                    }else {

                        fileContainer.trueWidth = img.width;
                        fileContainer.trueHeight = img.height;
                        fileContainer.style.width = img.width + 'px';
                        fileContainer.style.height = img.height + 'px';

                    }

                    fileContainer.appendChild( img );
                    fileContainer.appendChild( cropper );

                }.bind( this );

                img.src = fileContainer.image;

                img.addEventListener('mousedown', function( e ){

                    e.stopPropagation();

                });

            });

            frameContent.appendChild( fileContainer );

            var form = document.createElement('form');
            form.id = 'addNewFrameForm';

            var nameInput = document.createElement('input');
            var inputTop = document.createElement('input');
            inputTop.className = 'topOffset';
            var inputLeft = document.createElement('input');
            inputLeft.className = 'leftOffset';
            var inputWidth = document.createElement('input');
            inputWidth.className = 'cropWidth';
            var inputHeight = document.createElement('input');
            inputHeight.className = 'cropHeight';

            var save = document.createElement('div');
            save.innerHTML = 'Zapisz ramkę';
            save.className = 'button-fw';
            var _this = this;
            save.addEventListener('click', function( e ){

                e.stopPropagation();

                var bitmap = new createjs.Bitmap( fileContainer.image );
                var obrazek = _this.editor.ThumbsMaker.generateThumb( bitmap );

                var image = fileContainer.file;

                var fileData = new FormData();

                //console.log( _this.editor );

                fileData.append("userFile", image );
                fileData.append("userProjectID", _this.editor.userProject.getID() );
                fileData.append("objectID", _this.dbID );
                fileData.append('companyID', _this.editor.config.getCompanyID() );
                fileData.append('minSize', JSON.stringify( obrazek.minSize ) );
                fileData.append('thumbSize', JSON.stringify( obrazek.thumbSize ) );
                for (var value of fileData.values()) {
                   //console.log(value);
                }
                //console.log( 'JAKIE dane leca do ramki' );
                var request = new XMLHttpRequest();

                request.upload.addEventListener('progress', function( data ){

                    //console.log( data );
                    /*
                    var evt = document.createEvent("Event");
                    evt.initEvent("progress", true, false);
                    evt.progress = parseInt( data.loaded/data.total*100 );
                    that.statusBar.dispatchEvent(evt);
                    */

                });

                request.open("POST", _this.editor.config.getDomain() +':'+_this.editor.config.getPort()+'/upload/projectImage/', true);

                request.send( fileData );

                request.onreadystatechange = function( aEvt ){

                    if( request.readyState == 4 ){

                        //console.log('ZOSTALO DODANE :)');
                        var resp = JSON.parse(request.responseText);
                        var projectImage = new ProjectImage();
                        //console.log( resp );
                        //console.log( '0---=-====000---==' );
                        function callback( data ){

                            var dataToUpdate = {

                                projectImageUID : data.uid,
                                uploadID : resp._id

                            };

                            //console.log( data );
                            _this.editor.webSocketControllers.projectImage.update( dataToUpdate );
                            _this.editor.webSocketControllers.frameObject.add( inputLeft.value, inputTop.value, inputWidth.value, inputHeight.value, data._id, resp._id );
                            //console.log('Powinono sie wyswietlic :)');
                        }

                        _this.editor.webSocketControllers.projectImage.addNoRef(

                            projectImage.uid,
                            fileContainer.file.name,
                            'bitmap',
                            resp.url,
                            resp.minUrl,
                            resp.thumbUrl,
                            obrazek.minSize.width,
                            obrazek.minSize.height,
                            fileContainer.trueWidth,
                            fileContainer.trueHeight,
                            callback

                        );

                    }

                };

            });

            form.appendChild( nameInput );
            form.appendChild( inputTop );
            form.appendChild( inputLeft );
            form.appendChild( inputWidth );
            form.appendChild( inputHeight );
            form.appendChild( save );

            frameContent.appendChild( form );

            var newViewWindow = this.displayWindow(
                'newFrameWindow',
                {
                    title : 'Dodaj nową ramkę',
                    content : frameContent,
                }

            );

            $('body').append( newViewWindow );


            $('#newFrameWindow').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#newFrameWindow').modal({

                keyboard: false,
                backdrop: 'static'

            });

        }



        newViewWindow (){

            var viewForm = document.createElement( 'div' );

            var viewForm_Name = document.createElement( 'input' );
            viewForm_Name.className = 'default-input';
            viewForm_Name.name = 'viewName';

            var viewForm_Name_Label = document.createElement('label');
            viewForm_Name_Label.id = 'viewForm_Name_Label';
            viewForm_Name_Label.className = 'label';
            viewForm_Name_Label.innerHTML = 'Podaj nazwę nowego widoku:';
            viewForm_Name_Label.appendChild( viewForm_Name);

            var viewForm_Save = document.createElement( 'span' );
            viewForm_Save.innerHTML = "Dodaj nowy widok";
            viewForm_Save.className = 'default-accept button-fw';

            viewForm.appendChild( viewForm_Name_Label );
            viewForm.appendChild( viewForm_Save );

            viewForm_Save.addEventListener('click', function(){

                var viewsLength = this.editor.adminProject.format.getViews().length;

                this.editor.webSocketControllers.view.add( $("input[name=viewName]").val(), viewsLength, this.editor.adminProject.format.getDbId() );

            }.bind( this ));

            var newViewWindow = this.displayWindow(
                'newViewWindow',
                {
                    title : 'Dodaj nowy widok',
                    content : viewForm,
                }

            );

            $('body').append( newViewWindow );


            $('#newViewWindow').on( 'hidden.bs.modal', function(){

                $(this).remove();

            });

            $('#newViewWindow').modal({

                keyboard: false,
                backdrop: 'static'

            });


        }


        /**
        * Generuje element widoków projektu
        *
        * @method generateViews
        * @param {Array} views Tablica obiektów widoków
        */
        generateViews (){

            var tool = document.createElement('div');
            tool.id = 'views-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';


            var toolButton = document.createElement('span');
            toolButton.id = 'views-container-tool_button';


            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'views-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować widoki produktu</span>';

            tool.appendChild( toolHelper );
            // views content
            var toolContent = document.createElement('div');
            toolContent.id = 'views-content';


            var toolMainContent = document.createElement('div');
            toolMainContent.id = 'viewMain-content';

            toolContent.appendChild( toolMainContent );


            var viewsList = document.createElement('ul');
            viewsList.id = 'views-list';


            // przyciski w kontencie
            var toolContentButtons = document.createElement('div');
            toolContentButtons.id = 'views-content-buttons';


            var addNewView_button = document.createElement('span');
            addNewView_button.id = 'addNewView';
            addNewView_button.className = 'button-fw';
            addNewView_button.innerHTML = "Stwórz kolejny widok";

            addNewView_button.addEventListener('click', function(){

                this.newViewWindow();

            }.bind( this ));

            toolContentButtons.appendChild( addNewView_button );



            // dodanie przycisków
            toolMainContent.appendChild( toolContentButtons );
            toolMainContent.appendChild( viewsList );

            var toolsContainer = document.getElementById("toolsContent");
            toolsContainer.appendChild( toolContent );

            // programowanie przycisku views
            toolButton.addEventListener('click', function(){



            });

            Ps.initialize( viewsList );

            //funkcje inicjalizujące
            return tool;

        }


        /**
        * Generuje element widoków projektu
        *
        * @method generateFramesPanel
        * @param {Array} views Tablica obiektów widoków
        */
        generateFramesPanel(){

            var tool = document.createElement('div');
            tool.id = 'frames-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';


            var toolButton = document.createElement('span');
            toolButton.id = 'frames-container-tool_button';


            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'frames-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz dodać ramki pozycji proponowanych</span>';

            tool.appendChild( toolHelper );
            // views content
            var toolContent = document.createElement('div');
            toolContent.id = 'frames-content';


            var toolMainContent = document.createElement('div');
            toolMainContent.id = 'viewMain-content';

            toolContent.appendChild( toolMainContent );

            toolMainContent.addEventListener('click', function( e ){

                e.stopPropagation();

                if( $(e.target).hasClass( 'image-remover' )){

                    Editor.webSocketControllers.frameObject.remove( e.target.getAttribute( 'data-id' ) );

                }

            });


            var viewsList = document.createElement('ul');
            viewsList.id = 'frames-list';


            // przyciski w kontencie
            var toolContentButtons = document.createElement('div');
            toolContentButtons.id = 'frames-content-buttons';


            var addNewView_button = document.createElement('span');
            addNewView_button.id = 'addNewFrame';
            addNewView_button.className = 'button-fw';
            addNewView_button.innerHTML = "Dodaj nową ramkę";

            addNewView_button.addEventListener('click', function(){

                this.newFrameWindow();

            }.bind( this ));

            toolContentButtons.appendChild( addNewView_button );

            // dodanie przycisków
            toolMainContent.appendChild( toolContentButtons );
            toolMainContent.appendChild( viewsList );

            var toolsContainer = document.getElementById("toolsContent");
            toolsContainer.appendChild( toolContent );

            // programowanie przycisku views
            toolButton.addEventListener('click', function(){



            });

            Ps.initialize( viewsList );

            //funkcje inicjalizujące
            return tool;

        }


        /**
        * Generuje element widoków projektu
        *
        * @method generateViews
        * @param {Array} views Tablica obiektów widoków
        */
        generateComplexViews(){

            var tool = document.createElement('div');
            tool.id = 'views-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';


            var toolButton = document.createElement('span');
            toolButton.id = 'views-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'views-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować widoki produktu złożonego</span>';

            tool.appendChild( toolHelper );
            // views content
            var toolContent = document.createElement('div');
            toolContent.id = 'views-content';


            var viewsList = document.createElement('ul');
            viewsList.id = 'views-list';

            toolContent.appendChild( viewsList );

            // przyciski w kontencie
            var toolContentButtons = document.createElement('div');
            toolContentButtons.id = 'views-content-buttons';


            var addNewView_button = document.createElement('span');
            addNewView_button.id = 'addNewView';
            addNewView_button.className = 'button-fw';
            addNewView_button.innerHTML = "Stwórz kolejny widok";

            addNewView_button.addEventListener('click', function(){

                $.ajax({

                    url : 'templates/newThemeCategory.html',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        $('body').append( data );

                    }


                });

                var viewForm = document.createElement( 'div' );

                var viewForm_Name = document.createElement( 'input' );
                viewForm_Name.className = 'default-input';
                viewForm_Name.name = 'viewName';

                var viewForm_Name_Label = document.createElement('label');
                viewForm_Name_Label.innerHTML = 'Nazwa nowego widoku:';
                viewForm_Name_Label.appendChild( viewForm_Name);

                var viewForm_Save = document.createElement( 'span' );
                viewForm_Save.innerHTML = "Dodaj nowy widok";
                viewForm_Save.className = 'default-accept';

                viewForm.appendChild( viewForm_Name_Label );
                viewForm.appendChild( viewForm_Save );

                overlayBlock( viewForm );

                viewForm_Save.addEventListener('click', function(){

                    Editor.complexAdminProject.complexView.add( $("input[name=viewName]").val() );

                });


                Editor.stage.resetScene();


            });

            toolContentButtons.appendChild( addNewView_button );


            // dodanie przycisków
            toolContent.appendChild( toolContentButtons );

            var toolsContainer = document.getElementById("toolsContent");
            toolsContainer.appendChild( toolContent );


            // programowanie przycisku views
            toolButton.addEventListener('click', function(){



            });

            //funkcje inicjalizujące
            return tool;

        }


        /**
        * Generuje element szablonów dla danego motywu
        *
        * @method generateProposedTemplates
        * @param {int} theme_page id strony motywu
        */
        generateProposedTemplates ( theme_page ){

            var tool = document.createElement('div');
            tool.id = 'proposedTemplate-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'proposedTemplate-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'proposedTemplate-content');

            tool.appendChild( toolButton );

            var toolContent = document.createElement('div');
            toolContent.id = 'proposedTemplate-content';
            //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

            document.getElementById("toolsContent").appendChild( toolContent );

            /*
            // tworzenie obiektu pozwalającego dodać szablon pozycji dla danego motywu
            var addProposedTemplates = document.createElement("span");
            addProposedTemplates.id = 'addProposedTemplate';
            addProposedTemplates.className = 'add';
            addProposedTemplates.innerHTML = "Dodaj gotowy szablon";

            addProposedTemplates.addEventListener('click', function(){

                ///alert('musze pobrać informacje z bazy danych');

                Editor.proposedTemplates.getProposedTemplates();


            });

            toolContent.appendChild( addProposedTemplates );
            */

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz zmienić układ zdjęć</span>';

            tool.appendChild( toolHelper );


            Ps.initialize( toolContent );

            return tool;

        }


        /**
        * Generuje element z ustawieniami formatu
        *
        * @method generateProposedTemplates
        * @param {int} theme_page id strony motywu
        */
        generateThemesCopyTool (){

            var tool = document.createElement('div');
            tool.id = 'ThemesCopyTool-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';


            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'ThemesCopyTool-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'ThemesCopyTool-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Kopiować motywy z motywu głównego</span>';

            tool.appendChild( toolHelper );

            var toolContent = document.createElement('div');
            toolContent.id = 'formatSettings-content';

            var toolTitle = document.createElement('h3');
            toolTitle.className = 'toolTitle';
            toolTitle.innerHTML = 'Kopiowanie motywów';

            var attributesView = document.createElement('div');
            attributesView.id = 'attributesView';

            toolContent.appendChild( toolTitle );
            toolContent.appendChild( attributesView );
            //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

            var formatSettingsContent =document.createElement('div');
            formatSettingsContent.id = 'formatSettingsContent';
            formatSettingsContent.className = 'formatSettingsContent';

            toolContent.appendChild( formatSettingsContent );

            document.getElementById('toolsContent').appendChild( toolContent );

            var fonts = document.createElement('div');
            fonts.className = 'fontsSettings';
            fonts.id = 'fontsSettings';

            var fontsList = document.createElement('div');
            fontsList.className = 'fontsList';
            fontsList.id = 'fontsList';

            var addFont = document.createElement('div');
            addFont.className = 'button-fw';
            addFont.innerHTML = 'Dodaj czcionkę';
            addFont.id = 'addFont';

            addFont.addEventListener('click', function( e ){

                e.stopPropagation();
                Editor.fonts.addFontBox();

            });

            var fontColors = document.createElement('div');
            fontColors.id = 'font-colors';

            var fontColors_title = document.createElement('h3');
            fontColors_title.innerHTML = 'Kolory czcionek | ramek';

            var fontColorsList = document.createElement('div');
            fontColorsList.id = 'settings-font-colors-list';

            var addFontColor_button = document.createElement('button');
            addFontColor_button.className = 'button-hw';
            addFontColor_button.innerHTML = 'Dodaj nowy kolor';
            addFontColor_button.id = 'addFontColor_button';

            addFontColor_button.addEventListener('click', function( e ){

                e.stopPropagation();
                var newColor = prompt('Podaj nowy kolor w HEX');

                Editor.webSocketControllers.adminProject.addColor( "#" + newColor );

            });

            var saveColors = document.createElement('button');
            saveColors.className = 'button-hw';
            saveColors.innerHTML = 'Zapisz kolory';
            saveColors.id = 'saveColors';

            saveColors.addEventListener('click', function( e ){

                e.stopPropagation();

                var listElement = document.getElementById('settings-font-colors-list');
                var activeColors = document.querySelectorAll('#settings-font-colors-list .font-color.active');

                var arrayOfColors = [];

                for( var i=0; i<activeColors.length; i++ ){

                    var activeColor = activeColors[i];
                    arrayOfColors.push( Editor.rgb2hex( activeColor.style.backgroundColor ) );

                }

                Editor.webSocketControllers.adminProject.setActiveColors( arrayOfColors );

            });


            fontColors.appendChild( fontColors_title );
            fontColors.appendChild( fontColorsList );
            fontColors.appendChild( addFontColor_button );
            fontColors.appendChild( saveColors );

            fonts.appendChild( fontsList );
            fonts.appendChild( addFont );
            fonts.appendChild( fontColors );

            toolContent.appendChild( fonts );



            return tool;

        }


        createFontElement ( fontName, fontPrevUrl, fontUrls ){

            var fontElement = document.createElement('div');
            fontElement.className = 'fontElementDiv';
            fontElement.setAttribute('regularUrl', fontUrls.regular );
            fontElement.setAttribute('italicUrl', fontUrls.italic );
            fontElement.setAttribute('boldUrl', fontUrls.bold );
            fontElement.setAttribute('boldItalicUrl', fontUrls.boldItalic );

            var fontNameBlock = document.createElement('div');
            fontNameBlock.className = 'fontElementName';
            fontNameBlock.innerHTML = fontName;

            var fontPhotoPrev = document.createElement('div');
            fontPhotoPrev.className = 'fontElementDivPrev';
            fontPhotoPrev.style.backgroundImage = 'url('+EDITOR_ENV.staticUrl+fontPrevUrl+')';

            fontElement.appendChild( fontNameBlock );
            fontElement.appendChild( fontPhotoPrev );

            return fontElement;

        }



        updateAvailableFontsBlock ( fontsList ){

            var fontObject = document.getElementById('fontsList');
            //var fontListElement = document.querySelector('#fontsList .viewport .overview');

            if ( fontObject ){
                fontObject.innerHTML = '';


                for( var key in fontsList ){

                    var elem = fontsList[ key ];

                    var fontUrls = {

                        regular    : elem.FontTypes.Regular,
                        italic     : elem.FontTypes.Italic,
                        bold       : elem.FontTypes.Bold,
                        boldItalic : elem.FontTypes.BoldItalic

                    };

                    fontObject.appendChild( this.createFontElement( key, elem.miniature, fontUrls ) );

                }

                //var fontsScroll = $('#fontsScroll');
                //var fontsScroll = fontsScroll.data("plugin_tinyscrollbar");
                //fontsScroll .update();

            }

        }


        /**
        * Generuje element z ustawieniami formatu
        *
        * @method generateProposedTemplates
        * @param {int} theme_page id strony motywu
        */
        enerateFormatSettings (){

            var tool = document.createElement('div');
            var tempBorderWidthValue;


            tool.id = 'formatSettings-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'formatSettings-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'formatSettings-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz zmienić ustawienia dla formatu</span>';

            tool.appendChild( toolHelper );

            var toolContent = document.createElement('div');
            toolContent.id = 'formatSettings-content';

            var toolMainContent = document.createElement('div');
            toolMainContent.id = 'formatSettingsMain-content';

            toolContent.appendChild( toolMainContent );

            var toolTitle = document.createElement('h3');
            toolTitle.className = 'toolTitle';
            toolTitle.innerHTML = 'Ustawienia'

            var attributesView = document.createElement('div');
            attributesView.id = 'attributesView';

            toolMainContent.appendChild( toolTitle );
            toolMainContent.appendChild( attributesView );
            //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";

            var formatSettingsContent =document.createElement('div');
            formatSettingsContent.id = 'formatSettingsContent';
            formatSettingsContent.className = 'formatSettingsContent';

            toolMainContent.appendChild( formatSettingsContent );

            document.getElementById('toolsContent').appendChild( toolContent );

            var fonts = document.createElement('div');
            fonts.className = 'fontsSettings';

            fonts.innerHTML = '<h4>Dostępne czcionki</h4>';

            var fontsList = document.createElement('div');
            fontsList.id = 'fontsList';
            fontsList.className = 'fontsList';



            var addFont = document.createElement('div');
            addFont.className = 'button-fw';
            addFont.innerHTML = 'DODAJ CZCIONKĘ';


            addFont.addEventListener('click', function( e ){

                e.stopPropagation();
                $.ajax({

                    url: 'templates/addFont.html',
                    type: 'GET',
                    crossOrigin: true,
                    success : function( data ){

                        $('body').append( data );

                        $('#addFontModal').on('shown.bs.modal', function() {
                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });
                        });


                        Editor.fonts.fontLoader(
                            document.getElementById( 'fontDrop_regular' ),
                            document.getElementById( 'fontFile_Regular' )
                        );

                        Editor.fonts.fontLoader(
                            document.getElementById( 'fontDrop_italic' ),
                            document.getElementById( 'fontFile_italic' )
                        );

                        Editor.fonts.fontLoader(
                            document.getElementById( 'fontDrop_bold' ),
                            document.getElementById( 'fontFile_bold' )
                        );

                        Editor.fonts.fontLoader(
                            document.getElementById( 'fontDrop_bolditalic' ),
                            document.getElementById( 'fontFile_boldItalic' )
                        );

                        document.getElementById('addNewFont_save').addEventListener('click', function( e ){

                            Editor.fonts.uploadFontFile( function(){

                                alert('czcionka zostala zapisana');
                                $("#overflow-box").animate({opacity: 0.}, 1000, function(){ $("#fontBox, #overflow-box").remove(); });

                            });

                        });

                        $('#addFontModal').on( 'hidden.bs.modal', function(){

                            $(this).remove();

                        });

                        $('#addFontModal').modal({

                            keyboard: false,
                            backdrop: 'static'

                        });

                    }

                });

                //Editor.fonts.addFontBox();

            });

            var fontColors = document.createElement('div');
            fontColors.id = 'font-colors';



            var fontColors_title = document.createElement('h3');
            fontColors_title.innerHTML = 'Kolory czcionek | ramek';

            var fontColorsList = document.createElement('div');
            fontColorsList.id = 'settings-font-colors-list';

            var addFontColor_button = document.createElement('div');
            addFontColor_button.className = 'button-fw';
            addFontColor_button.id = 'addFontColor_button';
            addFontColor_button.innerHTML = 'DODAJ NOWY KOLOR';

            addFontColor_button.addEventListener('click', function( e ){

                e.stopPropagation();
                var newColor = prompt('Podaj nowy kolor w HEX');

                Editor.webSocketControllers.adminProject.addColor( "#" + newColor );

            });

            var saveColors = document.createElement('div');
            saveColors.className = 'button-fw';
            saveColors.innerHTML = 'ZAPISZ KOLORY';
            saveColors.id = 'saveColors';

            saveColors.addEventListener('click', function( e ){

                e.stopPropagation();

                var listElement = document.getElementById('settings-font-colors-list');
                var activeColors = document.querySelectorAll('#settings-font-colors-list .font-color.active');

                var arrayOfColors = [];

                for( var i=0; i<activeColors.length; i++ ){

                    var activeColor = activeColors[i];
                    arrayOfColors.push( Editor.rgb2hex( activeColor.style.backgroundColor ) );

                }

                Editor.webSocketControllers.adminProject.setActiveColors( arrayOfColors );

            });


            fontColors.appendChild( fontColors_title );
            fontColors.appendChild( fontColorsList );
            fontColors.appendChild( addFontColor_button );
            fontColors.appendChild( saveColors );

            fonts.appendChild( fontsList );
            fonts.appendChild( addFont );
            fonts.appendChild( fontColors );

            toolMainContent.appendChild( fonts );

            Ps.initialize( fontsList );
            Ps.initialize( toolContent );
            return tool;

        }



        imageDropLoader ( dropBox, outputBox ){

            dropBox.addEventListener('dragover', function(e){
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';

                if( this.className != 'fontDrop droped')
                    this.className = 'fontDrop dragover';


            }, false);

            dropBox.addEventListener('dragleave', function( e ){

                e.stopPropagation();

                if( this.className != 'fontDrop droped')
                    this.className = 'fontDrop';

            });

            dropBox.addEventListener('dragend', function( e ){

                e.stopPropagation();

                if( this.className != 'fontDrop droped')
                    this.className = 'fontDrop';

            });

            dropBox.addEventListener('drop', function(e){

                var name = document.getElementById("fontName").value;

                if( name == "" ){

                    alert("Podaj nazwę czcionki!");
                    this.className = 'imageDrop';
                    e.stopPropagation();
                    e.preventDefault();
                    return false;

                }

                this.className = 'imageDrop droped';

                var _this = this;
                e.stopPropagation();
                e.preventDefault();
                //Editor.handleFileSelect(e, 2);

                outputBox.innerHTML = "Aa";
                var file = new FileReader();
                file.readAsDataURL( e.dataTransfer.files[0] );

                file.onload = function( freader ){

                    addTmpFont( name );
                    addTmpFontType( name, _this.getAttribute("data-type"), freader.target.result );
                    loadTmpFont( name);
                    outputBox.style.fontFamily = _this.style.fontFamily = name +"_" + _this.getAttribute("data-type");

                };

            });

        }


        addTmpImage ( name ){

            if( !_fontsToUpload[name] )
                _fontsToUpload[name] = {};

        }


        addTmpImageType ( name, type, file ){

            _fontsToUpload[name][type] = file;

        }


        loadTmpImage ( name ){

            for( var imageType in _imagesToUpload[name] ){
                $("head").prepend("<style type=\"text/css\">" +
                    "@font-face {\n" +
                        "\tfont-family: \""+ name +"_"+ fontType +"\";\n" +
                        "\tsrc: url("+ _imagesToUpload[name][fontType]+") format('truetype');\n" +
                    "}\n" +
                   "</style>");
            }

        }



        /**
        * Generuje element z przełącznikiem dla ramki
        *
        * @method generateFlatSwitch
        *
        */
        generateFlatSwitchBorder(){

            var flatSwitchBorder = document.createElement('div');

            flatSwitchBorder.className = "block-switch";
            flatSwitchBorder.innerHTML = '<input id="custom-toggle-flat-border" class="custom-toggle custom-toggle-flat" type="checkbox">'+
                                    '<label for="custom-toggle-flat-border"></label>';

            return flatSwitchBorder;

        }



        /**
        * Generuje element z przełącznikiem dla alphy
        *
        * @method generateFlatSwitch
        *
        */
        generateFlatSwitch (){

            var flatSwitch = document.createElement('div');

            flatSwitch.className = "block-switch";
            flatSwitch.innerHTML = '<input id="custom-toggle-flat" class="custom-toggle custom-toggle-flat" type="checkbox">'+
                                    '<label for="custom-toggle-flat"></label>';

            return flatSwitch;

        }



        /**
        * Generuje element z ustawieniami obiektu
        *
        * @method generateObjectSettings
        * @param {int} theme_page id strony motywu
        */
        generateObjectSettings (){

            var Editor = this.editor;
            var tool = document.createElement('div');
            tool.id = 'objectSettings-container-tool';
            tool.className = 'tool closed';
            //tool.style.width = '1200px';
            var sizeProportions = true;

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'objectSettings-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'objectSettings-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować obrazy i efekty</span>';

            tool.appendChild( toolHelper );

            // ustawienia ramki dla obiektu
            var borderTool = document.createElement('div');
            borderTool.id = 'objectBorder';

            var borderToolTitle = document.createElement('h4');
            borderToolTitle.innerHTML = 'Ramka/obrys';

            var borderWidth = document.createElement('input');
            borderWidth.id = 'borderWidth';
            borderWidth.className = 'spinner';

            var borderWidthLabel = document.createElement('label');
            borderWidthLabel.innerHTML = 'Szerokość';

            borderWidthLabel.appendChild( borderWidth );
            borderTool.appendChild( borderToolTitle );
            borderTool.appendChild( borderWidthLabel );


            var toolContent = document.createElement('div');
            toolContent.id = 'objectSettings-content';
            var toolTitle = document.createElement('h3');
            toolTitle.className = 'toolTitle';
            toolTitle.innerHTML = 'Edycja obiektu';



            //scrollObject : imagesScrollContainer,
            //viewport : imagesScrollViewport

            document.getElementById('toolsContent').appendChild( toolContent );

            //borderColor
            var colorInput = document.createElement('div');
            colorInput.id = "colorBorder";

            var currentColor = document.createElement('span');
            currentColor.id = 'current-text-color';

            colorInput.appendChild( currentColor );

            var colorPalette = document.createElement('div');
            colorPalette.id = 'colorPaletteBorder';

            var activeColors = Editor.adminProject.getActiveColors();

            for( var i=0; i < activeColors.length; i++ ){

                var colorElement = document.createElement('div');
                colorElement.className = 'colorPaletteElement';
                colorElement.style.backgroundColor = activeColors[i];

                colorElement.addEventListener('click', function( e ){

                    e.stopPropagation();

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderColor( Editor.rgb2hex(this.style.backgroundColor) );
                    editingObject.updateSimpleBorder();

                });

                colorPalette.appendChild( colorElement );

            }

            colorInput.addEventListener('click', function(){

                if( $("#colorPaletteBorder").hasClass('open') ){

                    $("#colorPaletteBorder").removeClass('open');

                }else {

                    $("#colorPaletteBorder").addClass('open');

                }

            });


            // ustawienia pozycji obrazka
            var positionSettings = document.createElement('div');
            positionSettings.className = 'positionSettings';

            var positionSettingsTitle = document.createElement('h4')
            positionSettingsTitle.className = 'posSetHeader';
            positionSettingsTitle.innerHTML = 'Rozmiar i położenie';


            var positionWLabel = document.createElement('label');
            positionWLabel.className = 'posSetWlabel';
            positionWLabel.innerHTML = "W:";


            //----------------------------//
            // Przycisk proporcjonalności //
            //----------------------------//
            var proportionTool = document.createElement('div');
            proportionTool.className = ('proportionTool turnOn');
            proportionTool.id = ('proportionTool');


            proportionTool.addEventListener('click', function( e ){

                if ( sizeProportions == false ){
                    sizeProportions = true;
                }else if( sizeProportions == true ){
                    sizeProportions = false;
                }

                e.stopPropagation();

                if( $("#proportionTool").hasClass('proportionTool turnOff') ){

                    $("#proportionTool").removeClass('proportionTool turnOff');
                    $("#proportionTool").addClass('proportionTool turnOn');

                }else if( $("#proportionTool").hasClass('proportionTool turnOn') ){

                    $("#proportionTool").removeClass('proportionTool turnOn');
                    $("#proportionTool").addClass('proportionTool turnOff');

                }

            });


            var resizeTools = document.createElement('div');
            resizeTools.className = 'resizeToolContainer';


            var positionSZLabel = document.createElement('label');
            positionSZLabel.className = 'posSetSZlabel';
            positionSZLabel.innerHTML = "SZ:";


            var positionSetSZ = document.createElement('input');
            positionSetSZ.id = 'positionSetSZ';
            positionSetSZ.className = 'objectEditInput';
            positionSZLabel.appendChild( positionSetSZ );

            positionSetSZ.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );


                if( editingObject.type != "ProposedPosition" && editingObject.type != "Text2" ){

                    if( !sizeProportions ){

                        editingObject.setWidth( parseInt( $('input#positionSetW').val()) );
                        //editingObject.updateTransformInDB();
                        document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);
                    }

                }else {

                    if( !sizeProportions ){
                        editingObject.setTrueWidth( parseInt( $('input#positionSetSZ').val()) , 1);
                        //editingObject.updateTransformInDB();
                        document.getElementById('positionSetW').value = parseInt(editingObject.trueHeight * editingObject.scaleY).toFixed(2);
                    }

                    if( editingObject.mask ){

                        editingObject.mask.regX = editingObject.regX;
                        editingObject.mask.regY = editingObject.regY;

                        //editingObject.updateTransformInDB();

                    }

                }


               if( sizeProportions == true && editingObject.type != "ProposedPosition" ){


                    var original_height = editingObject.height;
                    var original_width = editingObject.width;
                    var designer_height = parseInt( $('input#positionSetW').val());
                    var designer_width = parseInt( $('input#positionSetSZ').val());
                    var original_ratio = original_height / original_width;

                    designer_height = designer_width * original_ratio;
                    editingObject.setHeight( designer_height );
                    editingObject.setWidth( parseInt( $('input#positionSetSZ').val()) );
                    //editingObject.updateTransformInDB();


                    document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);

                }else if( sizeProportions == true && editingObject.type == "ProposedPosition" ){


                    var original_height = editingObject.trueHeight;
                    var original_width = editingObject.trueWidth;

                    var designer_height = parseInt( $('input#positionSetW').val());
                    var designer_width = parseInt( $('input#positionSetSZ').val());


                    var original_ratio = original_height / original_width;

                    editingObject.setTrueWidth( parseInt( $('input#positionSetSZ').val()) ,1);
                    //editingObject.updateTransformInDB();

                    designer_height = parseInt( $('input#positionSetSZ').val()) * original_ratio;

                    editingObject.setTrueHeight( designer_width ,1);

                    if( editingObject.mask ){

                        editingObject.mask.regX = editingObject.regX;
                        editingObject.mask.regY = editingObject.regY;

                    }

                     document.getElementById('positionSetW').value = parseInt(editingObject.trueHeight * editingObject.scaleY).toFixed(2);


                }

                if( editingObject instanceof Editor.ProposedPosition2 || editingObject instanceof Editor.ProposedTextPosition ){

                        editingObject._updateShape();
                        //editingObject.updateTransformInDB();

                }


                editingObject.updateMagneticLines();
                editingObject.dispatchEvent( "stageScroll" );
                editingObject.dispatchEvent('resize');
                //Editor.tools.update();
                Editor.tools.init();

            });


            var positionSetW = document.createElement('input');
            positionSetW.id = 'positionSetW';
            positionSetW.className = 'objectEditInput';
            positionWLabel.appendChild( positionSetW );

            positionSetW.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );


                if( editingObject.type != "ProposedPosition" && editingObject.type != "Text2" ){

                    if( !sizeProportions ){
                        editingObject.setHeight( parseInt( $('input#positionSetW').val()) );
                        //editingObject.updateTransformInDB();
                        document.getElementById('positionSetSZ').value = parseInt(editingObject.trueWidth * editingObject.scaleY).toFixed(2);
                    }





                }else {

                    if( !sizeProportions ){
                        editingObject.setTrueHeight( parseInt( $('input#positionSetW').val()) ,1);
                        //editingObject.updateTransformInDB();
                        document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleY).toFixed(2);
                    }

                    if( editingObject.mask ){

                        editingObject.mask.regX = editingObject.regX;
                        editingObject.mask.regY = editingObject.regY;
                        //editingObject.updateTransformInDB();

                    }


                }


               if( sizeProportions == true && editingObject.type != "ProposedPosition" ){

                    var original_height = editingObject.height;
                    var original_width = editingObject.width;
                    var designer_height = parseInt( $('input#positionSetW').val());
                    var designer_width = parseInt( $('input#positionSetSZ').val());
                    var original_ratio = original_width / original_height ;

                    designer_width = designer_height * original_ratio;
                    editingObject.setWidth( designer_width );
                    editingObject.setHeight( parseInt( $('input#positionSetW').val()) );
                    //editingObject.updateTransformInDB();

                    document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleY).toFixed(2);

                }else if( sizeProportions == true && editingObject.type == "ProposedPosition" ){


                    var original_height = editingObject.trueHeight;
                    var original_width = editingObject.trueWidth;

                    var designer_height = parseInt( $('input#positionSetW').val());
                    var designer_width = parseInt( $('input#positionSetSZ').val());


                    var original_ratio = original_width / original_height;

                    editingObject.setTrueHeight( parseInt( $('input#positionSetW').val()) ,1);
                    //editingObject.updateTransformInDB();

                    designer_width = parseInt( $('input#positionSetW').val()) * original_ratio;

                    editingObject.setTrueWidth( designer_width ,1);

                    if( editingObject.mask ){

                        editingObject.mask.regX = editingObject.regX;
                        editingObject.mask.regY = editingObject.regY;

                    }

                    document.getElementById('positionSetSZ').value = parseInt(editingObject.trueWidth * editingObject.scaleY).toFixed(2);
                }

                if( editingObject instanceof Editor.ProposedPosition2 || editingObject instanceof Editor.ProposedTextPosition ){

                    editingObject._updateShape();
                }

                editingObject.updateMagneticLines();
                editingObject.dispatchEvent( "stageScroll" );
                editingObject.dispatchEvent('resize');
                Editor.tools.update();
                Editor.tools.init();


            });


            resizeTools.appendChild( positionWLabel );
            resizeTools.appendChild( positionSZLabel );


            var setPosTools = document.createElement('div');
            setPosTools.className = 'setPosToolsContainer';

            resizeTools.appendChild( positionWLabel );


            var posXLabel = document.createElement('label');
            posXLabel.className = 'posXSetLabel';
            posXLabel.innerHTML = "X:";

            var posXSet = document.createElement('input');
            posXSet.id = 'objectXPosition';
            posXSet.className = 'objectEditInput';
            posXLabel.appendChild( posXSet );


            posXSet.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();

                if( editing_id ){

                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setPosition_leftCorner( parseInt($('input#objectXPosition').val()), parseInt($('input#objectYPosition').val()) );

                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();

                    editingObject.updateMagneticLines();
                    Editor.tools.init();

                }

            });


            var posYLabel = document.createElement('label');
            posYLabel.className = 'posYSetLabel';
            posYLabel.innerHTML = "Y:";

            var posYSet = document.createElement('input');
            posYSet.id = 'objectYPosition';
            posYSet.className = 'objectEditInput';
            posYLabel.appendChild( posYSet );


            posYSet.addEventListener('change', function(){

                var editing_id = Editor.tools.getEditObject();

                if( editing_id ){

                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setPosition_leftCorner( parseInt($('#objectXPosition').val()), parseInt($('#objectYPosition').val()) );

                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();


                    editingObject.updateMagneticLines();
                    Editor.tools.init();
                }

            });


            setPosTools.appendChild( posXLabel );
            setPosTools.appendChild( posYLabel );

            var rotationLabel = document.createElement('label');
            rotationLabel.className = 'setRotationLabel inputRight'
            //rotationLabel.innerHTML = "R:";

            var rotationInput = document.createElement('input');
            rotationInput.id = 'setRotationInput';
            rotationInput.className = 'spinner';
            rotationLabel.appendChild( rotationInput );


            rotationInput.addEventListener('click', function(){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );
                var tempValue = parseInt(event.target.value);


                editingObject.rotation = tempValue;
                editingObject.updatePositionInDB();
                editingObject.updateTransformInDB();


                if(  editingObject.mask ){

                    editingObject.mask.rotation = tempValue;
                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();

                }

                Editor.tools.init();

            });

            var vertMirrorLabel = document.createElement('label');
            vertMirrorLabel.className = 'vertMirrorLabel';
            //vertMirrorLabel.innerHTML = "\0053";

            vertMirrorLabel.appendChild( Editor.template.createToolhelper('Odbicie lustrzane pionowe','left') );


            var horMirrorLabel = document.createElement('label');
            horMirrorLabel.className = 'horMirrorLabel';
            //horMirrorLabel.innerHTML = "\0052";

            horMirrorLabel.appendChild( Editor.template.createToolhelper('Odbicie lustrzane poziome','left') );

            vertMirrorLabel.addEventListener('click', function(){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.updatePositionInDB();
                editingObject.updateTransformInDB();

                editingObject.scaleX = -editingObject.scaleX;


            });


            horMirrorLabel.addEventListener('click', function(){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                editingObject.updatePositionInDB();
                editingObject.updateTransformInDB();

                editingObject.scaleY = - editingObject.scaleY;

            });



            var vertLineLabel = document.createElement('label');
            vertLineLabel.className = 'vertLineLabel';
            //vertLineLabel.innerHTML = "\0028";


            vertLineLabel.appendChild( Editor.template.createToolhelper('Pionowa linia pomocnicza','right') );

            var horLineLabel = document.createElement('label');
            horLineLabel.className = 'horLineLabel';
            //horLineLabel.innerHTML = "\0029";

            horLineLabel.appendChild( Editor.template.createToolhelper('Pozioma linia pomocnicza','right') );
            vertLineLabel.addEventListener('click', function(){

                var verticalRuller = new Editor.EditorRullerHelper_Vertical( "#01aeae", 'dashed' );
                Editor.stage.getIRulersLayer().addChildAt( verticalRuller, 0  );

            });


            horLineLabel.addEventListener('click', function(){

                var horizontalRuller = new Editor.EditorRullerHelper_Horizontal( "#01aeae", 'dashed' );
                Editor.stage.getIRulersLayer().addChildAt( horizontalRuller, 0 );

            });


            positionSettings.appendChild( positionSettingsTitle );
            positionSettings.appendChild( resizeTools );

            positionSettings.appendChild( proportionTool );
            positionSettings.appendChild( setPosTools );

            positionSettings.appendChild( rotationLabel );

            //vertMirrorLabel.appendChild( Editor.template.createToolhelper('KUPA') );

            positionSettings.appendChild( vertMirrorLabel );
            positionSettings.appendChild( horMirrorLabel );
            positionSettings.appendChild( vertLineLabel );
            positionSettings.appendChild( horLineLabel );


            // ustawienia pozycji przezroczystości
            var rangeSlider = document.getElementById("slider");

            var alphaSettings = document.createElement('div');
            alphaSettings.className = 'alphaSettings';

            var alphaSettingsTitle = document.createElement('h4')
            alphaSettingsTitle.className = 'alphaSettingsHeader';
            alphaSettingsTitle.innerHTML = 'Przeźroczystość';

            var alphaValueInput = document.createElement('input');
            alphaValueInput.id = 'alphaValueInput';
            alphaValueInput.className = 'spinner';





            alphaSettings.appendChild( alphaSettingsTitle );
            alphaSettings.appendChild( alphaValueInput );
            alphaSettings.appendChild( rangeSlider );



            // ustawienia cieni
            var rangeSlider2 = document.getElementById("secondSlider");

            var shadowSettings = document.createElement('div');
            shadowSettings.className = 'shadowSettings';

            var shadowSettingsTitle = document.createElement('h4')
            shadowSettingsTitle.className = 'shadowSettingsTitle';
            shadowSettingsTitle.innerHTML = 'Cień';

            shadowSettings.appendChild( shadowSettingsTitle );


            var shadowTransSettingsTitle = document.createElement('h4')
            shadowTransSettingsTitle.className = 'shadowTransSettingsTitle';
            shadowTransSettingsTitle.innerHTML = 'Przeźroczystość';

            //shadowSettings.appendChild( shadowTransSettingsTitle );

            var shadowTransSettingsInput = document.createElement('input');
            shadowTransSettingsInput.id = 'shadowTransSettingsInput';
            shadowTransSettingsInput.className = 'spinner';


           // shadowSettings.appendChild( shadowTransSettingsInput );
           // shadowSettings.appendChild( rangeSlider2 );


            var flipSwitchs2 = this.generateFlatSwitch();

            var shadowSwitch = document.createElement('label');
            shadowSwitch.className = 'ShadowSwitchLabel';
            shadowSwitch.innerHTML = 'Włącz cień:';

            var _this = this;


            // Zmien wartość Flip Switcha jeżeli obiekt ma dodany cień

            /* ZAKOMENTOWAŁEM BO NIE DZIALA :) MUSZE TO PRZEPISAC W STAGE_ADMIN.JS linia 2646

            flipSwitchs2.addEventListener('change', function(){

                 var editing_id = Editor.tools.getEditObject();
                if ( editing_id )
                {
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    console.log ("CONSOLE LOG Z POCZĄKU LISTENERA ZMIANY POZYCJI FLIP SWITCH'A");

                    if ( editingObject._dropShadow == true )
                    {
                         $('#toggleOnOff2').val('on');
                         console.log ("TEN OBIEKT MA CIEN :) PRZELACZAM FLIPSWICHA NA ON");

                    }else if ( editingObject._dropShadow == false )
                    {
                        $('#toggleOnOff2').val('off');
                        console.log ("TEN OBIEKT NIE MA CIENIA :) PRZELACZAM FLIPSWICHA NA OFF");

                    }
                }
            });
            */

            // KONIEC


            shadowSwitch.addEventListener('change', function( e ){

                if( e.target.checked ){


                    shadowSwitch.innerHTML = 'Wyłącz cień:';
                    shadowSwitch.appendChild( flipSwitchs2 );
                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.dropShadow( true );


                    //console.log('dropShadow' );
                }
                else {

                    shadowSwitch.innerHTML = 'Włącz cień:';
                    shadowSwitch.appendChild( flipSwitchs2 );
                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.unDropShadow( true );


                    //console.log('editinfundropShadow' );

                }
            });


            shadowSwitch.appendChild( flipSwitchs2 );

            shadowSettings.appendChild( shadowSwitch );


            var shadowMoveXLabel = document.createElement('label');
            shadowMoveXLabel.className = 'shadowToolsClass inputRight';
            shadowMoveXLabel.innerHTML = 'Przesunięcie X:'


            var shadowMoveXInput = document.createElement('input');
            shadowMoveXInput.id = 'shadowMoveXInput';
            shadowMoveXInput.className = 'spinner';
            shadowMoveXLabel.appendChild( shadowMoveXInput );

            shadowSettings.appendChild( shadowMoveXLabel );


            var shadowMoveYLabel = document.createElement('label');
            shadowMoveYLabel.className = 'shadowToolsClass inputRight';
            shadowMoveYLabel.innerHTML = 'Przesunięcie Y:';


            var shadowMoveYInput = document.createElement('input');
            shadowMoveYInput.id = 'shadowMoveYInput';
            shadowMoveYInput.className = 'spinner';
            shadowMoveYLabel.appendChild( shadowMoveYInput );

            shadowSettings.appendChild( shadowMoveYLabel );


            var shadowBlurLabel = document.createElement('label');
            shadowBlurLabel.className = 'shadowToolsClass inputRight';
            shadowBlurLabel.innerHTML = 'Rozmycie:';

            var shadowBlurInput = document.createElement('input');
            shadowBlurInput.id = 'shadowBlurInput';
            shadowBlurInput.className = 'spinner';
            shadowBlurLabel.appendChild( shadowBlurInput );

            shadowSettings.appendChild( shadowBlurLabel );



            var shadowColorPickerLabel = document.createElement('label');
            shadowColorPickerLabel.className = 'shadowColorPickerLabel'
            //shadowColorPickerLabel.innerHTML = "K:";



            var shadowColor = document.createElement('input');
            shadowColor.id = 'shadowColor';
            shadowColor.className = 'spinner cp-full';



            shadowColorPickerLabel.appendChild( shadowColor );
            shadowSettings.appendChild( shadowColorPickerLabel );


            //Ramka i obrys

            var borderSettings = document.createElement('div');
            borderSettings.className = 'borderSettings';

            var borderSettingsTitle = document.createElement('h4')
            borderSettingsTitle.className = 'borderSettingsTitle';
            borderSettingsTitle.innerHTML = 'Ramka';

            borderSettings.appendChild( borderSettingsTitle );

            var flipSwitchs = this.generateFlatSwitchBorder();


            var borderContourLabel = document.createElement('label');
            borderContourLabel.className = 'borderContourLabel';
            borderContourLabel.innerHTML = 'Włącz ramkę:';


            var _this = this;
            var borderOn = false;

            borderContourLabel.addEventListener('change', function( e ){

                if( e.target.checked ){

                    borderContourLabel.innerHTML = 'Wyłącz ramkę:';
                    borderContourLabel.appendChild( flipSwitchs );

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.dropBorder( true );
                    editingObject.setBorderWidth( editingObject.borderWidth );
                    editingObject.updateSimpleBorder( true );
                    borderOn = true;

                }
                else {

                    borderContourLabel.innerHTML = 'Włącz ramkę:';
                    borderContourLabel.appendChild( flipSwitchs );

                    borderOn = false;

                    //--------------------------------------------------------------
                    //Resetuje wartość ramki przy jej wyłączeniu
                    //document.getElementById('borderWidthPickerInput').value = 0;
                    //editingObject.borderWidth = 0 ;
                    //--------------------------------------------------------------

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.unDropBorder( true );
                    //console.log('editinfundropShadow' );

                }

            });

            borderContourLabel.appendChild( flipSwitchs );

            borderSettings.appendChild( borderContourLabel );

            var borderColorPickerLabel = document.createElement('h4');
            borderColorPickerLabel.className = 'borderColorPickerLabel';
            //borderColorPickerLabel.innerHTML = "K:";

            var borderColor = document.createElement('input');
            borderColor.id = 'borderColor';
            borderColor.className = 'spinner cp-full';

            borderColorPickerLabel.appendChild( borderColor );
            borderSettings.appendChild( borderColorPickerLabel );

            var borderWidthPickerLabel = document.createElement('label');
            borderWidthPickerLabel.className = 'shadowToolsClass inputRight';
            borderWidthPickerLabel.innerHTML = "Grubość ramki:";

            var borderWidthPickerInput = document.createElement('input');
            borderWidthPickerInput.id = 'borderWidthPickerInput';
            borderWidthPickerInput.className = 'spinner';

            borderWidthPickerLabel.appendChild( borderWidthPickerInput );

            borderSettings.appendChild( borderWidthPickerLabel );


            //Event listener który ma na celu zmianę edytowanej wartości w czasie rzeczywistym, a nie dopiero po 'odkliknięciu'
            borderWidthPickerInput.addEventListener("click",function(){

                Editor.tools.init();

            });
            //-- Koniec listenera --


            var toolsResetButton = document.createElement('div');
            toolsResetButton.id = 'ResetButton';
            toolsResetButton.className = 'toolsResetButton';
            toolsResetButton.innerHTML = "Resetuj";

            var _this = this;

            toolsResetButton.addEventListener("click", function( ){

                var editing_id = Editor.tools.getEditObject();
                var editingObject = Editor.stage.getObjectById( editing_id );

                try {
                    document.getElementById('setRotationInput').value = 0;
                    editingObject.rotation = 0;

                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();



                    if( editingObject.mask ){

                            editingObject.updatePositionInDB();
                            editingObject.updateTransformInDB();

                           editingObject.mask.rotation = 0;

                    }

                    Editor.tools.init();
                }catch(e){}
                //editingObject.setTrueHeight(0);
                //editingObject.setTrueWidth(0);
                //document.getElementById('positionSetW').value = 0;
                //document.getElementById('positionSetSZ').value = 0;

                try {
                    editingObject.setBorderWidth(0);
                    document.getElementById('borderWidthPickerInput').value = 0;
                    editingObject.updateSimpleBorder();
                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();

                }catch(e){}

                try {
                    editingObject.scaleX=1;
                    document.getElementById('positionSetSZ').value = editingObject.width;
                    editingObject.updateSimpleBorder();
                    Editor.tools.update();
                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();

                }catch(e){}

                try {
                    editingObject.scaleY=1;
                    document.getElementById('positionSetW').value = editingObject.height;
                    editingObject.updateSimpleBorder();
                    Editor.tools.update();
                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();
                }catch(e){}


                try {

                    editingObject.setPosition_leftCorner(0,0);

                    document.getElementById('objectXPosition').value = 0;
                    document.getElementById('objectYPosition').value = 0;
                    editingObject.updateTransformInDB();
                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();
                    //_this.EditorObject.updatePositionInDB();

                }catch(e){}


                try {
                    editingObject.unDropShadow();
                    editingObject.updatePositionInDB();
                    editingObject.updateTransformInDB();
                }catch(e){}


                try {
                    document.getElementById('shadowBlurInput').value = 10;
                    editingObject.setShadowBlur(10);

                }catch(e){}


                try {
                    document.getElementById('borderWidthPickerInput').value = 0;
                    editingObject.setBorderWidth(0);
                }catch(e){}


                try {
                    editingObject.alpha = 1;
                    document.getElementById('alphaValueInput').value = 1;
                }catch(e){}


                try {
                    document.getElementById('shadowMoveXInput').value = 0;
                    document.getElementById('shadowMoveYInput').value = 0;
                    editingObject.setShadowOffsetY(0);
                    editingObject.setShadowOffsetX(0);
                }catch(e){}






                Editor.tools.init();
            });


            var toolsSaveButton = document.createElement('div');
            toolsSaveButton.id = 'SaveButton';
            toolsSaveButton.className = 'toolsSaveButton';
            toolsSaveButton.innerHTML = "Zapisz";

            // ustawienia


            toolContent.appendChild( positionSettings );
            toolContent.appendChild( alphaSettings );
            toolContent.appendChild( shadowSettings );
            toolContent.appendChild( borderSettings );
            toolContent.appendChild( toolsResetButton );



            $('#shadowColor').colorpicker({

                parts: 'full',
                showOn: 'both',
                buttonColorize: true,
                showNoneButton: true,
                alpha: true,
                select : function( e ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    var shadowColor = e.target.value;

                    var alpha = shadowColor.split('(')[1].split(')')[0].split(',');
                    shadowColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

                    editingObject.setShadowColor( shadowColor );


                    Editor.webSocketControllers.editorBitmap.setAttributes(

                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {
                            shadowColor: shadowColor
                        }

                    );

                },

                colorFormat: 'RGBA'

            });



            $('#borderColor').colorpicker({

                parts: 'full',
                showOn: 'both',
                buttonColorize: true,
                showNoneButton: true,
                alpha: true,
                select : function( e ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    var borderColor = e.target.value;

                    editingObject.setBorderColor( borderColor );

                    Editor.webSocketControllers.editorBitmap.setAttributes(

                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {
                            borderColor: borderColor
                        }

                    );

                },

                colorFormat: 'RGBA'

            });


            // if ( borderOn == true ){

            $('#borderWidthPickerInput').spinner({

                min: 0,

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.setBorderWidth ( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                    Editor.webSocketControllers.editorBitmap.setAttributes(

                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {
                            borderWidth: parseInt(event.target.value)
                        }

                    );

                },


                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.setBorderWidth ( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                    Editor.webSocketControllers.editorBitmap.setAttributes(

                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {
                            borderWidth: parseInt(event.target.value)
                        }

                    );

                },

                stop: function( event ){
                   var editing_id = Editor.tools.getEditObject();
                   var editingObject = Editor.stage.getObjectById( editing_id );
                   editingObject.setBorderWidth ( parseInt(event.target.value) );
                   editingObject.updateSimpleBorder();

                    Editor.webSocketControllers.editorBitmap.setAttributes(

                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {
                            borderWidth: parseInt(event.target.value)
                        }

                    );

                }

            });


            $('#borderColorPickerInput').spinner({

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                }

            });



            rangeSlider.addEventListener('mousemove', function( e ){

                var editing_id = Editor.tools.getEditObject();
                var alphaValue = $( "#slider" ).slider( "value" );
                var editingObject = Editor.stage.getObjectById( editing_id );

                if (!(editingObject instanceof Editor.EditableArea)){

                    document.getElementById('alphaValueInput').value = alphaValue;

                }

            });



            $( "#slider" ).slider({

                value: 1,
                step: 0.05,
                max: 1.05,
                min: 0,

                slide: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    var alphaValue = $( "#slider" ).slider( "value" );

                    if (!(editingObject instanceof Editor.EditableArea)){

                        editingObject.alpha = alphaValue;
                        document.getElementById('alphaValueInput').value = alphaValue;

                    }
                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    var alphaValue = $( "#slider" ).slider( "value" );
                    try{
                        if (!(editingObject instanceof Editor.EditableArea)){

                            editingObject.alpha = alphaValue;
                            document.getElementById('alphaValueInput').value = alphaValue;

                        }
                    }catch(e){}

                },

                stop: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    var alphaValue = $( "#slider" ).slider( "value" );

                    if (!(editingObject instanceof Editor.EditableArea)){

                        document.getElementById('alphaValueInput').value = alphaValue;
                        editingObject.alpha = alphaValue;

                    }
                }

            });



            $( "#secondSlider" ).slider({

                    value: 1,
                    step: 0.05,
                    max: 1.05,
                    min: 0,

                    slide: function( event ){

                        var editing_id = Editor.tools.getEditObject();
                        var editingObject = Editor.stage.getObjectById( editing_id );
                        var selection = $( "#slider" ).slider( "value" );
                        editingObject.alpha = selection;
                    },

                    change: function( event ){

                        var editing_id = Editor.tools.getEditObject();
                        var editingObject = Editor.stage.getObjectById( editing_id );
                        var selection = $( "#slider" ).slider( "value" );
                        editingObject.alpha = selection;
                    },

                    stop: function( event ){

                        var editing_id = Editor.tools.getEditObject();
                        var editingObject = Editor.stage.getObjectById( editing_id );
                        var selection = $( "#slider" ).slider( "value" );
                        editingObject.alpha = selection;
                    }
            });


            $('#shadowColorPickerLabelInput').spinner({


                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                }

            });


            $('#shadowBlurInput').spinner({

                min: 0,

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );


                    editingObject.setShadowBlur( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowBlur : parseInt(event.target.value)

                        }
                    );

                },

                change: function( event ){


                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    editingObject.setShadowBlur( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowBlur : parseInt(event.target.value)

                        }
                    );

                },

                stop: function( event ){

                   var editing_id = Editor.tools.getEditObject();
                   var editingObject = Editor.stage.getObjectById( editing_id );
                   editingObject.setShadowBlur( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowBlur : parseInt(event.target.value)

                        }
                    );

                }

            });


            $('#shadowMoveYInput').spinner({

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowOffsetY : parseInt(event.target.value)

                        }
                    );

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setShadowOffsetY( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(

                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowOffsetY : parseInt(event.target.value)

                        }

                    );

                },

                stop: function( event ){

                   var editing_id = Editor.tools.getEditObject();
                   var editingObject = Editor.stage.getObjectById( editing_id );
                   editingObject.setShadowOffsetY( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowOffsetY : parseInt(event.target.value)

                        }

                    );

                }

            });



             $('#shadowMoveXInput').spinner({

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setShadowOffsetX( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowOffsetX : parseInt(event.target.value)

                        }
                    );

                },

                change: function( event ){

                   var editing_id = Editor.tools.getEditObject();
                   var editingObject = Editor.stage.getObjectById( editing_id );
                   editingObject.setShadowOffsetX( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowOffsetX : parseInt(event.target.value)

                        }
                    );

                },

                stop: function( event ){

                   var editing_id = Editor.tools.getEditObject();
                   var editingObject = Editor.stage.getObjectById( editing_id );
                   editingObject.setShadowOffsetX( parseInt(event.target.value) );

                    Editor.webSocketControllers.editorBitmap.setAttributes(
                        editingObject.dbID,
                        Editor.adminProject.format.view.getId(),
                        {

                            shadowOffsetX : parseInt(event.target.value)

                        }
                    );

                }

            });


            $('#setRotationInput').spinner({


                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    var tempValue = parseInt(event.target.value);


                    /*if ( tempValue == 0){

                        tempValue = 1;

                        editingObject.rotation = tempValue;

                        if(  editingObject.mask ){

                           editingObject.mask.rotation = tempValue;
                        }*/

                    if ( tempValue != 0){

                        editingObject.rotation = tempValue;

                        if(  editingObject.mask ){

                           editingObject.mask.rotation = tempValue;
                        }

                    }

                    Editor.tools.init();

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    var tempValue = parseInt(event.target.value);

                    editingObject.rotation = tempValue;
                    if(  editingObject.mask ){

                           editingObject.mask.rotation = tempValue;
                    }

                    Editor.tools.init();

                },

                stop: function( event ){

                    Editor.tools.init();

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    var tempValue = parseInt(event.target.value);

                    var tempValue = parseInt(event.target.value);

                    editingObject.rotation = tempValue;
                    if(  editingObject.mask ){

                           editingObject.mask.rotation = tempValue;
                    }

                    Editor.tools.init();



                }


            });


            $('#vertMirrorInput').spinner({

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                }

            });

            $('#horMirrorInput').spinner({

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                }

            });



            $('#alphaValueInput').spinner({

                min: 0,
                max: 1,
                step: 0.05,

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    $( "#slider" ).slider( { value: event.target.value } );

                    if (!editingObject instanceof Editor.EditableArea ){

                        editingObject.alpha = event.target.value;

                    }

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );

                    $( "#slider" ).slider( { value: event.target.value } );

                    editingObject.alpha = event.target.value;


                },

                stop: function( event ){
                   var editing_id = Editor.tools.getEditObject();
                   var editingObject = Editor.stage.getObjectById( editing_id );

                   $( "#slider" ).slider( { value: event.target.value } );

                   editingObject.alpha = event.target.value;

                }

            });



            $('#shadowTransSettingsInput').spinner({

                spin: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                },

                change: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                },

                stop: function( event ){

                    var editing_id = Editor.tools.getEditObject();
                    var editingObject = Editor.stage.getObjectById( editing_id );
                    editingObject.setBorderWidth( parseInt(event.target.value) );
                    editingObject.updateSimpleBorder();

                }


            });


            // update narzędnika
            var objectSettingsViewport = $('#objectSettings-content');

            $(objectSettingsViewport).children('.viewport').css( 'height', $('#toolsContent').height() - 60 );
            $('#objectSettings-content').addClass('toolsUnactive');

            Ps.initialize ( toolContent );

            return tool;

        }


        /**
        * Wyświetla okno z możliwością skopiowania motywów
        *
        * @method generateThemes
        * @param {Array} themes Tablica obiektów motywów
        */
        copyThemesFromOtherFormatWindow ( formatData ){

            $.ajax({

                url: 'templates/copyThemes.html',
                type: 'GET',
                crossDomain: true,
                success : function( data ){

                    $('body').append( data );

                    // trzeba zrobić szablony na wszystkie rzeczy tego typu i wywoływaće np tak: themeElement( name, id, { click : callback } )
                    var themes = document.createElement('div');

                    for( var i=0; i < formatData.Themes.length; i++ ){

                        var theme = document.createElement('div');
                        theme.className = 'themeToCopy';
                        theme.setAttribute( 'theme-id', formatData.Themes[i]._id );
                        theme.style.backgroundImage = 'url('+EDITOR_ENV.staticUrl+formatData.Themes[i].url+')';

                        var themeName = document.createElement('div');
                        themeName.className = 'themeName';
                        themeName.innerHTML = formatData.Themes[i].name;

                        theme.appendChild( themeName );

                        theme.addEventListener('click', function( e ){

                            e.stopPropagation();

                            if( $(this).hasClass('selected') )
                                $(this).removeClass('selected')
                            else
                                $(this).addClass('selected')

                        });

                        themes.appendChild( theme );

                    }

                    document.querySelector("#copyThemesFromFormat .modal-body").appendChild( themes );
                    document.querySelector('button#copyThemes').addEventListener('click', function( e ){

                        e.stopPropagation();

                        var selected = document.querySelectorAll('.themeToCopy.selected');

                        var themesToCopy = [];

                        for( var i=0; i < selected.length; i++ ){

                            themesToCopy.push( selected[i].getAttribute('theme-id') );

                        }

                        Editor.webSocketControllers.theme.copyThemes( Editor.adminProject.format.getDbId(), themesToCopy );

                    });

                    $('#copyThemesFromFormat').on('shown.bs.modal', function() {
                        $(this).find('.modal-dialog').css({
                            'margin-top': function () {
                                return (window.innerHeight/2-($(this).outerHeight() / 2));
                            },
                            'margin-left': function () {
                                return (window.innerWidth/2-($(this).outerWidth() / 2));
                            }
                        });
                    });

                    $('#copyThemesFromFormat').on( 'hidden.bs.modal', function(){

                        $(this).remove();

                    });


                    $('#copyThemesFromFormat').modal({

                        keyboard: false,
                        backdrop: 'static'

                    });

                }

            });

        }



        generateThemesToCopy (){

            var tool = document.createElement('div');
            tool.id = 'ThemesToCopy-tool';
            tool.className = 'tool closed';

            var toolButton = document.createElement('span');
            toolButton.id = 'ThemesToCopy-container-tool_button';
            toolButton.className = 'tool-button';

            toolButton.setAttribute('data-content','ThemesToCopy-content');

            var title = document.createElement('h2');
            title.innerHTML = 'Motywy oczekujące na skopiowanie';

            tool.appendChild( toolButton );


            // kontent całościowy na motywy
            var toolContent = document.createElement('div');
            toolContent.id = 'ThemesToCopy-content';
            document.getElementById('toolsContent').appendChild( toolContent );


            var toolMainContent = document.createElement('div');
            toolMainContent.id = "ThemesToCopy-main-content";

            toolContent.appendChild( toolMainContent );


            var themesContent = document.createElement('div');
            themesContent.id = 'themeToCopyContentMain';
            toolMainContent.appendChild( themesContent );

            // kontent na strony
            var toolContentPages = document.createElement('div');
            toolContentPages.id = 'toolContentPages';
            toolMainContent.appendChild( toolContentPages );

            //kontent na pozycje proponowane
            var toolContentProposedTemplates = document.createElement('div');
            toolContentProposedTemplates.id = 'toolContentProposedTemplates';
            toolMainContent.appendChild( toolContentProposedTemplates );

            // narzedzie pomocnicze ( dymek )
            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Motywy oczekujące na skopiowanie</span>';

            // element zbierajacy motywy do skopiowania
            var themesToCopy = document.createElement('div');
            themesToCopy.id = 'ThemesToCopy_list';

            //zakladka ze stronami motywu do skopiowania
            var themesToCopyPages = document.createElement('div');
            themesToCopyPages.id = 'themesToCopyPages';


            // dodanie elementów do tool kontentu
            themesContent.appendChild( title );
            themesContent.appendChild( themesToCopy );



            tool.appendChild( toolHelper );

            return tool;



        }


        /**
        * Generuje przycisk zmiany ilośći kolumn w oknie themów
        *
        * @method generateThemeColumnButton
        * @param {String} type Typ themeColumnsButton pro|ama
        */
        generateThemeColumnButton ( data ){

            var themeColumnBtn = document.createElement('div');

            /* Zmiana ilości kolumn dla widoku listy głownych themów */

            var changeThemeColumns = document.createElement('div');
            changeThemeColumns.id = 'changeThemeColumns';
            changeThemeColumns.className = 'buttonscolumns'
            changeThemeColumns.innerHTML = 'Ilość kolumn';

            var change2ThemeColumns = document.createElement('div');
            change2ThemeColumns.className = 'button-2columns'

             var columnButtonsContainer = document.createElement('div');
            columnButtonsContainer.className = 'columnButtonsContainer';



            change2ThemeColumns.addEventListener('click', function(){

                $("#project-themes-list").removeClass('all-theme-list');
                $("#project-themes-list").removeClass('twoColumns');
                $("#project-themes-list").removeClass('threeColumns');
                $("#project-themes-list").removeClass('sixColumns');

                $("#project-themes-list").addClass("twoColumns");

            });


            var change3ThemeColumns = document.createElement('div');
            change3ThemeColumns.className = 'button-3columns'

            change3ThemeColumns.addEventListener('click', function(){

                $("#project-themes-list").removeClass('all-theme-list');
                $("#project-themes-list").removeClass('twoColumns');
                $("#project-themes-list").removeClass('threeColumns');
                $("#project-themes-list").removeClass('sixColumns');

                $("#project-themes-list").addClass("threeColumns");

            });


            var change6ThemeColumns = document.createElement('div');
            change6ThemeColumns.className = 'button-6columns'

            change6ThemeColumns.addEventListener('click', function(){

                $("#project-themes-list").removeClass('all-theme-list');
                $("#project-themes-list").removeClass('twoColumns');
                $("#project-themes-list").removeClass('threeColumns');
                $("#project-themes-list").removeClass('sixColumns');

                $("#project-themes-list").addClass("sixColumns");

            });


            columnButtonsContainer.appendChild( change2ThemeColumns );
            columnButtonsContainer.appendChild( change3ThemeColumns );
            columnButtonsContainer.appendChild( change6ThemeColumns );
            changeThemeColumns.appendChild( columnButtonsContainer );

            themeColumnBtn.appendChild( changeThemeColumns );

            return themeColumnBtn;

        }


       /**
        * Generuje element motywów
        *
        * @method generateThemes
        * @param {Array} themes Tablica obiektów motywów
        */
        generateThemes ( themes ){

            var Editor = this.editor;
            var _this = this;
            var tool = document.createElement('div');
            tool.id = 'themes-container-tool';
            tool.className = 'themes-container-tool tool closed';
            //tool.style.width = '1200px';

            var innerContainer = document.createElement('div');
            innerContainer.className = 'innerContainer';

            var toolButton = document.createElement('span');
            toolButton.id = 'themes-container-tool_button';
            toolButton.className = 'tool-button';
            toolButton.setAttribute('data-content', 'themes-content');

            tool.appendChild( toolButton );

            var toolHelper = document.createElement('span');
            toolHelper.className = 'toolHelper';
            toolHelper.innerHTML = '<i></i><span>Tutaj możesz edytować motywy</span>';

            tool.appendChild( toolHelper );

            var toolContent = document.createElement('div');
            toolContent.id = 'themes-content';
            //toolContent.innerHTML = "<ul><li><img src='images/szablon_przyklad.png'/><span class='remove'></span><span class='add'></span><span class='edit'></span></li></ul>";



            var themeContent =document.createElement('div');
            themeContent.id = 'themeContent';
            themeContent.className = 'themeContent';

            var themeContent_pages = document.createElement('div');
            themeContent_pages.className = 'themepages';
            themeContent_pages.id = 'themepages';

            themeContent.appendChild( themeContent_pages );

            var allThemes = document.createElement('div');
            allThemes.id = 'allProjectThemes';
            allThemes.className = 'allProjectThemes';

            var scrollAllThemes = document.createElement('div');
            scrollAllThemes.id = 'scrollAllThemes';

            scrollAllThemes.appendChild( allThemes );
            scrollAllThemes.appendChild( themeContent );

            var themesList = document.createElement('div');
            themesList.id = 'project-themes-list';

            var buttonContainer = document.createElement('div');
            buttonContainer.id = 'buttonContainer';



            var addCreatedTheme = document.createElement('span');
            addCreatedTheme.id = 'addCreatedTheme';
            addCreatedTheme.className = 'add button-fw';
            addCreatedTheme.innerHTML = 'Dodaj już gotowy motyw';


            // tworzenie obiektu pozwalającego dodać szablon pozycji dla danego motywu
            var addTheme = document.createElement("span");
            addTheme.id = 'addNewTheme';
            addTheme.className = 'button-fw';
            addTheme.innerHTML = "Dodaj motyw";


            // tworzenie obiektu pozwalającego dodać juz istniejacy motywa i go zmodyfikować
            var useTheme = document.createElement("span");
            useTheme.id = 'useTheme';
            useTheme.className = 'add';
            useTheme.innerHTML = "Użyj gotowego motywu";


            var copyThemesFrom = document.createElement('span');
            copyThemesFrom.id = 'copyThemesFrom';
            copyThemesFrom.className = 'button-fw';
            copyThemesFrom.innerHTML = 'Kopiuj motywy z innego formatu';


            buttonContainer.appendChild(addCreatedTheme);
            buttonContainer.appendChild(addTheme);
            buttonContainer.appendChild(copyThemesFrom);


            buttonContainer.appendChild( this.generateThemeColumnButton() );
             allThemes.appendChild( buttonContainer );
            allThemes.appendChild( themesList );

            var themeName = document.createElement('div');
            themeName.className = 'currentThemeName';

            var backToAllThemes = document.createElement('div');
            backToAllThemes.id = 'backToAllThemes';
            backToAllThemes.className = 'button-fw';
            backToAllThemes.innerHTML = 'Powróć do wszystkich motywów';

            var goToThemeImages = document.createElement('div');
            goToThemeImages.id = 'goToThemeImages';
            goToThemeImages.className = 'button-fw';
            goToThemeImages.innerHTML = 'Przejdź do zdjęć motywu';


            var goToThemeFrames = document.createElement('div');
            goToThemeFrames.id = 'goToThemeFrames';
            goToThemeFrames.className = 'button-fw';
            goToThemeFrames.innerHTML = 'Przejdź do ramek motywu';


            var goToThemeFonts = document.createElement('div');
            goToThemeFonts.id = 'goToThemeFonts';
            goToThemeFonts.className = 'button-fw';
            goToThemeFonts.innerHTML = 'Przejdź do czcionek motywu';
            document.getElementById('toolsContent').appendChild( toolContent );



            goToThemeImages.addEventListener('click', function( e ){

                e.stopPropagation();
                $("#allProjectThemes").animate({ left: '-200%'},200 );
                $("#themeContent").animate({ left: '-100%' },200 );
                $('#themeImages').animate({left:'0'}, 200 );

            });

            backToAllThemes.addEventListener('click', function(){

                 $("#allProjectThemes").animate({ left: '0'},200 );
                 $("#themeContent").animate({ left: '100%' },200 );
                 $('#themeImages').animate({left:'200%'}, 200 );

            });

            var backToThemePages = document.createElement('div');
            backToThemePages.id = 'backToThemePages';
            backToThemePages.className = 'button-fw'
            backToThemePages.innerHTML = 'Powróć do widoku stron motywu';

            backToThemePages.addEventListener('click', function( e ){

                e.stopPropagation();
                $("#allProjectThemes").animate({ left: -$('#themes-content').outerWidth() },200 );
                $("#themeContent").animate({ left: '0' },200 );
                $('#themeImages').animate({left:'100%'}, 200 );

            });

            goToThemeFonts.addEventListener( 'click', function( e ){

                e.stopPropagation();

                var themeFramesContent = document.createElement('div');


                var currentFrames = document.createElement('div');
                currentFrames.id = 'currentFrames';
                currentFrames.className = 'col-2';

                var cf_title = document.createElement('h4');
                cf_title.innerHTML = 'Czcionki w motywie';

                var cf_list = document.createElement('ul');
                cf_list.id = 'avaibleFontsList';

                currentFrames.appendChild( cf_title );
                currentFrames.appendChild( cf_list );


                var avaibleFrames = document.createElement('div');
                avaibleFrames.id = 'avaibleFrames';
                avaibleFrames.className = 'col-2';

                var af_title = document.createElement('h4');
                af_title.innerHTML = 'Czcionki dostępne';

                var af_list = document.createElement('ul');
                af_list.id = 'currentFontsList';

                avaibleFrames.appendChild( af_title );
                avaibleFrames.appendChild( af_list );

                var saveSettings = document.createElement('div');
                saveSettings.className = 'button-fw';
                saveSettings.innerHTML = 'Zapisz ustawienia';

                saveSettings.addEventListener('click', function( e ){

                    var container = document.getElementById('avaibleFontsList');

                    var fonts = container.querySelectorAll('.fontObj');

                    var selectedFonts = [];

                    for( var i=0; i < fonts.length; i++ ){

                        selectedFonts.push( fonts[i].getAttribute('font-name') );

                    }

                    this.editor.webSocketControllers.theme.setThemeFonts( this.editor.adminProject.format.theme.getID(), selectedFonts );

                }.bind( this ));

                themeFramesContent.appendChild( currentFrames );
                themeFramesContent.appendChild( avaibleFrames );
                themeFramesContent.appendChild( saveSettings );

                var allFonts = this.editor.fonts.getFonts();

                for( var key in allFonts ){

                    var font = allFonts[ key ];

                    var elem = document.createElement('li');
                    elem.className = "fontObj";
                    elem.setAttribute( 'font-name', key );
                    elem.innerHTML = key;

                    if( font.miniature ){

                        var miniatureBox = document.createElement('span');
                        miniatureBox.className = 'fontMiniature';

                        miniatureBox.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+font.miniature + ')';

                        elem.appendChild( miniatureBox );

                    }

                    af_list.appendChild( elem );

                }


                this.editor.webSocketControllers.theme.getThemeFonts( this.editor.adminProject.format.theme.getID(), function( data ){

                    var fonts = data.fonts;

                    var ac = document.getElementById('currentFontsList');
                    var cf = document.getElementById('avaibleFontsList');

                    for( var i=0; i<fonts.length; i++){

                        cf.appendChild( ac.querySelector('li[font-name="' + fonts[i].name + '"]') );

                    }


                });

                //console.log( this );

                var newViewWindow = this.displayWindow(

                    'themeFonts',
                    {
                        title : 'Czcionki motywu',
                        content : themeFramesContent,
                    }

                );

                $('body').append( newViewWindow );


                $('#themeFonts').on( 'hidden.bs.modal', function(){

                    $(this).remove();

                });

                $('#themeFonts').modal({

                    keyboard: false,
                    backdrop: 'static'

                });


                setTimeout( function(){

                    $( '#currentFontsList > li, #avaibleFontsList >li' ).draggable({

                        appendTo: "body",
                        helper: "clone"

                    });

                    $( "#currentFontsList").droppable({

                        activeClass: "ui-state-default",
                        hoverClass: "ui-state-hover",
                        accept: ":not(.ui-sortable-helper)",
                        drop: function( event, ui ) {

                            //console.log( ui );
                            //console.log( event );
                            document.getElementById('currentFontsList').appendChild( ui.draggable[0]);

                        }

                    });

                    $( "#avaibleFontsList").droppable({

                        activeClass: "ui-state-default",
                        hoverClass: "ui-state-hover",
                        accept: ":not(.ui-sortable-helper)",
                        drop: function( event, ui ) {

                            document.getElementById('avaibleFontsList').appendChild( ui.draggable[0]);

                        }

                    });


                }.bind(this), 1000);

            }.bind( this ));


            goToThemeFrames.addEventListener( 'click', function( e ){

                e.stopPropagation();

                var themeFramesContent = document.createElement('div');


                var currentFrames = document.createElement('div');
                currentFrames.id = 'currentFrames';
                currentFrames.className = 'col-2';

                var cf_title = document.createElement('h4');
                cf_title.innerHTML = 'Ramki w motywie';

                var cf_list = document.createElement('ul');
                cf_list.id = 'currentFramesList';

                currentFrames.appendChild( cf_title );
                currentFrames.appendChild( cf_list );


                var avaibleFrames = document.createElement('div');
                avaibleFrames.id = 'avaibleFrames';
                avaibleFrames.className = 'col-2';

                var af_title = document.createElement('h4');
                af_title.innerHTML = 'Ramki dostępne';

                var af_list = document.createElement('ul');
                af_list.id = 'avaibleFramesList';

                avaibleFrames.appendChild( af_title );
                avaibleFrames.appendChild( af_list );

                var saveSettings = document.createElement('div');
                saveSettings.className = 'button-fw';
                saveSettings.innerHTML = 'Zapisz ustawienia';

                saveSettings.addEventListener('click', function( e ){

                    e.stopPropagation();

                    var selected = document.body.querySelectorAll('#currentFramesList > li');

                    var ids = [];

                    for( var i=0; i < selected.length; i++ ){

                        ids.push( selected[i].getAttribute('bf-ID') );

                    }

                    Editor.webSocketControllers.theme.setBackgroundFrames( Editor.adminProject.format.theme.getID(), ids );

                });


                themeFramesContent.appendChild( currentFrames );
                themeFramesContent.appendChild( avaibleFrames );
                themeFramesContent.appendChild( saveSettings );

                Editor.webSocketControllers.frameObject.getAll( function( data ){

                    for( var i=0; i < data.length; i++ ){

                        var elem = document.createElement('li');
                        elem.className = "frameObj";
                        elem.setAttribute( 'bf-ID', data[i]._id );

                        if( data[i].ProjectImage ){

                            elem.style.backgroundImage = 'url(' + EDITOR_ENV.staticUrl+data[i].ProjectImage.thumbnail + ')';

                        }

                        af_list.appendChild( elem );

                    }

                });

                var newViewWindow = _this.displayWindow(

                    'themeFrames',
                    {
                        title : 'Ramki motywu',
                        content : themeFramesContent,
                    }

                );

                $('body').append( newViewWindow );


                $('#themeFrames').on( 'hidden.bs.modal', function(){

                    $(this).remove();

                });

                $('#themeFrames').modal({

                    keyboard: false,
                    backdrop: 'static'

                });


                setTimeout( function(){

                    $( '#avaibleFramesList > li' ).draggable({

                        appendTo: "body",
                        helper: "clone"

                    });

                    $( "#avaibleFramesList").droppable({

                        activeClass: "ui-state-default",
                        hoverClass: "ui-state-hover",
                        accept: ":not(.ui-sortable-helper)",
                        drop: function( event, ui ) {

                            //console.log( ui );
                            //console.log( event );
                            document.getElementById('avaibleFramesList').appendChild( ui.draggable[0]);

                        }

                    });

                    $( "#currentFramesList").droppable({

                        activeClass: "ui-state-default",
                        hoverClass: "ui-state-hover",
                        accept: ":not(.ui-sortable-helper)",
                        drop: function( event, ui ) {

                            document.getElementById('currentFramesList').appendChild( ui.draggable[0]);

                        }

                    });

                    Editor.webSocketControllers.theme.getBackgroundFrames( Editor.adminProject.format.theme.getID(), function( data ){

                        var ac = document.getElementById('avaibleFramesList');
                        var cf = document.getElementById('currentFramesList');

                        for( var i=0; i<data.length; i++){

                            cf.appendChild( ac.querySelector('li[bf-id="' + data[i] + '"]') );

                        }

                    });


                }.bind(this), 1000);

            });

            var themePagesList = document.createElement('ul');
            themePagesList.class = 'themePagesList';


            themeContent.appendChild( backToAllThemes );
            themeContent.appendChild( goToThemeImages );
            themeContent.appendChild( goToThemeFrames );
            themeContent.appendChild( goToThemeFonts );

            /* Zmiana ilości kolumn dla widoku listy themów */

            var changeColumns = document.createElement('div');
            changeColumns.id = 'changeColumns';
            changeColumns.className = 'buttonscolumns'
            changeColumns.innerHTML = 'Ilość kolumn';

            var columnButtonsContainer = document.createElement('div');
            columnButtonsContainer.className = 'columnButtonsContainer';

            var change2Columns = document.createElement('div');
            change2Columns.className = 'button-2columns'

            change2Columns.addEventListener('click', function(){

                $("#themepages").removeClass('themePageElement');
                $("#themepages").removeClass('twoColumns');
                $("#themepages").removeClass('threeColumns');
                $("#themepages").removeClass('sixColumns');

                $("#themepages").addClass("twoColumns");

            });




            var change3Columns = document.createElement('div');
            change3Columns.className = 'button-3columns'

            change3Columns.addEventListener('click', function(){

                $("#themepages").removeClass('themePageElement');
                $("#themepages").removeClass('twoColumns');
                $("#themepages").removeClass('threeColumns');
                $("#themepages").removeClass('sixColumns');

                $("#themepages").addClass("threeColumns");

            });


            var change6Columns = document.createElement('div');
            change6Columns.className = 'button-6columns'

            change6Columns.addEventListener('click', function(){

                $("#themepages").removeClass('themePageElement');
                $("#themepages").removeClass('twoColumns');
                $("#themepages").removeClass('threeColumns');
                $("#themepages").removeClass('sixColumns');

                $("#themepages").addClass("sixColumns");

            });
            columnButtonsContainer.appendChild( change2Columns );
            columnButtonsContainer.appendChild( change3Columns );
            columnButtonsContainer.appendChild( change6Columns );

            changeColumns.appendChild( columnButtonsContainer );

            /* KONIEC zmiany kolumn dla widoku listy themów */


            toolContent.appendChild( scrollAllThemes );
            //toolContent.appendChild( themeContent );

            var themePagesList = document.createElement('ul');
            themePagesList.class = 'themePagesList';
            //themeContent.appendChild( backToAllThemes );
            themeContent.appendChild( changeColumns );

            themeContent.appendChild( themeName );
            themeContent.appendChild( themeContent_pages );

            addCreatedTheme.addEventListener('click', function(){

                this.allThemesWindow();

            }.bind( this ));


            addTheme.addEventListener('click', function(){

                var content = document.createElement('div');

                var dropBox = document.createElement('div');
                dropBox.className = 'image-drop';
                dropBox.id = 'image-container-tool_dropArea_2';

                dropBox.addEventListener('dragover', function(e){
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';

                }, false);

                dropBox.addEventListener('drop', function(e){

                    //e.stopPropagation();
                    e.preventDefault();

                    var url = URL.createObjectURL( e.dataTransfer.files[0] );

                    var loadedImage = new createjs.Bitmap( url );

                    loadedImage.image.onload = function(){

                        loadedImage.origin = loadedImage.getBounds();
                        loadedImage.scale = {
                            x : loadedImage.origin.width,
                            y : loadedImage.origin.height
                        };
                        var obrazek = Thumbinator.generateThumb( loadedImage );
                        $('#image-container-tool_dropArea_2').html('');
                        $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');

                    }

                }, false);

                var form = document.createElement('div');
                form.className = 'form';

                var name = document.createElement('input');
                name.name = 'themeName';

                var category = document.createElement('input');
                category.name = 'categoryName';

                var newCategory = document.createElement('button');
                newCategory.id = 'newCategory';
                newCategory.value = 'Dodaj kategorię';

                var categorySelect = document.createElement('select');
                categorySelect.id = 'newThemeCategory-Select';
                categorySelect.className = 'themeCategorySelect';

                newCategory.addEventListener('click', function(){

                    $.ajax({

                        url : 'templates/newThemeCategory.html',
                        type : 'GET',
                        crossDomain : true,
                        success : function( data ){

                            $('body').append( data );

                            $('#newThemeCategory').on('shown.bs.modal', function() {
                                $(this).find('.modal-dialog').css({
                                    'margin-top': function () {
                                        return (window.innerHeight/2-($(this).outerHeight() / 2));
                                    },
                                    'margin-left': function () {
                                        return (window.innerWidth/2-($(this).outerWidth() / 2));
                                    }
                                });
                            });
                            $('#newThemeCategory .add-theme-category').on( 'click', function(){
                                Editor.webSocketControllers.themeCategory.add( $('#category-theme-name').val() );
                                $('#newThemeCategory').remove();
                            });

                            $('#newThemeCategory').on( 'hidden.bs.modal', function(){
                                $(this).remove();
                            });


                            $('#newThemeCategory').modal({
                                keyboard: false,
                                backdrop: 'static'
                            });

                        }

                    });

                });

                var addMiniButton = document.createElement('div');
                addMiniButton.id = "addMiniButton";


                var addMiniButtonInput = document.createElement('div');
                addMiniButtonInput.id = "addMiniButtonInput";

                var addMiniButtonInputButton = document.createElement('input');
                addMiniButtonInputButton.type = 'file';
                addMiniButtonInputButton.className = "button-fw inputHidden absolutePos";
                addMiniButtonInputButton.id = "addMiniatureToNewTheme";

                addMiniButtonInput.appendChild( addMiniButtonInputButton );
                addMiniButton.appendChild( addMiniButtonInput );

                var save = document.createElement('button');
                save.className = 'content-button';
                save.innerHTML = 'Zapisz';


                save.addEventListener('click', function( ){

                    //console.log( 'jest tutaj i dziala' );
                    //console.log( name.value );

                    var data = {

                        name : name.value,
                        category: $('#newThemeCategory-Select').val(),
                        image: $('#image-container-tool_dropArea_2 img').attr('src')

                    };

                    var errors = [];

                    if( data.name == "" ){

                        errors.push( { title: "Nazwa", description: "Wpisz nazwę motywu, dzięki niej będzie można łatwo wyszukać" } );

                    }

                    if( data.category == null ){

                        errors.push( { title: "Kategoria", description: "Kategoria jest wymagana. Dzięki niej użytkownicy prościej znajdą właściwy projekt" } );

                    }

                    if( !data.image ){

                        errors.push( { title: "Brak obrazu", description: "Obraz motywu pozwoli nakreślić jego ogólne cechy" } );

                    }

                    if( errors.length >0  ){

                        var content = "";

                        for( var i=0; i < errors.length; i++ ){

                            content += '<div><span class="error-title"><b>'+ errors[i].title +'</b></span>: ' + "<p class='error-description'>" + errors[i].description + "</p></div>";

                        }

                        Editor.template.warningView( content,()=>{}, ()=>{} );

                    }else {

                        Editor.webSocketControllers.mainTheme.add( name.value, $('#newThemeCategory-Select').val(), $('#image-container-tool_dropArea_2 img').attr('src') );

                    }



                });

                Editor.webSocketControllers.themeCategory.getAll();

                content.appendChild( dropBox );
                content.appendChild( name );
                content.appendChild( categorySelect );
                content.appendChild( newCategory );

                content.appendChild( addMiniButton );
                content.appendChild( dropBox );
                content.appendChild( save );

                var newThemeWindow = _this.displayWindow(

                    'newThemeWindow',
                    {

                        size: 'small',
                        title : 'Dodawanie nowego motywu',
                        content: content,

                    }

                );

                $('body').append( newThemeWindow );


                $('#newThemeWindow').on( 'hidden.bs.modal', function(){

                    $(this).remove();

                });

                $('#newThemeWindow').modal({

                    keyboard: false,
                    backdrop: 'static'

                });

                $('#addMiniatureToNewTheme').on('change', function(e){

                    e.preventDefault();

                    var file = e.target.files[0];
                    var url = URL.createObjectURL( file );
                    var loadedImage = new createjs.Bitmap( url );

                    loadedImage.image.onload = function(){

                        loadedImage.origin = loadedImage.getBounds();

                        loadedImage.scale = {
                            x : loadedImage.origin.width,
                            y : loadedImage.origin.height
                        };

                        var obrazek = Editor.Thumbinator.generateThumb( loadedImage );

                        $('#image-container-tool_dropArea_2').html('');
                        $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');


                     }


                });

            });


            copyThemesFrom.addEventListener('click', function(){

                Editor.webSocketControllers.adminProject.getFormats( Editor.adminProject.getProjectId(), function( data ){

                    var content = document.createElement('div');

                    for( var i=0; i < data.formats.length; i++ ){

                        var formatElem = document.createElement('div');
                        formatElem.className = 'format';
                        formatElem.setAttribute( 'format-id', data.formats[i]._id );

                        var formatInfo = document.createElement('div');
                        formatInfo.className = 'formatInfo';
                        formatInfo.innerHTML = 'Wymiary: ' + data.formats[i].width + 'x' + data.formats[i].height;
                        formatInfo.innerHTML += '<br>Spad: ' + data.formats[i].slope;
                        formatInfo.innerHTML += '<br>Motywów: ' + data.formats[i].Themes.length;

                        formatElem.appendChild( formatInfo );

                        formatElem.addEventListener('click', function( e ){

                            e.stopPropagation();

                            var fID = this.getAttribute('format-id');
                            Editor.webSocketControllers.format.get( fID, function( data ){

                                copyThemesFromOtherFormatWindow( data );

                            });

                        });

                        content.appendChild( formatElem );

                    }
                    formatSelectWindow( content, 'Z którego formatu chcesz skopiować motywy?' );

                });

            });


            var themeImages = document.createElement('div');
            themeImages.id = 'themeImages';

            var themeImagesDrop = document.createElement('div');
            themeImagesDrop.id = 'themeImagesDrop';

            themeImagesDrop.addEventListener('dragover', function( e ){

                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';

            });

            themeImagesDrop.addEventListener('drop', function( e ){

                e.preventDefault();

                Editor.handleDropedFileToUpload( e, function( min, thumbnail, file ){

                });

            });

            var themeImagesContainer = document.createElement('div');
            themeImagesContainer.id = 'themeImagesContainer';

            var themeImagesPhotos = document.createElement('div');
            themeImagesPhotos.className = 'themeImages';
            themeImagesPhotos.id = 'themeImagesPhotos';

            var scrollThemeImagesContainer = document.createElement('div');
            scrollThemeImagesContainer.className = 'scrollThemeImagesContainer';

            themeImagesPhotos.appendChild( scrollThemeImagesContainer );



            var themeBackgrounds = document.createElement('div');
            themeBackgrounds.className = 'themeImages';
            themeBackgrounds.id = 'themeImagesBackgrounds';

            var scrollThemeImagesContainer2 = document.createElement('div');
            scrollThemeImagesContainer2.className = 'scrollThemeImagesContainer';

            themeBackgrounds.appendChild( scrollThemeImagesContainer2 );

            var themeCliparts = document.createElement('div');
            themeCliparts.className = 'themeImages';
            themeCliparts.id = 'themeCliparts';

            var scrollThemeImagesContainer3 = document.createElement('div');
            scrollThemeImagesContainer3.className = 'scrollThemeImagesContainer';
            themeCliparts.appendChild( scrollThemeImagesContainer3  );

            var imageDestinationButtons = document.createElement('div');
            imageDestinationButtons.className = 'themeImagesDestination';

            var changeDestinationToPhotos = document.createElement('div');
            //changeDestinationToPhotos.innerHTML = 'Z';
            changeDestinationToPhotos.id = 'themeImagesPhotosController';
            changeDestinationToPhotos.className = 'changeImageDestination';


            var changeDestinationToBackgrounds = document.createElement('div');
           // changeDestinationToBackgrounds.innerHTML = 'B';
            changeDestinationToBackgrounds.id = 'themeImagesBackgroundController';
            changeDestinationToBackgrounds.className = 'changeImageDestination';


            var changeDestinationToCliparts = document.createElement('div');
           // changeDestinationToCliparts.innerHTML = 'C';
            changeDestinationToCliparts.id = 'themeImagesClipartsController';
            changeDestinationToCliparts.className = 'changeImageDestination';



            changeDestinationToCliparts.addEventListener('click', function( e ){

                e.stopPropagation();

                this.activeClipartsThemeImages();

            }.bind( this ));

            changeDestinationToBackgrounds.addEventListener('click', function( e ){

                e.stopPropagation();
                //console.log('wchodzi');
                this.activeBackgroundThemeImages();

            }.bind( this ));


            changeDestinationToPhotos.addEventListener('click', function( e ){

                e.stopPropagation();
                this.activePhotoThemeImages();

            }.bind( this ));

            imageDestinationButtons.appendChild( changeDestinationToPhotos );
            imageDestinationButtons.appendChild( changeDestinationToBackgrounds );
            imageDestinationButtons.appendChild( changeDestinationToCliparts );

            themeImagesContainer.appendChild( themeImagesPhotos );
            themeImagesContainer.appendChild( themeBackgrounds );
            themeImagesContainer.appendChild( themeCliparts );

            themeImages.appendChild( backToThemePages );
            themeImages.appendChild( this.editor.template.generateUploadButtons( this.themePhotosUploader.bind( this ) ));
            themeImages.appendChild( imageDestinationButtons );
            themeImages.appendChild( themeImagesDrop );
            themeImages.appendChild( themeImagesContainer );

            toolContent.appendChild( themeImages );
            scrollAllThemes.appendChild( themeImages );

            themeContent_pages.style.height = ($('#toolsBox').outerHeight() - $('#backToAllThemes').outerHeight() - $('#goToThemeImages').outerHeight() - $('#goToThemeFrames').outerHeight() - $('#changeColumns').outerHeight()) + 'px';
            //alert( themeContent_pages.style.height );

            Ps.initialize( themeImagesPhotos );
            Ps.initialize( themeBackgrounds );
            Ps.initialize( themeCliparts );
            Ps.initialize( themeContent_pages );

            return tool;

        }


        createDragAndDropArea ( area ){

        }


        activePhotoThemeImages (){

            $('#themeImagesPhotosController').addClass('selected');
            $('#themeImagesBackgroundController').removeClass('selected');
            $('#themeImagesClipartsController').removeClass('selected');

            $('#themeImagesContainer').attr('active-window', 'photo');
            $('#themeImagesPhotos').addClass('active');

            $('#themeImagesBackgrounds').removeClass('active');
            $('#themeCliparts').removeClass('active');


        }


        activeBackgroundThemeImages (){

            $('#themeImagesContainer').attr('active-window', 'backgrounds');
            $('#themeImagesBackgrounds').addClass('active');

            $('#themeImagesPhotos').removeClass('active');
            $('#themeCliparts').removeClass('active');

            $('#themeImagesPhotosController').removeClass('selected');
            $('#themeImagesBackgroundController').addClass('selected');
            $('#themeImagesClipartsController').removeClass('selected');


        }


        activeClipartsThemeImages (){

            //console.log('co tam');

            $('#themeImagesContainer').attr('active-window', 'cliparts');
            $('#themeCliparts').addClass('active');

            $('#themeImagesBackgrounds').removeClass('active');
            $('#themeImagesPhotos').removeClass('active');

            $('#themeImagesPhotosController').removeClass('selected');
            $('#themeImagesBackgroundController').removeClass('selected');
            $('#themeImagesClipartsController').addClass('selected');

        }


        allThemesWindow (){

            this.editor.webSocketControllers.mainTheme.getAll();

        }


        // trzeba przniesc do modułu 'windows'
        newThemeWindow (){

            var content = document.createElement('div');
            content.className = 'newThemeWindow-content';

            var dropBox = document.createElement('div');
            dropBox.className = 'image-drop';

            dropBox.id = 'image-container-tool_dropArea_2';

            dropBox.addEventListener('dragover', function(e){
                //e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';

            }, false);

            dropBox.addEventListener('drop', function(e){

                //e.stopPropagation();
                e.preventDefault();

                var url = URL.createObjectURL( e.dataTransfer.files[0] );

                var loadedImage = new createjs.Bitmap( url );

                loadedImage.image.onload = function(){

                    loadedImage.origin = loadedImage.getBounds();
                    loadedImage.scale = {
                        x : loadedImage.origin.width,
                        y : loadedImage.origin.height
                    };
                    var obrazek = Thumbinator.generateThumb( loadedImage );
                    $('#image-container-tool_dropArea_2').html('');
                    $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');

                }

            }, false);


            var form = document.createElement('div');
            form.className = 'form';

            var name = document.createElement('input');
            name.name = 'themeName';

            var category = document.createElement('input');
            category.name = 'categoryName';

            var newCategory = document.createElement('button');
            newCategory.id = 'newCategory';
            newCategory.value = 'Dodaj kategorię';

            var categorySelect = document.createElement('select');
            categorySelect.id = 'newThemeCategory-Select';
            categorySelect.className = 'themeCategorySelect';

            newCategory.addEventListener('click', function(){

                $.ajax({

                    url : 'templates/newThemeCategory.html',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        $('body').append( data );

                        $('#newThemeCategory').on('shown.bs.modal', function() {
                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });
                        });



                        $('#newThemeCategory .add-theme-category').on( 'click', function(){
                            Editor.webSocketControllers.themeCategory.add( $('#category-theme-name').val() );
                            $('#newThemeCategory').remove();
                        });

                        $('#newThemeCategory').on( 'hidden.bs.modal', function(){
                            $(this).remove();
                        });


                        $('#newThemeCategory').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });

                    }

                });

            });

            var save = document.createElement('span');
            save.className = 'button-fw';
            save.innerHTML = 'Zapisz';


            save.addEventListener('click', function( ){

                Editor.webSocketControllers.mainTheme.add( name.value, $('#newThemeCategory-Select').val(), $('#image-container-tool_dropArea_2 img').attr('src') );

            });


            Editor.webSocketControllers.themeCategory.getAll();

            content.appendChild( dropBox );
            content.appendChild( name );
            content.appendChild( newCategory );
            content.appendChild( categorySelect );
            content.appendChild( dropBox );
            content.appendChild( save );

            overlayBlock( content, 'normal' );

        }


        // trzeba przniesc do modułu 'windows'
        themeEditWindow ( theme ){

            var changes = {};

            var content = document.createElement('div');
            content.className = 'editThemeWindow-content';

            var dropBox = document.createElement('div');
            dropBox.className = 'image-drop';
            dropBox.id = 'image-container-tool_dropArea_2';

            var currentImage = document.createElement('img');
            currentImage.setAttribute('src', theme.url );

            dropBox.appendChild( currentImage );

            dropBox.addEventListener('dragover', function(e){
                //e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';


            }, false);

            dropBox.addEventListener('drop', function(e){

                dropBox.className = 'image-drop changed';
                //e.stopPropagation();
                e.preventDefault();

                var url = URL.createObjectURL( e.dataTransfer.files[0] );

                var loadedImage = new createjs.Bitmap( url );

                loadedImage.image.onload = function(){

                    loadedImage.origin = loadedImage.getBounds();
                    loadedImage.scale = {
                        x : loadedImage.origin.width,
                        y : loadedImage.origin.height
                    };
                    var obrazek = Thumbinator.generateThumb( loadedImage );
                    $('#image-container-tool_dropArea_2').html('');
                    $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');

                }

            }, false);


            var form = document.createElement('div');
            form.className = 'form';

            var name = document.createElement('input');
            name.name = 'themeName';
            name.id = 'mainThemeEdit_name';
            name.value = theme.name;

            name.addEventListener('change', function(){
                name.className = 'changed';
            });

            var category = document.createElement('input');
            category.name = 'categoryName';

             var addMiniButton = document.createElement('div');
            addMiniButton.id = "addMiniButton";


            var addMiniButtonInput = document.createElement('div');
            addMiniButtonInput.id = "addMiniButtonInput";

            var addMiniButtonInputButton = document.createElement('input');
            addMiniButtonInputButton.type = 'file';
            addMiniButtonInputButton.className = "button-fw inputHidden absolutePos";
            addMiniButtonInputButton.id = "addMiniatureToNewTheme";


            addMiniButtonInput.appendChild( addMiniButtonInputButton );
            addMiniButton.appendChild( addMiniButtonInput );



            var newCategory = document.createElement('button');
            newCategory.id = 'newCategory';
            newCategory.value = 'Dodaj kategorię';

            var categorySelect = document.createElement('select');
            categorySelect.id = 'editThemeCategory-Select';
            categorySelect.className = 'themeCategorySelect';

            categorySelect.addEventListener('change', function(){
                categorySelect.className = 'themeName changed';
            });

            newCategory.addEventListener('click', function(){

                $.ajax({

                    url : 'templates/newThemeCategory.html',
                    type : 'GET',
                    crossDomain : true,
                    success : function( data ){

                        $('body').append( data );

                        $('#newThemeCategory').on('shown.bs.modal', function() {
                            $(this).find('.modal-dialog').css({
                                'margin-top': function () {
                                    return (window.innerHeight/2-($(this).outerHeight() / 2));
                                },
                                'margin-left': function () {
                                    return (window.innerWidth/2-($(this).outerWidth() / 2));
                                }
                            });
                        });

                        $('#newThemeCategory .add-theme-category').on( 'click', function(){
                            Editor.webSocketControllers.themeCategory.add( $('#category-theme-name').val() );
                            $('#newThemeCategory').remove();
                        });

                        $('#newThemeCategory').on( 'hidden.bs.modal', function(){
                            $(this).remove();
                        });


                        $('#newThemeCategory').modal({
                            keyboard: false,
                            backdrop: 'static'
                        });

                    }

                });

            });

            var save = document.createElement('div');
            save.className = 'button-fw';
            save.innerHTML = 'Zamień';


            save.addEventListener('click', function( ){

                var changes = {};

                if( $('.editThemeWindow-content #mainThemeEdit_name').hasClass('changed') )
                    changes.name = $('.editThemeWindow-content #mainThemeEdit_name').val();
                if( $('.editThemeWindow-content #editThemeCategory-Select').hasClass('changed') )
                    changes.category = $('.editThemeWindow-content #editThemeCategory-Select').val();
                if( $('#image-container-tool_dropArea_2').hasClass('changed') )
                    changes.base64 = $('#image-container-tool_dropArea_2 img').attr('src');

                Editor.webSocketControllers.mainTheme.update( theme._id, changes );

            });

            this.editor.webSocketControllers.themeCategory.getAll();

            content.appendChild( dropBox );
            content.appendChild( name );
            content.appendChild( categorySelect );
            content.appendChild( newCategory );
            content.appendChild( addMiniButton );
            content.appendChild( dropBox );
            content.appendChild( save );

            var editThemeWindow = this.displayWindow(

                'editThemeWindow',
                {

                    size: 'small',
                    title: 'Edycja motywu',
                    content: content

                }

            );

            document.body.appendChild( editThemeWindow );

            $('#editThemeWindow').on( 'hidden.bs.modal', function(){
                $(this).remove();
            });


            $('#editThemeWindow').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('#addMiniatureToNewTheme').on('change', function(e){

                e.preventDefault();

                var file = e.target.files[0];
                var url = URL.createObjectURL( file );
                var loadedImage = new createjs.Bitmap( url );

                loadedImage.image.onload = function(){

                    loadedImage.origin = loadedImage.getBounds();

                    loadedImage.scale = {
                        x : loadedImage.origin.width,
                        y : loadedImage.origin.height
                    };

                    var obrazek = Thumbinator.generateThumb( loadedImage );

                    $('#image-container-tool_dropArea_2').html('');
                    $('#image-container-tool_dropArea_2').html('<img src="'+obrazek+'" >');


                 }

            });



        }



        createToolhelper ( content , side, id ){

            var toolHelperBox = document.createElement('div');
            var toolHelperBoxContent = document.createElement('div');
            var borderFx = document.createElement('div');


            toolHelperBoxContent.innerHTML = content;
            if ( id ){
                toolHelperBox.id = id;
            }else {
                toolHelperBox.id = 'infoBox';
            }
            toolHelperBox.className = 'infoBox_menu';
            if ( side == 'left' ){
                toolHelperBoxContent.className = 'infoBox_menu_content_left';
                borderFx.className = "border_fx_left";
            }else {
                 toolHelperBoxContent.className = 'infoBox_menu_content';
                 borderFx.className = "border_fx";
            }


            toolHelperBoxContent.appendChild( borderFx );
            toolHelperBox.appendChild( toolHelperBoxContent );

            return toolHelperBox;

        }

    }

    export { TemplateModule };
