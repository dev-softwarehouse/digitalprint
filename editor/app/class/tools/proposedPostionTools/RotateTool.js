import React, {Component} from 'react'

export default class RotateTool extends Component {

    render() {
        return (
            <div
                onClick={this.props.onClick}
                className="button" id="rotationButton"></div>
        )
    }
}