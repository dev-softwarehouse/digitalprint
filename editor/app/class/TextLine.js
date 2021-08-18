import {TextLetter} from './TextLetter';

    /**
	* Klasa reprezentująca linię tekstu w obiekcit Text2
	*
	* @class TextLine
	* @constructor
	*/
	export function TextLine( x, y, lineHeight ){

        var _this = this;

		createjs.Container.call( this );

		this.x = x;
		this.y = y;
		this.lineHeight = lineHeight;
		this.maxWidth = 400;
        this.minWidth = 100;
		this.lineWidth = 0;
		this.letters = 0;
		this.lettersObjects = [];
		this.linesInfo_Object = {};
		this.lines = 1;
		this.textParent = null;
		this.makeCache();
		this.userFontSizeLineHeightAspect = null;
		this.defaultFontAspect = 1.5;
        this.align = "left";
        this.words = [];
        this.cursorMap = [];
        this.realLineWidth = 0;
        this.init();
		this.debug();
	};


	var p = TextLine.prototype = new createjs.Container();

	p.constructor = TextLine;


	/**
	* Tworzy cache całej lini
	*
	* @method makeCache
	*/
	p.makeCache = function(){

		this.cache( 0, 0, this.maxWidth, this.lineHeight* this.lines, 2 );

	};

	p.debug = function(){

		var graphics = new createjs.Graphics().beginFill("#ff0000").drawRect(0, 0, 100, 100);
	    var shape = new createjs.Shape(graphics);

	};

    p.init = function(){

        this.generateCursorMap();

    };

    p.getLetterPositionInfo = function( letter ){



    };
	/**
	* Aktualizacja obszaru 'aktywnego'
	*
	* @method updateBoundsAndHitArea
	*/
    p.updateBoundsAndHitArea = function(){

        this.hitArea.graphics.c().f("red").dr( 0, 0, this.textParent.trueWidth-(this.textParent.padding.left+this.textParent.padding.right), this.lineHeight * this.lines );
        this.setBounds( 0, 0, this.textParent.trueWidth-(this.textParent.padding.left+this.textParent.padding.right), this.lineHeight * this.lines );
        this.maxWidth = this.textParent.trueWidth-(this.textParent.padding.left+this.textParent.padding.right);

    };


    p.getClickedLetterPart = function( x, y, letter ){

		var localPos = this.globalToLocal( x, y);

        if( localPos.x < letter.x +letter.width/2  ){

            return 0;

        }
        else {

            return 1;

        }

    };


	/**
	* Inicjalizacja obszaru 'aktywnego'
	*
	* @method initHitArea
	*/
    p.initHitArea = function(){

        var _this = this;
        this.lineHeight = this.lineHeight;
        // ZMIENIONO Z : this.lineHeight = this.parent.lineHeight;
        var hitArea = new createjs.Shape();
        hitArea.graphics.f("red").dr( 0, 0, this.parent.trueWidth, this.lineHeight );
        this.hitArea = hitArea;
        this.setBounds( 0, 0, this.parent.trueWidth, this.lineHeight );

        this.addEventListener('pressup', function(){

            if( !_this.parent._selectionMode ){

                _this.parent.selection.stopLine = null;
                _this.parent.selection.lastLetter = null;
                _this.parent.displaySelectedLetter();

            }

        });

        this.complexRecalculate();

    };

	/**
	* Przelicza pozycje liter, należy używać podczas zmiany rozmiaru liter wewnątrz oraz zmiany maksymalnej szerokości.<br>
    * Gdy użyty jest cache obowiązkowe też jest wywołanie <b>uncache</b> i <b>makeCache</b>
	*
	* @method _recalculateAllLines
	*/
	p._recalculateAllLines = function(){


        this.realLineWidth = 0;

		for( var line in this.linesInfo_Object ){

			this.recalculateLine( line );

		}

		this._lineHeightAll = this.lines * this.lineHeight;

	};


	/**
	* Dodaje wcześnioej utworzoną literę do lini tekstu. Po tej operacji należy wykonać metodę <b>_recalculateAllLines</b>
	*
	* @method addCreatedLetter
    * @param letter TextLetter Litera która ma zostać dołączona do ciągu znakóœ
    * @patam position Int Miejsce w którym ma zostać dodana litera, jeżeli nie jest podana to litera zostanie dodana na samym koncu ciągu
	*/
	p.addCreatedLetter = function( letter, position ){


        if( position !== undefined ){

            this.addChildAt( letter, position );
            this.lineWidth += letter.width;
            this.letters++;
            this.lettersObjects.push( letter );

        }
        else{

            this.addChild( letter );
            letter.x = this.lineWidth;
            this.lineWidth += letter.width;
            this.letters++;
            this.lettersObjects.push( letter );

        }

        letter.setLineHeight( this.lineHeight );

        /*
        var _this = this;

        var letter = new Editor.TextLetter( letter, font, size, color, this.lineHeight, this.parent._currentFontType.regular, this.parent._currentFontType.italic );

        var bounds = this.getBounds();

        letter.x = this.lineWidth;

        this.lineWidth += letter.width;

        this.updateBoundsAndHitArea();

        if( position != undefined )
            this.addChildAt( letter, position );
        else
            this.addChild( letter );

        this.letters++;
        this.lettersObjects.push( letter );

        this.linesInfo();
        this.complexRecalculate();
        return letter;
        */

	};


	/**
	* W sytuacji gdy linia nie posiada liter, staje się ona klikalna na całej długości, po kliknięciu kursor powinien się ustawić na początku lini dając możliwość wpisania ciagu znaków
	*
	* @method makeSelectable
    */
    p.makeSelectable = function(){

        var hitArea = new createjs.Shape();

    };


    p.removeAllLetters = function(){

        for( var i=0; i < this.lettersObjects.length; i++ ){

            this.removeChild( this.lettersObjects[i] );

        }

        this.lettersObjects = [];
        this.letters = 0;

    };

	p.findLetterInCursorMap = function( letter ){

        for( var i=0; i < this.cursorMap.length; i++){

            if( this.cursorMap[i].letter == letter ){
                return i;
            }

        }

        return null;

	}


	/**
	* Usuwa podaną literę.<b>Po tej operacji należy wywołać funkcję _recalculateAllLines</b>
	*
	* @method removeLetter
    * @param {letter} TextLetter Litera która ma zostać usunieta z ciagu
    */
	p.removeLetter = function( letter ){

        if( !letter ){
            return null;
        }

		this.letters--;

		var indexOf = this.lettersObjects.indexOf(letter);

		var newArray_1 = this.lettersObjects.slice( 0, indexOf );
		var newArray_2 = this.lettersObjects.slice(indexOf+1, this.lettersObjects.length );

		this.lettersObjects = newArray_1.concat( newArray_2 );

		this.removeChild( letter );

        if( this.letters == 0 ){



        }

		return letter;

	};


	p.reorderLetters = function(){

		var newOrder = [];

		for( var i=0; i < this.letters; i++ ){

			newOrder.push( this.getchildAt(i) );

		}

	};


    /**
    * Usuwa ciąg liter. <b>Po tej operacji należy wywołać funkcję _recalculateAllLines</b>
    *
    * @method removeLetters
    * @param {int} from pozycja od której zaczyna się usuwanie liter
    * @param {int} to Pozycja na któ©ej konczy sie usuwanie "<="
    * @return { TextLetter }
    */
	p.removeLetters = function( from, to ){

		if( !to )
			to = this.letters;

		var letters = [];

		for( var i=from; i < to; i++ ){

			var child = this.getChildAt( from );
			letters.push( child );
			this.removeLetter( child );

		}

		return letters;

	}


    /**
	* Zwraca nalbliższą literę z konkretnej lini mapy kursora
	*
	* @method getClosestLetterInLineFromCursorMap
    * @param {int} lineNumber Numer lini, która ma zostać przeszukana
    * @param {int} x pozycja x
    * @param {int} y Pozycja y
    */
    p.getClosestLetterInLineFromCursorMap = function( lineNumber, x, y ){

        var letters = [];

        for( var i = 0; i <this.cursorMap[lineNumber].length; i++ ){

            var letter = this.cursorMap[lineNumber][i].letter;

            if( letters.indexOf( letter ) < 0 ){
                letters.push( letter );
            }

        }

        for( var i=0; i<letters.length; i++){

            var letter = letters[i];

            if( letter.x >= x  && letter.x + letter.width <= x  ){

                return letter;

            }

        }

        if( x > letters[letters.length-1].x ){
            return letters[letters.length];
        }
        else {
            return letters[0];
        }

    };


	/**
	* Zwraca nalbliższą literę podanym kordynatom
	*
	* @method getClosestLetter
    * @param {int} x pozycja x
    * @param {int} y Pozycja y
    */
	p.getClosestLetter = function( x, y ){

		var localPos = this.globalToLocal( x, y);

        for( var i=0; i < this.cursorMap.length; i++){

            var lineNumber = i;

            if( (i+1) * this.lineHeight > localPos.y ){

                break;

            }

        }

		var bounds = this.getTransformedBounds();

        if( this.letters == 0 ){
            return null;
        }

		if( localPos.y < bounds.y ){

			if( localPos.y < bounds.y ){

				var info = this.linesInfo_Object[ 1 ];

			}
			else {
				var info = this.linesInfo_Object[ this.lines ];
			}

			for( var i=info.firstLetter; i<=info.lastLetter; i++){

				var child = this.getChildAt( i );

				if( localPos.x > child.x ){
					if(  localPos.x < child.x+child.width ){

						return i;

					}
				}

			}

			return info.lastLetter;

		}

		for( var i=0; i< this.letters; i++ ){

			var child = this.getChildAt(i);

			if( localPos.x > child.x &&  localPos.x < child.x+child.width){
				if( localPos.y >= child.y && localPos.y < child.y + child.height  ){

					return i;

				}
			}

		}

		var line_y = this.getConcatenatedMatrix().ty;
		var line_x = this.getConcatenatedMatrix().tx;
		var line_height = this.getBounds().height;
		var line_width = this.getBounds().width;

		if( pos[0] > line_x + line_width && ( pos[1] > line_y ) ){

			return this.letters-1;

		}

        if( localPos.y > (bounds.y + bounds.height) ){

            if( localPos.x > (bounds.x + bounds.width) ){

                return this.linesInfo_Object[ this.lines ].lastLetter;

            }
            else if( localPos.x < bounds.x ){

                return this.linesInfo_Object[ this.lines ].firstLetter;

            }
            else {

                var info = this.linesInfo_Object[ this.lines ];

                for( var i=info.firstLetter; i<=info.lastLetter; i++){

                    var child = this.getChildAt( i );

                    if( localPos.x > child.x ){
                        if(  localPos.x < child.x+child.width ){

                            return i;

                        }
                    }

                }

            }



        }

	};


	/**
	* Przelicza pozycję liter w konkretnej lini
	*
	* @method recalculateLine
    * @param {INt} line pozycja lini która ma zostać przeliczona
    */
	p.recalculateLine = function( line ){

        if( this.linesInfo_Object[line] === null ){

            return false;

        }

		var firstChildIndex = this.linesInfo_Object[line].firstLetter;
		var lastChildIndex = this.linesInfo_Object[line].lastLetter;

		var width = 0;
        var letterCount = 0;

        this.linesInfo_Object[line].linewidth = 0;

		for( var i=firstChildIndex; i <= lastChildIndex; i++ ){

            var child = this.getChildAt( i );
			child.x = width;
			child.y = (line) * this.lineHeight;
            letterCount++;
			width += child.width;
            this.realLineWidth += child.width;
            this.linesInfo_Object[line].linewidth += child.width;

		}

        var verticalPadding = this.textParent.padding.left + this.textParent.padding.right;

        if( this.align == "center" ){

            var restWidth = (this.maxWidth - width)/2;

            for( var i=firstChildIndex; i <= lastChildIndex; i++ ){

                var child = this.getChildAt( i );
                child.x += restWidth;

            }

        }
        else if( this.align == "right" ){

            var restWidth = this.maxWidth - width;

            for( var i=firstChildIndex; i <= lastChildIndex; i++ ){

                var child = this.getChildAt( i );
                child.x += restWidth;

            }

        }
        else if( this.align == "justify"){

            var restWidth = (this.maxWidth  - width)/(letterCount-1);

            var rest = restWidth;
            var first = true;

            for( var i=firstChildIndex; i <= lastChildIndex; i++ ){

                var child = this.getChildAt( i );

                if( !first ){

                    child.x += restWidth;
                    restWidth += rest;

                }

                first = false;

            }

        }

		//rturn childIndex;
	};


	/**
	* Przelicza pozycję liter w konkretnej lini
	*
	* @method recalculateLine
    * @param {INt} line pozycja lini która ma zostać przeliczona
    */
	p.setMaxWidth = function( width ){

		this.maxWidth = width;

	};


	/**
	* Zwraca numer lini w której znajduje się litera
	*
	* @method getLetterLine
    * @param {INT} letterPosition pozycja litery
    */
    p.getLetterLine = function( letterPosition ){

        for( var i=1; i <= this.lines; i++ ){

            if( letterPosition >= this.linesInfo_Object[i].firstLetter && letterPosition <= this.linesInfo_Object[i].lastLetter )
                return i;

        }

    };



    p.getLetterPositionAtLine = function( line, letter ){

        if( 0 >= letter )
            return this.linesInfo_Object[line].firstLetter;
        else if( this.linesInfo_Object[line].lastLetter - this.linesInfo_Object[line].firstLetter <= letter )
            return this.linesInfo_Object[line].lastLetter;
        else
            return this.linesInfo_Object[line].firstLetter+letter;

    };


	/**
	* Zwraca litere która jest nad podama
	*
	* @method getLetterOnLetter
    * @param {INT} letterPosition pozycja litery, względem której ma zostać otrzymana druga
    * @return {INT} pozycja litery nad
    */
    p.getLetterOnLetter = function( letterPosition ){

        var line_id = this.getLetterLine( letterPosition );


        if( line_id == 1 ){

            return false;

        }
        else {

            var pos = letterPosition - this.linesInfo_Object[line_id].firstLetter + this.linesInfo_Object[line_id-1].firstLetter;

            return pos;

        }

    };


	/**
	* Generuje mape pozycji kursora dla konkrentej instancji TextLine
	*
	* @method generateCursorMap
     * this.cursorMap=[{ pos : 0, letter : null, line : this, x : 0, y : 0 },...]
    */
    p.generateCursorMap = function(){

        var tab = [];
        var pos = 0;

        if( this.letters == 0 ){

            if( this.align == 'left' || this.align == 'justify'){

                var position = { pos : 0, letter : null, line : this, x : 0, y : this.lineHeight };
                tab.push( position );
                this.cursorMap = tab;

            }else if( this.align == 'center' ){

                var position = { pos : 0, letter : null, line : this, x : this.x + this.maxWidth/2, y :this.lineHeight };
                tab.push( position );
                this.cursorMap = tab;

            }else if( this.align == 'right' ){

                var position = { pos : 0, letter : null, line : this, x : this.maxWidth, y : this.lineHeight };
                tab.push( position );
                this.cursorMap = tab;

            }

            return true;

        }

        for( var key in this.linesInfo_Object ){

            for( var i=this.linesInfo_Object[key].firstLetter; i <= this.linesInfo_Object[key].lastLetter; i++ ){

                var letter =  this.getChildAt(i);

                // tutaj jest wystarczajace podac na jakiej jest literze, a kursor sobie powienien to policzyc
                tab.push( { pos : pos, letter : letter, line : this, x : letter.x, y : letter.y } );
                tab.push( { pos : pos, letter : letter, line : this, x : letter.x+letter.width, y : letter.y } );
                pos++;

            }

        }

        this.cursorMap = tab;

    };


	/**
	* Zwraca litere która jest pod podaną
	*
	* @method getLetterUnderLetter
    * @param {INT} letterPosition pozycja litery, względem której ma zostać otrzymana druga
    * @return {INT} pozycja litery pod
    */
    p.getLetterUnderLetter = function( letterPosition ){

        var line_id = this.getLetterLine( letterPosition );

        if( line_id == this.lines ){

            return false;

        }
        else {

            var pos =   letterPosition - this.linesInfo_Object[line_id].firstLetter + this.linesInfo_Object[line_id+1].firstLetter;

            if( pos > this.linesInfo_Object[line_id+1].lastLetter )
                return this.linesInfo_Object[line_id+1].lastLetter;

            return pos;

        }

    };


	/**
	* Kompleksowa rekalkulacja lini, wykonuje następujące funkcje:<br>
    *<ul>
    *<li>linesInfo</li>
    *<li>_recalculateAllLines</li>
    *</li>generateCursorMap</li>
    *</ul>
	*
	* @method complexRecalculate
    * @return {Object}  x - maksymalna szerokość lini, y - aktualna wyokość całego obiektu
    */
	p.complexRecalculate = function(){

		this.linesInfo();

		this._recalculateAllLines();

        this.generateCursorMap();

		return	{

			x : this.maxWidth,
			y : this.lineHeight * this.lines

		};

	};


    /**
    * Rozbija ciąg znaków na słowa i przekzauje je atrybutowi words dla konkretnej instancji TextLine
	*
	* @method getWords
    */
    p.getWords = function(){

        this.words = [];

        var word = {

            text    : "",
            width   : 0,
            letters : []

        };

        for( var i=0; i < this.letters; i++ ){

            var letter = this.getChildAt( i );

            if( letter.text == " " ){

                if( word.text.length > 0 ){
                    this.words.push( $.extend( true, {}, word ) );

                    var word = Object.create({

                        letters : [],
                        text    : "",
                        width   : 0

                    });
                }

                word.letters.push( letter );
                word.text = letter.text;
                word.width = letter.width;

                this.words.push( word );

                var word = Object.create( {

                    letters : [],
                    text    : "",
                    width   : 0

                } );

            }
            else {

                word.letters.push( letter );
                word.text += letter.text;
                word.width += letter.width;

            }

        }

        if( word.text.length > 0 )
            this.words.push(  word  );

        return this.words;

    };


    /**
    * Generuje informacje o lini, sprawdza na ile lini będzie podzielony obiekt przy aktualnej maksymalnej szerokości
	*
	* @method linesInfo
    * @return {Object}
    */
	p.linesInfo = function(){

		this.linesInfo_Object = {};
		var lineWidth = 0;
		var height = 1;
		var childIndex = 0;
        var wordWidth = 0;

        if( this.letters == 0 ){

            this.lines = height;

            this.linesInfo_Object[height] = null;

        }



		while( childIndex < this.letters ){

            var word = [];
            wordWidth = 0;

            if( !this.linesInfo_Object[height] )
                this.linesInfo_Object[height] = { firstLetter : childIndex };

            var child = this.getChildAt( childIndex );

            if( child.text == ' ' ){

                word.push( child );
                wordWidth += child.width;

                if( lineWidth + wordWidth < this.maxWidth ){

                    lineWidth += wordWidth;
                    this.linesInfo_Object[height].lastLetter = childIndex;

                }else {

                    lineWidth = 0;
                    childIndex = this.getChildIndex( word[0] ) -1;
                    this.linesInfo_Object[height].lastLetter = childIndex;
                    //this.linesInfo_Object[height].linewidth = lineWidth;

                    if( this.linesInfo_Object[height].lastLetter == this.linesInfo_Object[height].firstLetter ){

                        childIndex++;
                    }
                    height++;

                }

            }else {

                while( childIndex < this.letters && child.text != " " ){

                    word.push( child );
                    wordWidth += child.width;
                    childIndex++;
                    child = this.getChildAt( childIndex );

                }

                if( lineWidth + wordWidth < this.maxWidth ){

                    lineWidth += wordWidth;
                    this.linesInfo_Object[height].lastLetter = childIndex-1;
                    //this.linesInfo_Object[height].linewidth = lineWidth;

                    if( child ){

                        if( child.text == " " ){

                            lineWidth += child.width;
                            this.linesInfo_Object[height].lastLetter = childIndex;
                            //his.linesInfo_Object[height].linewidth = lineWidth;

                        }

                    }

                }
                else {

                    if( wordWidth > this.maxWidth ){

                        if( lineWidth + word[0].width < this.maxWidth ){

                            for( var i=0; i < word.length; i++ ){

                                if( lineWidth + word[i].width < this.maxWidth ){

                                    lineWidth +=  word[i].width;
                                    this.linesInfo_Object[height].lastLetter = this.getChildIndex( word[i] );
                                    //this.linesInfo_Object[height].linewidth = lineWidth;

                                }
                                else {

                                    childIndex = this.getChildIndex( word[i] )-1;
                                    i = word.length;
                                }

                            }

                        } else {

                            lineWidth = 0;

                            childIndex = this.getChildIndex( word[0] )-1;
                            this.linesInfo_Object[height].lastLetter = childIndex;
                            //this.linesInfo_Object[height].linewidth = lineWidth;
                            height++;


                        }

                    }
                    else {

                        lineWidth = 0;
                        childIndex = this.getChildIndex( word[0] ) -1;
                        this.linesInfo_Object[height].lastLetter = childIndex;
                        //this.linesInfo_Object[height].linewidth = lineWidth;

                        if( this.linesInfo_Object[height].lastLetter == this.linesInfo_Object[height].firstLetter ){
                            childIndex++;
                        }
                        height++;

                    }

                }

            }



			childIndex++;

		}

		this.lines = height;
		return this.linesInfo_Object;

	};

	p.getBiggestLetterInLine = function( lineOrder ){

		var biggest = 0;

		for( var line in this.linesInfo_Object ){

			var l = this.linesInfo_Object[lineOrder];

			for( var i=this.linesInfo_Object[lineOrder].firstLetter; i <= this.linesInfo_Object[lineOrder].lastLetter; i++  ){
				
				var letter = this.children[i];
				if( letter.letter ){
					var aspectratio = letter.letter.getMeasuredHeight()/letter.letter.font.split('px')[0];
					if( biggest < letter.height*aspectratio ){

						biggest = letter.height*aspectratio;

					}
				}

			}

		}

		return biggest;

	}

	p.getBiggestLetters = function(){

		var biggestLineHeight = 0;
		var letters = [];

		for( var i=0; i < this.lettersObjects.length; i++ ){

            if( this.lettersObjects[i].size > biggestLineHeight ){
				biggestLineHeight = this.lettersObjects[i].size;
				letters = [];
				letters.push( this.lettersObjects[i] );
			}else if( this.lettersObjects[i].size == biggestLineHeight ) {
				letters.push( this.lettersObjects[i] );
			}

        }

		return letters;

	};

	/**
	* Ustawia wysokość lini i liter do niej należących
	*
	* @method setLineHeight
	*/
    p.setLineHeight = function( lineHeight ){


		//lineHeight = lineHeight*0.37;
        this.lineHeight = lineHeight;

        for( var i=0; i < this.lettersObjects.length; i++ ){

            this.lettersObjects[i].setLineHeight( lineHeight );

        }

    };


	/**
	* Sprawdza wszystkie litery w danej lini i wybiera największą, ustalając wysokość lini na jej podstawie
	*
	* @method checkLineHeight
	*/
    p.getLineHeight = function(){

        var bigestLetter = this.children[0];

        if( !bigestLetter )
            return this.parent.toolBox.getSizeValue();

        for( var i=1; i < this.children.length; i++ ){

            if( this.children[i].lineHeight > bigestLetter.lineHeight )
                bigestLetter = this.children[i];

        }

        return bigestLetter.lineHeight;

    };


	/**
	* Sprawdza wszystkie litery w danej lini i wybiera największą, ustalając wysokość lini na jej podstawie
	*
	* @method setParentText
	*/
	p.setParentText = function( parent, order ){

		this.textParent = parent;
		this.lineOrder  = order;

	};


	/**
	* Zwraca literę na konkrentej pozycji ( nie na podstawie cursorMap)
	*
	* @method getLetterByPosition
    * @param {int} position Pozycja litery
    * @return TextLetter
	*/
	p.getLetterByPosition = function( position ){

		var letter = this.getChildAt( position );

		return letter;

	};


	p.toString = function(){

		return "[TextLine id=" +this.id+" childrens="+this.children.length+"]";

	};


	/**
	* Dodaje utworzoną literę do instancji TextLine
	*
	* @method addLetter
    * @param {TextLetter} letter Instancja TextLetter
    * @param {Int} position Pozycja na której ma zostać dodana litera, jezeli nie jest podana, literta zostanie dodana na samym koncu ciagu znakow
	*/
    p.addLetter = function( letter, position ){

        this.lineWidth += letter.width;
        this.addChild( letter );

        letter.setLineHeight( this.lineHeight );

        this.letters++;
        this.lettersObjects.push( letter );

    };


    p._cloneObject = function( textParent ){

        var object = new TextLine( this.x, this.y, this.lineHeight );

        return object;

    };


	/**
	* Dodaje i tworzy w locie nową literę do ciągu tekstowego
	*
	* @method addFullEditableLetter
    * @param {string} letter jednoliterowy tekst
    * @param {string}  font czcionka jaka ma zsotać użyta
    * @param {INT} size rozmiar tekstu
    * @param {string} kolor tekstu
    * @param {position} pozycja na której ma zostać dołączona litera
	*/
	p.addFullEditableLetter = function( letter, font, size, color, position ){

		var _this = this;

		var letter = new TextLetter( letter, font, size, color, this.lineHeight, this.textParent._currentFontType.regular, this.textParent._currentFontType.italic, this.textParent.editor );

		var bounds = this.getBounds();

		letter.x = this.lineWidth;

		this.lineWidth += letter.width;



		if( position != undefined ){

			this.addChildAt( letter, position );
		}
		else {
			this.addChild( letter );

		}



		this.letters++;
		this.lettersObjects.push( letter );


        this.linesInfo();
        this.complexRecalculate();
		this.updateBoundsAndHitArea();
        return letter;

	};
