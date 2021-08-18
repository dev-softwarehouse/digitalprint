import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import ImagesList from "../app/class/tools/ImagesList";

class ListDemo extends Component {
    state = {selected:-1,list: [...Array(7).keys()].map(e => ({thumbnail: "https://digitalprint.pro:1341/25/adminAssets/1-10-2017/0/thumb_797490573af5197788b49859f623472b1ea56.png", _id: e}))}

    componentDidMount() {
    }

    render() {
        return (
            <div style={{width: '500px'}}>
                <ImagesList list={this.state.list} selected={this.state.selected} onItemSelect={(id) => {
                this.setState({selected:id})
                }}/>
            </div>)
    }
}

ListDemo.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(ListDemo)