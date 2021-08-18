import {IAdminProject} from "../../../models";

const FETCHING_ADMIN_PROJECTS = 'FETCHING_ADMIN_PROJECTS';
const FETCHING_ADMIN_PROJECTS_FAILURE = 'FETCHING_ADMIN_PROJECTS_FAILURE';
const FETCHING_ADMIN_PROJECTS_SUCCESS = 'FETCHING_ADMIN_PROJECTS_SUCCESS';
// const CREATE_ADMIN_PROJECT = 'CREATE_ADMIN_PROJECT';
const CREATE_ADMIN_PROJECT_FAILURE = 'CREATE_ADMIN_PROJECT_FAILURE';
const CREATE_ADMIN_PROJECT_SUCCESS = 'CREATE_ADMIN_PROJECT_SUCCESS';
const CREATE_ADMIN_PROJECT_SENT = 'CREATE_ADMIN_PROJECT_SENT';

export const createAdminProjectFailure = (error: string) => {
    return {
        type: CREATE_ADMIN_PROJECT_FAILURE,
        error: 'Error create admin project.',
    }
};

export const createAdminProjectSent = () => {
    return {
        type: CREATE_ADMIN_PROJECT_SENT,
        status: 'waiting',
    }
};

export const createAdminProjectSuccess = (adminProjectData: IAdminProject) => {
    return {
        type: CREATE_ADMIN_PROJECT_SUCCESS,
        adminProject: adminProjectData,
    }
};

export const fetchAdminProjectsInit = () => {
    return {
        type: FETCHING_ADMIN_PROJECTS,
        isFetching: true
    }
};

export const fetchAdminProjectsFailure = (error: string) => {
    return {
        type: FETCHING_ADMIN_PROJECTS_FAILURE,
        error: 'Error fetching admin projects.',
    }
};

export const fetchAdminProjectsSuccess = (adminProjectsData: IAdminProject[]) => {
    return {
        type: FETCHING_ADMIN_PROJECTS_SUCCESS,
        adminProjects: adminProjectsData
    }
};


const initialState = {
    authorizationInProgress: false,
    error: "",
};

export const adminProjects = (state = initialState, action: any, adminProjectsData: IAdminProject[]) => {

    switch (action.type) {
        case FETCHING_ADMIN_PROJECTS:
            return {
                ...state,
                isFetching: true,
            };
        case FETCHING_ADMIN_PROJECTS_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: action.error,
            };
        case FETCHING_ADMIN_PROJECTS_SUCCESS:
            return  {
                ...state,
                isFetching: false,
                adminProjects: adminProjectsData
            };
        case CREATE_ADMIN_PROJECT_SUCCESS:
            return {
                ...state,
                adminProject: action.adminProject
            };
        default :
            return state
    }
};