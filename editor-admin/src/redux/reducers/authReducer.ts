import {IUser} from "../../models";
import {Reducer} from "redux";
import {AuthActions, AuthActionTypes} from "../actions/AuthAction";
import {loadState} from '../../components/localStore/localStorage';


export interface IAuthState {
    readonly user: IUser;
    readonly authenticated: boolean;
    readonly token: string;
    readonly authorizationInProgress: boolean;
    readonly error: string;
}

const initialAuthState: IAuthState = {
    user: {
        userID: '',
        firstname: '',
        'super': false,
    },
    authenticated: false,
    authorizationInProgress: false,
    token: '',
    error: ""
};

export const authReducer: Reducer<IAuthState, AuthActions> = (
    state = initialAuthState,
    action
) => {

    let storageAuthState = loadState()?loadState().state.authState:initialAuthState;

    switch (action.type) {
        case AuthActionTypes.AUTHORIZATION: {
            return {
                ...state,
                user: action.user,
                authenticated: true
            };
        }
        case AuthActionTypes.AUTHORIZATION_SUCCESS: {
            return {
                ...state,
                user: action.user,
                authenticated: action.authenticated,
                token: action.token,
                authorizationInProgress: false
            };
        }
        case AuthActionTypes.AUTHORIZATION_SOCKET_CONNECTED: {
            return {
                ...state
            };
        }
        case AuthActionTypes.AUTHORIZATION_LOGOUT: {
            return {
                ...initialAuthState
            };
        }
        default:
            return {
                ...state,
                ...storageAuthState
            };
    }
};

export const authorize = (state: any) => state.auth;
export const authorizeError = (state: any) => state.error;