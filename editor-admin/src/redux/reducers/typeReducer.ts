import { Reducer } from 'redux';
import {
    TypeActions,
    TypeActionTypes,
} from '../actions/TypeAction';
import { IType } from '../../models';

export interface ITypeState {
    readonly types: IType[];
}

const initialTypeState: ITypeState = {
    types: [],
};

export const typeReducer: Reducer<ITypeState, TypeActions> = (
    state = initialTypeState,
    action
) => {

    switch (action.type) {
        case TypeActionTypes.GET_ALL: {
            return {
                ...state,
                types: action.types,
            };
        }
        default:
            return {
                ...state
            }
    }
};

export const getTypes = (state: any) => state.types;
export const getTypesError = (state: any) => state.error;