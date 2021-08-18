import React from 'react';


export default class AssetFolder extends React.Component {

    constructor( props ){

        super( props );

        this.state = {
            title: props.title,
            id: props.id
        }

    }

    changeCurrentFolder( data ){

        this.props.updateCurrentFolder( data );

    }

    openFolder () {

        this.props.editor.webSocketControllers.adminAssets.getFolder(
            {
                parent: this.props.id
            }, 
            (data) => {
                
                this.changeCurrentFolder( data );

            }
        );
  
    }

    remove( e ){

        e.stopPropagation();
        this.props.remove( e.target.getAttribute( 'data-id' ) );

    }

    render () {
        return(
            <div className="assetFolder" onClick={this.openFolder.bind(this)}>
                <div className="assetRemover" onClick={ this.remove.bind(this)} data-id={this.state.id}>x</div>
                { this.state.title }                
            </div>
        )

    }

}