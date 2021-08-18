import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {selectItalic} from "../../../actions/textToolbar";

class ItalicTool extends Component {

    className() {
        let name = 'button'

        if (this.props.selected)
            name += ' active'

        if(!this.props.textInstance.editor.fonts.getFontFeatures(this.props.fontFamily).italic)
            name += ' disabled'

        return name
    }

    onClick = () => {
        const nextSelected = !this.props.selected
        this.props.onClickSelect(nextSelected)
        if (nextSelected) {
            this.props.textInstance._currentFontType.italic = 1;
            this.props.textInstance.updateText({}, true)
        } else {
            this.props.textInstance._currentFontType.italic = 0;
            this.props.textInstance.updateText({}, true)
        }
    }

    render() {
        return (
            <div id="italic-text" className={this.className()} onClick={this.onClick}></div>
        )
    }
}

ItalicTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.textToolbar.italic.selected,
        fontFamily:state.text2Bridge.fontFamily
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onClickSelect: (selected) => {
            dispatch(selectItalic(selected))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ItalicTool)