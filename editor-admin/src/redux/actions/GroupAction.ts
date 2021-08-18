// Import redux types
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import axios from 'axios';

// Import Character Typing
import {IGroup } from '../../models/group'
import { IGroupState } from '../reducers/groupReducer';
import { fetchGroupSuccess, fetchGroupsFailure } from "../modules/groups/groups"


// Create Action Constants
export enum GroupActionTypes {
    GET_ALL = 'GET_ALL',
}

// Interface for Get All Action Type
export interface IGroupGetAllAction {
    type: GroupActionTypes.GET_ALL;
    groups: IGroup[];
}

/*
Combine the action types with a union (we assume there are more)
example: export type CharacterActions = IGetAllAction | IGetOneAction ...
*/
export type GroupActions = IGroupGetAllAction;

/* Get All Action
<Promise<Return Type>, State Interface, Type of Param, Type of Action> */
export const getAllGroups: ActionCreator<
    ThunkAction<Promise<any>, IGroupState, null, IGroupGetAllAction>
    > = () => {
    return async (dispatch: Dispatch) => {
        try {
            // @TODO add url to .env
            // const response = await axios.get(`${process.env.API_URL}/ps_groups/getActiveGroupsPublic`);
            const response = await axios.get(`http://api.localtest.me/ps_groups/getActiveGroupsPublic`);
            dispatch(fetchGroupSuccess(response.data));
            return response.data;
        } catch (err) {
            dispatch(fetchGroupsFailure(err));
        }
    };
};