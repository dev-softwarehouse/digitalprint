import React, {Component} from 'react'

export default class DeleteTool extends Component {

    render() {
        return (
            <div
                onClick={this.props.onClick}
                className="button" id="removeImage"></div>
        )
    }
}