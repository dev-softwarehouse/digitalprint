import { Reducer } from 'redux';
import {
    FormatActions,
    FormatActionTypes,
} from '../actions/FormatAction';
import { IFormat } from '../../models';

export interface IFormatState {
    readonly formats: IFormat[];
}

const initialTypeState: IFormatState = {
    formats: [],
};

export const formatReducer: Reducer<IFormatState, FormatActions> = (
    state = initialTypeState,
    action
) => {
    switch (action.type) {
        case FormatActionTypes.GET_ALL: {
            return {
                ...state,
                formats: action.formats,
            };
        }
        default:
            return {
                ...state,
                formats: []
            };
    }
};

export const getFormats = (state: any) => state.types;
export const getFormatsError = (state: any) => state.error;