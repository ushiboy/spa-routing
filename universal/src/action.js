import { TODOS_FETCH, TODO_FETCH } from './actionType';

export function fetchTodos() {
  return dispatch => {
    fetch('/api/todos')
    .then(res => res.json())
    .then(json => {
      const { todos } = json;
      dispatch({
        type: TODOS_FETCH,
        payload: todos
      });
    });
  };
}

export function fetchTodo(id) {
  return dispatch => {
    fetch(`/api/todos/${id}`)
    .then(res => res.json())
    .then(json => {
      dispatch({
        type: TODO_FETCH,
        payload: json
      });
    });
  };
}
