import React, {Component} from 'react'

export default class LayerDownTool extends Component {

    render() {
        return (
            <div className="button" id="layerDownButton" onClick={this.props.onClick}></div>
        )
    }
}
