import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'


class FontColorTool extends Component {
    componentDidMount() {
        $('#textColor').colorpicker({

            parts: 'full',
            showOn: 'both',
            buttonColorize: true,
            showNoneButton: true,
            alpha: true,
            select: (e) => {

                e.stopPropagation();

                let textColor = e.target.value;
                let alpha = textColor.split('(')[1].split(')')[0].split(',');

                textColor = 'rgba(' + alpha[0] + ',' + alpha[1] + ',' + alpha[2] + ',' + (alpha[3] * 255) + ')';

                alpha = textColor.split('(')[1].split(')')[0].split(',');

                this.props.textInstance._currentFontColor = this.props.textInstance.editor.rgb2hex(textColor);
                this.props.textInstance.updateSelectedColor(this.props.textInstance.editor.rgb2hex(textColor));

                //_this._updateToolBox();

            },

            colorFormat: 'RGBA'

        });
    }

    render() {
        return <input id="textColor" className="spinner cp-full"
                      value={this.props.textInstance._currentFontColor}
                      onChange={() => {
                      }}></input>
    }
}

FontColorTool.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(FontColorTool)