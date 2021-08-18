import React from "react";
import _ from "lodash";
import AssetsFolderTree from './assets/AssetFolderTree.js';

class AssetContainer extends React.Component {

    constructor( props ){

        super( props );

        this.state = {
            categories: [],
            modalOpen: false
        }

    }

    openAssets(){

        var state = JSON.parse( JSON.stringify ( this.state ));
        state.modalOpen = true;
        this.setState( state );

    }

    close(){

        var state = JSON.parse( JSON.stringify ( this.state ));
        state.modalOpen = false;
        this.setState( state );

    }

    render (){

        if( this.state.modalOpen ){

            return (
                <div>
                    <div className="modalOverflow">
                        <div className="modalContent">
                            <AssetsFolderTree close={this.close.bind( this )} editor={ this.props.editor }/>
                        </div>
                    </div>
                    <div className="assetsLibrary" onClick={ this.openAssets.bind( this ) }>Assety</div>
                </div>
            )

        }else {
           
            return (

                <div className="assetsLibrary" onClick={ this.openAssets.bind( this ) }>Assety</div>

            );

        }

    }

}

export default AssetContainer;