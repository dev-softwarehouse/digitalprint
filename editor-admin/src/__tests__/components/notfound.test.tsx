
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { NotFound } from "../../components";

describe("NotFound component tests", () => {
    it("Check NotFound Component Render", () => {
        const component = TestRenderer.create(<NotFound />).toJSON();
        expect(component).toMatchSnapshot();
    });
});