/*

import * as React from "react";
import {Select} from "antd";
import {IGroup, IType} from "../../models";
import "./selects.scss";

interface IMyState {
    groups: [],
    selectedGroupID: number,
}

// @TODO wydzielenie selekta grup

class GroupsComponent extends React.Component <IMyState, {}> {

    constructor(props: any) {
        super(props);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
    }

    handleSelectGroup(groupID: number) {

        this.props.fetchTypes(groupID).then((types: IType[]) => {

            this.setState((state, props) => {
                return {
                    types: types,
                    showTypes: true,
                    selectedGroupID: groupID
                };
            });

        });
    }

    render() {

        const items = this.state.groups.map((item: IGroup, key) =>
            <Option key={item.ID}>{item.name}</Option>
        );

        return (
            <div>
                <h3>
                    Wybierz grupę:
                    {selectedGroupID > 0 ? ' (' + selectedGroupID + ')' : ''}
                </h3>
                <Select onChange={this.handleSelectGroup} className="selectStyle">
                    {items}
                </Select>
            </div>
        );
    }
}

 */