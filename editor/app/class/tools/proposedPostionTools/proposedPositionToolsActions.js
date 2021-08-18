export const SET_PROPOSED_POSITION='SET_PROPOSED_POSITION'
export const SET_MASK='SET_MASK'
export const SET_EFFECT='SET_EFFECT'
export const SET_SHADOW='SET_SHADOW'
export const SET_BORDER='SET_BORDER'
export const SET_USE_BACKGROUND_FRAME='SET_USE_BACKGROUND_FRAME'
export const SET_BACKGROUND_FRAME_ID='SET_BACKGROUND_FRAME_ID'

export const setProposedPosition=(proposedPositionInstance)=>({type:SET_PROPOSED_POSITION,proposedPositionInstance})
export const setMask=(maskFilter)=>({type:SET_MASK,maskFilter})
export const setBorder=(border)=>({type:SET_BORDER,border})
export const setEffect=(effectName)=>({type:SET_EFFECT,effectName})
export const setShadow=(shadow)=>({type:SET_SHADOW,shadow})
export const setUseBackgroundFrame=(useBackgroundFrame)=>({type:SET_USE_BACKGROUND_FRAME,useBackgroundFrame})
export const setBackgroundFrameID=(backgroundFrameID)=>({type:SET_BACKGROUND_FRAME_ID,backgroundFrameID})