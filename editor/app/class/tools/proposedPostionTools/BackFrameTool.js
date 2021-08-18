import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {RANGE} from "../../../Editor";
import RangeSwitchers from "../RangeSwitchers";
import ImagesList from "../ImagesList";

class BackFrameTool extends Component {
    state = {range: RANGE.singleElem, framesList: []}

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.onSwitchChange(this.props.useBackgroundFrame)
        }

        if (!(!prevProps.selected && this.props.selected))
            return

        const userThemePage = userType === 'user' ? this.props.proposedPositionInstance.parentPage.userPage.ThemePageFrom : this.props.proposedPositionInstance.getFirstImportantParent().userPage.ThemePageFrom

        this.props.proposedPositionInstance.editor.webSocketControllers.themePage.getThemeBackgroundFrames(userThemePage, data => {
            this.setState({framesList: data.backgroundFrames.map(f => ({_id: f._id, thumbnail: EDITOR_ENV.staticUrl + f.ProjectImage.thumbnail, helper: {x: f.x, y: f.y, width: f.width, height: f.height}}))})
        })

    }

    onSwitchChange(checked) {
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .forEach(p => {
                p.useBackgroundFrame = checked;
                if (checked) {
                    p.backgroundFrameID=this.frameId
                    this.props.proposedPositionInstance.editor.webSocketControllers.frameObject.get(this.frameId, data => {
                        p.setBackgroundFrame(data);

                    });
                } else {
                    p.removeBackgroundFrame()
                }

                this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                    p.dbID,
                    {
                        backgroundFrame: checked,
                        backgroundFrameID: this.frameId
                    }
                );
            })
    }

    onFrameClick = (frameId) => {
        this.frameId = frameId
        this.onSwitchChange(this.props.useBackgroundFrame)
    }

    render() {
        return (
            !this.props.selected ? null : <div className="toolBoxExtend">

                <div className="toolBoxExtendSection">
                    <div className="toolBoxExtendSection">
                        <div className="title">Włącz tylną ramkę:</div>
                        <label>
                            <input type="checkbox" className="switch"
                                   checked={this.props.useBackgroundFrame}
                                   onChange={(e) => {
                                       this.onSwitchChange(e.target.checked);
                                   }}
                            ></input>
                            <div></div>
                        </label>
                        <RangeSwitchers onClick={(range) => {
                            this.setState({range})
                        }}
                                        labels={['zdjęcia', 'zdjęć', 'zdjęć']}/>
                    </div>
                </div>
                <ImagesList list={this.state.framesList}
                            selected={this.props.backgroundFrameID} onItemSelect={this.onFrameClick} activeClassName='active-framed'/>
            </div>
        )
    }
}

BackFrameTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.proposedPositionToolbar.backFrame,
        useBackgroundFrame: state.proposedPositionBridge.useBackgroundFrame,
        backgroundFrameID: state.proposedPositionBridge.backgroundFrameID
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(BackFrameTool)