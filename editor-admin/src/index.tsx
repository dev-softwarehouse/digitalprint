

import "bootstrap-loader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {Routes} from "./components";
import { PersistGate } from 'redux-persist/integration/react';
import {IGroupState} from "./redux/reducers/groupReducer";
import {ITypeState} from './redux/reducers/typeReducer';
import {IFormatState} from './redux/reducers/formatReducer';
import {IAdminProjectState} from "./redux/reducers/adminProjectReducer";
import {IAuthState} from "./redux/reducers/authReducer";
import {IObjectFormatState} from './redux/reducers/objectFormatReducer';
import { store, persistor } from "./components/store/store";
import { saveState } from "./components/localStore/localStorage";

// @ts-ignore
import throttle from "lodash/throttle";

export interface IAppState {
    groupState: IGroupState;
    typeState: ITypeState;
    formatState: IFormatState;
    adminProjectState: IAdminProjectState
    authState: IAuthState;
    objectFormatState: IObjectFormatState;
}

store.subscribe(throttle(() => {
   saveState({
       state: store.getState()
   });
}, 1000));

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Routes/>
        </PersistGate>
    </Provider>,
    document.getElementById("app")
);
