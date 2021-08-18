import {Provider} from 'react-redux';
import React, {Component} from 'react';
import ReactSetup from '../app/ReactSetup'
import List from "./List";
import Easel from "./Easel";
import ListEffects from "./ListEffects";
import Shadowed from './Shadowed'
import Tweens from './Tweens'

export class Demo extends Component {

    state = {startComponent: null}

    componentDidMount() {
        const appFile = window.location.hash ? window.location.hash.substring(1) : './DefaultApp'
        this.setState({startComponent: Tweens})
        /*import(`${appFile}`)
            .then((module) => {
                this.setState({startComponent: module.default})
            }).catch((e) => {
            console.error(e)
        })*/

    }

    render() {
        const ToRender = this.state.startComponent;
        return ToRender?<React.Fragment>
            <ToRender/>
        </React.Fragment>
            :null;
    }
}

