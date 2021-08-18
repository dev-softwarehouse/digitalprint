
import "./main.scss";
import * as React from "react";
import {Route, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Navigation, Footer} from "..";

// @ts-ignore
import {store} from "../store/store";

interface IMainContainerProps {
    component: any;
    authenticated: boolean;
    path?: string;
    exact?: boolean;
    checkAuthentication: boolean;
}
class MainContainer extends React.Component<IMainContainerProps, any> {
    public render() {
        const {component: Component, ...rest} = this.props;

        return <Route {...rest} render={(matchProps: any) =>
            (this.props.checkAuthentication && !this.props.authenticated) ?
                (
                    <Redirect to="/"/>
                ) :
                (
                    <div className="wrapper">
                        <Navigation history={matchProps.history}/>
                        <Component {...matchProps} />
                        <div className="push" />
                        <Footer/>
                    </div>
                )
        }/>
    }
}

const mapDispatchToProps = (dispatch: any) => bindActionCreators({}, dispatch);

export const Main = connect(
    (state: any) => {

        const token = store.getState().authState.token;

        if( token !== undefined && token.length > 0 ) {
            return ({authenticated: true});
        }
        if( state.authState === undefined ) {
            return ({authenticated: false});
        }
        return ({authenticated: state.authState.authenticated});
    },
    mapDispatchToProps
)(MainContainer);