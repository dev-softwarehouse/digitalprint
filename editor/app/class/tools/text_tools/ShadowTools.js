import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import RangeSwitchers from '../RangeSwitchers'
import {RANGE} from './Toolbar'


class ShadowTools extends Component {
    state={range : RANGE.singleElem}

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(prevState.range===RANGE.singleElem && (this.state.range===RANGE.allElemInPage || this.state.range===RANGE.allElemInProject)){
            this.onOffDropShadow(this.props.textInstance._dropShadow)
            this.props.changeTextProperty('shadow',this.state.range,'shadowOffsetX', this.props.textInstance.shadowOffsetX, true)
            this.props.changeTextProperty('shadow',this.state.range,'shadowOffsetY', this.props.textInstance.shadowOffsetY, true)
            this.props.changeTextProperty('shadow',this.state.range,'shadowColor', this.props.textInstance.shadowColor, true)
            this.props.changeTextProperty('shadow',this.state.range,'shadowBlur', this.props.textInstance.shadowBlur, true)
            //this.props.textInstance.editor.userProject.getCurrentView()
        }

        if (!(!prevProps.selected && this.props.selected))
            return

        const object = this.props.textInstance;
        const _this = this

        const offsetRange = 50;

        $(this.shadowColor).val(object.shadowColor).colorpicker({

            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: false,
            alpha: true,
            stop: function (e) {
                _this.props.changeTextProperty('shadow',_this.state.range,'shadowColor', e.target.value, true)
            },
            select: function (e) {
                _this.props.changeTextProperty('shadow',_this.state.range,'shadowColor', e.target.value, false)
            },

            colorFormat: 'RGBA'

        });

        $(this.shadowBlurInputUser).spinner({

            min: 0,

            spin: function (e) {

                _this.props.changeTextProperty('shadow',_this.state.range,'shadowBlur', e.target.value, false)
            },
            change: function (e) {

                _this.props.changeTextProperty('shadow',_this.state.range,'shadowBlur', e.target.value, true)

            }

        }).val(object.shadowBlur);

        $(this.shadowOffsetXInputUser).spinner({

            min: -offsetRange,
            max: offsetRange,

            spin: function (e) {

                _this.props.changeTextProperty('shadow',_this.state.range,'shadowOffsetX', e.target.value, false)

            },
            change: function (e) {

                _this.props.changeTextProperty('shadow',_this.state.range,'shadowOffsetX', e.target.value, true)

            }

        }).val(object.shadowOffsetX);


        $(this.shadowOffsetYInputUser).spinner({

            min: -offsetRange,
            max: offsetRange,

            spin: function (e) {

                _this.props.changeTextProperty('shadow',_this.state.range,'shadowOffsetY', e.target.value, false)

            },
            change: function (e) {

                _this.props.changeTextProperty('shadow',_this.state.range,'shadowOffsetY', e.target.value, true)

            }

        }).val(object.shadowOffsetY);
    }

    onOffDropShadow(value) {
        if (this.state.range === RANGE.singleElem) {

            if (value) {

                const editingObject = this.props.textInstance.editor.stage.getObjectById(this.props.textInstance.editor.tools.getEditObject());

                editingObject.dropShadow();

                this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                    editingObject.dbID,
                    {
                        dropShadow: true
                    }
                );

            } else {

                const editingObject = this.props.textInstance.editor.stage.getObjectById(this.props.textInstance.editor.tools.getEditObject());

                editingObject.unDropShadow();

                this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                    editingObject.dbID,
                    {
                        dropShadow: false
                    }
                );

            }

        } else if (this.state.range === RANGE.allElemInPage) {

            this.props.textInstance.editor.getEditableObjectsByType(RANGE.allElemInPage, 'Text2')
                .forEach((e) => {

                    if (value) {
                        e.dropShadow();
                    } else {
                        e.unDropShadow();
                    }
                    this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                        e.dbID,
                        {
                            dropShadow: value
                        }
                    );
                });

        } else if (this.state.range === RANGE.allElemInProject) {
            this.props.textInstance.editor.getEditableObjectsByType(RANGE.allElemInPage, 'Text2')
                .forEach((e) => {

                    if (value) {
                        e.dropShadow();
                    } else {
                        e.unDropShadow();
                    }
                });

            this.props.textInstance.editor.userProject.getObj().projects.forEach((p) => {
                this.props.textInstance.editor.webSocketControllers.userProject.setSettingsForAllProposedTexts(p._id, {dropShadow: value});
            });

        }
        this.forceUpdate()
    }


    render() {
        return (
            !this.props.selected ? null : <div className="toolBoxExtend">
                <div className="toolBoxExtendSection">
                    <div className="title">Włącz cień:</div>
                    <label>
                        <input type="checkbox" className="switch"
                               checked={this.props.textInstance._dropShadow}
                               onChange={(e) => {
                                   this.onOffDropShadow(e.target.checked)
                               }}></input>
                        <div></div>
                    </label>
                    <RangeSwitchers onClick={(range) => {
                        this.setState({range})
                    }}/>
                </div>
                <div className="tabelarize tabelarize-center toolBoxExtendSection" style={{width:'100%'}}>
                    <div>
                        <div className='right-align'>Przesunięcie X:</div>
                        <div>
                            <input className="spinner ui-spinner-input"
                                   ref={(ref) => {
                                       this.shadowOffsetXInputUser = ref
                                   }}></input>
                        </div>

                        <div className='right-align'>
                            Kolor cienia:
                        </div>
                        <div>
                            <input id="borderColor" className="spinner cp-full"
                                   ref={(ref) => {
                                       this.shadowColor = ref
                                   }}
                            ></input>
                        </div>
                    </div>

                    <div>
                        <div className='right-align'>Przesunięcie Y:</div>
                        <div>
                            <input
                                className="spinner ui-spinner-input"
                                ref={(ref) => {
                                    this.shadowOffsetYInputUser = ref
                                }}
                            ></input>
                        </div>

                        <div className='right-align'>Rozmycie cienia:</div>
                        <div>
                            <input className="spinner ui-spinner-input"
                                   ref={(ref) => {
                                       this.shadowBlurInputUser = ref
                                   }}></input>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ShadowTools.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.textToolbar.shadow.selected
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(ShadowTools)