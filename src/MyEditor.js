import React from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';
import {stateToMarkdown} from 'draft-js-export-markdown';
import {stateFromMarkdown} from 'draft-js-import-markdown';
import {Button, ButtonToolbar, ButtonGroup, FormControl} from 'react-bootstrap';
import './MyEditor.css';
import 'draft-js/dist/Draft.css';
import Post from './Post';
import EsaApi from './EsaApi';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);

    this.esa_api = new EsaApi();
    this.esa_api.token = 'a768efa2acb0757e4621b2902bf4364afa959d77185b7d8fbb1e46a8b66c8ef8';
    this.esa_api.team = 'okonomi';

    this.state = {
      editorState: EditorState.createEmpty(),
      post: new Post(),
      mode: 'create',
    };
    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }
  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }
  render() {
    return (
      <div className='MyEditor'>
        <ButtonToolbar>
          <Button onMouseDown={this._onBoldClick.bind(this)}>Bold</Button>
          <Button onMouseDown={(e) => {
            this.onChange(
              RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item')
            );
            e.preventDefault();
          }}>List</Button>
          <ButtonGroup>
            <Button onMouseDown={(e) => {
              e.shiftKey = true;
              this.onChange(
                RichUtils.onTab(
                  e,
                  this.state.editorState,
                  3
                )
              );
              e.preventDefault();
            }}>&lt;</Button>
            <Button onMouseDown={(e) => {
              this.onChange(
                RichUtils.onTab(
                  e,
                  this.state.editorState,
                  3
                )
              );
              e.preventDefault();
            }}>&gt;</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button onMouseDown={(e) => {
              this.setState({mode: 'create'});

              this.setState({post: new Post()});
              this.onChange(EditorState.createEmpty())
            }}>New</Button>
            <Button onMouseDown={(e) => {
              this.esa_api.getPost(344)
                .then((response) => {
                  console.log(response);

                  this.setState({mode: 'edit'});

                  let post = this.state.post;
                  post.number = response.data.number;
                  post.name = response.data.name;
                  post.body_md = response.data.body_md;
                  this.setState({post: post});
                  this.onChange(
                    EditorState.createWithContent(stateFromMarkdown(
                      this.state.post.body_md
                    ))
                  )
                })
                .catch((error) => {
                  console.log(error);
                });
            }}>Load</Button>
            <Button onMouseDown={(e) => {
              var post = this.state.post;
              post.body_md = stateToMarkdown(this.state.editorState.getCurrentContent());

              this.setState({post: post});

              if (this.state.mode === 'create') {
                this.esa_api.createPost({
                  post: {
                    name: this.state.post.name,
                    body_md: this.state.post.body_md,
                  }
                })
                  .then((response) => {
                    console.log(response);

                    let post = this.state.post;
                    post.number = response.data.number;

                    this.setState({
                      mode: 'edit',
                      post: post,
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }
              if (this.state.mode === 'edit') {
                this.esa_api.updatePost(this.state.post.number, {
                  post: post
                })
                  .then((response) => {
                    console.log(response);

                    // this.props.onLoad(response);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }

              e.preventDefault();
            }}>Save</Button>
          </ButtonGroup>
        </ButtonToolbar>
        <div>
          <FormControl
            type="text"
            value={this.state.post.name}
            placeholder="記事名"
            onChange={(e) => {
              let post = this.state.post;
              post.name = e.target.value;
              this.setState({post: post});
            }}
          />
        </div>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
          onTab={(e) => {
            this.onChange(
              RichUtils.onTab(
                e,
                this.state.editorState,
                3
              )
            );
          }}
        />
      </div>
    );
  }
}

export default MyEditor;
