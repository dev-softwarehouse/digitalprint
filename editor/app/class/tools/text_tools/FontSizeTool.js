import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

export const typePtk = 0.37

class FontSizeTool extends Component {

    componentDidMount() {
        $(this.input).val(parseInt(this.props.fontSize / typePtk))
            .spinner({
            min: 2,
            spin: (e, ui) => {

                const aspect = this.props.textInstance.userFontSizeLineHeightAspect || this.props.textInstance.defaultFontAspect;

                const size = ui.value * typePtk;

                this.props.textInstance._currentFontSize = size;
                this.props.textInstance.updateSelectedSize(size);

                this.props.textInstance.updateText({

                    lettersPositions: true,
                    linesPosition: true

                });

                this.props.textInstance._useDefaultValues = false;
                this.props.textInstance.setCursor(this.props.textInstance._cursorPosition);

            },

            change: (e) => {
                const value = parseInt(e.target.value)
                this.props.textInstance._currentFontSize = value * typePtk;
                this.props.textInstance.updateSelectedSize(value * typePtk);

                this.props.textInstance.updateText({

                    lettersPositions: true,
                    linesPosition: true

                });

                this.props.textInstance._useDefaultValues = false;

            }

        })
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        $(this.input).val(parseInt(this.props.fontSize / typePtk))
    }
    render() {
        return (
            <input ref={(ref) => {
                this.input = ref
            }}
                   id="font-size"
                   name="font-size"></input>
        )
    }
}

FontSizeTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        fontSize: state.text2Bridge.fontSize
    }
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(FontSizeTool)