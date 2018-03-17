import Actions from '../actions'
import axios from 'axios'

const fetchPost = (postId) => {
  console.log('logging')
  console.log(postId)

  return (dispatch, getState) => {
    axios.get(`/posts/${postId}.json`)
      .then((response) => {
        dispatch({
          type: 'LOAD_POST',
          post: {
            title: response.data.name,
            body: response.data.body_md,
          }
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

export default {
  loadPost: fetchPost,
  savePost: (postId, markdown) => {
    return {
      type: Actions.SAVE_POST,
      postId,
      markdown
    }
  }
}
