
import "./dashboard.scss";
import * as React from "react";
import {Select, Row, Col, Modal, Card} from "antd";
import {getGroups, getGroupsError} from "../../redux/reducers/groupReducer";
import {getTypes, getTypesError} from "../../redux/reducers/typeReducer";
import {getFormats, getFormatsError} from "../../redux/reducers/formatReducer";
import {getAllGroups} from "../../redux/actions/GroupAction";
import {getAssociatedTypes} from "../../redux/actions/TypeAction";
import {getAssociatedFormats} from "../../redux/actions/FormatAction";
import {initFetchAdminProjects, receiveAdminProjects} from "../../redux/actions/AdminProjectAction";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {IGroup, IType, IFormat, IAdminProject} from "../../models";
import Button from "antd/es/button";
import { NameForm} from "../../components/forms/input";
import { store } from "../../components/store/store";
import {OpenProject} from "../../components/modals/open-project";

interface IMyProps {
    groups: string,
    fetchGroups: () => any,
    fetchTypes: (groupID: number) => any,
    fetchFormats: (groupID: number, typeID: number, complexID: number) => any,
    fetchAdminProjects: (typeID: number) => any,
    initFetchAdminProjects: (data: object) => any,
    receiveAdminProjects: () => any
    form: object,
    adminProjects: IAdminProject[]
}

interface IMyState {
    groups: [],
    types: [],
    formats: [],
    adminProjects: [],
    showTypes: boolean,
    showFormats: boolean,
    showModal: boolean,
    selectedGroupID: number,
    selectedTypeID: number,
    token: string
}

const {Option} = Select;

class DashboardComponent extends React.Component <IMyProps, IMyState> {

    public selectStyle = {
        width: "200px",
    };

    public colStyle = {
        background: "#D4DAD0"
    };

    constructor(props: any) {
        super(props);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.handleSelectType = this.handleSelectType.bind(this);
        this.handleSelectFormat = this.handleSelectFormat.bind(this);
        this.handleCreateAdminModal = this.handleCreateAdminModal.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        
        this.state = {
            groups: [],
            types: [],
            formats: [],
            adminProjects: [],
            showTypes: false,
            showFormats: false,
            showModal: false,
            selectedGroupID: 0,
            selectedTypeID: 0,
            token: store.getState().authState.token
        }
    };

    componentWillMount() {

        this.props.fetchGroups().then((groups: IGroup[]) => {

            this.setState((state, props) => {
                return {groups: groups};
            });

        });
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

    handleSelectType(typeID: number) {

        this.props.fetchFormats(this.state.selectedGroupID, typeID, 0).then((formats: IFormat[]) => {

            this.setState((state, props) => {
                return {
                    formats: formats,
                    showFormats: true,
                    selectedTypeID: typeID
                };
            });

        });

        this.props.initFetchAdminProjects({typeID});

        this.props.receiveAdminProjects().then((response: any) => {
            console.log(response);
        });
    }

    handleSelectFormat(formatID: number) {
        console.log(this.state.selectedGroupID, this.state.selectedTypeID, formatID);
    }

    handleCreateAdminModal() {
        this.setState((state, props) => {
            return {
                showModal: true
            };
        });
    }

    public handleSave() {
        // @TODO verify that needed
    }

    handleCancel() {
        this.setState((state, props) => {
            return {
                showModal: false
            };
        });
    }

    handleFormChange() {
        console.log('form change!', this.state);
    }

    render() {

        const items = this.state.groups.map((item: IGroup, key) =>
            <Option key={item.ID}>{item.name}</Option>
        );

        const typesItems = this.state.types.map((item: IType, key) =>
            <Option key={item.ID}>{item.name}</Option>
        );

        const formatsItems = this.state.formats.map((item: IType, key) =>
            <Option key={item.ID}>{item.name}</Option>
        );

        const selectedGroupID = this.state.selectedGroupID;
        const selectedTypeID = this.state.selectedTypeID;

        return (
            <div className="container-fluid dashboard">
                <h1>Welcome to Dashboard!</h1>
                <div>
                    <Row>
                        <Col span={12}>
                            <h3>
                                Wybierz grupę:
                                {selectedGroupID > 0 ? ' (' + selectedGroupID + ')' : ''}
                            </h3>
                            <Select onChange={this.handleSelectGroup} style={this.selectStyle}>
                                {items}
                            </Select>
                            <div style={this.state.showTypes ? {display: "block"} : {display: "none"}}>
                                <h3>
                                    Wybierz typ:
                                    {selectedTypeID > 0 ? ' (' + selectedTypeID + ')' : ''}
                                </h3>
                                <Select onChange={this.handleSelectType} style={this.selectStyle}>
                                    {typesItems}
                                </Select>
                            </div>
                            <div style={this.state.showFormats ? {display: "block"} : {display: "none"}}>
                                <h3>Wybierz format:</h3>
                                <Select onChange={this.handleSelectFormat} style={this.selectStyle}>
                                    {formatsItems}
                                </Select>
                            </div>
                        </Col>
                        <Col span={12} style={this.colStyle}>
                            <Button onClick={this.handleCreateAdminModal}>Create new AdminProject</Button>
                            <br /><br />
                            <Card title="Przypisane projekty" style={{ width: 300 }}>
                                <ul>
                                    {this.props.adminProjects.map((item, index) => (
                                        <li key={index}>
                                            {item.name}
                                            <OpenProject groupID={this.state.selectedGroupID} 
                                                         typeID={this.state.selectedTypeID} adminProject={item}
                                                         formats={this.state.formats} />
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <Modal
                    title="Create admin project"
                    visible={this.state.showModal}
                    onOk={this.handleSave}
                    onCancel={this.handleCancel}
                >
                    <NameForm typeID={this.state.selectedTypeID}/>

                    <br/><br/>
                    <h3>Działa token i sockety :)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           </h3>
                    <div>{this.state.token}</div>

                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state: any) => ({
    groupError: getGroupsError(state),
    typeError: getTypesError(state),
    formatError: getFormatsError(state),
    groups: getGroups(state),
    types: getTypes(state),
    formats: getFormats(state),
    adminProjects: state.adminProjectState.adminProjects
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    fetchGroups: getAllGroups,
    fetchTypes: getAssociatedTypes,
    fetchFormats: getAssociatedFormats,
    initFetchAdminProjects: initFetchAdminProjects,
    receiveAdminProjects: receiveAdminProjects
}, dispatch);

export const Dashboard = connect(
    mapStateToProps,
    mapDispatchToProps
)(DashboardComponent);
  