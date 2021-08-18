import React,{Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

class DefaultApp extends Component{
    render(){return (<p>I'm default</p>)}
}
DefaultApp.propTypes={}
const mapStateToProps = (state) => {return{}}
const mapDispatchToProps = (dispatch) => {return{}}
export default connect(mapStateToProps,mapDispatchToProps)(DefaultApp)