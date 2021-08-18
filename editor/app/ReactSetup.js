import { applyMiddleware, createStore }  from 'redux'
import logger from 'redux-logger'
import rootReducer from './reducers/index'
export let store;
export const reactInit=()=>{
    store = createStore(rootReducer,applyMiddleware(logger));
}