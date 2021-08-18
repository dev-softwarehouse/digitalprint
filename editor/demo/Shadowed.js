import React,{Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {Easel} from './Easel'
class Shadowed extends Component{

    componentDidMount(){
        let mask,bmp
        const stage = new createjs.Stage(this.canvas);
        const img = Easel.imageCreate("/demo/public/tree.png");//kwiatek
        const imgMask = Easel.imageCreate("/demo/public/maska-serce.png");
        Promise.all([img.promise, imgMask.promise])
            .then(()=>{
                const sc = 1;
                /*
                //Dla sprawdzeń czy pokrywa się
                const bmp0 = new createjs.Bitmap(img.img);
                stage.addChild(bmp0);*/
                mask = new createjs.Bitmap(imgMask.img);
                mask.cache(0, 0, imgMask.img.width, imgMask.img.height);
                bmp = new createjs.Bitmap(img.img);
                const alphaFilter = new createjs.AlphaMaskFilter(mask.cacheCanvas);
                bmp.filters = [
                   alphaFilter
                ];
                bmp.shadow=new createjs.Shadow("#ff0000", 0, 0, 20);
                bmp.cache(0, 0, img.img.width, img.img.height);
                stage.addChild(bmp);
                stage.update()
            });
    }

    render(){
        return (<canvas ref={ref => this.canvas = ref} width="1000" height="1000"/>)
    }
}
Shadowed.propTypes={}
const mapStateToProps = (state) => {return{}}
const mapDispatchToProps = (dispatch) => {return{}}
export default connect(mapStateToProps,mapDispatchToProps)(Shadowed)