import { Editor } from './Editor';
import {EditableArea} from './class/editablePlane';
import {Text2} from './class/Text2';
import {Keyboard} from './class/tools/keyboard';

class UserEditor extends Editor{
    editorEvents =  ( e )=>{

        if(e.keyCode === 8){
            if( e.target.nodeName == 'BODY' )
                e.returnValue = false;
        }

        if( e.keyCode === 65 && Keyboard.isCtrl(e) ){

            var editing_id = this.tools.getEditObject();
            var editingObject = this.stage.getObjectById( editing_id );

        }

        var editing_id = this.tools.getEditObject();
        var editingObject = this.stage.getObjectById( editing_id );

        if( editingObject && !editingObject.blocked && userType == 'admin' ){


            if( editingObject instanceof Text2 && editingObject.editMode )
                return;

            if( e.keyCode == '37' ){

                editingObject.x--;

                if( editingObject.mask )
                    editingObject.mask.x--;

                Editor.stage.updateEditingTools( editingObject );

            }else if( e.keyCode == '39' ){

                editingObject.x++;

                if( editingObject.mask )
                    editingObject.mask.x++;

                Editor.stage.updateEditingTools( editingObject );

            }else if( e.keyCode == '38' ){

                editingObject.y--;

                if( editingObject.mask )
                    editingObject.mask.y--;

                Editor.stage.updateEditingTools( editingObject );

            }
            else if( e.keyCode == '40' ){

                editingObject.y++;

                if( editingObject.mask )
                    editingObject.mask.y++;

                Editor.stage.updateEditingTools( editingObject );

            }

            editingObject.dispatchEvent('move');
            Editor.tools.init();

        }

    }

    _polledPagesCounts={};
    checkPagesCountConstraint=({project,projectID,addRemove})=>{
        try {
            if(!this.lastCalculation)
                return false
            if (!project) {
                project = this.userProject.getObj().projects.find((e) => e._id == projectID)
            }
            const projCalc = this.lastCalculation.products.find((e) => {
                return e.typeID === project.typeID && e.formatID === project.formatID
            })

            const pagesCount = this._polledPagesCounts[project._id] || this.userProject.getAllPagesCount();
            const changingPages = 2;//TODO Generalna reguła konfiguracji po ile dodajemy

            if (addRemove === 'ADD') {
                if ((pagesCount + changingPages) > projCalc.pageRanges.maximumPages) {
                    this.template.warningView(`${projCalc.pageRanges.maximumWarning.pl} ${projCalc.pageRanges.maximumPages}`);
                    return false;
                }
                else {
                    this._polledPagesCounts[project._id] = pagesCount + changingPages;
                }
            }

            if (addRemove === 'REMOVE') {
                if ((pagesCount - changingPages) < projCalc.pageRanges.minimumPages) {
                    this.template.warningView(`${projCalc.pageRanges.minimumWarning.pl} ${projCalc.pageRanges.minimumPages}`);
                    return false;
                } else {
                    this._polledPagesCounts[project._id] = pagesCount - changingPages;
                }

            }

            return true;
        }catch(e){
            console.error(e);
            return false;
        }
    }
}

Editor.initEvents =( canvasName )=>{

    var copyBox = document.createElement("textarea");
    copyBox.id = "copyBox";
    document.body.appendChild( copyBox );

    var _this = this;

    $('body').on( 'mousedown', function(e){
        ++_this.mouseDown[e.button];
    });

    $('body').on( 'mouseup', function(e){

        --_this.mouseDown[e.button];
        Editor.stage.stopPageDroping();

        var pages = Editor.stage.getPages();
        for( var p=0; p < pages.length; p++){

            for( var i=0; i < pages[p].proposedImagePositions.length; i++ ){

                pages[p].proposedImagePositions[i].clearHelpers();

            }

        }

    });

    window.addEventListener("resize", function( e ){

        $('#testowy').attr('width', window.innerWidth );
        $('#testowy').attr('height', window.innerHeight-80 );
        $("#toolsBox").css('height', window.innerHeight - 80 );
        $("div#toolsContainer").css('margin-top', ($("#toolsBox").height() - $("div#toolsContainer").height()) /2 );
        $('#pagesListUser').width( window.innerWidth - $('#toolsBox').width() );
        Editor.template.resizeToUserObject();
        // update narzędnika


        //Editor.template.generateViewsPagesThumb();

    });


    document.addEventListener('dragleave', function( e ){

        e.stopPropagation();
        e.preventDefault();



    });


    document.addEventListener('dragenter', function( e ){

        e.stopPropagation();

        e.preventDefault();
        //console.log('DRAGSTART');
        if( !$('#themeImagesDrop').hasClass('visible') )
            $('#themeImagesDrop').addClass('visible');

        var element = document.getElementById("imagesContent");

        if ( $('#image-container-tool_button').hasClass('tool-button active') ){


            if ( !(document.getElementById('imageDrop')) ) {
                Editor.template.createDragArea( element );
            }

        }

    });

    $(document).on('dragexit', function(e) {

        e.stopPropagation();
        $('#themeImagesDrop').removeClass('visible');
        //$('#imageDrop').remove();

    });


    $(document).on('dragleave', function(e) {

        //console.log('dragaleva');
        e.stopPropagation();
        $('#themeImagesDrop').removeClass('visible');
        //$('#imageDrop').remove();


    });


    $(document).on('drop', function(e) {

        e.stopPropagation();
        $('#themeImagesDrop').removeClass('visible');

    });


    document.getElementById( canvasName ).addEventListener("dragexit", function(e){

        e.stopPropagation();
        var pages = Editor.stage.getPages();

        for( var i=0; i<pages.length; i++){

            pages[i].removeHitArea();

        }


    }, false);


    document.getElementById( canvasName ).addEventListener('dragover', function(e){

        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        var arr = [];

        var event = new createjs.Event('dragover');
        event.clientX = e.clientX;
        event.clientY = e.clientY;
        Editor.getStage().dispatchEvent(event);


    }, false);


    document.getElementById( canvasName ).addEventListener('drop', function(e){
        e.preventDefault();

        var obj = [];
        Editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-75, obj );

        var tryProposed = false;

        for( var i=0; i < obj.length; i++){

            if( obj[i] instanceof Editor.ProposedPosition || obj[i] instanceof EditableArea )
                tryProposed = true;

        }


        if( !tryProposed ){

            Editor.handleFileSelect(e, 1);

        }else {
            var event = new createjs.Event('drop');
            event.clientX = e.clientX;
            event.clientY = e.clientY;
            event.dataTransfer = e.dataTransfer;

            Editor.getStage().dispatchEvent(event);
        }

    }, false);


    document.addEventListener("keydown", Editor.editorEvents);

};

export {UserEditor};