import update from 'immutability-helper'
import {SET_BORDER, SET_EFFECT, SET_PROPOSED_POSITION, SET_MASK, SET_SHADOW, SET_USE_BACKGROUND_FRAME, SET_BACKGROUND_FRAME_ID} from "./proposedPositionToolsActions";

export const defaultState={proposedPositionInstance:null,effectName:'',maskFilter:null,shadow:false,border:false,useBackgroundFrame:false}
export const proposedPositionBridgeReducer=(state=defaultState, action)=>{
    switch(action.type){
        case SET_PROPOSED_POSITION:
            return update({...state}, {
                proposedPositionInstance: {$set: action.proposedPositionInstance}
            })
        case SET_BORDER:
            return update({...state}, {
                border: {$set: action.border}
            })
        case SET_USE_BACKGROUND_FRAME:
            return update({...state}, {
                useBackgroundFrame: {$set: action.useBackgroundFrame}
            })
        case SET_BACKGROUND_FRAME_ID:
            return update({...state}, {
                backgroundFrameID: {$set: action.backgroundFrameID}
            })
        case SET_EFFECT:
            return update({...state}, {
                effectName: {$set: action.effectName}
            })
        case SET_MASK:
            return update({...state}, {
                maskFilter: {$set: action.maskFilter}
            })
        case SET_SHADOW:
            return update({...state}, {
                shadow: {$set: action.shadow}
            })
        default:
            return state
    }
}