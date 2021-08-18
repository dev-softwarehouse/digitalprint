var generateFlatSwitch = function( selected ){

    var flatSwitch = document.createElement('div');

    flatSwitch.className = "block-switch";
    flatSwitch.innerHTML = '<input id="custom-toggle-flat-border" class="custom-toggle custom-toggle-flat" type="checkbox" '+ ( ( selected) ? 'checked="checked"' : '' ) +' >'+
                            '<label for="custom-toggle-flat-border"></label>';

    return flatSwitch;
}

/**
* Klasa odpowiadająca za boks z narzędziami do tekstu proponowanego
*
* @class TextTool
* @constructor
*/
export function TextTool( textInstance, tools, defaultValues ){

    this.textInstance = textInstance;
    this.toolsContainer = null;
    this.toolBoxExtend = null;
    this.boxes = {};
    this.align = "left";

    this.openSection = null;

    this.fontType = {
        regular : 1,
        italic  : 0
    };

    if( userType == 'admin' ){

        this.simpleType = 1;
        this.initSimpleTools( tools );

    }else {

        this.simpleType = 1;
        this.initSimpleTools( tools );

    }

};


var p = TextTool.prototype = new createjs.EventDispatcher();

p.constructor = TextTool;


/**
* Zwraca aktualną wartość wielkości lini
*
* @method getSizeValue
*/
p.getSizeValue = function(){

    return this.boxes.size_default.value;

};


/**
* Update'uje color input
*
* @method updateColor
* @param {String} color
*/
p.updateColor = function( color ){

    $("#colorPicker").css( "background-color", color );
    this.textInstance._currentFontColor = color;

};


p.updateByLetter = function( letter ){

    var color = letter.color;
    if( color == '#000' ){
        color = '#001';
    }

    this.textInstance._currentFontColor = color;
    $('img[alt=Kolor]').css('background-color', color);
    $("#current-font").css({ "fontFamily" : letter.fontFamily + "_Regular" });
    $('#font-size').val( parseInt(letter.size/0.37) );
    $(".font-option").removeClass("active");
    $("#"+letter.fontFamily+".font-option").addClass("active");
    $('#lineHeight').val( parseInt(letter.lineHeight/0.37) );


};

/**
* Update'uje size input
*
* @method updateSize
* @param {Int} size rozmiar czcionki
*/
p.updateSize = function( size ){

    $( this.boxes.size_default ).val( size );
    this.textInstance._currentFontSize = size;

};


/**
* Brak info
*
* @method updateFontType
*/
p.updateFontType = function( regular, italic ){

    this.fontType.regular = regular;
    this.fontType.italic  = italic;

    this.textInstance._currentFontType.regular = regular;
    this.textInstance._currentFontType.italic  = italic;

};


/**
* Update'uje font select
*
* @method updateFont
* @param {String} font font Family
*/
p.updateFont = function( font ){

    $( "#current-font" ).css({
        "fontFamily" : font + "_regular"
    });

    this.textInstance._currentFont = font;
    this.textInstance.defaultSettings.family = font;

};


/**
* Update'uje size input
*
* @method updatelineHeight
* @param {INT} size wyokość lini tekstu
*/
p.updateLineHeight = function( size ){

    $( this.boxes.lineHeight_default ).val( size );

};


/**
* Update'uje size input
*
* @method updateSize
*/
p.updateAlign = function( align ){

    this.align = align;

};


/**
* Ustawia pogrubienie czcionki
*
* @method setBold
*/
/*
p.setBold = function(){

    this.fontType.regular = 0;
    this.textInstance._currentFontType.regular = 0;

    this.textInstance.updateSelected_Bold( true );

};*/

p.setBold = function(){

    this.fontType.regular = 0;
    this.textInstance._currentFontType.regular = 0;
    this.textInstance.updateSelectedFont();
    this.textInstance.updateText( {}, true );

}

/**
* Usuwa pogrubienie czcionki
*
* @method unsetBold
*/
p.unsetBold = function(){

    this.fontType.regular = 1;
    this.textInstance._currentFontType.regular = 1;
    this.textInstance.updateText( {}, true );

};


/**
* Ustawienie pochyłej czcionki
*
* @method setItalic
*/
p.setItalic = function(){

    this.fontType.italic = 1;
    this.textInstance._currentFontType.italic = 1;
    this.textInstance.updateText( {}, true );

};


/**
* Usuniecie pochyłej czcionki
*
* @method unsetItalic
*/
p.unsetItalic = function(){

    this.fontType.italic = 0;
    this.textInstance._currentFontType.italic = 0;
    this.textInstance.updateText( {}, true );

};


/**
* Update'uje box, aktualizując przyciski ( dodaje klasy do zaznaczonych zmieniając ichg wygląd )
*
* @method _updateToolBox
*/
p._updateToolBox = function(){

    if( this.textInstance._useDefaultValues ){
        //this.proposedText.useDefaultValues();
        //this.textInstance.updateTextWithDefaultValues();
    }

    for( var key in this.boxes ){

        $(this.boxes[key]).removeClass('active-tool');

    }

    var text = this.textInstance;
    var defaults = this.textInstance.defaultSettings;
    var boxes = this.boxes;



    // align buttons
    // admin
    if( this.align == "left" ){

        $( boxes.alignLeft_default ).addClass('active-tool');

    }
    else if( this.align == "center" ){

        $( boxes.alignCenter_default ).addClass('active-tool');

    }
    else if( this.align == "right" ){

        $( boxes.alignRight_default ).addClass('active-tool');

    }
    else if( this.align == "justify" ){

        $( boxes.justify ).addClass('active-tool');

    }

    this.checkBoldAndItalicButtons();

    if( !this.fontType.regular ){

        $(this.boxes.bold).addClass('current');

    }else {

        $(this.boxes.bold).removeClass( 'current' );

    }

    if( this.fontType.italic ){


        $( this.boxes.italic ).addClass('current');

    }else {

        $( this.boxes.italic ).removeClass('current');

    }

};


/**
* Aktualizuje pozycję elementu z narzędziami
*
* @method _updateToolsBoxPosition
*/
p._updateToolsBoxPosition = function(){

    var tools = this.toolsContainer;
    var Editor = this.textInstance.editor;

    if( this.useType =="admin" )
        var adminTools = $('#proposed-position-tool-admin');

    var toolSize = {

        width  : $(tools).innerWidth(),
        height : $(tools).innerHeight()

    };


    var pos = this.textInstance.getGlobalPosition();
    var stage = Editor.getStage();
    var bounds = this.textInstance.getTransformedBounds();

    if( this.simpleType ){

        var toolRealBoundsWidth = (bounds.width)*stage.scaleX;
        var diffrenceWidth = toolSize.width - toolRealBoundsWidth;

        $(tools).css({ top: pos[1] + 100 + (bounds.height/2)*stage.scaleY , left: pos[0] - (diffrenceWidth/2) - toolRealBoundsWidth/2 });

    }else {

        $(tools).css({ top: pos[1] + 100 + (bounds.height/2)*stage.scaleY , left: pos[0] - (bounds.width/2)*stage.scaleX });

    }

};



p.changeInText = function(){

};

p.changeDefaults = function(){

};



/**
* Inicjalizuje narzędzie wyboru koloru textu
*
* @method textColorPickerInput
*/
p.textColorPickerInput = function(){

    var textColor = document.createElement('input');
    textColor.id = 'textColor';
    textColor.className = 'spinner cp-full';
    textColor.value = this.textInstance._currentFontColor;

    return textColor;

};


p.backgroundColorPicker = function(){

    var backgroundColor = document.createElement('input');
    backgroundColor.id = 'backgroundColor';
    backgroundColor.className = 'spinner cp-full ';
    backgroundColor.value = this.textInstance.backgroundColor;

    return backgroundColor;

};

p.alphaBackgroundSlider = function(){

    var _this = this;
    var slider = document.createElement('div');
    slider.id = 'backgroundAlphaSlider';

    $(slider).slider({

            value: this.textInstance.getBackgroundAlpha(),
            min: 0,
            max: 1,
            step: 0.05,
            slide: function( event ){

                var value = $( "#backgroundAlphaSlider" ).slider( "value" );
                this.setBackgroundAlpha( value );


            }.bind( this.textInstance ),

            change: function( event ){

                var value = $( "#backgroundAlphaSlider" ).slider( "value" );
                this.setBackgroundAlpha( value );


            }.bind(this.textInstance),

            stop: function( event ){

                var value = $( "#backgroundAlphaSlider" ).slider( "value" );
                this.setBackgroundAlpha( value );

                if( this.isProposedPosition ){

                      _this.textInstance.editor.webSocketControllers.proposedText.setAttributes( this.dbID, { backgroundOpacity: value } );

                }else {

                      _this.textInstance.editor.webSocketControllers.editorText.setAlphaBackground( this.usedTextID, value );

                }

            }.bind( this.textInstance )

        });

    return slider;

};


p.verticalPadding = function(){

    var _this = this;

    var spinner = document.createElement('input');
    spinner.id = 'verticalPadding';
    spinner.className = "spinner";

    spinner.addEventListener('mouseover', function( e ){

        e.stopPropagation();
        _this.textInstance.drawHorizontal();

    });

    spinner.addEventListener('mouseout', function( e ){

        e.stopPropagation();
        _this.textInstance.clearHorizontal();

    });

    return spinner;

};

p.setActiveMenu = function( menuName ){



};

p.initVerticalPaddingAction = function( spinner ){

    var _this = this;

    spinner.spinner({
        min: 0,
        spin: function( event ){

            var value = $( this ).spinner( 'value' );
            _this.textInstance.setVerticalPadding( value );
            _this.textInstance.drawPadding();


            if( userType == 'user' ){

                var letters = 0;

                for( var i=0; i < _this.textInstance.lines.length; i++ ){

                    letters += _this.textInstance.lines[i].letters;

                }

                if( letters ){

                    _this.textInstance.setCursor( 1 );

                }

            }

            _this.textInstance.updateText({

                lettersPositions : true,
                linesPosition : true,
                maximizeFontSize : true

            });

            _this.textInstance.setCursor( _this.textInstance._cursorPosition );
            //

        },
        stop : function(){

            var value = $( this ).spinner( 'value' );

            _this.textInstance.setVerticalPadding( value );
            _this.textInstance.drawPadding();

            _this.textInstance.updateText({

                lettersPositions : true,
                linesPosition : true,
                maximizeFontSize : true

            });

            _this.textInstance.clearPadding();
            Editor.webSocketControllers.editorText.setVerticalPadding( _this.textInstance.usedTextID, value );
            _this.textInstance.updateContentInDB();

        }

    }).val( _this.textInstance.padding.left );

};

p.initHorizontalPaddingAction = function( spinner ){

    var _this = this;
    // dodanie listnera na hover
    spinner.spinner({

        min: 0,
        spin: function( event ){

            var value = $( this ).spinner( 'value' );
            _this.textInstance.setHorizontalPadding( value );

            _this.textInstance.drawPadding();

            if( userType == 'user' ){

                var letters = 0;

                for( var i=0; i < _this.textInstance.lines.length; i++ ){

                    letters += _this.textInstance.lines[i].letters;

                }

                if( letters ){

                    _this.textInstance.setCursor( 1 );

                }

            }

            _this.textInstance.updateText({

                lettersPositions : true,
                linesPosition : true,
                maximizeFontSize : true

            });

            _this.textInstance.setCursor( _this.textInstance._cursorPosition );
            //Editor.webSocketControllers.editorText.setHorizontalPadding(  _this.textInstance.usedTextID, value );

        },
        stop : function(){

            var value = $( this ).spinner( 'value' );

            _this.textInstance.setHorizontalPadding( value );
            _this.textInstance.drawPadding();

            _this.textInstance.updateText({

                lettersPositions : true,
                linesPosition : true,
                maximizeFontSize : true

            });

            _this.textInstance.clearPadding();
            Editor.webSocketControllers.editorText.setHorizontalPadding(  _this.textInstance.usedTextID, value );
            _this.textInstance.updateContentInDB();

        }

    }).val( _this.textInstance.padding.top );


};


p.horizontalPadding = function(){

    var _this = this;

    var spinner = document.createElement('input');
    spinner.id = 'horizontalPadding';
    spinner.className = "spinner";

    spinner.addEventListener('mouseover', function( e ){

        e.stopPropagation();
        _this.textInstance.drawVertical();

    });

    spinner.addEventListener('mouseout', function( e ){

        e.stopPropagation();
        _this.textInstance.clearVertical();

    });

    return spinner;

};

p.initAlignToolBox = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title big';
    title.innerHTML = 'Ustawienia tekstu:';

    var singleElem = document.createElement('div');
    singleElem.className = 'button singleElem active';

    var singleElemImage = new Image();
    singleElemImage.src = 'images/1zdjecie-on.svg';

    singleElem.appendChild( singleElemImage );

    var allElemInPage = document.createElement('div');
    allElemInPage.className = 'button allElemInPage';

    var allElemInPageImage = new Image();
    allElemInPageImage.src = "images/1strona-on.svg";

    allElemInPage.appendChild( allElemInPageImage );

    var allElemInProject = document.createElement('div');
    allElemInProject.className = 'button allElemInProject';

    var allElemInProjectImage = new Image();
    allElemInProjectImage.src = 'images/strony-on.svg';

    allElemInProject.appendChild( allElemInProjectImage );

    var info = document.createElement('div');
    info.className = 'buttonsSettingsInfo';
    info.innerHTML = 'Dla aktualnego zdjęcia';

    var alignLeft = document.createElement('div');
    alignLeft.className = 'buttonBig alignLeft';

    var alignCenter = document.createElement('div');
    alignCenter.className = 'buttonBig alignCenter';

    var alignRight = document.createElement('div');
    alignRight.className = 'buttonBig alignRight';

    var alignJustify = document.createElement('div');
    alignJustify.className = 'buttonBig alignJustify';

    globalSettings.appendChild( title );
    globalSettings.appendChild( alignLeft );
    globalSettings.appendChild( alignCenter );
    globalSettings.appendChild( alignRight );
    globalSettings.appendChild( alignJustify );

    elem.appendChild( globalSettings );

    this.currentExtendedTool = elem;
    this.openSection = 'alignTools';

    alignLeft.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignLeft';
        _this.textInstance.setAlign('left');
        _this.align = "left";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    alignRight.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignRight';
        _this.textInstance.setAlign('right');
        _this.align = "right";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    alignCenter.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignCenter';
        _this.textInstance.setAlign('center');
        _this.align = "center";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });


    alignJustify.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignJustify';
        _this.textInstance.setAlign('justify');
        _this.align = "justify";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });


    var globalSettingsHor = document.createElement('div');
    globalSettingsHor.className = 'hor-settings';

    var alignLeftHor = document.createElement('div');
    alignLeftHor.className = 'buttonBig alignTop';

    var alignCenterHor = document.createElement('div');
    alignCenterHor.className = 'buttonBig alignMiddle';

    var alignRightHor = document.createElement('div');
    alignRightHor.className = 'buttonBig alignBottom';

    var alignJustifyHor = document.createElement('div');
    alignJustifyHor.className = 'buttonBig alignJustifyHor';

    globalSettingsHor.appendChild( alignLeftHor );
    globalSettingsHor.appendChild( alignCenterHor );
    globalSettingsHor.appendChild( alignRightHor );
    globalSettingsHor.appendChild( alignJustifyHor );

    globalSettings.appendChild( globalSettingsHor );
    alignLeftHor.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignLeft';
        _this.textInstance.setVerticalAlign('top');
        _this.verticalAlign = "top";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    alignRightHor.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignRight';
        _this.textInstance.setVerticalAlign('bottom');
        _this.align = "right";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    alignCenterHor.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignCenter';
        _this.textInstance.setVerticalAlign('center');
        _this.align = "center";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });


    alignJustifyHor.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignJustify';
        _this.textInstance.setVerticalAlign('justify');
        _this.align = "justify";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    return elem;

};


p.initHorizontalAlignToolBox = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title big';
    title.innerHTML = 'Ustawienia tekstu:';

    var singleElem = document.createElement('div');
    singleElem.className = 'button singleElem active';

    var singleElemImage = new Image();
    singleElemImage.src = 'images/1zdjecie-on.svg';

    singleElem.appendChild( singleElemImage );

    var allElemInPage = document.createElement('div');
    allElemInPage.className = 'button allElemInPage';

    var allElemInPageImage = new Image();
    allElemInPageImage.src = "images/1strona-on.svg";

    allElemInPage.appendChild( allElemInPageImage );

    var allElemInProject = document.createElement('div');
    allElemInProject.className = 'button allElemInProject';

    var allElemInProjectImage = new Image();
    allElemInProjectImage.src = 'images/strony-on.svg';

    allElemInProject.appendChild( allElemInProjectImage );

    var info = document.createElement('div');
    info.className = 'buttonsSettingsInfo';
    info.innerHTML = 'Dla aktualnego zdjęcia';

    var alignLeft = document.createElement('div');
    alignLeft.className = 'buttonBig alignLeft';

    var alignCenter = document.createElement('div');
    alignCenter.className = 'buttonBig alignCenter';

    var alignRight = document.createElement('div');
    alignRight.className = 'buttonBig alignRight';

    var alignJustify = document.createElement('div');
    alignJustify.className = 'buttonBig alignJustify';

    globalSettings.appendChild( title );
    globalSettings.appendChild( alignLeft );
    globalSettings.appendChild( alignCenter );
    globalSettings.appendChild( alignRight );
    globalSettings.appendChild( alignJustify );

    elem.appendChild( globalSettings );

    this.currentExtendedTool = elem;
    this.openSection = 'alignTools';

    alignLeft.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignLeft';
        _this.textInstance.setVerticalAlign('top');
        _this.verticalAlign = "top";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    alignRight.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignRight';
        _this.textInstance.setVerticalAlign('bottom');
        _this.align = "right";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    alignCenter.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignCenter';
        _this.textInstance.setVerticalAlign('center');
        _this.align = "center";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });


    alignJustify.addEventListener('click', function( e ){

        e.stopPropagation();

        document.getElementById('alignToolsContainer').className = 'buttonBig toolbox alignJustify';
        _this.textInstance.setVerticalAlign('justify');
        _this.align = "justify";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        //this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    return elem;

};


p.createHorizontalAlignButton = function(){

    var _this = this;
    var object = this.textInstance;

    var elem = document.createElement('div');

    var align = object.verticalAlign;

    if( align == 'left' || !align){
        elem.className = 'buttonBig toolbox alignTop';
    }else if( align == 'right' ){
        elem.className = 'buttonBig toolbox alignBottom';
    }else if( align == 'center' ){
        elem.className = 'buttonBig toolbox alignMiddle';
    }else if( align == 'justify'){
        elem.className = 'buttonBig toolbox alignJustifyH';
    }

    elem.id = 'horizontalAlignToolsContainer';

    var currentIcon = document.createElement('div');
    currentIcon.className = 'currentIcon';

    var optionsBox = document.createElement('div');
    optionsBox.className = 'optionsBox';

    elem.appendChild( currentIcon );

    elem.addEventListener('click', function( e ){

        e.stopPropagation();


        if( _this.openSection == 'alignHorizontalTools' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != 'alignHorizontalTools' ){

                _this.toolsContainer.appendChild( _this.initHorizontalAlignToolBox() );
                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;

            }

        }else {

            _this.toolsContainer.appendChild( _this.initHorizontalAlignToolBox() );
            _this._updateToolsBoxPosition();

        }

    });

    return elem;

}


p.createAlignButton = function(){

    var _this = this;
    var object = this.textInstance;

    var elem = document.createElement('div');

    var align = object._align;

    if( align == 'left' || !align){
        elem.className = 'buttonBig toolbox alignLeft';
    }else if( align == 'right' ){
        elem.className = 'buttonBig toolbox alignRight';
    }else if( align == 'center' ){
        elem.className = 'buttonBig toolbox alignCenter';
    }else if( align == 'justify'){
        elem.className = 'buttonBig toolbox alignJustify';
    }

    elem.id = 'alignToolsContainer';

    var currentIcon = document.createElement('div');
    currentIcon.className = 'currentIcon';

    var optionsBox = document.createElement('div');
    optionsBox.className = 'optionsBox';

    elem.appendChild( currentIcon );

    elem.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.openSection == 'alignTools' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != 'alignTools' ){

                _this.toolsContainer.appendChild( _this.initAlignToolBox() );
                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;

            }

        }else {

            _this.toolsContainer.appendChild( _this.initAlignToolBox() );
            _this._updateToolsBoxPosition();

        }

    });

    return elem;

    //elem.appendChild( optionsBox );


    if( this.align ){

        if( this.align == 'left' ){

            currentIcon.style.background = 'url(/images/text_left.png) no-repeat center';

        }else if( this.align == 'right' ){

            currentIcon.style.background = 'url(/images/text_right.png) no-repeat center';

        }else if( this.align == 'center' ){

            currentIcon.style.background = 'url(/images/text_center.png) no-repeat center';

        }

    }else {

        currentIcon.style.background = 'url(/images/text_left.png) no-repeat center';

    }

    optionsBox.appendChild( this.createLeftAlignTool_default() );
    optionsBox.appendChild( this.createCenterAlignTool_default() );
    optionsBox.appendChild( this.createRightAlignTool_default() );
    optionsBox.appendChild( this.createJustifyTool() );

    return elem;

};


p.initBackgroundToolBox = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title big';
    title.innerHTML = 'Włącz tło: ';

    var onOffLabel = document.createElement('label');
    var onOff = document.createElement('input');
    onOff.type = 'checkbox';
    onOff.className = 'switch';
    onOff.checked = this.textInstance.showBackground;

    var onOffdispl = document.createElement('div');
    onOffdispl.className = 'bigMarginSwitch';

    onOffLabel.appendChild( title );
    onOffLabel.appendChild( onOff );
    onOffLabel.appendChild( onOffdispl );

    globalSettings.appendChild( onOffLabel );
    globalSettings.appendChild( this.alphaBackgroundSlider() );
    globalSettings.appendChild( this.backgroundColorPicker() );

    elem.appendChild( globalSettings );

    this.currentExtendedTool = elem;
    this.openSection = 'backgroundTool';

    onOff.addEventListener('click', function( e ){

        if( _this.textInstance.isProposedPosition ){

              _this.textInstance.editor.webSocketControllers.proposedText.setAttributes( _this.textInstance.dbID, { showBackground: e.target.checked  } );

        }else {

            //console.log('trza bedzie dodac opcje');
            //Editor.webSocketControllers.editorText.setShadow( _this.textInstance.usedTextID, true );

        }

        if( e.target.checked ){

            _this.textInstance.displayBackground();

        }else {

            _this.textInstance.hideBackground();

        }

    });

    return elem;

};


p.backgroundTools = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'button';
    elem.id = 'backgroundToolsContainer';

    var currentIcon = document.createElement('div');
    currentIcon.className = 'currentIcon';

    var optionsBox = document.createElement('div');
    optionsBox.className = 'optionsBox';

    elem.appendChild( currentIcon );
    elem.appendChild( optionsBox );

    elem.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.openSection == 'backgroundTool' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != 'backgroundTool' ){

                _this.toolsContainer.appendChild( _this.initBackgroundToolBox() );

                $("#backgroundColor").colorpicker({

                    parts: 'full',
                    showOn: 'both',
                    buttonColorize: true,
                    showNoneButton: true,
                    alpha: true,
                    select : function( e ){

                        e.stopPropagation();

                        var backgroundColor = e.target.value;
                        var alpha = backgroundColor.split('(')[1].split(')')[0].split(',');

                        backgroundColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

                        var alpha = backgroundColor.split('(')[1].split(')')[0].split(',');

                        _this.textInstance.setBackgroundColor( Editor.rgb2hex( backgroundColor ) );

                        if( _this.textInstance.isProposedPosition ){

                            Editor.webSocketControllers.proposedText.setAttributes( _this.textInstance.dbID, { backgroundColor: backgroundColor } );

                        }else {

                            Editor.webSocketControllers.proposedText.setBackgroundColor( _this.textInstance.usedTextID, backgroundColor );

                        }

                    },
                    colorFormat: 'RGBA'

                });

                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;

            }

        }else {

            _this.toolsContainer.appendChild( _this.initBackgroundToolBox() );

                $("#backgroundColor").colorpicker({

                    parts: 'full',
                    showOn: 'both',
                    buttonColorize: true,
                    showNoneButton: true,
                    alpha: true,
                    select : function( e ){

                        e.stopPropagation();

                        var backgroundColor = e.target.value;
                        var alpha = backgroundColor.split('(')[1].split(')')[0].split(',');

                        backgroundColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

                        var alpha = backgroundColor.split('(')[1].split(')')[0].split(',');

                        _this.textInstance.setBackgroundColor(   _this.textInstance.editor.rgb2hex( backgroundColor ) );

                        if( _this.textInstance.isProposedPosition ){

                              _this.textInstance.editor.webSocketControllers.proposedText.setAttributes( _this.textInstance.dbID, { backgroundColor: backgroundColor } );

                        }else {

                              _this.textInstance.editor.webSocketControllers.proposedText.setBackgroundColor( _this.textInstance.usedTextID, backgroundColor );

                        }

                    },
                    colorFormat: 'RGBA'

                });

            _this._updateToolsBoxPosition();

        }

    });

    return elem;

};

p.initPaddingToolBox = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'toolBoxExtend';

    var globalSettings = document.createElement('div');
    globalSettings.className = 'toolBoxExtendSection';

    var title = document.createElement('div');
    title.className = 'title big';
    title.innerHTML = 'Ustawienia marginesów:';

    globalSettings.appendChild( title );
    globalSettings.appendChild( this.verticalPadding() );
    globalSettings.appendChild( this.horizontalPadding() );

    elem.appendChild( globalSettings );

    this.currentExtendedTool = elem;
    this.openSection = 'paddingTool';

    return elem;

};

p.paddingTools = function(){

    var _this = this;

    var elem = document.createElement('div');
    elem.className = 'button';
    elem.id = 'paddingToolsContainer';

    var currentIcon = document.createElement('div');
    currentIcon.className = 'currentIcon';

    var optionsBox = document.createElement('div');
    optionsBox.className = 'optionsBox';

    elem.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.openSection == 'paddingTool' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != 'paddingTool' ){

                _this.toolsContainer.appendChild( _this.initPaddingToolBox() );
                _this.initHorizontalPaddingAction( $('#horizontalPadding') );
                _this.initVerticalPaddingAction( $("#verticalPadding") );

                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;

            }

        }else {

            _this.toolsContainer.appendChild( _this.initPaddingToolBox() );
            _this.initHorizontalPaddingAction( $('#horizontalPadding') );
            _this.initVerticalPaddingAction( $("#verticalPadding") );

            _this._updateToolsBoxPosition();

        }

    });

    return elem;

};

p.zoomTool = function(){

    var _this = this;

    var zoomTool = document.createElement("div");
    zoomTool.id = "zoom-text";
    zoomTool.className = 'button';

    zoomTool.addEventListener( "click", function( e ){

        e.stopPropagation();


        if( $(zoomTool).hasClass('active')){

            $(zoomTool).removeClass('active');

            _this.textInstance.zoom();

        }else {

            $(zoomTool).addClass('active');
            _this.textInstance.zoom();

        }

    });

    this.boxes.zoom = zoomTool;

    return zoomTool;

};

p.removeImageTool = function(){

    var _this = this;
    var object = this.textInstance;
    var Editor = this.textInstance.editor;
    var tool = document.createElement('div');
    tool.className = 'button';
    tool.id = 'removeImage';
    //tool.innerHTML = 'C';

    tool.addEventListener('click', function( e ){

        e.stopPropagation();

        if( userType == 'user'){

            var editableArea = object.parentPage;

        }else if( userType == 'advancedUser' ){

            var editableArea = object.getFirstImportantParent();

        }

        Editor.webSocketControllers.userPage.removeUserText(

            editableArea.userPage._id,
            object.dbID

        );

    }.bind( this ));

    return tool;

};

p.layerUp = function(){

    var Editor = this.textInstance.editor;
    var _this = this.textInstance;

    var layerUp = document.createElement('div');
    layerUp.className = 'button';
    layerUp.id = 'layerUpButton';


    layerUp.appendChild( Editor.template.createToolhelper ("Warstwa w górę") );


    layerUp.addEventListener('click', function( e ){

        e.stopPropagation();

        var editingObject = _this;

        var index = editingObject.parent.getChildIndex( editingObject );

        // jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
        // Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );

        // TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem
        if( index < editingObject.parent.children.length-1 ){

            editingObject.parent.setChildIndex( editingObject, index+1 );
            editingObject.order = index+1;

            var moveDownObject = editingObject.parent.getChildAt( index );
            moveDownObject.order = index;

        }

        var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();

        Editor.webSocketControllers.userPage.moveObjectUp( _this.dbID, _this.getFirstImportantParent().userPage._id );

    });

    return layerUp;

};


p.layerDown = function(){

    var _this = this.textInstance;

    var Editor = this.textInstance.editor;

    var layerDown = document.createElement('div');
    layerDown.className = 'button';
    layerDown.id = 'layerDownButton';


    layerDown.appendChild( Editor.template.createToolhelper ("Warstwa w dół") );

    layerDown.addEventListener('click', function( e ){

        var editingObject = _this;

        var index = editingObject.parent.getChildIndex( editingObject );

        // jezeli obiekt znajduje sie w editable area i użytkonik jest aminem
        // Editor.webSocketControllers.themePage.changeObjectsOrder( editingObject.parent.parent );

        // TO DO: jeżeli obiekt ni e jest w editablearea i jest admiem


        if( index > 0 ){

            editingObject.parent.setChildIndex( editingObject, index-1 );

        }
        else {

            if( editingObject.parent.name == 'foregroundLayer' ){

                var background = editingObject.parent.parent.backgroundLayer;
                editingObject.parent.removeChild( editingObject );

                if( background.children.length > 0 )
                    background.addChildAt( editingObject, background.children.length-1 );
                else
                    background.addChildAt( editingObject, background.children.length );

            }else {



            }

        }

        var viewLayerInfo = Editor.adminProject.format.view.getLayerInfo();

        Editor.webSocketControllers.userPage.moveObjectDown( _this.dbID, _this.getFirstImportantParent().userPage._id );

    });

    return layerDown;

};


p.initSimpleTools = function( _tools ){

    var _this = this;
    var tools = document.createElement("DIV");
    tools.id = "proposed-text-toolsbox";
    tools.className = "tools-box";

    var adminTools = document.createElement("DIV");
    adminTools.className = "proposedTextTools-admin";

    var userTools = document.createElement("DIV");
    userTools.className = "simple editorBitmapTools editorBitmapTools7";

    if( _tools == 'min' ){

        userTools.appendChild( this.layerDown() );
        userTools.appendChild( this.layerUp() );
        userTools.appendChild( this.removeImageTool() );

        tools.appendChild( userTools );

        document.body.appendChild( tools );

        this.adminBox       = adminTools;
        this.userBox        = userTools;
        this.toolsContainer = tools;

        this.textInstance.addEventListener( 'move', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.textInstance.addEventListener('scale', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.textInstance.addEventListener('rotate', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.textInstance.addEventListener('resize', function( e ){

            _this._updateToolsBoxPosition();

        });

    }else {

        userTools.appendChild( this.zoomTool() );
        userTools.appendChild( this.createFontSelect() );
        userTools.appendChild( this.textColorPickerInput() );
        userTools.appendChild( this.createAutoSizeTool() );
        userTools.appendChild( this.createLineHeightTool() );
        userTools.appendChild( this.createFontSizeTool() );
        userTools.appendChild( this.createBoldTool() );
        userTools.appendChild( this.createItalicTool() );
        userTools.appendChild( this.createAlignButton() );
        userTools.appendChild( this.createShadowTool() );
        userTools.appendChild( this.backgroundTools() );
        userTools.appendChild( this.paddingTools() );
        userTools.appendChild( this.removeImageTool() );

        //userTools.appendChild( this.createColorTool() );

        //tools.appendChild( this.createOpenTool() );
        tools.appendChild( userTools );

        document.body.appendChild( tools );

        _this.textInstance._updateShape();
        this._updateToolBox();

        this.adminBox       = adminTools;
        this.userBox        = userTools;
        this.toolsContainer = tools;

        this.textInstance.addEventListener( 'move', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.textInstance.addEventListener('scale', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.textInstance.addEventListener('rotate', function( e ){

            _this._updateToolsBoxPosition();

        });

        this.textInstance.addEventListener('resize', function( e ){

            _this._updateToolsBoxPosition();

        });

        $('#textColor').colorpicker({

            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: true,
            alpha: true,
            select : function( e ){

                e.stopPropagation();
                //console.log(e);
                //console.log('djkslkjdshfljkadshfkljasdfasd');
                var textColor = e.target.value;
                var alpha = textColor.split('(')[1].split(')')[0].split(',');

                textColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

                var alpha = textColor.split('(')[1].split(')')[0].split(',');


                _this.textInstance._currentFontColor = textColor;
                _this.textInstance.updateSelectedColor(  _this.textInstance.editor.rgb2hex(textColor) );
                _this.textInstance.updateText(

                    {
                        letters : true

                    },false

                );
                /*
                if( userType == 'user' ){

                    var letters = 0;

                    for( var i=0; i < _this.textInstance.lines.length; i++ ){

                        letters += _this.textInstance.lines[i].letters;

                    }

                    if( letters ){

                        _this.textInstance.setCursor( 1 );

                    }

                }

                var textColor = e.target.value;
                var alpha = textColor.split('(')[1].split(')')[0].split(',');

                textColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

                var alpha = textColor.split('(')[1].split(')')[0].split(',');

                _this.textInstance._currentFontColor = _this.textInstance.editor.rgb2hex(textColor);

                //_this.textInstance.updateAllLetters( Editor.rgb2hex(textColor) );
                _this.textInstance.updateText(

                    {
                        letters : true

                    }

                );

                */

            },

            colorFormat: 'RGBA'

        });

        $("#lineHeight").spinner({

            spin: function( event ){

                var lines = _this.textInstance.getSelectedLines();

                for( var i=0; i < lines.length; i++){

                    lines[i].setLineHeight( parseInt(event.target.value)*0.37 );
                    var biggestLetters = lines[i].getBiggestLetters();
                    var bigestSize =  biggestLetters[0].size;
                    lines[i].userFontSizeLineHeightAspect = (parseInt(event.target.value) *0.37)/bigestSize;

                }

                _this.textInstance.defaultLineHeight = false;
                _this.textInstance.updateText({

                    linesPosition: true,
                    lettersPositions: true

                });
                _this.textInstance._updateShape();
                _this.textInstance.setCursor( _this.textInstance._cursorPosition );

            },

            change: function( event ){

                var lines = _this.textInstance.getSelectedLines();

                for( var i=0; i < lines.length; i++){

                    lines[i].setLineHeight( parseInt(event.target.value) );

                }
                _this.textInstance.updateText({

                    linesPosition: true,
                    lettersPositions: true

                });
                _this.textInstance._updateShape();

            }

        });

        $("#lineHeight").spinner( "value", _this.textInstance.lineHeight );

        $("#lineHeight").parent().addClass('lineHeight-tool');

        var typePtk = 0.37;

        $('#font-size').spinner({
            min: 2,
            spin: function( event ){

                var aspect = _this.textInstance.userFontSizeLineHeightAspect || _this.textInstance.defaultFontAspect;
                // trzeba zmienic aby kazda linia miala swoja interlinie i swoj aspect
                //console.log('TEKST ASPECT: ' + aspect );
                //console.log( $( '#font-size' ).spinner('value') );
                //console.log( typePtk);
                //console.log(  aspect * typePtk );
                //console.log(  $( '#font-size' ).spinner('value') * aspect * typePtk );
                //console.log( $( '#font-size' ).spinner('value') * aspect * typePtk );
                var size = $( '#font-size' ).spinner('value') * typePtk;
                //console.log('99999999');
                _this.textInstance._currentFontSize = $( '#font-size' ).spinner('value') * typePtk;
                _this.textInstance.updateSelectedSize( $( '#font-size' ).spinner('value') * typePtk );
                _this.textInstance.updateSelectedLineHeight( size );

                _this.textInstance.updateText({

                    lettersPositions : true,
                    linesPosition    : true
                    //maximizeFontSize : true

                });

                _this.textInstance._useDefaultValues = false;
                _this.textInstance.setCursor( _this.textInstance._cursorPosition );

            },

            change: function( event ){

                _this.textInstance._currentFontSize = $( '#font-size' ).spinner('value') * typePtk;
                _this.textInstance.updateSelectedSize( $( '#font-size' ).spinner('value') * typePtk );

                _this.textInstance.updateText({

                    lettersPositions : true,
                    linesPosition    : true
                    //maximizeFontSize : true

                });

                _this.textInstance._useDefaultValues = false;

            }

        });

        $( this.boxes.size_default ).spinner({
            min: 2,
            spin: function( event ){

                //console.log('powinno zmienic: ' + parseInt( $( _this.boxes.size_default ).spinner('value') ));
                _this.textInstance.defaultSettings.size = parseInt( $( _this.boxes.size_default ).spinner('value') );
                _this.textInstance.updateSelectedSize( $( _this.boxes.size_default ).spinner('value') );
                _this.textInstance._updateShape();
                _this.textInstance.updateText({

                    lettersPositions : true,
                    linesPosition    : true
                    //maximizeFontSize : true

                });

            },

            change: function( event ){

                _this.textInstance.defaultSettings.size = parseInt( $( _this.boxes.size_default ).spinner('value') );
                _this.textInstance.updateSelectedSize( $( _this.boxes.size_default ).spinner('value') );
                _this.textInstance._updateShape();

            }

        });

        $( this.boxes.size_default ).parent().addClass("font-size-tools");

        //$( this.boxes.size_default ).spinner('value', 3);


        var currentFontSize = parseInt(this.textInstance._currentFontSize);
        $( this.boxes.size_default ).spinner('value', currentFontSize);

    }




};


/**
* Inicjalizuje wszystkie narzędzia i dołącza je do tool boxa
*
* @method initAllTools
*/
p.initAllTools = function(){

    var _this = this;

    var tools = document.createElement("DIV");
    tools.id = "proposed-text-toolsbox";
    tools.className = "tools-box";

    var adminTools = document.createElement("DIV");
    adminTools.className = "proposedTextTools-admin";

    var userTools = document.createElement("DIV");
    userTools.className = "proposedTextTools";

    var alignTools = document.createElement('div');
    alignTools.id = 'all-align-tools';

    alignTools.appendChild( this.createLeftAlignTool_default() );
    alignTools.appendChild( this.createCenterAlignTool_default() );
    alignTools.appendChild( this.createRightAlignTool_default() );
    alignTools.appendChild( this.createJustifyTool() );

    userTools.appendChild( this.createFontSelect_default() );
    userTools.appendChild( this.createFontSizeTool_default() );
    userTools.appendChild( this.createLineHeightTool() );
    userTools.appendChild( this.createBoldTool() );
    userTools.appendChild( this.createItalicTool() );
    userTools.appendChild( alignTools );
    userTools.appendChild( this.textColorPickerInput() );
    //userTools.appendChild( this.createColorTool() );

    tools.appendChild( userTools );

    document.body.appendChild( tools );

    _this.textInstance._updateShape();
    this._updateToolBox();

    this.adminBox       = adminTools;
    this.userBox        = userTools;
    this.toolsContainer = tools;

    this.textInstance.addEventListener( 'move', function( e ){

        _this._updateToolsBoxPosition();

    });

    this.textInstance.addEventListener('scale', function( e ){

        _this._updateToolsBoxPosition();

    });

    this.textInstance.addEventListener('rotate', function( e ){

        _this._updateToolsBoxPosition();

    });

    this.textInstance.addEventListener('resize', function( e ){

        _this._updateToolsBoxPosition();

    });

    $('#textColor').colorpicker({

        parts: 'full',
        showOn: 'both',
        buttonColorize: true,
        showNoneButton: true,
        alpha: true,
        select : function( e ){

            e.stopPropagation();

            var textColor = e.target.value;
            var alpha = textColor.split('(')[1].split(')')[0].split(',');

            textColor = 'rgba(' + alpha[0] + ','+ alpha[1]+','+ alpha[2]+','+(alpha[3]*255)+')';

            var alpha = textColor.split('(')[1].split(')')[0].split(',');

            _this.textInstance._currentFontColor = _this.textInstance.editor.rgb2hex(textColor);
            _this.textInstance.updateSelectedColor( _this.textInstance.editor.rgb2hex(textColor) );

            _this._updateToolBox();

        },

        colorFormat: 'RGBA'

    });


    $("#lineHeight").spinner({

        spin: function( event ){
            //console.log('TO JE TO :)');
            var lines = _this.textInstance.getSelectedLines();

            for( var i=0; i < lines.length; i++){

                lines[i].setLineHeight( parseInt(event.target.value)*0.37 );

            }

            _this.textInstance._updateShape();
            _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        },

        change: function( event ){

            var lines = _this.textInstance.getSelectedLines();

            for( var i=0; i < lines.length; i++){

                lines[i].setLineHeight( parseInt(event.target.value)*0.37 );

            }

            _this.textInstance._updateShape();

        }

    });

    $("#lineHeight").spinner( "value", _this.textInstance.lineHeight/0.37 );

    $("#lineHeight").parent().addClass('lineHeight-tool');

    var typoPtk = 0.37;

    $( this.boxes.size_default ).spinner({
        min: 2,
        spin: function( event ){

            _this.textInstance.defaultSettings.size =$( _this.boxes.size_default ).spinner('value') * typoPtk;
            _this.textInstance.updateSelectedSize( $( _this.boxes.size_default ).spinner('value') * typoPtk );
            _this.textInstance._updateShape();

        },

        change: function( event ){

            _this.textInstance.defaultSettings.size = $( _this.boxes.size_default ).spinner('value') * typoPtk;

            _this.textInstance.updateSelectedSize( $( _this.boxes.size_default *typoPtk ).spinner('value') * typoPtk );
            _this.textInstance._updateShape();

        }

    });

    $( this.boxes.size_default ).parent().addClass("font-size-tools");

    //$( this.boxes.size_default ).spinner('value', 3);


    var currentFontSize = parseInt(this.textInstance._currentFontSize);
    $( this.boxes.size_default ).spinner('value', currentFontSize);

};


/**
* Dodaje narzędzie do elementu.
*
* @method appendTools
*/
p.appendTools = function( elem ){

    elem.append( this.toolsContainer );

};


/**
* Tworzy narzędzie pogrubiania czcionki
*
* @method createBoldTool
*/
p.createBoldTool = function(){

    var _this = this;

    var boldTool = document.createElement("div");
    boldTool.id = "bold-text";
    boldTool.className = 'button';

    boldTool.addEventListener( "click", function( e ){

        e.stopPropagation();

        if( _this.fontType.regular )
            _this.setBold();
        else
            _this.unsetBold();

        _this._updateToolBox();

    });

    this.boxes.bold = boldTool;

    return boldTool;

};


/**
* Tworzy narzędzie pochylania czcionki
*
* @method createItalicTool
*/
p.createItalicTool = function(){

    var _this = this;

    var italicTool = document.createElement("div");
    italicTool.id = "italic-text";
    italicTool.className = 'button';

    italicTool.addEventListener( "click", function(){

        if( _this.fontType.italic )
            _this.unsetItalic();
        else
            _this.setItalic();

        _this._updateToolBox();

    });

    this.boxes.italic = italicTool;

    return italicTool;

}


p.createColorTool = function( ){

    var _this = this;

    var colorInput = document.createElement('div');
    colorInput.id = "colorPicker";

    var currentColor = document.createElement('span');
    currentColor.id = 'current-text-color';

    colorInput.appendChild( currentColor );

    var colorPalette = document.createElement('div');
    colorPalette.id = 'colorPalette';

    colorInput.appendChild( colorPalette );

    var activeColors = Editor.adminProject.getActiveColors();

    for( var i=0; i < activeColors.length; i++ ){

        var colorElement = document.createElement('div');
        colorElement.className = 'colorPaletteElement';
        colorElement.style.backgroundColor = activeColors[i];

        colorElement.addEventListener('click', function( e ){

            e.stopPropagation();

            _this.textInstance._useDefaultValues = false;

           // _this.textInstance.updateSelectedColor( Editor.rgb2hex(this.style.backgroundColor) );
            _this._updateToolBox();

        });

        colorPalette.appendChild( colorElement );

    }



    colorInput.addEventListener('click', function(){

        if( $("#colorPalette").hasClass('open') ){

            $("#colorPalette").removeClass('open');

        }else {

            $("#colorPalette").addClass('open');

        }

    });

    /*
    var col = new jscolor.color( colorInput );

    col.onImmediateChange = function(){

        _this.textInstance._useDefaultValues = false;
        _this.textInstance._currentFontColor = $("#colorPicker").css("background-color");
        _this.textInstance.updateSelectedColor( $("#colorPicker").css("background-color") );
        _this._updateToolBox();

    };
    */

    this.boxes.color = colorInput;

    return colorInput;

};


p.createLineHeightTool = function(){

    var _this = this;

    var lineHeightTools = document.createElement("div");
    lineHeightTools.className = "lineHeightTools";

    var lineHeightLabel = document.createElement("label");
    lineHeightLabel.className = "lineHeightLabel";

    var lineHeightInput = document.createElement("input");

    lineHeightInput.id = "lineHeight";
    lineHeightInput.className = "spinner";


    lineHeightInput.onfocus = function(){

        Editor.tools.keyboard.detach("keydown");

    };

    lineHeightInput.onblur = function(){

        Editor.tools.keyboard.append("keydown", _this.textInstance );

    };


    /*
    lineHeightInput.addEventListener('change', function( e ){

        _this.textInstance.setLineHeight( e.target.value );

    });
    */

    lineHeightTools.appendChild( lineHeightLabel );
    lineHeightTools.appendChild( lineHeightInput );


    this.boxes.lineHeight_default = lineHeightInput;
    return lineHeightTools;

};

p.createAutoSizeTool = function(){

    var _this = this;
    var button = document.createElement('div');
    button.className = 'button autosize-font';
    button.addEventListener('click', function( e ){

        e.stopPropagation();
        _this.textInstance.autoSize = !_this.textInstance.autoSize;
        _this.textInstance.updateText({}, true);
        if( $(button).hasClass('active') ){
            $(button).removeClass('active');
        }else {
            $(button).addClass('active');
        }

    });

    return button;

};

p.createShadowBlurTool = function(){

    var _this = this;

    var shadowBlurTools = document.createElement("div");
    shadowBlurTools.className = "shadowBlurTools";

    var shadowBlurLabel = document.createElement("label");
    shadowBlurLabel.className = "shadowBlurLabel";

    var shadowBlurInput = document.createElement("input");

    shadowBlurInput.id = "shadowBlur";
    shadowBlurInput.className = "spinner";
    shadowBlurInput.value = this.textInstance.shadowBlur;

    shadowBlurInput.onfocus = function(){

        Editor.tools.keyboard.detach("keydown");

    };

    shadowBlurInput.onblur = function(){

        Editor.tools.keyboard.append("keydown", _this.textInstance );

    };

    shadowBlurTools.appendChild( shadowBlurLabel );
    shadowBlurTools.appendChild( shadowBlurInput );

    $( shadowBlurInput ).spinner({
        value: this.textInstance.shadowBlur,
        min: 0,
        spin: function( event ){

            var editing_id = Editor.tools.getEditObject();
            var editingObject = Editor.stage.getObjectById( editing_id );

            editingObject.setShadowBlur( parseInt(event.target.value) );
            editingObject.updateShadow();

        },

        change: function( event ){

            var editing_id = Editor.tools.getEditObject();
            var editingObject = Editor.stage.getObjectById( editing_id );

            editingObject.setShadowBlur( parseInt(event.target.value) );

            if( _this.textInstance.isProposedPosition ){

                Editor.webSocketControllers.proposedText.setAttributes( _this.textInstance.dbID, { shadowBlur: parseInt(event.target.value) } );

            }

        },

        stop: function( event ){

            var editing_id = Editor.tools.getEditObject();
            var editingObject = Editor.stage.getObjectById( editing_id );
            editingObject.setShadowBlur( parseInt(event.target.value) );

        }

    });


    this.boxes.lineHeight_default = shadowBlurInput;

    return shadowBlurTools;

};


p.initShadowTool = function(){

    var _this = this;

    var shadowTool = document.createElement('div');
    shadowTool.className = 'toolBoxExtend';

    var optionsBox = document.createElement('div');
    optionsBox.className = 'toolBoxExtendSection';

    shadowTool.appendChild( optionsBox );

    var onOffLabel = document.createElement('label');
    var onOff = document.createElement('input');
    onOff.type = 'checkbox';
    onOff.className = 'switch';
    onOff.checked = this.textInstance._dropShadow;

    var onOffdispl = document.createElement('div');
    onOffdispl.className = 'bigMarginSwitch';

    var title = document.createElement('div');
    title.className = 'title big';
    title.innerHTML = 'Włącz cień: ';

    onOffLabel.appendChild( title );
    onOffLabel.appendChild( onOff );
    onOffLabel.appendChild( onOffdispl );

    optionsBox.appendChild( onOffLabel );
    optionsBox.appendChild( this.createShadowBlurTool() );

    onOff.addEventListener('change', function( e ){

        e.stopPropagation();
        if( e.target.checked ){

            var editing_id =  _this.textInstance.editor.tools.getEditObject();
            var editingObject =   _this.textInstance.editor.stage.getObjectById( editing_id );

            editingObject.dropShadow();

            if( _this.textInstance.isProposedPosition ){

                  _this.textInstance.editor.webSocketControllers.proposedText.setAttributes( _this.textInstance.dbID, { dropShadow: true, shadowBlur: _this.textInstance.shadowBlur } );

            }else {

                  _this.textInstance.editor.webSocketControllers.editorText.setShadow( _this.textInstance.usedTextID, true );

            }

            //editorBitmapID, viewID ,options,

            //console.log('dropShadow' );
        }
        else {

            var editing_id =   _this.textInstance.editor.tools.getEditObject();
            var editingObject =   _this.textInstance.editor.stage.getObjectById( editing_id );

            editingObject.unDropShadow();
              _this.textInstance.editor.webSocketControllers.editorText.setShadow( _this.textInstance.usedTextID, false );
            //console.log('editinfundropShadow' );

        }

    });

    this.currentExtendedTool = shadowTool;
    this.openSection = 'shadowTools';

    return shadowTool;

};

p.createShadowTool = function(){

    var _this = this;

    var shadowTool = document.createElement('div');
    shadowTool.className = 'button';
    shadowTool.id = 'shadowTextTool';

    var shadowIcon = document.createElement('div');
    shadowIcon.className = 'currentIcon';


    shadowTool.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.openSection == 'shadowTools' || _this.openSection != null ){

            _this.toolsContainer.removeChild( _this.currentExtendedTool );

            if( _this.openSection != 'shadowTools' ){

                _this.toolsContainer.appendChild( _this.initShadowTool() );
                _this._updateToolsBoxPosition();

            }else {

                _this.openSection = null;

            }

        }else {

            _this.toolsContainer.appendChild( _this.initShadowTool() );
            _this._updateToolsBoxPosition();

        }

    });

    return shadowTool;

    //var flipSwitch = generateFlatSwitch( this.textInstance._dropShadow );


/*
    flipSwitch.addEventListener('change', function( e ){

        e.stopPropagation();
        if( e.target.checked ){

            var editing_id = Editor.tools.getEditObject();
            var editingObject = Editor.stage.getObjectById( editing_id );

            editingObject.dropShadow();

            Editor.webSocketControllers.editorText.setShadow( _this.textInstance.usedTextID, true );

            //editorBitmapID, viewID ,options,

            //console.log('dropShadow' );
        }
        else {

            var editing_id = Editor.tools.getEditObject();
            var editingObject = Editor.stage.getObjectById( editing_id );

            editingObject.unDropShadow();
            Editor.webSocketControllers.editorText.setShadow( _this.textInstance.usedTextID, false );
            //console.log('editinfundropShadow' );

        }

    });
*/
    return shadowTool;

};


p.createColorTool_default = function(){

    var _this = this;

    var colorInput = document.createElement('INPUT');
    colorInput.id = "colorPicker-default";

    var col = new jscolor.color( colorInput );

    col.onImmediateChange = function(){

        _this.textInstance.defaultSettings.color = $("#colorPicker-default").css("background-color");
        _this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();

    };

    this.boxes.color_default = colorInput;

    return colorInput;

};



p.createOpenTool = function(){

    var _this = this;

    var opener = document.createElement("SPAN");
    opener.className = "openTextTools";


    opener.appendChild( Editor.template.createToolhelper ("Klinij aby edytować tekst") );

    opener.addEventListener('click', function( e ){

        e.stopPropagation();

        if( _this.open ){

            _this.open = false;

            $('.proposedTextTools > *').removeClass('show');

            setTimeout( function(){
                $("#proposed-text-toolsbox .proposedTextTools").stop().animate({width: 0}, 300);

            }, 500 );

            if( _this.textInstance.editMode ){

                //usuwamy wszystkie zbedne eventy
                _this.textInstance._removeEditModeEvents();
                _this.textInstance.selection.lastLetter = null;
                _this.textInstance.selection.stopLine = null;
                _this.textInstance.displaySelectedLetter();
                _this.textInstance.cursor = 'text';

                /*
                if( jscolor.picker ){

                    delete jscolor.picker.owner;

                }
                */

                if( $(".Picekr").length > 0 ){

                    document.getElementsByTagName('body')[0].removeChild(jscolor.picker.boxB);

                }

            }

            Editor.tools.keyboard.detach("keydown");

            _this.textInstance.editMode = false;


            // usuniecie kursora i  wyłączenie intervala
            _this.textInstance.removeChild( _this.textInstance.cursorShape );
            _this.textInstance.cursorShape = null;
            clearInterval(_this.textInstance.cursorInterval);

            // inicjalizacja podstawowych eventów


             _this.textInstance.initEvents();


            //zrobienie cache i zapisanie go
            //_this.cache( 0, 0, _this.trueWidth, _this.trueHeight );
            _this.textInstance.hitArea = _this.textInstance.background;

            _this.textInstance.initTextEvents();

        }
        else
        {

            _this.open = true;
            $("#proposed-text-toolsbox .proposedTextTools").stop().animate({width: 780}, 300, function(){

                $('.proposedTextTools > *').addClass('show');

            });

            // wprowadzone zmiany
           _this.textInstance.uncache();
            _this.textInstance.hitArea = null;
            _this.textInstance.cursor = "text";
            _this.textInstance.editMode = true;
            _this.textInstance.editor.tools.keyboard.append( "keydown", _this.textInstance );

            _this.textInstance.removeAllEventListeners( 'mousedown' );
            _this.textInstance.removeAllEventListeners( 'pressmove' );
            _this.textInstance.removeAllEventListeners( 'pressup' );
            _this.textInstance.editor.getStage().removeAllEventListeners('stagemousedown');

            _this.textInstance._editModeEvents();

            var cords = _this.textInstance.getCursorPositionInCursorMap();

            _this.textInstance.setCursor( cords.position, cords.line || 0 );

        }

    });

    this.boxes.opener = opener;

    return opener;

};


p.createJustifyTool = function(){

    var _this = this;

    var justify = document.createElement("SPAN");
    justify.className = "text-align fot-justify";

    justify.addEventListener('click', function(){

        _this.textInstance.setAlign('justify');
        _this.align = "justify";
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();
        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        this.parentNode.parentNode.firstChild.style.background = 'url(images/justify.png) no-repeat center';

    });

    this.boxes.justify = justify;

    return justify;

};


// tworzy przycisk justowania do lewej strony
p.createLeftAlignTool = function( ){

    var alignLeft = document.createElement("SPAN");
    alignLeft.className = "text-align fot-align-left";

    alignLeft.addEventListener('click', function(){

        this.textInstance._useDefaultValues = false;
        this.textInstance._align = 'left';
        this.textInstance._recalculateAllLines();
        this._updateToolBox();
        this.textInstance.updateContentInDB();
        this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });


    }.bind( this ));

    this.boxes.alignLeft = alignLeft;

    return alignLeft;

};


// tworzy przycisk justowania do lewej strony
p.createLeftAlignTool_default = function( ){

    var _this = this;

    var alignLeft = document.createElement("SPAN");
    alignLeft.className = "text-align fot-align-left";

    alignLeft.addEventListener('click', function(){

        _this.textInstance.setAlign('left');
        _this.align = "left";
        //_this.textInstance.updateTextWithDefaultValues();
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_left.png) no-repeat center';

    });

    this.boxes.alignLeft_default = alignLeft;

    return alignLeft;

};


// tworzy przycisk justowania do środka
p.createCenterAlignTool = function( ){

    var _this = this;

    var alignCenter = document.createElement("SPAN");
    alignCenter.className = "text-align fot-align-center";

    //alignCenter.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignCenter'] );

    alignCenter.addEventListener('click', function(){

        _this.textInstance._useDefaultValues = false;
        _this.textInstance._align = 'center';
        _this.textInstance._recalculateAllLines();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_center.png) no-repeat center';

    });

    this.boxes.alignCenter = alignCenter;

    return alignCenter;

};


// tworzy przycisk justowania do środka
p.createCenterAlignTool_default = function( ){

    var _this = this;

    var alignCenter = document.createElement("SPAN");
    alignCenter.className = "text-align fot-align-center";

    //alignCenter.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignCenter'] );

    alignCenter.addEventListener('click', function(){

        _this.textInstance.setAlign('center');
        _this.align = "center";
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();
        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_center.png) no-repeat center';


    });

    this.boxes.alignCenter_default = alignCenter;

    return alignCenter;

};


// tworzy przycisk justowania do prawej strony
p.createRightAlignTool = function(){

    var _this = this;

    var alignRight = document.createElement("SPAN");
    alignRight.className = "text-align fot-align-right";

    //alignRight.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignRight'] );

    alignRight.addEventListener( 'click', function(){

        _this.textInstance._useDefaultValues = false;
        _this.textInstance._align = 'right';
        _this.textInstance._recalculateAllLines();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_right.png) no-repeat center';

    });

    this.boxes.alignRight = alignRight;

    return alignRight;

};


// tworzy przycisk justowania do prawej strony
p.createRightAlignTool_default = function(){

    var _this = this;

    var alignRight = document.createElement("SPAN");
    alignRight.className = "text-align fot-align-right";

    //alignRight.addEventListener( 'click', this.proposedText.text.toolBoxButtonsFuction['alignRight'] );

    alignRight.addEventListener( 'click', function(){

        _this.textInstance.setAlign('right');
        _this.align = "right";
        _this.textInstance._updateShape();
        _this._updateToolBox();
        _this.textInstance.updateContentInDB();

        _this.textInstance.updateText( {

            lettersPositions : true,
            linesPosition : true,

        });

        _this.textInstance.setCursor( _this.textInstance._cursorPosition );

        this.parentNode.parentNode.firstChild.style.background = 'url(/images/text_right.png) no-repeat center';

    });

    this.boxes.alignRight_default = alignRight;

    return alignRight;

};


// tworzy input wielkosci tekstu
p.createFontSizeTool = function(){

    var _this = this;

    var fontSizeInput = document.createElement('INPUT');
    fontSizeInput.id = "font-size";
    fontSizeInput.name = "font-size";

    this.boxes.size = fontSizeInput;

    return fontSizeInput;

};

p.createLineHeightTool = function(){

    var _this = this;

    var fontSizeInput = document.createElement('INPUT');
    fontSizeInput.id = "lineHeight";
    fontSizeInput.name = "lineHeight";

    this.boxes.lineHeight = fontSizeInput;

    return fontSizeInput;

};


// tworzy input wielkosci tekstu
p.createFontSizeTool_default = function(){

    var _this = this;
    var Editor = this.textInstance.editor;

    var fontSizeTool = document.createElement("div");
    fontSizeTool.className = "fontSizeTool";



    var fontSizeLabel = document.createElement("Label");
    fontSizeLabel.className = "fontSizeLabel";


    var fontSizeInput = document.createElement('INPUT');
    fontSizeInput.id = "font-size-default";
    fontSizeInput.name = "font-size";
    fontSizeInput.className = "spinner";



   // alert(currentFontSize);


    $('#font-size-default').addClass('spinner');

    fontSizeTool.appendChild(fontSizeLabel);
    fontSizeTool.appendChild(fontSizeInput);



    //$('#font-size-default').spinner("value", 20);

    //$('#font-size-default').spinner("value", currentFontSize);


    fontSizeInput.onfocus = function(){

        Editor.tools.keyboard.detach("keydown");

    };

    fontSizeInput.onblur = function(){

        Editor.tools.keyboard.append("keydown", _this.textInstance );

    };

    fontSizeInput.onchange = function(e){

        //console.log( _this.textInstance );
        //console.log('Co sie tutaj dzieje');
        var selected = _this.textInstance._getSelectedLetters();
        _this.textInstance._currentFontSize = ((this.value > 0 )? this.value : 1);
        _this.textInstance.updateSelectedSize( _this.textInstance._currentFontSize );

        for( var i=0; i < selected.length; i++ ){

            var font = selected[i].font.split(" ")[1];
            selected[i].font = _this.textInstance._currentFontSize + "px " +font;

        }

        _this.textInstance._useDefaultValues = false;
        _this.textInstance._recalculateAllLines();

    };


    this.boxes.size_default = fontSizeInput;



    return fontSizeTool;

};


// tworzy select z dostępnymi czcionkami
p.createFontSelect_default = function(){

    var _this = this;

    // div'owy selekt dla czcionek
    var selectBox = document.createElement("DIV");
    selectBox.id = "select-box-default";
    selectBox.className = "select-box";
    var currentFont = document.createElement("SPAN");
    currentFont.id = "current-font-default";
    currentFont.innerHTML = "Aa";
    selectBox.appendChild( currentFont );
    var fakeSelect = document.createElement("DIV");
    fakeSelect.id = "select-font";
    selectBox.appendChild( fakeSelect );
    var fontOptions = document.createElement("DIV");
    fontOptions.id = "font-options-default";
    fontOptions.className = "font-options";
    fontOptions.style.display = "none";


    var pointCone = document.createElement('div');
    pointCone.id = "pointCone";
    pointCone.className = "pointCone"

    fontOptions.appendChild( pointCone );

    selectBox.appendChild( fontOptions );


    var fontScrollBar = document.createElement("DIV");
    fontScrollBar.className = "scrollbar";

    var fontScroll = document.createElement("DIV");
    fontScroll.className = "track";

    var fontScrollThumb = document.createElement("DIV");
    fontScrollThumb.className = "thumb";

    var fontScrollEnd = document.createElement("DIV");
    fontScrollEnd.className = "end";

    var fontScrollViewport = document.createElement("DIV");
    fontScrollViewport.className = "viewport";

    var fontScrollOverview = document.createElement("DIV");
    fontScrollOverview.className = "overview";

    fontScrollThumb.appendChild( fontScrollEnd );
    fontScroll.appendChild( fontScrollThumb );

    fontScrollViewport.appendChild( fontScrollOverview );

    fontScrollBar.appendChild( fontScroll );

    fontOptions.appendChild( fontScrollBar );
    fontOptions.appendChild( fontScrollViewport );

    var selectArrow = document.createElement("SPAN");
    selectArrow.className = "select-arrow";

    selectArrow.addEventListener('click', function(e){

        e.stopPropagation();

        if( fontOptions.style.display == "none"){

            fontOptions.style.display = "block";
            selectArrow.className = selectArrow.className + " active";
            $("#font-options-default").tinyscrollbar();

        }
        else {

            fontOptions.style.display = "none";
            selectArrow.className = "select-arrow";

        }

    });


    var addFont = document.createElement("DIV");
    addFont.id = "addFont";
    addFont.innerHTML = "+ dodaj nową czcionkę";
    addFont.addEventListener('click', function(){

        Editor.fonts.addFontBox();

    });

    fakeSelect.appendChild( selectArrow );
    fontOptions.appendChild( addFont );

    var editorFonts = _this.textInstance.editor.fonts.getFonts();

    for( var i=0; i < editorFonts.length; i++ ){//} var font in Editor.fonts.getFonts() ){


        var font = editorFonts[i];
        var option = document.createElement("DIV");
        var optionPreview = document.createElement("SPAN");
        var optionName = document.createElement("DIV");

        option.id = font;

        option.className = "font-option " + ( ( this.textInstance.defaultSettings.family == font ) ? "active" : "" );
        //option.style.fontFamily = font + "_regular";
        optionPreview.innerHTML = "<img src='" + font.miniature + "'/>";
        optionName.innerHTML = font;
        option.appendChild( optionPreview );
        option.appendChild( optionName );

        option.addEventListener('click', function(){

            $(".font-option").removeClass("active");
            this.className = "font-option active";
            _this.textInstance.defaultSettings.family = this.id;
            document.getElementById("current-font-default").style.fontFamily =  this.id+"_regular";
            //console.log('Zobacz sobie co wybnrałeś:)');
            _this._updateToolBox();

        });

        fontScrollOverview.appendChild(option);

    }

    this.boxes.family_default = selectBox;

    return selectBox;

};


p.deleteObject = function(){

    var _this = this.textInstance;
    var Editor = this.textInstance.editor;
    var deleteTool = document.createElement("div");
    deleteTool.id = "deleteTextTool";
    deleteTool.className = 'button delete';

    deleteTool.appendChild( _this.textInstance.editor.template.createToolhelper ("Usuń pole tekstowe") );

    deleteTool.addEventListener('click', function( e ){

        var editableArea = _this.getFirstImportantParent();

        Editor.webSocketControllers.userPage.removeProposedText( editableArea.userPage._id, _this.dbID );

    });

    return deleteTool;

};


p.checkBoldAndItalicButtons = function(){

    var font = this.textInstance._currentFontFamily;
    var Editor = this.textInstance.editor;
    var fontOptions = Editor.fonts.getFontOptions( font );

    if( fontOptions.italic ){

        if( this.textInstance._currentFontType.regular ){

            this.unlockItalic();

        }else {

            if( fontOptions.boldItalic ){

                this.unlockItalic();

            }else {

                this.lockItalic();

            }

        }

    }else {

        this.lockItalic();

    }


    if( fontOptions.bold ){

        if( this.textInstance._currentFontType.italic ){

            if( fontOptions.boldItalic ){

                this.unlockBold();

            }else {

                this.lockBold();

            }

        }else {

            this.unlockBold();

        }

    }else {

        this.lockBold();

    }

};

p.unlockItalic = function(){

    var elem = document.getElementById('italic-text');

    if( elem ){
        $(elem).addClass('active-font');
    }

}

p.lockItalic = function(){

    var elem = document.getElementById('italic-text');

    if( elem ){
        $(elem).removeClass('active-font');
    }

}

p.unlockBold = function(){

    var elem = document.getElementById('bold-text');

    if( elem ){
        $(elem).addClass('active-font');
    }

}

p.lockBold = function(){

    var elem = document.getElementById('bold-text');

    if( elem ){
        $(elem).removeClass('active-font');
    }

}


p.createFontSelect = function(){

    var _this = this;
    var Editor = this.textInstance.editor;
    // div'owy selekt dla czcionek
    var selectBox = document.createElement("DIV");
    selectBox.id = "select-box";
    selectBox.className = "select-box";
    var currentFont = document.createElement("SPAN");
    currentFont.id = "current-font";
    currentFont.innerHTML = "Aa";
    selectBox.appendChild( currentFont );
    var fakeSelect = document.createElement("DIV");
    fakeSelect.id = "select-font";
    selectBox.appendChild( fakeSelect );
    var fontOptions = document.createElement("DIV");
    fontOptions.id = "font-options";
    fontOptions.className = "font-options";
    fontOptions.style.display = "none";
    selectBox.appendChild( fontOptions );

    var fontScrollBar = document.createElement("DIV");
    fontScrollBar.className = "scrollbar";

    var fontScroll = document.createElement("DIV");
    fontScroll.className = "track";

    var fontScrollThumb = document.createElement("DIV");
    fontScrollThumb.className = "thumb";

    var fontScrollEnd = document.createElement("DIV");
    fontScrollEnd.className = "end";

    var fontScrollViewport = document.createElement("DIV");
    fontScrollViewport.className = "viewport";

    var fontScrollOverview = document.createElement("DIV");
    fontScrollOverview.className = "overview";

    fontScrollThumb.appendChild( fontScrollEnd );
    fontScroll.appendChild( fontScrollThumb );

    fontScrollViewport.appendChild( fontScrollOverview );

    fontScrollBar.appendChild( fontScroll );

    fontOptions.appendChild( fontScrollBar );
    fontOptions.appendChild( fontScrollViewport );

    var selectArrow = document.createElement("SPAN");
    selectArrow.className = "select-arrow";

    selectArrow.addEventListener('click', function(e){

        e.stopPropagation();

        if( fontOptions.style.display == "none"){

            fontOptions.style.display = "block";
            selectArrow.className = selectArrow.className + " active";
            $("#font-options").tinyscrollbar();

        }
        else {

            fontOptions.style.display = "none";
            selectArrow.className = "select-arrow";

        }

    });


    var addFont = document.createElement("DIV");
    addFont.id = "addFont";
    addFont.innerHTML = "+ dodaj nową czcionkę";
    addFont.addEventListener('click', function(){

        Editor.fonts.addFontBox();

    });

    fakeSelect.appendChild( selectArrow );
    fontOptions.appendChild( addFont );

        var fonts = Editor.fonts.fonts;

        //console.log( fonts );
        //console.log('ASASDASASDFADSFASDFS');

        for( var font in fonts ){

            var option = document.createElement("DIV");
            var optionPreview = document.createElement("SPAN");
            var optionName = document.createElement("DIV");

            option.id = font;

            option.className = "font-option " + ( ( this.textInstance.defaultSettings.family == font ) ? "active" : "" );
            option.style.fontFamily = font + "_regular";
            optionPreview.innerHTML = "A";
            optionName.innerHTML = font;
            option.appendChild( optionPreview );
            option.appendChild( optionName );

            option.addEventListener('click', function(){

                var font = this.id;

                _this.fontLoader();

                Editor.fonts.addFontFile( this.id, function( data ){

                    $(".font-option").removeClass("active");
                    _this.className = "font-option active";

                    _this._currentFont = font;

                    $("#current-font").css({ "fontFamily" : font + "_Regular" });
                    $("#"+ font +".font-option").addClass("active");
                    _this.textInstance._currentFontFamily = font;
                    _this.textInstance._currentFont = Editor.fonts.selectFont( font,  _this.textInstance._currentFontType.regular,  _this.textInstance._currentFontType.italic );
                    //console.log('CO WYBRANE ZOSTALO:');
                    //console.log( Editor.fonts.selectFont( font,  _this.textInstance._currentFontType.regular,  _this.textInstance._currentFontType.italic ) );

                    _this.textInstance.updateText( {

                        letters: {
                            font: true
                        },
                        lettersPositions: true

                    }, false );

                    _this.textInstance.setCursor( _this.textInstance._cursorPosition );
                    /*
                    //_this._updateToolBox( _this.textInstance._currentFonttFontColor, _this.textInstance._currentFontSize );
                    for( var i=0; i < _this.textInstance.lines.length; i++ ){

                        _this.textInstance.lines[i].linesInfo();
                        _this.textInstance.lines[i]._recalculateAllLines();
                        _this.textInstance.lines[i].uncache();
                        _this.textInstance.recalculateLinePositions();

                    }
                    */

                    //_this.fontType = Editor.fonts.getFont( font );

                    document.getElementById("current-font").style.fontFamily =  font+"_regular";
                    
                    _this._updateToolBox();

                });

                /*
                */

            });

            fontScrollOverview.appendChild(option);

        }

    this.boxes.family = selectBox;

    return selectBox;

};

p.fontLoader = function(){


}


/**
* Metoda usuwająca toolbox z narzędziami
*
* @method remove
*
*/
p.remove = function(){

    $(this.toolsContainer).remove();

};
