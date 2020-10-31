import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom'
import Home from "./page/Home"
import Lottery from "./page/Lottery"
export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Route path="/" component={Home} exact></Route>
        <Route path="/lottery/:settingId" component={Lottery} exact></Route>
      </Router>
    );
  }

}

