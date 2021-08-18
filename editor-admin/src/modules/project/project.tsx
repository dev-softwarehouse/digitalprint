import * as React from "react";
import {connect} from "react-redux";
import { RouteComponentProps } from 'react-router';
import {bindActionCreators} from "redux";
import {
    initFetchObjectFormat,
    receiveObjectFormat,
    createdObjectFormat,
    initCreateObjectFormat
} from "../../redux/actions/ObjectFormatAction";
import { getOneFormat } from "../../redux/actions/FormatAction";
import {IObjectFormat} from "../../models";

interface DetailParamsInitFormat {
    formatID: number,
}

interface DetailParams {
    formatId: number,
    groupId: number,
    typeId: number
}

interface DetailMatch {
    params: DetailParams
}

interface IMyProps {
    initFetchObjectFormat: (data: DetailParamsInitFormat) => any,
    receiveObjectFormat: () => any,
    initCreateObjectFormat: (data: IObjectFormat) => any,
    createdObjectFormat: () => any,
    getOneFormat: (groupID: number, typeID: number, complexID: number, formatId: number) => any,
    match?: DetailMatch
}

class ProjectComponent extends React.Component <IMyProps & RouteComponentProps, {}> {

    constructor(props: any) {
        super(props);
        console.log('Parametry: ', props.match.params);
    }

    componentDidUpdate(prevProps: any) {
        console.log('test: ', prevProps);
        if (prevProps.isFetching !== this.props.isFetching) {
            this.objectFormatOperate();
        }
    }

    public objectFormatOperate() {
        console.log('tu ???');
    }
    /**
     * get this format
     */
    public componentWillMount() {

        console.log('props: ',this.props);

        /*this.props.getOneFormat(
            this.props.match.params.groupId,
            this.props.match.params.typeId,
            0,
            this.props.match.params.formatId
        ).then( function(data: IFormat) {
            console.log('data iformat: ',data);

        });*/

        const props = this.props;

        this.props.initFetchObjectFormat({formatID: props.match.params.formatId});

        this.props.receiveObjectFormat().then((format: any)  => {
            console.log(format);
        });

        /*
        this.props.receiveObjectFormat().then((format: any) => {

            console.log(format);

            if( format === undefined ) {

                this.props.getOneFormat(
                    props.match.params.groupId,
                    props.match.params.typeId,
                    0,
                    props.match.params.formatId
                ).then( (data: IFormat) => {

                    const newFormatData = {
                        formatID: data.ID,
                        width: data.width,
                        height: data.height,
                        slope: data.slope,
                        name: data.name
                    };
                    this.props.initCreateObjectFormat(newFormatData);

                    this.props.createdObjectFormat().then(function (createdData: IObjectFormat) {
                        console.log('createdData: ', createdData);
                    });

                });
            }
        }); */

    }

    public render() {

        const paramsList = Object.values(this.props.match.params).map((item: string, key) =>
            <li key={key}>{key}: {item}</li>
        );

        return (<div>
            test
            <ul>{paramsList}</ul>
        </div>);
        
    }
}

const mapDispatchToProps = (dispatch: any) => bindActionCreators({
    initFetchObjectFormat,
    receiveObjectFormat,
    getOneFormat,
    initCreateObjectFormat,
    createdObjectFormat
}, dispatch);

export const Project = connect(
    (state: any) => {
        console.log(state.objectFormatState);
        return ({error: state.authState.error, isFetching: true });
    },
    mapDispatchToProps
)(ProjectComponent);