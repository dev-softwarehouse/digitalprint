export const SELECT_ZOOM = 'SELECT_ZOOM'
export const SELECT_AUTOSIZE='SELECT_AUTOSIZE'
export const SELECT_BOLD='SELCT_BOLD'
export const SELECT_ITALIC='SELECT_ITALIC'
export const SELECT_ALIGN = 'SELECT_ALIGN'
export const SELECT_SHADOW = 'SELECT_SHADOW'
export const SELECT_BACKGROUND = 'SELECT_BACKGROUND'
export const SELECT_PADDINGS = 'SELECT_MARGINS'

export const selectZoom = (select) => ({
    type: SELECT_ZOOM, select
})

export const selectAutoSize = (select) => ({
    type: SELECT_AUTOSIZE, select
})

export const selectBold = (select) => ({
    type: SELECT_BOLD, select
})

export const selectItalic = (select) => ({
    type: SELECT_ITALIC, select
})

export const selectAlignTool = (select) => ({
    type: SELECT_ALIGN, select
})

export const selectShadowTool = (select) => ({
    type: SELECT_SHADOW, select
})

export const selectBackgroundTool = (select) => ({
    type: SELECT_BACKGROUND, select
})

export const selectPaddingTool = (select) => ({
    type: SELECT_PADDINGS, select
})

