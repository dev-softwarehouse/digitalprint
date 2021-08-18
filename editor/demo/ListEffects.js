import React, {Component} from 'react'
import {connect} from 'react-redux'
import ImagesList from "../app/class/tools/ImagesList";
import {effectName, ItemRenderer} from '../app/class/tools/proposedPostionTools/EffectsTool'

class ListEffects extends Component {
    state = {
        selected: 'BW',
        list: ['', ...Object.keys(effectName)],
        proposedFake: {thumbnail: "https://digitalprint.pro:1341/kayaking.png"}// kayaking me
    }

    render() {
        return (
            <div style={{width: '500px'}}>
                <ImagesList list={this.state.list}
                            itemRenderer={true}
                            selected={this.state.selected}
                            proposedPositionInstance={this.state.proposedFake}
                            onItemSelect={(id) => {
                                this.setState({selected: id})
                            }}/>
            </div>)
    }
}

ListEffects.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(ListEffects)