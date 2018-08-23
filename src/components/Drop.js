import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Manager, Reference, Popper } from 'react-popper'

class VirtualReference {
  constructor (props) {
    this.props = props
  }

  getBoundingClientRect() {
    return this.props || {
      top: 10,
      left: 10,
      bottom: 20,
      right: 100,
      width: 90,
      height: 10,
    };
  }

  get clientWidth() {
    return this.getBoundingClientRect().width;
  }

  get clientHeight() {
    return this.getBoundingClientRect().height;
  }
}

class Drop extends Component {
  static defaultProps = {
    placement: 'right'
  }

  // static getDerivedStateFromProps(props, state) {
  //   return {
  //     show: props.show
  //   }
  // }

  state = {
    show: false
  }
  triggerNode = false
  _isMounted = false

  componentDidMount() {
    this._isMounted = true
    window.addEventListener('keydown', this.handleOnKeyDown)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  safeSetState = (newState) => {
    if (this._isMounted) {
      this.setState(newState)
    }
  }

  handleOnKeyDown = (event) => {
    if (event.keyCode === 27) {
      this.safeSetState({
        show: false
      })
    }
  }

  renderChildren = (props) => {
    this.props.children(props)
  }

  getReferenceElement = () => {
    if (!this.triggerNode) return new VirtualReference()

    return new VirtualReference(this.triggerNode.getBoundingClientRect())
  }

  render () {
    return (
      <div>
        <span ref={ref => this.triggerNode = ref}>
          {
            React.cloneElement(this.props.trigger, {
              onClick: () => {
                this.safeSetState({
                  show: !this.state.show
                })
              }
            })
          }
        </span>
        {this.state.show && ReactDOM.createPortal(
        <Popper placement={this.props.placement} referenceElement={this.getReferenceElement()}>
          {({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={style} data-placement={placement}>
              {this.props.children}
            </div>
          )}
        </Popper>, document.body
        )}
      </div>
    )
  }
}

export default Drop
