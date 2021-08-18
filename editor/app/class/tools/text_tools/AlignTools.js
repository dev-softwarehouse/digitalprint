import React, {Component} from 'react'
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {startCase} from 'lodash';
import {changeLineHeight} from '../../../actions/textTools'
import {typePtk} from "./FontSizeTool";
import {RANGE} from '../../../Editor'
import RangeSwitchers from '../RangeSwitchers'

class AlignTools extends Component {

    state = {range: RANGE.singleElem}

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.range === RANGE.singleElem && (this.state.range === RANGE.allElemInPage || this.state.range === RANGE.allElemInProject)) {
            this.changeAlign(this.props.textInstance._align, 'horizontal')
            this.changeAlign(this.props.textInstance.verticalAlign, 'vertical')
            this.props.changeLineHeight(this.props.textInstance.lineHeight, this.state.range)
        }
        if (!prevProps.selected && this.props.selected) {
            $(this.lineHeightInput).spinner({

                start: (e) => {
                    e.stopPropagation()
                },

                spin: (e, ui) => {

                    const value = parseInt(ui.value);

                    this.props.textInstance.getSelectedLines().forEach((line) => {
                        line.setLineHeight(value * typePtk)
                        line.userFontSizeLineHeightAspect = (value * typePtk) / line.getBiggestLetters()[0].size
                    })

                    this.props.textInstance.defaultLineHeight = false;

                    this.props.textInstance.updateText({
                        linesPosition: true,
                        lettersPositions: true
                    });

                    this.props.textInstance._updateShape();

                    this.props.textInstance.setCursor(this.props.textInstance._cursorPosition);

                },
                change: (e) => {

                    const value = parseInt(e.target.value);

                    this.props.textInstance.getSelectedLines().forEach((line) => {
                        line.setLineHeight(value * typePtk)
                    })

                    this.props.textInstance.updateText({

                        linesPosition: true,
                        lettersPositions: true

                    });

                    this.props.textInstance._updateShape();
                }
            })
        }
        $(this.lineHeightInput).val(parseInt(this.props.lineHeight / typePtk))
    }

    onAlignVertClick = (e) => {
        this.onAlignClick(e, 'vertical')
    }

    onAlignClick = (e, direction = 'horizontal') => {
        e.stopPropagation();
        const align = e.target.className.replace('buttonBig align', '').toLowerCase()
        this.changeAlign(align, direction)
    }

    changeAlign(align, direction) {
        if (direction === 'horizontal') {
            this.props.textInstance.editor.getEditableObjectsByType(this.state.range, 'Text2')
                .forEach(t => {
                    try {//TODO Powinna zostać poprawione przez uporządkowanie/filtrowanie kolekcji
                        t.setAlign(align);
                        t._updateShape();
                        this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                            t.dbID,
                            {_align: align}
                        );
                        t.updateText({
                            lettersPositions: true,
                            linesPosition: true,
                        });
                        if (t.dbID === this.props.textInstance.dbID)
                            t.setCursor(t._cursorPosition);
                    } catch (e) {
                        console.error(e)
                    }
                });
        }
        else if (direction === 'vertical') {
            this.props.textInstance.editor.getEditableObjectsByType(this.state.range, 'Text2')
                .forEach(t => {
                    try {//TODO
                        t.setVerticalAlign(align);
                        t._updateShape();
                        this.props.textInstance.editor.webSocketControllers.proposedText.setAttributes(
                            t.dbID,
                            {verticalAlign: align}
                        );
                        t.updateText({
                            lettersPositions: true,
                            linesPosition: true,
                        });
                        if (t.dbID === this.props.textInstance.dbID)
                            t.setCursor(t._cursorPosition);
                    } catch (e) {
                        console.error(e)
                    }
                });
        }
    }

    className(direction, type) {
        let name = 'buttonBig'
        name += ` align${startCase(type)}`
        if ((direction === 'horizontal' ? this.props.horizontalAlign : this.props.verticalAlign) === type)
            name += ' active'
        return name
    }

    render() {
        return (
            !this.props.selected ? null :
                <div className="toolBoxExtend">
                    <div className="toolBoxExtendSection">
                        <div className="title">Wyrównanie:</div>
                        <RangeSwitchers onClick={(range) => {
                            this.setState({range})
                        }}/>
                    </div>
                    <div className="toolBoxExtendSection">
                        <div className={this.className('horizontal', 'left')} onClick={this.onAlignClick}></div>
                        <div className={this.className('horizontal', 'center')} onClick={this.onAlignClick}></div>
                        <div className={this.className('horizontal', 'right')} onClick={this.onAlignClick}></div>
                        <div className={this.className('horizontal', 'justify')} onClick={this.onAlignClick}></div>
                        <div className="hor-settings">
                            <div className={this.className('vertical', 'top')} onClick={this.onAlignVertClick}></div>
                            <div className={this.className('vertical', 'middle')} onClick={this.onAlignVertClick}></div>
                            <div className={this.className('vertical', 'bottom')} onClick={this.onAlignVertClick}></div>
                            <label className='lineHeight-label icon'><input id='lineHeight' ref={ref => {
                                this.lineHeightInput = ref
                            }}></input></label>
                        </div>
                    </div>
                </div>
        )
    }
}

AlignTools.propTypes = {};

const mapStateToProps = state => ({
    selected: state.textToolbar.align.selected,
    horizontalAlign: state.text2Bridge.horizontalAlign,
    verticalAlign: state.text2Bridge.verticalAlign,
    lineHeight: state.text2Bridge.lineHeight
});

const mapDispatchToProps = dispatch => {
    return {
        changeHorAlign: (align, range) => {
            dispatch(changeHorizontalAlign(align, range))
        },
        changeVertAlign: (align, range) => {
            dispatch(changeVerticalAlign(align, range))
        },
        changeLineHeight: (height, range) => {
            dispatch(changeLineHeight(height, range))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignTools);