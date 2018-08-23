import React, { Component } from 'react'
import { DropdownUI, MenuUI, ItemUI, ItemLinkUI } from './Dropdown.css.js'
import Drop from './Drop'
import { items as fixtureItems } from './fixtures'

class Dropdown extends Component {
  static defaultProps = {
    items: fixtureItems,
  }
  hoverTimeoutDuration: 200
  menuNode = null
  _isMounted = false

  constructor(props) {
    super(props)
    this.state = {
      items: props.items,
      internalMap: remapItemsToInternalMap(props.items),
      hoverItem: '0',
      show: false,
    }
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
      this.setState(state => {
        return this.stateReducer(state, action)
      })
    }
  }

  stateReducer = (state, action) => {
    const items = this.state.internalMap
    const path = this.state.hoverItem
    const item = this.getHoverItem(path)

    switch (action.type) {
      case 'MOVE_UP':
        return {
          ...this.getNextHoverState('UP'),
        }
      case 'MOVE_DOWN':
        return {
          ...this.getNextHoverState('DOWN'),
        }
      case 'MOVE_LEFT':
        return {
          ...this.getNextHoverState('LEFT'),
        }
      case 'MOVE_RIGHT':
        return {
          ...this.getNextHoverState('RIGHT'),
        }
      default:
        return {}
    }
  }

  getHoverItem = path => {
    return this.state.internalMap.find(item => item.path === path)
  }

  getNextPath = (item, nextIndex) => {
    const path = item.path.split('.')

    let nextPath = [...path]
    nextPath.pop()
    nextPath.push(nextIndex)
    nextPath = toString(nextPath.join('.'))

    return nextPath
  }

  getIncrementPath = (item, operator = 'add', amount = 1) => {
    const path = item.path.split('.')
    const index = toNumber(path[path.length - 1])

    switch (operator) {
      case 'add':
        return index + amount
      case 'subtract':
        return index - amount
      default:
        return index
    }
  }

  getNextItemFromPath = (items, item, path) => {
    const nextItem = items.find(i => i.path === nextPath)

    return nextItem ? nextItem.path : item.path
  }

  getNextDownPath = (items, item) => {
    const nextIndex = this.getIncrementPath(item, 'add')
    const nextPath = this.getNextPath(item, nextIndex)

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextUpPath = (items, item) => {
    const nextIndex = this.getIncrementPath(item, 'subtract')
    const nextPath = this.getNextPath(item, nextIndex)

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextLeftPath = (items, item) => {
    const path = item.path.split('.')
    path.pop()
    const nextPath = path.join('.')

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextRightPath = (items, item) => {
    const path = item.path.split('.')
    path.push('0')
    const nextPath = path.join('.')

    return this.getNextItemFromPath(items, item, nextPath)
  }

  getNextHoverState = (direction: 'DOWN') => {
    const items = this.state.internalMap
    const path = this.state.hoverItem
    const item = this.getHoverItem(path)

    const nextYUp = this.getNextUpPath(items, item)
    const nextYDown = this.getNextDownPath(items, item)
    const nextXLeft = this.getNextLeftPath(items, item)
    const nextXRight = this.getNextRightPath(items, item)

    // TODO: FIX LEFT/RIGHT EXPAND LOGIC
    // Need to support multiple nested sub menu opening
    // const nextXRight = this.getNextRightPath(items, item)

    switch (direction) {
      case 'UP':
        return {
          hoverItem: nextYUp,
        }
      case 'DOWN':
        return {
          hoverItem: nextYDown,
        }
      case 'LEFT':
        return {
          hoverItem: nextXLeft,
        }
      case 'RIGHT':
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
      `[data-path="${this.state.hoverItem}"]`
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
    const path = event.target.getAttribute('data-path')

    this.setState({
      hoverItem: path,
    })
  }

  selectItem = event => {
    const path = event.target.getAttribute('data-path')

    this.setState({
      activeItem: path,
      hoverItem: path,
    })
  }

  toggleDropdown = () => {
    this.setState({
      show: !this.state.show,
    })
  }

  renderItems = (items = this.state.items) => {
    const { activeItem, hoverItem } = this.state

    return items.map(item => {
      const data = this.state.internalMap.find(i => i.ref === item)
      const { id, index, path, title } = data
      const isActive = path === activeItem
      const isHover = path === hoverItem

      const itemMarkup = (
        <ItemUI
          key={id}
          data-path={path}
          onClick={this.selectItem}
          onMouseEnter={this.hoverItem}
          isHover={isHover}
          isActive={isActive}
          tabIndex="0"
        >
          {title}
        </ItemUI>
      )

      return item.items ? (
        <Drop key={id} trigger={itemMarkup} placement='right-start'>
          <MenuUI className="is-subMenu">
            {this.renderItems(item.items)}
          </MenuUI>
        </Drop>
      ) : itemMarkup
    })
  }

  handleOnKeyDown = event => {
    switch (event.keyCode) {
      // Up
      case 38:
        event.preventDefault()
        this.setStateWithReducer({
          type: 'MOVE_UP',
        })
        break
      // Down
      case 40:
        event.preventDefault()
        this.setStateWithReducer({
          type: 'MOVE_DOWN',
        })
        break
      // Left
      case 37:
        event.preventDefault()
        this.setStateWithReducer({
          type: 'MOVE_LEFT',
        })
        break
      // Right
      case 39:
        event.preventDefault()
        this.setStateWithReducer({
          type: 'MOVE_RIGHT',
        })
        break
      // Tab
      case 9:
        event.preventDefault()
        if (event.shiftKey) {
          this.setStateWithReducer({
            type: 'MOVE_UP',
          })
        } else {
          this.setStateWithReducer({
            type: 'MOVE_DOWN',
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

  render() {
    return (
      <DropdownUI>
        <Drop
          placement='bottom-start'
          trigger={
          <button>Click</button>
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
        isHover: false,
        isFocus: false,
        isActive: false,
      })
    )

    if (item.items) {
      collection = [
        ...collection,
        ...remapItemsToInternalMap(item.items, index, collection),
      ]
    }
  })

  return collection
}

class ItemModel {
  constructor(props) {
    const { index, items, ...rest } = props

    Object.keys(rest).forEach(key => {
      this[key] = rest[key]
      this.index = index
      this.id = `item-${index}`
    })
  }
}

function toNumber(string) {
  return parseInt(string, 10)
}

function toString(number) {
  return number.toString()
}

export default Dropdown
