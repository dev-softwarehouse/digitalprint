export const SELECT_ZOOM='SELECT_ZOOM'
export const SELECT_ROTATE='SELECT_ROTATE'
export const SELECT_BACKFRAME='SELECT_BACKFRAME'
export const SELECT_BORDER = 'SELECT_BORDER'
export const SELECT_EFFECTS='SELECT_EFFECTS'
export const SELECT_MASK='SELECT_MASK'
export const SELECT_SHADOW = 'SELECT_SHADOW'

export const selectZoomTool = (select) => ({
    type: SELECT_ZOOM, select
})

export const selectRotateTool = () => ({
    type: SELECT_ROTATE
})

export const selectBackFrameTool = (select) => ({
    type: SELECT_BACKFRAME, select
})

export const selectBorderTool = (select) => ({
    type: SELECT_BORDER, select
})

export const selectEffectsTool = (select) => ({
    type: SELECT_EFFECTS, select
})

export const selectMaskTool = (select) => ({
    type: SELECT_MASK, select
})

export const selectShadowTool = (select) => ({
    type: SELECT_SHADOW, select
})


