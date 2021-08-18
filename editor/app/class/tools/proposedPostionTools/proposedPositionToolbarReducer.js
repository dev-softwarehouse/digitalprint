import update from 'immutability-helper'
import {SELECT_NONE} from '../../../actions/tools'
import {SELECT_BACKFRAME, SELECT_BORDER, SELECT_EFFECTS, SELECT_MASK, SELECT_SHADOW} from './proposedPositionToolbarActions'

export const defaultState = {
    zoom: false,
    border: false,
    shadow: false,
    backFrame: false,
    mask: false,
    effects: false
}
export const proposedPositionToolbarReducer = (state = defaultState, action) => {
    switch (action.type) {
        case SELECT_BACKFRAME:
            return update({...state}, {
                border: {$set: false},
                shadow: {$set: false},
                backFrame: {$set: action.select},
                mask: {$set: false},
                effects: {$set: false}
            })
        case SELECT_BORDER:
            return update({...state}, {
                border: {$set: action.select},
                shadow: {$set: false},
                backFrame: {$set: false},
                mask: {$set: false},
                effects: {$set: false}
            })
        case SELECT_EFFECTS:
            return update({...state}, {
                border: {$set: false},
                shadow: {$set: false},
                backFrame: {$set: false},
                mask: {$set: false},
                effects: {$set: action.select}
            })
        case SELECT_MASK:
            return update({...state}, {
                border: {$set: false},
                shadow: {$set: false},
                backFrame: {$set: false},
                mask: {$set: action.select},
                effects: {$set: false}
            })
        case SELECT_SHADOW:
            return update({...state}, {
                border: {$set: false},
                shadow: {$set: action.select},
                backFrame: {$set: false},
                mask: {$set: false},
                effects: {$set: false}
            })
        case SELECT_NONE:
            return update({...state}, {$merge: defaultState})

        default:
            return {...state}
    }
}