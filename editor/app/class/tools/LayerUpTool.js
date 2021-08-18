import React, {Component} from 'react'

export default class LayerUpTool extends Component {

    render() {
        return (
            <div className="button" id="layerUpButton" onClick={this.props.onClick}></div>
        )

    }
}
