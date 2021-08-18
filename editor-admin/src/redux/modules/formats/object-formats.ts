import {IObjectFormat} from "../../../models";

const FETCHING_OBJECT_FORMAT = 'FETCHING_OBJECT_FORMAT';
const FETCHING_OBJECT_FORMAT_FAILURE = 'FETCHING_OBJECT_FORMAT_FAILURE';
const FETCHING_OBJECT_FORMAT_SUCCESS = 'FETCHING_OBJECT_FORMAT_SUCCESS';
const CREATING_OBJECT_FORMAT = 'CREATING_OBJECT_FORMAT';
const CREATING_OBJECT_FORMAT_FAILURE = 'CREATING_OBJECT_FORMAT_FAILURE';
const CREATING_OBJECT_FORMAT_SUCCESS = 'CREATING_OBJECT_FORMAT_SUCCESS';

export const fetchObjectFormatInit = () => {
    return {
        type: FETCHING_OBJECT_FORMAT,
        isFetching: true
    }
};

export const createObjectFormatInit = () => {
    return {
        type: CREATING_OBJECT_FORMAT,
        isCreating: true
    }
};

export const fetchObjectFormatFailure = (error: string) => {
    return {
        type: FETCHING_OBJECT_FORMAT_FAILURE,
        error: 'Error fetching object format.',
    }
};

export const createObjectFormatFailure = (error: string) => {
    return {
        type: CREATING_OBJECT_FORMAT_FAILURE,
        error: 'Error creating object format.',
    }
};

export const fetchObjectFormatSuccess = (objectFormatData: IObjectFormat) => {
    return {
        type: FETCHING_OBJECT_FORMAT_SUCCESS,
        objectFormat: objectFormatData,
        isFetching: false
    }
};

export const createObjectFormatSuccess = (objectFormatData: IObjectFormat) => {
    return {
        type: CREATING_OBJECT_FORMAT_SUCCESS,
        objectFormat: objectFormatData
    }
};