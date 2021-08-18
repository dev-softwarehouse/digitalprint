import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {spinnerHandler} from './Toolbar'
import {RANGE} from '../../../Editor'
import RangeSwitchers from '../RangeSwitchers'

class MariginTools extends Component {

    state = {range: RANGE.singleElem}

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.changeMargin(this.props.textInstance.padding.left, true, true)
            this.changeMargin(this.props.textInstance.padding.top, false, true)
        }
        if (!prevProps.selected && this.props.selected) {
            $(this.horizontalPaddingInput).val(this.props.textInstance.padding.left)
            $(this.verticalPaddingInput).val(this.props.textInstance.padding.top)

            const handler = {
                ...spinnerHandler, ...{
                    min: 0,
                    spin: (e, ui) => {

                        const value = parseInt(ui.value);
                        this.changeMargin(value, e.target === this.horizontalPaddingInput)

                    },
                    stop: (e) => {

                        const value = parseInt(e.target.value);
                        this.changeMargin(value, e.target === this.horizontalPaddingInput, true)
                        this.props.textInstance.clearPadding();
                    }
                }
            }

            $(this.horizontalPaddingInput).spinner(handler)
            $(this.verticalPaddingInput).spinner(handler)
        }

    }

    changeMargin(value, horizontal, save = false) {
        this.props.textInstance.editor.getEditableObjectsByType(this.state.range, 'Text2')
            .forEach((t) => {
                if (horizontal)
                    t.setHorizontalPadding(value);
                else
                    t.setVerticalPadding(value);

                if (t.usedTextID === this.props.textInstance.usedTextID) {
                    this.props.textInstance.drawPadding();
                    this.props.textInstance.setCursor(this.props.textInstance._cursorPosition);
                }

                t.updateText({

                    lettersPositions: true,
                    linesPosition: true,
                    maximizeFontSize: true

                });
                if (save) {
                    if (t.dbID === this.props.textInstance.dbID)
                        this.props.textInstance.clearPadding();
                    if (t.isProposedPosition) {
                        this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(t.dbID, horizontal ? {horizontalPadding: value} : {verticalPadding: value});
                    } else {
                        if (horizontal)
                            this.props.textInstance.editor.webSocketControllers.editorText.setHorizontalPadding(t.usedTextID, value);
                        else
                            this.props.textInstance.editor.webSocketControllers.editorText.setVerticalPadding(t.usedTextID, value);
                    }

                }
            });
    }

    render() {
        return (
            !this.props.selected ? null :
                <div className="toolBoxExtend">
                    <div className="toolBoxExtendSection">
                        <div className="title">Ustawienia marginesów:</div>
                        <RangeSwitchers onClick={(range) => {
                            this.setState({range})
                        }}/>
                    </div>
                    <div className="toolBoxExtendSection">
                        <div className="tabelarize tabelarize-center">
                            <div>
                                <div>
                                    <div className="infoIcon horizontalPadding"></div>
                                </div>
                                <div>
                                    <input id="horizontalPadding" className="spinner ui-spinner-input" ref={(ref) => {
                                        this.horizontalPaddingInput = ref
                                    }}></input>
                                </div>
                                <div>
                                    <div className="infoIcon verticalPadding"></div>
                                </div>
                                <div>
                                    <input id="verticalPadding" className="spinner ui-spinner-input" ref={(ref) => {
                                        this.verticalPaddingInput = ref
                                    }}></input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        )
    }
}

MariginTools.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.textToolbar.paddings.selected
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(MariginTools)