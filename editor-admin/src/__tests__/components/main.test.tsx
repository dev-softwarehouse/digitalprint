
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { MemoryRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Main } from "../../components";
import { Home } from "../../modules";
import { store } from "../../components/store/store";

describe("Main component tests", () => {
    it("Check Main Component Render", () => {
        const component = TestRenderer.create(<Provider store={store}><Router><Main path="/home" component={Home} checkAuthentication={false} /></Router></Provider>).toJSON();
        expect(component).toMatchSnapshot();
    });
});