# ルーティングとAjax処理

## 環境準備

```
$ cd todo-app
$ npm install
$ npm start
```
todo-app/app.jsを編集していく。


## Todo一覧の実装

### アクションタイプを追加

```javascript
/**
 * Action Type
 */
const TODOS_FETCH = 'todos@fetch';
```

### アクションを追加
```javascript
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
```

### リデューサーを追加

```javascript
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
```

ストアに追加。

```javascript
const store = createStoreWithMiddleware(combineReducers({
  route: reducer,
  todos     // <- 追加
}));
```

### TodoListを修正

```javascript
class TodoList extends React.Component {

  componentWillMount() {  // <- 追加
    this.props.actions.fetchTodos();
  }

  render() {
    const rows = this.props.todos.map(todo => {   // <- 修正
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
    this.props.actions.navigate(e.target.href); // <- 追加
  }

}
```

### connectする

```javascript
const ConnectedTodoList = connect(state => {  // <- 追加
  const { todos } = state;
  return { todos };
}, dispatch => {
  return {
    actions: bindActionCreators({
      navigate,
      fetchTodos
    }, dispatch)
  };
})(TodoList);
```

### ルーティングの修正

```javascript
const routes = [
  route('/', ConnectedTodoList),    // <- 修正
  route('/todos/:id', TodoDetail)
];
```

一覧に項目が表示され、クリックして詳細に行けることを確認する。


## Todo詳細の実装

### アクションタイプの追加

```javascript
const TODO_FETCH = 'todo@fetch';
```

### アクションの追加

```javascript
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
```

### リデューサーの追加

```javascript
function editTodo(state = {}, action) {
  switch (action.type) {
    case TODO_FETCH:
      return action.payload;
    default:
      return state;
  }
}
```

ストアに追加

```javascript
const store = createStoreWithMiddleware(combineReducers({
  route: reducer,
  todos,
  editTodo  // <- 追加
}));
```

### TodoDetailの修正

```javascript
class TodoDetail extends React.Component {

  componentWillMount() {  // <- 追加
    const id = Number(this.props.params.id);
    this.props.actions.fetchTodo(id);
  }

  render() {
    const { title } = this.props.editTodo;  // <- 修正
    return (
      <div>
        <h1>{title}</h1>
        <a href="/" onClick={this.handleLinkClick.bind(this)}>Back</a>
      </div>
    );
  }

  handleLinkClick(e) {
    e.preventDefault();
    this.props.actions.navigate(e.target.href); //　<- 修正
  }

}
```

### connectする

```javascript
const ConnectedTodoDetail = connect(state => {
  const { editTodo } = state;
  return { editTodo };
}, dispatch => {
  return {
    actions: bindActionCreators({
      navigate,
      fetchTodo
    }, dispatch)
  };
})(TodoDetail);
```

### ルーティングを修正

```javascript
const routes = [
  route('/', ConnectedTodoList),
  route('/todos/:id', ConnectedTodoDetail)  // <- 修正
];
```

取得したデータが描画されることを確認する。


## お題: 削除機能の実装

次のアクションを利用して詳細画面に削除機能をつけてみる。

```javascript
function removeTodo(id) {
  return dispatch => {
    fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      dispatch(navigate('/'));
    });
  };
}
```