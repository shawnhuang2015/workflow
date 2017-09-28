import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

let HelloAwesomeness = () => {
  return <span>Hello Awesomeness!</span>
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { prop: "bar" };
  }

  render() {
    let test = [];
    for (var i = 0; i < 5; i++) {
      test.push(<div><HelloAwesomeness /></div>);
      test.push(<br />);
    }

    setTimeout(() => {
      this.setState({
        prop: 'new value',
        prop2: 'new value'
      });
    }, 2000);

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <HelloAwesomeness />
          <h2>Welcome to React {this.state.prop}</h2>
          <h2>Prop2 : {this.state.prop2}</h2>
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
