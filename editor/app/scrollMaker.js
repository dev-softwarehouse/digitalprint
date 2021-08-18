var scrollMaker = (function ( ) {        

	var createTinyScrollElements = function( element ){

        var ScrollContainer =  document.createElement('DIV');

    	// --- Stworzenie scorllbara || ubranie w funkcje generowanie takiego szablonu
        var ScrollBar = document.createElement("DIV");
        ScrollBar.className = "scrollbar";
        

        var Scroll = document.createElement("DIV");
        Scroll.className = "track";

        var ScrollThumb = document.createElement("DIV");
        ScrollThumb.className = "thumb";

        var ScrollEnd = document.createElement("DIV");
        ScrollEnd.className = "end";

        var ScrollViewport = document.createElement("DIV");
        ScrollViewport.className = "viewport";

        var  ScrollOverview = document.createElement("DIV");
        ScrollOverview.className = "overview";        

        ScrollBar.appendChild( Scroll );
        Scroll.appendChild( ScrollThumb );
        ScrollThumb.appendChild( ScrollEnd );

        ScrollViewport.appendChild( ScrollOverview );
        ScrollOverview.appendChild( element );
        ScrollContainer.appendChild( ScrollBar );
        ScrollContainer.appendChild( ScrollViewport );
        // --- scroll zostal juz uworzony

        return {

            scrollObject : ScrollContainer,
            viewport : ScrollViewport,
            overview : ScrollOverview

        };


    };



    function init( element, height ){

      
        var parent = element.parentNode;
        var tinyScroll = createTinyScrollElements( element );

        parent.appendChild( tinyScroll.scrollObject );

        $(tinyScroll.viewport).css( "height", height );
        $(tinyScroll.scrollObject).tinyscrollbar();
        
        
        window.addEventListener('resize' , function(){
              //update narzędnika
            
      
            $('#testowy').attr('width', window.innerWidth );
            $('#testowy').attr('height', window.innerHeight );

            $("#toolsBox").css('height', window.innerHeight - 80 );
            $("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );

            // update narzędnika

            var viewport = $(element);

            $(tinyScroll.viewport).css( 'height', $('#toolsContent').height() - 60 );
            //console.log(viewport);
            

            var viewport = $(tinyScroll.scrollObject).data("plugin_tinyscrollbar");
            viewport.update();

            Editor.stage.updateRulers();

                    
        });

        $('#testowy').attr('width', window.innerWidth );
        $('#testowy').attr('height', window.innerHeight );

        $("#toolsBox").css('height', window.innerHeight - 80 );
        $("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );

        // update narzędnika

        var viewport = $(element);

        $(tinyScroll.viewport).css( 'height', $('#toolsContent').height() - 60 );
        //console.log(viewport);
        

        var viewport = $(tinyScroll.scrollObject).data("plugin_tinyscrollbar");
        viewport.update();
        

        Editor.stage.updateRulers();
    

    }

          

    return {

        createTinyScrollElements : createTinyScrollElements,
        init : init,  

    }

       
})();
