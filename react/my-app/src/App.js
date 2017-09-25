import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

let HelloAwesomeness = () => {
  return <span>Hello Awesomeness!</span>
}

class App extends Component {
  render() {
    let test = [];
    for (var i=0; i<5; i++) {
      test.push(<HelloAwesomeness />);
      test.push(<br />);
    }
    
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <HelloAwesomeness />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          {test}
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
