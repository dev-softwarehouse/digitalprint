import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {RANGE} from "../../../Editor";
import RangeSwitchers from "../RangeSwitchers";
import ImagesList from "../ImagesList";
import {watch, unwatch} from 'melanke-watchjs'
import {safeImage} from "../../../utils";

export const effectName = Object.freeze({SEPIA: 'SEPIA', BW: 'BW', NEGATIVE: 'NEGATIVE'})
const effectDefault = effectName.SEPIA
export const effects = {
    [effectName.BW]: () => new createjs.ColorMatrixFilter([0.30, 0.30, 0.30, 0, 0,
        0.30, 0.30, 0.30, 0, 0,
        0.30, 0.30, 0.30, 0, 0,
        0, 0, 0, 1, 0
    ]), [effectName.SEPIA]: () => new createjs.ColorMatrixFilter([0.39, 0.77, 0.19, 0, 0,
        0.35, 0.68, 0.17, 0, 0,
        0.27, 0.53, 0.13, 0, 0,
        0, 0, 0, 1, 0
    ]), [effectName.NEGATIVE]: () => new createjs.ColorMatrixFilter(new createjs.ColorMatrix().adjustHue(-200))
}

export class ItemRenderer extends Component {

    componentDidMount() {
        this.stage = new createjs.Stage(this.canvas);
        const img = safeImage()
        img.addEventListener('load', () => {
            const bmp = new createjs.Bitmap(img)
            this.stage.addChild(bmp)
            bmp.cache(0, 0, img.width, img.height)
            const h = 86
            bmp.scale = h / img.height * 2//TODO why must be multiplier
            this.canvas.width = bmp.scale * img.width
            this.applyFilters(bmp)
            bmp.updateCache()
            this.stage.update()
        })
        let src=this.props.proposedPositionInstance.thumbnail
        if(src.indexOf('http')!==0){
            src=`${EDITOR_ENV.staticUrl}${src}`
        }
        img.src = src
    }

    applyFilters(bmp) {
        if (this.props.type !== '') {
            bmp.filters = [effects[this.props.type]()]
        }
    }

    render() {
        return <canvas ref={ref => {
            this.canvas = ref
        }}/>
    }

}

class EffectsTool extends Component {
    state = {range: RANGE.singleElem, effectsList: ['', ...Object.keys(effectName)]}

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.selected && this.props.selected) {
        }
    }

    onSwitchChange(checked) {
        this.changeEffect(checked ? effectDefault : '')
    }

    onEffectClick = (effectName) => {
        this.changeEffect(effectName)
    }

    changeEffect(effectName) {
        this.props.proposedPositionInstance.editor.getEditableObjectsByType(this.state.range, 'ProposedPosition')
            .forEach(editingObject => {
                    editingObject.setEffect(effectName, true)

                    this.props.proposedPositionInstance.editor.webSocketControllers.proposedImage.setAttributes(
                        editingObject.dbID,
                        {
                            effectName
                        }
                    )
                }
            )
    }

    render() {
        return (
            !this.props.selected ? null : <div className="toolBoxExtend">
                <div className="toolBoxExtendSection">
                    <div className="title">Użyj efektu:</div>
                    <label>
                        <input type="checkbox" className="switch"
                               checked={this.props.effectName !== ''}
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
                <ImagesList list={this.state.effectsList} selected={this.props.effectName} onItemSelect={this.onEffectClick} itemRenderer={ItemRenderer}
                            proposedPositionInstance={this.props.proposedPositionInstance.objectInside.projectImage}/>
            </div>
        )
    }
}

EffectsTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        selected: state.proposedPositionToolbar.effects,
        effectName: state.proposedPositionBridge.effectName
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(EffectsTool)