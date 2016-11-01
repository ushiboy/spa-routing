
```javascript
const LOAD_ENABLE = 'load@enable';
```

```javascript
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
```

```javascript
function enableLoading(state = false, action) {
  switch (action.type) {
    case LOAD_ENABLE:
      return true;
    default:
      return state;
  }
}
```

```javascript
class TodoDetail extends React.Component {

  componentDidMount() {
    const id = Number(this.props.params.id);
    this.props.actions.fetchTodoIfNeeded(id);
  }
```

```javascript
const ConnectedTodoDetail = connect(state => {
  return {
    actions: bindActionCreators({
      navigate,
      fetchTodoIfNeeded
    }, dispatch)
  };
})(TodoDetail);
```

```javascript
class TodoList extends React.Component {

  componentDidMount() {
    this.props.actions.fetchTodosIfNeeded();
  }

```

```javascript
const ConnectedTodoList = connect(state => {
  return {
    actions: bindActionCreators({
      navigate,
      fetchTodosIfNeeded
    }, dispatch)
  };
})(TodoList);
```

```javascript
const store = createStore(combineReducers({
   route: reducer,
   todos,
   editTodo,
   enableLoading
}), initState, applyMiddleware(thunk, router));
```
