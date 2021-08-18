import React, {Component} from 'react'
import {connect} from 'react-redux'
import {watch, unwatch} from 'melanke-watchjs'
import {setUseBackgroundFrame, setBorder, setEffect, setMask, setShadow, setBackgroundFrameID} from "./proposedPositionToolsActions";

class ProposedPositionBridge extends Component {

    proposedPositionProps = ['effectName', 'maskFilter', '_dropShadow','displaySimpleBorder','useBackgroundFrame','backgroundFrameID']

    componentDidUpdate(prevProps) {
        if (prevProps.proposedPositionInstance == null && this.props.proposedPositionInstance != null) {
            this.props.setBorder(this.props.proposedPositionInstance.displaySimpleBorder)
            this.props.setUseBackgroundFrame(this.props.proposedPositionInstance.useBackgroundFrame)
            this.props.setBackgroundFrameID(this.props.proposedPositionInstance.backgroundFrameID)
            this.props.setEffect(this.props.proposedPositionInstance.effectName)
            this.props.setMask(this.props.proposedPositionInstance.maskFilter)
            this.props.setShadow(this.props.proposedPositionInstance._dropShadow)
            watch(this.props.proposedPositionInstance, this.proposedPositionProps, this.onChange, 0, true)
        }
    }

    componentWillUnmount() {
        unwatch(this.props.proposedPositionInstance, this.proposedPositionProps, this.onChange)
    }

    onChange = (prop, action, newValue, oldValue) => {
        if (prop === 'effectName') {
            this.props.setEffect(newValue)
        } else if (prop === 'maskFilter') {
            this.props.setMask(newValue)
        } else if (prop === '_dropShadow') {
            this.props.setShadow(newValue)
        } else if (prop === 'displaySimpleBorder') {
            this.props.setBorder(newValue)
        }else if (prop === 'useBackgroundFrame') {
            this.props.setUseBackgroundFrame(newValue)
        }else if (prop === 'backgroundFrameID') {
            this.props.setBackgroundFrameID(newValue)
        }
    }

    render() {
        return null
    }
}

ProposedPositionBridge.propTypes = {}
const mapStateToProps = (state) => {
    return {
        proposedPositionInstance: state.proposedPositionBridge.proposedPositionInstance
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        setEffect: (effectName) => {
            dispatch(setEffect(effectName))
        },
        setMask: (mask) => {
            dispatch(setMask(mask))
        },
        setShadow: (shadow) => {
            dispatch(setShadow(shadow))
        },
        setBorder: (border) => {
            dispatch(setBorder(border))
        },
        setUseBackgroundFrame:(bf)=>{
            dispatch(setUseBackgroundFrame(bf))
        },
        setBackgroundFrameID:(id)=>{
            dispatch(setBackgroundFrameID(id))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ProposedPositionBridge)