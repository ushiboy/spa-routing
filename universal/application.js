import React from 'react';
import { applyMiddleware, createStore, combineReducers, bindActionCreators } from 'redux'
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux'
import { createMiddleware, History, navigate, reducer, route, match } from 'redux-routing'
import isBrowser from 'is-browser';

/**
 * Action Types
 */
const TODOS_FETCH = 'todos@fetch';
const TODO_FETCH = 'todo@fetch';
const LOAD_ENABLE = 'load@enable';

/**
 * Actions
 */
function fetchTodos() {
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

function fetchTodo(id) {
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

function enableLoad() {
  return {
    type: LOAD_ENABLE
  };
}

function fetchTodosIfNeeded() {
  return (dispatch, getState) => {
    if (getState().enableLoading) {
      fetchTodos()(dispatch);
    } else {
      dispatch(enableLoad());
    }
  };
}

function fetchTodoIfNeeded(id) {
  return (dispatch, getState) => {
    if (getState().enableLoading) {
      fetchTodo(id)(dispatch);
    } else {
      dispatch(enableLoad());
    }
  };
}

/**
 * Reducers
 */
function todos(state = [], action) {
  switch (action.type) {
    case TODOS_FETCH:
      return action.payload;
    default:
      return state;
  }
}

function editTodo(state = {}, action) {
  switch (action.type) {
    case TODO_FETCH:
      return action.payload;
    default:
      return state;
  }
}

function enableLoading(state = false, action) {
  switch (action.type) {
    case LOAD_ENABLE:
      return true;
    default:
      return state;
  }
}

/**
 * Containers
 */
class TodoDetail extends React.Component {

  componentDidMount() {
    const id = Number(this.props.params.id);
    this.props.actions.fetchTodoIfNeeded(id);
  }

  render() {
    const { title } = this.props.editTodo;
    return (
      <div>
        <h1>{title}</h1>
        <a href="/" onClick={this.handleLinkClick.bind(this)}>Back</a>
      </div>
    );
  }

  handleLinkClick(e) {
    e.preventDefault();
    this.props.actions.navigate(e.target.href);
  }

}
const ConnectedTodoDetail = connect(state => {
  const { editTodo } = state;
  return { editTodo };
}, dispatch => {
  return {
    actions: bindActionCreators({
      navigate,
      fetchTodoIfNeeded
    }, dispatch)
  };
})(TodoDetail);

class TodoList extends React.Component {

  componentDidMount() {
    this.props.actions.fetchTodosIfNeeded();
  }

  render() {
    const rows = this.props.todos.map(todo => {
      const { id, title } = todo;
      return (
        <li key={id}>
          <a href={`/todos/${id}`} onClick={this.handleLinkClick.bind(this)}>{title}</a>
        </li>
      );
    });

    return (
      <div>
        <h1>List</h1>
        <ul>
          {rows}
        </ul>
      </div>
    );
  }

  handleLinkClick(e) {
    e.preventDefault();
    this.props.actions.navigate(e.target.href);
  }

}
const ConnectedTodoList = connect(state => {
  const { todos } = state;
  return { todos };
}, dispatch => {
  return {
    actions: bindActionCreators({
      navigate,
      fetchTodosIfNeeded
    }, dispatch)
  };
})(TodoList);

function App(props) {
  const { route, routes } = props;
  const matched = match(route.href, routes);
  if (matched) {
    const { params } = matched;
    return <matched.handler params={params} />
  } else {
    return <div>404 not found</div>
  }
}
const ConnectedApp = connect(state => {
  const { route } = state;
  return { route };
})(App);

export default function application(initState, renderer) {

  const router = createMiddleware(isBrowser ? History : undefined);
  const store = createStore(combineReducers({
    route: reducer,
    todos,
    editTodo,
    enableLoading
  }), initState, applyMiddleware(thunk, router));

  const routes = [
    route('/', ConnectedTodoList),
    route('/todos/:id', ConnectedTodoDetail)
  ];

  return renderer(
    <Provider store={store}>
      <ConnectedApp routes={routes} />
    </Provider>
  );
}
