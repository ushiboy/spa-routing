import React from 'react';
import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { Provider } from 'react-redux'
import { createMiddleware, History, navigate, reducer, route } from 'redux-routing'

import ConnectedApp, { ConnectedTodoList, ConnectedTodoDetail } from './container';
import { todos, editTodo } from './reducer';
import isBrowser from 'is-browser';


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

  renderer(
    <Provider store={store}>
      <ConnectedApp routes={routes} />
    </Provider>
  );
}
