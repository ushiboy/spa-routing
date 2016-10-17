# Reduxでルーティング

## 準備

```
$ cd redux-routing-tasting
$ npm install
$ npm start
```

## redux-routing

今回はルーティングライブラリとして[redux-routing](https://github.com/callum/redux-routing)を使う。

redux-routing-tasiting/app.jsを見ながら使い方の基本を確認。

```javascript
import { applyMiddleware, createStore } from 'redux'
import { createMiddleware, Hash, match, navigate, reducer, route } from 'redux-routing'

const routes = [
  route('/', () => console.log('navigated to /')),
  route('/foo', () => console.log('navigated to /foo')),
  route('/foo/:bar', () => console.log('navigated to /foo/:bar'))
]

const middleware = createMiddleware(Hash)

const createStoreWithMiddleware = applyMiddleware(middleware)(createStore)
const store = createStoreWithMiddleware(reducer)

store.subscribe(() => {
  const route = store.getState()
  const matched = match(route.href, routes)

  if (matched) {
    matched.handler()
  } else {
    console.log('404 not found')
  }
})

store.dispatch(navigate('/'))
store.dispatch(navigate('/foo'))
store.dispatch(navigate('/foo/123'))
store.dispatch(navigate('/foo/bar/baz'))
```

## Hashでのルーティング

Hashを利用したルーティングサンプルを書いてみる。
redux-routing-tasiting/app.jsを修正する。

```javascript
import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore, combineReducers, bindActionCreators } from 'redux'
import { Provider, connect } from 'react-redux'
import { createMiddleware, Hash, match, navigate, reducer, route } from 'redux-routing'

function TodoDetail(props) {
  return (
    <div>
      <h1>Item 1</h1>
      <a href="#/">Back</a>
    </div>
  );
}

function TodoList(props) {
  return (
    <div>
      <h1>List</h1>
      <ul>
        <li><a href="#/todos/1">Item 1</a></li>
      </ul>
    </div>
  );
}

function App_(props) {
  const { route, routes } = props;
  const matched = match(route.href, routes);
  if (matched) {
    return <matched.handler {...props} />
  } else {
    return <div>404 not found</div>
  }
}

function mapStateToProps(state) {
  const { route } = state;
  return { route };
}

const App = connect(mapStateToProps)(App_);

const middleware = createMiddleware(Hash);
const createStoreWithMiddleware = applyMiddleware(middleware)(createStore);
const store = createStoreWithMiddleware(combineReducers({
  route: reducer
}));

const routes = [
    route('/', TodoList),
    route('/todos/:id', TodoDetail)
]
store.dispatch(navigate(window.location.hash.slice(1) || '/'));

render(
  <Provider store={store}>
    <App routes={routes} />
  </Provider>,
  document.getElementById('app')
);
```

## History APIでのルーティング

History APIを利用したルーティングで書きなおしてみる。
redux-routing-tasiting/app.jsを修正する。

TodoDetailを表示している時にブラウザをリロードすると４０４になってしまうので、
gulpfile.jsのconnect-history-api-fallback設定を有効にする。

参考: [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)


```javascript
import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore, combineReducers, bindActionCreators } from 'redux'
import { Provider, connect } from 'react-redux'
import { createMiddleware, History, match, navigate, reducer, route } from 'redux-routing'

function TodoDetail(props) {
  return (
    <div>
      <h1>Item 1</h1>
      <a href="/" onClick={e => {
        e.preventDefault();
        props.actions.navigate(e.target.href);
      }}>Back</a>
    </div>
  );
}

function TodoList(props) {
  return (
    <div>
      <h1>List</h1>
      <ul>
        <li><a href="/todos/1" onClick={e => {
          e.preventDefault();
          props.actions.navigate(e.target.href);
        }}>Item 1</a></li>
      </ul>
    </div>
  );
}

function App_(props) {
  const { route, routes } = props;
  const matched = match(route.href, routes);
  if (matched) {
    return <matched.handler {...props} />
  } else {
    return <div>404 not found</div>
  }
}

function mapStateToProps(state) {
  const { route } = state;
  return { route };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      navigate,
    }, dispatch)
  };
}

const App = connect(mapStateToProps, mapDispatchToProps)(App_);

const middleware = createMiddleware(History);
const createStoreWithMiddleware = applyMiddleware(middleware)(createStore);
const store = createStoreWithMiddleware(combineReducers({
  route: reducer
}));

const routes = [
    route('/', TodoList),
    route('/todos/:id', TodoDetail)
]
store.dispatch(navigate(window.location.href));

render(
  <Provider store={store}>
    <App routes={routes} />
  </Provider>,
  document.getElementById('app')
);
```

