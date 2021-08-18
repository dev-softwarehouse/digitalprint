import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {IObjectFormat} from "../../models";
import {IObjectFormatState} from "../reducers/objectFormatReducer";
import {
    createObjectFormatInit,
    createObjectFormatSuccess,
    fetchObjectFormatInit,
    fetchObjectFormatSuccess
} from "../modules/formats/object-formats";
import {getSocketObject} from '../../helpers/socket';

export enum ObjectFormatActionTypes {
    CREATE_OBJECT_FORMAT_INIT = 'CREATE_OBJECT_FORMAT_INIT',
    CREATE_OBJECT_FORMAT_SUCCESS = 'CREATE_OBJECT_FORMAT_SUCCESS',
    FETCHING_OBJECT_FORMAT = 'FETCHING_OBJECT_FORMAT',
    FETCHING_OBJECT_FORMAT_SUCCESS = 'FETCHING_OBJECT_FORMAT_SUCCESS'
}

export interface IObjectFormatInitCreateAction {
    type: ObjectFormatActionTypes.CREATE_OBJECT_FORMAT_INIT;
    objectFormat: IObjectFormat
}

export interface IObjectFormatCreatedAction {
    type: ObjectFormatActionTypes.CREATE_OBJECT_FORMAT_SUCCESS;
    objectFormat: IObjectFormat
}

export interface IObjectFormatFetchAction {
    type: ObjectFormatActionTypes.FETCHING_OBJECT_FORMAT;
}

export interface IObjectFormatFetchActionSuccess {
    type: ObjectFormatActionTypes.FETCHING_OBJECT_FORMAT_SUCCESS;
    objectFormat: IObjectFormat
}

export type ObjectFormatActions = IObjectFormatFetchAction | IObjectFormatFetchActionSuccess |
                                  IObjectFormatCreatedAction | IObjectFormatInitCreateAction;

export const initFetchObjectFormat: ActionCreator<
    ThunkAction<Promise<any>, IObjectFormatState, null, IObjectFormatFetchAction>
    > = (data: object) => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.emit('Format.getByIntID', data);
        dispatch(fetchObjectFormatInit());

    };
};

export const receiveObjectFormat: ActionCreator<ThunkAction<Promise<any>, IObjectFormatState, null,
    IObjectFormatFetchAction>> = () => {

    return async (dispatch: Dispatch) => {
        const socket = getSocketObject();

        socket.on('Format.getByIntID', (response: IObjectFormat) => {
            console.log('#3 ', response);
            dispatch(fetchObjectFormatSuccess(response));
        });

    };
};

export const initCreateObjectFormat: ActionCreator<
    ThunkAction<Promise<any>, IObjectFormatState, null, IObjectFormatInitCreateAction>
    > = (data: object) => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.emit('Format.add', data);
        dispatch(createObjectFormatInit());

    };
};

export const createdObjectFormat: ActionCreator<
    ThunkAction<Promise<any>, IObjectFormatState, null, IObjectFormatFetchActionSuccess>
    > = () => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.on('Format.added', (response: IObjectFormat) => {
            console.log('resp with list: ', response);
            dispatch(createObjectFormatSuccess(response));
        });

    };
};