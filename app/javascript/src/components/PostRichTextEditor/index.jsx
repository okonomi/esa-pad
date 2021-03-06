import React from 'react'
import PropTypes from 'prop-types'
import { Editor } from 'slate-react'
import PluginEditList from 'slate-edit-list'

const plugin = PluginEditList({
  types: ['ordered-list', 'bulleted-list'],
  typeItem: 'list-item',
  typeDefault: 'span',
})
const plugins = [plugin]

class PostRichTextEditor extends React.Component {
  /**
   * Get the block type for a series of auto-markdown shortcut `chars`.
   *
   * @param {String} chars
   * @return {String} block
   */

  getType = chars => {
    switch (chars) {
      case '*':
      case '-':
      case '+':
        return 'list-item'
      case '>':
        return 'block-quote'
      case '#':
        return 'heading-one'
      case '##':
        return 'heading-two'
      case '###':
        return 'heading-three'
      case '####':
        return 'heading-four'
      case '#####':
        return 'heading-five'
      case '######':
        return 'heading-six'
      default:
        return null
    }
  }

  /**
   *
   * Render the example.
   *
   * @return {Component} component
   */

  render() {
    return (
      <div className="markdown-body">
        <Editor
          placeholder="Write some markdown..."
          value={this.props.value}
          onChange={this.props.onChange}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          plugins={plugins}
        />
      </div>
    )
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderNode = props => {
    const { node, attributes, children } = props

    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'ordered-list':
        return <ol {...attributes}>{children}</ol>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'paragraph':
        return <p {...attributes}>{children}</p>
      case 'span':
        return <span {...attributes}>{children}</span>
      default:
        return <p {...attributes}>{children}</p>
    }
  }

  /**
   * On key down, check for our specific key shortcuts.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onKeyDown = (event, change) => {
    console.log('onKeyDown: ' + event.key)
    switch (event.key) {
      case ' ':
        return this.onSpace(event, change)
      case 'Tab':
        return this.onTab(event, change)
      case 'Backspace':
        return this.onBackspace(event, change)
      case 'Enter':
        return this.onEnter(event, change)
    }
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onSpace = (event, change) => {
    const { value } = change
    const { selection } = value
    if (selection.isExpanded) return

    const { startBlock } = value
    const startOffset = selection.start.offset
    const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, '')
    const type = this.getType(chars)

    if (!type) return
    if (type == 'list-item' && startBlock.type == 'list-item') return
    event.preventDefault()

    change.setBlocks(type)

    if (type == 'list-item') {
      change.wrapBlock('bulleted-list')
    }

    change.moveFocusToStartOfNode(startBlock).delete()
    return true
  }

  onTab = (event, change) => {
    console.log('onTab')

    const { value } = change
    const { startBlock } = value
    console.log(startBlock.type)
    if (startBlock.type != 'list-item') {
      return
    }

    change.extendToStartOf(startBlock).wrapBlock('bulleted-list')

    event.preventDefault()
    return true
  }

  /**
   * On backspace, if at the start of a non-paragraph, convert it back into a
   * paragraph node.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onBackspace = (event, change) => {
    const { value } = change
    const { selection } = value
    if (selection.isExpanded) return
    if (selection.start.offset != 0) return

    const { startBlock } = value
    if (startBlock.type == 'paragraph') return

    event.preventDefault()
    change.setBlock('paragraph')

    if (startBlock.type == 'list-item') {
      change.unwrapBlock('bulleted-list')
    }

    return true
  }

  /**
   * On return, if at the end of a node type that should not be extended,
   * create a new paragraph below it.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onEnter = (event, change) => {
    console.log('onEnter')
    const { value } = change
    const { selection } = value
    if (selection.isExpanded) return

    const { startBlock } = value
    const startOffset = selection.start.offset
    const endOffset = selection.start.offset
    if (startOffset == 0 && startBlock.text.length == 0) {
      return this.onBackspace(event, change)
    }
    if (endOffset != startBlock.text.length) {
      return
    }

    if (
      ![
        'heading-one',
        'heading-two',
        'heading-three',
        'heading-four',
        'heading-five',
        'heading-six',
        'block-quote',
        'paragraph',
      ].includes(startBlock.type)
    ) {
      return
    }

    event.preventDefault()
    change.splitBlock().setBlocks('paragraph')
    return true
  }
}

PostRichTextEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default PostRichTextEditor
