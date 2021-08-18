import React from "react";

class ProjectNameComponent extends React.Component {

    constructor(props) {

        super(props);
        this.state = {name: ''};
        this.editor = props.editor;

    }
    componentWillReceiveProps(nextProps){
        if(nextProps.name){
            this.setState({name: nextProps.name});
        }
    }
    onChange(e) {
        this.setState({name: e.target.value});
        this.editor.userProject.setName(e.target.value);

    }

    onBlur(e) {
        this.setState({name: e.target.value});
        this.editor.userProject.setName(e.target.value, true);
    }

    render() {

        return (

            <div className="projectNameCompo">
                <input className='projectName'
                       name="projectName"
                       type="text"
                       placeholder="Projekt bez nazwy"
                       value={this.state.name}
                       onChange={this.onChange.bind(this)}
                       onBlur={this.onBlur.bind(this)}/>
            </div>

        );


    }

}

export {ProjectNameComponent}
