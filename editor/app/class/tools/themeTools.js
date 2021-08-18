import {ProposedPosition2} from './../ProposedPosition2';
import {Text2} from './../Text2';
import {Bitmap} from './../EditorBitmap';

    var themeTools = function( editor ){

        var Editor = editor;

        var preparePageToSave = function( width, height, backgroundObjects, foregroundObjects ){

            var _backgroundObjects = {

                EditorBitmaps : [],
                Texts : []

            };

            var _foregroundObjects = {

                EditorBitmaps : [],
                Texts : []

            };

            for( var i=0; i < backgroundObjects.length; i++ ){

                if( backgroundObjects[i].type == "EditorBitmap" ){

                    _backgroundObjects.EditorBitmaps.push({

                        _id : (( backgroundObjects[i].dbID )? backgroundObjects[i].dbID : null ),
                        name : backgroundObjects[i].name,
                        width : backgroundObjects[i].width,
                        height : backgroundObjects[i].height,
                        rotation : backgroundObjects[i].rotation,
                        scaleX : backgroundObjects[i].scaleX,
                        scaleY : backgroundObjects[i].scaleY,
                        borderColor : backgroundObjects[i].borderColor,
                        borderWidth : backgroundObjects[i].borderWidth,
                        displaySimpleBorder : backgroundObjects[i].displaySimpleBorder,
                        uid : backgroundObjects[i].uid,
                        dropShadow : backgroundObjects[i]._dropShadow,
                        shadowBlur : backgroundObjects[i].shadowBlur,
                        shadowColor : backgroundObjects[i].shadowColor,
                        shadowOffsetX : backgroundObjects[i].shadowOffsetX,
                        shadowOffsetY : backgroundObjects[i].shadowOffsetY,
                        ProjectImage : backgroundObjects[i].collectionReference.dbID,
                        x : backgroundObjects[i].x,
                        y : backgroundObjects[i].y,
                        order : backgroundObjects[i].parent.getChildIndex( backgroundObjects[i] )

                    });

                }
                else if( backgroundObjects[i].type == "Text2" ){

                    // trzeba z tego zrobic metodę "prepareTosave" !!!
                    var text = backgroundObjects[i];

                    var textContent = [];

                    for( var li=0; li < text.lines.length; li++ ){

                        var _line = text.lines[li];

                        var line = {

                            lineHeight : _line.lineHeight,
                            letters : []

                        };

                        for( var l=0; l < _line.children.length; l++ ){

                            var letter = _line.children[l];

                            var _letter = {

                                text : letter.text,
                                size : letter.size,
                                lineHeight : letter.lineHeight,
                                color : letter.color,
                                fontFamily : letter.fontFamily,
                                fontType : letter.fontType

                            };

                            line.letters.push( _letter );

                        }

                        textContent.push( line );

                    }

                    _backgroundObjects.Texts.push( {
                        _id : ( (text.dbID)? text.dbID : null ),
                        name : text.name,
                        width : text.width,
                        height : text.height,
                        rotation : text.rotation,
                        uid : text.uid,
                        x : text.x,
                        y : text.y,
                        borderColor : backgroundObjects[i].borderColor,
                        borderWidth : backgroundObjects[i].borderWidth,
                        displaySimpleBorder : backgroundObjects[i].displaySimpleBorder,
                        dropShadow : backgroundObjects[i]._dropShadow,
                        shadowBlur : backgroundObjects[i].shadowBlur,
                        shadowColor : backgroundObjects[i].shadowColor,
                        shadowOffsetX : backgroundObjects[i].shadowOffsetX,
                        shadowOffsetY : backgroundObjects[i].shadowOffsetY,
                        order : text.parent.getChildIndex( backgroundObjects[i] ),
                        content : textContent

                    });
                }

            }

            for( var i=0; i < foregroundObjects.length; i++ ){

                if( foregroundObjects[i].type == "EditorBitmap" ){

                    _foregroundObjects.EditorBitmaps.push( {

                         _id : (( foregroundObjects[i].dbID )? foregroundObjects[i].dbID : null ),
                         name : foregroundObjects[i].name,
                         width : foregroundObjects[i].width,
                         height : foregroundObjects[i].height,
                         rotation : foregroundObjects[i].rotation,
                         scaleX : foregroundObjects[i].scaleX,
                         scaleY : foregroundObjects[i].scaleY,
                         uid : foregroundObjects[i].uid,
                         ProjectImage : foregroundObjects[i].collectionReference.dbID,
                         x : foregroundObjects[i].x,
                         y : foregroundObjects[i].y,
                         order : foregroundObjects[i].parent.getChildIndex( foregroundObjects[i] ),
                         borderColor : foregroundObjects[i].borderColor,
                         borderWidth : foregroundObjects[i].borderWidth,
                         displaySimpleBorder : foregroundObjects[i].displaySimpleBorder,
                         dropShadow : foregroundObjects[i]._dropShadow,
                         shadowBlur : foregroundObjects[i].shadowBlur,
                         shadowColor : foregroundObjects[i].shadowColor,
                         shadowOffsetX : foregroundObjects[i].shadowOffsetX,
                         shadowOffsetY : foregroundObjects[i].shadowOffsetY,

                    });

                }
                else if( foregroundObjects[i].type == "Text2" ){
                    // trzeba z tego zrobic metodę "prepareTosave" !!!
                    var text = foregroundObjects[i];

                    var textContent = [];

                    for( var li=0; li < text.lines.length; li++ ){

                        var _line = text.lines[li];

                        var line = {

                            lineHeight : _line.lineHeight,
                            letters : []

                        };

                        for( var l=0; l < _line.children.length; l++ ){

                            var letter = _line.children[l];

                            var _letter = {

                                text : letter.text,
                                size : letter.size,
                                lineHeight : letter.lineHeight,
                                color : letter.color,
                                fontFamily : letter.fontFamily,
                                fontType : letter.fontType

                            };

                            line.letters.push( _letter );

                        }

                        textContent.push( line );

                    }

                    _foregroundObjects.Texts.push( {

                        _id : (( text.dbID )? text.dbID : null ),
                        name : text.name,
                        width : text.width,
                        height : text.height,
                        rotation : text.rotation,
                        uid : text.uid,
                        x : text.x,
                        y : text.y,
                        borderColor : text.borderColor,
                        borderWidth : text.borderWidth,
                        displaySimpleBorder : text.displaySimpleBorder,
                        dropShadow : text._dropShadow,
                        shadowBlur : text.shadowBlur,
                        shadowColor : text.shadowColor,
                        shadowOffsetX : text.shadowOffsetX,
                        shadowOffsetY : text.shadowOffsetY,
                        order : text.parent.getChildIndex( foregroundObjects[i] ),
                        content : textContent

                    });

                }

            };


            Editor.pageThemToSave = {

                backgroundObjects : _backgroundObjects,
                foregroundObjects : _foregroundObjects,
                width : width,
                height : height

            };

            //console.log('informacje o zapisanej stronie');
            //console.log( Editor.pageThemToSave );

        };


        var generateThemePagePreview = function( width, height, backgroundObjects, foregroundObjects, dontPrepare, callback ){

            var bitmapCounter = 0;
            var readyBitmap = 0;

            //console.log( callback );


            if( dontPrepare ){
            }else{
                preparePageToSave( width, height, backgroundObjects, foregroundObjects );
            }

            var canvas = document.createElement("canvas");
            canvas.id = 'themeImage';
            canvas.width = width;
            canvas.height = height;

            // chwilowe style
            canvas.style.position = "relative";
            canvas.style.zIndex = 1000000;
            canvas.style.border = "4px solid";
            // -- koniec

            document.body.appendChild( canvas );

            var stage = new createjs.Stage( "themeImage" );

            for( var i=0; i < backgroundObjects.length; i++ ){

                if( backgroundObjects[i] instanceof Bitmap ){

                    bitmapCounter++;

                }

            }

            for( var i=0; i < backgroundObjects.length; i++ ){

                var obj = backgroundObjects[i]._cloneObject( bitmapCallback );

                //obj.image = backgroundObjects[i].anonymousSRC;
                stage.addChild( obj );

                if(  obj.imageShape ){

                    obj.imageShape.visible = false;

                }

            }

            for( var i=0; i < foregroundObjects.length; i++ ){

                var obj = foregroundObjects[i]._cloneObject();

                if( obj instanceof Editor.Text2 ){

                    var compounds = obj.getAllCompoundObjects();

                    for( var com = 0; com < compounds.length; com++ ){

                        compounds[com].object.visible = false;
                        //console.log( compounds[com] );

                    }

                }

                stage.addChild( obj );

                if(  obj.imageShape ){

                    obj.imageShape.visible = false;

                }

            }



            function bitmapCallback(){

                readyBitmap++;

                if( bitmapCounter == readyBitmap ){

                    stage.update();

                    //console.log('aktualizacja strony motywu');

                    var exampleImage = stage.toDataURL("#fff", "image/png");

                    stage.autoClear = true; // This must be true to clear the stage.
                    stage.removeAllChildren();
                    stage.update();

                    document.body.removeChild( document.getElementById("themeImage") );

                    //console.log( exampleImage );

                    callback( exampleImage );

                }

            }

        };

        var generateViewsPagePreview = function( width, height, backgroundObjects, foregroundObjects, userObjects, dontPrepare ){

            if( dontPrepare ){
            }else{
                preparePageToSave( width, height, backgroundObjects, foregroundObjects );
            }

            var canvas = document.createElement("canvas");
            canvas.id = 'themeImage';
            canvas.width = width;
            canvas.height = height;

            // chwilowe style
            canvas.style.position = "relative";
            canvas.style.zIndex = 1000000;
            canvas.style.border = "4px solid";
            // -- koniec

            document.body.appendChild( canvas );

            var stage = new createjs.Stage( "themeImage" );

            for( var i=0; i < backgroundObjects.length; i++ ){

                var obj = backgroundObjects[i]._cloneObject();

                //console.log( obj.image );
                obj.image.onload = function(){

                    //console.log('zaladowalo sie zdjecie ->>>>>>>>>>>>>>>>>>>>>>');

                }
                //obj.image = backgroundObjects[i].anonymousSRC;
                stage.addChild( obj );

                if(  obj.imageShape ){

                    obj.imageShape.visible = false;

                }

            }

            for( var i=0; i < foregroundObjects.length; i++ ){

                //console.log( foregroundObjects[i] );
                var obj = foregroundObjects[i]._cloneObject();

                if( obj instanceof Editor.Text2 ){

                    var compounds = obj.getAllCompoundObjects();

                    for( var com = 0; com < compounds.length; com++ ){

                        compounds[com].object.visible = false;
                        //console.log( compounds[com] );

                    }

                }

                stage.addChild( obj );

                if(  obj.imageShape ){

                    obj.imageShape.visible = false;

                }

            }

            for( var i=0; i < userObjects.length; i++ ){

                //console.log( userObjects[i] );
                var obj = userObjects[i]._cloneObject();

                if( obj instanceof Editor.Text2 ){

                    //console.log( obj );
                    //console.log('zobacz ten obekt');
                    var compounds = obj.getAllCompoundObjects();

                    for( var com = 0; com < compounds.length; com++ ){

                        compounds[com].object.visible = false;
                        //console.log( compounds[com] );

                    }

                }

                stage.addChild( obj );

                if(  obj.imageShape ){

                    obj.imageShape.visible = false;

                }

            }

            stage.update();
            //console.log('poszedl update stagea');

            var exampleImage = stage.toDataURL("#fff", "image/png");

            stage.autoClear = true; // This must be true to clear the stage.
            stage.removeAllChildren();
            stage.update();

            document.body.removeChild( document.getElementById("themeImage") );

            return exampleImage;

        };




        return {

            generateThemePagePreview : generateThemePagePreview,
            preparePageToSave : preparePageToSave

        };

    }

export {themeTools}
