import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {RANGE} from "../../../Editor";
import RangeSwitchers from "../RangeSwitchers";

class ShadowTool extends Component {
    state = {range: RANGE.singleElem}

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.onSwitchChange(this.props.shadow)
            this.changeShadowProperty('shadowOffsetX', this.props.proposedPositionInstance.shadowOffsetX, true)
            this.changeShadowProperty('shadowOffsetY', this.props.proposedPositionInstance.shadowOffsetY, true)
            this.changeShadowProperty('shadowColor', this.props.proposedPositionInstance.shadowColor, true)
            this.changeShadowProperty('shadowBlur', this.props.proposedPositionInstance.shadowBlur, true)
        }

        if (!(!prevProps.selected && this.props.selected))
            return

        const object = this.props.proposedPositionInstance;

        const offsetRange = 50;

        $(this.shadowColor).val(object.shadowColor).colorpicker({

            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: false,
            alpha: true,
            stop:  (e) =>{
                this.changeShadowProperty('shadowColor', e.target.value, true)
            },
            select: (e)=> {
                this.changeShadowProperty('shadowColor', e.target.value, true)
            },

            colorFormat: 'RGBA'

        });

        $(this.shadowBlurInputUser).spinner({

            min: 0,

            spin: (e)=> {

                this.changeShadowProperty('shadowBlur', e.target.value, true)
            },
            change: (e)=> {

                this.changeShadowProperty('shadowBlur', e.target.value, true)

            }

        }).val(object.shadowBlur);

        $(this.shadowOffsetXInputUser).spinner({

            min: -offsetRange,
            max: offsetRange,

            spin: (e)=> {

                this.changeShadowProperty('shadowOffsetX', e.target.value, true)

            },
            change: (e)=> {

                this.changeShadowProperty('shadowOffsetX', e.target.value, true)

            }

        }).val(object.shadowOffsetX);


        $(this.shadowOffsetYInputUser).spinner({

            min: -offsetRange,
            max: offsetRange,

            spin: (e)=> {

                this.changeShadowProperty('shadowOffsetY', e.target.value, true)

            },
            change: (e)=> {

                this.changeShadowProperty('shadowOffsetY', e.target.value, true)

            }

        }).val(object.shadowOffsetY);
    }

    onSwitchChange(checked) {
        const props = {dropShadow: checked}
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .forEach(editingObject => {
                    if (checked)
                        editingObject.dropShadow();
                    else
                        editingObject.unDropShadow();
                    this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                        editingObject.dbID,
                        props
                    )
                }
            )
    }

    changeShadowProperty(propertyName, value, save) {
        const setterName = {
            shadowBlur: 'setShadowBlur',
            shadowColor: 'setShadowColor',
            shadowOffsetX: 'setShadowOffsetX',
            shadowOffsetY: 'setShadowOffsetY',
            horizontalPadding: 'setHorizontalPadding',
            verticalPadding: 'setVerticalPadding'
        }[propertyName]

        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .forEach(editingObject => {
                editingObject[setterName](value)
                editingObject.updateShadow()
                if (save) {
                    this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                        editingObject.dbID,
                        {[propertyName]: value}
                    )
                }
                if (!save) {
                    editingObject.updateShadow()
                }
            })
    }

    render() {
        return (
            !this.props.selected ? null : <div className="toolBoxExtend">
                <div className="toolBoxExtendSection">
                    <div className="title">Włącz cień:</div>
                    <label>
                        <input type="checkbox" className="switch"
                               checked={this.props.shadow}
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
                <div className="tabelarize tabelarize-center toolBoxExtendSection" style={{width: '100%'}}>
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

ShadowTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.proposedPositionToolbar.shadow,
        shadow: state.proposedPositionBridge.shadow
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(ShadowTool)