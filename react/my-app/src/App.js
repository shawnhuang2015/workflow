import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import logo from './logo.svg';
import './App.css';

let test = (a) => {
  return '#### ' + a + '####';
}
let HelloAwesomeness = (props) => {
  return <span>Hello Awesomeness {props.name}! {test('example')}  <img src={logo} className="App-logo" alt="logo" /></span>
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { prop: 'bar', prop2: undefined };

    // setTimeout(() => {
    //   this.setState({
    //     prop: 'new value',
    //     prop2: 'new value'
    //   });
    // }, 3000);

    this.value = {
      count: 0,
      content: '***********'
    };

    this._handleClick = this._handleClick.bind(this);
  }

  UserInfo(props) {
    let value = this.value;
    value.count++;
    console.log(value);
    return (
      <div className="UserInfo">
        <div className="UserInfo-name">
          {props.user} + {value.content} + {value.count}
        </div>
      </div>
    );
  }


  _handleClick() {
    console.log('click', this.refs.test);
    let mountNode = ReactDOM.findDOMNode(this.refs.test);
    ReactDOM.unmountComponentAtNode(mountNode);

    this.setState({prop: this.state.prop + '#$%^&*()_'});
  }

  render() {
    let test = [];
    for (var i = 0; i < 5; i++) {
      test.push(<div key={i}>{HelloAwesomeness({ name: '<>&undefined' })}></div>);
      test.push(<br key={i + 'b'} />);
    }

    const element = React.createElement(
      'h1',
      { className: 'greeting' },
      'Hello, world React element!'
    );

    return (
      <div className="App" onClick={this._handleClick}>
        <Clock ref='test'/>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <img src={logo} className="App-logo" alt="logo" />
          <HelloAwesomeness name='React' />
          <img src={logo} className="App-logo" alt="logo" />
          <img src={logo} className="App-logo" alt="logo" />
          {element}
          <h2>Welcome to React {this.state.prop}</h2>
          <h2>Prop2 : {this.state.prop2}</h2>
          {this.UserInfo({ user: this.state.prop })}
        </div>
        <div className="App-intro">
          {test}
          To get started, edit <code>src/App.js</code> and save to reload.
        </div>
      </div>
    );
  }
}

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date()
    }

    console.log('constructor')
  }

  componentWillMount() {
    console.log('componentWillMount')
    
  }

  componentDidMount() {
    console.log('componentDidMount')
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    })
  }

  render() {
    return (
      <div>
        <h1> Clock : </h1>
        <h2> It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}

export default App;
