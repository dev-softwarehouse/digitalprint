import React, {Component} from 'react'
import {RANGE} from '../../Editor'

export default class RangeSwitchers extends Component {
    state = {range: RANGE.singleElem}

    onClick = (e) => {
        const range = e.currentTarget.getAttribute('data-role')
        this.props.onClick(range)
        this.setState({range: range})
    }

    classNameResolve(range) {
        let name = 'button'
        name += ' ' + range
        if (range === this.state.range) name += ' active'
        return name
    }

    textValue() {
        switch (this.state.range) {
            case RANGE.singleElem:
                return `Dla aktualnego ${this.props.labels[0]}`
            case RANGE.allElemInPage:
                return `Dla wszystkich ${this.props.labels[1]} na stronie`
            case RANGE.allElemInProject:
                return `Dla wszystkich ${this.props.labels[2]} w projekcie`
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className={this.classNameResolve('singleElem')} data-role="singleElem" onClick={this.onClick}><img src="images/1zdjecie-on.svg"/></div>
                <div className={this.classNameResolve('allElemInPage')} data-role="allElemInPage" onClick={this.onClick}><img src="images/1strona-on.svg"/></div>
                <div className={this.classNameResolve('allElemInProject')} data-role="allElemInProject" onClick={this.onClick}><img src="images/strony-on.svg"/></div>
                <div className="buttonsSettingsInfo">{this.textValue()}</div>
            </React.Fragment>
        )
    }
}
RangeSwitchers.defaultProps = {labels: ['tekstu', 'tekstów', 'tekstów']}