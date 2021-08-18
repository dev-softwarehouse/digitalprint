
import "./navigation.scss";
import { Resources } from "../../resources"
import * as React from "react";
import { Link } from "react-router-dom";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {store} from "../store/store";
import {authorizeLogout} from "../../redux/actions/AuthAction";
import { getSocketObject } from "../../helpers/socket";
// @ts-ignore
import cookie from 'react-cookies';
import { authorizeSocketConnect } from "../../redux/actions/AuthAction";

interface INavigationComponentProps {
    history: any;
    authenticated: boolean;
    error: string;
    authorizeLogout: () => void,
    authorizeSocketConnect: (token: string) => any
}

class NavigationComponent extends React.Component<INavigationComponentProps, {}> {
    public static propTypes = {
        authenticated: PropTypes.bool.isRequired,
        error: PropTypes.string.isRequired,
    };

    constructor(props: INavigationComponentProps) {
        super(props);
        this.state = {};
    };

    componentWillMount() {

        const token = store.getState().authState.token;

        const socket = getSocketObject();

        if( !socket?.connected && token ) {
            this.props.authorizeSocketConnect(token).then(function(socketObject: any) {
                console.log('socket: ', socketObject);
            });
        }

    }

    public handleUnAuth = () => {
        this.props.authorizeLogout();
        cookie.remove('jwtToken');
        this.props.history.push("/");
    };

    public handleAuth = () => {
        this.props.history("dashboard");
    };

    public render() {

        return (
            <div className="navigation">
                <div className="navigation-logo">
                    <nav className="navbar navbar-default">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-logo" aria-expanded="false">
                                    <span className="sr-only">{Resources.Navigation.ToggleNavigation}</span>
                                    <span className="icon-bar"/>
                                    <span className="icon-bar"/>
                                    <span className="icon-bar"/>
                                </button>
                                <a className="navbar-brand" href="/"><span>Admin editor</span></a>
                            </div>
                            <div className="collapse navbar-collapse" id="nav-logo">
                                {this.props.authenticated ? (
                                    <ul className="nav navbar-nav navbar-right">
                                        <li className="hidden-md hidden-lg"><Link to="/">Home</Link></li>
                                        <li className="hidden-md hidden-lg"><Link to="/dashboard">{Resources.Navigation.Dashboard}</Link></li>
                                        <li><Link to="/settings">{Resources.Navigation.Settings}</Link></li>
                                        <li><a href="#" onClick={this.handleUnAuth}>{Resources.Navigation.SignOut}</a></li>
                                    </ul>
                                ) : (
                                    <ul className="nav navbar-nav navbar-right">
                                        <li className="hidden-md hidden-lg"><Link to="/">Home</Link></li>
                                        <li><a href="#" onClick={this.handleAuth}>{Resources.Navigation.SignIn}</a></li>
                                    </ul>
                                )
                                }
                            </div>
                        </div>
                    </nav>
                </div>
                <div className="navigation">
                    <nav className="navbar navbar-default">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <Link className="navbar-brand hidden-xs hidden-sm" to="/">Admin testing</Link>
                            </div>
                            <div className="collapse navbar-collapse" id="nav">
                                {this.props.authenticated ? (
                                    <ul className="nav navbar-nav">
                                        <li><Link to="/dashboard">{Resources.Navigation.Dashboard}</Link></li>
                                    </ul>
                                ) : ("")
                                }
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    authorizeLogout,
    authorizeSocketConnect
}, dispatch);

export const Navigation = connect(
    (state: any) => {
        return ({authenticated: state.authState.authenticated, authorizationInProgress: state.authState.authorizationInProgress, error: state.authState.error });
    },
    mapDispatchToProps
)(NavigationComponent);