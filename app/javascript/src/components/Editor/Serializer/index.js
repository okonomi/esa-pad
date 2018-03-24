import React from 'react'
import { Block } from 'slate'
import Html from 'slate-html-serializer'
import EditorUtils from './../EditorUtils'

const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six',
}

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code',
}

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (!block) return
      return {
        object: 'block',
        type: block,
        nodes: next(el.childNodes),
      }
    },
    serialize(obj, children) {
      if (obj.object != 'block') return
      switch (obj.type) {
        case 'code':
          return (
            <pre>
              <code>{children}</code>
            </pre>
          )
        case 'paragraph':
          return <p>{children}</p>
        case 'quote':
          return <blockquote>{children}</blockquote>
        case 'heading-one':
          return <h1>{children}</h1>
      }
    },
  },
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if (!type) return
      return {
        object: 'mark',
        type: type,
        nodes: next(el.childNodes),
      }
    },
    serialize(obj, children) {
      if (obj.object != 'mark') return
      switch (obj.type) {
        case 'bold':
          return <strong>{children}</strong>
        case 'italic':
          return <em>{children}</em>
        case 'underline':
          return <u>{children}</u>
      }
    },
  },
  {
    // Special case for code blocks, which need to grab the nested childNodes.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != 'pre') return
      const code = el.childNodes[0]
      const childNodes =
        code && code.tagName.toLowerCase() == 'code'
          ? code.childNodes
          : el.childNodes

      return {
        object: 'block',
        type: 'code',
        nodes: next(childNodes),
      }
    },
  },
  {
    // Special case for images, to grab their src.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != 'img') return
      return {
        object: 'block',
        type: 'image',
        isVoid: true,
        nodes: next(el.childNodes),
        data: {
          src: el.getAttribute('src'),
        },
      }
    },
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != 'a') return
      return {
        object: 'inline',
        type: 'link',
        nodes: next(el.childNodes),
        data: {
          href: el.getAttribute('href'),
        },
      }
    },
  },
]

const serializer = new Html({ rules: RULES })

export default class Serializer {
  serialize(value) {
    return this.serializeNode(value.document).replace(/\n+$/, '')
  }

  deserialize(markdown) {
    const html = EditorUtils.convertMarkdownToHtml(markdown)
    return serializer.deserialize(html)
  }

  serializeNode = (node) => {
    if (
      node.object == 'document' ||
      (node.object == 'block' && Block.isBlockList(node.nodes))
    ) {
      let result = node.nodes.map(this.serializeNode).join('\n')
      switch (node.type) {
        case 'bulleted-list':
          result += '\n'
          break
      }
      return result
    } else {
      switch (node.type) {
        case 'heading-one':
          return `# ${node.text}\n`
        case 'heading-two':
          return `## ${node.text}\n`
        case 'heading-three':
          return `### ${node.text}\n`
        case 'heading-four':
          return `#### ${node.text}\n`
        case 'heading-five':
          return `##### ${node.text}\n`
        case 'heading-six':
          return `###### ${node.text}\n`
        case 'paragraph':
          return `${node.text}\n`
        case 'list-item':
          return `- ${node.text}`
        default:
          return `${node.text}`
      }
    }
  }
}