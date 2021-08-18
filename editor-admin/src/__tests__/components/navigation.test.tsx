
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { Navigation } from "../../components";
import { MemoryRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../components/store/store";

describe("Navigation component tests", () => {
    it("Check Navigation Component Render", () => {
        const component = TestRenderer.create(<Provider store={store}><Router><Navigation history={[]} /></Router></Provider>).toJSON();
        expect(component).toMatchSnapshot();
    });
});