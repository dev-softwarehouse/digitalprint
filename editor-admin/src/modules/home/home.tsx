
import "./home.scss";
import {Resources} from "../../resources";
import * as React from "react";
import * as PropTypes from "prop-types";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {authorizeRequest, authorizeSocketConnect} from "../../redux/actions/AuthAction";
import {authorize, authorizeError} from "../../redux/reducers/authReducer";

// @ts-ignore
import cookie from 'react-cookies';

interface IHomeComponentProps {
    history: any;
    authenticated: boolean;
    error: string;
    authorizeRequest: () => any;
    authorizeSocketConnect: (token: string) => any;
}

class HomeComponent extends React.Component<IHomeComponentProps, {}> {
    public static propTypes = {
        authenticated: PropTypes.bool.isRequired,
        error: PropTypes.string.isRequired,
    };

    constructor(props: IHomeComponentProps) {
        super(props);
        this.state = {};
    }

    public handleAuth = () => {
        const that = this;

        this.props.authorizeRequest().then(function(response: any) {
            that.props.authorizeSocketConnect(response.token).then(function(socketObject: any) {

                const expires = new Date();
                expires.setTime(expires.getTime() + (60 * 60 * 24 * 7 * 1000));
                cookie.save('jwtToken', response.token, { path: '/' , expires});

                that.props.history.push('/dashboard');

            });
        });
    };

    public render() {

        return (
            <div className="container-fluid home">
                <div className="row">
                    <div className="hero-container">
                        {!this.props.authenticated ? (
                            <button className="btn btn-white hero-sign-in" onClick={this.handleAuth}>
                                {Resources.Home.SignIn}
                                <i className="glyphicon glyphicon-menu-right" />
                            </button>
                        ) : (
                            <h1 className="hero-sign-in welcome">Welcome to Home!</h1>
                        )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: any) => ({
    authorize: authorize(state),
    authorizeError: authorizeError(state),
    authorizationInProgress: state.authState.authorizationInProgress,
    error: state.authState.error,
    authenticated: state.authState.authenticated
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    authorizeRequest,
    authorizeSocketConnect
}, dispatch);

export const Home = connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeComponent);

