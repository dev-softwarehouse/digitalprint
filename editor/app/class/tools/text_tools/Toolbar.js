import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {selectZoom, selectAlignTool, selectShadowTool, selectBackgroundTool, selectPaddingTool} from '../../../actions/textToolbar'
import FontColorTool from "./FontColorTool";
import FontFamilyTool from "./FontFamilyTool";
import AutoSizeTool from "./AutoSizeTool";
import {startCase} from 'lodash';
import FontSizeTool from "./FontSizeTool";
import DeleteTool from "../DeleteTool";
import BoldTool from "./BoldTool";
import ItalicTool from "./ItalicTool";
import LayerUpTool from '../LayerUpTool'
import LayerDownTool from '../LayerDownTool'

export const RANGE = {singleElem: 'singleElem', allElemInPage: 'allElemInPage', allElemInProject: 'allElemInProject'}

export const spinnerHandler = {
    start: (e) => {
        e.stopPropagation()
    }
}

class Toolbar extends Component {

    alignClassName() {
        let name = 'buttonBig toolbox'
        name += ` align${startCase(this.props.horizontalAlign)}`
        if (this.props.toolbar.align.selected)
            name += ' active'
        return name
    }

    onLayerUpClick = (e) => {
        e.stopPropagation()
        const index = this.props.textInstance.parent.getChildIndex(this.props.textInstance)
        if (index < this.props.textInstance.parent.children.length - 1) {
            this.props.textInstance.parent.setChildIndex(this.props.textInstance, index + 1)
            this.props.textInstance.order = index + 1
            this.props.textInstance.parent.getChildAt(index).order = index
        }
        this.props.textInstance.editor.webSocketControllers.userPage.moveObjectUp(this.props.textInstance.dbID, this.props.textInstance.getFirstImportantParent().userPage._id)
    }

    onLayerDownClick = (e) => {
        e.stopPropagation()
        const index = this.props.textInstance.parent.getChildIndex(this.props.textInstance)
        if (index > 0) {
            this.props.textInstance.parent.setChildIndex(this.props.textInstance, index - 1)
        }
        else {

            if (this.props.textInstance.parent.name === 'foregroundLayer') {

                const background = this.props.textInstance.parent.parent.backgroundLayer
                this.props.textInstance.parent.removeChild(this.props.textInstance)

                if (background.children.length > 0)
                    background.addChildAt(this.props.textInstance, background.children.length - 1)
                else
                    background.addChildAt(this.props.textInstance, background.children.length)

            }

        }
        this.props.textInstance.editor.webSocketControllers.userPage.moveObjectDown(this.props.textInstance.dbID, this.props.textInstance.getFirstImportantParent().userPage._id)
    }

    onDeleteClick = () => {
        this.props.textInstance.editor.webSocketControllers.userPage.removeUserText(this.props.textInstance.editor.userProject.getCurrentView().Pages[0]._id, this.props.textInstance.dbID)
    }

    renderMin() {
        return <React.Fragment>
            <LayerUpTool onClick={this.onLayerUpClick}/>
            <LayerDownTool onClick={this.onLayerDownClick}/>
        </React.Fragment>
    }

    renderExtended() {
        return <React.Fragment>
            <div id="zoom-text" className={this.props.toolbar.zoom.selected ? 'button active' : 'button'} onClick={() => {
                this.props.onZoomClick(!this.props.toolbar.zoom.selected)
            }}></div>
            <FontFamilyTool textInstance={this.props.textInstance}/>
            <FontColorTool textInstance={this.props.textInstance}/>
            <AutoSizeTool textInstance={this.props.textInstance}/>
            <FontSizeTool textInstance={this.props.textInstance}/>
            <BoldTool textInstance={this.props.textInstance}/>
            <ItalicTool textInstance={this.props.textInstance}/>
            <div className={this.alignClassName()}
                 onClick={() => {
                     this.props.onAlignClick(!this.props.toolbar.align.selected)
                 }}
                 id="alignToolsContainer">
                <div className="currentIcon"></div>
            </div>
            <div className={this.props.toolbar.shadow.selected ? 'button active' : 'button'} id="shadowTextTool" onClick={() => {
                this.props.onShadowClick(!this.props.toolbar.shadow.selected)
            }}></div>
            <div className={this.props.toolbar.background.selected ? 'button active' : 'button'}
                 onClick={() => {
                     this.props.onBackgroundClick(!this.props.toolbar.background.selected)
                 }}
                 id="backgroundToolsContainer">
                <div className="currentIcon"></div>
                <div className="optionsBox"></div>
            </div>
            <div className={this.props.toolbar.paddings.selected ? 'button active' : 'button'}
                 id="paddingToolsContainer"
                 onClick={() => {
                     this.props.onPaddingClick(!this.props.toolbar.paddings.selected)
                 }}></div>
        </React.Fragment>
    }

    render() {
        return (
            <div className="simple editorBitmapTools">
                {this.props.advanced ? this.renderMin() : this.renderExtended()}
                <DeleteTool onClick={this.onDeleteClick}/>
            </div>
        )
    }
}

Toolbar.propTypes = {}
const mapStateToProps = (state) => {
    return {
        toolbar: state.textToolbar,
        horizontalAlign: state.text2Bridge.horizontalAlign
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onZoomClick: (selected) => {
            dispatch(selectZoom(selected))
        },
        onAlignClick: (selected) => {
            dispatch(selectAlignTool(selected))
        },
        onShadowClick: (selected) => {
            dispatch(selectShadowTool(selected))
        },
        onBackgroundClick: (selected) => {
            dispatch(selectBackgroundTool(selected))
        },
        onPaddingClick: (selected) => {
            dispatch(selectPaddingTool(selected))
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)