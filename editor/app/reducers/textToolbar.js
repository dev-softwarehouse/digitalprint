import update from 'immutability-helper'
import {SELECT_ZOOM, SELECT_AUTOSIZE, SELECT_BOLD,SELECT_ITALIC ,SELECT_ALIGN, SELECT_SHADOW, SELECT_BACKGROUND, SELECT_PADDINGS} from '../actions/textToolbar'
import {SELECT_NONE} from '../actions/tools'

export const defaultState = {
    zoom: {selected: false},
    autoSize: {selected: false},
    bold: {selected: false},
    italic: {selected: false},
    align: {selected: false},
    shadow: {selected: false},
    background: {selected: false},
    paddings: {selected: false}
}
export const textToolbar = (state = defaultState, action) => {
    switch (action.type) {

        case SELECT_ZOOM:
            return update({...state}, {
                zoom: {selected: {$set: action.select}}
            })

        case SELECT_AUTOSIZE:
            return update({...state}, {
                autoSize: {selected: {$set: action.select}}
            })

        case SELECT_BOLD:
            return update({...state}, {
                bold: {selected: {$set: action.select}}
            })

        case SELECT_ITALIC:
            return update({...state}, {
                italic: {selected: {$set: action.select}}
            })

        case SELECT_ALIGN:
            return update({...state}, {
                align: {selected: {$set: action.select}},
                shadow: {selected: {$set: false}},
                background: {selected: {$set: false}},
                paddings: {selected: {$set: false}}
            })

        case SELECT_SHADOW:
            return update({...state}, {
                align: {selected: {$set: false}},
                shadow: {selected: {$set: action.select}},
                background: {selected: {$set: false}},
                paddings: {selected: {$set: false}}
            })

        case SELECT_BACKGROUND:
            return update({...state}, {
                align: {selected: {$set: false}},
                shadow: {selected: {$set: false}},
                background: {selected: {$set: action.select}},
                paddings: {selected: {$set: false}}
            })

        case SELECT_PADDINGS:
            return update({...state}, {
                align: {selected: {$set: false}},
                shadow: {selected: {$set: false}},
                background: {selected: {$set: false}},
                paddings: {selected: {$set: action.select}}
            })

        case SELECT_NONE:
            return update({...state}, {$merge: defaultState})

        default:
            return {...state}
    }
}