import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

export class Easel extends Component {
    componentDidMount() {
        let mask,bmp
        const stage = new createjs.Stage(this.canvas);

        /*const circle = new createjs.Shape();
        circle.graphics.beginFill("red").drawCircle(0, 0, 40);
        circle.x = circle.y = 50;
        stage.addChild(circle);*/

        const onImagesLoaded = () => {
            const sc = 1;
            /*const mask = new createjs.Bitmap(imgMask.img);
            mask.scale=sc
           // mask.sourceRect=new createjs.Rectangle(0,0, imgMask.img.width*sc, imgMask.img.height*sc)
            mask.cache(0, 0, img.img.width, img.img.height);*/
            mask = new createjs.Shape();
            mask.cache(0, 0, img.img.width, img.img.height);
            bmp = new createjs.Bitmap(img.img);
            const alphaFilter = new createjs.AlphaMaskFilter(mask.cacheCanvas);
            bmp.filters = [
                alphaFilter
            ];
            bmp.cache(0, 0, img.img.width, img.img.height);
            stage.addChild(bmp);
            // stage.addChild(mask);
            /*mask.graphics.clear().f('#ff0000').r(0, 0, img.img.width * sc, img.img.height * sc)
            mask.updateCache("source-over")*/
            //alphaFilter.applyFilter(mask.cacheCanvas.getContext('2d'), 0, 0, imgMask.img.width*sc, imgMask.img.height*sc, bmp.cacheCanvas.getContext('2d'))
            /*bmp.updateCache()
            stage.update();*/
            stage.update()
            stage.addEventListener("stagemousemove", (e)=>{
                mask.graphics.clear().f("rgba(0,0,0,0.2)").r(stage.mouseX, stage.mouseY, 100,100);
                mask.updateCache("source-over");
                bmp.updateCache();
                stage.update();
            });
        }
        const img = Easel.imageCreate("/demo/public/kwiatek.png");
        const imgMask = Easel.imageCreate("/demo/public/maska-gwiazdka.png");
        Promise.all([img.promise, imgMask.promise])
            .then(onImagesLoaded);
    }

    static imageCreate  (path){
        const img = new Image();
        img.src = path;
        const promise = new Promise((resolve, reject) => {
            img.addEventListener('load', () => {
                resolve();
            })
        })
        return {promise, img};
    }

    render() {
        return (<canvas ref={ref => this.canvas = ref} width="1000" height="1000"/>)
    }
}

Easel.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(Easel)