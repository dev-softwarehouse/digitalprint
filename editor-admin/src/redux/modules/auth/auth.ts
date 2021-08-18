import {IUser} from "../../../models";

const AUTHORIZATION = 'AUTHORIZATION';
const AUTHORIZATION_FAILURE = 'AUTHORIZATION_FAILURE';
const AUTHORIZATION_SUCCESS = 'AUTHORIZATION_SUCCESS';
const AUTHORIZATION_SOCKET_CONNECTED = 'AUTHORIZATION_SOCKET_CONNECTED';
const AUTHORIZATION_SOCKET_FAIL = 'AUTHORIZATION_SOCKET_FAIL';
const AUTHORIZATION_LOGOUT = 'AUTHORIZATION_LOGOUT';

export const authorizationFailure = (error: string) => {
    return {
        type: AUTHORIZATION_FAILURE,
        error: 'Error auth: ' + error,
    }
};

export const authorizationSuccess  = (user: IUser[], token: string) => {
    return {
        type: AUTHORIZATION_SUCCESS,
        user,
        authenticated: true,
        token: token
    }
};

export const authorizationSocketConnected = (socket: object) => {
    return {
        type: AUTHORIZATION_SOCKET_CONNECTED,
        socket: socket
    }
};

export const authorizationSocketFail = (error: string) => {
    return {
        type: AUTHORIZATION_SOCKET_FAIL,
        error: 'Error: ' + error
    }
};

export const authorizationLogout = () => {
    return {
        type: AUTHORIZATION_LOGOUT,
        socket: {},
        authenticated: false,
        token: ""
    }
};

const initialState = {
    authorizationInProgress: false,
    error: "",
};

export const auth = (state = initialState, action: any, user: IUser[], token: string) => {

    console.log('auth action: ', action.socket);

    switch (action.type) {
        case AUTHORIZATION:
            return {
                ...state,
                authorizationInProgress: true,
            };
        case AUTHORIZATION_FAILURE:
            return {
                ...state,
                authorizationInProgress: false,
                error: action.error,
            };
        case AUTHORIZATION_SUCCESS:
            return  {
                ...state,
                authorizationInProgress: false,
                error: "",
                user,
                authenticated: true,
                token: token
            };
        case AUTHORIZATION_SOCKET_CONNECTED:
            return {
                ...state,
                socket: action.socket
            };
        case AUTHORIZATION_LOGOUT:
            return {
                ...state,
                socket: {},
                authenticated: false,
                authorizationInProgress: false,
                token: ""
            };
        default :
            return state
    }
};