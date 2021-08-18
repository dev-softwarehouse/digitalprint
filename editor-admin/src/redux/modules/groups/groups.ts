import {IGroup} from "../../../models";

const FETCHING_GROUPS = 'FETCHING_GROUPS';
const FETCHING_GROUPS_FAILURE = 'FETCHING_GROUPS_FAILURE';
const FETCHING_GROUPS_SUCCESS = 'FETCHING_GROUPS_SUCCESS';

export const fetchGroupsFailure = (error: string) => {
    return {
        type: FETCHING_GROUPS_FAILURE,
        error: 'Error fetching groups.',
    }
};

export const fetchGroupSuccess  = (groups: IGroup[]) => {
    return {
        type: FETCHING_GROUPS_SUCCESS,
        groups: groups
    }
};

const initialState = {
    authorizationInProgress: false,
    error: "",
};

export const groups = (state = initialState, action: any, groups: IGroup[]) => {

    switch (action.type) {
        case FETCHING_GROUPS:
            return {
                ...state,
                isFetching: true,
            };
        case FETCHING_GROUPS_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: action.error,
            };
        case FETCHING_GROUPS_SUCCESS:
            return  {
                ...state,
                isFetching: false,
                error: "",
                groups: groups
            };
        default:
            return state
    }
};