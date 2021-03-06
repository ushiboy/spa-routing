import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore, combineReducers, bindActionCreators } from 'redux'
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux'
import { createMiddleware, History, match, navigate, reducer, route } from 'redux-routing'


/**
 * Action Types
 */


/**
 * Actions
 */


/**
 * Reducers
 */


/**
 * Containers
 */
class TodoList extends React.Component {

  render() {
    const todos = [
      { id: 1, title: 'test' }
    ];
    const rows = todos.map(todo => {
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
  }

}

class TodoDetail extends React.Component {

  render() {
    return (
      <div>
        <h1>Item 1</h1>
        <a href="/" onClick={this.handleLinkClick.bind(this)}>Back</a>
      </div>
    );
  }

  handleLinkClick(e) {
    e.preventDefault();
  }

}

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


/**
 * Initialize State
 */
const initState = {
  route: {
    href: window.location.href
  }
};

/**
 * Router Middleware
 */
const router = createMiddleware(History);

/**
 * Store
 */
const store = createStore(combineReducers({
  route: reducer
}), initState, applyMiddleware(thunk, router));


/**
 * Routes
 */
const routes = [
  route('/', TodoList),
  route('/todos/:id', TodoDetail)
];


/**
 * Application start
 */
render(
  <Provider store={store}>
    <ConnectedApp routes={routes} />
  </Provider>,
  document.getElementById('app')
);
