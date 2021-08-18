import {applyMiddleware, combineReducers, createStore} from "redux";
import {IAppState} from "../../index";
import {groupReducer} from "../../redux/reducers/groupReducer";
import {typeReducer} from "../../redux/reducers/typeReducer";
import {formatReducer} from "../../redux/reducers/formatReducer";
import {adminProjectReducer} from "../../redux/reducers/adminProjectReducer";
import { authReducer } from "../../redux/reducers/authReducer";
import thunk from "redux-thunk";
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import {objectFormatReducer} from "../../redux/reducers/objectFormatReducer";

const rootReducer = combineReducers<IAppState>({
    groupState: groupReducer,
    typeState: typeReducer,
    formatState: formatReducer,
    adminProjectState: adminProjectReducer,
    authState: authReducer,
    objectFormatState: objectFormatReducer
});

const persistConfig = {
    key: 'root',
    storage
};

const pReducer = persistReducer(persistConfig, rootReducer);
const middleware = applyMiddleware(
    thunk
);

const store = createStore(pReducer, middleware);
const persistor = persistStore(store);

export { persistor, store };

/***
const store = createStore(rootReducer, applyMiddleware(
        thunk,
        // ReactActionSocketMiddleware(socketConnect('')),
    )
);

export default store;

 */



/*const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default () => {
    const store = createStore(persistedReducer, applyMiddleware(
        thunk,
        // ReactActionSocketMiddleware(socketConnect('')),
        )
    );
    const persistObject = persistStore(store);
    return { store, persistObject }
}*/

/*
const store = createStore(
    combineReducers(reducers),
    {},
    compose(
        autoRehydrate(),
        applyMiddleware(thunk)
    )
)

 */