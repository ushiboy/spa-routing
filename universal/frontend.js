import { render } from 'react-dom';
import application from './application';

const initialState = window.__INITIAL_STATE__;

application(initialState, view => {
  render(view, document.getElementById('app'));
});
