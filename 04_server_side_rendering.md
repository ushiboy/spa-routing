# サーバサイドレンダリング

## 環境準備

```
$ cd universal
$ npm install
$ npm start
```

http://localhost:3000 を開いて動作を確認。

## サンプルコードについて

* application.js : サーバサイド＆フロントエンドで動くアプリケーション
* frontend.js : フロントエンド側のエントリポイント
* server.js : APIサーバ兼バックエンドサーバ


### application.js

todo-appと同じ構成のアプリケーションを環境に合わせて使えるようにモジュール化したもの。

初期状態とJSXの描画レンダラを受け取ってアプリケーションを描画する。

is-browserライブラリを利用して、実行環境がブラウザの場合はHistoryベースのルーター、
実行環境がサーバの場合はベースなしのルーターを利用する。


```javascript
export default function application(initState, renderer) {

  const router = createMiddleware(isBrowser ? History : undefined);
  const store = createStore(combineReducers({
    route: reducer,
    todos,
    editTodo
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
```

### frontend.js

ブラウザ側のアプリケーションのエントリポイント。

グローバル変数__INITIAL_STATE__を初期状態として利用し、#app要素に描画する。

```javascript
import { render } from 'react-dom';
import application from './application';

const initialState = window.__INITIAL_STATE__;

application(initialState, view => {
  render(view, document.getElementById('app'));
});
```

### server.js

バックエンドサーバ（必要な部分のみ抜粋）。

"/"や"/todos/:id"でのリクエストをハンドリングし、初期表示のHTMLをレスポンスする。

```javascript
  /**
   * Landing page routing
   */
  app.get('/', (req, res) => {
    const initState = {
      route: {
        href: req.path
      },
      todos: Todo.getAll()
    };
    const view = application(initState, ReactDOM.renderToString);
    res.end(renderHtml(initState, view));
  });
  app.get('/todos/:id', (req, res) => {
    const initState = {
      route: {
        href: req.path
      },
      editTodo: Todo.get(Number(req.params.id))
    };
    const view = application(initState, ReactDOM.renderToString);
    res.end(renderHtml(initState, view));
  });
  app.listen(port);
}

function renderHtml(initState, view) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo</title>
</head>
<body>
  <div id="app">${view}</div>
  <script>
  window.__INITIAL_STATE__ = ${JSON.stringify(initState)};
  </script>
  <script src="/frontend-bundle.js"></script>
</body>
</html>`;
}
```

## 初期表示時のAPIロード対策

サンプルコードではブラウザ初期表示時のデータ取得が無駄に行われる問題がある。

対策として、初回のfetch実行をスキップする手法を適用する。

### アクションタイプを追加

初回よりあとのWEB APIからのデータ取得を可能にするためのアクションタイプLOAD_ENABLEを追加する。

```javascript
const LOAD_ENABLE = 'load@enable';
```

### アクションを追加

ロードを許可するためのアクションenableLoadを定義し、fetchTodosとfetchTodoをそれぞれラップしたアクションを定義する。

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

### リデューサを追加

enableLoadingリデューサを定義する。初期値はfalseにして、LOAD_ENABLEアクションが来たらtrueに状態を変える。

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

StoreにenableLoadingリデューサを追加する。

```javascript
const store = createStore(combineReducers({
   route: reducer,
   todos,
   editTodo,
   enableLoading
}), initState, applyMiddleware(thunk, router));
```

### TodoListコンポーネントの修正

componentDidMountで実行するアクションをfetchTodosIfneeededに変更する。

```javascript
class TodoList extends React.Component {

  componentDidMount() {
    this.props.actions.fetchTodosIfNeeded();
  }

```

mapDispatchToPropsするアクションをfetchTodosIfNeededに変更する。

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

### TodoDetailコンポーネントの修正

componentDidMountで実行するアクションをfetchTodoIfNeededに変更する。

```javascript
class TodoDetail extends React.Component {

  componentDidMount() {
    const id = Number(this.props.params.id);
    this.props.actions.fetchTodoIfNeeded(id);
  }
```

mapDispatchToPropsするアクションをfetchTodoIfNeededに変更する。

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
