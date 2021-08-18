import ReactDOM from 'react-dom';
import React, {Component} from 'react'
import {Demo} from './Demo';
import {store,reactInit} from "../app/ReactSetup";
import {Provider} from "react-redux";

reactInit();
ReactDOM.render(<Provider store={store}><Demo/></Provider>, document.getElementById('root'));