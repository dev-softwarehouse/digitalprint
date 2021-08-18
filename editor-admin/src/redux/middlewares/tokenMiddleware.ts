const enum TOKEN_ACTIONS {
    'ON_INIT',
    'RECEIVE_TOKEN'
}

export interface IAuthState {
    readonly token: string;
    readonly type: number;
};

export const tokenMiddleware = (store: any) => (next: any) => (action: IAuthState) => {

    switch(action.type) {

        case TOKEN_ACTIONS.ON_INIT:
            next({
                type: TOKEN_ACTIONS.RECEIVE_TOKEN,
                token: localStorage.getItem('token')
            });
            break;

        case TOKEN_ACTIONS.RECEIVE_TOKEN:

            localStorage.setItem('token', action.token);

            break;

    }

    return next(action);

};