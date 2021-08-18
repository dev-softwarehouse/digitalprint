import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

class SizeTool extends Component {
    componentDidMount() {

        $(this.scrollbar).slider({
            value: this.props.proposedPositionInstance.objectInside ? this.props.proposedPositionInstance.objectInside.scaleX : null,
            step: 0.01,
            animate: "slow",
            stop: e => {

                this.props.proposedPositionInstance.editor.webSocketControllers.editorBitmap.setTransform(this.props.proposedPositionInstance.objectInside.x, this.props.proposedPositionInstance.objectInside.y, this.props.proposedPositionInstance.objectInside.rotation, this.props.proposedPositionInstance.objectInside.scaleX, this.props.proposedPositionInstance.objectInside.scaleY, this.props.proposedPositionInstance.objectInside.dbID);

            }

        });

        $(this.scrollbar).on('slide', e => {

            const before = $(this.scrollbar).attr('data-value');
            const after = $(this.scrollbar).slider('value');

            $(this.scrollbar).attr('data-value', $(this.scrollbar).slider('value'));

            const multiply = before < after ? 1.05 : 0.95;

            const currentScale = this.props.proposedPositionInstance.objectInside.scaleX;

            this.props.proposedPositionInstance.objectInside.setScale($(this.scrollbar).slider('value'));

            const insideWidth = this.props.proposedPositionInstance.objectInside.width;
            const width = this.props.proposedPositionInstance.width;

            const insideHeight = this.props.proposedPositionInstance.objectInside.height;
            const height = this.props.proposedPositionInstance.height;

            const newScale = this.props.proposedPositionInstance.objectInside.scaleX;

            this.props.proposedPositionInstance.objectInside.x *= newScale / currentScale;
            this.props.proposedPositionInstance.objectInside.y *= newScale / currentScale;
            this.props.proposedPositionInstance.objectInside.y += this.props.proposedPositionInstance.regY - this.props.proposedPositionInstance.regY * newScale / currentScale;
            this.props.proposedPositionInstance.objectInside.x += this.props.proposedPositionInstance.regX - this.props.proposedPositionInstance.regX * newScale / currentScale;

            if (this.props.proposedPositionInstance.objectInside.rotation % 180 === 0) {

                if (this.props.proposedPositionInstance.objectInside.x > this.props.proposedPositionInstance.objectInside.width / 2) {

                    this.props.proposedPositionInstance.objectInside.x = this.props.proposedPositionInstance.objectInside.width / 2;

                } else if (this.props.proposedPositionInstance.objectInside.x + this.props.proposedPositionInstance.objectInside.width / 2 < this.props.proposedPositionInstance.trueWidth) {

                    this.props.proposedPositionInstance.objectInside.x = this.props.proposedPositionInstance.trueWidth - this.props.proposedPositionInstance.objectInside.width / 2;

                }

                if (this.props.proposedPositionInstance.objectInside.y > this.props.proposedPositionInstance.objectInside.height / 2) {

                    this.props.proposedPositionInstance.objectInside.y = this.props.proposedPositionInstance.objectInside.height / 2;

                } else if (this.props.proposedPositionInstance.objectInside.y + this.props.proposedPositionInstance.objectInside.height / 2 < this.props.proposedPositionInstance.trueHeight) {

                    this.props.proposedPositionInstance.objectInside.y = this.props.proposedPositionInstance.trueHeight - this.props.proposedPositionInstance.objectInside.height / 2;

                }
            }
            else {
                if (this.props.proposedPositionInstance.objectInside.x > this.props.proposedPositionInstance.objectInside.height / 2) {

                    this.props.proposedPositionInstance.objectInside.x = this.props.proposedPositionInstance.objectInside.height / 2;

                } else if (this.props.proposedPositionInstance.objectInside.x + this.props.proposedPositionInstance.objectInside.height / 2 < this.props.proposedPositionInstance.trueWidth) {

                    this.props.proposedPositionInstance.objectInside.x = this.props.proposedPositionInstance.trueWidth - this.props.proposedPositionInstance.objectInside.height / 2;

                }

                if (this.props.proposedPositionInstance.objectInside.y > this.props.proposedPositionInstance.objectInside.width / 2) {

                    this.props.proposedPositionInstance.objectInside.y = this.props.proposedPositionInstance.objectInside.width / 2;

                } else if (this.props.proposedPositionInstance.objectInside.y + this.props.proposedPositionInstance.objectInside.width / 2 < this.props.proposedPositionInstance.trueHeight) {

                    this.props.proposedPositionInstance.objectInside.y = this.props.proposedPositionInstance.trueHeight - this.props.proposedPositionInstance.objectInside.width / 2;

                }
            }

            this.props.proposedPositionInstance.updateMask();
            this.props.proposedPositionInstance.calculateObjectInsideQuality(this.props.proposedPositionInstance.editor.getProductDPI());

            if (this.props.proposedPositionInstance.filterStack.length) {

                this.props.proposedPositionInstance.updateFilters();

            }
            this.props.proposedPositionInstance.redraw()

        });
        this.reconfigureSlider()
    }

    reconfigureSlider() {
        const editingObject = this.props.proposedPositionInstance;

        if (!editingObject.objectInside)
            return;

        let minScale
        if (editingObject.objectInside.rotation % 180 !== 90) {

            minScale = editingObject.width / editingObject.objectInside.trueWidth;

            if (editingObject.height > editingObject.objectInside.trueHeight * minScale) {

                minScale = editingObject.height / editingObject.objectInside.trueHeight;

            }

        } else {

            minScale = editingObject.height / editingObject.objectInside.trueWidth;

            if (editingObject.width > editingObject.objectInside.trueHeight * minScale) {

                minScale = editingObject.width / editingObject.objectInside.trueHeight;

            }

        }

        $(this.scrollbar).slider("option", "min", minScale);

        $(this.scrollbar).slider("option", "max", minScale + 2);
    }

    render() {
        return (
            <div className="scroll-bar proposed" ref={ref => {
                this.scrollbar = ref
            }}>
            </div>
        )
    }
}

SizeTool.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(SizeTool)