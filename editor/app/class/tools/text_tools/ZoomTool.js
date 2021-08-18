import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

class ZoomTool extends Component{
    componentDidUpdate(){
        this.props.textInstance.zoom()
    }
    render(){return null}
}
ZoomTool.propTypes={}
const mapStateToProps = (state) => {return{
    selected:state.textToolbar.zoom.selected
}}
const mapDispatchToProps = (dispatch) => {return{}}
export default connect(mapStateToProps,mapDispatchToProps)(ZoomTool)