
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { Footer } from "../../components";

describe("Footer component tests", () => {
    it("Check Footer Component Render", () => {
        const component = TestRenderer.create(<Footer />).toJSON();
        expect(component).toMatchSnapshot();
    });
});