
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { Provider } from "react-redux";
import { Home } from "../../modules";
import {store} from "../../components/store/store";

describe("Home component tests", () => {
    it("Check Home Component Render", () => {
      const component = TestRenderer.create(<Provider store={store}><Home history={[]} /></Provider>).toJSON();
      expect(component).toMatchSnapshot();
    });
});