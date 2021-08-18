import React from "react";
import _ from "lodash";
import {ProjectNameComponent} from "./ProjectNameComponent";

export default class TopMenu extends React.Component {

    constructor ( props ){

        super( props );
        this.editor = props.editor;

        this.state = {
            price: 0,
            mode: 'simple',
            fullScreen: this.editor.fullScreenMode
        }

        $( document.body ).addClass('simple');

    }

    updateStateParam( param, value ){

        var currentState = JSON.parse( JSON.stringify( this.state ));
        currentState[param] = value;
        this.setState( currentState );

    }

    saveProject(){

        var projectID = this.editor.userProject.getID();
        //TODO Make it working
        /*
        $.get( 'https://api.digitalprint.pro/pdfGenerating/?projectID='+projectID, function( data ){

            alert('Projekt został zapisany, mozesz do niego powórcić w przyszłości');

        }.bind(this));
        */

    }

    updatePrice( price ){

        this.updateStateParam('price', price );

    }

    checkout(){

        var projectID = this.editor.userProject.getID();
        /*
        $.get( 'https://api.digitalprint.pro/pdfGenerating/?projectID='+projectID, function( data ){

        }.bind(this));
        */

        this.editor.services.addToCart();

    }

    placeHolder(){

    }

    toggleFullscreen(){

        var _this = this;

        if( this.state.fullScreen ){

          this.editor.fullScreenOff();
          this.updateStateParam('fullScreen', false );

        }else {

          this.editor.fullScreen().then(
            function(){

              _this.updateStateParam('fullScreen', true );

            }
          );

        }

    }

    showFlipBook( e ){
        e.stopPropagation();
        var pages = this.editor.userProject.getOrderedPages();

        for( var key=0; key< pages.length; key++ ){

            if( pages[key].prev ){

            }else {

                alert('podgląd stron jest jeszcze nie gotowy, spróbuj ponownie za parę sekund');

                return false;
            }

        }

        var cover = this.editor.userProject.getCoverPage();

        for( var key=0; key< cover.length; key++ ){

            if( cover[key].prev ){

            }else {

                alert('podgląd okładki jest jeszcze nie gotowy, spróbuj ponownie za parę sekund');

                return false;
            }

        }
        var flipbookHolder = document.createElement('div');
        flipbookHolder.className = 'flipbook-holder';

        var remove = document.createElement('div');
        remove.className = 'remove-flipbook';
        remove.innerHTML = 'x';

        flipbookHolder.appendChild( remove );

        document.body.appendChild( flipbookHolder );

        var nextPage = document.createElement('div');
        nextPage.className = 'nextPage-flipbook';
        var prevPage = document.createElement('div');
        prevPage.className = 'prevPage-flipbook';

        prevPage.addEventListener('click', function( e ){

            e.stopPropagation();

            $("#flipbook").turn("previous");

        });

        nextPage.addEventListener('click', function( e ){

            e.stopPropagation();

            $("#flipbook").turn("next");

        });

        var html = '<div id="flipbook">';
            if(cover.length>0 && cover[0].prev.length>0){
                html+=`<div class="hard first"><img src="${cover[0].prev[0]}"></div><div class="hard"></div>`;
            }
            html+=''

        var pages = this.editor.userProject.getOrderedPages();
        for( var key=0; key< pages.length; key++ ){

            if( pages[key] && pages[key].prev ){
                for( var i=0; i < pages[key].prev.length; i++ ){
                    html += '<div class=""><img src="'+ pages[key].prev[i] +'"></div>';
                }
            }else {
                html += '<div class="not-loaded"></div>';
            }

        }

        html += '';
        if(cover.length>0 && cover[0].prev.length>0){
            html+=`<div class="hard"></div><div class="hard last"><img src="${cover[0].prev[0]}"></div>`;
        }
        html+='</div>';

        flipbookHolder.innerHTML += html;

        var width = window.innerWidth*0.6;
        var aspect = width/this.editor.userProject.getBookFormat().width;
        var height = this.editor.userProject.getBookFormat().height*aspect;

        if( height > window.innerHeight ){

            height = window.innerHeight * 0.7;
            aspect = height/this.editor.userProject.getBookFormat().height;
            width = this.editor.userProject.getBookFormat().width*aspect;
        }

        flipbookHolder.style.paddingTop = (height-window.innerHeight)/2 + "px";

        $("#flipbook").turn({
            height: height,
            width: width,
            autoCenter: true
        });

        $('.remove-flipbook').on('click', function( e ){

            e.stopPropagation();
            $(this).parent().remove();

        });


        flipbookHolder.appendChild( nextPage );
        flipbookHolder.appendChild( prevPage );

    }

    toggleEditorMode(){

        if( this.editor.userType == 'user' ){

            $( document.body ).addClass('advanced');
            $( document.body ).removeClass('simple');
            this.updateStateParam('mode', 'advanced' );
            this.editor.userType = userType = 'advancedUser';
            //addEditorConfiguration.className = "editor_configuration top_menu_icons";
            this.editor.userProject.redrawView();

        }else {
            $( document.body ).addClass('simple');
            $( document.body ).removeClass('advanced');
            this.updateStateParam('mode', 'simple' );
            this.editor.userType = userType = 'user';
            //addEditorConfiguration.className = "editor_configuration simple top_menu_icons";
            this.editor.userProject.redrawView();

        }

    }

    render(){

        return (
            <div>
                <div className="pencil_tool">
                </div>
                <div id="containerForName">
                    <ProjectNameComponent editor={this.editor} name={this.editor.userProject.getName()}/>
                </div>
                <div className="savecheck_toolbar">
                    <div className="save_tool top_menu_icons" onClick={this.saveProject.bind(this)}>
                    </div>
                    <div className="price_val">
                        {this.state.price}
                    </div>
                    <div className="checkout_button"  onClick={this.checkout.bind(this)}>
                        Dodaj do koszyka
                    </div>
                </div>
                <div className="top_toolbar">
                    <div className={"fullscreen_toggle " + this.state.fullScreen } onClick={this.toggleFullscreen.bind(this)}>
                    </div>
                    <div className={"editor_configuration " +this.state.mode + " top_menu_icons"} onClick={this.toggleEditorMode.bind(this)}>
                    </div>
                    <div className="top_menu_icons getPreview" onClick={this.showFlipBook.bind(this)}>
                    </div>
                </div>
            </div>

        );

    }

}
