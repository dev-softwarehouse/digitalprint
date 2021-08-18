// Import redux types
import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import axios from 'axios';

// Import Character Typing
import { IType } from '../../models/type'
import { ITypeState } from '../reducers/typeReducer';
import { fetchTypeSuccess, fetchTypesFailure } from "../modules/types/types"


// Create Action Constants
export enum TypeActionTypes {
    GET_ALL = 'GET_ALL',
}

// Interface for Get All Action Type
export interface ITypeGetAllAction {
    type: TypeActionTypes.GET_ALL;
    types: IType[];
}

/*
Combine the action types with a union (we assume there are more)
example: export type CharacterActions = IGetAllAction | IGetOneAction ...
*/
export type TypeActions = ITypeGetAllAction;

/* Get All Action
<Promise<Return Type>, State Interface, Type of Param, Type of Action> */
export const getAssociatedTypes: ActionCreator<
    ThunkAction<Promise<any>, ITypeState, null, ITypeGetAllAction>
    > = (groupID: number) => {
    return async (dispatch: Dispatch) => {
        try {
            // const response = await axios.get(`${process.env.API_URL}/ps_types/getActiveTypesPublic`);
            const response = await axios.get(`http://api.localtest.me/ps_types/getActiveTypesPublic/` + groupID);
            dispatch(fetchTypeSuccess(response.data));
            return response.data;
        } catch (err) {
            dispatch(fetchTypesFailure(err));
        }
    };
};