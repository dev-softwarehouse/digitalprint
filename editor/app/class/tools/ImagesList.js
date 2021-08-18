import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import PerfectScrollbar from 'perfect-scrollbar'
import {ItemRenderer} from "./proposedPostionTools/EffectsTool";

class ImagesList extends Component {

    componentDidMount() {

        const step = 50

        const animate = (to) => {
            if (to < 0)
                to = 0
            /*const fi=$(this.framesInner).width()
            const fc=$(this.framesContainer).width()
            const windowW = fi - fc
            if (to > windowW)
                to = windowW*/
            $(this.framesContainer).stop().animate({
                scrollLeft: to
            })
        }
        $(this.sliderSection).width($(this.sliderSection).parent().width())
        this.framesContainerLeftArrow.addEventListener('click', e => {
            animate(this.framesContainer.scrollLeft - step)
        })

        this.framesContainerRightArrow.addEventListener('click', e => {
            animate(this.framesContainer.scrollLeft + step)
        })

        this.framesContainer.addEventListener('wheel', (e) => {
            e.preventDefault()
            e.stopPropagation()
            animate(this.framesContainer.scrollLeft + ((e.deltaY > 0 ? 1 : -1) * step * 3))
        })

        // this.ps=new PerfectScrollbar(this.framesContainer, {useBothWheelAxes: true,suppressScrollY:true,scrollXMarginOffset:40})
    }

    componentWillUnmount() {
        /*this.ps.destroy()
        this.ps=null*/
    }

    onItemSelect = (e) => {
        this.props.onItemSelect(e.currentTarget.getAttribute('data-id'))
    }

    render() {
        return (
            <div className="toolBoxExtendSection" ref={ref => {
                this.sliderSection = ref
            }}>
                <div style={{position: 'relative'}}>
                    <div className="leftArrow-cont" ref={ref => {
                        this.framesContainerLeftArrow = ref
                    }}></div>
                    <div className="rightArrow-cont" ref={ref => {
                        this.framesContainerRightArrow = ref
                    }}></div>
                    <div className="scrollableListContainer" ref={ref =>
                        this.framesContainer = ref
                    }>
                        <div ref={ref => this.framesInner = ref}>
                            {this.props.list.map(item => {
                                if (this.props.itemRenderer) {
                                    const RenderComponent = ItemRenderer
                                    return (
                                        <div key={item}
                                             className={'listItem' + (`${item}` === `${this.props.selected}` ? ' active-framed' : '')}
                                             data-id={item}
                                             onClick={this.onItemSelect}>
                                            <RenderComponent type={item} proposedPositionInstance={this.props.proposedPositionInstance}/>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className={'listItem' + (`${item._id}` === `${this.props.selected}` ? ' '+this.props.activeClassName : '')}
                                             data-id={item._id}
                                             key={item._id}
                                             onClick={this.onItemSelect}>
                                            <img className='listItem' src={item.thumbnail}/>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ImagesList.propTypes = {}
const mapStateToProps = (state) => {
    return {}
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
ImagesList.defaultProps={activeClassName:'active'}
export default connect(mapStateToProps, mapDispatchToProps)(ImagesList)