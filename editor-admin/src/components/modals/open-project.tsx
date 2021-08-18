import * as React from "react";
import {Component} from "react";
import {IAdminProject, IFormat} from "../../models";
import {Modal} from "antd";
import {connect} from "react-redux";
import Button from "antd/es/button";
import { Link } from "react-router-dom";

interface INamePromProps {
    typeID: number,
    groupID: number,
    adminProject: IAdminProject,
    formats: []
}

interface INameFormState {
    showModal: boolean,
    formats: []
}

class OpenProjectComponent extends Component <INamePromProps, INameFormState> {

    constructor(props: any) {
        super(props);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleCreateAdminModal = this.handleCreateAdminModal.bind(this);
        this.state = {
            showModal: false,
            formats: this.props.formats
        }
    };

    public handleCreateAdminModal() {
        this.setState((state, props) => {
            return {
                showModal: true
            };
        });
    }

    public handleSave() {
        // @TODO verify that needed
    }

    public handleCancel() {
        this.setState((state, props) => {
            return {
                showModal: false
            };
        });
    }

    public render() {

        const typeID = this.props.typeID;
        const groupID = this.props.groupID;
        const projectID = this.props.adminProject._id;

        const formatsItems = this.props.formats.map((item: IFormat, key: number) =>
            <li key={key}>
                <Link to={`/project/${groupID}/${typeID}/${projectID}/${item.ID}`}>{item.ID}</Link>
            </li>
        );

        return (<div>
            <Button type="primary" onClick={this.handleCreateAdminModal}>
                Otwórz projekt
            </Button>
            <Modal
            title="Select format to project"
            visible={this.state.showModal}
            onOk={this.handleSave}
            onCancel={this.handleCancel}
        >
                <ul>
                    {formatsItems}
                </ul>
            
            </Modal>
        </div>);

    }
}

export const OpenProject = connect(
    (state: any) => {
        console.log(state);
        return ({error: state.authState.error });
    },
)(OpenProjectComponent);