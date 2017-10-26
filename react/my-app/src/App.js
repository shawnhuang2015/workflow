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
    this.state = { prop: 'bar', prop2: undefined, time: 'initialized time.', count: 2 };

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
    // console.log(value);
    return (
      <div className="UserInfo">
        <div className="UserInfo-name">
          {props.user} + {value.content} + {value.count}
        </div>
      </div>
    );
  }
  help = false;
  componentDidMount() {
    // setTimeout(
    //   () => {
    //     this.tick.call(this);
    //   },
    //   2000
    // );
    this.help = false;

    this.timerID = setInterval(
      () => {
        if (this.help) {
          console.log('Help');
          return;
        } else {
          console.log('tick');
          console.log(process.env);
          this.tick()
        }
      },
      1000
    );
  }

  componentWillUnmount() {
    this.help = true;
    // clearInterval(this.timerID);
  }

  tick() {
    this.setState((pre, props) => {
      if (pre.count === 3) {
        pre.count--;
      }
      return {
        time: new Date().toISOString(),
        count: ++pre.count
      }
    });
  }


  _handleClick() {
    console.log('click', this.refs.test);
    this.value.count++;
    console.log(this.value.count);
    const mountNode = ReactDOM.findDOMNode(this.refs.test);
    // window.mountNode = mountNode;
    console.log(mountNode);
    // var result = ReactDOM.unmountComponentAtNode(document.getElementById('root2'));
    // console.log(result);  // true

    this.setState((pre, props) => {
      console.log(pre, props);
      return {
        time: new Date().toISOString(),
        count: ++pre.count
      }
    });
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


    let clocks = [];
    console.log(this.state.count);
    for (var j = 0; j < this.state.count; j++) {
      clocks.push(
        // <Clock key={j} date={this.value.count}/>
        <Clock key={j} date={this.state.time} />
      )
    }

    return (
      <div className="App" onClick={this._handleClick}>
        {this.state.time}
        {/* <Clock date={this.state.time}/>
        <Clock ref='test' date={this.state.time}/>
        <Clock date={this.state.time}/> */}
        {clocks}
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
  // displayName: 'My Clock';
  constructor(props) {
    super(props);
    this.props = props;
    console.log(this.props);
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
        <h1> Clock : {this.props.date} <img src={logo} className="App-logo" alt="logo" /></h1>
        <h2> It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}

export default App;
