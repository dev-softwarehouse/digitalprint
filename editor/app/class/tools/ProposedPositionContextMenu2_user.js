import ContextMenuTools from "../ContextMenuTools";
import {RANGE} from '../../Editor'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {watch, unwatch} from 'melanke-watchjs'
import Toolbar from "./proposedPostionTools/Toolbar";
import ShadowTool from "./proposedPostionTools/ShadowTool";
import BorderTool from "./proposedPostionTools/BorderTool";
import {selectNone} from "../../actions/tools";
import BackFrameTool from "./proposedPostionTools/BackFrameTool";
import EffectsTool from "./proposedPostionTools/EffectsTool";
import MaskTool from "./proposedPostionTools/MaskTool";
import {setProposedPosition} from "./proposedPostionTools/proposedPositionToolsActions";
import ProposedPositionBridge from "./proposedPostionTools/ProposedPositionBridge";

class ProposedPositionContextMenu extends Component {
    state = {left: 0, top: 0}

    componentDidMount() {
        console.log(`Tool for ${this.props.proposedPositionInstance.dbID} objectInside ${this.props.proposedPositionInstance.objectInside?this.props.proposedPositionInstance.objectInside.dbID:''}` )
        this._updateToolsBoxPosition()
        watch(this.props.proposedPositionInstance, ['x', 'y', 'rotation'], this.watchProposed, 0, true)
        this.props.setProposedPosition(this.props.proposedPositionInstance)
    }

    componentWillUnmount() {
        this.props.onUnmount()
        unwatch(this.props.proposedPositionInstance, ['x', 'y', 'rotation'], this.watchProposed)
        this.props.setProposedPosition(null)
    }

    watchProposed = (prop, action, newValue, oldValue) => {
        this._updateToolsBoxPosition()
    }

    _updateToolsBoxPosition() {
        const pos = this.props.proposedPositionInstance.getGlobalPosition()
        const bounds = this.props.proposedPositionInstance.getTransformedBounds()
        const stage = this.props.proposedPositionInstance.editor.getStage()
        this.setState({
            top: pos[1] + 100 + bounds.height / 2 * stage.scaleY,
            left: pos[0] - (bounds.width / 2 * stage.scaleX)
        })
    }

    render() {
        return (
            this.props.proposedPositionInstance.objectInside && <div id="proposed-text-toolsbox" className="tools-box"
                                                                     ref={ref => this.toolsContainer = ref}
                                                                     style={{top: this.state.top, left: this.state.left, width: 488}}>
                <Toolbar proposedPositionInstance={this.props.proposedPositionInstance} advanced={this.props.advanced} ref={ref => {
                    this.toolbar = ref
                }}/>
                <BackFrameTool proposedPositionInstance={this.props.proposedPositionInstance}/>
                <BorderTool proposedPositionInstance={this.props.proposedPositionInstance}/>
                <EffectsTool proposedPositionInstance={this.props.proposedPositionInstance}/>
                <MaskTool proposedPositionInstance={this.props.proposedPositionInstance} style={{width: this.state.width}}/>
                <ShadowTool proposedPositionInstance={this.props.proposedPositionInstance}/>
                <ProposedPositionBridge proposedPositionInstance={this.props.proposedPositionInstance}/>
            </div>
        )
    }
}

ProposedPositionContextMenu.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {
        onUnmount: () => {
            dispatch(selectNone())
        },
        setProposedPosition: (pos) => {
            dispatch(setProposedPosition(pos))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ProposedPositionContextMenu)
