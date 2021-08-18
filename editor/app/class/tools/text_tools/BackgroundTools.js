import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {adaptPickerColor} from '../textTools_user2'
import {RANGE} from '../../../Editor'
import RangeSwitchers from '../RangeSwitchers'

class BackgroundTools extends Component {

    state = {range: RANGE.singleElem}

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.onSwitchChange(this.props.textInstance.showBackground,true)
            this.onAlphaChange(this.props.textInstance.backgroundShape.alpha,true)
            this.onColorChange(this.props.textInstance.backgroundColor,true)
        }
        if (!(!prevProps.selected && this.props.selected))
            return

        $(this.alphaSlider).slider({

            value: this.props.textInstance.getBackgroundAlpha(),
            min: 0,
            max: 1,
            step: 0.05,
            slide: (e, ui) => {
                this.onAlphaChange(ui.value)
            },

            stop: (e) => {
                this.onAlphaChange($(this.alphaSlider).slider("value"), true)
            }
        })

        $(this.colorInput).val(this.props.textInstance.backgroundColor).colorpicker({

            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: true,
            alpha: true,
            select: (e) => {
                e.stopPropagation();
                this.onColorChange(e.target.value,true)
            },
            colorFormat: 'RGBA'

        })
    }

    onSwitchChange(checked) {
        this.props.textInstance.editor.getEditableObjectsByType(this.state.range, 'Text2')
            .forEach(t=>{
                t.showBackground = checked
                this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(t.dbID, {showBackground: checked});

                if (checked) {
                    t.displayBackground();
                } else {
                    t.hideBackground();
                }
            })

        this.forceUpdate()
    }

    onAlphaChange(value, save) {
        this.props.textInstance.editor.getEditableObjectsByType(this.state.range, 'Text2')
            .forEach(t=>{
                t.setBackgroundAlpha(value);
                if (save)
                    t.editor.webSocketControllers.proposedText.setAttributes(t.dbID, {backgroundOpacity: value});

            })
    }

    onColorChange(value, save) {
        const backgroundColor = adaptPickerColor(value);
        this.props.textInstance.editor.getEditableObjectsByType(this.state.range, 'Text2')
            .forEach(t=>{
                t.setBackgroundColor(this.props.textInstance.editor.rgb2hex(backgroundColor));
                if (save) {
                    if (t.isProposedPosition) {
                        this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(t.dbID, {backgroundColor: backgroundColor});
                    } else {
                        this.props.textInstance.editor.webSocketControllers.proposedText.setBackgroundColor(t.usedTextID, backgroundColor);
                    }
                }
            })
    }

    render() {
        return (
            !this.props.selected ? null :
                <div className="toolBoxExtend">
                    <div className="toolBoxExtendSection">
                        <div className="title">Włącz tło:</div>
                        <label>
                            <input type="checkbox" className="switch"
                                   checked={this.props.textInstance.showBackground}
                                   onChange={(e) => {
                                       this.onSwitchChange(e.target.checked);
                                   }}></input>
                            <div></div>
                        </label>
                        <RangeSwitchers onClick={(range) => {
                            this.setState({range})
                        }}/>
                    </div>
                    <div className="toolBoxExtendSection" style={{width: '100%'}}>
                        <div className='tabelarize tabelarize-center' style={{width: '50%'}}>
                            <div>
                                <div className='right-align'>Przezroczystość:</div>
                                <div>
                                    <div id="backgroundAlphaSlider"
                                         ref={(ref) => this.alphaSlider = ref}>
                                        <a className="ui-slider-handle ui-state-default ui-corner-all" href="#"></a>
                                    </div>
                                </div>
                                <div className='right-align'>Kolor:</div>
                                <div>
                                    <input id="backgroundColor" className="spinner cp-full " ref={(ref) => this.colorInput = ref}></input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        )
    }
}

BackgroundTools.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.textToolbar.background.selected
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(BackgroundTools)