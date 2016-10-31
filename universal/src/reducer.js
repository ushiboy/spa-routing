import { TODOS_FETCH, TODO_FETCH } from './actionType';

export function todos(state = [], action) {
  switch (action.type) {
    case TODOS_FETCH:
      return action.payload;
    default:
      return state;
  }
}

export function editTodo(state = {}, action) {
  switch (action.type) {
    case TODO_FETCH:
      return action.payload;
    default:
      return state;
  }
}
