import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import axios from 'axios';
import { IFormat } from '../../models'
import { IFormatState } from '../reducers/formatReducer';

import {
    fetchFormatsSuccess,
    fetchFormatsFailure,
    fetchOneFormatSuccess,
    fetchOneFormatFailure
} from "../modules/formats/formats";


// Create Action Constants
export enum FormatActionTypes {
    GET_ALL = 'GET_ALL',
    GET_ONE = 'GET_ONE'
}

// Interface for Get All Action Type
export interface IFormatGetAllAction {
    type: FormatActionTypes.GET_ALL;
    formats: IFormat[];
}

export interface IFormatGetOneAction {
    type: FormatActionTypes.GET_ONE;
    formats: IFormat;
}

/*
Combine the action types with a union (we assume there are more)
example: export type CharacterActions = IGetAllAction | IGetOneAction ...
*/
export type FormatActions = IFormatGetAllAction | IFormatGetOneAction;

/* Get All Action
<Promise<Return Type>, State Interface, Type of Param, Type of Action> */
export const getAssociatedFormats: ActionCreator<
    ThunkAction<Promise<any>, IFormatState, null, IFormatGetAllAction>
    > = (groupID: number, typeID: number, complexID: number) => {
    return async (dispatch: Dispatch) => {
        try {
            // const response = await axios.get(`${process.env.API_URL}ps_groups/` + groupID + `/ps_types/` + typeID + `/ps_formats/formatsPublic`);
            const response = await axios.get(`http://api.localtest.me/ps_groups/` + groupID + `/ps_types/` + typeID + `/ps_formats/formatsPublic/` + complexID);
            dispatch(fetchFormatsSuccess(response.data));
            return response.data;
        } catch (err) {
            dispatch(fetchFormatsFailure(err));
        }
    };
};

export const getOneFormat: ActionCreator<
    ThunkAction<Promise<any>, IFormatState, null, IFormatGetOneAction>
    > = (groupID:number, typeID: number, complexID: number, formatId: number) => {
    return async (dispatch: Dispatch) => {

        function filter(elements: IFormat[]) {

            console.log( 'elements: ', elements );

            let result = {} as IFormat;
            elements.forEach((one: IFormat) => {
                console.log( 'compare: ', one.ID, parseInt(String(formatId), 0) );
                if( one.ID === parseInt(String(formatId), 0) ) {
                    result = one;
                }
            });

            return result;
        }

        try {
            // const response = await axios.get(`${process.env.API_URL}ps_groups/` + groupID + `/ps_types/` + typeID + `/ps_formats/formatsPublic`);
            const response = await axios.get(`http://api.localtest.me/ps_groups/` + groupID + `/ps_types/` + typeID + `/ps_formats/formatsPublic/` + complexID );

            let oneFormat = {} as IFormat;
            if( Array.isArray(response.data) ) {
                console.log('data: ', response.data);
                oneFormat = filter(response.data);
                console.log('oneFormat: ', oneFormat);
                dispatch(fetchOneFormatSuccess(oneFormat));
                return oneFormat;
            } else {
                return oneFormat;
            }

        } catch (err) {
            dispatch(fetchOneFormatFailure(err));
            return {error: err};
        }
    };
};