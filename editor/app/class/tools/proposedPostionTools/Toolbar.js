import React, {Component} from 'react'
import {connect} from 'react-redux'
import DeleteTool from "../DeleteTool";
import LayerUpTool from '../LayerUpTool'
import LayerDownTool from '../LayerDownTool'
import {selectBackFrameTool, selectBorderTool, selectEffectsTool, selectMaskTool, selectShadowTool} from "./proposedPositionToolbarActions";
import SizeTool from "./SizeTool";
import RotateTool from "./RotateTool";
import ZoomTool from "./ZoomTool";


class Toolbar extends Component {

    onZoomClick = (e) => {
        e.stopPropagation();
        this.props.proposedPositionInstance.zoom();
    }

    onRotateClick = (e) => {
        e.stopPropagation();
        const pp = this.props.proposedPositionInstance
        pp.editor.webSocketControllers.proposedImage.rotateImageInside(
            pp.editor.userProject.getCurrentView().Pages[0]._id,
            pp.dbID
        );
    }

    onLayerUpClick = (e) => {
        e.stopPropagation();

        const editingObject = this.props.proposedPositionInstance;

        const index = editingObject.parent.getChildIndex(editingObject);

        if (index < (editingObject.parent.children.length - 1)) {

            editingObject.parent.setChildIndex(editingObject, index + 1);
            editingObject.order = index + 1;

            const moveDownObject = editingObject.parent.getChildAt(index);
            moveDownObject.order = index;
            this.props.proposedPositionInstance.editor.webSocketControllers.userPage.moveObjectUp(this.props.proposedPositionInstance.dbID, this.props.proposedPositionInstance.getFirstImportantParent().userPage._id);
        }

    }

    onLayerDownClick = (e) => {
        e.stopPropagation();
        const editingObject = this.props.proposedPositionInstance;

        const index = editingObject.parent.getChildIndex(editingObject);

        if (index > 0) {

            editingObject.parent.setChildIndex(editingObject, index - 1);
            this.props.proposedPositionInstance.editor.webSocketControllers.userPage.moveObjectDown(this.props.proposedPositionInstance.dbID, this.props.proposedPositionInstance.getFirstImportantParent().userPage._id);

        }
        else if (editingObject.parent.name === 'foregroundLayer') {

            const background = editingObject.parent.parent.backgroundLayer;
            editingObject.parent.removeChild(editingObject);

            if (background.children.length > 0)
                background.addChildAt(editingObject, background.children.length - 1);
            else
                background.addChildAt(editingObject, background.children.length);

        }

    }

    onDeleteClick = () => {
        if (this.props.proposedPositionInstance.objectInside) {
            this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.removeObjectInside(
                this.props.proposedPositionInstance.parentPage.userPage._id,
                this.props.proposedPositionInstance.dbID)
        } else if (userType === 'advancedUser') {
            this.props.proposedPositionInstance.editor.webSocketControllers.userPage.removeProposedImage(
                this.props.proposedPositionInstance.getFirstImportantParent().userPage._id,
                this.props.proposedPositionInstance.dbID
            )
        }
    }

    imageToPage = (e) => {
        e.stopPropagation();
        this.props.proposedPositionInstance.editorBitmapInstance.setFullSize2();
        this.props.proposedPositionInstance.editor.tools.init();
    }

    imageToCenter = (e) => {
        e.stopPropagation();
        this.props.proposedPositionInstance.editorBitmapInstance.center();
        this.editor.tools.init();
    }

    render() {
        return (
            <div className="simple editorBitmapTools">
                <ZoomTool onClick={this.onZoomClick}/>
                {this.props.advanced ? <LayerUpTool onClick={this.onLayerUpClick}/> : null}
                {this.props.advanced ? <LayerDownTool onClick={this.onLayerDownClick}/> : null}
                <RotateTool onClick={this.onRotateClick}/>

                <div className={this.props.proposedPositionToolbar.border ? 'button active' : 'button'}
                     id="borderButton" title="Dodaj ramkę"
                     onClick={() => {
                         this.props.onBorderClick(!this.props.proposedPositionToolbar.border)
                     }}
                ></div>

                <div className={this.props.proposedPositionToolbar.backFrame ? 'button active' : 'button'}
                     id="backframeButton" title="Dodaj tylną ramkę"
                     onClick={() => {
                         this.props.onBackFrameClick(!this.props.proposedPositionToolbar.backFrame)
                     }}></div>

                <SizeTool proposedPositionInstance={this.props.proposedPositionInstance}/>

                <div className={this.props.proposedPositionToolbar.shadow ? 'button active' : 'button'}
                     id="shadowButton" title="Dodaj cień"
                     onClick={() => {
                         this.props.onShadowClick(!this.props.proposedPositionToolbar.shadow)
                     }}
                ></div>


                <div className={this.props.proposedPositionToolbar.mask ? 'button active' : 'button'}
                     id="maskButton" title="Dodaj maskę"
                     onClick={() => {
                         this.props.onMaskClick(!this.props.proposedPositionToolbar.mask)
                     }}>
                </div>

                <div className={this.props.proposedPositionToolbar.effects ? 'button active' : 'button'}
                     id="fxButton" title="Dodaj efekty"
                     onClick={() => {
                         this.props.onEffectsClick(!this.props.proposedPositionToolbar.effects)
                     }}>
                </div>
                <DeleteTool onClick={this.onDeleteClick}/>
            </div>
        )
    }
}

Toolbar.propTypes = {}
const mapStateToProps = (state) => {
    return {
        proposedPositionToolbar: state.proposedPositionToolbar
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onBackFrameClick: (select) => {
            dispatch(selectBackFrameTool(select))
        },
        onBorderClick: (select) => {
            dispatch(selectBorderTool(select))
        },
        onEffectsClick: (select) => {
            dispatch(selectEffectsTool(select))
        },
        onMaskClick: (select) => {
            dispatch(selectMaskTool(select))
        },
        onShadowClick: (select) => {
            dispatch(selectShadowTool(select))
        },

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)