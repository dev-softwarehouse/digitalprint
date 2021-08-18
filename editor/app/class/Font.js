
this.Editor = this.Editor || {};

(function(){

    function Font( fontName, parentDisplayer ){

        this.parentDisplayer = parentDisplayer;
        this.uploaded = false;
        this.init( fontName );

    }

    var p = Font.prototype;

    p.init = function( fontname ){

        this.fontName = fontname;
        this.createTester();
        this.fakeFontWidth = this.tester.offsetWidth;
        this.fakeFontHeight = this.tester.offsetHeight;
        this.makeTest();

    }

    p.createTester = function(){

        this.tester = document.createElement('div');
        this.tester.style.fontFamily = '_fakeFont_';
        this.tester.className = 'fontTester';
        this.tester.innerHTML = 'abcdefghijklmnoprstwuABCDEFGHIJKLMNOPRESTWUMMMWWWIIILLL,./;[]=-0987654321`~!@#$%^&*()_+}|":?><ąśćźłóęĄŚĆŁÓŻĘńŃ';
        document.body.appendChild( this.tester );

    }

    p.makeTest = function(){

        this.tester.style.fontFamily = this.fontName + ', _fakeFont_';

        this.testInterval = setInterval( function(){

            if( this.tester.offsetWidth != this.tester.fakeFontWidth || this.tester.offsetHeight != this.tester.fakeFontHeight  ){

                clearInterval( this.testInterval );

            }

        }.bind( this ), 100 );

    }
   
	Editor.Font = Font;

})();