import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {selectAutoSize} from '../../../actions/textToolbar'

class AutoSizeTool extends Component {

    onAutoClick=()=>{
        this.props.textInstance.autoSize = !this.props.textInstance.autoSize;
        this.props.selectAutoSize(this.props.textInstance.autoSize)
        this.props.textInstance.updateText({}, true);
    }

    className(){
        let name='button autosize-font'
        if(this.props.selected)
            name+=' active'
        return name
    }
    render() {
        return (
            <div className={this.className()} onClick={this.onAutoClick}></div>
        )
    }
}

AutoSizeTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected:state.textToolbar.autoSize.selected
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        selectAutoSize:(select)=>{
            dispatch(selectAutoSize(select))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AutoSizeTool)