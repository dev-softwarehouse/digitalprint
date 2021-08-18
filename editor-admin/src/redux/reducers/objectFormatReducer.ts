import { Reducer } from 'redux';
import {IObjectFormat} from "../../models";
import { ObjectFormatActionTypes, ObjectFormatActions } from "../actions/ObjectFormatAction";

export interface IObjectFormatState {
    readonly objectFormat: IObjectFormat;
}

const initialTypeState: IObjectFormatState = {
    objectFormat: {
        _id: 1,
        formatID: 1,
        width: 1,
        height: 1,
        slope: 1,
        Attributes: [],
        Views: [],
        Themes: []
    },
};

export const objectFormatReducer: Reducer<IObjectFormatState, ObjectFormatActions> = (
    state = initialTypeState,
    action
) => {
    switch (action.type) {
        case ObjectFormatActionTypes.FETCHING_OBJECT_FORMAT: {
            return {
                ...state,
                isFetching: true
            };
        }
        case ObjectFormatActionTypes.CREATE_OBJECT_FORMAT_SUCCESS: {
            return {
                ...state,
                objectFormat: action.objectFormat,
                isFetching: false
            }
        }
        case ObjectFormatActionTypes.FETCHING_OBJECT_FORMAT_SUCCESS: {
            return {
                ...state,
                objectFormat: action.objectFormat
            };
        }
        default:
            return {
                ...state,
                formats: []
            };
    }
};