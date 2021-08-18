import {IFormat} from "../../../models";

const FETCHING_FORMATS = 'FETCHING_FORMATS';
const FETCHING_FORMATS_FAILURE = 'FETCHING_FORMATS_FAILURE';
const FETCHING_ONE_FORMATS_FAILURE = 'FETCHING_FORMATS_FAILURE';
const FETCHING_FORMATS_SUCCESS = 'FETCHING_FORMATS_SUCCESS';
const FETCHING_ONE_FORMATS_SUCCESS = 'FETCHING_FORMATS_SUCCESS';

export const fetchFormatsFailure = (error: string) => {
    return {
        type: FETCHING_FORMATS_FAILURE,
        error: 'Error fetching formats.',
    }
};

export const fetchFormatsSuccess  = (formats: IFormat[]) => {
    return {
        type: FETCHING_FORMATS_SUCCESS,
        formats
    }
};

export const fetchOneFormatFailure = (error: string) => {
    return {
        type: FETCHING_ONE_FORMATS_FAILURE,
        error: 'Error fetching one format.',
    }
};

export const fetchOneFormatSuccess  = (format: IFormat) => {
    return {
        type: FETCHING_ONE_FORMATS_SUCCESS,
        format
    }
};

const initialState = {
    authorizationInProgress: false,
    error: "",
};

export const formats = (state = initialState, action: any, formats: IFormat[], format: IFormat) => {
    switch (action.type) {
        case FETCHING_FORMATS:
            return {
                ...state,
                isFetching: true,
            };
        case FETCHING_FORMATS_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: action.error,
            };
        case FETCHING_FORMATS_SUCCESS:
            return  {
                ...state,
                isFetching: false,
                error: "",
                formats
            };
        case FETCHING_ONE_FORMATS_SUCCESS:
            return  {
                ...state,
                isFetching: false,
                error: "",
                format
            };
        case FETCHING_ONE_FORMATS_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: action.error,
            };
        default :
            return state
    }
}