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

// to global
window.store = store;
window.navigate = navigate;

//store.dispatch(navigate('/'))
//store.dispatch(navigate('/foo'))
//store.dispatch(navigate('/foo/123'))
//store.dispatch(navigate('/foo/bar/baz'))
