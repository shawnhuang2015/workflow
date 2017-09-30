import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('root2'));

function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <App />
      <h2>It is {new Date().toLocaleTimeString() + ' ' + new Date().toDateString()}.</h2>
    </div>
  );
  ReactDOM.render(
    element,
    document.getElementById('root')
  );
}

tick();
registerServiceWorker();
