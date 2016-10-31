import React from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { match, navigate } from 'redux-routing'
import { fetchTodos, fetchTodo } from './action'


/**
 * Containers
 */
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
export const ConnectedTodoDetail = connect(state => {
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
export const ConnectedTodoList = connect(state => {  // <- 追加
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
export default connect(state => {
  const { route } = state;
  return { route };
})(App);
