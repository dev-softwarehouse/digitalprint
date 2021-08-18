import React from "react";
import _ from "lodash";
import {UserPage} from "../class/UserPage";

class UserView extends React.Component {

	constructor( props ){

		super( props );
        this.editor = props.editor;
        this.id = props.id;
        this.state = {

            //order: props.order
            pagesValue: props.pagesValue,
            range: props.range,
            image: props.image,
            order: props.order,
            repeatable: props.repeatable
            
        }

	    this.editor.userProject.regenerateSingleViewThumb( this.id );

	}

	click( e ){

        e.stopPropagation();

        if( e.target && e.target.nodeName == "LI" ) {

            this.editor.webSocketControllers.userView.get( this.id, function( data ){
                //this.editor.userProject.updateCurrentViewThumb();
				this.editor.userProject.regenerateSingleViewThumb (  this.id );
                this.editor.userProject.initView( data );

            }.bind( this ));

        }

	}

    remove( e ){
        e.stopPropagation();

        if (this.editor.checkPagesCountConstraint({projectID:this.props.projectID,addRemove:'REMOVE'})){
            if( this.editor.userProject.getCurrentView()._id == this.id ){
                if( this.editor.userProject.isPrevView() ){
                    this.editor.userProject.turnToPreviousView();
                }else if( this.editor.userProject.isNextView() ){
                    this.editor.userProject.turnToNextView();
                }
            }
            this.editor.webSocketControllers.userProject.removeView( this.editor.userProject.getID(), this.props.projectID , this.id );
        }

    }

	render(){

		let data = {
			'data-user-view-id' : this.id,
			'style' : {backgroundImage: 'url('+ this.props.image +')' },
			'className' : 'photoAlbumPageMulti',
			'onClick' : this.click.bind(this)
		};

		if( !this.state.repeatable ){

			data['className'] += " notrepeatable";
            return(
                
                <li {...data} ref={(li) => { this.html = li; }} >
                    <span className="pagesCounter">{this.props.range}</span>
                </li>
    
            );

		}else {
            return(
                
                <li {...data} ref={(li) => { this.html = li; }} >
                    <span className="pagesCounter">{this.props.range}</span>
                    <span className='viewRemover' onClick={this.remove.bind( this )}></span>
                </li>
    
            );

        }

		

	}

}


class UserComplexView extends React.Component {
    
        constructor( props ){
    
            super( props );
            this.editor = props.editor;
            this.projectID = props.projectID;
            this.state = {
                
                product: props.typeID,
                views: _.sortBy( props.views, 'order'),
                productName: props.typeName
        
            }

            //console.log('RERENDEROWANIE STRONY:)');

        }
  
        addNewView( e ){

            if (this.editor.checkPagesCountConstraint({projectID:this.projectID,addRemove:'ADD'})){
                this.editor.webSocketControllers.userProject.addNewView( this.projectID, e.target.getAttribute( 'data-order' ) );
            }
        }

        render(){          


            let viewsToRender = _.sortBy( this.props.views, 'order');

            var range = 0;
            var data = viewsToRender.map( ( elem, index ) => {
                
                let _range = '';
                range +=1;
                if( elem.repeatable ){
                    _range = range + '-' + (range+elem.Pages[0].pageValue-1);
                    range += elem.Pages[0].pageValue-1;

                }else {
                    _range += range;
                }

                return <UserView editor={this.editor} projectID={this.projectID} image={elem.image} repeatable={elem.repeatable} order={elem.order} range={_range} id={elem._id} pagesValue={elem.pagesValue} key={elem._id} />

            });

            var dataWithAddButton = [];

            for( var i=0; i < data.length; i++ ){

                if( data[i].props.repeatable == true || (i == data.length-1 && data.length > 1 ) ){
                    dataWithAddButton.push( <li className='addPage notrepeatable' data-order={i} onClick={ this.addNewView.bind( this ) } key={i}></li> );
                }
                dataWithAddButton.push( data[i] );

            }

            return(
    
                <li className="complexView" data-project-id={ this.projectID }>
                    <span className="product-title">{this.state.productName}</span>
                    <ul>{dataWithAddButton}</ul>
                </li>
    
            );
    
        }
    
    }

export default class UserPagePreview extends React.Component {

	constructor( props ){

		super(props);
		this.state = {
            isComplex: false,
			currentViewsList : []
		}
		this.editor = props.editor;
		props.container.userPagesPreview=this

	}


	removeAllViews(){

		this.setState({currentViewsList:[]});

	}

    addComplexView( typeID, views, typeName, id ){

        var elems = this.state.currentViewsList;

        var obj = {
            views: views,
            typeID: typeID,
            typeName: typeName,
            _id: id
        }

        elems.push( obj );

        var test = elems.slice();
        
        //this.editor.userProject.updatePagesInfo();
        this.setState( {currentViewsList: test, isComplex: true} );

    }

    updateViews( projectID, views ){

        let state = JSON.parse( JSON.stringify( this.state ) );
        
        for( var i=0; i < state.currentViewsList.length;i++ ){

            if( state.currentViewsList[i]._id == projectID )
                state.currentViewsList[i].views = views;

        }

        this.editor.userProject.updatePagesInfo( this.editor.userProject.getCurrentView() );

        this.setState( state );
        this.forceUpdate();
        

    }

	addView( projectID, newView, views ){

        let state = JSON.parse( JSON.stringify( this.state ) );
        
        for( var i=0; i < state.currentViewsList.length;i++ ){

            if( state.currentViewsList[i]._id == projectID )
                state.currentViewsList[i].views = views;

        }

        this.setState( state );
        this.forceUpdate();
        setTimeout( () => {
            this.editor.userProject.regenerateSingleViewThumb( newView._id );
            this.editor.services.calculatePrice();
        }, 1000 );

        this.editor.userProject.updatePagesInfo( this.editor.userProject.getCurrentView() );
	}

    reorderViews( projectID, views ){

        var state = JSON.parse( JSON.stringify( this.state ) );
        
        for( var i=0; i < state.currentViewsList.length;i++ ){

            if( state.currentViewsList[i]._id == projectID )
                state.currentViewsList[i].views = views;

        }

        this.setState( state );
        this.forceUpdate();
        
        this.editor.userProject.updatePagesInfo( this.editor.userProject.getCurrentView() );
        
        return;


    }


	changeViewThumb( viewID, image ){

		var index = this.state.currentViewsList.findIndex( ( element )=>{

			if( element.id == viewID ){
				return true;
			}else {
				return false;
			}

		});

		let elem = this.state.currentViewsList[index];
		elem.image = image;
		let elems = this.state.currentViewsList.slice();
		elems[index] = JSON.parse(JSON.stringify(elem));
		this.setState( { currentViewsList: elems } );

	}

	componentDidMount(){

        var width = 0;

		let _this = this;
    setTimeout( () => {
        
        var width=0;

        var elems = $('#viewsListUser').find('.complexView');
        
        for( var i=0; i < elems.length; i++){

            width += $(elems[i]).outerWidth( true );

        }

        $( '#viewsListUser .complexView' ).sortable({
        	appendTo: document.body,
            containment: "window",
            items: 'li:not(.notrepeatable)',
            stop : function( e, ui ){
                
                e.stopPropagation();
                var sortedObjects = $(this).sortable( "toArray", { attribute : 'data-user-view-id' } );
                var firstSortElemAttribute = sortedObjects[0];
                var childs = this.childNodes;
                var notRepeatableBefore = 0;

                for( var i=1; i < childs.length; i++ ){

                    if( childs[i].getAttribute( 'data-user-view-id' ) == firstSortElemAttribute ){

                        break;

                    }else {
                        notRepeatableBefore++;
                    }

                }

                var sortTable = [];

                for( var i=0; i < sortedObjects.length; i++ ){

                    var sortObject = {

                        viewID : sortedObjects[i],
                        order  : i+1

                    };

                    sortTable.push( sortObject );

                }
                
                var _views = _this.editor.userProject.getViews();
                
                // lokalna aktualizacja orderw, powinna byc po otrzymaniu callbackow...
                for( var i=0; i < sortTable.length; i++ ){

                    var newViewsOrder = sortTable[i];

                    var view = _.find( _views, function( _view ){

                        return ( _view._id == newViewsOrder.viewID );

                    });

                    if( view ){
                        view.order = newViewsOrder.order;
                    }
                    
                }

                _this.editor.userProject.sortViews();
                _this.editor.webSocketControllers.userProject.setViewsOrders( $( this ).attr('data-project-id'), sortTable );
                

            }

        });
        _this.editor.services.calculatePrice();
    }, 1000 );
		

	}

	render(){

        var range = 0;
		var data = this.state.currentViewsList.map( ( elem, index )=>
            {

                return <UserComplexView projectID={elem._id} editor={this.editor} views={elem.views} key={elem.typeID} typeID={elem.typeID} typeName={elem.typeName} />
            
            }
		);

        this.editor.services.calculatePrice();

		return(

			<ul id="viewsListUser" className="viewsListUser">
				{data}
			</ul>

		);

	}

}