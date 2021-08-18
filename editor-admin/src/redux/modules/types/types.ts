import {IType} from "../../../models";

const FETCHING_TYPES = 'FETCHING_TYPES';
const FETCHING_TYPES_FAILURE = 'FETCHING_TYPES_FAILURE';
const FETCHING_TYPES_SUCCESS = 'FETCHING_TYPES_SUCCESS';

export const fetchTypesFailure = (error: string) => {
    return {
        type: FETCHING_TYPES_FAILURE,
        error: 'Error fetching types.',
    }
};

export const fetchTypeSuccess  = (types: IType[]) => {
    return {
        type: FETCHING_TYPES_SUCCESS,
        types: types
    }
};

const initialState = {
    authorizationInProgress: false,
    error: "",
};

export const types = (state = initialState, action: any, types: IType[]) => {
    switch (action.type) {
        case FETCHING_TYPES:
            return {
                ...state,
                isFetching: true,
            };
        case FETCHING_TYPES_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: action.error,
            };
        case FETCHING_TYPES_SUCCESS:
            return  {
                ...state,
                isFetching: false,
                error: "",
                types: types
            };
        default :
            return state
    }
};