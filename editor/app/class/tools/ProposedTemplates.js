

    var proposedTemplate = function(editor){

        var Editor = editor;

        // INIT MOCKS VALUES
        window.templateCategories = ['fotoalbum', 'wizytówka', 'baner reklamowy'];

        var currentTemplateCanvas = 0;

        var save = function( editableArea, templateObjects, categories ){

            var objectsInfo = [];

            for( var i=0; i < templateObjects.length; i++ ){

                if( templateObjects[i] instanceof Editor.Text2 ){
                    var _type = "Text2";
                }
                else if( templateObjects[i] instanceof Editor.ProposedPosition ){
                    var _type = "ProposedPosition";
                }

                objectsInfo.push({

                    pos : { x : templateObjects[i].x, y : templateObjects[i].y },
                    bounds : $.extend( true, {}, templateObjects[i].getTransformedBounds()),
                    size : { width : templateObjects[i].trueWidth , height : templateObjects[i].trueHeight },
                    rotation : templateObjects[i].rotation,
                    type : _type

                });

            }

            var areaWidth = editableArea.trueWidth;
            var areaHeight = editableArea.trueHeight;

            var image = generateTemplateImage( areaWidth, areaHeight, objectsInfo );
            Editor.webSocketControllers.proposedTemplate.add( areaWidth, areaHeight, objectsInfo, image, categories );
            //saveUrlMock( areaWidth, areaHeight, objectsInfo, image, categories );

        };


        var saveUrlMock = function( width, height, data, image, categories ){

            if( !window.templates ){

                window.templates = {};
                window.template_id = 1;

                window.templates[ window.template_id ] = {

                    objects : data,
                    width : width,
                    height : height,
                    image : image,
                    categories : categories,
                    template : window.template_id

                };

                window.template_id++;

            }
            else {

                window.templates[ window.template_id ] = {

                    objects : data,
                    width : width,
                    height : height,
                    image : image,
                    categories : categories

                };

                window.template_id++;

            }

        };



        var getTemplate = function( templateId ){

            var template = null;

            if( window.templates ){
                if( window.templates[ templateId ] ){
                    template = window.templates[ templateId ];
                }
            }

            return template;

        };


        var getTemplatesMock = function( ){

            if( window.templates )
                return window.templates;
            else
                return [];

        };


        var getTemplatesForCategory = function( category ){

            var templstes =[];

            return templates;

        };


        var reloadTemplatesList = function( editableAreaInstance, templates ){

            var list = document.createElement("ul");

            if( !templates )
                var templates = getTemplatesMock();

            for( var key in templates ){

                var li = document.createElement("li");
                li.className = 'template-element';
                li.dataset.templateId = key;
                li.innerHTML = generateTemplateForThisArea( editableAreaInstance, templates[key] );//'<img src="'+templates[key].image+'"/>';
                list.appendChild( li );

                li.addEventListener('click', function(){

                    var editableArea = Editor.stage.getObjectById( Editor.tools.getEditObject() );
                    editableArea.loadTemplate( $(this).attr('data-template-id') );

                });

            }

            return list;

        };


        var displayTemplatesList = function( editableAreaInstance, templates ){

            var elem = document.createElement('div');

            var areaBounds = editableAreaInstance.getTransformedBounds();
            var areaGlobalPos = editableAreaInstance.getGlobalPosition();

            var list = document.createElement("ul");
            list.id = 'template-list-examples';
            list.style.left = areaGlobalPos[0] + ((areaBounds.width/2)*Editor.getStage().scaleX + 20) + "px";

            $("#templates-list-inside").html('');

            if( !templates )
                var templates = getTemplatesMock();


            for( var key in templates ){

                var li = document.createElement("li");
                li.className = 'template-element';
                li.dataset.templateId = key;
                li.innerHTML = generateTemplateForThisArea( editableAreaInstance, templates[key] );//'<img src="'+templates[key].image+'"/>';
                list.appendChild( li );

                li.addEventListener('click', function(){

                    var editableArea = Editor.stage.getObjectById( Editor.tools.getEditObject() );
                    editableArea.loadTemplate( $(this).attr('data-template-id') );

                });

            }

            elem.appendChild( list );

            return elem;

        };


        var loadTemplateFotThisArea = function( area, template ){

            //console.log();

        };


        var generateTemplateForThisArea = function( area, template ){
            return;
            var canvas = document.createElement("canvas");

            var thisCanvasId = currentTemplateCanvas;
            canvas.id = 'templateImage_' + thisCanvasId;
            currentTemplateCanvas++;

            canvas.width = area.trueWidth;
            canvas.height = area.trueHeight;
            document.body.appendChild( canvas );

            var stage = new createjs.Stage( 'templateImage_' + thisCanvasId );

            var background = new createjs.Shape();
            background.graphics.beginFill("#00a99d").drawRect(0, 0, canvas.width, canvas.height );
            stage.addChild( background );
            var temp = template;

            var aspectX = temp.width/canvas.width;
            var aspectY = temp.height/canvas.height;

            var debug = true;

                var temp = template;
                temp.generatedObjects = [];

                for( var i=0; i < temp.objects.length; i++ ){


                    var obj = temp.objects[i];

                    var smallAxis = Math.sqrt( (obj.size.width)*(obj.size.width) + (obj.size.height)*(obj.size.height) );
                    var bigAxis = smallAxis*1/aspectX;
                    var topBoundLineY = obj.bounds.y;
                    var y1 = topBoundLineY;
                    var b = bigAxis;
                    var a = smallAxis;
                    var newBoundsWidth = obj.bounds.width * 1/aspectX;
                    var newBoundsHeight = obj.bounds.height * 1/aspectY;
                    var topCrossPoint = Math.sqrt( Math.abs(((y1*y1)/(b*b)-1)*a*a) );

                    var shape = new createjs.Shape();
                    shape.graphics.f("#fff").setStrokeStyle(1).beginStroke("#afafaf").drawRect( 0, 0, temp.objects[i].size.width*1/aspectX, temp.objects[i].size.height*1/aspectY );
                    shape.x =  temp.objects[i].pos[0]*1/aspectX;
                    shape.y =  temp.objects[i].pos[1]*1/aspectY;
                    shape.regX = (temp.objects[i].size.width*1/aspectX)/2;
                    shape.regY = (temp.objects[i].size.height*1/aspectY)/2;
                    shape.rotation = temp.objects[i].rotation;
                    //stage.addChild( shape );

                    if( debug ) {

                        var originalCircle = new createjs.Shape();
                        originalCircle.x = shape.x;
                        originalCircle.y = shape.y;
                        originalCircle.graphics.setStrokeStyle(1).beginStroke("#f00").drawCircle( 0, 0, smallAxis/2 );
                        stage.addChild( originalCircle );


                        // boundsy orginalnego obiektu
                        var oldBounds = new createjs.Shape();
                        oldBounds.x = shape.x;
                        oldBounds.y = shape.y;
                        oldBounds.regX = obj.bounds.width/2;
                        oldBounds.regY = obj.bounds.height/2;
                        oldBounds.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect( 0, 0, obj.bounds.width, obj.bounds.height );
                        stage.addChild( oldBounds );


                        // ksztalt oryginalnego obiektu
                        var oldShape = new createjs.Shape();
                        oldShape.x = shape.x;
                        oldShape.y = shape.y;
                        oldShape.regX = obj.size.width/2;
                        oldShape.regY = obj.size.height/2;
                        oldShape.rotation = obj.rotation;
                        oldShape.graphics.setStrokeStyle(1).beginStroke("#0f0").drawRect( 0, 0, obj.size.width, obj.size.height );
                        stage.addChild( oldShape );


                        var newBounds = new createjs.Shape();
                        newBounds.x =  shape.x;
                        newBounds.y =  shape.y;
                        newBounds.regX = newBoundsWidth/2;
                        newBounds.regY = newBoundsHeight/2;
                        newBounds.graphics.setStrokeStyle(1).beginStroke("#00f").drawRect( 0, 0, newBoundsWidth, newBoundsHeight );
                        stage.addChild( newBounds );


                        var newElipse = new createjs.Shape();
                        newElipse.x =  shape.x;
                        newElipse.y =  shape.y;
                        newElipse.regX = smallAxis/aspectX/2;
                        newElipse.regY = smallAxis/aspectY/2;
                        newElipse.graphics.setStrokeStyle(1).beginStroke("#00f").drawEllipse( 0, 0, smallAxis/aspectX, smallAxis/aspectY );
                        stage.addChild( newElipse );


                        var bounds = new createjs.Shape();
                        bounds.regX =  bigAxis/2;
                        bounds.regY = smallAxis/2;
                        bounds.graphics.setStrokeStyle(1).beginStroke("#0f0").drawRect( temp.objects[i].pos[0]*1/aspectX, temp.objects[i].pos[1]*1/aspectY, bigAxis, smallAxis );
                        //stage.addChild( bounds );

                    }

                    // nowy kształt i rozmiar
                    var newRect = new createjs.Shape();
                    newRect.x = shape.x;
                    newRect.y = shape.y;

                    var a  = bigAxis/2;
                    var b  = smallAxis/2/aspectY;
                    var y  = obj.bounds.y * 1/aspectY;
                    var y2 = y + obj.bounds.height * 1/aspectY;
                    var x1 = obj.bounds.x *1/aspectX + obj.bounds.width*1/aspectX;
                    var x2 = obj.bounds.x * 1/aspectX;
                    var yO = shape.y;
                    var xO = shape.x;

                        var trueRotate = obj.rotation%360;

                        // punkty przecięcia elipsy z górną prostą ( górnym bokiem boksa opisującego)
                        var positiveCrossPointTopX = Math.sqrt( Math.abs( (1-( (( y-yO )*( y-yO ))/(b*b) ))*a*a ) ) + xO;
                        var negativeCrossPointTopX = -Math.sqrt( Math.abs( (1-( (( y-yO )*( y-yO ))/(b*b) ))*a*a ) ) + xO;

                        // punkty przecięcia elipsy z prawym bokiem boksa opisującego element
                        var positiveCrossPointRightY = Math.sqrt( Math.abs( (1-((x1-xO)*(x1-xO))/(a*a))*b*b ) ) + yO;
                        var negativeCrossPointRightY = -Math.sqrt( Math.abs( (1-((x1-xO)*(x1-xO))/(a*a))*b*b ) ) + yO ;

                        // promien elipsy opisanego na nowym boksie opisujacym
                        var radius = Math.sqrt((negativeCrossPointRightY-shape.y)*(negativeCrossPointRightY-shape.y) + ( x1-shape.x )*( x1-shape.x ));

                        // punkty przecięcia elipsy opisanego z lewej strony
                        var positiveCrossPointLeftY = Math.sqrt( Math.abs( (1-((x2-xO)*(x2-xO))/(a*a))*b*b ) ) + yO;
                        var negativeCrossPointLeftY = -Math.sqrt( Math.abs( (1-((x2-xO)*(x2-xO))/(a*a))*b*b ) ) + yO;

                        // punkty przecięzia elipsy u dołu boksa opisujacego
                        var positiveCrossPointBottomX = Math.sqrt( Math.abs( (1-( (( y2-yO )*( y2-yO ))/(b*b) ))*a*a ) ) + xO;
                        var negativeCrossPointBottomX = -Math.sqrt( Math.abs( (1-( (( y2-yO )*( y2-yO ))/(b*b) ))*a*a ) ) + xO;

                        // punkty przecięcia nowego koła opisanego na nowym bboksie u góry
                        var positiveTopCircleCross = Math.sqrt( radius*radius - ((y-shape.y)*(y-shape.y)) ) + shape.x;
                        var negativeTopCircleCross = -Math.sqrt( radius*radius - ((y-shape.y)*(y-shape.y)) ) + shape.x;

                        var przeciecieKolaDol = -Math.sqrt( radius*radius - ((y2-shape.y)*(y2-shape.y)) ) + shape.x;

                        // wymiary i rotacja nowego obiektu
                        var newWidth  = Math.sqrt((y-positiveCrossPointLeftY)*(y-positiveCrossPointLeftY) + ( positiveTopCircleCross - x2 )*( positiveTopCircleCross -x2 )) ;
                        var newHeight = Math.sqrt( (x1-positiveTopCircleCross )*(x1-positiveTopCircleCross) + ( y-negativeCrossPointRightY )*( y-negativeCrossPointRightY ) );
                        var rotation  = Math.asin( Math.sin( ( (obj.bounds.height*1/aspectY) + (obj.bounds.y*1/aspectY) - negativeCrossPointRightY )/newWidth ) )*180/Math.PI;

                        // w zależności od rotacji przyjmujemy różne punkty przecięcia okręgu z boksem opisujacym
                        if( debug ){

                            var positiveCrossPointTop = new createjs.Shape();
                            positiveCrossPointTop.graphics.f("red").drawCircle( positiveCrossPointTopX, y, 4 );
                            stage.addChild( positiveCrossPointTop );
                            var positiveCrossPointTopText = new createjs.Text("positiveCrossPointTopText","10px Arial", "red");
                            positiveCrossPointTopText.x = positiveCrossPointTopX;
                            positiveCrossPointTopText.y = y;
                            stage.addChild( positiveCrossPointTopText );

                            var negativeCrossPointTop = new createjs.Shape();
                            negativeCrossPointTop.graphics.f("red").drawCircle( negativeCrossPointTopX, y, 4 );
                            stage.addChild( negativeCrossPointTop );
                            var negativeCrossPointTopText = new createjs.Text("negativeCrossPointTopText","10px Arial", "red");
                            negativeCrossPointTopText.x = negativeCrossPointTopX;
                            negativeCrossPointTopText.y = y;
                            stage.addChild( negativeCrossPointTopText );

                            var circleDescribingNewRect = new createjs.Shape();
                            circleDescribingNewRect.x = shape.x;
                            circleDescribingNewRect.y = shape.y;
                            circleDescribingNewRect.graphics.setStrokeStyle(1).beginStroke("#f00").drawCircle( 0, 0, radius );
                            //stage.addChild( circleDescribingNewRect );

                            var topCrossPointRight = new createjs.Shape();
                            topCrossPointRight.graphics.f("red").drawCircle( x1, positiveCrossPointRightY, 4 );
                            stage.addChild( topCrossPointRight );
                            var topCrossPointRightText = new createjs.Text("topCrossPointRightText","10px Arial", "red");
                            topCrossPointRightText.x = x1;
                            topCrossPointRightText.y = positiveCrossPointRightY;
                            stage.addChild( topCrossPointRightText );

                            var bottomCrossPointRight = new createjs.Shape();
                            bottomCrossPointRight.graphics.f("red").drawCircle( x1, negativeCrossPointRightY, 4 );
                            stage.addChild( bottomCrossPointRight );
                            var bottomCrossPointRightText = new createjs.Text("bottomCrossPointRight","10px Arial", "red");
                            bottomCrossPointRightText.x = x1;
                            bottomCrossPointRightText.y = negativeCrossPointRightY;
                            stage.addChild( bottomCrossPointRightText );

                            var thirdPoint = new createjs.Shape();
                            thirdPoint.graphics.f("blue").drawCircle( x2, positiveCrossPointLeftY, 4 );
                            stage.addChild( thirdPoint );
                            var thirdPointText = new createjs.Text("PositiveCrossPointLeftY","10px Arial", "blue");
                            thirdPointText.x = x2;
                            thirdPointText.y = positiveCrossPointLeftY;
                            stage.addChild( thirdPointText );

                            var thirdPoint2 = new createjs.Shape();
                            thirdPoint2.graphics.f("red").drawCircle( x2, negativeCrossPointRightY, 4 );
                            stage.addChild( thirdPoint2 );
                            var thirdPoint2Text = new createjs.Text("thirdPoint2Text","10px Arial", "red");
                            thirdPoint2Text.x = x2;
                            thirdPoint2Text.y = negativeCrossPointRightY;
                            stage.addChild( thirdPoint2Text );

                            var point4 = new createjs.Shape();
                            point4.graphics.f("red").drawCircle( positiveCrossPointBottomX, y2, 4 );
                            stage.addChild( point4 );
                            var point4Text = new createjs.Text("point4Text","10px Arial", "red");
                            point4Text.x = positiveCrossPointBottomX;
                            point4Text.y = y2;
                            stage.addChild( point4Text );

                            var point42 = new createjs.Shape();
                            point42.graphics.f("red").drawCircle( negativeCrossPointBottomX, y2, 4 );
                            stage.addChild( point42 );
                            var point42Text = new createjs.Text("point42Text","10px Arial", "red");
                            point42Text.x = negativeCrossPointBottomX;
                            point42Text.y = y2;
                            stage.addChild( point42Text );

                            //alert("nowa szerkoosc: " + newWidth + ", nowa wysoosc: " + newHeight + ", nowa rotacja: " + rotation );

                        }

                        var obj = temp.objects[i];
                        var oldAngle = obj.rotation % 360;

                        var oldTriangleHelper = {

                            height : Math.abs(Math.sin( oldAngle * (Math.PI/180) ) * (obj.size.width/2)),
                            width  : Math.abs(Math.sin( ( 180 - 90 - oldAngle ) * ( Math.PI/180 ) ) * ( obj.size.width/2))

                        };

                        var c_0 = Math.sqrt( Math.pow( oldTriangleHelper.height, 2 ) + Math.pow( oldTriangleHelper.width, 2 ) );
                        var c = Math.sqrt( Math.pow( oldTriangleHelper.height, 2 ) + Math.pow( oldTriangleHelper.width/aspectX, 2 ) );

                        var newAngle = (( oldAngle >= 0 )? 1 : -1 ) *Math.asin( oldTriangleHelper.height/( c ) )* 180/Math.PI;

                        if( trueRotate < 0 ){
                            trueRotate += 360;
                        }

                        if( trueRotate >= 0 && trueRotate < 45 ){

                            var pP = {

                                a : { x : (obj.bounds.x + obj.bounds.width)/aspectX, y : negativeCrossPointRightY},
                                b : { x : positiveCrossPointBottomX, y : y2 },
                                c : { x : x2, y : positiveCrossPointLeftY },
                                d : { x : negativeCrossPointTopX, y : y }

                            };

                            var testHeight = Math.sqrt( Math.pow( Math.abs( pP.b.x - pP.a.x ), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt( Math.pow( Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = Math.sin( (pP.d.x - (obj.bounds.x/aspectX))/testHeight )*180/Math.PI;

                        }
                        else if( trueRotate >= 45 && trueRotate < 90 ){

                            var pP = {

                                a : { x : x1, y : positiveCrossPointRightY},
                                b : { x : negativeCrossPointBottomX, y : y2 },
                                c : { x : x2, y : negativeCrossPointRightY },
                                d : { x : positiveCrossPointTopX, y : y }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y),2 ));

                            newAngle = 90 - Math.asin( ( x1 - pP.d.x )/testWidth )*180/Math.PI ;

                        }
                        else if( trueRotate >= 90 && trueRotate < 135 ){

                            var pP = {

                                a : { x : x1, y : positiveCrossPointRightY},
                                b : { x : negativeCrossPointBottomX, y : y2 },
                                c : { x : x2, y : negativeCrossPointRightY },
                                d : { x : positiveCrossPointTopX, y : y }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2));

                            newAngle = 90 + Math.asin( ( x1 - pP.d.x )/testWidth )*180/Math.PI;

                        }
                        else if( trueRotate >= 135 && trueRotate < 180 ){

                            var pP = {

                                a : { x : negativeCrossPointBottomX, y : y2 },
                                b : { x : x2, y : negativeCrossPointRightY },
                                c : { x : positiveCrossPointTopX, y : y },
                                d : { x : x1, y : positiveCrossPointRightY }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = 90 + Math.asin( ( x1 - pP.a.x )/testWidth )*180/Math.PI;

                        }
                        else if( trueRotate >= 180 && trueRotate < 225 ){

                            var pP = {

                                a : { x : x2, y : positiveCrossPointLeftY },
                                b : { x : negativeCrossPointTopX, y : y },
                                c : { x : x1, y : negativeCrossPointRightY },
                                d : { x : positiveCrossPointBottomX, y : y2 }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = Math.asin( ( pP.b.x - x2 )/testHeight )*180/Math.PI + 180;

                        }
                        else if( trueRotate >= 225 && trueRotate < 270 ){

                            var pP = {

                                a : { x : x2, y : negativeCrossPointLeftY },
                                b : { x : positiveCrossPointTopX, y : y },
                                c : { x : x1, y : positiveCrossPointRightY },
                                d : { x : negativeCrossPointBottomX, y : y2 }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = Math.asin( ( pP.b.x - x2 )/testHeight )*180/Math.PI + 180;

                        }
                        else if( trueRotate >= 270 && trueRotate < 315  ){

                            var pP = {

                                a : { x : negativeCrossPointTopX, y : y},
                                b : { x : (obj.bounds.x + obj.bounds.width)/aspectX, y : negativeCrossPointRightY },
                                c : { x : positiveCrossPointBottomX, y : (obj.bounds.y + obj.bounds.height )/aspectY },
                                d : { x : (obj.bounds.x)/aspectX, y : positiveCrossPointLeftY }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y),2 ));

                            newAngle = Math.asin( ( pP.a.x - x2 )/testWidth )*180/Math.PI + 270;

                        }
                        else if( trueRotate >= 315 && trueRotate < 360 ){

                            var pP = {

                                a : { x : positiveCrossPointTopX, y : y},
                                b : { x : (obj.bounds.x + obj.bounds.width)/aspectX, y : positiveCrossPointRightY },
                                c : { x : negativeCrossPointBottomX, y : (obj.bounds.y + obj.bounds.height )/aspectY },
                                d : { x : (obj.bounds.x)/aspectX, y : negativeCrossPointLeftY }

                            };

                            var testHeight = Math.sqrt( Math.pow( Math.abs( pP.b.x - pP.a.x ), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt( Math.pow( Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs( pP.a.y - pP.d.y ) ,2 ));

                            newAngle = Math.asin( ( pP.a.x - x2 )/testWidth )*180/Math.PI + 270;

                        }
                        //alert([temp.objects[i].pos[0]/aspectX,temp.objects[i].pos[0], aspectX ]);
                        temp.generatedObjects.push({

                            type: temp.objects[i].type,
                            size: {
                                height: testHeight,
                                width : testWidth
                            },
                            transformation: {
                                x : temp.objects[i].pos[0]/aspectX,
                                y : temp.objects[i].pos[1]/aspectY,
                                rotation : newAngle
                            },
                            pos: {
                                x : temp.objects[i].pos[0]/aspectX,
                                y : temp.objects[i].pos[1]/aspectY,
                            },
                            rotation : newAngle

                        });

                        if( obj.type == "Text2" )
                            var text = new createjs.Text("Text", "20px Arial", "#5c5c5c");
                        else if( obj.type == "ProposedPosition" )
                            var text = new createjs.Text("Zdjęcie", "20px Arial", "#5c5c5c");

                        var bounds = text.getBounds();
                        text.textBaseline = "middle";
                        text.regX = bounds.width/2;
                        text.x = temp.objects[i].pos[0]*1/aspectX;
                        text.y = temp.objects[i].pos[1]*1/aspectY;
                        text.rotation = temp.objects[i].rotation;

                        shape.graphics.c().f("#fff").setStrokeStyle(1).beginStroke("#fff").drawRect( 0, 0, testWidth, testHeight );
                        shape.x =  temp.objects[i].pos[0]*1/aspectX;
                        shape.y =  temp.objects[i].pos[1]*1/aspectY;
                        shape.regX = (testWidth)/2;
                        shape.regY = (testHeight)/2;
                        shape.rotation = text.rotation = newAngle;

                        stage.addChild( shape );
                        stage.addChild( text );

                }


                stage.update();

                var exampleImage = stage.toDataURL("#fff", "image/png");



                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();





            document.body.removeChild( document.getElementById("templateImage_"+thisCanvasId) );

            var image = null;

            var innerHTML = "<img src='" + exampleImage + "' data-id='"+template.id+"'/>";

            var obj = {};
            obj.img = innerHTML;
            obj.id = template.id;
            obj.objects = temp.generatedObjects;

            if ( !window.proposedTemplate_tmp ){

                window.proposedTemplate_tmp = {};

            }

            window.proposedTemplate_tmp[template.id] = temp.generatedObjects;

            return obj;

        };

        // wersja testowa ze zmianami
        var generateTemplateForThisArea = function( area, template ){

            var canvas = document.createElement("canvas");

            var thisCanvasId = currentTemplateCanvas;
            canvas.id = 'templateImage_' + thisCanvasId;
            currentTemplateCanvas++;

            canvas.width = area.trueWidth;
            canvas.height = area.trueHeight;
            document.body.appendChild( canvas );

            var stage = new createjs.Stage( 'templateImage_' + thisCanvasId );

            var background = new createjs.Shape();
            background.graphics.beginFill("#00a99d").drawRect(0, 0, canvas.width, canvas.height );
            stage.addChild( background );
            var temp = template;

            var aspectX = temp.width/canvas.width;
            var aspectY = temp.height/canvas.height;


            var objects = [];

            // zbieranie obiktów do jendej tablicy, a następnie posortowane jej
            for( var i=0; i < template.ProposedImages.length; i++ ){

                template.ProposedImages[i].type = 'Image';
                objects.push( template.ProposedImages[i] );

            }

            for( var i=0; i < template.ProposedTexts.length; i++ ){

                template.ProposedTexts[i].type = 'Text';
                objects.push( template.ProposedTexts[i] );

            }

            // teraz następuje sortowanie:::
            var needSort = 1;

            do {

                var smaller = false;

                for( var i=0; i< objects.length-1; i++ ){

                    if( objects[i].order > objects[i+1].order ){

                        smaller = true;
                        var tmp = objects[i+1];
                        objects[i+1] = objects[i];
                        objects[i] = tmp;

                    }
                }

                if( smaller )
                    needSort = 1;
                else
                    needSort = 0;

            }
            while( needSort );

            var debug = false;

                var temp = template;
                temp.generatedObjects = [];

                for( var i=0; i < objects.length; i++ ){

                    if( !objects[i].size ){
                        console.warn('w szablonie jest obiekt o zerowym rozmiarze, należy go usunąć i wykonać na nowo!');
                        continue;
                    }

                    var obj = objects[i];

                    obj.rotation = parseInt(obj.rotation);

                    //console.log( obj );
                    //console.log( '========================' );

                    var smallAxis = Math.sqrt( (obj.size.width)*(obj.size.width) + (obj.size.height)*(obj.size.height) );
                    var bigAxis = smallAxis*1/aspectX;
                    var topBoundLineY = obj.bounds.y;
                    var y1 = topBoundLineY;
                    var b = bigAxis;
                    var a = smallAxis;
                    var newBoundsWidth = obj.bounds.width * 1/aspectX;
                    var newBoundsHeight = obj.bounds.height * 1/aspectY;
                    var topCrossPoint = Math.sqrt( Math.abs(((y1*y1)/(b*b)-1)*a*a) );

                    var shape = new createjs.Shape();
                    shape.graphics.f("#fff").setStrokeStyle(1).beginStroke("#afafaf").drawRect( 0, 0, obj.size.width*1/aspectX, obj.size.height*1/aspectY );
                    shape.x =  obj.pos.x*1/aspectX;
                    shape.y =  obj.pos.y*1/aspectY;
                    shape.regX = (obj.width*1/aspectX)/2;
                    shape.regY = (obj.height*1/aspectY)/2;
                    shape.rotation = obj.rotation;
                    //stage.addChild( shape );

                    if( debug ) {

                        var originalCircle = new createjs.Shape();
                        originalCircle.x = shape.x;
                        originalCircle.y = shape.y;
                        originalCircle.graphics.setStrokeStyle(1).beginStroke("#f00").drawCircle( 0, 0, smallAxis/2 );
                        stage.addChild( originalCircle );


                        // boundsy orginalnego obiektu
                        var oldBounds = new createjs.Shape();
                        oldBounds.x = shape.x;
                        oldBounds.y = shape.y;
                        oldBounds.regX = obj.bounds.width/2;
                        oldBounds.regY = obj.bounds.height/2;
                        oldBounds.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect( 0, 0, obj.bounds.width, obj.bounds.height );
                        stage.addChild( oldBounds );


                        // ksztalt oryginalnego obiektu
                        var oldShape = new createjs.Shape();
                        oldShape.x = shape.x;
                        oldShape.y = shape.y;
                        oldShape.regX = obj.size.width/2;
                        oldShape.regY = obj.size.height/2;
                        oldShape.rotation = obj.rotation;
                        oldShape.graphics.setStrokeStyle(1).beginStroke("#0f0").drawRect( 0, 0, obj.size.width, obj.size.height );
                        stage.addChild( oldShape );


                        var newBounds = new createjs.Shape();
                        newBounds.x =  shape.x;
                        newBounds.y =  shape.y;
                        newBounds.regX = newBoundsWidth/2;
                        newBounds.regY = newBoundsHeight/2;
                        newBounds.graphics.setStrokeStyle(1).beginStroke("#00f").drawRect( 0, 0, newBoundsWidth, newBoundsHeight );
                        stage.addChild( newBounds );


                        var newElipse = new createjs.Shape();
                        newElipse.x =  shape.x;
                        newElipse.y =  shape.y;
                        newElipse.regX = smallAxis/aspectX/2;
                        newElipse.regY = smallAxis/aspectY/2;
                        newElipse.graphics.setStrokeStyle(1).beginStroke("#00f").drawEllipse( 0, 0, smallAxis/aspectX, smallAxis/aspectY );
                        stage.addChild( newElipse );


                        var bounds = new createjs.Shape();
                        bounds.regX =  bigAxis/2;
                        bounds.regY = smallAxis/2;
                        bounds.graphics.setStrokeStyle(1).beginStroke("#0f0").drawRect( obj.pos[0]*1/aspectX, obj.pos[1]*1/aspectY, bigAxis, smallAxis );
                        //stage.addChild( bounds );

                    }

                    // nowy kształt i rozmiar
                    var newRect = new createjs.Shape();
                    newRect.x = shape.x;
                    newRect.y = shape.y;

                    var a  = bigAxis/2;
                    var b  = smallAxis/2/aspectY;
                    var y  = obj.bounds.y * 1/aspectY;
                    var y2 = y + obj.bounds.height * 1/aspectY;
                    var x1 = obj.bounds.x *1/aspectX + obj.bounds.width*1/aspectX;
                    var x2 = obj.bounds.x * 1/aspectX;
                    var yO = shape.y;
                    var xO = shape.x;

                        var trueRotate = obj.rotation%360;

                        // punkty przecięcia elipsy z górną prostą ( górnym bokiem boksa opisującego)
                        var positiveCrossPointTopX = Math.sqrt( Math.abs( (1-( (( y-yO )*( y-yO ))/(b*b) ))*a*a ) ) + xO;
                        var negativeCrossPointTopX = -Math.sqrt( Math.abs( (1-( (( y-yO )*( y-yO ))/(b*b) ))*a*a ) ) + xO;

                        // punkty przecięcia elipsy z prawym bokiem boksa opisującego element
                        var positiveCrossPointRightY = Math.sqrt( Math.abs( (1-((x1-xO)*(x1-xO))/(a*a))*b*b ) ) + yO;
                        var negativeCrossPointRightY = -Math.sqrt( Math.abs( (1-((x1-xO)*(x1-xO))/(a*a))*b*b ) ) + yO ;

                        // promien elipsy opisanego na nowym boksie opisujacym
                        var radius = Math.sqrt((negativeCrossPointRightY-shape.y)*(negativeCrossPointRightY-shape.y) + ( x1-shape.x )*( x1-shape.x ));

                        // punkty przecięcia elipsy opisanego z lewej strony
                        var positiveCrossPointLeftY = Math.sqrt( Math.abs( (1-((x2-xO)*(x2-xO))/(a*a))*b*b ) ) + yO;
                        var negativeCrossPointLeftY = -Math.sqrt( Math.abs( (1-((x2-xO)*(x2-xO))/(a*a))*b*b ) ) + yO;

                        // punkty przecięzia elipsy u dołu boksa opisujacego
                        var positiveCrossPointBottomX = Math.sqrt( Math.abs( (1-( (( y2-yO )*( y2-yO ))/(b*b) ))*a*a ) ) + xO;
                        var negativeCrossPointBottomX = -Math.sqrt( Math.abs( (1-( (( y2-yO )*( y2-yO ))/(b*b) ))*a*a ) ) + xO;

                        // punkty przecięcia nowego koła opisanego na nowym bboksie u góry
                        var positiveTopCircleCross = Math.sqrt( radius*radius - ((y-shape.y)*(y-shape.y)) ) + shape.x;
                        var negativeTopCircleCross = -Math.sqrt( radius*radius - ((y-shape.y)*(y-shape.y)) ) + shape.x;

                        var przeciecieKolaDol = -Math.sqrt( radius*radius - ((y2-shape.y)*(y2-shape.y)) ) + shape.x;

                        // wymiary i rotacja nowego obiektu
                        var newWidth  = Math.sqrt((y-positiveCrossPointLeftY)*(y-positiveCrossPointLeftY) + ( positiveTopCircleCross - x2 )*( positiveTopCircleCross -x2 )) ;
                        var newHeight = Math.sqrt( (x1-positiveTopCircleCross )*(x1-positiveTopCircleCross) + ( y-negativeCrossPointRightY )*( y-negativeCrossPointRightY ) );
                        var rotation  = Math.asin( Math.sin( ( (obj.bounds.height*1/aspectY) + (obj.bounds.y*1/aspectY) - negativeCrossPointRightY )/newWidth ) )*180/Math.PI;

                        // w zależności od rotacji przyjmujemy różne punkty przecięcia okręgu z boksem opisujacym
                        if( debug ){

                            var positiveCrossPointTop = new createjs.Shape();
                            positiveCrossPointTop.graphics.f("red").drawCircle( positiveCrossPointTopX, y, 4 );
                            stage.addChild( positiveCrossPointTop );
                            var positiveCrossPointTopText = new createjs.Text("positiveCrossPointTopText","10px Arial", "red");
                            positiveCrossPointTopText.x = positiveCrossPointTopX;
                            positiveCrossPointTopText.y = y;
                            stage.addChild( positiveCrossPointTopText );

                            var negativeCrossPointTop = new createjs.Shape();
                            negativeCrossPointTop.graphics.f("red").drawCircle( negativeCrossPointTopX, y, 4 );
                            stage.addChild( negativeCrossPointTop );
                            var negativeCrossPointTopText = new createjs.Text("negativeCrossPointTopText","10px Arial", "red");
                            negativeCrossPointTopText.x = negativeCrossPointTopX;
                            negativeCrossPointTopText.y = y;
                            stage.addChild( negativeCrossPointTopText );

                            var circleDescribingNewRect = new createjs.Shape();
                            circleDescribingNewRect.x = shape.x;
                            circleDescribingNewRect.y = shape.y;
                            circleDescribingNewRect.graphics.setStrokeStyle(1).beginStroke("#f00").drawCircle( 0, 0, radius );
                            //stage.addChild( circleDescribingNewRect );

                            var topCrossPointRight = new createjs.Shape();
                            topCrossPointRight.graphics.f("red").drawCircle( x1, positiveCrossPointRightY, 4 );
                            stage.addChild( topCrossPointRight );
                            var topCrossPointRightText = new createjs.Text("topCrossPointRightText","10px Arial", "red");
                            topCrossPointRightText.x = x1;
                            topCrossPointRightText.y = positiveCrossPointRightY;
                            stage.addChild( topCrossPointRightText );

                            var bottomCrossPointRight = new createjs.Shape();
                            bottomCrossPointRight.graphics.f("red").drawCircle( x1, negativeCrossPointRightY, 4 );
                            stage.addChild( bottomCrossPointRight );
                            var bottomCrossPointRightText = new createjs.Text("bottomCrossPointRight","10px Arial", "red");
                            bottomCrossPointRightText.x = x1;
                            bottomCrossPointRightText.y = negativeCrossPointRightY;
                            stage.addChild( bottomCrossPointRightText );

                            var thirdPoint = new createjs.Shape();
                            thirdPoint.graphics.f("blue").drawCircle( x2, positiveCrossPointLeftY, 4 );
                            stage.addChild( thirdPoint );
                            var thirdPointText = new createjs.Text("PositiveCrossPointLeftY","10px Arial", "blue");
                            thirdPointText.x = x2;
                            thirdPointText.y = positiveCrossPointLeftY;
                            stage.addChild( thirdPointText );

                            var thirdPoint2 = new createjs.Shape();
                            thirdPoint2.graphics.f("red").drawCircle( x2, negativeCrossPointRightY, 4 );
                            stage.addChild( thirdPoint2 );
                            var thirdPoint2Text = new createjs.Text("thirdPoint2Text","10px Arial", "red");
                            thirdPoint2Text.x = x2;
                            thirdPoint2Text.y = negativeCrossPointRightY;
                            stage.addChild( thirdPoint2Text );

                            var point4 = new createjs.Shape();
                            point4.graphics.f("red").drawCircle( positiveCrossPointBottomX, y2, 4 );
                            stage.addChild( point4 );
                            var point4Text = new createjs.Text("point4Text","10px Arial", "red");
                            point4Text.x = positiveCrossPointBottomX;
                            point4Text.y = y2;
                            stage.addChild( point4Text );

                            var point42 = new createjs.Shape();
                            point42.graphics.f("red").drawCircle( negativeCrossPointBottomX, y2, 4 );
                            stage.addChild( point42 );
                            var point42Text = new createjs.Text("point42Text","10px Arial", "red");
                            point42Text.x = negativeCrossPointBottomX;
                            point42Text.y = y2;
                            stage.addChild( point42Text );

                            //alert("nowa szerkoosc: " + newWidth + ", nowa wysoosc: " + newHeight + ", nowa rotacja: " + rotation );

                        }

                        //var obj = temp.objects[i];
                        var oldAngle = obj.rotation % 360;

                        var oldTriangleHelper = {

                            height : Math.abs(Math.sin( oldAngle * (Math.PI/180) ) * (obj.size.width/2)),
                            width  : Math.abs(Math.sin( ( 180 - 90 - oldAngle ) * ( Math.PI/180 ) ) * ( obj.size.width/2))

                        };

                        var c_0 = Math.sqrt( Math.pow( oldTriangleHelper.height, 2 ) + Math.pow( oldTriangleHelper.width, 2 ) );
                        var c = Math.sqrt( Math.pow( oldTriangleHelper.height, 2 ) + Math.pow( oldTriangleHelper.width/aspectX, 2 ) );

                        var newAngle = (( oldAngle >= 0 )? 1 : -1 ) *Math.asin( oldTriangleHelper.height/( c ) )* 180/Math.PI;

                        if( trueRotate < 0 ){
                            trueRotate += 360;
                        }

                        var newAspect, oldAspect;
                        newAspect = temp.width/temp.height;
                        oldAspect = canvas.width/canvas.height;

                        if( newAspect == oldAspect ){

                            var testHeight = obj.size.height;//Math.sqrt( Math.pow( Math.abs( pP.b.x - pP.a.x ), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = obj.size.width;//Math.sqrt( Math.pow( Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs( pP.a.y - pP.d.y ) ,2 ));

                            newAngle = obj.rotation;//Math.sin( (pP.d.x - (obj.bounds.x/aspectX))/testHeight )*180/Math.PI;

                        }
                        else if( trueRotate >= 0 && trueRotate < 45 ){

                            var pP = {

                                a : { x : (obj.bounds.x + obj.bounds.width)/aspectX, y : negativeCrossPointRightY},
                                b : { x : positiveCrossPointBottomX, y : y2 },
                                c : { x : x2, y : positiveCrossPointLeftY },
                                d : { x : negativeCrossPointTopX, y : y }

                            };

                            var testHeight = Math.sqrt( Math.pow( Math.abs( pP.b.x - pP.a.x ), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt( Math.pow( Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = Math.sin( (pP.d.x - (obj.bounds.x/aspectX))/testHeight )*180/Math.PI;

                        }
                        else if( trueRotate >= 45 && trueRotate < 90 ){

                            var pP = {

                                a : { x : x1, y : positiveCrossPointRightY},
                                b : { x : negativeCrossPointBottomX, y : y2 },
                                c : { x : x2, y : negativeCrossPointRightY },
                                d : { x : positiveCrossPointTopX, y : y }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y),2 ));

                            newAngle = 90 - Math.asin( ( x1 - pP.d.x )/testWidth )*180/Math.PI ;

                        }
                        else if( trueRotate >= 90 && trueRotate < 135 ){

                            var pP = {

                                a : { x : x1, y : positiveCrossPointRightY},
                                b : { x : negativeCrossPointBottomX, y : y2 },
                                c : { x : x2, y : negativeCrossPointRightY },
                                d : { x : positiveCrossPointTopX, y : y }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2));

                            newAngle = 90 + Math.asin( ( x1 - pP.d.x )/testWidth )*180/Math.PI;

                        }
                        else if( trueRotate >= 135 && trueRotate < 180 ){

                            var pP = {

                                a : { x : negativeCrossPointBottomX, y : y2 },
                                b : { x : x2, y : negativeCrossPointRightY },
                                c : { x : positiveCrossPointTopX, y : y },
                                d : { x : x1, y : positiveCrossPointRightY }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = 90 + Math.asin( ( x1 - pP.a.x )/testWidth )*180/Math.PI;

                        }
                        else if( trueRotate >= 180 && trueRotate < 225 ){

                            var pP = {

                                a : { x : x2, y : positiveCrossPointLeftY },
                                b : { x : negativeCrossPointTopX, y : y },
                                c : { x : x1, y : negativeCrossPointRightY },
                                d : { x : positiveCrossPointBottomX, y : y2 }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = Math.asin( ( pP.b.x - x2 )/testHeight )*180/Math.PI + 180;

                        }
                        else if( trueRotate >= 225 && trueRotate < 270 ){

                            var pP = {

                                a : { x : x2, y : negativeCrossPointLeftY },
                                b : { x : positiveCrossPointTopX, y : y },
                                c : { x : x1, y : positiveCrossPointRightY },
                                d : { x : negativeCrossPointBottomX, y : y2 }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y) ,2 ));

                            newAngle = Math.asin( ( pP.b.x - x2 )/testHeight )*180/Math.PI + 180;

                        }
                        else if( trueRotate >= 270 && trueRotate < 315  ){

                            var pP = {

                                a : { x : negativeCrossPointTopX, y : y},
                                b : { x : (obj.bounds.x + obj.bounds.width)/aspectX, y : negativeCrossPointRightY },
                                c : { x : positiveCrossPointBottomX, y : (obj.bounds.y + obj.bounds.height )/aspectY },
                                d : { x : (obj.bounds.x)/aspectX, y : positiveCrossPointLeftY }

                            };

                            var testHeight = Math.sqrt(Math.pow( Math.abs(pP.b.x - pP.a.x), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2));
                            var testWidth  = Math.sqrt(Math.pow(Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs(pP.a.y - pP.d.y),2 ));

                            newAngle = Math.asin( ( pP.a.x - x2 )/testWidth )*180/Math.PI + 270;

                        }
                        else if( trueRotate >= 315 && trueRotate < 360 ){

                            var pP = {

                                a : { x : positiveCrossPointTopX, y : y},
                                b : { x : (obj.bounds.x + obj.bounds.width)/aspectX, y : positiveCrossPointRightY },
                                c : { x : negativeCrossPointBottomX, y : (obj.bounds.y + obj.bounds.height )/aspectY },
                                d : { x : (obj.bounds.x)/aspectX, y : negativeCrossPointLeftY }

                            };

                            var testHeight = Math.sqrt( Math.pow( Math.abs( pP.b.x - pP.a.x ), 2) + Math.pow( Math.abs( pP.b.y - pP.a.y ) ,2 ));
                            var testWidth  = Math.sqrt( Math.pow( Math.abs( pP.a.x - pP.d.x ), 2) + Math.pow( Math.abs( pP.a.y - pP.d.y ) ,2 ));

                            newAngle = Math.asin( ( pP.a.x - x2 )/testWidth )*180/Math.PI + 270;

                        }

                        var objectToGenerate = {

                            type: obj.type,
                            size: {
                                height: testHeight,
                                width : testWidth
                            },
                            transformation: {
                                x : obj.pos.x/aspectX,
                                y : obj.pos.yaspectY,
                                rotation : newAngle
                            },
                            pos: {
                                x : obj.pos.x/aspectX,
                                y : obj.pos.y/aspectY,
                            },
                            rotation : newAngle

                        }

                        temp.generatedObjects.push( objectToGenerate );

                        //console.log( objectToGenerate );
                        //console.log('========================');

                        if( obj.type == "Text" )
                            var text = new createjs.Text("Text", "20px Arial", "#5c5c5c");
                        else if( obj.type == "ProposedPosition" || obj.type == "Image" )
                            var text = new createjs.Text("Zdjęcie", "20px Arial", "#5c5c5c");

                        var bounds = text.getBounds();
                        text.textBaseline = "middle";
                        text.regX = bounds.width/2;

                        text.x = obj.pos.x*1/aspectX;
                        text.y = obj.pos.y*1/aspectY;
                        text.rotation = obj.rotation;

                        shape.graphics.c().f("#fff").setStrokeStyle(1).beginStroke("#fff").drawRect( 0, 0, testWidth, testHeight );
                        shape.x =  obj.pos.x*1/aspectX;
                        shape.y =  obj.pos.y*1/aspectY;
                        shape.regX = (testWidth)/2;
                        shape.regY = (testHeight)/2;
                        shape.rotation = text.rotation = newAngle;

                        stage.addChild( shape );
                        stage.addChild( text );

                    }

                stage.update();

                var exampleImage = stage.toDataURL("#fff", "image/png");

                stage.autoClear = true; // This must be true to clear the stage.
                stage.removeAllChildren();
                stage.update();





            document.body.removeChild( document.getElementById("templateImage_"+thisCanvasId) );

            var image = null;

            var innerHTML = "<img src='" + exampleImage + "' data-id='"+template.id+"'/>";
            var innerHTMLorginal = "<img src='" + template.url + "' data-id='"+template.id+"'/>";

            var obj = {};
            obj.img = innerHTML;
            obj.orginalImg = innerHTMLorginal;
            obj.id = template.id;
            obj.objects = temp.generatedObjects;
            obj.editableArea = area;

            if ( !window.proposedTemplate_tmp ){

                window.proposedTemplate_tmp = {};

            }

            window.proposedTemplate_tmp[template.id] = temp.generatedObjects;

            return obj;

        };


        var generateTemplateImage = function( width, height, templateData ){

            var canvas = document.createElement("canvas");
            canvas.id = 'templateImage';
            canvas.width = width;
            canvas.height = height;

            // chwilowe style

            canvas.style.position = "relative";
            canvas.style.zIndex = 1000000;
            canvas.style.border = "4px solid";

            // -- koniec
            document.body.appendChild( canvas );

            var stage = new createjs.Stage( "templateImage" );

            var background = new createjs.Shape();
            background.graphics.beginFill("#00a99d").drawRect(0, 0, canvas.width, canvas.height );
            stage.addChild( background );

            for( var i=0; i < templateData.length; i++ ){

                var shape = new createjs.Shape();
                shape.graphics.f("#fff").setStrokeStyle(1).beginStroke("#fff").drawRect( 0, 0, templateData[i].size.width, templateData[i].size.height );
                shape.x =  templateData[i].pos.x;
                shape.y =  templateData[i].pos.y;
                shape.regX = templateData[i].size.width/2;
                shape.regY = templateData[i].size.height/2;
                shape.rotation = templateData[i].rotation;
                stage.addChild( shape );

                if( templateData[i].type == "Text2" )
                    var text = new createjs.Text("Text", "20px Arial", "#5c5c5c");
                else if( templateData[i].type == "ProposedPosition" )
                    var text = new createjs.Text("Zdjęcie", "20px Arial", "#5c5c5c");

                var bounds = text.getBounds();
                text.textBaseline = "middle";
                text.regX = bounds.width/2;
                text.x = templateData[i].pos.x;
                text.y = templateData[i].pos.y;
                text.rotation = templateData[i].rotation;

                stage.addChild( text );

            }

            stage.update();

            var exampleImage = stage.toDataURL("#fff", "image/png");

            stage.autoClear = true; // This must be true to clear the stage.
            stage.removeAllChildren();
            stage.update();

            document.body.removeChild( document.getElementById("templateImage") );

            return exampleImage;

        };


        var loadTo = function( id, to ){

            var template = templates[ id ];
            removeAllObjects();

        };


        var getTemplateCategories = function(){
            // MOCK
            return window.templateCategories;

        };


        var addTemplateCategory = function( categoryName ){
            // Mock
            window.templateCategories.push( categoryName );

            return true;

        };

        var generateTemplateCategorySelect = function( id ){

            var categories = getTemplateCategories();

            var html = '<select ' + ( ( id )? ('name="'+id+'" id="'+ id +'">') : ( 'name="template-category-select" id="template-category-select">') );

            for( var i=0; i< categories.length; i++ ){

                html += '<option value="'+categories[i]+'">'+categories[i]+'</option>';

            }

            html += "</select>";

            return html;

        };


        var generateTemplateCategorySelectFilter = function(){

            // kontener na całość
            var divElem = document.createElement('div');
            divElem.innerHTML = "Kategoria szablonu: ";

            // tworze selecta filtrujacego categorie
            var select = document.createElement("select");

            // pobieram wszystkie kategotie
            var categories = getTemplateCategories();

            // dodanie domyślnej wartości selekta
            var option = document.createElement("option");
            option.value = "all";
            option.innerHTML = "Wszystkie";
            select.appendChild( option );

            // dodawanie pcji do selekta
            for( var i=0; i< categories.length; i++ ){

                // utworzenie nowej opcji dla selekta
                var option = document.createElement("option");
                option.value = categories[i];
                option.innerHTML = categories[i];

                // dodanie opcji do selecta
                select.appendChild( option );

            }

            select.addEventListener('change', function(){

                var area = Editor.tools.getEditObject();
                area = Editor.stage.getObjectById( area );

                // szablony odpowiadające wybranej kategori
                if( select.value == 'all' ){
                    var templates = getTemplatesMock();
                }
                else {
                    var templates = getTemplatesWithCategory( select.value );
                }

                $("#templates-container *").remove();
                $("#templates-container").append( reloadTemplatesList( area, templates ) );

            });

            divElem.appendChild( select );

            // zwracany jest gotowy element html
            return divElem;

        };


        var getTemplatesWithCategory = function( category ){

            // MOCK
            var templates = {};

            for( var key in window.templates ){

                if( window.templates[key].categories.indexOf( category ) >= 0 ){
                    templates[key] = window.templates[key] ;
                }

            }

            return templates;

        };


        var initList = function( area ){

            $("#templates-list").html('');
            var elem = document.createElement('div');
            elem.id = 'templates-list-container';
            elem.appendChild( generateTemplateCategorySelectFilter() );

            $("#templates-list").append( elem );
            $("#templates-list").append("<div id='templates-container'></div>");
            $("#templates-container").append( displayTemplatesList( area ) );

        };


        return {

            loadTo : loadTo,
            save : save,
            displayTemplatesList : displayTemplatesList,
            generateTemplateForThisArea : generateTemplateForThisArea,
            getTemplate : getTemplate,
            generateTemplateImage : generateTemplateImage,
            getTemplateCategories : getTemplateCategories,
            addTemplateCategory : addTemplateCategory,
            generateTemplateCategorySelect : generateTemplateCategorySelect,
            getTemplatesWithCategory : getTemplatesWithCategory,
            initList : initList


        };
    }

export {proposedTemplate};
