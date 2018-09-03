import React, { Component } from 'react'
import { DropdownUI, MenuUI, ItemUI, ItemLinkUI } from './Dropdown.css.js'
import Drop from './Drop'
import { items as fixtureItems } from './fixtures'

const GoodDropdown = {
  incrementType: {
    add: 'ADD',
    subtract: 'SUBTRACT',
  },
  movementType: {
    up: 'UP',
    down: 'DOWN',
    left: 'LEFT',
    right: 'RIGHT',
    hover: 'HOVER',
  },
  interactionType: {
    keyDown: 'KEYDOWN',
    mouse: 'MOUSE',
  },
  pathAttribute: 'data-gd-path',
  hoverIndexPreStart: '-1',
  hoverIndexStart: '0'
}

const initialState = {
  hoverItem: GoodDropdown.hoverIndexStart,
  interactionType: null,
  movementType: null,
  show: false,
  subMenus: []
}

class Dropdown extends Component {
  static defaultProps = {
    __debug: false,
    closeOnSelect: true,
    items: fixtureItems,
  }
  hoverTimeoutDuration: 200
  menuNode = null
  _isMounted = false

  state = {
    ...initialState,
    hoverItem: GoodDropdown.hoverIndexStart,
    items: [],
    internalMap: [],
    subMenus: []
  }

  static getDerivedStateFromProps(props, state) {
    if (props.items !== state.items) {
      return {
        ...state,
        items: props.items,
        internalMap: remapItemsToInternalMap(props.items),
      }
    }
    return null
  }

  constructor(props) {
    super(props)
    this.hoverTimeout = null
    this.canMouseEnter = true
  }

  componentDidMount() {
    this._isMounted = true
    window.addEventListener('keydown', this.handleOnKeyDown)
    console.log(this.state)
  }

  componentWillUnmount() {
    this._isMounted = false
    this.clearHoverTimeout()
  }

  setStateWithReducer = action => {
    if (this._isMounted) {
      const __state = {...this.state}
      this.setState(state => {
        console.log(this.stateReducer(state, action))
        return this.stateReducer(state, action)
      }, () => {
        if (this.props.__debug) {
          console.group('GoodDropdown: Debugger')
          console.log('Prev State:', __state)
          console.log('Next State:', this.state)
          console.groupEnd()
        }
      })
    }
  }

  stateReducer = (state = {}, action) => {
    const items = this.state.internalMap
    const path = this.state.hoverItem
    const item = this.getHoverItem(path)
    let nextState

    const getNextKeydownState = (direction: GoodDropdown.movementType.down) => {
      const { hoverItem } = this.getNextHoverState(direction)
      const subMenus = this.getPathList(hoverItem)

      subMenus.pop()

      return {
        hoverItem,
        interactionType: GoodDropdown.interactionType.keyDown,
        movementType: direction,
        subMenus
      }
    }

    switch (action.type) {
      case GoodDropdown.movementType.up:
        return {
          ...getNextKeydownState(GoodDropdown.movementType.up),
        }
      case GoodDropdown.movementType.down:
        if (this.state.hoverItem === GoodDropdown.hoverIndexPreStart) {
          return {
            hoverItem: GoodDropdown.hoverIndexStart,
            interactionType: GoodDropdown.interactionType.keyDown,
            movementType: GoodDropdown.movementType.down
          }
        } else {
          return {
           ...getNextKeydownState(GoodDropdown.movementType.down),
          }
        }
      case GoodDropdown.movementType.left:
        nextState = getNextKeydownState(GoodDropdown.movementType.left)
        let nextSubMenus = nextState.subMenus

        return {
          ...nextState,
          subMenus: nextSubMenus
        }
      case GoodDropdown.movementType.right:
        nextState = getNextKeydownState(GoodDropdown.movementType.right)
        return {
          ...nextState,
          subMenus: this.getPathList(nextState.hoverItem)
        }
      case GoodDropdown.movementType.hover:
        return {
          hoverItem: action.payload.hoverItem,
          interactionType: GoodDropdown.interactionType.mouse,
          movementType: null,
          subMenus: action.payload.subMenus
        }
      default:
        return {
          ...state
        }
    }
  }

  getPathSplit = item => {
    return item.path.split('.')
  }

  getHoverItem = path => {
    return this.state.internalMap.find(item => item.path === path)
  }

  getNextPath = (item, nextIndex) => {
    const path = this.getPathSplit(item)

    let nextPath = [...path]
    nextPath.pop()
    nextPath.push(nextIndex)
    nextPath = toString(nextPath.join('.'))

    return nextPath
  }

  getIncrementPath = (item, operator = GoodDropdown.incrementType.add, amount = 1) => {
    const path = this.getPathSplit(item)
    const index = toNumber(path[path.length - 1])

    switch (operator) {
      case GoodDropdown.incrementType.add:
        return index + amount
      case GoodDropdown.incrementType.subtract:
        return index - amount
      default:
        return index
    }
  }

  getNextItemFromPath = (items, item, path) => {
    const nextItem = items.find(i => i.path === path)

    return nextItem ? nextItem.path : item.path
  }

  getNextDownPath = (items, item) => {
    const nextIndex = this.getIncrementPath(item, GoodDropdown.incrementType.add)
    const nextPath = this.getNextPath(item, nextIndex)

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextUpPath = (items, item) => {
    const nextIndex = this.getIncrementPath(item, GoodDropdown.incrementType.subtract)
    const nextPath = this.getNextPath(item, nextIndex)

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextLeftPath = (items, item) => {
    const path = this.getPathSplit(item)
    path.pop()
    const nextPath = path.join('.')

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextRightPath = (items, item) => {
    const path = this.getPathSplit(item)
    path.push('0')
    const nextPath = path.join('.')

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextHoverState = (direction: GoodDropdown.movementType.down) => {
    const items = this.state.internalMap
    const path = this.state.hoverItem
    const item = this.getHoverItem(path)

    const nextYUp = this.getNextUpPath(items, item)
    const nextYDown = this.getNextDownPath(items, item)
    const nextXLeft = this.getNextLeftPath(items, item)
    const nextXRight = this.getNextRightPath(items, item)

    switch (direction) {
      case 'UP':
      case GoodDropdown.movementType.up:
        return {
          hoverItem: nextYUp,
        }
      case GoodDropdown.movementType.down:
        return {
          hoverItem: nextYDown,
        }
      case GoodDropdown.movementType.left:
        return {
          hoverItem: nextXLeft,
        }
      case GoodDropdown.movementType.right:
        return {
          hoverItem: nextXRight,
        }
      default:
        return {
          hoverItem: path,
        }
    }
  }

  focusHoverItem = event => {
    if (!this.menuNode) return

    const node = this.menuNode.querySelector(
      `[${GoodDropdown.pathAttribute}="${this.state.hoverItem}"]`
    )
    if (node) {
      node.focus()
    }
  }

  hoverItem = event => {
    if (!this.canMouseEnter) {
      return false
    }
    event.stopPropagation()
    const path = event.target.getAttribute(GoodDropdown.pathAttribute)

    this.setStateWithReducer({
      type: GoodDropdown.movementType.hover,
      payload: {
        hoverItem: path,
        subMenus: this.getPathList(path)
      }
    })
  }

  selectItem = event => {
    const path = event.target.getAttribute(GoodDropdown.pathAttribute)

    this.setState({
      activeItem: path,
      hoverItem: path,
    })

    if (this.props.closeOnSelect) {
      this.totalReset()
    }
  }

  toggleDropdown = () => {
    this.setState({
      show: !this.state.show,
    })
  }

  isHoverMatch = (path, pathList = this.getPathList()) => {
    const { hoverItem } = this.state

    const matches = pathList
      .map(p => p === path)
      .filter(match => !!match)

    return !!matches.length
  }

  getPathList = (hoverItem = this.state.hoverItem) => {
    let paths = hoverItem.split('.')
    let matchIndex = 1

    const pathList = paths.map(p => {
      const path = paths.slice(0, matchIndex).join('.')
      matchIndex = matchIndex + 1

      return path
    })

    return pathList
  }

  renderItems = (items = this.state.items) => {
    const { activeItem, hoverItem, interactionType, movementType, subMenus } = this.state

    return items.map(item => {
      const data = this.state.internalMap.find(i => i.ref === item)
      const { id, index, path, title } = data
      const isActive = path === activeItem
      const isHover = this.isHoverMatch(path)
      const isSubMenuHover = this.isHoverMatch(path, subMenus)

      const itemMarkup = (
        <ItemUI
          role="menu-item"
          key={id}
          onClick={this.selectItem}
          onMouseEnter={this.hoverItem}
          isHover={isHover}
          isActive={isActive}
          tabIndex="0"
          aria-haspopup={!!item.items}
          aria-expanded={!!item.items && isHover}
          {...{
            [GoodDropdown.pathAttribute]: path
          }}
        >
          {title}
        </ItemUI>
      )

      return item.items ? (
        <Drop
          key={id}
          show={isSubMenuHover}
          placement='right-start'
          trigger={itemMarkup}
        >
          <MenuUI className="is-subMenu" role="menu" aria-label={item.title}>
            {this.renderItems(item.items, path)}
          </MenuUI>
        </Drop>
      ) : itemMarkup
    })
  }

  handleOnKeyDown = event => {
    if (!this.state.show) return

    switch (event.keyCode) {
      // Up
      case 38:
        event.preventDefault()
        this.setStateWithReducer({
          type: GoodDropdown.movementType.up,
        })
        break
      // Down
      case 40:
        event.preventDefault()
        this.setStateWithReducer({
          type: GoodDropdown.movementType.down,
        })
        break
      // Left
      case 37:
        event.preventDefault()
        this.setStateWithReducer({
          type: GoodDropdown.movementType.left,
        })
        break
      // Right
      case 39:
        event.preventDefault()
        this.setStateWithReducer({
          type: GoodDropdown.movementType.right,
        })
        break
      // Tab
      case 9:
        event.preventDefault()
        if (event.shiftKey) {
          this.setStateWithReducer({
            type: GoodDropdown.movementType.up,
          })
        } else {
          this.setStateWithReducer({
            type: GoodDropdown.movementType.down,
          })
        }
        break

      default:
        break
    }

    this.focusHoverItem()
  }

  blockMouseHover = () => {
    this.canMouseEnter = false
    setTimeout(() => {
      this.canMouseEnter = true
    }, 160)
  }

  clearHoverTimeout = () => {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout)
    }
  }

  setTriggerRef = (ref) => {
    ref(this.buttonNode)
  }

  onTriggerKeydown = (event) => {
    if (this.state.show) return

    switch (event.keyCode) {
      // Down
      case 40:
        event.preventDefault()
        this.setState({
          show: true,
          hoverItem: GoodDropdown.hoverIndexPreStart
        })
        break
      default:
        break
    }
  }

  onMenuHide = () => {
    this.totalReset()
  }

  onMenuShow = () => {
    this.setState({
      show: true
    })
    this.blockMouseHover()
  }

  totalReset = () => {
    this.setState({
      ...initialState
    })
  }

  render() {
    return (
      <DropdownUI>
        <Drop
          placement='bottom-start'
          onHide={this.onMenuHide}
          onShow={this.onMenuShow}
          show={this.state.show}
          trigger={
          <button onKeyDown={this.onTriggerKeydown}>Click</button>
        }>
          <MenuUI
            innerRef={node => (this.menuNode = node)}
            onScroll={this.blockMouseHover}
          >
            {this.renderItems()}
          </MenuUI>
        </Drop>
      </DropdownUI>
    )
  }
}

function remapItemsToInternalMap(items, base, _collection = []) {
  let collection = []

  items.forEach((item, index) => {
    const path = base !== undefined ? `${base}.${index}` : toString(index)

    collection.push(
      new ItemModel({
        ...item,
        ref: item,
        path,
        index,
        hasMenu: !!item.items,
      })
    )

    if (item.items) {
      collection = [
        ...collection,
        ...remapItemsToInternalMap(item.items, path, collection),
      ]
    }
  })

  return collection
}

class ItemModel {
  constructor(props) {
    const { index, items, path, ...rest } = props

    Object.keys(rest).forEach(key => {
      this[key] = rest[key]
    })

    this.index = index
    this.path = path
    this.id = `item-${path.replace(/\./g, '-')}`
  }
}

function toNumber(string) {
  return parseInt(string, 10)
}

function toString(number) {
  return number.toString()
}

export default Dropdown
