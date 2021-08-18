import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {RANGE} from "../../../Editor";
import RangeSwitchers from "../RangeSwitchers";
import ImagesList from "../ImagesList";

class MaskTool extends Component {
    state = {range: RANGE.singleElem, framesList: []}

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.onSwitchChange(this.props.maskFilter!=null)
        }

        if (!(!prevProps.selected && this.props.selected))
            return
        this.maskId=this.props.maskFilter
        this.setState({framesList: this.props.proposedPositionInstance.editor.userProject.getMasks().map(f => ({_id: f._id, thumbnail: EDITOR_ENV.staticUrl + f.thumbnail, helper: {x: f.x, y: f.y, width: f.width, height: f.height}}))})
    }

    onSwitchChange(checked) {
        const props = {maskFilter: checked ? this.maskId : null}
        const maskAsset = this.props.proposedPositionInstance.editor.userProject.findMaskById(this.maskId)
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .forEach(editingObject => {
                    if (checked) {
                        if (maskAsset) {
                            editingObject.addImageAlphaFilter(maskAsset)
                        }
                    }
                    else {
                        editingObject.removeAlphaMask()
                    }
                    this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                        editingObject.dbID, props
                    )
                }
            )
    }

    onFrameClick = (maskId) => {
        this.maskId = maskId
        this.onSwitchChange(true)
    }

    render() {
        return (
            !this.props.selected ? null : <div className="toolBoxExtend">
                <div className="toolBoxExtendSection">
                    <div className="title">Zastosuj maskę:</div>
                    <label>
                        <input type="checkbox" className="switch"
                               checked={this.props.maskFilter!=null}
                               onChange={(e) => {
                                   this.onSwitchChange(e.target.checked)
                               }}></input>
                        <div></div>
                    </label>
                    <RangeSwitchers onClick={(range) => {
                        this.setState({range})
                    }}
                                    labels={['zdjęcia', 'zdjęć', 'zdjęć']}/>
                </div>
                <ImagesList list={this.state.framesList} selected={this.props.maskFilter} onItemSelect={this.onFrameClick} activeClassName='active-framed'/>
            </div>
        )
    }
}

MaskTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.proposedPositionToolbar.mask,
        maskFilter:state.proposedPositionBridge.maskFilter
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(MaskTool)