
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { Routes } from "../../components";
import { Provider } from "react-redux";
import { store } from "../../components/store/store"

describe("Routes component tests", () => {
    it("Check Routes Component Render", () => {
        const component = TestRenderer.create(<Provider store={store}><Routes /></Provider>).toJSON();
        expect(component).toMatchSnapshot();
    });
});