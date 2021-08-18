import * as React from "react";
import {Component} from "react";
import {bindActionCreators} from "redux";
import {createAdminProject, receiveAdminProject} from "../../redux/actions/AdminProjectAction";
import {connect} from "react-redux";
import {IAdminProject} from "../../models";

interface INamePromProps {
    createAdminProject: (data: object) => any,
    receiveAdminProject: () => any,
    adminProject: IAdminProject,
    typeID: number
}

interface INameFormState {
    adminProject: IAdminProject|object
}

class NameFormComponent extends Component <INamePromProps, INameFormState> {

    public input: HTMLInputElement| {
        value: HTMLInputElement
    } | null;

    constructor(props: any) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            adminProject: {}
        }
    }

    public handleSubmit(e: any) {
        e.preventDefault();

        if( this.input !== null && this.input !== undefined ) {
            this.props.createAdminProject({name: this.input.value, typeID: this.props.typeID});
        }
        
        this.props.receiveAdminProject().then((response: any) => {
            console.log(response);
        });

    }

    public shouldComponentUpdate(nextProps: INamePromProps) {
        console.log(this.props, nextProps);
        return this.props.adminProject !== nextProps.adminProject;
    }

    public render() {

        if( this.props.adminProject && this.props.adminProject.hasOwnProperty('name') && this.props.adminProject.name.length > 0  ) {
            return (
                <div>Projekt o nazwie <b>{this.props.adminProject.name}</b>, został dodany!</div>
            );
        }

        return (<form onSubmit={this.handleSubmit}>
            <label>
                Name:
                <input type="text" ref={(input) => this.input = input} />
            </label>
            <input type="submit" value="Submit" />
        </form>);

    }
}

const mapStateToProps = (state: any) => ({
    adminProject: state.adminProjectState.adminProject
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    createAdminProject,
    receiveAdminProject
}, dispatch);

export const NameForm = connect(
    mapStateToProps,
    mapDispatchToProps
)(NameFormComponent);