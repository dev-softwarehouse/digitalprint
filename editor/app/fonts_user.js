/**
 * Modul odpowiadajacy za zarządzanie czcionkami i ich plikami. Odwoływujemy sie za pomocą "Editor.fonts".
 *
 * @module Fonts
 */
export class fonts {

    constructor(editor) {

        this.editor = editor;
        this.currentFonts = {};
        this.fonts = {};
        this.defaultFonts = ['Arial'];

    }

    /**
     * Zwraca pierwszą, dopasowaną do parametrów trzcionkę
     *
     * @method selectFont
     */
    selectFont(family, regular, italic) {

        if (this.fonts[family]) {

            if (regular == 0 && italic && this.fonts[family].FontTypes["BoldItalic"])
                return family + "_BoldItalic";
            else if (regular == 0 && this.fonts[family].FontTypes["Bold"])
                return family + "_Bold";
            else if (italic && this.fonts[family].FontTypes["Italic"])
                return family + "_Italic";
            else if (this.fonts[family].FontTypes["Regular"])
                return family + "_Regular";
            else
                return "Arial";

        }
        else {

            return "Arial";

        }

    }

    getFontFeatures(family) {
        return {
            bold: this.fonts[family] && (this.fonts[family].FontTypes.Bold || this.fonts[family].FontTypes.BoldItalic),
            italic: this.fonts[family] && (this.fonts[family].FontTypes.Italic || this.fonts[family].FontTypes.BoldItalic)
        }
    }

    checkFont(fontName) {

        if (this.fonts[fontName]) {

            if (this.fonts[fontName].FontTypes.Regular == '' &&
                this.fonts[fontName].FontTypes.Bold == '' &&
                this.fonts[fontName].FontTypes.BoldItalic == '' &&
                this.fonts[fontName].FontTypes.Italic == '')
                return false;

            return true;

        }
        else {

            return false;

        }

    }

    waitForWebfonts(font, callback) {

        var loadedFonts = 0;

        var node = document.createElement('span');
        node.id = font;
        // Characters that vary significantly among different fonts
        node.innerHTML = '1234567890qweryuiop[mmmmnnnMMMMMNNNNNN!@#$%^&**() ABCDEFGHIJKłłąśśńżgiItT1WQy@!-/#.-Mm';
        // Visible - so we can measure it - but not on the screen
        node.style.position = 'absolute';
        node.style.left = '-10000px';
        node.style.top = '-10000px';
        node.style.zIndex = -100;
        // Large font size makes even subtle changes obvious
        node.style.fontSize = '300px';
        // Reset any font properties
        node.style.fontFamily = 'fakeFont';
        node.style.fontVariant = 'normal';
        node.style.fontStyle = 'normal';
        node.style.fontWeight = 'normal';
        node.className = 'fonttester';
        node.style.letterSpacing = '0';
        document.body.appendChild(node);

        // Remember width with no applied web font
        var width = node.offsetWidth;

        node.style.fontFamily = font;

        var interval;

        function checkFont() {

            // Compare current width with original width
            if (node && node.offsetWidth != width) {
                ++loadedFonts;
                node.parentNode.removeChild(node);
                node = null;

                //alert('zaladowana czcionka ' + font);
                clearInterval(interval);

                setTimeout(function () {

                    callback(font);

                }, 500);

                return true;

            }

        };

        if (!checkFont()) {
            interval = setInterval(checkFont, 100);
        }


    }


    addFontFile(fontName, callback) {

        var _this = this;
        //console.log('SPRAWDZAM DODANIE FONTA');
        if (!this.checkFont(fontName)) {

            this.fonts[fontName] = {

                FontTypes: {

                    Regular: '',
                    Bold: '',
                    Italic: '',
                    BoldItalic: ''

                },
                downloaded: false

            };

            this.editor.webSocketControllers.font.get(fontName, function (data) {

                _this.onGetFont(data, function (data) {

                    //console.log( data );
                    //console.log('FONT ZOSTAŁ DODANY :)');
                    _this.fonts[fontName].downloaded = true;

                    if (callback)
                        callback(data);

                });

            });

        } else if (callback) {

            callback(true);
        }

    }

    /**
     * Funkcja zajmuje sie wczytywaniem plików czcionek.
     *
     * @method loadFonts
     */
    loadFonts() {

        var _this = this;

        this.editor.webSocketControllers.font.getAll(function (data) {

            for (var font in data) {

                _this.fonts[font] = {

                    FontTypes: {

                        Regular: '',
                        Bold: '',
                        Italic: '',
                        BoldItalic: ''

                    },
                    miniature: EDITOR_ENV.staticUrl+data[font].miniature

                }

            }

        });

    }


    onGetFont(font, callback) {

        var fontName = font.fontName;

        if (this.fonts[fontName].FontTypes.Regular != '' &&
            this.fonts[fontName].FontTypes.Bold != '' &&
            this.fonts[fontName].FontTypes.BoldItalic != '' &&
            this.fonts[fontName].FontTypes.Italic != '')
            return;

        this.fonts[fontName].FontTypes = font.fontTypes;

        var fontsToDownload = 0;
        var downloadedFonts = 0;

        function check() {

            if (fontsToDownload == downloadedFonts) {

                callback(font);

            }

        }

        for (var fontType in this.fonts[fontName].FontTypes) {

            fontsToDownload++;
        }


        for (var fontType in this.fonts[fontName].FontTypes) {

            if (this.fonts[fontName].FontTypes[fontType].url && this.fonts[fontName].FontTypes[fontType].url != '') {

                this.waitForWebfonts(fontName + "_" + fontType, function (font) {

                    downloadedFonts++;
                    check();

                    /*
                    setTimeout(function( ){

                        Editor.userProject.updateTexts();

                    }, 3000 );
                    */

                });

                $("head").prepend("<style type=\"text/css\">" +
                    "@font-face {\n" +
                    "\tfont-family: \"" + fontName + "_" + fontType + "\";\n" +
                    "\tsrc: url(" + EDITOR_ENV.staticUrl+this.fonts[fontName].FontTypes[fontType].url + ");\n" +
                    "}\n" +
                    "</style>");

            }

        }

    }


    /**
     * Ustawia podany obiekt jako informację o czcionkach.
     *
     * @method setFonts
     */
    setFonts(_fonts) {
        this.fonts = _fonts;
    }


    /**
     * Zwraca informację o czcionkach
     *
     * @method getFonts
     */
    getFonts() {

        return this.fonts;

    }


    getFont(fontName) {

        return this.fonts[fontName];

    }


    generatePrev(fontName) {

        var fontCanvas = document.createElement('canvas');
        fontCanvas.id = 'fontCanvas';
        fontCanvas.width = '50';
        fontCanvas.height = '50';

        document.body.appendChild(fontCanvas);

        var fontStage = new createjs.Stage("fontCanvas");

        var textObject = new createjs.Text('Aa', "50px " + fontName + "_Regular", "#000");
        textObject.textBaseline = "alphabetic";
        textObject.lineHeight = '60';


        var bounds = textObject.getTransformedBounds();

        if (bounds.width > bounds.height) {

            fontCanvas.width = bounds.width;
            fontCanvas.height = bounds.width;

            var centerPosY = (fontCanvas.height - bounds.height) / 2 + bounds.height;

            textObject.y = centerPosY;

        } else {

            fontCanvas.width = bounds.height;
            fontCanvas.height = bounds.height;

            var centerPosX = (fontCanvas.width - bounds.width) / 2;

            var centerPosY = bounds.height;

            textObject.y = centerPosY / 1.2;
            textObject.x = centerPosX;

        }

        fontStage.addChild(textObject);

        fontStage.update();

        var miniature = fontStage.toDataURL();

        $(fontCanvas).remove();

        return miniature;

    }

    getFontOptions(fontName) {

        var font = this.fonts[fontName];

        var options = {

            italic: 0,
            bold: 0,
            boldItalic: 0

        };

        if (font) {

            if (font.FontTypes.Bold != '' && font.FontTypes.Bold) {

                options.bold = 1;

            }

            if (font.FontTypes.Italic != '' && font.FontTypes.Italic) {

                options.italic = 1;

            }

            if (font.FontTypes.BoldItalic != '' && font.FontTypes.BoldItalic) {

                options.boldItalic = 1;

            }

        }

        return options;

    }

    setCurrentFonts(fonts) {

        if (!fonts) {

            return;

        }

        var _fonts = {};

        for (var i = 0; i < fonts.length; i++) {

            _fonts[fonts[i].name] = {

                FontTypes: {

                    Regular: '',
                    Bold: '',
                    Italic: '',
                    BoldItalic: ''

                },
                miniature: fonts[i].miniature

            }

        }

        this.currentFonts = _fonts;

        for (var key in this.currentFonts) {

            this.addFontFile(key);

        }

    }


    getCurrentFonts() {

        return this.currentFonts;

    }


};
