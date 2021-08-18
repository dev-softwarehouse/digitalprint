import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {RANGE} from "../../../Editor";
import RangeSwitchers from "../RangeSwitchers";

class BorderTool extends Component {
    state = {range: RANGE.singleElem}

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.onSwitchChange(this.props.border)
            this.changeColor(this.props.proposedPositionInstance.borderColor)
            this.changeWidth(this.props.proposedPositionInstance.borderWidth)
        }

        if (!(!prevProps.selected && this.props.selected))
            return

        $(this.widthInput).spinner({
            min: 0,
            spin: e => {
                this.changeWidth(e.target.value, false)
            },
            change: e => {
                this.changeWidth(e.target.value, true)
            }

        }).val(this.props.proposedPositionInstance.borderWidth)

        $(this.colorInput)
            .val(this.props.proposedPositionInstance.borderColor)
            .colorpicker({
                parts: 'full',
                showOn: 'both',
                buttonColorize: true,
                showNoneButton: true,
                alpha: true,
                color: '#FF0000',
                select: e => {
                    this.changeColor(e.target.value)
                },
                colorFormat: 'RGBA'

            })
    }

    changeWidth(borderWidth, save) {
        borderWidth = parseInt(borderWidth)
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .filter(o => o.objectInside)
            .forEach(editingObject => {
                editingObject.setBorderWidth(borderWidth)
                editingObject.updateSimpleBorder()
                if (save)
                    this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                        editingObject.dbID,
                        {
                            borderWidth
                        }
                    );
            })
    }

    changeColor(borderColor) {
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .filter(o => o.objectInside)
            .forEach(editingObject => {
                editingObject.setBorderColor(borderColor);
                this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                    editingObject.dbID,
                    {
                        borderColor
                    }
                );
            })
    }

    onSwitchChange(displaySimpleBorder) {
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .forEach(editingObject => {
                if (displaySimpleBorder) {
                    editingObject.dropBorder(true);
                    editingObject.setBorderWidth(editingObject.borderWidth);
                    editingObject.updateSimpleBorder(true);
                } else {
                    editingObject.unDropBorder(true);
                }
                this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                    editingObject.dbID,
                    {
                        displaySimpleBorder,
                    }
                );
            })
    }

    render() {
        return (
            !this.props.selected ? null : <div className="toolBoxExtend">
                <div className="toolBoxExtendSection">
                    <div className="title">Włącz ramkę:</div>
                    <label>
                        <input type="checkbox" className="switch"
                               checked={this.props.border}
                               onChange={
                                   (e) => {
                                       this.onSwitchChange(e.target.checked);
                                   }}></input>
                        <div></div>
                    </label>
                    <RangeSwitchers onClick={(range) => {
                        this.setState({range})
                    }}
                                    labels={['zdjęcia', 'zdjęć', 'zdjęć']}/>
                </div>
                <div className="tabelarize tabelarize-center toolBoxExtendSection" style={{width: '100%'}}>
                    <div>
                        <div className='right-align'>Grubość ramki:</div>
                        <div>
                            <input className="spinner ui-spinner-input" ref={ref => this.widthInput = ref}></input>
                        </div>
                        <div className='right-align'>Kolor:</div>
                        <div>
                            <input className="spinner cp-full" ref={ref => this.colorInput = ref}></input>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

BorderTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.proposedPositionToolbar.border,
        border: state.proposedPositionBridge.border
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(BorderTool)