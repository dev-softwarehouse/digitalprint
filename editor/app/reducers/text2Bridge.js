import update from 'immutability-helper'
import {CHANGE_LINE_HEIGHT, CHANGE_FONT_SIZE, CHANGE_HORIZONTAL_ALIGN, CHANGE_VERTICAL_ALIGN, SET_TEXTINSTANCE, CHANGE_FONT_FAMILY} from '../actions/textTools'

export const defaultState = {range:undefined,textInstance: null, horizontalAlign: '', verticalAlign: '', fontFamily: '', fontSize: 0, lineHeight: 0}
export const text2Bridge = (state = defaultState, action) => {
    switch (action.type) {
        case CHANGE_FONT_SIZE:
            return update({...state}, {
                fontSize: {$set: action.fontSize}
            })

        case CHANGE_HORIZONTAL_ALIGN:
            return update({...state}, {
                horizontalAlign: {$set: action.align}
            })

        case CHANGE_VERTICAL_ALIGN:
            return update({...state}, {
                verticalAlign: {$set: action.align}
            })

        case SET_TEXTINSTANCE:
            return update({...state}, {
                textInstance: {$set: action.textInstance}
            })

        case CHANGE_FONT_FAMILY:
            return update({...state}, {
                fontFamily: {$set: action.fontFamily}
            })

        case CHANGE_LINE_HEIGHT:
            return update({...state}, {
                lineHeight: {$set: action.lineHeight}
            })

        default:
            return state

    }
}