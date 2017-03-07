import React         from 'react'
import ReactDOM      from 'react-dom'
import App           from './containers/App'
import {Provider}    from 'react-redux'
import {createStore} from 'redux'
import rootReducer   from './reducers'
import '../sass/app.scss'

let store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store} >
	  <App />
	</Provider>,
  document.getElementById('container')
);
