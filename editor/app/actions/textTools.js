import {RANGE} from '../Editor'
export const CHANGE_HORIZONTAL_ALIGN = 'CHANGE_ALIGN'
export const CHANGE_VERTICAL_ALIGN = 'CHANGE_VERTICAL_ALIGN'
export const CHANGE_FONT_FAMILY = 'CHANGE_FONT_FAMILY'
export const CHANGE_FONT_SIZE = 'CHANGE_FONT_SIZE'
export const SET_TEXTINSTANCE = 'SET_TEXTINSTANCE'
export const CHANGE_LINE_HEIGHT = 'CHANGE_LINE_HEIGHT'

export const changeFontSize = (fontSize) => {
    return {
        type: CHANGE_FONT_SIZE, fontSize
    }
}

export const changeHorizontalAlign = (align) => {
    return {
        type: CHANGE_HORIZONTAL_ALIGN, align
    }
}

export const changeVerticalAlign = (align) => {
    return {
        type: CHANGE_VERTICAL_ALIGN, align
    }
}

export const changeFontFamily = (fontFamily) => {
    return {
        type: CHANGE_FONT_FAMILY, fontFamily
    }
}

export const changeLineHeight = (height, range = RANGE.singleElem) => {
    return {
        type: CHANGE_LINE_HEIGHT, lineHeight: height, range
    }
}


export const setTextInstance = (textInstance) => {
    return {
        type: SET_TEXTINSTANCE, textInstance
    }
}

