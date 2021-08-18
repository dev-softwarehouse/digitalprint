import { Reducer } from 'redux';
import {
    GroupActions,
    GroupActionTypes,
} from '../actions/GroupAction';
import { IGroup } from '../../models';

export interface IGroupState {
    readonly groups: IGroup[];
}

const initialGroupState: IGroupState = {
    groups: [],
};

export const groupReducer: Reducer<IGroupState, GroupActions> = (
    state = initialGroupState,
    action
) => {

    switch (action.type) {
        case GroupActionTypes.GET_ALL: {
            return {
                ...state,
                groups: action.groups,
            };
        }
        default:
            return {
                ...state
            };
    }
};

export const getGroups = (state: any) => state.groups;
export const getGroupsError = (state: any) => state.error;