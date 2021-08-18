import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import axios from 'axios';
import {IAdminProject} from '../../models'
import { IAdminProjectState } from '../reducers/adminProjectReducer';
import {
    fetchAdminProjectsSuccess,
    fetchAdminProjectsFailure,
    fetchAdminProjectsInit,
    createAdminProjectSuccess,
    createAdminProjectFailure,
    createAdminProjectSent,
} from "../modules/projects/admin-project";
import {getSocketObject} from '../../helpers/socket';

// Create Action Constants
// @TODO actions
export enum AdminProjectActionTypes {
    GET_ALL = 'GET_ALL',
    CREATE_ADMIN_PROJECT_SUCCESS = 'CREATE_ADMIN_PROJECT_SUCCESS',
    FETCHING_ADMIN_PROJECTS = 'FETCHING_ADMIN_PROJECTS',
    FETCHING_ADMIN_PROJECTS_SUCCESS = 'FETCHING_ADMIN_PROJECTS_SUCCESS'
}

// Interface for Get All Action Type
export interface IAdminProjectGetAllAction {
    type: AdminProjectActionTypes.GET_ALL;
    adminProjects: IAdminProject[];
}

export interface IAdminProjectCreateAction {
    type: AdminProjectActionTypes.CREATE_ADMIN_PROJECT_SUCCESS;
    adminProject: IAdminProject
}

export interface IAdminProjectsFetchAction {
    type: AdminProjectActionTypes.FETCHING_ADMIN_PROJECTS;
}

export interface IAdminProjectsFetchSuccessAction {
    type: AdminProjectActionTypes.FETCHING_ADMIN_PROJECTS_SUCCESS;
    adminProjects: IAdminProject[]
}

export type AdminProjectActions = IAdminProjectGetAllAction | IAdminProjectCreateAction | IAdminProjectsFetchAction | IAdminProjectsFetchSuccessAction;

export const getAssociatedAdminProjects: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
    > = (typeID: number) => {
    return async (dispatch: Dispatch) => {
        try {
            // const response = await axios.get(`${process.env.REACT_APP_API_URL}product/` + typeID);
            const response = await axios.get(`http://editorapi.localtest.me/project/` + typeID );
            dispatch(fetchAdminProjectsSuccess(response.data));
            return response.data;
        } catch (err) {
            dispatch(fetchAdminProjectsFailure(err));
        }
    };
};

/*export const createAdminProject: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
    > = (data: IAdminProject) => {
    return async (dispatch: Dispatch) => {
        try {
            // const response = await axios.post(`${process.env.REACT_APP_API_URL}product/`, data);
            const response = await axios.post(`http://editorapi.localtest.me/product/`, data);
            dispatch(createAdminProjectSuccess(response.data));
            return response.data;
        } catch (err) {
            dispatch(createAdminProjectFailure(err));
        }
    };
};*/

export const createAdminProject: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
        > = (data: IAdminProject) => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.emit('ProductType.newAdminProject', data);
        dispatch(createAdminProjectSent());

    };
};

export const receiveAdminProject: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
> = () => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.on('ProductType.receiveAdminProject', (response: IAdminProject) => {
            dispatch(createAdminProjectSuccess(response));
        });

        socket.on('ProductType.newAdminProjects', (response: IAdminProject[]) => {
            dispatch(fetchAdminProjectsSuccess(response));
        });

    };
};

export const errorCreateAdminProject: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
    > = () => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.on('AdminProject.added.error', (error: string) => {
            dispatch(createAdminProjectFailure(error));
            return error;
        });


    };
};

export const initFetchAdminProjects: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
    > = (data: object) => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.emit('ProductType.getAdminProjects', data);
        console.log('zacznij pobierać projekty!');
        dispatch(fetchAdminProjectsInit());

    };
};

export const receiveAdminProjects: ActionCreator<
    ThunkAction<Promise<any>, IAdminProjectState, null, IAdminProjectGetAllAction>
    > = () => {
    return async (dispatch: Dispatch) => {

        const socket = getSocketObject();

        socket.on('ProductType.getAdminProjects', (response: IAdminProject[]) => {
            dispatch(fetchAdminProjectsSuccess(response));
        });

    };
};


