import EditorShadow2 from './EditorShadow2';
	/**
	* Klasa reprezentująca obiekt litery w lini tekstu ( TextLine )
	*
	* @class TextLetter
	* @constructor
	*/
	function TextLetter( letter, fontFamily, size, color, lineHeight, regular, italic, context ){

		createjs.Container.call( this );
		this.text = letter;
		//this.font = font;
        this.fontFamily = fontFamily;
		this.size = size;
		this.color = color;
		this.lineHeight = lineHeight;
		this.index = null;
		this.editor = context;
        this.fontType = {

            regular : regular,
            italic  : italic

        };

		this.init();

	};

	var p = TextLetter.prototype = new createjs.Container();

	p.constructor = TextLetter;


	/**
	* Inicjalizacja litery - dodawane sa pola zaznaczenia
	*
	* @method init
	*/
	p.init = function(){

		this.snapToPixel = false;

		var _this = this;
		var fontName = this.editor.fonts.selectFont( this.fontFamily, this.fontType.regular, this.fontType.italic );

		var letter = new createjs.Text( this.text, (this.size*4) + "px " + fontName , this.color );
		letter.scaleX = letter.scaleY = 0.25;

		this.letter = letter;
		//this.letter.snapToPixel = false;
		letter.textBaseline = "alphabetic";

		var bounds = this.letter.getBounds();

		var test = new createjs.Text('y',(this.size*4) + "px " + fontName , this.color );

        this.letter.x = 0;
        this.letter.y = 0;
        var ratio = bounds.height/bounds.width;
		this.letter.width = this.width = bounds.width/4;
		this.letter.height = this.height = this.size;

		letter.cursor = "text";

		//letter.cache(-letter.width/2, -this.size*1.4, letter.width*2, this.size*1.8, 3);

		var selectBox = new createjs.Shape();
		selectBox.visible = false;
		this.selectBox = selectBox;

		this.updateSelectBox();
		this.addChild( selectBox );

		var hitArea = new createjs.Shape();
		hitArea.graphics.f("#000").r( bounds.x, bounds.y-this.size, bounds.width, bounds.height );
		letter.hitArea = hitArea;

		this.addChild( letter );

	};

	/**
	* włącza lub wyłącza italica - w zależnośći od parametru
	*
	* @method italic
    * @param {boolean} param
	*/
    p.italic = function( param ){

        ( param ) ? this.fontType.italic = 1 : this.fontType.italic = 0;

    };


	/**
	* włącza lub wyłącza bolda - w zależnośći od parametru
	*
	* @method bold
    * @param {boolean} param
	*/
    p.bold = function( param ){

        ( param ) ? this.fontType.regular = 0 : this.fontType.regular = 1;

    };


	/**
	* Inicjalizacja litery - dodawane sa pola zaznaczenia
	*
	* @method racalculate
	*/
    p.racalculate = function(){



    };


	/**
	* ustala wysokość lini litery
	*
	* @method setLineHeight
	*/
    p.setLineHeight = function( lineHeight ){

        this.lineHeight = this.height = lineHeight;

    };


	/**
	* Ustala typ czcionki - bold, italic. Operacja ta wymaga przerenderowanie litery i ponowne jej cachowanie.
	*
	* @method setFontType
    * @param {INT} regular 1|0
    * @param {INT} italic 1|0
	*/
    p.setFontType = function( regular, italic ){

        this.fontType.regular = regular;
        this.fontType.italic = italic;

    };


	/**
	* Tworzy cache całego obiektu, razem z literą wewnątrz, zmiana atrybutu litery wymaga wykonania na nowo <b>letterCache</b> i <b>makeCache</b>
	*
	* @method makeCache
	*/
	p.makeCache = function(){

		//this.cache( 0, -200, this.width, 200 +this.size*1.2 );

	};


    /**
	* Tworzy cache litery, nie całego obiektu
	*
	* @method makeLetterCache
	*/
	p.makeLetterCache = function(){

		//return;
		//console.log('%c WCHODZI TUTAJ', 'font-size:20px;');
		//this.letter.cache( 0, -this.size*1.8, this.width*1.8, this.size*2.8, 2 );


	};

    p.toString = function(){

      return "Letter=['" + this.text + "' id="+this.id+"]";

    };


	/**
	* Updateuje literę podanymi wartościami, jeżeli nie ma parametru, funkcja użyje aktualnej wartości dla niego, wykonanie tej metody
    * skutkuje wykonaniem się cachy, nie jesteśmy już zmuszeni do ponownego cachowania.
	*
	* @method updateWith
    * @param {STRING} fontFamily nazwa czcionki
    * @param {INT} size rozmiar czcionki
    * @param {STRING} color Kolor czcionki
	*/
	p.updateWith = function( fontFamily, size, color ){

		this.size = size;
        this.fontFamily = fontFamily; //size + "px " + font + "_regular";
		this.letter.font = this.font = Editor.fonts.selectfont( fontFamily, this.fontType.regular, this.fontType.italic );
		this.letter.color = color;

		this.uncache();
		this.letter.uncache();

		var bounds = this.letter.getBounds();
		this.letter.width = this.width = bounds.width;

		this.letter.hitArea.graphics.f("#000").r( bounds.x, bounds.y, bounds.width, bounds.height );
		this.updateSelectBox();

	};


	/**
	* Zmienia kolor litery
	*
	* @method updateColor
    * @param {STRING} color kolor czcionki
	*/
	p.updateColor = function( color ){

        this.color = color;
		this.letter.color = color;
		this.letter.uncache();
		this.uncache();

		this.makeLetterCache();

	};


    p.update = function(){

		this.letter.color = this.color;
		this.letter.font = this.font = (this.size * 4) + "px " + this.editor.fonts.selectFont( this.fontFamily, this.fontType.regular, this.fontType.italic );//this.size + "px " + this.font + "_regular";
		this.letter.scaleX = this.letter.scaleY = 0.25;

		var bounds = this.letter.getBounds();

        var ratio = bounds.height/bounds.width;
		this.height = this.size;
		this.letter.width = this.width = bounds.width/4;
		this.letter.height = this.height = this.size;
		//this.letter.font = this.font = (this.size) + "px " + this.editor.fonts.selectFont( this.fontFamily, this.fontType.regular, this.fontType.italic );//this.size + "px " + this.font + "_regular";

		//this.letter.hitArea.graphics.f("#000").r( bounds.x, bounds.y, bounds.width, bounds.height );

		this.updateSelectBox();
		/*
        var lineHeight = this.parent.getLineHeight();

        if( this.lineHeight < this.size ){

			if( this.parent.parent.defaultLineHeight != false ){

	            this.parent.setLineHeight( this.size );
	            this.parent.parent.recalculateLinePositions();
	            this.parent.parent._updateShape();
			}

        }
		*/

    };


	/**
	* Zmienia rozmiar pola zaznaczonego,jest konieczne po wykonaniu zmiany wielkości, czionki i wysokości lini ltery
	*
	* @method updateSelectBox
	*/
	p.updateSelectBox = function(){

		var bounds = this.letter.getBounds();

		this.selectBox.graphics.c().f("rgba(255,0,0,0.4)").r( 0, 0-(bounds.height/4)+((bounds.height/4)*0.25), bounds.width/4, bounds.height/4 );

	}


	/**
	* Wyświetla selectBox i tworzy chache całego obiektu
	*
	* @method activeSelect
	*/
	p.activeSelect = function(){

		this.selected = true;
		this.uncache();
		this.selectBox.visible = true;
		this.makeCache();

	};


	/**
	* Chowa selectBox i tworzy chache całego obiektu
	*
	* @method deactiveSelect
	*/
	p.deactiveSelect = function(){

		this.selected = false;
		this.uncache();
		this.selectBox.visible = false;
		this.makeCache();

	};


	/**
	* Ustala index litery
	*
	* @method setIndex
	*/
	p.setIndex = function( index ){

		this.index = index;

	};


	/**
	* Tworzy klon obiektu i zwraca nowo powstały
	*
	* @method clone
    * @return {TextLetter} Sklonowany obiekt
	*/
    p.clone = function(){

        var newLetter = new TextLetter( this.text, this.font, this.size, this.color, this.lineHeight,this.regular,this.italic,this.editor );

        return newLetter;

    };


    p._cloneObject = function(){

    	var object = new TextLetter( this.text, this.fontFamily, this.size, this.color, this.lineHeight,this.regular,this.italic,this.editor );

    	return object;

    };

export {TextLetter};
