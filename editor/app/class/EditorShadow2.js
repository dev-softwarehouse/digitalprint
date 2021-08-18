import {Editor} from '../Editor';
import {TextLine} from '../class/TextLine';

export default class EditorShadow2 extends createjs.Bitmap {
    constructor(parent, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, uglify) {
        super();
        Object.assign(this, {parent, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, uglify});
        createjs.Bitmap.call(this, this.generateShadow(this, parent, shadowBlur, shadowColor, uglify, shadowOffsetX, shadowOffsetY));
        //TODO W zasadzie powyższy konstructor powinien pokazać
        this.updateShadow(parent, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY);
        this.type = 'EditorShadow';
    }

    updateShadow(parent, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY) {
        const bitmap = this.generateShadow(parent, shadowBlur, shadowColor, this.uglify, shadowOffsetX, shadowOffsetY);
        try {
            this.image.src = bitmap;
        } catch (e) {
            console.log(e)
        }

    }

    setOffsetX(v) {
        //this.x = ( (-this.blur*2 )+offsetX )
    }

    setOffsetY() {
    }

    generateShadow(parent, shadowBlur, shadowColor, uglify, shadowOffsetX, shadowOffsetY) {
        const {canvasWidth, canvasHeight} = this._getSize(parent, shadowBlur, uglify);

        let blurZone = this._getBlurZone(parent.width, parent.height);

        const shadowMaker = document.createElement('canvas');
        shadowMaker.setAttribute('height', canvasHeight + blurZone);
        shadowMaker.setAttribute('width', canvasWidth + blurZone);
        shadowMaker.className = 'shadowMaker';
        document.body.appendChild(shadowMaker);

        const shadowCtx = shadowMaker.getContext('2d')


        shadowCtx.shadowColor = shadowColor;
        shadowCtx.shadowBlur = shadowBlur;
        shadowCtx.shadowOffsetX = shadowOffsetX;
        shadowCtx.shadowOffsetY = shadowOffsetY;
        if (parent.type === 'ProposedPosition') {

            shadowCtx.fillRect(blurZone / 2, blurZone / 2, parent.width, parent.height)
            this.x = -blurZone / 2;
            this.y = -blurZone / 2;

        } else if (parent.type === 'Text2') {
            parent.children.filter((c) => c instanceof TextLine)
                .forEach((c) => {
                    c.shadow = {color: shadowColor, offsetX: shadowOffsetX, offsetY: shadowOffsetY, blur: shadowBlur}
                })
            // Editor.debugCanvas({width:blurZone,height:blurZone,canvas:shadowMaker})
        }
        const shadowBitmap = shadowMaker.toDataURL();
        document.body.removeChild(shadowMaker);
        return shadowBitmap;
    }

    _getSize(parent, blurValue, uglify) {
        let canvasHeight, canvasWidth;
        if (parent) {

        }
        if (parent.type === 'ProposedPosition') {
            if (parent.backgroundFrame) {
                canvasWidth = parent.backgroundFrame.frameWidth;
                canvasHeight = parent.backgroundFrame.frameHeight;
            } else {
                canvasWidth = parent.width;
                canvasHeight = parent.height;
            }
        } else if (parent.type === 'Text2') {
            canvasWidth = parent.width;
            canvasHeight = parent.height;
        }
        return {canvasWidth, canvasHeight};
    }

    _getBlurZone(width, height) {
        return Math.max(width, height) * 2;
    }

    reset(parent) {
        if (parent.type === 'Text2') {
            parent.children.filter((c) => c instanceof TextLine)
                .forEach((c) => {
                    c.shadow = null;
                })

        }
    }
}