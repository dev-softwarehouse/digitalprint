
	var lettersCodes = {

		'32' : ' ',
		'48' : '0',
		'49' : '1',
		'50' : '2',
		'51' : '3',
		'52' : '4',
		'53' : '5',
		'54' : '6',
		'55' : '7',
		'56' : '8',
		'57' : '9',
		'59' : ';',
		'61' : '=',
		'65' : 'a',
		'66' : 'b',
		'67' : 'c',
		'68' : 'd',
		'69' : 'e',
		'70' : 'f',
		'71' : 'g',
		'72' : 'h',
		'73' : 'i',
		'74' : 'j',
		'75' : 'k',
		'76' : 'l',
		'77' : 'm',
		'78' : 'n',
		'79' : 'o',
		'80' : 'p',
		'81' : 'q',
		'82' : 'r',
		'83' : 's',
		'84' : 't',
		'85' : 'u',
		'86' : 'v',
		'87' : 'w',
		'88' : 'x',
		'89' : 'y',
		'90' : 'z',
		'96' : '0',
		'97' : '1',
		'98' : '2',
		'99' : '3',
		'100' : '4',
		'101' : '5',
		'102' : '6',
		'103' : '7',
		'104' : '8',
		'105' : '9',
		'106' : '*',
		'107' : '+',
		'109' : '-',
		'110' : '.',
		'111' : '/',
		'173': '-',
		'186': ';',
		'187': '=',
		'188': ',',
		'189': '-',
		'190': '.',
		'191': '/',
		'192': '`',
		'219': '[',
		'220': '\\',
		'221': ']',
		'222': '\'',

	};

	var keyboardKeys = {

		'alt-e' : 'ę',
		'alt-o' : 'ó',
		'alt-a' : 'ą',
		'alt-s' : 'ś',
		'alt-l' : 'ł',
		'alt-z' : 'ż',
		'alt-x' : 'ź',
		'alt-c' : 'ć',
		'alt-n' : 'ń',
		'shift-alt-e' : 'Ę',
		'shift-alt-o' : 'Ó',
		'shift-alt-a' : 'Ą',
		'shift-alt-s' : 'Ś',
		'shift-alt-l' : 'Ł',
		'shift-alt-z' : 'Ż',
		'shift-alt-x' : 'Ź',
		'shift-alt-c' : 'Ć',
		'shift-alt-n' : 'Ń',
		'shift-`' : '~',
		'shift-1' : '!',
		'shift-2' : '@',
		'shift-3' : '#',
		'shift-4' : '$',
		'shift-5' : '%',
		'shift-6' : '^',
		'shift-7' : '&',
		'shift-8' : '*',
		'shift-9' : '(',
		'shift-0' : ')',
		'shift--' : '_',
		'shift-=' : '+',
		'shift-\\' : '|',
		'shift-q' : 'Q',
		'shift-w' : 'W',
		'shift-e' : 'E',
		'shift-r' : 'R',
		'shift-t' : 'T',
		'shift-y' : 'Y',
		'shift-u' : 'U',
		'shift-i' : 'I',
		'shift-o' : 'O',
		'shift-p' : 'P',
		'shift-[' : '{',
		'shift-]' : '}',
		'shift-a' : 'A',
		'shift-s' : 'S',
		'shift-d' : 'D',
		'shift-f' : 'F',
		'shift-g' : 'G',
		'shift-h' : 'H',
		'shift-j' : 'J',
		'shift-k' : 'K',
		'shift-l' : 'L',
		'shift-;' : ':',
		"shift-'" : '"',
		'shift-z' : 'Z',
		'shift-x' : 'X',
		'shift-c' : 'C',
		'shift-v' : 'V',
		'shift-b' : 'B',
		'shift-n' : 'N',
		'shift-m' : 'M',
		'shift-,' : '<',
		'shift-.' : '>',
		'shift-/' : '?',
		'shift-`' : '~'

	};

	export class Keyboard {

		constructor(){
			
			this.trackObject = null;
			this.alt = false;
			this.shift = false;
	        this.isPressed = false;

            document.body.addEventListener('keydown', function( e ){

                if( e.keyCode == 225 || e.keyCode == 18 ){

                    e.preventDefault();
                    this.alt = true;

                }

            }.bind(this));

            document.body.addEventListener('keyup', function( e ){

                if( e.keyCode == 225 || e.keyCode == 18 ){

                    e.preventDefault();
                    this.alt = false;

                }

            }.bind( this ));

            document.body.addEventListener('keydown', function( e ){

                if( e.keyCode == 16 ){

                    e.preventDefault();
                    this.shift = true;

                }

            }.bind( this ));

            document.body.addEventListener('keyup', function( e ){

                if( e.keyCode == 16 ){

                    e.preventDefault();
                    this.shift = false;

                }

            }.bind( this ));


			window.addEventListener('blur',()=>{
                this.alt = this.shift = false;
			});

		}
		
		func ( e ){
if(e.target.nodeName==='BODY')
			this.trackObject._keyboardInput( e );

		}
		
		append( type, trackObject ){

			this.binder = this.func.bind( this );
			this.trackObject = trackObject;
			document.body.addEventListener( type, this.binder );

		}

		detach( type ){
			
			document.body.removeEventListener( type, this.binder );

		}

		getChar ( e ){

            console.log(`keyCode ${e.keyCode} key ${e.key} alt ${this.alt} shift ${this.shift} capslock ${e.getModifierState('CapsLock')}`);
            /* Maybe later with web standards drift
            const allChars = {...keyboardKeys, ...lettersCodes}
            return Object.values(allChars).some((v) => v === e.key) ? e.key : '';*/
			var charCode = '';

			if( this.shift )
				charCode += 'shift';

			//getModifierState is not supported in some
            try {
                if (e.getModifierState('CapsLock')){
                	if(charCode==='shift')
                		charCode='';
                	else
                		charCode='shift';
				}

            } catch (e) {
                console.warn('Unsupported getModifierState')
            }

			if( this.alt && charCode.length == 0){
				charCode += 'alt';
			}
			else if( this.alt ){
				charCode += '-alt';
			}
			const letter=lettersCodes[ e.keyCode ];
			if( charCode.length )
				charCode += "-" + letter;
			else 
				charCode = letter;
			return keyboardKeys[charCode] || letter;

		}
		static isCtrl(e){
			let isCtrl=e.ctrlKey;

            if(!isCtrl){
            	try{
                isCtrl=e.getModifierState('Meta');
                }catch(e){
            		console.warn('Problem with e.getModifierState');
				}
			}
			return isCtrl;
		}

	};