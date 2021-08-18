import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {changeFontFamily} from '../../../actions/textTools'

class FontFamilyTool extends Component {
    state = {fonts: [], expanded: false}

    componentDidMount() {

        this.addNewFont.addEventListener('click', this.addFontClick)
        this.loadFonts()
    }

    loadFonts(){
        this.props.textInstance.editor.webSocketControllers.themePage.getFonts(this.props.textInstance.editor.userProject.getCurrentView().Pages[0].ThemePageFrom, (data) => {
            const fonts = data.fonts.map((f) => ({
                name: f.name,
                FontTypes: {
                    Regular: '',
                    Bold: '',
                    Italic: '',
                    BoldItalic: ''
                },
                miniature: f.miniature
            }))
            this.setState({fonts})
        })
    }

    componentWillUnmount() {
        this.addNewFont.removeEventListener('click', this.addFontClick)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevState.expanded !== this.state.expanded) {

            if (this.state.expanded) {

                this.fontOptions.style.display = "block";
                this.selectArrow.className = "select-arrow active";
                $("#font-options").tinyscrollbar();
            } else {

                this.fontOptions.style.display = "none";
                this.selectArrow.className = "select-arrow";
            }
        }

    }

    addFontClick() {
        this.props.textInstance.editor.fonts.addFontBox()
    }

    render() {
        return (
            <div id="select-box" className="select-box">
                <span id="current-font"
                      onClick={() => {
                          this.setState({expanded: !this.state.expanded})
                      }}
                      style={{fontFamily: this.props.textInstance.editor.fonts.selectFont(this.props.fontFamily, !this.props.bold, this.props.italic)}}>
                    Aa {this.props.fontFamily}
                 </span>
                <div id="select-font"
                     onClick={() => {
                         this.setState({expanded: !this.state.expanded})
                     }}>
                    <span ref={(ref) => this.selectArrow = ref}
                          className="select-arrow"></span>
                </div>

                <div ref={(ref) => this.fontOptions = ref} id="font-options" className="font-options" style={{display: 'none'}}>
                    <div className="scrollbar disable">
                        <div className="track">
                            <div className="thumb">
                                <div className="end"></div>
                            </div>
                        </div>
                    </div>
                    <div className="viewport">
                        <div className="overview">
                            {this.state.fonts.map((font) => {
                                    return (
                                        <div id={font.name}
                                             key={font.name}
                                             className="font-option"
                                             style={{fontFamily: `${font.name}_regular`}}
                                             onClick={e => {
                                                 this.props.changeFontFamily(font.name)
                                                 this.setState({expanded: false})
                                             }}>
                                            <span>A</span>
                                            <div>{font.name}</div>
                                        </div>
                                    )
                                }
                            )}

                        </div>
                    </div>
                    <div ref={(ref) => this.addNewFont = ref} id="addFont">+ dodaj nową czcionkę</div>
                </div>

            </div>
        )
    }
}

FontFamilyTool.propTypes = {}
const mapStateToProps = (state) => {
    return {
        fontFamily: state.text2Bridge.fontFamily,
        bold: state.textToolbar.bold.selected,
        italic: state.textToolbar.italic.selected
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        changeFontFamily: (fontFamily) => {
            dispatch(changeFontFamily(fontFamily))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FontFamilyTool)