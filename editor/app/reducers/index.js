import {combineReducers} from 'redux';
import {textToolbar} from "./textToolbar";
import {text2Bridge} from './text2Bridge'
import {proposedPositionToolbarReducer} from '../class/tools/proposedPostionTools/proposedPositionToolbarReducer'
import {proposedPositionBridgeReducer} from '../class/tools/proposedPostionTools/proposedPositionBridgeReducer'

export default combineReducers({
    textToolbar, text2Bridge, proposedPositionToolbar: proposedPositionToolbarReducer,proposedPositionBridge: proposedPositionBridgeReducer
})
