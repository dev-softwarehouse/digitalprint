import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

class ZoomTool extends Component {

    render() {
        return <div id="zoom-text" className={this.props.selected ? 'button active' : 'button'} onClick={this.props.onClick}></div>;
    }
}

ZoomTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.proposedPositionToolbar.zoom
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(ZoomTool)