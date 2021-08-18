import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import axios from 'axios';
import {IUser} from "../../models/user";
import {IAuthState} from "../reducers/authReducer";
import {
    authorizationFailure,
    authorizationSocketConnected,
    authorizationSocketFail,
    authorizationSuccess,
    authorizationLogout
} from "../modules/auth/auth";
import * as queryString from "query-string";
import {socketConnect} from "../../helpers/socket";

export enum AuthActionTypes {
    AUTHORIZATION = 'AUTHORIZATION',
    AUTHORIZATION_SUCCESS = 'AUTHORIZATION_SUCCESS',
    AUTHORIZATION_FAIL = 'AUTHORIZATION_FAIL',
    AUTHORIZATION_SOCKET_CONNECTED = 'AUTHORIZATION_SOCKET_CONNECTED',
    AUTHORIZATION_SOCKET_FAIL = 'AUTHORIZATION_SOCKET_CONNECTED',
    AUTHORIZATION_LOGOUT = 'AUTHORIZATION_LOGOUT'
}

export interface IAuthAuthorizeAction {
    type: AuthActionTypes.AUTHORIZATION;
    user: IUser;
}

export interface IAuthAuthorizationSuccessAction {
    type: AuthActionTypes.AUTHORIZATION_SUCCESS;
    user: IUser;
    authenticated: boolean,
    token: string
}

export interface IAuthAuthorizationSocketConnected {
    type: AuthActionTypes.AUTHORIZATION_SOCKET_CONNECTED,
    socket: object
}

export interface IAuthAuthorizationSocketFail {
    type: AuthActionTypes.AUTHORIZATION_SOCKET_FAIL,
    error: string
}

export interface IAuthAuthorizationLogout {
    type: AuthActionTypes.AUTHORIZATION_LOGOUT;
    user: IUser;
    authenticated: boolean,
    token: string
}

export type AuthActions = IAuthAuthorizeAction | IAuthAuthorizationSuccessAction | IAuthAuthorizationSocketConnected |
    IAuthAuthorizationLogout;

export const authorizeRequest: ActionCreator<
    ThunkAction<Promise<any>, IAuthState, null, IAuthAuthorizeAction>
    > = () => {
    return async (dispatch: Dispatch) => {
        try {
            const data = {
                email: 'super_robert',
                password: '@edit#123'
            };

            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            };
            const response = await axios.post(`http://localtest.me:2600/login?domainName=localtest.me`, queryString.stringify(data), config);
            dispatch(authorizationSuccess(response.data.user, response.data.token));
            return response.data;
        } catch (err) {
            dispatch(authorizationFailure(err));
        }
    };
};

export const authorizeSocketConnect: ActionCreator<
    ThunkAction<Promise<any>, IAuthState, null, IAuthAuthorizationSocketConnected> > = (token: string) => {
    return async (dispatch: Dispatch) => {
        try {
            const socket = socketConnect(token);
            dispatch(authorizationSocketConnected(socket));
            return socket;
        } catch (err) {
            dispatch(authorizationSocketFail(err));
            return {};
        }
    };
};

export const authorizeLogout: ActionCreator<
    ThunkAction<Promise<any>, IAuthState, null, IAuthAuthorizationLogout> > = () => {
    return async (dispatch: Dispatch) => {
        dispatch(authorizationLogout());
        return true;
    };
};