# ルーティングとAjax処理

## 環境準備

```
$ cd todo-app
$ npm install
$ npm start
```
todo-app/app.jsを編集していく。

## 初期のソースについて

### 状態初期化とストアへの適用

initStateとして初期状態を定義し、createStoreの引数で渡す。

```javascript
/**
 * Initialize State
 */
const initState = {
  route: {
    href: window.location.href
  }
};

/**
 * Store
 */
const store = createStore(combineReducers({
  route: reducer
}), initState, applyMiddleware(thunk, router));

```

### ルーティングでのパラメータの扱い

match結果のparamsプロパティをhandlerに渡す。

```javascript
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
```

## Todo一覧の実装

GET /api/todos からデータを取得してリスト表示する画面を作る。


### アクションタイプを追加

一覧取得のアクションとしてTODOS_FETCHアクションタイプを定義する。

```javascript
/**
 * Action Types
 */
const TODOS_FETCH = 'todos@fetch';
```

### アクションを追加

GET /api/todosからデータ取得するアクションを作成する。

取得したデータはTODOS_FETCHアクションとしてdispatchする。

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

### リデューサを追加

Todo一覧データをStoreで扱えるようにtodosリデューサを定義する。

TODOS_FETCHアクションが来たら受け取ったpayloadをstateとして返すようにする。

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

todosリデューサをStoreに追加。

```javascript
const store = createStore(combineReducers({
  route: reducer,
  todos
}), initState, applyMiddleware(thunk, router));
```

### TodoListコンポーネントを実装

componentDidMountメソッド（ライフサイクルメソッド）を実装する。
コンポーネントがマウントされたら、fetchTodosアクションを実行してデータを取得するようにする。

renderメソッドのrowsの初期化部分を修正してpropsのtodosを扱うようにする。

handleLinkClickメソッドを実装し、クリックされたリンクのhrefでnavigateアクションを実行するようにする。


```javascript
class TodoList extends React.Component {

  componentDidMount() {
    this.props.actions.fetchTodos();
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
```

TodoListをconnectしてConnectedTodoListコンテナにする。

mapStateToPropsとして、todosをstateから取り出してpropsとして渡すようにする。

mapDispatchToPropsとして、navigateとfetchTodosを渡すようにする。

```javascript
const ConnectedTodoList = connect(state => {
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

"/"のルーティング対象をConnectedTodoListにする。

```javascript
/**
 * Routes
 */
const routes = [
  route('/', ConnectedTodoList),
  route('/todos/:id', TodoDetail)
];
```

ここまでで、一覧に項目が表示され、クリックして詳細に遷移することを確認する。


## Todo詳細の実装

GET /api/todos/:id からデータを取得して表示する画面を作る。

### アクションタイプを追加

単体取得のアクションとしてTODO_FETCHアクションタイプを定義する。

```javascript
const TODO_FETCH = 'todo@fetch';
```

### アクションを追加

GET /api/todos/:idからデータ取得するアクションを作成する。

取得したデータはTODO_FETCHアクションとしてdispatchする。

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

### リデューサを追加

Todo単体データをStoreで扱えるようにeditTodoリデューサを定義する。

TODO_FETCHアクションが来たら、受け取ったpayloadをstateとして返すようにする。

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

editTodoリデューサをStoreに追加。

```javascript
const store = createStore(combineReducers({
  route: reducer,
  todos,
  editTodo
}), initState, applyMiddleware(thunk, router));
```

### TodoDetailコンポーネントを実装

componentDidMountメソッドを実装する。コンポーネントがマウントされたら、fetchTodoアクションを実行してデータを取得するようにする。

renderメソッドを実装し、propsのeditTodoから受け取ったtitleを表示するようにする。

handleLinkClickメソッドを実装し、Backリンクをクリックしたら"/"に戻すようにする。

```javascript
class TodoDetail extends React.Component {

  componentDidMount() {
    const id = Number(this.props.params.id);
    this.props.actions.fetchTodo(id);
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
```

TodoDetailをconnectしてConnectedTodoDetailコンテナにする。

mapStateToPropsとして、editTodoをstateから取り出してpropsとして渡すようにする。

mapDispatchToPropsとして、navigateとfetchTodoを渡すようにする。

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

### ルーティングの修正

"/todos/:id"のルーティング対象をConnectedTodoDetailにする。

```javascript
const routes = [
  route('/', ConnectedTodoList),
  route('/todos/:id', ConnectedTodoDetail)
];
```

取得したデータが描画されることを確認する。
