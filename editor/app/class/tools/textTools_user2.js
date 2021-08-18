import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Toolbar from "./text_tools/Toolbar";
import {RANGE} from "../../Editor";
import ZoomTool from './text_tools/ZoomTool'
import AlignTools from './text_tools/AlignTools'
import ShadowTools from './text_tools/ShadowTools'
import BackgroundTools from './text_tools/BackgroundTools'
import MariginTools from './text_tools/MariginTools'
import {selectNone} from "../../actions/tools";
import {setTextInstance} from "../../actions/textTools";
import Text2Bridge from "./text_tools/Text2Bridge";
import {watch, unwatch} from 'melanke-watchjs'

export const adaptPickerColor = (value) => {
    let rgba;
    if(value.indexOf('rgba')>-1)
        rgba=value.split('(')[1].split(')')[0].split(',');
    else if(value.indexOf('#')>-1){
        if(value.length===4){
            rgba=[value.substring(1,2)+value.substring(1,2),value.substring(2,3)+value.substring(2,3),value.substring(3,4)+value.substring(3,4)].map(s=>parseInt(s,16))
        }else{
            rgba=[value.substring(1,3),value.substring(3,5),value.substring(5,7)].map(s=>parseInt(s,16))
        }
        rgba.push(1)
    }
    return 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + (rgba[3] * 255) + ')';
}

class TextTool extends Component {
    constructor(props) {
        super(props)
        this.state = {left: 0, top: 0}
    }

    componentDidMount() {
        this._updateToolsBoxPosition()
        this.props.setTextInstance(this.props.textInstance)
        watch(this.props.textInstance, ['x', 'y', 'rotation'], this.watchText, 0, true)
    }

    componentWillUnmount() {
        this.props.onUnmount()
        this.props.setTextInstance(null)
        unwatch(this.props.textInstance, ['x', 'y', 'rotation'], this.watchText)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectedAlign !== this.props.selectedAlign
            || prevProps.selectedShadow !== this.props.selectedShadow
            || prevProps.selectedBackground !== this.props.selectedBackground
            || prevProps.selectedMargins !== this.props.selectedMargins
        ) {
            this._updateToolsBoxPosition()
        }
    }

    watchText = (prop, action, newValue, oldValue) => {
        this._updateToolsBoxPosition()
    }

    _updateToolsBoxPosition() {
        const toolSize = {
            width: this.toolsContainer.innerWidth,
            height: this.toolsContainer.innerHeight
        }
        const pos = this.props.textInstance.getGlobalPosition()
        const bounds = this.props.textInstance.getTransformedBounds()
        const stage = this.props.textInstance.editor.getStage()
        this.setState({
            top: pos[1] + 100 + bounds.height / 2 * stage.scaleY,
            left: pos[0] - (bounds.width / 2 * stage.scaleX)
        })
    }

    setContainerRef = el => {
        this.toolsContainer = el
    }

    changeTextProperty = (group, range, property, value, save=false) => {
        const props = {}
        props[property] = value
        const setterName = {shadowBlur: 'setShadowBlur', shadowColor: 'setShadowColor', shadowOffsetX: 'setShadowOffsetX', shadowOffsetY: 'setShadowOffsetY', horizontalPadding: 'setHorizontalPadding', verticalPadding: 'setVerticalPadding'}[property]
        const updateMethod = {shadow: 'updateShadow', margin: 'drawPadding'}[group]

        if (range === RANGE.singleElem) {

            const editingObject = this.props.textInstance.editor.stage.getObjectById(this.props.textInstance.editor.tools.getEditObject());
            editingObject[setterName](value);
            editingObject[updateMethod]();

            if (save) {
                this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                    editingObject.dbID,
                    props
                );

            }

        } else if (range === RANGE.allElemInPage) {
            this.props.textInstance.editor.getEditableObjectsByType(RANGE.allElemInPage, 'Text2')
                .forEach((e) => {
                    e[setterName](value);
                    e[updateMethod]();

                    this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                        e.dbID,
                        props
                    )
                });

        } else if (range === RANGE.allElemInProject) {

            this.props.textInstance.editor.getEditableObjectsByType(RANGE.allElemInPage, 'Text2')
                .forEach((e) => {
                    e[setterName](value);
                    e[updateMethod]();
                });

            if (save) {
                this.props.textInstance.editor.userProject.getObj().projects.forEach((p) => {
                    this.props.textInstance.editor.webSocketControllers.userProject.setSettingsForAllProposedTexts(p._id, props);
                });
            }

        }
    }

    render() {
        return (
            <div id="proposed-text-toolsbox" className="tools-box"
                 ref={this.setContainerRef}
                 style={{top: this.state.top, left: this.state.left}}>
                <Toolbar textInstance={this.props.textInstance} advanced={this.props.advanced}/>
                <ZoomTool textInstance={this.props.textInstance}/>
                <AlignTools textInstance={this.props.textInstance} changeTextProperty={this.changeTextProperty}/>
                <ShadowTools textInstance={this.props.textInstance} changeTextProperty={this.changeTextProperty}/>
                <BackgroundTools textInstance={this.props.textInstance} changeTextProperty={this.changeTextProperty}/>
                <MariginTools textInstance={this.props.textInstance} changeTextProperty={this.changeTextProperty}/>
                <Text2Bridge textInstance={this.props.textInstance}/>
            </div>
        );
    }
}

TextTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selectedAlign: state.textToolbar.align.selected,
        selectedShadow: state.textToolbar.shadow.selected,
        selectedBackground: state.textToolbar.background.selected,
        selectedMargins: state.textToolbar.paddings.selected
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        onUnmount: () => {
            dispatch(selectNone())
        },
        setTextInstance: (instance) => {
            dispatch(setTextInstance(instance))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TextTool)
