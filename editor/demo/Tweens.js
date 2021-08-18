import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {Easel} from "./Easel";

class Tweens extends Component {
    componentDidMount() {

        const stage = new createjs.Stage(this.canvas);
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener("tick", (e)=>{
            stage.update()
        });
        const sprite = new createjs.Shape()
        sprite.graphics.f('#ff0000').r(10, 10, 50, 50)
        createjs.Tween.get(sprite, {
            override: true, onChange: () => {
                console.log('change')
            }
        }).to({x: 100},900,createjs.Ease.quadInOut).call(() => {
            console.log('completed sprite tween')
        });
        stage.addChild(sprite);
        //stage.update()
    }

    render() {
        return (<canvas ref={ref => this.canvas = ref} width="1000" height="1000"/>)
    }
}

Tweens.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(Tweens)