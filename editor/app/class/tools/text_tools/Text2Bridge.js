import React, {Component} from 'react'
import {connect} from 'react-redux'
import {changeLineHeight, changeFontSize, changeFontFamily, changeHorizontalAlign, changeVerticalAlign} from "../../../actions/textTools";
import {selectBold, selectItalic} from "../../../actions/textToolbar";
import {watch} from 'melanke-watchjs'

class Text2Bridge extends Component {
    constructor(props) {
        super(props)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.textInstance === null && this.props.textInstance != null) {
            this.props.changeFontFamily(this.props.textInstance._currentFontFamily)
            this.props.changeFontSize(this.props.textInstance._currentFontSize)
            this.props.changeLineHeight(this.props.textInstance.lineHeight)
            this.props.changeHorAlign(this.props.textInstance._align)
            this.props.changeVertAlign(this.props.textInstance.verticalAlign)
            watch(this.props.textInstance.selection, this.watchSelection, 0, true)
            watch(this.props.textInstance, ['_align', 'verticalAlign'], this.watchAlign)
        }
        else if (prevProps.fontFamily !== this.props.fontFamily) {
            this.props.textInstance.editor.fonts.addFontFile(this.props.fontFamily, (data) => {
                this.props.textInstance._currentFontFamily = this.props.fontFamily;
                this.props.textInstance._currentFont = this.props.textInstance.editor.fonts.selectFont(this.props.fontFamily, this.props.textInstance._currentFontType.regular, this.props.textInstance._currentFontType.italic)
                this.props.textInstance.updateText({
                    letters: {
                        font: true
                    },
                    lettersPositions: true
                }, false)
                this.props.textInstance.setCursor(this.props.textInstance._cursorPosition)
            })
        } else if (prevProps.bold !== this.props.bold) {
            this.props.textInstance._currentFontType.regular = this.props.bold ? 0 : 1;
            this.props.textInstance.updateSelectedFont();
        } else if (prevProps.italic !== this.props.italic) {
            this.props.textInstance._currentFontType.italic = this.props.italic ? 1 : 0;
            this.props.textInstance.updateSelectedFont();
        }
    }

    watchAlign = (prop, action, newValue, oldValue) => {
        if (prop === '_align')
            this.props.changeHorAlign(newValue)
        else if (prop === 'verticalAlign')
            this.props.changeVertAlign(newValue)
    }

    watchSelection = (prop, action, newValue, oldValue) => {
        const selectionLength = this.props.textInstance.getSelectedLetters().length;
        let lineHeight = this.props.lineHeight, fontFamily = this.props.textInstance._currentFontFamily, fontSize = selectionLength > 0 ? 0 : this.props.textInstance._currentFontSize, allBold = this.props.bold, allItalic = this.props.italic
        this.props.textInstance.getSelectedLetters().forEach(l => {
            if (l.fontFamily !== fontFamily)
                fontFamily = ''
            allBold = allBold && !l.fontType.regular
            allItalic = allItalic && l.fontType.italic
            fontSize += l.size
            lineHeight = l.parent.lineHeight
        })

        if (fontFamily !== this.props.fontFamily)
            this.props.changeFontFamily(fontFamily)

        if (selectionLength > 0)
            fontSize /= selectionLength
        if (fontSize !== this.props.fontSize)
            this.props.changeFontSize(fontSize)

        if (allBold !== this.props.bold)
            this.props.changeBold(allBold)

        if (allItalic !== this.props.italic)
            this.props.changeItalic(allItalic)

        if (lineHeight !== this.props.lineHeight)
            this.props.changeLineHeight(lineHeight)

    }

    render() {
        return null
    }
}

Text2Bridge.propTypes = {}
const mapStateToProps = (state) => {
    return {
        range: state.text2Bridge.range,
        horizontalAlign: state.text2Bridge.horizontalAlign,
        verticalAlign: state.text2Bridge.verticalAlign,
        textInstance: state.text2Bridge.textInstance,
        fontSize: state.text2Bridge.fontSize,
        fontFamily: state.text2Bridge.fontFamily,
        bold: state.textToolbar.bold.selected,
        italic: state.textToolbar.italic.selected,
        lineHeight: state.text2Bridge.lineHeight
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        changeFontSize: (fontSize) => {
            dispatch(changeFontSize(fontSize))
        },
        changeHorAlign: (align) => {
            dispatch(changeHorizontalAlign(align))
        },
        changeVertAlign: (align) => {
            dispatch(changeVerticalAlign(align))
        },
        changeFontFamily: (fontFamily) => {
            dispatch(changeFontFamily(fontFamily))
        },
        changeBold: selected => {
            dispatch(selectBold(selected))
        },
        changeItalic: selected => {
            dispatch(selectItalic(selected))
        },
        changeLineHeight: height => {
            dispatch(changeLineHeight(height))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Text2Bridge)