import {Reducer} from 'redux';
import {AdminProjectActions, AdminProjectActionTypes} from '../actions/AdminProjectAction';
import {IAdminProject} from '../../models';

export interface IAdminProjectState {
    readonly adminProjects: IAdminProject[];
    readonly adminProject: IAdminProject;
}

const initialAdminProjectState: IAdminProjectState = {
    adminProjects: [],
    adminProject: {
        _id: 0,
        name: '',
        url: '',
        active: false,
        projectMin: '',
        colors: [''],
        activeColors: ['']
    }
};

export const adminProjectReducer: Reducer<IAdminProjectState, AdminProjectActions> = (
    state = initialAdminProjectState,
    action
) => {

    switch (action.type) {
        case AdminProjectActionTypes.GET_ALL: {
            return {
                ...state,
                adminProjects: action.adminProjects,
            }
        }
        case AdminProjectActionTypes.CREATE_ADMIN_PROJECT_SUCCESS: {
            return {
                ...state,
            adminProject: action.adminProject,
            }
        }
        case AdminProjectActionTypes.FETCHING_ADMIN_PROJECTS: {
               return {
                   ...state
               }
        }
        case AdminProjectActionTypes.FETCHING_ADMIN_PROJECTS_SUCCESS: {
            return {
                ...state,
                adminProjects: action.adminProjects
            }
        }
        default:
            return state;
    }
};

export const getAdminProjects = (state: any) => state.adminProjects;