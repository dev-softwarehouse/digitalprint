import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {selectBold} from '../../../actions/textToolbar'

class BoldTool extends Component {

    onClickBtn=()=>{
        this.props.onClickSelect(!this.props.selected)
    }

    className() {
        let name = 'button'

        if (this.props.selected)
            name += ' active'

        if(!this.props.textInstance.editor.fonts.getFontFeatures(this.props.fontFamily).bold)
            name += ' disabled'

        return name
    }

    render() {
        return (
            <div id='bold-text' className={this.className()} onClick={this.onClickBtn}></div>
        )
    }

}

BoldTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.textToolbar.bold.selected,
        fontFamily:state.text2Bridge.fontFamily
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onClickSelect: (selected) => {
            dispatch(selectBold(selected))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BoldTool)