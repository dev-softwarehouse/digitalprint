
import * as React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { Main, NotFound } from "..";
import { Home, Dashboard, Project } from "../../modules";

export class Routes extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/home" />
                    </Route>
                    <Main path="/home" component={Home} checkAuthentication={false} />
                    <Main path="/dashboard" component={Dashboard} checkAuthentication={true} />
                    <Main path="/project/:groupId/:typeId/:projectId/:formatId" component={Project} checkAuthentication={true} />
                    <Main path="*" component={NotFound} checkAuthentication={false} />
                </Switch>
            </Router>
        )
    }
}